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
  const detailedItems = level === 'short'
    ? result.aspects.slice(0, 3)
    : level === 'medium'
      ? result.aspects.slice(0, 6)
      : result.aspects;

  el.innerHTML = `
    <div>
      <h3>Synthèse des transits</h3>
      ${getTransitSynthesis(result, level).map((item) => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Répartition</h3>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    <div>
      <h3>Détail</h3>
      ${detailedItems.map((item) => `
        <p>
          ${importanceBadge(item.importance)}
          <strong>${item.bodyA}</strong>
          ${item.aspect}
          <strong>${item.bodyB}</strong>
          — orbe: ${item.orb.toFixed(2)}°
          — intensité: ${item.importance}
        </p>
      `).join('')}
    </div>
  `;
}
