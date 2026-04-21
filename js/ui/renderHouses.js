import { formatDeg } from './formatters.js';

export function renderHouses(chart) {
  const el = document.getElementById('houses');
  const houseRows = chart.houseDetails?.length
    ? chart.houseDetails
    : chart.houses.map((cusp, index) => ({
      index: index + 1,
      longitudeText: formatDeg(cusp)
    }));

  el.innerHTML = `
    <p><strong>Repère :</strong> chaque cuspide est la longitude d’ouverture d’une maison dans le système ${chart.houseSystem}.</p>
    ${houseRows
      .map((item) => `<p>Maison ${item.index}: ${item.longitudeText}</p>`)
      .join('')}
  `;
}
