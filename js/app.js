import { buildChart } from './domain/chartBuilder.js';
import { buildTransitComparison } from './domain/transits.js';
import { validateInput } from './domain/validators.js';
import { loadChart, saveChart } from './storage/localDb.js';
import { exportJson, importJsonFile } from './storage/exportImport.js';
import { loadSettings, saveSettings } from './storage/settings.js';
import { renderSummary } from './ui/renderSummary.js';
import { renderClarifications } from './ui/renderClarifications.js';
import { renderCalculationGroups } from './ui/renderCalculationGroups.js';
import { renderBodies } from './ui/renderBodies.js';
import { renderHouses } from './ui/renderHouses.js';
import { renderSymbolic } from './ui/renderSymbolic.js';
import { renderAspects } from './ui/renderAspects.js';
import { renderMoonPhase } from './ui/renderMoonPhase.js';
import { renderMoonDiagnostics } from './ui/renderMoonDiagnostics.js';
import { renderRiseSet } from './ui/renderRiseSet.js';
import { renderChartWheel } from './ui/renderChartWheel.js';
import { renderTransits } from './ui/renderTransits.js';
import { renderSynthesis } from './ui/renderSynthesis.js';
import { initDashboardShell } from './ui/shell.js';
import { uiState } from './ui/state.js';

const MAIN_FORM_DRAFT_KEY = 'astro-app-main-form-draft';
const TRANSIT_FORM_DRAFT_KEY = 'astro-app-transit-form-draft';
const STORAGE_TEST_KEY = 'astro-app-storage-test';
const PROFILE_PRESETS = {
  western: {
    houseSystem: 'porphyry',
    ayanamsa: 'lahiri',
    description: 'Pour un thème astral occidental classique: lecture surtout tropicale, maisons actives, ayanamsa peu central.'
  },
  vedic: {
    houseSystem: 'whole-sign',
    ayanamsa: 'lahiri',
    description: 'Pour une lecture védique / sidérale: Whole Sign + Lahiri est le point de départ le plus naturel dans cette app.'
  },
  'human-design': {
    houseSystem: 'equal',
    ayanamsa: 'lahiri',
    description: 'Utile si tu veux surtout récupérer des positions et cycles. Ce n’est pas un bodygraph complet, mais les repères célestes sont plus faciles à lire.'
  },
  astronomy: {
    houseSystem: 'equal',
    ayanamsa: 'lahiri',
    description: 'Si tu veux avant tout des données astronomiques: les maisons et l’ayanamsa deviennent secondaires, l’important est date, heure, lieu et UTC.'
  }
};

const HOUSE_SYSTEM_HELP = {
  porphyry: 'Bon compromis pour une lecture de thème occidental: découpe dynamique à partir des angles.',
  equal: 'Chaque maison couvre 30°. Plus simple à lire et utile pour une vue repère ou comparative.',
  'whole-sign': 'Chaque signe devient une maison entière. Souvent privilégié dans les lectures sidérales / védiques.'
};

const AYANAMSA_HELP = {
  lahiri: 'Référence la plus courante pour une lecture sidérale védique.',
  faganBradley: 'Option sidérale occidentale classique si tu veux comparer une autre tradition.',
  krishnamurti: 'Variante utilisée dans certaines écoles KP / védique spécialisées.'
};

const CITY_PRESETS = {
  paris: { label: 'Paris', latitude: 48.8566, longitude: 2.3522, utcOffset: 1, timeZone: 'Europe/Paris' },
  lyon: { label: 'Lyon', latitude: 45.764, longitude: 4.8357, utcOffset: 1, timeZone: 'Europe/Paris' },
  marseille: { label: 'Marseille', latitude: 43.2965, longitude: 5.3698, utcOffset: 1, timeZone: 'Europe/Paris' },
  bruxelles: { label: 'Bruxelles', latitude: 50.8503, longitude: 4.3517, utcOffset: 1, timeZone: 'Europe/Brussels' },
  geneve: { label: 'Genève', latitude: 46.2044, longitude: 6.1432, utcOffset: 1, timeZone: 'Europe/Zurich' },
  montreal: { label: 'Montréal', latitude: 45.5017, longitude: -73.5673, utcOffset: -5, timeZone: 'America/Toronto' },
  'new-york': { label: 'New York', latitude: 40.7128, longitude: -74.006, utcOffset: -5, timeZone: 'America/New_York' },
  londres: { label: 'Londres', latitude: 51.5072, longitude: -0.1276, utcOffset: 0, timeZone: 'Europe/London' },
  tokyo: { label: 'Tokyo', latitude: 35.6762, longitude: 139.6503, utcOffset: 9, timeZone: 'Asia/Tokyo' }
};

