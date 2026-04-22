import fs from 'node:fs';
import path from 'node:path';

const INPUT_ROWS = path.resolve('tools/constellation_data_roman87.dat');
const INPUT_NAMES = path.resolve('tools/constellation_names.dat');
const OUTPUT_JS = path.resolve('js/data/constellationsRoman87.js');

function parseRows(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const parts = line.split(/\s+/);
      if (parts.length !== 4) {
        throw new Error(`Ligne Roman87 invalide: ${line}`);
      }

      const [raMinHours, raMaxHours, decMinDeg, abbr] = parts;
      return {
        raMinHours: Number(raMinHours),
        raMaxHours: Number(raMaxHours),
        decMinDeg: Number(decMinDeg),
        abbr
      };
    });
}

function parseNames(rawText) {
  return Object.fromEntries(
    rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [abbr, ...nameParts] = line.split(/\s+/);
        return [abbr, nameParts.join(' ')];
      })
  );
}

function toJsModule(rows, names) {
  const metadata = {
    rowCount: rows.length,
    nameCount: Object.keys(names).length,
    source: 'Roman 1987 via Astropy'
  };

  return [
    `export const CONSTELLATION_ROMAN87_METADATA = ${JSON.stringify(metadata, null, 2)};`,
    `export const CONSTELLATION_ROMAN87_ROWS = ${JSON.stringify(rows, null, 2)};`,
    `export const CONSTELLATION_ROMAN87_NAMES = ${JSON.stringify(names, null, 2)};`,
    ''
  ].join('\n');
}

function main() {
  const rows = parseRows(fs.readFileSync(INPUT_ROWS, 'utf-8'));
  const names = parseNames(fs.readFileSync(INPUT_NAMES, 'utf-8'));

  fs.mkdirSync(path.dirname(OUTPUT_JS), { recursive: true });
  fs.writeFileSync(OUTPUT_JS, toJsModule(rows, names), 'utf-8');

  console.log(`Fichier genere: ${OUTPUT_JS}`);
  console.log(`Lignes Roman87: ${rows.length}`);
  console.log(`Noms de constellations: ${Object.keys(names).length}`);
}

main();
