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

export function renderTransits(result) {
  const el = document.getElementById('transits');

  if (!result || !result.aspects?.length) {
    el.innerHTML = '<p>Aucun transit significatif détecté avec les filtres actuels.</p>';
    return;
  }

  const summary = result.summary ?? { total: result.aspects.length, tresFort: 0, fort: 0, modere: 0 };

  el.innerHTML = `
    <div>
      <h3>Synthèse des transits</h3>
      ${(result.synthesis ?? []).map((item) => `<p>${item}</p>`).join('')}
    </div>
    <div>
      <h3>Répartition</h3>
      <p><strong>Total :</strong> ${summary.total}</p>
      <p><strong>Très forts :</strong> ${summary.tresFort} | <strong>Forts :</strong> ${summary.fort} | <strong>Modérés :</strong> ${summary.modere}</p>
    </div>
    <div>
      <h3>Détail</h3>
      ${result.aspects.map((item) => `
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
