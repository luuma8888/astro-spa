function importanceBadge(value) {
  switch (value) {
    case 'très fort':
      return '!!';
    case 'fort':
      return '!*';
    case 'modéré':
      return '*';
    default:
      return '.';
  }
}

function getTransitSynthesis(result, level) {
  const synthesis = result?.synthesis;
  if (!synthesis) return [];

  if (level === 'short') return synthesis.short ?? synthesis.medium ?? synthesis.long ?? [];
  if (level === 'long') return synthesis.long ?? synthesis.medium ?? synthesis.short ?? [];
  return synthesis.medium ?? synthesis.short ?? synthesis.long ?? [];
}

function summarizeBySpeed(aspects) {
  return {
    slow: aspects.filter((item) => item.transitSpeedClass === 'slow').length,
    medium: aspects.filter((item) => item.transitSpeedClass === 'medium').length,
    fast: aspects.filter((item) => item.transitSpeedClass === 'fast').length,
    angle: aspects.filter((item) => item.transitSpeedClass === 'angle').length
  };
}

function renderTransitCompact(item) {
  return `
    <article class="transit-compact transit-${item.importance.replace(/\s+/g, '-')}">
      <span class="transit-badge">${importanceBadge(item.importance)}</span>
      <div class="transit-compact-main">
        <strong>${item.bodyA}</strong>
        <span>${item.aspect}</span>
        <strong>${item.bodyB}</strong>
      </div>
      <div class="transit-compact-meta">
        <span>orbe ${item.orb.toFixed(2)}°</span>
        <span>${item.importance}</span>
      </div>
    </article>
  `;
}

function renderTransitItem(item) {
  return `
    <article class="transit-item transit-${item.importance.replace(/\s+/g, '-')}">
      <div class="transit-main">
        <span class="transit-badge">${importanceBadge(item.importance)}</span>
        <strong>${item.bodyA}</strong>
        <span>${item.aspect}</span>
        <strong>${item.bodyB}</strong>
      </div>
      <div class="transit-meta">
        <span>orbe ${item.orb.toFixed(2)}°</span>
        <span>intensité ${item.importance}</span>
        <span>vitesse ${item.transitSpeedClass}</span>
        <span>cible ${item.natalSpeedClass}</span>
      </div>
    </article>
  `;
}

export function renderTransits(result, level = 'medium') {
  const el = document.getElementById('transits');
  if (!el) return;

  if (!result) {
    el.innerHTML = '<p>Aucune comparaison de transits calculée pour l’instant.</p>';
    return;
  }

  if (!result.aspects?.length) {
    el.innerHTML = `
      <div>
        <h3>Synthèse des transits</h3>
        ${getTransitSynthesis(result, level).map((item) => `<p>${item}</p>`).join('')}
      </div>
    `;
    return;
  }

  const summary = result.summary ?? { total: result.aspects.length, tresFort: 0, fort: 0, modere: 0 };
  const speedSummary = summarizeBySpeed(result.aspects);
  const detailedItems = level === 'short'
    ? result.aspects.slice(0, 3)
    : level === 'medium'
      ? result.aspects.slice(0, 6)
      : result.aspects;
  const spotlightItems = result.aspects.slice(0, level === 'short' ? 3 : 4);
  const compactItems = result.aspects.slice(level === 'short' ? 3 : 4, level === 'short' ? 7 : 12);

  el.innerHTML = `
    <div class="transit-layout">
      <section class="synthesis-section">
        <h3>Synthèse des transits</h3>
        <div class="bullet-list">
          ${getTransitSynthesis(result, level).map((item) => `<p>${item}</p>`).join('')}
        </div>
      </section>
      <section class="transit-stats-grid">
        <article class="kv-card"><span class="kv-label">Total</span><strong class="kv-value">${summary.total}</strong></article>
        <article class="kv-card"><span class="kv-label">Très forts</span><strong class="kv-value">${summary.tresFort}</strong></article>
        <article class="kv-card"><span class="kv-label">Forts</span><strong class="kv-value">${summary.fort}</strong></article>
        <article class="kv-card"><span class="kv-label">Modérés</span><strong class="kv-value">${summary.modere}</strong></article>
        <article class="kv-card"><span class="kv-label">Lents</span><strong class="kv-value">${speedSummary.slow}</strong></article>
        <article class="kv-card"><span class="kv-label">Rapides</span><strong class="kv-value">${speedSummary.fast}</strong></article>
        <article class="kv-card"><span class="kv-label">Angles</span><strong class="kv-value">${speedSummary.angle}</strong></article>
      </section>
      <section class="transit-density-grid">
        <article class="synthesis-section">
          <h3>Transit dominants</h3>
          <div class="transit-list">
            ${spotlightItems.map(renderTransitItem).join('')}
          </div>
        </article>
        <article class="synthesis-section transit-compact-panel">
          <h3>Lecture rapide</h3>
          <div class="transit-compact-list">
            ${compactItems.length ? compactItems.map(renderTransitCompact).join('') : '<p>Peu de transits supplémentaires dans ce niveau de lecture.</p>'}
          </div>
        </article>
      </section>
      <details class="compact-disclosure transit-disclosure" data-persist-key="panel:transits-detail">
        <summary>
          <span class="compact-disclosure-title">Détail complet</span>
          <span class="compact-disclosure-meta">${detailedItems.length} transit(s) dans ce niveau de lecture</span>
        </summary>
        <div class="transit-list">
          ${detailedItems.map(renderTransitItem).join('')}
        </div>
      </details>
    </div>
  `;
}
