function renderSection(title, items) {
  if (!items?.length) return '';

  return `
    <div class="synthesis-section">
      <h3>${title}</h3>
      ${items.map((item) => `<p>${item}</p>`).join('')}
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
    ? sections.bodies
    : sections.bodies?.slice(0, 4);
  const aspectItems = level === 'long'
    ? sections.aspects
    : sections.aspects?.slice(0, 3);
  const html = `
    ${renderSection('Synthèse finale', overview)}
    ${showDetailedSections ? renderSection('Cadre méthode', sections.method) : ''}
    ${showDetailedSections ? renderSection('Trépied central', sections.core) : ''}
    ${showDetailedSections ? renderSection('Dominantes', sections.dominants) : ''}
    ${showDetailedSections ? renderSection('Corps principaux', bodyItems) : ''}
    ${showDetailedSections ? renderSection('Aspects majeurs', aspectItems) : ''}
    ${level === 'long' ? renderSection('Phase lunaire', sections.moonPhase) : ''}
    ${level === 'long' ? renderSection('Lever / coucher', sections.riseSet) : ''}
  `.trim();

  el.innerHTML = html || '<p>Synthèse indisponible pour cette carte. Recalcule la carte pour la régénérer.</p>';
}