const TIMEZONE_OPTIONS = [
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu - Hawaii' },
  { value: 'America/Anchorage', label: 'America/Anchorage - Alaska' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles - Pacific Time' },
  { value: 'America/Denver', label: 'America/Denver - Mountain Time' },
  { value: 'America/Chicago', label: 'America/Chicago - Central Time' },
  { value: 'America/New_York', label: 'America/New_York - Eastern Time' },
  { value: 'America/Toronto', label: 'America/Toronto - Eastern Canada' },
  { value: 'America/Santiago', label: 'America/Santiago - Chili' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo - Brésil' },
  { value: 'Europe/London', label: 'Europe/London - Londres' },
  { value: 'Europe/Dublin', label: 'Europe/Dublin - Dublin' },
  { value: 'Europe/Paris', label: 'Europe/Paris - Paris, Lyon, Marseille' },
  { value: 'Europe/Brussels', label: 'Europe/Brussels - Bruxelles' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich - Genève' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin - Berlin' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid - Madrid' },
  { value: 'Europe/Athens', label: 'Europe/Athens - Athènes' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow - Moscou' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo - Le Caire' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai - Dubaï' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi - Karachi' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata - Inde' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu - Katmandou' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok - Bangkok' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong - Hong Kong' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo - Tokyo' },
  { value: 'Australia/Adelaide', label: 'Australia/Adelaide - Adelaide' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney - Sydney' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland - Auckland' }
];

const UTC_TIMEZONE_OPTIONS = [
  { value: -12, label: '(UTC-12:00) International Date Line West' },
  { value: -11, label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: -10, label: '(UTC-10:00) Hawaii' },
  { value: -9, label: '(UTC-09:00) Alaska' },
  { value: -8, label: '(UTC-08:00) Pacific Time (US & Canada) - hiver' },
  { value: -7, label: '(UTC-07:00) Pacific Time (US & Canada) - été' },
  { value: -7, label: '(UTC-07:00) Arizona' },
  { value: -6, label: '(UTC-06:00) Central America' },
  { value: -6, label: '(UTC-06:00) Central Time (US & Canada) - hiver' },
  { value: -5, label: '(UTC-05:00) Central Time (US & Canada) - été' },
  { value: -5, label: '(UTC-05:00) Bogota, Lima, Quito' },
  { value: -5, label: '(UTC-05:00) Eastern Time (US & Canada) - hiver' },
  { value: -4, label: '(UTC-04:00) Eastern Time (US & Canada) - été' },
  { value: -4.5, label: '(UTC-04:30) Caracas' },
  { value: -4, label: '(UTC-04:00) Santiago' },
  { value: -3.5, label: '(UTC-03:30) Newfoundland' },
  { value: -3, label: '(UTC-03:00) Brasilia, Buenos Aires' },
  { value: -1, label: '(UTC-01:00) Azores' },
  { value: 0, label: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London - hiver' },
  { value: 1, label: '(UTC+01:00) Dublin, Edinburgh, Lisbon, London - été' },
  { value: 1, label: '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris - hiver' },
  { value: 2, label: '(UTC+02:00) Brussels, Copenhagen, Madrid, Paris - été' },
  { value: 1, label: '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna - hiver' },
  { value: 2, label: '(UTC+02:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna - été' },
  { value: 2, label: '(UTC+02:00) Athens, Bucharest, Cairo' },
  { value: 3, label: '(UTC+03:00) Moscow, St. Petersburg, Nairobi' },
  { value: 3.5, label: '(UTC+03:30) Tehran' },
  { value: 4, label: '(UTC+04:00) Abu Dhabi, Muscat' },
  { value: 4.5, label: '(UTC+04:30) Kabul' },
  { value: 5, label: '(UTC+05:00) Islamabad, Karachi, Tashkent' },
  { value: 5.5, label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { value: 5.75, label: '(UTC+05:45) Kathmandu' },
  { value: 6, label: '(UTC+06:00) Astana, Dhaka' },
  { value: 6.5, label: '(UTC+06:30) Yangon' },
  { value: 7, label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 8, label: '(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
  { value: 8, label: '(UTC+08:00) Perth' },
  { value: 9, label: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
  { value: 9.5, label: '(UTC+09:30) Adelaide, Darwin' },
  { value: 10, label: '(UTC+10:00) Brisbane' },
  { value: 10, label: '(UTC+10:00) Canberra, Melbourne, Sydney - hiver' },
  { value: 11, label: '(UTC+11:00) Canberra, Melbourne, Sydney - été' },
  { value: 12, label: '(UTC+12:00) Auckland, Wellington - hiver' },
  { value: 13, label: '(UTC+13:00) Auckland, Wellington - été' }
];

function getMainFormInput(form) {
  const formData = new FormData(form);

  return {
    input: {
      date: formData.get('date'),
      time: formData.get('time'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      timeZone: getTimeZoneValue(form),
      utcOffset: getUtcOffsetValue(form)
    },
    options: {
      houseSystem: formData.get('houseSystem') || 'porphyry',
      ayanamsa: formData.get('ayanamsa') || 'lahiri'
    }
  };
}

function normalizeSynthesisLevel(value) {
  return ['short', 'medium', 'long'].includes(value) ? value : 'medium';
}

function getTransitFormInput(form) {
  const formData = new FormData(form);

  return {
    date: formData.get('date'),
    time: formData.get('time'),
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    timeZone: getTimeZoneValue(form),
    utcOffset: getUtcOffsetValue(form)
  };
}

function populateForm(form, input) {
  if (!input) return;

  form.elements.date.value = input.date ?? '';
  form.elements.time.value = input.time ?? '';
  form.elements.latitude.value = input.latitude ?? '';
  form.elements.longitude.value = input.longitude ?? '';
  setTimeZoneValue(form, input.timeZone ?? guessTimeZoneFromOffset(input.utcOffset ?? 0));
  syncUtcOffsetFromTimeZone(form);
}

function setProjectOptions(form, options) {
  if (!form || !options) return;
  if (form.elements.houseSystem) form.elements.houseSystem.value = options.houseSystem ?? 'porphyry';
  if (form.elements.ayanamsa) form.elements.ayanamsa.value = options.ayanamsa ?? 'lahiri';
}

function populateUtcOffsetSelect(select) {
  if (!select) return;

  select.innerHTML = UTC_TIMEZONE_OPTIONS
    .map((item, index) => `<option value="tz-${index}" data-offset="${item.value}" data-label="${item.label}">${item.label}</option>`)
    .join('');
}

function populateTimeZoneSelect(select) {
  if (!select) return;

  select.innerHTML = TIMEZONE_OPTIONS
    .map((item) => `<option value="${item.value}">${item.label}</option>`)
    .join('');
}

function initUtcOffsetSelects(...forms) {
  for (const form of forms) {
    const select = form?.elements?.utcOffset;
    if (!select) continue;
    populateUtcOffsetSelect(select);
  }
}

function initTimeZoneSelects(...forms) {
  for (const form of forms) {
    const select = form?.elements?.timeZone;
    if (!select) continue;
    populateTimeZoneSelect(select);
  }
}

function getUtcOffsetValue(form) {
  const select = form?.elements?.utcOffset;
  const option = select?.selectedOptions?.[0];
  return Number(option?.dataset?.offset ?? 0);
}

function getTimeZoneValue(form) {
  return form?.elements?.timeZone?.value || 'Europe/Paris';
}

function setTimeZoneValue(form, timeZone) {
  const select = form?.elements?.timeZone;
  if (!select || !timeZone) return;
  if (Array.from(select.options).some((option) => option.value === timeZone)) {
    select.value = timeZone;
  }
}

function setUtcOffsetValue(form, offset, labelHint = '') {
  const select = form?.elements?.utcOffset;
  if (!select) return;

  const options = Array.from(select.options);
  const normalizedOffset = Number(offset);

  const exactLabelMatch = labelHint
    ? options.find((option) => option.dataset.label === labelHint)
    : null;

  const offsetMatch = options.find((option) => Number(option.dataset.offset) === normalizedOffset);
  const target = exactLabelMatch ?? offsetMatch ?? options[0] ?? null;
  if (target) {
    select.value = target.value;
  }
}

function guessTimeZoneFromOffset(offset) {
  const normalized = Number(offset);
  const fallbackMap = {
    '-5': 'America/New_York',
    '-4': 'America/New_York',
    '-3': 'America/Sao_Paulo',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Paris',
    '3': 'Europe/Moscow',
    '5.5': 'Asia/Kolkata',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Australia/Sydney',
    '12': 'Pacific/Auckland',
    '13': 'Pacific/Auckland'
  };

  return fallbackMap[String(normalized)] ?? 'Europe/Paris';
}

function parseDateTimeParts(dateValue, timeValue) {
  const [year, month, day] = String(dateValue || '').split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = String(timeValue || '00:00:00').split(':').map(Number);

  if (![year, month, day, hour, minute, second].every(Number.isFinite)) {
    return null;
  }

  return { year, month, day, hour, minute, second };
}

function getTimeZoneOffsetHours(dateValue, timeValue, timeZone) {
  const parts = parseDateTimeParts(dateValue, timeValue);
  if (!parts || !timeZone) return null;

  let utcMillis = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);

  for (let i = 0; i < 3; i += 1) {
    const offset = readTimeZoneOffsetHours(new Date(utcMillis), timeZone);
    if (!Number.isFinite(offset)) return null;
    const nextUtcMillis = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - (offset * 3600000);
    if (Math.abs(nextUtcMillis - utcMillis) < 60000) {
      utcMillis = nextUtcMillis;
      break;
    }
    utcMillis = nextUtcMillis;
  }

  return readTimeZoneOffsetHours(new Date(utcMillis), timeZone);
}

function readTimeZoneOffsetHours(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    }).formatToParts(date);
    const token = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
    if (token === 'GMT' || token === 'UTC') return 0;
    const match = token.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!match) return null;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2] ?? 0);
    const minutes = Number(match[3] ?? 0);
    return sign * (hours + (minutes / 60));
  } catch {
    return null;
  }
}

function formatUtcOffsetLabel(offset) {
  const sign = offset >= 0 ? '+' : '-';
  const absoluteMinutes = Math.round(Math.abs(offset) * 60);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const minutes = String(absoluteMinutes % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

function syncUtcOffsetFromTimeZone(form, prefix = 'chart') {
  if (!form) return;

  const dateValue = form.elements.date?.value;
  const timeValue = form.elements.time?.value || '00:00:00';
  const timeZone = getTimeZoneValue(form);
  const help = document.getElementById(`${prefix}-utc-help`);
  const offset = getTimeZoneOffsetHours(dateValue, timeValue, timeZone);

  if (!Number.isFinite(offset)) {
    if (help) {
      help.textContent = 'Choisis une date, une heure et un fuseau pour calculer automatiquement l’UTC.';
    }
    return;
  }

  setUtcOffsetValue(form, offset);

  const zoneLabel = TIMEZONE_OPTIONS.find((item) => item.value === timeZone)?.label ?? timeZone;
  if (help) {
    help.textContent = `Calcul automatique: ${formatUtcOffsetLabel(offset)} pour ${zoneLabel} à la date choisie.`;
  }
}

function updateFormSelectHelp(form, prefix) {
  if (!form) return;
  const houseValue = form.elements.houseSystem?.value;
  const ayanamsaValue = form.elements.ayanamsa?.value;
  const houseHelp = document.getElementById(`${prefix}-house-help`);
  const ayanamsaHelp = document.getElementById(`${prefix}-ayanamsa-help`);

  if (houseHelp) {
    houseHelp.textContent = HOUSE_SYSTEM_HELP[houseValue] ?? '';
  }

  if (ayanamsaHelp) {
    ayanamsaHelp.textContent = AYANAMSA_HELP[ayanamsaValue] ?? '';
  }
}

function applyProfilePreset(form, presetKey) {
  const preset = PROFILE_PRESETS[presetKey];
  if (!form || !preset) return;

  if (form.elements.houseSystem) form.elements.houseSystem.value = preset.houseSystem;
  if (form.elements.ayanamsa) form.elements.ayanamsa.value = preset.ayanamsa;
  updateFormSelectHelp(form, 'chart');
}

function updateProfileHelp(presetKey) {
  const el = document.getElementById('chart-profile-help');
  if (!el) return;
  el.textContent = PROFILE_PRESETS[presetKey]?.description ?? '';
}

function applyCityPreset(form, presetKey) {
  const preset = CITY_PRESETS[presetKey];
  if (!form || !preset) return false;

  if (form.elements.latitude) form.elements.latitude.value = preset.latitude;
  if (form.elements.longitude) form.elements.longitude.value = preset.longitude;
  setTimeZoneValue(form, preset.timeZone ?? guessTimeZoneFromOffset(preset.utcOffset));
  syncUtcOffsetFromTimeZone(form, form.id === 'transit-form' ? 'transit' : 'chart');
  return true;
}

function bindCityPreset(form, statusMessage) {
  const select = form?.elements?.cityPreset;
  if (!select) return;

  select.addEventListener('change', () => {
    if (!select.value) return;
    const ok = applyCityPreset(form, select.value);
    if (!ok) return;
    const city = CITY_PRESETS[select.value];
    setStatus(`${statusMessage}: ${city.label}. Vérifie l’UTC selon l’heure d’été / hiver.`);
  });
}

function setSynthesisLevelControl(select, value) {
  if (!select) return;
  select.value = normalizeSynthesisLevel(value);
}

function chartNeedsRebuild(chart) {
  if (!chart?.context) return false;
  if (!chart?.synthesis) return true;
  if (!chart.synthesis.overview || !chart.synthesis.sections) return true;
  if (!chart?.calculations) return true;
  if (Array.isArray(chart.calculations)) return true;
  if (!Array.isArray(chart.calculations.groups)) return true;
  if (!chart.calculations.byKey || typeof chart.calculations.byKey !== 'object') return true;
  if (!chart?.bodies?.sun?.presentation) return true;
  if (!chart?.bodies?.moon?.presentation) return true;
  if (!chart?.moonPhase?.presentation) return true;
  if (!chart?.moonPhase?.presentation?.trueAgeText) return true;
  if (!chart?.moonPhase?.presentation?.nextMajorPhaseText) return true;
  if (!chart?.moonPhase?.presentation?.nextNodeText) return true;
  if (!chart?.moonPhase?.presentation?.currentConstellationTitleText) return true;
  if (!chart?.moonPhase?.presentation?.nextConstellationText?.toTitleText) return true;
  if (!chart?.moonPhase?.presentation?.nextMajorPhaseText?.localTitleText) return true;
  if (!chart?.riseSet?.sun?.presentation) return true;
  if (!chart?.riseSet?.moon?.presentation) return true;
  if (!chart?.anglePresentation) return true;
  if (!Array.isArray(chart?.houseDetails)) return true;
  if ((chart?.aspects ?? []).some((aspect) => !aspect?.presentation)) return true;
  if (!chart?.bodies?.sun?.presentation?.constellationTitleText) return true;
  if (!chart?.bodies?.moon?.presentation?.constellationTitleText) return true;
  if (!chart?.meta?.precision?.coreAstronomy) return true;
  if (!Array.isArray(chart?.meta?.interpretationPolicy)) return true;
  return false;
}

function normalizeChartForUi(chart, inputFallback = null, optionsFallback = null) {
  if (!chartNeedsRebuild(chart)) return chart;

  const input = chart?.input ?? inputFallback;
  if (!input) return chart;

  return buildChart(input, chart?.options ?? optionsFallback ?? {});
}

function setStatus(message) {
  const el = document.getElementById('app-status');
  if (el) el.textContent = message;
}

function storageAvailable() {
  try {
    localStorage.setItem(STORAGE_TEST_KEY, 'ok');
    localStorage.removeItem(STORAGE_TEST_KEY);
    return true;
  } catch {
    return false;
  }
}

function saveFormDraft(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function loadFormDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistMainFormDraft(form) {
  const { input, options } = getMainFormInput(form);
  return saveFormDraft(MAIN_FORM_DRAFT_KEY, { input, options });
}

function persistTransitFormDraft(form) {
  const input = getTransitFormInput(form);
  const formData = new FormData(form);

  return saveFormDraft(TRANSIT_FORM_DRAFT_KEY, {
    input,
    filters: {
      maxOrb: formData.get('maxOrb') ?? '4',
      includeFast: formData.get('includeFast') === 'on',
      includeAngles: formData.get('includeAngles') === 'on',
      includeMinorImportance: formData.get('includeMinorImportance') === 'on'
    }
  });
}

function restoreTransitFilters(form, filters) {
  if (!form || !filters) return;
  if (form.elements.maxOrb) form.elements.maxOrb.value = String(filters.maxOrb ?? '4');
  if (form.elements.includeFast) form.elements.includeFast.checked = Boolean(filters.includeFast);
  if (form.elements.includeAngles) form.elements.includeAngles.checked = Boolean(filters.includeAngles);
  if (form.elements.includeMinorImportance) {
    form.elements.includeMinorImportance.checked = Boolean(filters.includeMinorImportance);
  }
}

function bindDraftPersistence(form, key, persistFn) {
  if (!form) return;

  form.addEventListener('input', () => {
    const ok = persistFn(form);
    if (ok) {
      setStatus('Brouillon enregistré localement.');
    } else {
      setStatus('Échec de l’enregistrement local du brouillon.');
    }
  });

  form.addEventListener('change', () => {
    const ok = persistFn(form);
    if (ok) {
      setStatus('Brouillon enregistré localement.');
    } else {
      setStatus('Échec de l’enregistrement local du brouillon.');
    }
  });
}

function renderChart(chart) {
  renderSummary(chart);
  renderClarifications(chart);
  renderCalculationGroups(chart);
  renderBodies(chart);
  renderHouses(chart);
  renderSymbolic(chart);
  renderAspects(chart);
  renderMoonPhase(chart);
  renderMoonDiagnostics(chart);
  renderRiseSet(chart);
  renderChartWheel(chart);
  renderSynthesis(chart, uiState.synthesisLevel);
}

function rerenderCurrentViews() {
  if (uiState.currentChart) {
    renderChart(uiState.currentChart);
  }

  renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
}

export function initApp() {
  initDashboardShell();

  const form = document.getElementById('chart-form');
  const transitForm = document.getElementById('transit-form');
  const synthesisLevelSelect = document.getElementById('synthesis-level');
  const saveButton = document.getElementById('save-chart');
  const loadButton = document.getElementById('load-chart');
  const exportButton = document.getElementById('export-chart');
  const importButton = document.getElementById('import-chart-button');
  const importFile = document.getElementById('import-chart-file');
  const copyChartLocationButton = document.getElementById('copy-chart-location');
  const canUseStorage = storageAvailable();
  const settings = canUseStorage ? loadSettings() : { houseSystem: 'porphyry', ayanamsa: 'lahiri', synthesisLevel: 'medium' };
  const storedChart = canUseStorage ? loadChart() : null;
  const mainDraft = canUseStorage ? loadFormDraft(MAIN_FORM_DRAFT_KEY) : null;
  const transitDraft = canUseStorage ? loadFormDraft(TRANSIT_FORM_DRAFT_KEY) : null;

  initTimeZoneSelects(form, transitForm);
  initUtcOffsetSelects(form, transitForm);
  setTimeZoneValue(form, 'Europe/Paris');
  setTimeZoneValue(transitForm, 'Europe/Paris');
  syncUtcOffsetFromTimeZone(form, 'chart');
  syncUtcOffsetFromTimeZone(transitForm, 'transit');
  uiState.synthesisLevel = normalizeSynthesisLevel(settings.synthesisLevel);
  setProjectOptions(form, settings);
  updateFormSelectHelp(form, 'chart');
  updateProfileHelp(form?.elements?.profilePreset?.value ?? 'western');
  setSynthesisLevelControl(synthesisLevelSelect, uiState.synthesisLevel);

  if (!canUseStorage) {
    setStatus('Stockage local indisponible dans ce contexte navigateur.');
  } else {
    bindDraftPersistence(form, MAIN_FORM_DRAFT_KEY, persistMainFormDraft);
    bindDraftPersistence(transitForm, TRANSIT_FORM_DRAFT_KEY, persistTransitFormDraft);
    setStatus('Stockage local actif.');
  }

  renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);

  if (mainDraft?.input) {
    populateForm(form, mainDraft.input);
    setProjectOptions(form, mainDraft.options ?? settings);
    updateFormSelectHelp(form, 'chart');
    syncUtcOffsetFromTimeZone(form, 'chart');
    setStatus('Brouillon du formulaire restauré.');
  }

  if (transitDraft?.input) {
    populateForm(transitForm, transitDraft.input);
    restoreTransitFilters(transitForm, transitDraft.filters);
    syncUtcOffsetFromTimeZone(transitForm, 'transit');
  }

  if (storedChart?.chart) {
    uiState.currentChart = normalizeChartForUi(
      storedChart.chart,
      storedChart.natalInput ?? storedChart.chart.input ?? null,
      storedChart.natalOptions ?? storedChart.chart.options ?? settings
    );
    uiState.currentInput = storedChart.natalInput ?? storedChart.chart.input ?? null;
    if (!mainDraft?.input && uiState.currentInput) {
      populateForm(form, uiState.currentInput);
    }
    if (!mainDraft?.options) {
      setProjectOptions(form, storedChart.natalOptions ?? storedChart.chart.options ?? settings);
    }
    updateFormSelectHelp(form, 'chart');
    renderChart(uiState.currentChart);
    renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
    setStatus('Carte restaurée depuis le stockage local.');
  } else if (storedChart?.input) {
    uiState.currentChart = normalizeChartForUi(
      storedChart,
      storedChart.input,
      storedChart.options ?? settings
    );
    uiState.currentInput = storedChart.input;
    if (!mainDraft?.input) {
      populateForm(form, storedChart.input);
    }
    if (!mainDraft?.options) {
      setProjectOptions(form, storedChart.options ?? settings);
    }
    updateFormSelectHelp(form, 'chart');
    renderChart(uiState.currentChart);
    renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
    setStatus('Carte restaurée depuis l’ancien format local.');
  }

  synthesisLevelSelect?.addEventListener('change', () => {
    uiState.synthesisLevel = normalizeSynthesisLevel(synthesisLevelSelect.value);

    if (canUseStorage) {
      saveSettings({
        ...(uiState.currentChart?.options ?? settings),
        synthesisLevel: uiState.synthesisLevel
      });
    }

    rerenderCurrentViews();
    setStatus(`Niveau de lecture réglé sur ${uiState.synthesisLevel}.`);
  });

  form.elements.profilePreset?.addEventListener('change', () => {
    const presetKey = form.elements.profilePreset.value || 'western';
    applyProfilePreset(form, presetKey);
    updateProfileHelp(presetKey);
    if (canUseStorage) {
      persistMainFormDraft(form);
    }
    setStatus('Configuration de lecture appliquée au formulaire.');
  });

  form.elements.houseSystem?.addEventListener('change', () => updateFormSelectHelp(form, 'chart'));
  form.elements.ayanamsa?.addEventListener('change', () => updateFormSelectHelp(form, 'chart'));
  form.elements.timeZone?.addEventListener('change', () => syncUtcOffsetFromTimeZone(form, 'chart'));
  form.elements.date?.addEventListener('change', () => syncUtcOffsetFromTimeZone(form, 'chart'));
  form.elements.time?.addEventListener('change', () => syncUtcOffsetFromTimeZone(form, 'chart'));
  transitForm.elements.timeZone?.addEventListener('change', () => syncUtcOffsetFromTimeZone(transitForm, 'transit'));
  transitForm.elements.date?.addEventListener('change', () => syncUtcOffsetFromTimeZone(transitForm, 'transit'));
  transitForm.elements.time?.addEventListener('change', () => syncUtcOffsetFromTimeZone(transitForm, 'transit'));

  bindCityPreset(form, 'Lieu de la carte prérempli');
  bindCityPreset(transitForm, 'Lieu de transit prérempli');

  copyChartLocationButton?.addEventListener('click', () => {
    if (!uiState.currentInput) {
      alert('Calcule ou charge d’abord une carte de référence.');
      return;
    }

    populateForm(transitForm, uiState.currentInput);
    setTimeZoneValue(transitForm, uiState.currentInput.timeZone ?? 'Europe/Paris');
    syncUtcOffsetFromTimeZone(transitForm, 'transit');
    if (canUseStorage) {
      persistTransitFormDraft(transitForm);
    }
    setStatus('Lieu et UTC repris depuis la carte de référence.');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { input, options } = getMainFormInput(form);

    const errors = validateInput(input);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    const chart = buildChart(input, options);
    uiState.currentChart = chart;
    uiState.currentInput = input;
    uiState.currentTransitResult = null;
    if (canUseStorage) {
      saveSettings({
        ...options,
        synthesisLevel: uiState.synthesisLevel
      });
      saveChart({
        chart,
        natalInput: input,
        natalOptions: options
      });
      persistMainFormDraft(form);
    }

    renderChart(chart);
    renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
    setStatus(canUseStorage ? 'Carte calculée et enregistrée localement.' : 'Carte calculée.');
  });

  saveButton?.addEventListener('click', () => {
    if (!uiState.currentChart) {
      alert('Aucune carte à sauvegarder.');
      return;
    }

    if (!canUseStorage) {
      alert('Le stockage local n’est pas disponible dans ce navigateur ou ce contexte.');
      return;
    }

    saveChart({
      chart: uiState.currentChart,
      natalInput: uiState.currentInput,
      natalOptions: uiState.currentChart.options ?? settings
    });
    setStatus('Carte sauvegardée localement.');
  });

  loadButton?.addEventListener('click', () => {
    if (!canUseStorage) {
      alert('Le stockage local n’est pas disponible dans ce navigateur ou ce contexte.');
      return;
    }

    const saved = loadChart();
    if (!saved) {
      alert('Aucune sauvegarde trouvée.');
      return;
    }

    const chart = normalizeChartForUi(
      saved.chart ?? saved,
      saved.natalInput ?? saved.chart?.input ?? saved.input ?? null,
      saved.natalOptions ?? saved.chart?.options ?? saved.options ?? settings
    );
    const input = saved.natalInput ?? chart.input ?? null;
    const options = saved.natalOptions ?? chart.options ?? settings;

    uiState.currentChart = chart;
    uiState.currentInput = input;
    uiState.currentTransitResult = null;
    if (input) populateForm(form, input);
    setProjectOptions(form, options);
    persistMainFormDraft(form);
    setSynthesisLevelControl(synthesisLevelSelect, uiState.synthesisLevel);
    renderChart(chart);
    renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
    setStatus('Carte chargée depuis le stockage local.');
  });

  exportButton?.addEventListener('click', () => {
    if (!uiState.currentChart) {
      alert('Aucune carte à exporter.');
      return;
    }

    exportJson({
      chart: uiState.currentChart,
      natalInput: uiState.currentInput,
      natalOptions: uiState.currentChart.options ?? settings
    }, 'astro-chart.json');
    setStatus('Export JSON généré.');
  });

  importButton?.addEventListener('click', () => {
    importFile?.click();
  });

  importFile?.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    if (!file) return;

    try {
      const imported = await importJsonFile(file);
      const chart = normalizeChartForUi(
        imported?.chart ?? imported,
        imported?.natalInput ?? imported?.chart?.input ?? imported?.input ?? null,
        imported?.natalOptions ?? imported?.chart?.options ?? imported?.options ?? settings
      );

      if (!chart?.context) {
        throw new Error('Fichier invalide');
      }

      uiState.currentChart = chart;
      uiState.currentInput = imported?.natalInput ?? chart.input ?? null;
      uiState.currentTransitResult = null;

      if (uiState.currentInput) {
        populateForm(form, uiState.currentInput);
      }

      setProjectOptions(form, imported?.natalOptions ?? chart.options ?? settings);
      if (canUseStorage) {
        persistMainFormDraft(form);
      }
      renderChart(chart);
      renderTransits(uiState.currentTransitResult, uiState.synthesisLevel);
      setStatus('Carte importée avec succès.');
    } catch (error) {
      alert('Import impossible : ' + error.message);
    } finally {
      importFile.value = '';
    }
  });

  transitForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!uiState.currentInput) {
      alert('Calcule d’abord une carte de référence.');
      return;
    }

    const formData = new FormData(transitForm);
    const transitInput = getTransitFormInput(transitForm);

    const errors = validateInput(transitInput);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    populateForm(transitForm, transitInput);
    const transitOptions = {
      maxOrb: Number(formData.get('maxOrb')),
      includeFast: formData.get('includeFast') === 'on',
      includeAngles: formData.get('includeAngles') === 'on',
      includeMinorImportance: formData.get('includeMinorImportance') === 'on'
    };

    const result = buildTransitComparison(
      uiState.currentInput,
      transitInput,
      transitOptions,
      uiState.currentChart?.options ?? settings
    );
    uiState.currentTransitResult = result;
    if (canUseStorage) {
      persistTransitFormDraft(transitForm);
    }
    renderTransits(result, uiState.synthesisLevel);
    setStatus('Comparaison de transits calculée.');
  });

  window.addEventListener('beforeunload', () => {
    if (!canUseStorage) return;
    persistMainFormDraft(form);
    persistTransitFormDraft(transitForm);
  });
}
