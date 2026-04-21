import { formatDeg } from './formatters.js';

export function renderSummary(chart) {
  const el = document.getElementById('summary');
  el.innerHTML = `
    <p><strong>JD :</strong> ${chart.context.jd.toFixed(6)}</p>
    <p><strong>LST :</strong> ${formatDeg(chart.context.lstDeg)}</p>
    <p><strong>Obliquité :</strong> ${formatDeg(chart.context.epsilonDeg)}</p>
    <p><strong>Asc :</strong> ${formatDeg(chart.angles.asc)}</p>
    <p><strong>MC :</strong> ${formatDeg(chart.angles.mc)}</p>
    <p><strong>Desc :</strong> ${formatDeg(chart.angles.desc)}</p>
    <p><strong>IC :</strong> ${formatDeg(chart.angles.ic)}</p>
    <p><strong>Système :</strong> ${chart.houseSystem}</p>
    <p><strong>Ayanamsa :</strong> ${chart.options?.ayanamsa ?? 'lahiri'}</p>
    <p><strong>Nœud moyen :</strong> ${formatDeg(chart.nodes.meanNode)}</p>
    <p><strong>Nœud vrai :</strong> ${formatDeg(chart.nodes.trueNode)}</p>
  `;
}
