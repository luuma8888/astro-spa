export function renderAspects(chart) {
  const el = document.getElementById('aspects');

  if (!chart.aspects || !chart.aspects.length) {
    el.innerHTML = '<p>Aucun aspect majeur détecté.</p>';
    return;
  }

  el.innerHTML = `
    <div class="section-block section-block-intro">
      <p>L’angle est la séparation mesurée entre deux points. L’orbe mesure l’écart à l’aspect exact.</p>
    </div>
    <div class="aspect-list">
      ${chart.aspects.map(item => `
      <article class="aspect-item">
        <div class="aspect-main">
          <strong>${item.bodyA}</strong>
          <span>${item.aspect}</span>
          <strong>${item.bodyB}</strong>
        </div>
        <div class="aspect-meta">
          <span>angle ${item.presentation?.angleText ?? `${item.delta.toFixed(2)}°`}</span>
          <span>orbe ${item.presentation?.orbText ?? `${item.orb.toFixed(2)}°`}</span>
          <span>${item.presentation?.emphasisText ?? 'Aspect notable'}</span>
        </div>
      </article>
    `).join('')}
    </div>`;
}
