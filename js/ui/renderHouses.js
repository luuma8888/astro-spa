import { formatDeg } from './formatters.js';

export function renderHouses(chart) {
  const el = document.getElementById('houses');
  el.innerHTML = chart.houses
    .map((cusp, index) => `<p>Maison ${index + 1}: ${formatDeg(cusp)}</p>`)
    .join('');
}
