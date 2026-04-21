import { CONSTELLATIONS_OPTIMIZED } from '../data/constellationsOptimized.js';
import { CONSTELLATION_POLYGONS } from '../data/constellationsPolygons.js';

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
        source: 'polygon'
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

export function getConstellationByRaDec(raDeg, decDeg) {
  const polygonMatch = getConstellationByPolygon(raDeg, decDeg);
  if (polygonMatch) return polygonMatch;

  return getConstellationByOptimizedFallback(raDeg, decDeg);
}
