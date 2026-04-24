import { normalizeDeg, sinDeg, cosDeg, atan2Deg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { toUtcDate, julianDayFromDate, julianCenturiesSinceJ2000 } from '../core/time.js';
import { PLANET_ELEMENT_MODELS, PLANET_MODEL_SHORT_RANGE } from '../data/planetElements.js';
import { PLANET_PRECISION_ANCHORS } from '../data/planetPrecisionAnchors.js';

const J2000_OBLIQUITY_DEG = 23.43928;
const DEFAULT_PLANET_PRECISION_MODE = 'enhanced';
const PLANET_PRECISION_MODES = new Set(['standard', 'enhanced']);
let precisionAnchorCache = null;

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

function vectorMagnitude(vector) {
  return Math.sqrt(
    vector.xAu * vector.xAu
    + vector.yAu * vector.yAu
    + vector.zAu * vector.zAu
  );
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

function buildPlanetResult(name, helioPlanet, geocentric, epsilonDeg, T, precisionMode) {
  const enriched = enrichGeocentricData(geocentric, epsilonDeg);

  return {
    name,
    ...enriched,
    meanAnomalyDeg: helioPlanet.meanAnomalyDeg,
    eccentricAnomalyDeg: helioPlanet.eccentricAnomalyDeg,
    trueAnomalyDeg: helioPlanet.trueAnomalyDeg,
    heliocentricLongitudeDeg: helioPlanet.heliocentric.longitudeDeg,
    heliocentricLatitudeDeg: helioPlanet.heliocentric.latitudeDeg,
    heliocentricDistanceAu: helioPlanet.heliocentric.distanceAu,
    modelRange: precisionMode === 'enhanced'
      ? `${isShortRangeModel(T) ? 'jpl-short-1800-2050' : 'jpl-extended-3000bc-3000ad'}+horizons-anchor-correction`
      : isShortRangeModel(T)
        ? 'jpl-short-1800-2050'
        : 'jpl-extended-3000bc-3000ad'
  };
}

function computePlanetsBase(T, epsilonDeg) {
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
    result[name] = buildPlanetResult(name, helioPlanet, geocentric, epsilonDeg, T, 'standard');
  }

  return result;
}

function anchorToT(input) {
  const utcDate = toUtcDate(input);
  return julianCenturiesSinceJ2000(julianDayFromDate(utcDate));
}

function getPrecisionAnchorCache() {
  if (precisionAnchorCache) return precisionAnchorCache;

  const cache = new Map();

  for (const anchor of PLANET_PRECISION_ANCHORS) {
    const T = anchorToT(anchor.input);
    const basePlanets = computePlanetsBase(T, J2000_OBLIQUITY_DEG);

    for (const [planetName, reference] of Object.entries(anchor.reference)) {
      const planetAnchors = cache.get(planetName) ?? [];
      const actual = basePlanets[planetName]?.geocentricCartesian;

      if (!actual) continue;

      planetAnchors.push({
        id: anchor.id,
        T,
        delta: {
          xAu: reference.xAu - actual.xAu,
          yAu: reference.yAu - actual.yAu,
          zAu: reference.zAu - actual.zAu
        }
      });

      cache.set(planetName, planetAnchors);
    }
  }

  for (const anchors of cache.values()) {
    anchors.sort((left, right) => left.T - right.T);
  }

  precisionAnchorCache = cache;
  return precisionAnchorCache;
}

function interpolatePrecisionDelta(planetName, T) {
  const anchors = getPrecisionAnchorCache().get(planetName);

  if (!anchors || anchors.length === 0) return null;

  if (T < anchors[0].T || T > anchors[anchors.length - 1].T) {
    return {
      applied: false,
      strategy: 'out-of-range',
      anchors: [],
      interpolationRatio: null,
      delta: null
    };
  }

  for (let index = 0; index < anchors.length; index += 1) {
    const current = anchors[index];
    if (Math.abs(T - current.T) < 1e-12) {
      return {
        applied: true,
        strategy: 'exact-anchor',
        anchors: [current.id],
        interpolationRatio: 0,
        delta: current.delta
      };
    }

    const next = anchors[index + 1];
    if (!next || T > next.T) continue;
    if (Math.abs(T - next.T) < 1e-12) {
      return {
        applied: true,
        strategy: 'exact-anchor',
        anchors: [next.id],
        interpolationRatio: 0,
        delta: next.delta
      };
    }

    const ratio = (T - current.T) / (next.T - current.T);
    return {
      applied: true,
      strategy: 'interpolated',
      anchors: [current.id, next.id],
      interpolationRatio: ratio,
      delta: {
        xAu: current.delta.xAu + (next.delta.xAu - current.delta.xAu) * ratio,
        yAu: current.delta.yAu + (next.delta.yAu - current.delta.yAu) * ratio,
        zAu: current.delta.zAu + (next.delta.zAu - current.delta.zAu) * ratio
      }
    };
  }

  return {
    applied: false,
    strategy: 'unresolved',
    anchors: [],
    interpolationRatio: null,
    delta: null
  };
}

function applyPrecisionDelta(planet, delta, epsilonDeg) {
  const geocentric = {
    xAu: planet.geocentricCartesian.xAu + delta.xAu,
    yAu: planet.geocentricCartesian.yAu + delta.yAu,
    zAu: planet.geocentricCartesian.zAu + delta.zAu
  };
  const spherical = rectToSpherical(geocentric.xAu, geocentric.yAu, geocentric.zAu);

  return {
    ...planet,
    ...enrichGeocentricData(
      {
        ...geocentric,
        longitudeDeg: spherical.lon,
        latitudeDeg: spherical.lat,
        distanceAu: spherical.radius
      },
      epsilonDeg
    )
  };
}

export function computePlanets(T, epsilonDeg, options = {}) {
  const precisionMode = PLANET_PRECISION_MODES.has(options.precisionMode)
    ? options.precisionMode
    : DEFAULT_PLANET_PRECISION_MODE;
  const basePlanets = computePlanetsBase(T, epsilonDeg);

  if (precisionMode !== 'enhanced') {
    for (const planet of Object.values(basePlanets)) {
      planet.precisionCorrection = {
        mode: precisionMode,
        applied: false,
        strategy: 'standard-model',
        anchors: [],
        interpolationRatio: null,
        deltaAu: null
      };
    }
    return basePlanets;
  }

  const corrected = {};

  for (const [name, planet] of Object.entries(basePlanets)) {
    const correction = interpolatePrecisionDelta(name, T);
    const correctionDelta = correction?.delta ?? null;
    const correctedPlanet = correction?.applied && correctionDelta
      ? {
        ...applyPrecisionDelta(planet, correctionDelta, epsilonDeg),
        modelRange: `${planet.modelRange}+horizons-anchor-correction`
      }
      : planet;

    corrected[name] = {
      ...correctedPlanet,
      precisionCorrection: {
        mode: precisionMode,
        applied: Boolean(correction?.applied && correctionDelta),
        strategy: correction?.strategy ?? 'unresolved',
        anchors: correction?.anchors ?? [],
        interpolationRatio: correction?.interpolationRatio ?? null,
        deltaAu: correctionDelta
          ? {
            ...correctionDelta,
            magnitudeAu: vectorMagnitude(correctionDelta)
          }
          : null
      }
    };
  }

  return corrected;
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
