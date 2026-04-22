import { getConstellationByRaDec } from '../astrology/constellations.js';
import { dateFromJulianDay, julianDayFromDate, toUtcDate } from '../core/time.js';
import { computeMoonFromJd } from './moon.js';

const SEARCH_STEP_MINUTES = 30;
const MAX_SEARCH_DAYS = 7;

function getMoonConstellationAtJd(jd) {
  const moon = computeMoonFromJd(jd);
  return {
    body: moon,
    constellation: getConstellationByRaDec(moon.rightAscensionDeg, moon.declinationDeg, { jd })
  };
}

function sameConstellation(a, b) {
  return (a?.abbr ?? null) === (b?.abbr ?? null);
}

function findTransitionBracket(startJd, initialConstellation) {
  const stepDays = SEARCH_STEP_MINUTES / 1440;
  const maxSteps = Math.ceil((MAX_SEARCH_DAYS * 1440) / SEARCH_STEP_MINUTES);
  let previousJd = startJd;

  for (let step = 1; step <= maxSteps; step += 1) {
    const currentJd = startJd + step * stepDays;
    const { constellation } = getMoonConstellationAtJd(currentJd);

    if (!sameConstellation(initialConstellation, constellation)) {
      return {
        startJd: previousJd,
        endJd: currentJd,
        toConstellation: constellation
      };
    }

    previousJd = currentJd;
  }

  return null;
}

function refineTransition(lowerJd, upperJd, fromConstellation) {
  let low = lowerJd;
  let high = upperJd;

  for (let i = 0; i < 32; i += 1) {
    const mid = (low + high) / 2;
    const { constellation } = getMoonConstellationAtJd(mid);

    if (sameConstellation(fromConstellation, constellation)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

export function computeNextMoonConstellationTransition(input, currentMoonBody = null) {
  const startDate = toUtcDate(input);
  const startJd = julianDayFromDate(startDate);
  const initialConstellation = currentMoonBody?.constellation
    ?? getConstellationAtJd(startJd);

  const bracket = findTransitionBracket(startJd, initialConstellation);
  if (!bracket) {
    return null;
  }

  const transitionJd = refineTransition(bracket.startJd, bracket.endJd, initialConstellation);
  const { constellation: toConstellation } = getMoonConstellationAtJd(transitionJd);

  return {
    from: initialConstellation ?? null,
    to: toConstellation ?? null,
    jd: transitionJd,
    utcIso: dateFromJulianDay(transitionJd).toISOString()
  };
}

function getConstellationAtJd(jd) {
  return getMoonConstellationAtJd(jd).constellation;
}
