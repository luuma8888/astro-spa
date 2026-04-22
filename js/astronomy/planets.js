import { normalizeDeg, sinDeg, cosDeg, atan2Deg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { PLANET_ELEMENT_MODELS, PLANET_MODEL_SHORT_RANGE } from '../data/planetElements.js';

const J2000_OBLIQUITY_DEG = 23.43928;

function julianDayFromT(T) {
  return 2451545.0 + T * 36525;
}

function isShortRangeModel(T) {
  const jd = julianDayFromT(T);
  return jd >= PLANET_MODEL_SHORT_RANGE.minJulianDay && jd <= PLANET_MODEL_SHORT_RANGE.maxJulianDay;
}

function selectPlanetModel(name, T) {
  const models = PLANET_ELEMENT_MODELS[name];
  if (!models) throw new Error(`Unknown planet: ${name}`);
  return isShortRangeModel(T) ? models.shortRange : models.extendedRange;
}

function solveKeplerDeg(Mdeg, e, iterations = 15, toleranceDeg = 1e-6) {
  const eStar = 57.29577951308232 * e;
  let E = Mdeg + eStar * sinDeg(Mdeg);

  for (let i = 0; i < iterations; i += 1) {
    const deltaM = Mdeg - (E - eStar * sinDeg(E));
    const deltaE = deltaM / (1 - e * cosDeg(E));
    E += deltaE;
    if (Math.abs(deltaE) <= toleranceDeg) break;
  }

  return E;
}

function getElementsAtTime(base, T) {
  return {
    a: base.a + base.aRate * T,
    e: base.e + base.eRate * T,
    i: base.i + base.iRate * T,
    L: normalizeDeg(base.L + base.LRate * T),
    longPeri: normalizeDeg(base.longPeri + base.longPeriRate * T),
    longNode: normalizeDeg(base.longNode + base.longNodeRate * T),
    b: base.b ?? 0,
    c: base.c ?? 0,
    s: base.s ?? 0,
    f: base.f ?? 0
  };
}

function getOrbitalState(elements, T) {
  const correction = elements.b * T * T
    + elements.c * Math.cos((elements.f * T) * Math.PI / 180)
    + elements.s * Math.sin((elements.f * T) * Math.PI / 180);
  let M = normalizeDeg(elements.L - elements.longPeri + correction);
  if (M > 180) M -= 360;

  const argPeri = normalizeDeg(elements.longPeri - elements.longNode);
  const E = solveKeplerDeg(M, elements.e);

  const xv = elements.a * (cosDeg(E) - elements.e);
  const yv = elements.a * Math.sqrt(1 - elements.e * elements.e) * sinDeg(E);

  const v = atan2Deg(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const u = normalizeDeg(v + argPeri);

  return { M, E, v, r, u, xPrime: xv, yPrime: yv };
}

function orbitalToHeliocentric(elements, state) {
  const xh = state.r * (
    cosDeg(elements.longNode) * cosDeg(state.u)
    - sinDeg(elements.longNode) * sinDeg(state.u) * cosDeg(elements.i)
  );

  const yh = state.r * (
    sinDeg(elements.longNode) * cosDeg(state.u)
    + cosDeg(elements.longNode) * sinDeg(state.u) * cosDeg(elements.i)
  );

  const zh = state.r * sinDeg(state.u) * sinDeg(elements.i);

  return { xh, yh, zh };
}

function rectToSpherical(x, y, z) {
  const lon = normalizeDeg(atan2Deg(y, x));
  const xy = Math.sqrt(x * x + y * y);
  const lat = atan2Deg(z, xy);
  const radius = Math.sqrt(x * x + y * y + z * z);

  return { lon, lat, radius };
}

function computeHeliocentricPlanet(name, T) {
  const base = selectPlanetModel(name, T);
  const elements = getElementsAtTime(base, T);
  const state = getOrbitalState(elements, T);
  const helio = orbitalToHeliocentric(elements, state);
  const spherical = rectToSpherical(helio.xh, helio.yh, helio.zh);

  return {
    name,
    elements,
    meanAnomalyDeg: state.M,
    eccentricAnomalyDeg: state.E,
    trueAnomalyDeg: state.v,
    radiusAu: state.r,
    heliocentric: {
      xAu: helio.xh,
      yAu: helio.yh,
      zAu: helio.zh,
      longitudeDeg: spherical.lon,
      latitudeDeg: spherical.lat,
      distanceAu: spherical.radius
    }
  };
}

function heliocentricToGeocentric(planetHelio, earthHelio) {
  const xg = planetHelio.heliocentric.xAu - earthHelio.heliocentric.xAu;
  const yg = planetHelio.heliocentric.yAu - earthHelio.heliocentric.yAu;
  const zg = planetHelio.heliocentric.zAu - earthHelio.heliocentric.zAu;

  const spherical = rectToSpherical(xg, yg, zg);

  return {
    xAu: xg,
    yAu: yg,
    zAu: zg,
    longitudeDeg: spherical.lon,
    latitudeDeg: spherical.lat,
    distanceAu: spherical.radius
  };
}

function enrichGeocentricData(geocentric, epsilonDeg) {
  const eq = eclipticToEquatorial(
    geocentric.longitudeDeg,
    geocentric.latitudeDeg,
    epsilonDeg
  );

  const eqJ2000 = eclipticToEquatorial(
    geocentric.longitudeDeg,
    geocentric.latitudeDeg,
    J2000_OBLIQUITY_DEG
  );

  return {
    longitudeDeg: geocentric.longitudeDeg,
    latitudeDeg: geocentric.latitudeDeg,
    distanceAu: geocentric.distanceAu,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    rightAscensionJ2000Deg: eqJ2000.raDeg,
    declinationJ2000Deg: eqJ2000.decDeg,
    geocentricCartesian: {
      xAu: geocentric.xAu,
      yAu: geocentric.yAu,
      zAu: geocentric.zAu
    }
  };
}

export function computePlanets(T, epsilonDeg) {
  const earth = computeHeliocentricPlanet('Earth', T);

  const planetNames = [
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune'
  ];

  const result = {};

  for (const name of planetNames) {
    const helioPlanet = computeHeliocentricPlanet(name, T);
    const geocentric = heliocentricToGeocentric(helioPlanet, earth);
    const enriched = enrichGeocentricData(geocentric, epsilonDeg);

    result[name] = {
      name,
      ...enriched,
      meanAnomalyDeg: helioPlanet.meanAnomalyDeg,
      eccentricAnomalyDeg: helioPlanet.eccentricAnomalyDeg,
      trueAnomalyDeg: helioPlanet.trueAnomalyDeg,
      heliocentricLongitudeDeg: helioPlanet.heliocentric.longitudeDeg,
      heliocentricLatitudeDeg: helioPlanet.heliocentric.latitudeDeg,
      heliocentricDistanceAu: helioPlanet.heliocentric.distanceAu,
      modelRange: isShortRangeModel(T) ? 'jpl-short-1800-2050' : 'jpl-extended-3000bc-3000ad'
    };
  }

  return result;
}

export function computeEarthHeliocentric(T, epsilonDeg) {
  const earth = computeHeliocentricPlanet('Earth', T);
  const eq = eclipticToEquatorial(
    earth.heliocentric.longitudeDeg,
    earth.heliocentric.latitudeDeg,
    epsilonDeg
  );

  return {
    name: 'Earth',
    longitudeDeg: earth.heliocentric.longitudeDeg,
    latitudeDeg: earth.heliocentric.latitudeDeg,
    distanceAu: earth.heliocentric.distanceAu,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    heliocentricCartesian: {
      xAu: earth.heliocentric.xAu,
      yAu: earth.heliocentric.yAu,
      zAu: earth.heliocentric.zAu
    },
    modelRange: isShortRangeModel(T) ? 'jpl-short-1800-2050' : 'jpl-extended-3000bc-3000ad'
  };
}
