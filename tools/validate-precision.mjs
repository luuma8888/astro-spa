import { buildChart } from '../js/domain/chartBuilder.js';
import { PRECISION_FIXTURES } from './precision-fixtures.js';

const THRESHOLDS = {
  sunRiseSetMinutes: 5,
  moonRiseSetMinutes: 20,
  illuminationPercent: 6
};

function timeStringToMinutes(time) {
  if (!time) return null;
  const [hours, minutes, seconds = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes) + Number(seconds) / 60;
}

function circularMinutesDiff(a, b) {
  if (a == null && b == null) return 0;
  const aMinutes = timeStringToMinutes(a);
  const bMinutes = timeStringToMinutes(b);
  if (aMinutes == null || bMinutes == null) return null;

  const raw = Math.abs(aMinutes - bMinutes);
  return Math.min(raw, 1440 - raw);
}

function evaluateFixture(fixture) {
  const chart = buildChart(fixture.input, {});

  const checks = [
    {
      key: 'sunrise',
      actual: chart.riseSet.sun?.rise,
      expected: fixture.reference.sunRiseLocal == null ? null : `${fixture.reference.sunRiseLocal}:00`,
      delta: circularMinutesDiff(
        chart.riseSet.sun?.rise,
        fixture.reference.sunRiseLocal == null ? null : `${fixture.reference.sunRiseLocal}:00`
      ),
      threshold: THRESHOLDS.sunRiseSetMinutes,
      unit: 'min'
    },
    {
      key: 'sunset',
      actual: chart.riseSet.sun?.set,
      expected: fixture.reference.sunSetLocal == null ? null : `${fixture.reference.sunSetLocal}:00`,
      delta: circularMinutesDiff(
        chart.riseSet.sun?.set,
        fixture.reference.sunSetLocal == null ? null : `${fixture.reference.sunSetLocal}:00`
      ),
      threshold: THRESHOLDS.sunRiseSetMinutes,
      unit: 'min'
    },
    {
      key: 'moonrise',
      actual: chart.riseSet.moon?.rise,
      expected: fixture.reference.moonRiseLocal == null ? null : `${fixture.reference.moonRiseLocal}:00`,
      delta: circularMinutesDiff(
        chart.riseSet.moon?.rise,
        fixture.reference.moonRiseLocal == null ? null : `${fixture.reference.moonRiseLocal}:00`
      ),
      threshold: THRESHOLDS.moonRiseSetMinutes,
      unit: 'min'
    },
    {
      key: 'moonset',
      actual: chart.riseSet.moon?.set,
      expected: fixture.reference.moonSetLocal == null ? null : `${fixture.reference.moonSetLocal}:00`,
      delta: circularMinutesDiff(
        chart.riseSet.moon?.set,
        fixture.reference.moonSetLocal == null ? null : `${fixture.reference.moonSetLocal}:00`
      ),
      threshold: THRESHOLDS.moonRiseSetMinutes,
      unit: 'min'
    },
    {
      key: 'illumination',
      actual: Number(chart.moonPhase?.illuminationPercent?.toFixed(2)),
      expected: fixture.reference.illuminationPercent,
      delta: Math.abs(chart.moonPhase.illuminationPercent - fixture.reference.illuminationPercent),
      threshold: THRESHOLDS.illuminationPercent,
      unit: '%'
    }
  ];

  const ok = checks.every((check) => check.delta != null && check.delta <= check.threshold);
  return { chart, checks, ok };
}

function printCheck(fixture, check) {
  const status = check.delta != null && check.delta <= check.threshold ? 'OK' : 'FAIL';
  console.log(
    `${status} ${fixture.id} ${check.key} | actual=${check.actual ?? 'none'} expected=${check.expected ?? 'none'} delta=${check.delta?.toFixed?.(2) ?? 'n/a'} ${check.unit} threshold=${check.threshold}`
  );
}

let failureCount = 0;

console.log('Validation de precision Soleil/Lune');
console.log(`Fixtures: ${PRECISION_FIXTURES.length}`);
console.log('');

for (const fixture of PRECISION_FIXTURES) {
  const result = evaluateFixture(fixture);
  console.log(`${fixture.id} - ${fixture.label}`);
  console.log(`source: ${fixture.source}`);

  for (const check of result.checks) {
    printCheck(fixture, check);
    if (!(check.delta != null && check.delta <= check.threshold)) {
      failureCount += 1;
    }
  }

  console.log('');
}

if (failureCount > 0) {
  console.error(`Validation echouee: ${failureCount} verification(s) hors seuil.`);
  process.exit(1);
}

console.log('Validation reussie: toutes les verifications sont dans les seuils.');
