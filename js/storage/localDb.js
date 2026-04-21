const KEY = 'astro-app-data';

export function saveChart(chart) {
  localStorage.setItem(KEY, JSON.stringify(chart));
}

export function loadChart() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
