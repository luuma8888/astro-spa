export function renderAspects(chart) {
  const el = document.getElementById('aspects');

  if (!chart.aspects || !chart.aspects.length) {
    el.innerHTML = '<p>Aucun aspect majeur détecté.</p>';
    return;
  }

  el.innerHTML = `
    <p><strong>Repère :</strong> l’angle est la séparation mesurée entre deux points; l’orbe mesure l’écart à l’aspect exact.</p>
    ${chart.aspects.map(item => `
      <p>
        <strong>${item.bodyA}</strong>
        ${item.aspect}
        <strong>${item.bodyB}</strong>
        — angle: ${item.delta.toFixed(2)}°
        — orbe: ${item.orb.toFixed(2)}°
      </p>
    `).join('')}
  `;
}
