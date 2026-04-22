import { CONSTELLATIONS_OPTIMIZED } from '../data/constellationsOptimized.js';
import {
  CONSTELLATION_POLYGON_METADATA,
  CONSTELLATION_POLYGONS
} from '../data/constellationsPolygons.js';
import {
  CONSTELLATION_ROMAN87_METADATA,
  CONSTELLATION_ROMAN87_NAMES,
  CONSTELLATION_ROMAN87_ROWS
} from '../data/constellationsRoman87.js';
import { precessEquatorial } from '../core/precession.js';

function normalizeRa(ra) {
  let value = ra % 360;
  if (value < 0) value += 360;
  return value;
}

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = normalizeRa(polygon[i].ra);
    const yi = polygon[i].dec;
    const xj = normalizeRa(polygon[j].ra);
    const yj = polygon[j].dec;

    const intersect = ((yi > point.dec) !== (yj > point.dec))
      && (point.ra < ((xj - xi) * (point.dec - yi)) / ((yj - yi) || 1e-12) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

function pointInAnyPolygon(point, polygons) {
  return polygons.some((poly) => poly.length >= 3 && pointInPolygon(point, poly));
}

function getConstellationByPolygon(raDeg, decDeg) {
  const point = { ra: normalizeRa(raDeg), dec: decDeg };

  for (const constellation of CONSTELLATION_POLYGONS) {
    if (pointInAnyPolygon(point, constellation.polygons ?? [])) {
      return {
        ...constellation,
        source: constellation.kind === 'synthetic-bounds' ? 'polygon-synthetic' : 'polygon'
      };
    }
  }

  return null;
}

function getConstellationByOptimizedFallback(raDeg, decDeg) {
  const normalizedRa = normalizeRa(raDeg);

  const match = CONSTELLATIONS_OPTIMIZED.find((c) => {
    const raInRange = c.raMin <= c.raMax
      ? normalizedRa >= c.raMin && normalizedRa <= c.raMax
      : normalizedRa >= c.raMin || normalizedRa <= c.raMax;

    return raInRange && decDeg >= c.decMin && decDeg <= c.decMax;
  });

  return match
    ? { ...match, source: 'optimized-fallback' }
    : null;
}

function besselianEpochToJulianDay(besselianEpoch) {
  return 2415020.31352 + (besselianEpoch - 1900.0) * 365.242198781;
}

function getConstellationByRoman87(raDeg, decDeg, jd) {
  if (!Number.isFinite(jd) || !CONSTELLATION_ROMAN87_ROWS.length) {
    return null;
  }

  const b1875Jd = besselianEpochToJulianDay(1875.0);
  const precessed = precessEquatorial(raDeg, decDeg, jd, b1875Jd);
  const raHours = precessed.raDeg / 15;

  for (const row of CONSTELLATION_ROMAN87_ROWS) {
    if (row.raMinHours < raHours && raHours < row.raMaxHours && precessed.decDeg > row.decMinDeg) {
      return {
        abbr: row.abbr,
        name: CONSTELLATION_ROMAN87_NAMES[row.abbr] ?? row.abbr,
        source: 'roman87-exact',
        frame: 'B1875',
        ra1875Deg: precessed.raDeg,
        dec1875Deg: precessed.decDeg
      };
    }
  }

  return null;
}

export function getConstellationByRaDec(raDeg, decDeg, options = {}) {
  const roman87Match = getConstellationByRoman87(raDeg, decDeg, options.jd);
  if (roman87Match) return roman87Match;

  const polygonMatch = getConstellationByPolygon(raDeg, decDeg);
  if (polygonMatch) return polygonMatch;

  return getConstellationByOptimizedFallback(raDeg, decDeg);
}

export function getConstellationDatasetStatus() {
  const polygonCount = CONSTELLATION_POLYGONS.length;
  const optimizedCount = CONSTELLATIONS_OPTIMIZED.length;
  const coverageRatio = optimizedCount ? polygonCount / optimizedCount : 0;

  return {
    roman87RowCount: CONSTELLATION_ROMAN87_METADATA?.rowCount ?? 0,
    roman87NameCount: CONSTELLATION_ROMAN87_METADATA?.nameCount ?? 0,
    polygonCount,
    optimizedCount,
    coverageRatio,
    fallbackCount: Math.max(optimizedCount - polygonCount, 0),
    exactPolygonCount: CONSTELLATION_POLYGONS.filter((item) => (item.kind ?? 'exact') === 'exact').length,
    syntheticPolygonCount: CONSTELLATION_POLYGONS.filter((item) => item.kind === 'synthetic-bounds').length,
    metadata: CONSTELLATION_POLYGON_METADATA ?? null
  };
}
