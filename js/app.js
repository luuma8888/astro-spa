import { buildChart } from './domain/chartBuilder.js';
import { buildTransitComparison } from './domain/transits.js';
import { validateInput } from './domain/validators.js';
import { loadChart, saveChart } from './storage/localDb.js';
import { exportJson, importJsonFile } from './storage/exportImport.js';
import { loadSettings, saveSettings } from './storage/settings.js';
import { renderSummary } from './ui/renderSummary.js';
import { renderBodies } from './ui/renderBodies.js';
import { renderHouses } from './ui/renderHouses.js';
import { renderSymbolic } from './ui/renderSymbolic.js';
import { renderAspects } from './ui/renderAspects.js';
import { renderMoonPhase } from './ui/renderMoonPhase.js';
import { renderRiseSet } from './ui/renderRiseSet.js';
import { renderChartWheel } from './ui/renderChartWheel.js';
import { renderTransits } from './ui/renderTransits.js';
import { renderSynthesis } from './ui/renderSynthesis.js';
import { uiState } from './ui/state.js';

const MAIN_FORM_DRAFT_KEY = 'astro-app-main-form-draft';
const TRANSIT_FORM_DRAFT_KEY = 'astro-app-transit-form-draft';
const STORAGE_TEST_KEY = 'astro-app-storage-test';

function getMainFormInput(form) {
  const formData = new FormData(form);

  return {
    input: {
      date: formData.get('date'),
      time: formData.get('time'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude')),
      utcOffset: Number(formData.get('utcOffset'))
    },
    options: {
      houseSystem: formData.get('houseSystem') || 'porphyry',
      ayanamsa: formData.get('ayanamsa') || 'lahiri'
    }
  };
}

function getTransitFormInput(form) {
  const formData = new FormData(form);

  return {
    date: formData.get('date'),
    time: formData.get('time'),
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    utcOffset: Number(formData.get('utcOffset'))
  };
}

function populateForm(form, input) {
  if (!input) return;

  form.elements.date.value = input.date ?? '';
  form.elements.time.value = input.time ?? '';
  form.elements.latitude.value = input.latitude ?? '';
  form.elements.longitude.value = input.longitude ?? '';
  form.elements.utcOffset.value = input.utcOffset ?? 0;
}

function setProjectOptions(form, options) {
  if (!form || !options) return;
  if (form.elements.houseSystem) form.elements.houseSystem.value = options.houseSystem ?? 'porphyry';
  if (form.elements.ayanamsa) form.elements.ayanamsa.value = options.ayanamsa ?? 'lahiri';
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
  renderBodies(chart);
  renderHouses(chart);
  renderSymbolic(chart);
  renderAspects(chart);
  renderMoonPhase(chart);
  renderRiseSet(chart);
  renderChartWheel(chart);
  renderSynthesis(chart);
}

export function initApp() {
  const form = document.getElementById('chart-form');
  const transitForm = document.getElementById('transit-form');
  const saveButton = document.getElementById('save-chart');
  const loadButton = document.getElementById('load-chart');
  const exportButton = document.getElementById('export-chart');
  const importButton = document.getElementById('import-chart-button');
  const importFile = document.getElementById('import-chart-file');
  const canUseStorage = storageAvailable();
  const settings = canUseStorage ? loadSettings() : { houseSystem: 'porphyry', ayanamsa: 'lahiri' };
  const storedChart = canUseStorage ? loadChart() : null;
  const mainDraft = canUseStorage ? loadFormDraft(MAIN_FORM_DRAFT_KEY) : null;
  const transitDraft = canUseStorage ? loadFormDraft(TRANSIT_FORM_DRAFT_KEY) : null;

  setProjectOptions(form, settings);

  if (!canUseStorage) {
    setStatus('Stockage local indisponible dans ce contexte navigateur.');
  } else {
    bindDraftPersistence(form, MAIN_FORM_DRAFT_KEY, persistMainFormDraft);
    bindDraftPersistence(transitForm, TRANSIT_FORM_DRAFT_KEY, persistTransitFormDraft);
    setStatus('Stockage local actif.');
  }

  if (mainDraft?.input) {
    populateForm(form, mainDraft.input);
    setProjectOptions(form, mainDraft.options ?? settings);
    setStatus('Brouillon du formulaire restauré.');
  }

  if (transitDraft?.input) {
    populateForm(transitForm, transitDraft.input);
    restoreTransitFilters(transitForm, transitDraft.filters);
  }

  if (storedChart?.chart) {
    uiState.currentChart = storedChart.chart;
    uiState.currentInput = storedChart.natalInput ?? storedChart.chart.input ?? null;
    if (!mainDraft?.input && uiState.currentInput) {
      populateForm(form, uiState.currentInput);
    }
    if (!mainDraft?.options) {
      setProjectOptions(form, storedChart.natalOptions ?? storedChart.chart.options ?? settings);
    }
    renderChart(storedChart.chart);
    setStatus('Carte restaurée depuis le stockage local.');
  } else if (storedChart?.input) {
    uiState.currentChart = storedChart;
    uiState.currentInput = storedChart.input;
    if (!mainDraft?.input) {
      populateForm(form, storedChart.input);
    }
    if (!mainDraft?.options) {
      setProjectOptions(form, storedChart.options ?? settings);
    }
    renderChart(storedChart);
    setStatus('Carte restaurée depuis l’ancien format local.');
  }

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
    if (canUseStorage) {
      saveSettings(options);
      saveChart({
        chart,
        natalInput: input,
        natalOptions: options
      });
      persistMainFormDraft(form);
    }

    renderChart(chart);
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

    const chart = saved.chart ?? saved;
    const input = saved.natalInput ?? chart.input ?? null;
    const options = saved.natalOptions ?? chart.options ?? settings;

    uiState.currentChart = chart;
    uiState.currentInput = input;
    if (input) populateForm(form, input);
    setProjectOptions(form, options);
    persistMainFormDraft(form);
    renderChart(chart);
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
      const chart = imported?.chart ?? imported;

      if (!chart?.context) {
        throw new Error('Fichier invalide');
      }

      uiState.currentChart = chart;
      uiState.currentInput = imported?.natalInput ?? chart.input ?? null;

      if (uiState.currentInput) {
        populateForm(form, uiState.currentInput);
      }

      setProjectOptions(form, imported?.natalOptions ?? chart.options ?? settings);
      if (canUseStorage) {
        persistMainFormDraft(form);
      }
      renderChart(chart);
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
    if (canUseStorage) {
      persistTransitFormDraft(transitForm);
    }
    renderTransits(result);
    setStatus('Comparaison de transits calculée.');
  });

  window.addEventListener('beforeunload', () => {
    if (!canUseStorage) return;
    persistMainFormDraft(form);
    persistTransitFormDraft(transitForm);
  });
}
