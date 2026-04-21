import { normalize180 } from '../core/angles.js';
import { dateFromJulianDay } from '../core/time.js';
import { computeSunFromJd } from './sun.js';
import { computeMoonFromJd } from './moon.js';

const PHASE_EVENTS = [
  { key: 'newMoon', label: 'Nouvelle Lune', angleDeg: 0 },
  { key: 'firstQuarter', label: 'Premier quartier', angleDeg: 90 },
  { key: 'fullMoon', label: 'Pleine Lune', angleDeg: 180 },
  { key: 'lastQuarter', label: 'Dernier quartier', angleDeg: 270 }
];

const SEARCH_STEP_DAYS = 0.25;
const SEARCH_WINDOW_DAYS = 40;
const REFINE_ITERATIONS = 40;
const MAX_EVENT_ERROR_DEG = 1;

function phaseErrorDeg(jd, targetAngleDeg) {
  const sun = computeSunFromJd(jd);
  const moon = computeMoonFromJd(jd);
  return normalize180((moon.longitudeDeg - sun.longitudeDeg) - targetAngleDeg);
}

function phaseDistanceDeg(jd, targetAngleDeg) {
  return Math.abs(phaseErrorDeg(jd, targetAngleDeg));
}

function refineEventJd(lowerJd, upperJd, targetAngleDeg) {
  let low = lowerJd;
  let high = upperJd;

  for (let i = 0; i < REFINE_ITERATIONS; i += 1) {
    const leftThird = low + (high - low) / 3;
    const rightThird = high - (high - low) / 3;
    const leftDistance = phaseDistanceDeg(leftThird, targetAngleDeg);
    const rightDistance = phaseDistanceDeg(rightThird, targetAngleDeg);

    if (leftDistance <= rightDistance) {
      high = rightThird;
    } else {
      low = leftThird;
    }
  }

  return (low + high) / 2;
}

function findEventCandidates(startJd, direction, targetAngleDeg, windowDays = SEARCH_WINDOW_DAYS) {
  const step = SEARCH_STEP_DAYS * direction;
  const steps = Math.ceil(windowDays / SEARCH_STEP_DAYS);
  const samples = [];

  for (let i = 0; i <= steps; i += 1) {
    const jd = startJd + i * step;
    samples.push({
      jd,
      distance: phaseDistanceDeg(jd, targetAngleDeg)
    });
  }

  const results = [];

  for (let i = 1; i < samples.length - 1; i += 1) {
    const previous = samples[i - 1];
    const current = samples[i];
    const next = samples[i + 1];

    if (current.distance <= previous.distance && current.distance < next.distance) {
      const lower = Math.min(previous.jd, next.jd);
      const upper = Math.max(previous.jd, next.jd);
      const refinedJd = refineEventJd(lower, upper, targetAngleDeg);
      const refinedDistance = phaseDistanceDeg(refinedJd, targetAngleDeg);

      if (refinedDistance <= MAX_EVENT_ERROR_DEG) {
        results.push(refinedJd);
      }
    }
  }

  return [...new Set(results.map((value) => value.toFixed(9)))]
    .map(Number)
    .sort((a, b) => a - b);
}

function makeEvent(target, jd) {
  return {
    ...target,
    jd,
    utcIso: dateFromJulianDay(jd).toISOString()
  };
}

export function computeMoonPhaseEventsAround(jd) {
  const previous = [];
  const next = [];

  for (const target of PHASE_EVENTS) {
    const previousHits = findEventCandidates(jd, -1, target.angleDeg);
    const nextHits = findEventCandidates(jd, 1, target.angleDeg);

    const previousJd = previousHits.filter((value) => value < jd - 1e-8).at(-1);
    const nextJd = nextHits.find((value) => value > jd + 1e-8);

    if (previousJd != null) previous.push(makeEvent(target, previousJd));
    if (nextJd != null) next.push(makeEvent(target, nextJd));
  }

  previous.sort((a, b) => b.jd - a.jd);
  next.sort((a, b) => a.jd - b.jd);

  return {
    previous,
    next,
    previousByKey: Object.fromEntries(previous.map((event) => [event.key, event])),
    nextByKey: Object.fromEntries(next.map((event) => [event.key, event]))
  };
}
