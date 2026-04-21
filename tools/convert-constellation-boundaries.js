import fs from 'node:fs';
import path from 'node:path';

const INPUT_JSON = path.resolve('tools/raw-constellation-boundaries.json');
const INPUT_TXT = path.resolve('tools/raw-constellation-boundaries.txt');
const OUTPUT_JS = path.resolve('js/data/constellationsPolygons.js');

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
}

function normalizeRa(ra) {
  let value = Number(ra);
  value %= 360;
  if (value < 0) value += 360;
  return value;
}

function normalizeDec(dec) {
  return Number(dec);
}

function parseJsonInput(rawText) {
  const parsed = JSON.parse(rawText);

  if (!Array.isArray(parsed)) {
    throw new Error('Le fichier JSON doit contenir un tableau.');
  }

  return parsed.map((item) => ({
    abbr: item.abbr,
    name: item.name,
    polygons: (item.polygons ?? []).map((poly) =>
      poly.map((point) => ({
        ra: normalizeRa(point.ra),
        dec: normalizeDec(point.dec)
      }))
    )
  }));
}

function parseDelimitedTextInput(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const map = new Map();

  for (const line of lines) {
    const parts = line.split('|').map((part) => part.trim());

    if (parts.length !== 5) {
      throw new Error(`Ligne invalide: ${line}`);
    }

    const [abbr, name, polygonIndexRaw, raRaw, decRaw] = parts;
    const polygonIndex = Number(polygonIndexRaw);
    const ra = normalizeRa(raRaw);
    const dec = normalizeDec(decRaw);

    if (!map.has(abbr)) {
      map.set(abbr, {
        abbr,
        name,
        polygons: []
      });
    }

    const entry = map.get(abbr);

    if (!entry.polygons[polygonIndex]) {
      entry.polygons[polygonIndex] = [];
    }

    entry.polygons[polygonIndex].push({ ra, dec });
  }

  return [...map.values()].map((item) => ({
    abbr: item.abbr,
    name: item.name,
    polygons: item.polygons.filter(Boolean)
  }));
}

function validatePolygons(items) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Aucune constellation détectée.');
  }

  for (const item of items) {
    if (!item.abbr || !item.name) {
      throw new Error('Constellation invalide: abbr ou name manquant.');
    }

    if (!Array.isArray(item.polygons) || !item.polygons.length) {
      throw new Error(`Aucun polygone pour ${item.abbr}`);
    }

    for (const poly of item.polygons) {
      if (!Array.isArray(poly) || poly.length < 3) {
        throw new Error(`Polygone invalide pour ${item.abbr}`);
      }

      for (const point of poly) {
        if (typeof point.ra !== 'number' || Number.isNaN(point.ra)) {
          throw new Error(`RA invalide pour ${item.abbr}`);
        }

        if (typeof point.dec !== 'number' || Number.isNaN(point.dec)) {
          throw new Error(`DEC invalide pour ${item.abbr}`);
        }

        if (point.ra < 0 || point.ra >= 360) {
          throw new Error(`RA hors bornes pour ${item.abbr}`);
        }

        if (point.dec < -90 || point.dec > 90) {
          throw new Error(`DEC hors bornes pour ${item.abbr}`);
        }
      }
    }
  }
}

function sortConstellations(items) {
  return [...items].sort((a, b) => a.abbr.localeCompare(b.abbr));
}

function toJsModule(data) {
  return `export const CONSTELLATION_POLYGONS = ${JSON.stringify(data, null, 2)};\n`;
}

function ensureOutputDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadSourceData() {
  const rawJson = readIfExists(INPUT_JSON);
  if (rawJson) {
    console.log(`Lecture du JSON source: ${INPUT_JSON}`);
    return parseJsonInput(rawJson);
  }

  const rawTxt = readIfExists(INPUT_TXT);
  if (rawTxt) {
    console.log(`Lecture du TXT source: ${INPUT_TXT}`);
    return parseDelimitedTextInput(rawTxt);
  }

  throw new Error(`Aucune source trouvée. Ajoute soit ${INPUT_JSON}, soit ${INPUT_TXT}`);
}

function main() {
  const data = loadSourceData();
  validatePolygons(data);
  const sorted = sortConstellations(data);
  const output = toJsModule(sorted);

  ensureOutputDirectory(OUTPUT_JS);
  fs.writeFileSync(OUTPUT_JS, output, 'utf-8');

  console.log(`Fichier généré: ${OUTPUT_JS}`);
  console.log(`Constellations exportées: ${sorted.length}`);
}

main();
