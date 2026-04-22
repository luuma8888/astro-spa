import fs from 'node:fs';
import path from 'node:path';
import { CONSTELLATIONS_OPTIMIZED } from '../js/data/constellationsOptimized.js';

const OUTPUT_JSON = path.resolve('tools/raw-constellation-boundaries.json');
const MAX_RA = 359.999999;

function polygonFromBounds(item, raStart, raEnd) {
  return [
    { ra: raStart, dec: item.decMin },
    { ra: raEnd, dec: item.decMin },
    { ra: raEnd, dec: item.decMax },
    { ra: raStart, dec: item.decMax }
  ];
}

function polygonsFromBounds(item) {
  if (item.raMin === 0 && item.raMax === 360) {
    return [polygonFromBounds(item, 0, MAX_RA)];
  }

  if (item.raMin <= item.raMax) {
    const safeEnd = item.raMax === 360 ? MAX_RA : item.raMax;
    return [polygonFromBounds(item, item.raMin, safeEnd)];
  }

  return [
    polygonFromBounds(item, item.raMin, MAX_RA),
    polygonFromBounds(item, 0, item.raMax)
  ];
}

function buildSyntheticDataset() {
  return CONSTELLATIONS_OPTIMIZED.map((item) => ({
    abbr: item.abbr,
    name: item.name,
    kind: 'synthetic-bounds',
    notes: 'Genere automatiquement a partir des bornes du dataset optimise; ne represente pas les frontieres IAU exactes.',
    polygons: polygonsFromBounds(item)
  }));
}

function main() {
  const dataset = buildSyntheticDataset();
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(dataset, null, 2)}\n`, 'utf-8');

  console.log(`Fichier genere: ${OUTPUT_JSON}`);
  console.log(`Constellations generees: ${dataset.length}`);
}

main();
