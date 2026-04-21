import { formatDeg } from './formatters.js';

function getCalculation(chart, key) {
  return chart?.calculations?.byKey?.[key] ?? null;
}

function getCalculationValueText(chart, key, fallback) {
  return getCalculation(chart, key)?.valueText ?? fallback;
}

export function renderSummary(chart) {
  const el = document.getElementById('summary');
  el.innerHTML = `
    <p><strong>Repère :</strong> ce bloc rassemble les valeurs techniques utilisées pour produire les positions et la géométrie du thème.</p>
    <p><strong>JD :</strong> ${getCalculationValueText(chart, 'jd', chart.context.jd.toFixed(6))}</p>
    <p><strong>LST :</strong> ${getCalculationValueText(chart, 'lst', formatDeg(chart.context.lstDeg))}</p>
    <p><strong>Obliquité :</strong> ${getCalculationValueText(chart, 'obliquity', formatDeg(chart.context.epsilonDeg))}</p>
    <p><strong>Asc :</strong> ${getCalculationValueText(chart, 'asc', formatDeg(chart.angles.asc))}</p>
    <p><strong>MC :</strong> ${getCalculationValueText(chart, 'mc', formatDeg(chart.angles.mc))}</p>
    <p><strong>Desc :</strong> ${getCalculationValueText(chart, 'desc', formatDeg(chart.angles.desc))}</p>
    <p><strong>IC :</strong> ${getCalculationValueText(chart, 'ic', formatDeg(chart.angles.ic))}</p>
    <p><strong>Système :</strong> ${getCalculationValueText(chart, 'house-system', chart.houseSystem)}</p>
    <p><strong>Ayanamsa :</strong> ${getCalculationValueText(chart, 'ayanamsa', chart.options?.ayanamsa ?? 'lahiri')}</p>
    <p><strong>Nœud moyen :</strong> ${getCalculationValueText(chart, 'mean-node', formatDeg(chart.nodes.meanNode))}</p>
    <p><strong>Nœud vrai :</strong> ${getCalculationValueText(chart, 'true-node', formatDeg(chart.nodes.trueNode))}</p>
  `;
}
