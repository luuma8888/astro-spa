function renderSection(title, items) {
  if (!items?.length) return '';

  return `
    <div class="synthesis-section">
      <h3>${title}</h3>
      <div class="bullet-list">
        ${items.map((item) => `<p>${item}</p>`).join('')}
      </div>
    </div>
  `;
}

function getOverviewByLevel(synthesis, level) {
  const overview = synthesis?.overview;
  if (!overview) return null;

  if (level === 'short') return overview.short ?? overview.medium ?? overview.long ?? [];
  if (level === 'long') return overview.long ?? overview.medium ?? overview.short ?? [];
  return overview.medium ?? overview.short ?? overview.long ?? [];
}

export function renderSynthesis(chart, level = 'medium') {
  const el = document.getElementById('synthesis');
  if (!el) return;

  const synthesis = chart?.synthesis;

  if (!synthesis) {
    el.innerHTML = '<p>Synthèse indisponible.</p>';
    return;
  }

  const overview = getOverviewByLevel(synthesis, level);
  const sections = synthesis.sections ?? synthesis;
  const showDetailedSections = level !== 'short';
  const bodyItems = level === 'long'
    ? sections.bodies?.slice(0, 4)
    : sections.bodies?.slice(0, 2);
  const aspectItems = level === 'long'
    ? sections.aspects?.slice(0, 4)
    : sections.aspects?.slice(0, 2);
  const html = `
    ${renderSection('Synthèse finale', overview)}
    ${showDetailedSections ? `
      <details class="compact-disclosure" data-persist-key="panel:synthesis-details">
        <summary>
          <span class="compact-disclosure-title">Lecture détaillée</span>
          <span class="compact-disclosure-meta">dominantes, corps et aspects</span>
        </summary>
        <div class="content-stack">
          ${renderSection('Cadre méthode', sections.method?.slice(0, 2))}
          ${renderSection('Trépied central', sections.core?.slice(0, 3))}
          ${renderSection('Dominantes', sections.dominants?.slice(0, 2))}
          ${renderSection('Corps principaux', bodyItems)}
          ${renderSection('Aspects majeurs', aspectItems)}
          ${level === 'long' ? renderSection('Phase lunaire', sections.moonPhase?.slice(0, 2)) : ''}
          ${level === 'long' ? renderSection('Lever / coucher', sections.riseSet?.slice(0, 2)) : ''}
        </div>
      </details>
    ` : ''}
  `.trim();

  el.innerHTML = html || '<p>Synthèse indisponible pour cette carte. Recalcule la carte pour la régénérer.</p>';
}
