import { formatDeg } from './formatters.js';

function getCalculation(chart, key) {
  return chart?.calculations?.byKey?.[key] ?? null;
}

function getCalculationValueText(chart, key, fallback) {
  return getCalculation(chart, key)?.valueText ?? fallback;
}

export function renderSummary(chart) {
  const el = document.getElementById('summary');
  const items = [
    ['JD', getCalculationValueText(chart, 'jd', chart.context.jd.toFixed(6))],
    ['LST', getCalculationValueText(chart, 'lst', formatDeg(chart.context.lstDeg))],
    ['Obliquité', getCalculationValueText(chart, 'obliquity', formatDeg(chart.context.epsilonDeg))],
    ['Asc', getCalculationValueText(chart, 'asc', formatDeg(chart.angles.asc))],
    ['MC', getCalculationValueText(chart, 'mc', formatDeg(chart.angles.mc))],
    ['Desc', getCalculationValueText(chart, 'desc', formatDeg(chart.angles.desc))],
    ['IC', getCalculationValueText(chart, 'ic', formatDeg(chart.angles.ic))],
    ['Système', getCalculationValueText(chart, 'house-system', chart.houseSystem)],
    ['Ayanamsa', getCalculationValueText(chart, 'ayanamsa', chart.options?.ayanamsa ?? 'lahiri')],
    ['Nœud moyen', getCalculationValueText(chart, 'mean-node', formatDeg(chart.nodes.meanNode))],
    ['Nœud vrai', getCalculationValueText(chart, 'true-node', formatDeg(chart.nodes.trueNode))]
  ];

  el.innerHTML = `
    <div class="section-block section-block-intro">
      <p>Ce bloc rassemble les valeurs techniques les plus structurantes du thème courant. Il sert de lecture rapide avant d’entrer dans les détails.</p>
    </div>
    <div class="kv-grid">
      ${items.map(([label, value]) => `
        <article class="kv-card">
          <span class="kv-label">${label}</span>
          <strong class="kv-value">${value}</strong>
        </article>
      `).join('')}
    </div>
  `;
}
