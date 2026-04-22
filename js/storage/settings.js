const SETTINGS_KEY = 'astro-app-settings';

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw
    ? { houseSystem: 'porphyry', ayanamsa: 'lahiri', synthesisLevel: 'medium', disclosureState: {}, ...JSON.parse(raw) }
    : { houseSystem: 'porphyry', ayanamsa: 'lahiri', synthesisLevel: 'medium', disclosureState: {} };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
