import { formatDeg } from './formatters.js';

export function renderHouses(chart) {
  const el = document.getElementById('houses');
  el.innerHTML = `
    <p><strong>Repère :</strong> chaque cuspide est la longitude d’ouverture d’une maison dans le système ${chart.houseSystem}.</p>
    ${chart.houses
      .map((cusp, index) => `<p>Maison ${index + 1}: ${formatDeg(cusp)}</p>`)
      .join('')}
  `;
}
