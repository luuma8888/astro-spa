import { buildChart } from '../js/domain/chartBuilder.js';
import { USNO_MOON_PHASES_BY_YEAR } from './moon-phase-reference-usno-1900-2100.js';

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    args[key] = value;
    i += 1;
  }

  return args;
}

function phaseLabelToUsnoName(label) {
  const map = {
    'Nouvelle Lune': 'New Moon',
    'Premier quartier': 'First Quarter',
    'Pleine Lune': 'Full Moon',
    'Dernier quartier': 'Last Quarter'
  };

  return map[label] ?? null;
}

function toUtcIsoFromUsnoEntry(entry) {
  if (!entry?.year || !entry?.month || !entry?.day || !entry?.time) return null;
  const [hours, minutes] = entry.time.split(':').map(Number);
  return new Date(Date.UTC(entry.year, entry.month - 1, entry.day, hours, minutes, 0)).toISOString();
}

function getUsnoEntriesForYearWindow(year) {
  return [
    ...(USNO_MOON_PHASES_BY_YEAR[String(year - 1)] ?? []),
    ...(USNO_MOON_PHASES_BY_YEAR[String(year)] ?? []),
    ...(USNO_MOON_PHASES_BY_YEAR[String(year + 1)] ?? [])
  ];
}

function findUsnoReferenceEvent(chart, targetEvent, direction) {
  if (!targetEvent?.label || !chart?.context?.utcIso) return null;

  const year = new Date(chart.context.utcIso).getUTCFullYear();
  const usnoPhaseName = phaseLabelToUsnoName(targetEvent.label);
  if (!usnoPhaseName) return null;

  const chartMillis = new Date(chart.context.utcIso).getTime();
  const candidates = getUsnoEntriesForYearWindow(year)
    .filter((entry) => entry.phase === usnoPhaseName)
    .map((entry) => ({
      ...entry,
      utcIso: toUtcIsoFromUsnoEntry(entry),
      millis: new Date(toUtcIsoFromUsnoEntry(entry)).getTime()
    }))
    .filter((entry) => Number.isFinite(entry.millis));

  if (direction === 'previous') {
    return candidates.filter((entry) => entry.millis <= chartMillis).sort((a, b) => b.millis - a.millis)[0] ?? null;
  }

  return candidates.filter((entry) => entry.millis >= chartMillis).sort((a, b) => a.millis - b.millis)[0] ?? null;
}

function absoluteMinutesDiffFromIso(actualIso, expectedIso) {
  if (!actualIso || !expectedIso) return null;
  const actual = new Date(actualIso).getTime();
  const expected = new Date(expectedIso).getTime();
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return null;
  return Math.abs(actual - expected) / 60000;
}

function printComparison(title, actualEvent, referenceEvent) {
  const deltaMinutes = absoluteMinutesDiffFromIso(actualEvent?.utcIso, referenceEvent?.utcIso);
  console.log(title);
  console.log(`  calcule   : ${actualEvent?.label ?? 'n/a'} @ ${actualEvent?.utcIso ?? 'n/a'}`);
  console.log(`  reference : ${referenceEvent?.phase ?? 'n/a'} @ ${referenceEvent?.utcIso ?? 'n/a'}`);
  console.log(`  ecart     : ${deltaMinutes != null ? `${deltaMinutes.toFixed(2)} min` : 'n/a'}`);
}

const args = parseArgs(process.argv.slice(2));

if (!args.date) {
  console.error('Usage: node ./tools/diagnose-moon-phase.mjs --date YYYY-MM-DD [--time HH:MM:SS] [--latitude N] [--longitude E] [--utcOffset H]');
  process.exit(1);
}

const input = {
  date: args.date,
  time: args.time ?? '12:00:00',
  latitude: Number(args.latitude ?? 0),
  longitude: Number(args.longitude ?? 0),
  utcOffset: Number(args.utcOffset ?? 0)
};

const chart = buildChart(input, {});
const previousMajorPhaseRef = findUsnoReferenceEvent(chart, chart.moonPhase?.previousMajorPhase, 'previous');
const nextMajorPhaseRef = findUsnoReferenceEvent(chart, chart.moonPhase?.nextMajorPhase, 'next');
const previousNewMoonRef = findUsnoReferenceEvent(chart, chart.moonPhase?.previousNewMoon, 'previous');
const nextNewMoonRef = findUsnoReferenceEvent(chart, chart.moonPhase?.nextNewMoon, 'next');

console.log('Diagnostic phase lunaire');
console.log(`date locale : ${input.date} ${input.time} UTC${input.utcOffset >= 0 ? '+' : ''}${input.utcOffset}`);
console.log(`reference UTC carte : ${chart.context.utcIso}`);
console.log('');
console.log(`phase : ${chart.moonPhase?.presentation?.labelText ?? chart.moonPhase?.label ?? 'n/a'}`);
console.log(`illumination : ${chart.moonPhase?.presentation?.illuminationText ?? 'n/a'}`);
console.log(`age reel : ${chart.moonPhase?.presentation?.trueAgeText ?? 'n/a'}`);
console.log(`distance : ${chart.moonPhase?.presentation?.distanceText ?? 'n/a'}`);
console.log(`diametre apparent : ${chart.moonPhase?.presentation?.apparentDiameterText ?? 'n/a'}`);
console.log('');

printComparison('Phase majeure precedente', chart.moonPhase?.previousMajorPhase, previousMajorPhaseRef);
printComparison('Phase majeure suivante', chart.moonPhase?.nextMajorPhase, nextMajorPhaseRef);
printComparison('Nouvelle Lune precedente', chart.moonPhase?.previousNewMoon, previousNewMoonRef);
printComparison('Nouvelle Lune suivante', chart.moonPhase?.nextNewMoon, nextNewMoonRef);
