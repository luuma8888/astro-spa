import { asinDeg, cosDeg, normalize180, sinDeg } from '../core/angles.js';
import { localSiderealTimeDeg } from '../core/sidereal.js';
import { julianDayFromDate, toUtcDate } from '../core/time.js';
import { computeSunFromJd } from './sun.js';
import { computeMoonFromJd } from './moon.js';

function hoursToClock(hours) {
  if (hours == null || Number.isNaN(hours)) return null;

  let h = hours % 24;
  if (h < 0) h += 24;

  let hh = Math.floor(h);
  let mm = Math.floor((h - hh) * 60);
  let ss = Math.round((((h - hh) * 60) - mm) * 60);

  if (ss === 60) {
    ss = 0;
    mm += 1;
  }

  if (mm === 60) {
    mm = 0;
    hh = (hh + 1) % 24;
  }

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function localDayStartJd(input) {
  const utcDate = toUtcDate({
    ...input,
    time: '00:00:00'
  });

  return julianDayFromDate(utcDate);
}

function altitudeDegAtJd(jd, latitudeDeg, longitudeDeg, computeBodyAtJd) {
  const body = computeBodyAtJd(jd);
  const lstDeg = localSiderealTimeDeg(jd, longitudeDeg);
  const hourAngleDeg = normalize180(lstDeg - body.rightAscensionDeg);
  const altitudeDeg = asinDeg(
    sinDeg(latitudeDeg) * sinDeg(body.declinationDeg)
    + cosDeg(latitudeDeg) * cosDeg(body.declinationDeg) * cosDeg(hourAngleDeg)
  );

  return {
    altitudeDeg,
    body
  };
}

function sampleAltitudeCurve(dayStartJd, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg, stepMinutes = 60) {
  const samples = [];
  const stepDays = stepMinutes / 1440;

  for (let m = 0; m <= 1 + 1e-9; m += stepDays) {
    const jd = dayStartJd + m;
    const { altitudeDeg } = altitudeDegAtJd(jd, latitudeDeg, longitudeDeg, computeBodyAtJd);
    samples.push({
      jd,
      value: altitudeDeg - altitudeThresholdDeg
    });
  }

  return samples;
}

function refineCrossing(lowerJd, upperJd, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg) {
  let low = lowerJd;
  let high = upperJd;
  let lowValue = altitudeDegAtJd(low, latitudeDeg, longitudeDeg, computeBodyAtJd).altitudeDeg - altitudeThresholdDeg;

  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    const midValue = altitudeDegAtJd(mid, latitudeDeg, longitudeDeg, computeBodyAtJd).altitudeDeg - altitudeThresholdDeg;

    if (Math.sign(midValue) === Math.sign(lowValue)) {
      low = mid;
      lowValue = midValue;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

function classifyEvent(beforeValue, afterValue) {
  return beforeValue < afterValue ? 'rise' : 'set';
}

function findRiseSetEvents(dayStartJd, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg) {
  const samples = sampleAltitudeCurve(dayStartJd, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg);
  const events = [];

  for (let i = 0; i < samples.length - 1; i += 1) {
    const a = samples[i];
    const b = samples[i + 1];

    if (a.value === 0) {
      events.push({ type: 'rise', jd: a.jd });
      continue;
    }

    if (Math.sign(a.value) !== Math.sign(b.value)) {
      const jd = refineCrossing(a.jd, b.jd, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg);
      events.push({ type: classifyEvent(a.value, b.value), jd });
    }
  }

  const allAbove = samples.every((sample) => sample.value > 0);
  const allBelow = samples.every((sample) => sample.value < 0);

  return { events, allAbove, allBelow };
}

function buildRiseSetResult(dayStartJd, events, allAbove, allBelow) {
  const riseEvent = events.find((event) => event.type === 'rise') ?? null;
  const setEvent = events.find((event) => event.type === 'set') ?? null;

  return {
    riseHoursUtc: riseEvent ? (riseEvent.jd - dayStartJd) * 24 : null,
    setHoursUtc: setEvent ? (setEvent.jd - dayStartJd) * 24 : null,
    rise: riseEvent ? hoursToClock((riseEvent.jd - dayStartJd) * 24) : null,
    set: setEvent ? hoursToClock((setEvent.jd - dayStartJd) * 24) : null,
    circumpolar: allAbove,
    neverRises: allBelow
  };
}

function computeRiseSetForBody({ input, latitudeDeg, longitudeDeg, computeBodyAtJd, altitudeThresholdDeg }) {
  const dayStartJd = localDayStartJd(input);
  const { events, allAbove, allBelow } = findRiseSetEvents(
    dayStartJd,
    latitudeDeg,
    longitudeDeg,
    computeBodyAtJd,
    altitudeThresholdDeg
  );

  return buildRiseSetResult(dayStartJd, events, allAbove, allBelow);
}

export function computeSunRiseSet(input) {
  return computeRiseSetForBody({
    input,
    latitudeDeg: input.latitude,
    longitudeDeg: input.longitude,
    computeBodyAtJd: computeSunFromJd,
    altitudeThresholdDeg: -0.833
  });
}

export function computeMoonRiseSet(input, moonBody = null) {
  const distanceKm = moonBody?.distanceKm ?? 384400;
  const horizontalParallaxDeg = Math.asin(6378.14 / distanceKm) * 180 / Math.PI;
  const semiDiameterDeg = 0.2725 * horizontalParallaxDeg;
  const apparentAltitudeDeg = 0.7275 * horizontalParallaxDeg - semiDiameterDeg - 0.5667;

  return computeRiseSetForBody({
    input,
    latitudeDeg: input.latitude,
    longitudeDeg: input.longitude,
    computeBodyAtJd: computeMoonFromJd,
    altitudeThresholdDeg: apparentAltitudeDeg
  });
}
