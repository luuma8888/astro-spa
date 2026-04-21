import { buildChart } from '../js/domain/chartBuilder.js';
import { PRECISION_FIXTURES } from './precision-fixtures.js';
import { USNO_MOON_PHASES_BY_YEAR } from './moon-phase-reference-usno-1900-2100.js';

const THRESHOLDS = {
  sunRiseSetMinutes: 5,
  moonRiseSetMinutes: 20,
  illuminationPercent: 6,
  moonPhaseEventMinutes: 180,
  synodicCycleDaysMin: 29,
  synodicCycleDaysMax: 30.5,
  moonDistanceKmMin: 340000,
  moonDistanceKmMax: 410000,
  moonDiameterArcMinMin: 29,
  moonDiameterArcMinMax: 34
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

function boolCheck(key, actual, details = null) {
  return {
    key,
    actual: actual ? 'ok' : 'invalid',
    expected: 'ok',
    delta: actual ? 0 : 1,
    threshold: 0,
    unit: '',
    details
  };
}

function inRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function toUtcIsoFromUsnoEntry(entry) {
  if (!entry?.year || !entry?.month || !entry?.day || !entry?.time) return null;
  const [hours, minutes] = entry.time.split(':').map(Number);
  return new Date(Date.UTC(entry.year, entry.month - 1, entry.day, hours, minutes, 0)).toISOString();
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

function evaluateFixture(fixture) {
  const chart = buildChart(fixture.input, {});
  const previousNewMoon = chart.moonPhase?.previousNewMoon;
  const nextNewMoon = chart.moonPhase?.nextNewMoon;
  const previousMajorPhase = chart.moonPhase?.previousMajorPhase;
  const nextMajorPhase = chart.moonPhase?.nextMajorPhase;
  const previousMajorPhaseRef = findUsnoReferenceEvent(chart, previousMajorPhase, 'previous');
  const nextMajorPhaseRef = findUsnoReferenceEvent(chart, nextMajorPhase, 'next');
  const previousNewMoonRef = findUsnoReferenceEvent(chart, previousNewMoon, 'previous');
  const nextNewMoonRef = findUsnoReferenceEvent(chart, nextNewMoon, 'next');

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
    },
    boolCheck(
      'moon-phase-event-order',
      Number.isFinite(chart.context?.jd)
        && previousMajorPhase?.jd < chart.context.jd
        && nextMajorPhase?.jd > chart.context.jd,
      previousMajorPhase && nextMajorPhase
        ? `previous=${previousMajorPhase.label}@${previousMajorPhase.utcIso} next=${nextMajorPhase.label}@${nextMajorPhase.utcIso}`
        : 'missing major phase event'
    ),
    boolCheck(
      'moon-synodic-cycle-range',
      inRange(
        chart.moonPhase?.synodicCycleLengthDays,
        THRESHOLDS.synodicCycleDaysMin,
        THRESHOLDS.synodicCycleDaysMax
      ),
      `cycle=${chart.moonPhase?.synodicCycleLengthDays?.toFixed?.(4) ?? 'n/a'} days`
    ),
    boolCheck(
      'moon-true-age-range',
      Number.isFinite(chart.moonPhase?.trueAgeDays)
        && chart.moonPhase.trueAgeDays >= 0
        && chart.moonPhase.trueAgeDays <= (chart.moonPhase?.synodicCycleLengthDays ?? 35),
      `trueAge=${chart.moonPhase?.trueAgeDays?.toFixed?.(4) ?? 'n/a'}`
    ),
    boolCheck(
      'moon-distance-range',
      inRange(
        chart.moonPhase?.distanceKm,
        THRESHOLDS.moonDistanceKmMin,
        THRESHOLDS.moonDistanceKmMax
      ),
      `distance=${chart.moonPhase?.distanceKm?.toFixed?.(2) ?? 'n/a'} km`
    ),
    boolCheck(
      'moon-diameter-range',
      inRange(
        chart.moonPhase?.apparentAngularDiameterArcMin,
        THRESHOLDS.moonDiameterArcMinMin,
        THRESHOLDS.moonDiameterArcMinMax
      ),
      `diameter=${chart.moonPhase?.apparentAngularDiameterArcMin?.toFixed?.(4) ?? 'n/a'} arcmin`
    ),
    boolCheck(
      'moon-new-moon-bracketing',
      previousNewMoon?.jd < chart.context.jd
        && nextNewMoon?.jd > chart.context.jd
        && previousNewMoon?.label === 'Nouvelle Lune'
        && nextNewMoon?.label === 'Nouvelle Lune',
      previousNewMoon && nextNewMoon
        ? `prevNew=${previousNewMoon.utcIso} nextNew=${nextNewMoon.utcIso}`
        : 'missing new moon bracket'
    ),
    boolCheck(
      'moon-age-consistency',
      Number.isFinite(chart.moonPhase?.trueAgeDays)
        && Number.isFinite(chart.context?.jd)
        && Number.isFinite(previousNewMoon?.jd)
        && Math.abs(chart.moonPhase.trueAgeDays - (chart.context.jd - previousNewMoon.jd)) < 1e-6,
      `trueAge=${chart.moonPhase?.trueAgeDays?.toFixed?.(6) ?? 'n/a'} jdDiff=${(chart.context?.jd - (previousNewMoon?.jd ?? 0))?.toFixed?.(6) ?? 'n/a'}`
    ),
    {
      key: 'moon-previous-major-phase-usno',
      actual: previousMajorPhase?.utcIso ?? 'none',
      expected: previousMajorPhaseRef?.utcIso ?? 'none',
      delta: absoluteMinutesDiffFromIso(previousMajorPhase?.utcIso, previousMajorPhaseRef?.utcIso),
      threshold: THRESHOLDS.moonPhaseEventMinutes,
      unit: 'min',
      details: previousMajorPhase && previousMajorPhaseRef
        ? `${previousMajorPhase.label} vs ${previousMajorPhaseRef.phase}`
        : 'missing previous major phase reference'
    },
    {
      key: 'moon-next-major-phase-usno',
      actual: nextMajorPhase?.utcIso ?? 'none',
      expected: nextMajorPhaseRef?.utcIso ?? 'none',
      delta: absoluteMinutesDiffFromIso(nextMajorPhase?.utcIso, nextMajorPhaseRef?.utcIso),
      threshold: THRESHOLDS.moonPhaseEventMinutes,
      unit: 'min',
      details: nextMajorPhase && nextMajorPhaseRef
        ? `${nextMajorPhase.label} vs ${nextMajorPhaseRef.phase}`
        : 'missing next major phase reference'
    },
    {
      key: 'moon-previous-new-moon-usno',
      actual: previousNewMoon?.utcIso ?? 'none',
      expected: previousNewMoonRef?.utcIso ?? 'none',
      delta: absoluteMinutesDiffFromIso(previousNewMoon?.utcIso, previousNewMoonRef?.utcIso),
      threshold: THRESHOLDS.moonPhaseEventMinutes,
      unit: 'min',
      details: 'offline USNO reference 1900-2100'
    },
    {
      key: 'moon-next-new-moon-usno',
      actual: nextNewMoon?.utcIso ?? 'none',
      expected: nextNewMoonRef?.utcIso ?? 'none',
      delta: absoluteMinutesDiffFromIso(nextNewMoon?.utcIso, nextNewMoonRef?.utcIso),
      threshold: THRESHOLDS.moonPhaseEventMinutes,
      unit: 'min',
      details: 'offline USNO reference 1900-2100'
    }
  ];

  const ok = checks.every((check) => check.delta != null && check.delta <= check.threshold);
  return { chart, checks, ok };
}

function printCheck(fixture, check) {
  const status = check.delta != null && check.delta <= check.threshold ? 'OK' : 'FAIL';
  console.log(
    `${status} ${fixture.id} ${check.key} | actual=${check.actual ?? 'none'} expected=${check.expected ?? 'none'} delta=${check.delta?.toFixed?.(2) ?? 'n/a'} ${check.unit} threshold=${check.threshold}${check.details ? ` details=${check.details}` : ''}`
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
