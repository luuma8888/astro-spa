import swe from 'swisseph-v2';

import { normalizeDeg } from '../core/angles.js';
import { dateFromJulianDay, julianDayFromDate, toUtcDate } from '../core/time.js';

const BODY_CODES = {
  Sun: swe.SE_SUN,
  Moon: swe.SE_MOON,
  Mercury: swe.SE_MERCURY,
  Venus: swe.SE_VENUS,
  Mars: swe.SE_MARS,
  Jupiter: swe.SE_JUPITER,
  Saturn: swe.SE_SATURN,
  Uranus: swe.SE_URANUS,
  Neptune: swe.SE_NEPTUNE,
  Pluto: swe.SE_PLUTO
};

const NODE_CODES = {
  mean: swe.SE_MEAN_NODE,
  true: swe.SE_TRUE_NODE
};

const EPHEMERIS_FLAGS = {
  moshier: swe.SEFLG_MOSEPH,
  swiss: swe.SEFLG_SWIEPH,
  jpl: swe.SEFLG_JPLEPH
};

let didConfigureEphemeris = false;

function configureEphemerisPath() {
  if (didConfigureEphemeris) return;
  didConfigureEphemeris = true;

  const ephePath = process.env.SWISSEPH_EPHE_PATH;
  if (ephePath) {
    swe.swe_set_ephe_path(ephePath);
  }

  const jplFile = process.env.SWISSEPH_JPL_FILE;
  if (jplFile) {
    swe.swe_set_jpl_file(jplFile);
  }
}

function getRequestedEphemerisMode() {
  const raw = process.env.SWISSEPH_MODE?.trim().toLowerCase();
  if (raw === 'jpl' || raw === 'swiss' || raw === 'moshier') return raw;
  return process.env.SWISSEPH_EPHE_PATH ? 'swiss' : 'moshier';
}

function getPlanetFlags() {
  const ephemerisMode = getRequestedEphemerisMode();
  return {
    ephemerisMode,
    flags: swe.SEFLG_SPEED | EPHEMERIS_FLAGS[ephemerisMode]
  };
}

function getActualEphemerisMode(rflag) {
  if (rflag & swe.SEFLG_JPLEPH) return 'jpl';
  if (rflag & swe.SEFLG_SWIEPH) return 'swiss';
  if (rflag & swe.SEFLG_MOSEPH) return 'moshier';
  return 'unknown';
}

function assertSwissResult(result, bodyName) {
  if (result?.error) {
    throw new Error(`Swiss Ephemeris failed for ${bodyName}: ${result.error}`);
  }

  if (!Number.isFinite(result?.longitude)) {
    throw new Error(`Swiss Ephemeris returned invalid longitude for ${bodyName}.`);
  }
}

function computeBodyResult(bodyName, jdUt, flags) {
  const code = BODY_CODES[bodyName];
  if (code == null) throw new Error(`Unsupported Swiss Ephemeris body: ${bodyName}`);

  const result = swe.swe_calc_ut(jdUt, code, flags);
  assertSwissResult(result, bodyName);

  return {
    longitudeDeg: normalizeDeg(result.longitude),
    latitudeDeg: result.latitude,
    distanceAu: result.distance,
    speedDegPerDay: result.longitudeSpeed,
    raw: result
  };
}

function computeNodeResult(jdUt, flags, nodeMode) {
  const code = NODE_CODES[nodeMode];
  if (code == null) throw new Error(`Unsupported node mode: ${nodeMode}`);

  const result = swe.swe_calc_ut(jdUt, code, flags);
  assertSwissResult(result, `${nodeMode}-node`);

  return {
    longitudeDeg: normalizeDeg(result.longitude),
    latitudeDeg: result.latitude,
    distanceAu: result.distance,
    speedDegPerDay: result.longitudeSpeed,
    raw: result
  };
}

export function getSwissJulianDayFromInput(input) {
  return julianDayFromDate(toUtcDate(input));
}

export function getSwissBodyLongitude(bodyName, jdUt, options = {}) {
  configureEphemerisPath();
  const { flags, ephemerisMode } = getPlanetFlags();
  const body = computeBodyResult(bodyName, jdUt, flags);

  return {
    ...body,
    requestedEphemeris: ephemerisMode,
    actualEphemeris: getActualEphemerisMode(body.raw?.rflag ?? 0)
  };
}

export function getSwissNodeLongitude(jdUt, options = {}) {
  configureEphemerisPath();
  const nodeMode = options.nodeMode ?? 'true';
  const { flags, ephemerisMode } = getPlanetFlags();
  const node = computeNodeResult(jdUt, flags, nodeMode);

  return {
    ...node,
    nodeMode,
    requestedEphemeris: ephemerisMode,
    actualEphemeris: getActualEphemerisMode(node.raw?.rflag ?? 0)
  };
}

export function buildHumanDesignLongitudesWithSwiss(jdUt, options = {}) {
  const nodeMode = options.nodeMode ?? 'true';
  const node = getSwissNodeLongitude(jdUt, { ...options, nodeMode });
  const longitudes = {};

  for (const bodyName of Object.keys(BODY_CODES)) {
    longitudes[bodyName] = getSwissBodyLongitude(bodyName, jdUt, options);
  }

  longitudes.Earth = {
    longitudeDeg: normalizeDeg(longitudes.Sun.longitudeDeg + 180),
    derivedFrom: 'Sun'
  };
  longitudes.NorthNode = {
    longitudeDeg: node.longitudeDeg,
    nodeMode: node.nodeMode,
    requestedEphemeris: node.requestedEphemeris,
    actualEphemeris: node.actualEphemeris
  };
  longitudes.SouthNode = {
    longitudeDeg: normalizeDeg(node.longitudeDeg + 180),
    derivedFrom: 'NorthNode',
    nodeMode: node.nodeMode,
    requestedEphemeris: node.requestedEphemeris,
    actualEphemeris: node.actualEphemeris
  };

  return {
    jdUt,
    utcIso: dateFromJulianDay(jdUt).toISOString(),
    nodeMode,
    longitudes
  };
}
