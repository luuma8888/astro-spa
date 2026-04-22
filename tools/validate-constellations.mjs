import { CONSTELLATION_POLYGON_METADATA, CONSTELLATION_POLYGONS } from '../js/data/constellationsPolygons.js';
import { CONSTELLATIONS_OPTIMIZED } from '../js/data/constellationsOptimized.js';
import {
  CONSTELLATION_ROMAN87_METADATA,
  CONSTELLATION_ROMAN87_NAMES,
  CONSTELLATION_ROMAN87_ROWS
} from '../js/data/constellationsRoman87.js';

function fail(message) {
  console.error(`ECHEC ${message}`);
  process.exitCode = 1;
}

function validatePolygonDataset() {
  if (!Array.isArray(CONSTELLATION_POLYGONS) || !CONSTELLATION_POLYGONS.length) {
    fail('dataset polygonal vide.');
    return;
  }

  const seen = new Set();
  let polygonCount = 0;
  let pointCount = 0;
  const kindCounts = {};

  for (const constellation of CONSTELLATION_POLYGONS) {
    if (!constellation?.abbr || !constellation?.name) {
      fail('constellation sans abbr ou name.');
      continue;
    }

    if (seen.has(constellation.abbr)) {
      fail(`doublon de constellation: ${constellation.abbr}`);
    }
    seen.add(constellation.abbr);
    const kind = constellation.kind ?? 'exact';
    kindCounts[kind] = (kindCounts[kind] ?? 0) + 1;

    if (!Array.isArray(constellation.polygons) || !constellation.polygons.length) {
      fail(`aucun polygone pour ${constellation.abbr}`);
      continue;
    }

    polygonCount += constellation.polygons.length;

    for (const polygon of constellation.polygons) {
      if (!Array.isArray(polygon) || polygon.length < 3) {
        fail(`polygone invalide pour ${constellation.abbr}`);
        continue;
      }

      pointCount += polygon.length;

      for (const point of polygon) {
        if (!Number.isFinite(point?.ra) || point.ra < 0 || point.ra >= 360) {
          fail(`RA invalide pour ${constellation.abbr}`);
        }

        if (!Number.isFinite(point?.dec) || point.dec < -90 || point.dec > 90) {
          fail(`DEC invalide pour ${constellation.abbr}`);
        }
      }
    }
  }

  if (CONSTELLATION_POLYGON_METADATA?.constellationCount !== CONSTELLATION_POLYGONS.length) {
    fail('metadata.constellationCount incoherent.');
  }

  if (CONSTELLATION_POLYGON_METADATA?.polygonCount !== polygonCount) {
    fail('metadata.polygonCount incoherent.');
  }

  if (CONSTELLATION_POLYGON_METADATA?.pointCount !== pointCount) {
    fail('metadata.pointCount incoherent.');
  }

  const expectedKindCounts = CONSTELLATION_POLYGON_METADATA?.kindCounts ?? {};
  const expectedKindKeys = Object.keys(expectedKindCounts).sort();
  const actualKindKeys = Object.keys(kindCounts).sort();
  if (expectedKindKeys.join('|') !== actualKindKeys.join('|')) {
    fail('metadata.kindCounts incoherent.');
  }
  for (const key of actualKindKeys) {
    if (expectedKindCounts[key] !== kindCounts[key]) {
      fail(`metadata.kindCounts incoherent pour ${key}.`);
    }
  }

  const optimizedAbbrs = new Set(CONSTELLATIONS_OPTIMIZED.map((item) => item.abbr));
  const polygonAbbrs = new Set(CONSTELLATION_POLYGONS.map((item) => item.abbr));
  const missing = [...optimizedAbbrs].filter((abbr) => !polygonAbbrs.has(abbr)).sort();
  const coverageRatio = CONSTELLATION_POLYGONS.length / CONSTELLATIONS_OPTIMIZED.length;
  const roman87Abbrs = new Set(CONSTELLATION_ROMAN87_ROWS.map((item) => item.abbr));

  if (CONSTELLATION_ROMAN87_METADATA?.rowCount !== CONSTELLATION_ROMAN87_ROWS.length) {
    fail('metadata.rowCount Roman87 incoherent.');
  }

  if (CONSTELLATION_ROMAN87_METADATA?.nameCount !== Object.keys(CONSTELLATION_ROMAN87_NAMES).length) {
    fail('metadata.nameCount Roman87 incoherent.');
  }

  for (const abbr of roman87Abbrs) {
    if (!CONSTELLATION_ROMAN87_NAMES[abbr]) {
      fail(`nom Roman87 manquant pour ${abbr}.`);
    }
  }

  console.log('Validation dataset constellations');
  console.log(`Optimized: ${CONSTELLATIONS_OPTIMIZED.length}`);
  console.log(`Roman87 rows: ${CONSTELLATION_ROMAN87_ROWS.length}`);
  console.log(`Roman87 names: ${Object.keys(CONSTELLATION_ROMAN87_NAMES).length}`);
  console.log(`Polygonal: ${CONSTELLATION_POLYGONS.length}`);
  console.log(`Polygons: ${polygonCount}`);
  console.log(`Points: ${pointCount}`);
  console.log(`Coverage: ${(coverageRatio * 100).toFixed(1)}%`);
  console.log(`Kinds: ${Object.entries(kindCounts).map(([key, count]) => `${key}=${count}`).join(', ')}`);

  if (missing.length) {
    console.log(`Missing polygon entries (${missing.length}): ${missing.join(', ')}`);
  } else {
    console.log('Missing polygon entries: none');
  }

  if (!process.exitCode) {
    console.log('Validation reussie: structure coherent.');
  }
}

validatePolygonDataset();
