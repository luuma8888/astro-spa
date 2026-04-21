import { USNO_MOON_PHASES_BY_YEAR } from '../../tools/moon-phase-reference-usno-1900-2100.js';

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

function renderComparison(title, actualEvent, referenceEvent) {
  const delta = absoluteMinutesDiffFromIso(actualEvent?.utcIso, referenceEvent?.utcIso);

  return `
    <div class="moon-diagnostic-block">
      <h3>${title}</h3>
      <p><strong>Calculé</strong> : ${actualEvent?.label ?? 'n/a'} — ${actualEvent?.utcIso ?? 'n/a'}</p>
      <p><strong>Référence USNO</strong> : ${referenceEvent?.phase ?? 'n/a'} — ${referenceEvent?.utcIso ?? 'n/a'}</p>
      <p><strong>Écart</strong> : ${delta != null ? `${delta.toFixed(2)} min` : 'n/a'}</p>
    </div>
  `;
}

export function renderMoonDiagnostics(chart) {
  const el = document.getElementById('moon-diagnostics');
  if (!el) return;

  if (!chart?.moonPhase || !chart?.context?.utcIso) {
    el.innerHTML = '<p>Le diagnostic lunaire apparaîtra après le calcul d’une carte.</p>';
    return;
  }

  const previousMajorPhaseRef = findUsnoReferenceEvent(chart, chart.moonPhase.previousMajorPhase, 'previous');
  const nextMajorPhaseRef = findUsnoReferenceEvent(chart, chart.moonPhase.nextMajorPhase, 'next');
  const previousNewMoonRef = findUsnoReferenceEvent(chart, chart.moonPhase.previousNewMoon, 'previous');
  const nextNewMoonRef = findUsnoReferenceEvent(chart, chart.moonPhase.nextNewMoon, 'next');

  el.innerHTML = `
    <p><strong>Repère :</strong> ce panneau compare les phases lunaires calculées localement à la référence officielle USNO embarquée hors ligne pour la plage 1900-2100.</p>
    ${renderComparison('Phase majeure précédente', chart.moonPhase.previousMajorPhase, previousMajorPhaseRef)}
    ${renderComparison('Phase majeure suivante', chart.moonPhase.nextMajorPhase, nextMajorPhaseRef)}
    ${renderComparison('Nouvelle Lune précédente', chart.moonPhase.previousNewMoon, previousNewMoonRef)}
    ${renderComparison('Nouvelle Lune suivante', chart.moonPhase.nextNewMoon, nextNewMoonRef)}
  `;
}
