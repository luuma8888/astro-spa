import { normalizeDeg, sinDeg, cosDeg, atan2Deg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { PLANET_ELEMENTS } from '../data/planetElements.js';

function solveKepler(Mdeg, e, iterations = 12) {
  const M = Mdeg * Math.PI / 180;
  let E = e < 0.8 ? M : Math.PI;

  for (let i = 0; i < iterations; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
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
    longNode: normalizeDeg(base.longNode + base.longNodeRate * T)
  };
}

function getOrbitalState(elements) {
  const M = normalizeDeg(elements.L - elements.longPeri);
  const argPeri = normalizeDeg(elements.longPeri - elements.longNode);
  const E = solveKepler(M, elements.e);

  const xv = elements.a * (Math.cos(E) - elements.e);
  const yv = elements.a * Math.sqrt(1 - elements.e * elements.e) * Math.sin(E);

  const v = atan2Deg(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const u = normalizeDeg(v + argPeri);

  return { M, E, v, r, u };
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
  const base = PLANET_ELEMENTS[name];
  if (!base) throw new Error(`Unknown planet: ${name}`);

  const elements = getElementsAtTime(base, T);
  const state = getOrbitalState(elements);
  const helio = orbitalToHeliocentric(elements, state);
  const spherical = rectToSpherical(helio.xh, helio.yh, helio.zh);

  return {
    name,
    elements,
    meanAnomalyDeg: state.M,
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

  return {
    longitudeDeg: geocentric.longitudeDeg,
    latitudeDeg: geocentric.latitudeDeg,
    distanceAu: geocentric.distanceAu,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg
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
      trueAnomalyDeg: helioPlanet.trueAnomalyDeg,
      heliocentricLongitudeDeg: helioPlanet.heliocentric.longitudeDeg,
      heliocentricLatitudeDeg: helioPlanet.heliocentric.latitudeDeg,
      heliocentricDistanceAu: helioPlanet.heliocentric.distanceAu
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
    declinationDeg: eq.decDeg
  };
}
