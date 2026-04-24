import { normalizeDeg, normalize180 } from '../core/angles.js';
import { dateFromJulianDay } from '../core/time.js';
import {
  HUMAN_DESIGN_MANDALA,
  HUMAN_DESIGN_MANDALA_START_DEG,
  HUMAN_DESIGN_GATE_SPAN_DEG,
  HUMAN_DESIGN_LINE_SPAN_DEG,
  HUMAN_DESIGN_COLOR_SPAN_DEG,
  HUMAN_DESIGN_TONE_SPAN_DEG,
  HUMAN_DESIGN_BASE_SPAN_DEG
} from '../data/humanDesignMandala.js';
import { buildHumanDesignLongitudesWithSwiss } from './swissEphemeris.js';

const HUMAN_DESIGN_SOLAR_ARC_DEG = 88;
const DESIGN_SEARCH_MIN_DAYS = 82;
const DESIGN_SEARCH_MAX_DAYS = 96;
const DESIGN_SEARCH_TOLERANCE_JD = 1 / 86400;
const DESIGN_SEARCH_MAX_ITERATIONS = 80;

export const HUMAN_DESIGN_SUPPORTED_BODIES = [
  'Sun',
  'Earth',
  'Moon',
  'NorthNode',
  'SouthNode',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto'
];

function getMandalaOffset(longitudeDeg) {
  return normalizeDeg(longitudeDeg - HUMAN_DESIGN_MANDALA_START_DEG);
}

export function getHumanDesignActivation(longitudeDeg) {
  const lon = normalizeDeg(longitudeDeg);
  const offset = getMandalaOffset(lon);
  const gateIndex = Math.min(Math.floor(offset / HUMAN_DESIGN_GATE_SPAN_DEG), 63);
  const gateOffset = offset - gateIndex * HUMAN_DESIGN_GATE_SPAN_DEG;
  const lineIndex = Math.min(Math.floor(gateOffset / HUMAN_DESIGN_LINE_SPAN_DEG), 5);
  const lineOffset = gateOffset - lineIndex * HUMAN_DESIGN_LINE_SPAN_DEG;
  const colorIndex = Math.min(Math.floor(lineOffset / HUMAN_DESIGN_COLOR_SPAN_DEG), 5);
  const colorOffset = lineOffset - colorIndex * HUMAN_DESIGN_COLOR_SPAN_DEG;
  const toneIndex = Math.min(Math.floor(colorOffset / HUMAN_DESIGN_TONE_SPAN_DEG), 5);
  const toneOffset = colorOffset - toneIndex * HUMAN_DESIGN_TONE_SPAN_DEG;
  const baseIndex = Math.min(Math.floor(toneOffset / HUMAN_DESIGN_BASE_SPAN_DEG), 4);
  const segment = HUMAN_DESIGN_MANDALA[gateIndex];

  return {
    longitudeDeg: lon,
    gate: segment.gate,
    line: lineIndex + 1,
    color: colorIndex + 1,
    tone: toneIndex + 1,
    base: baseIndex + 1,
    gateIndex,
    startDeg: segment.startDeg,
    endDeg: segment.endDeg
  };
}

function buildActivationEntry(name, longitudeDeg) {
  return {
    name,
    ...getHumanDesignActivation(longitudeDeg)
  };
}

function buildActivationSetFromLongitudes(longitudes) {
  return Object.fromEntries(
    Object.entries(longitudes).map(([name, longitudeDeg]) => [name, buildActivationEntry(name, longitudeDeg)])
  );
}

function solarArcDiffDeg(jd, targetLongitudeDeg) {
  const sunLongitudeDeg = buildHumanDesignLongitudesWithSwiss(jd).longitudes.Sun.longitudeDeg;
  return normalize180(sunLongitudeDeg - targetLongitudeDeg);
}

