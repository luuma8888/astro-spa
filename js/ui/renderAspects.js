export function renderAspects(chart) {
  const el = document.getElementById('aspects');

  if (!chart.aspects || !chart.aspects.length) {
    el.innerHTML = '<p>Aucun aspect majeur détecté.</p>';
    return;
  }

  el.innerHTML = `
    <div class="compact-list">
      ${chart.aspects.slice(0, 4).map((item) => `
        <article class="compact-item">
          <span class="compact-item-label">Aspect majeur</span>
          <strong class="compact-item-lead">${item.presentation?.summaryText ?? `${item.bodyA} ${item.aspect} ${item.bodyB}`}</strong>
          <span class="compact-item-meta">Orbe ${item.presentation?.orbText ?? `${item.orb.toFixed(2)}°`} • ${item.presentation?.emphasisText ?? 'Aspect notable'}</span>
        </article>
      `).join('')}
    </div>
    <details class="compact-disclosure" data-persist-key="panel:aspects-detail">
      <summary>
        <span class="compact-disclosure-title">Détail des aspects</span>
        <span class="compact-disclosure-meta">${chart.aspects.length} aspect(s) affiché(s)</span>
      </summary>
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
      </div>
    </details>`;
}
