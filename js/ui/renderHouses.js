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
    <div class="house-grid">
      ${houseRows
      .map((item) => `
        <article class="house-chip">
          <span class="house-label">Maison ${item.index}</span>
          <strong>${item.longitudeText}</strong>
        </article>
      `)
      .join('')}
    </div>`;
}