export function findHumanDesignDesignJulianDay(birthJd, birthSunLongitudeDeg, targetSolarArcDeg = HUMAN_DESIGN_SOLAR_ARC_DEG) {
  const targetLongitudeDeg = normalizeDeg(birthSunLongitudeDeg - targetSolarArcDeg);
  let lower = birthJd - DESIGN_SEARCH_MAX_DAYS;
  let upper = birthJd - DESIGN_SEARCH_MIN_DAYS;
  let lowerDiff = solarArcDiffDeg(lower, targetLongitudeDeg);
  let upperDiff = solarArcDiffDeg(upper, targetLongitudeDeg);

  for (let expansion = 0; expansion < 12 && lowerDiff * upperDiff > 0; expansion += 1) {
    lower -= 2;
    upper += 2;
    lowerDiff = solarArcDiffDeg(lower, targetLongitudeDeg);
    upperDiff = solarArcDiffDeg(upper, targetLongitudeDeg);
  }

  if (lowerDiff === 0) return lower;
  if (upperDiff === 0) return upper;

  if (lowerDiff * upperDiff > 0) {
    throw new Error('Unable to bracket Human Design design date from solar arc.');
  }

  for (let iteration = 0; iteration < DESIGN_SEARCH_MAX_ITERATIONS; iteration += 1) {
    const mid = (lower + upper) / 2;
    const midDiff = solarArcDiffDeg(mid, targetLongitudeDeg);

    if (Math.abs(midDiff) < 1e-8 || Math.abs(upper - lower) < DESIGN_SEARCH_TOLERANCE_JD) {
      return mid;
    }

    if (lowerDiff * midDiff <= 0) {
      upper = mid;
      upperDiff = midDiff;
    } else {
      lower = mid;
      lowerDiff = midDiff;
    }
  }

  return (lower + upper) / 2;
}

export function computeHumanDesignData(chart, options = {}) {
  const birthJd = chart?.context?.jd;
  if (!Number.isFinite(birthJd)) {
    return null;
  }

  const nodeMode = options.nodeMode ?? 'true';
  const birthLongitudesData = buildHumanDesignLongitudesWithSwiss(birthJd, { nodeMode });
  const birthSunLongitudeDeg = birthLongitudesData.longitudes.Sun.longitudeDeg;
  const designJd = findHumanDesignDesignJulianDay(birthJd, birthSunLongitudeDeg, options.targetSolarArcDeg);
  const designLongitudesData = buildHumanDesignLongitudesWithSwiss(designJd, { nodeMode });
  const designLongitudes = Object.fromEntries(
    Object.entries(designLongitudesData.longitudes).map(([name, body]) => [name, body.longitudeDeg])
  );
  const birthLongitudes = Object.fromEntries(
    Object.entries(birthLongitudesData.longitudes).map(([name, body]) => [name, body.longitudeDeg])
  );
  const solarArcActualDeg = normalizeDeg(birthLongitudes.Sun - designLongitudes.Sun);
  const personality = buildActivationSetFromLongitudes(birthLongitudes);
  const design = buildActivationSetFromLongitudes(designLongitudes);
  const profile = `${personality.Sun.line}/${design.Sun.line}`;
  const actualEphemeris = birthLongitudesData.longitudes.Sun.actualEphemeris ?? 'unknown';

  return {
    targetSolarArcDeg: options.targetSolarArcDeg ?? HUMAN_DESIGN_SOLAR_ARC_DEG,
    solarArcActualDeg,
    designJulianDay: designJd,
    designUtcIso: dateFromJulianDay(designJd).toISOString(),
    designAgeDays: birthJd - designJd,
    conscious: personality,
    unconscious: design,
    personality,
    design,
    profile,
    supportedBodies: [...HUMAN_DESIGN_SUPPORTED_BODIES],
    missingBodies: [],
    longitudeModel: {
      Sun: 'swiss-ecliptic-geocentric',
      Earth: 'derived-opposition-of-sun',
      Moon: 'swiss-ecliptic-geocentric',
      Nodes: `${nodeMode}-lunar-node-from-swiss`
    },
    ephemeris: {
      requested: birthLongitudesData.longitudes.Sun.requestedEphemeris ?? 'moshier',
      actual: actualEphemeris,
      nodeMode,
      provider: 'swisseph-v2'
    }
  };
}
