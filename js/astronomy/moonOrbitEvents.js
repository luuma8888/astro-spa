import { dateFromJulianDay, julianCenturiesSinceJ2000 } from '../core/time.js';
import { computeMoonFromJd } from './moon.js';
import { computeMoonPhaseEventsAround } from './moonPhaseEvents.js';
import { trueLunarNode } from './nodes.js';
import { normalize180 } from '../core/angles.js';

const SEARCH_STEP_DAYS = 0.25;
const SEARCH_WINDOW_DAYS = 40;
const REFINE_ITERATIONS = 36;
const ECLIPSE_LOOKAHEAD_CYCLES = 12;

function refineMinimum(lowerJd, upperJd, metricFn) {
  let low = lowerJd;
  let high = upperJd;

  for (let i = 0; i < REFINE_ITERATIONS; i += 1) {
    const leftThird = low + (high - low) / 3;
    const rightThird = high - (high - low) / 3;
    const leftValue = metricFn(leftThird);
    const rightValue = metricFn(rightThird);

    if (leftValue <= rightValue) {
      high = rightThird;
    } else {
      low = leftThird;
    }
  }

  return (low + high) / 2;
}

function refineMaximum(lowerJd, upperJd, metricFn) {
  return refineMinimum(lowerJd, upperJd, (jd) => -metricFn(jd));
}

function findNextLatitudeNode(jd) {
  let previousJd = jd;
  let previousLat = computeMoonFromJd(previousJd).latitudeDeg;
  const steps = Math.ceil(SEARCH_WINDOW_DAYS / SEARCH_STEP_DAYS);

  for (let i = 1; i <= steps; i += 1) {
    const currentJd = jd + i * SEARCH_STEP_DAYS;
    const currentLat = computeMoonFromJd(currentJd).latitudeDeg;

    if (Math.sign(previousLat) !== Math.sign(currentLat)) {
      let low = previousJd;
      let high = currentJd;
      let lowValue = previousLat;

      for (let iteration = 0; iteration < REFINE_ITERATIONS; iteration += 1) {
        const mid = (low + high) / 2;
        const midValue = computeMoonFromJd(mid).latitudeDeg;

        if (Math.sign(midValue) === Math.sign(lowValue)) {
          low = mid;
          lowValue = midValue;
        } else {
          high = mid;
        }
      }

      const nodeJd = (low + high) / 2;
      const beforeLat = computeMoonFromJd(nodeJd - 0.02).latitudeDeg;
      const afterLat = computeMoonFromJd(nodeJd + 0.02).latitudeDeg;
      const label = beforeLat < afterLat ? 'Nœud ascendant' : 'Nœud descendant';

      return {
        label,
        jd: nodeJd,
        utcIso: dateFromJulianDay(nodeJd).toISOString()
      };
    }

    previousJd = currentJd;
    previousLat = currentLat;
  }

  return null;
}

function findNextDistanceExtremum(jd, kind) {
  const samples = [];
  const steps = Math.ceil(SEARCH_WINDOW_DAYS / SEARCH_STEP_DAYS);

  for (let i = 0; i <= steps; i += 1) {
    const sampleJd = jd + i * SEARCH_STEP_DAYS;
    samples.push({
      jd: sampleJd,
      distanceKm: computeMoonFromJd(sampleJd).distanceKm
    });
  }

  for (let i = 1; i < samples.length - 1; i += 1) {
    const previous = samples[i - 1];
    const current = samples[i];
    const next = samples[i + 1];
    const isMatch = kind === 'min'
      ? current.distanceKm <= previous.distanceKm && current.distanceKm < next.distanceKm
      : current.distanceKm >= previous.distanceKm && current.distanceKm > next.distanceKm;

    if (isMatch) {
      const lower = Math.min(previous.jd, next.jd);
      const upper = Math.max(previous.jd, next.jd);
      const extremumJd = kind === 'min'
        ? refineMinimum(lower, upper, (value) => computeMoonFromJd(value).distanceKm)
        : refineMaximum(lower, upper, (value) => computeMoonFromJd(value).distanceKm);
      const distanceKm = computeMoonFromJd(extremumJd).distanceKm;

      return {
        label: kind === 'min' ? 'Périgée' : 'Apogée',
        jd: extremumJd,
        utcIso: dateFromJulianDay(extremumJd).toISOString(),
        distanceKm
      };
    }
  }

  return null;
}

function classifyLunarEclipse(nodeDeltaDeg) {
  if (nodeDeltaDeg <= 4) return 'totale probable';
  if (nodeDeltaDeg <= 8) return 'partielle probable';
  return 'pénombrale probable';
}

function findNextLunarEclipse(jd) {
  let cursorJd = jd + 0.01;

  for (let cycle = 0; cycle < ECLIPSE_LOOKAHEAD_CYCLES; cycle += 1) {
    const phaseEvents = computeMoonPhaseEventsAround(cursorJd);
    const fullMoon = phaseEvents.nextByKey.fullMoon;
    if (!fullMoon) return null;

    const moon = computeMoonFromJd(fullMoon.jd);
    const nodeLon = trueLunarNode(julianCenturiesSinceJ2000(fullMoon.jd));
    const nodeDeltaDeg = Math.abs(normalize180(moon.longitudeDeg - nodeLon));

    if (nodeDeltaDeg <= 12) {
      return {
        label: 'Prochaine éclipse de Lune',
        jd: fullMoon.jd,
        utcIso: fullMoon.utcIso,
        phase: fullMoon.label,
        nodeDeltaDeg,
        eclipseType: classifyLunarEclipse(nodeDeltaDeg)
      };
    }

    cursorJd = fullMoon.jd + 1;
  }

  return null;
}

function describeVisibility(phaseLabel, riseSet) {
  if (!riseSet) {
    return 'visibilité indisponible';
  }

  if (riseSet.neverRises) {
    return 'ne se lève pas à cette latitude / date';
  }

  if (riseSet.circumpolar) {
    return 'circumpolaire';
  }

  if (phaseLabel === 'Nouvelle Lune') {
    return 'quasi invisible, très proche du Soleil';
  }

  if (['Premier croissant', 'Premier quartier', 'Gibbeuse croissante'].includes(phaseLabel)) {
    return 'surtout visible du soir vers la première partie de nuit';
  }

  if (phaseLabel === 'Pleine Lune') {
    return 'visible presque toute la nuit';
  }

  return 'surtout visible en seconde partie de nuit et au matin';
}

function describeTrajectory(moonBody) {
  if (!moonBody) return 'trajectoire indisponible';

  const latitudeSide = moonBody.latitudeDeg >= 0 ? 'au nord de l’écliptique' : 'au sud de l’écliptique';
  const motion = moonBody.latitudeDeg >= 0
    ? 'en route vers le nœud descendant'
    : 'en route vers le nœud ascendant';

  return `${latitudeSide}, ${motion}`;
}

export function computeMoonOrbitEvents(jd, moonBody, riseSet) {
  return {
    currentConstellation: moonBody?.constellation ?? null,
    visibilityText: describeVisibility(moonBody?.phaseLabel ?? null, riseSet),
    trajectoryText: describeTrajectory(moonBody),
    nextNode: findNextLatitudeNode(jd),
    nextPerigee: findNextDistanceExtremum(jd, 'min'),
    nextApogee: findNextDistanceExtremum(jd, 'max'),
    nextLunarEclipse: findNextLunarEclipse(jd)
  };
}
