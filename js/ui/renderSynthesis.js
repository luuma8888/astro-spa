function renderSection(title, items) {
  if (!items?.length) return '';

  return `
    <div>
      <h3>${title}</h3>
      ${items.map((item) => `<p>${item}</p>`).join('')}
    </div>
  `;
}

export function renderSynthesis(chart) {
  const el = document.getElementById('synthesis');
  if (!el) return;

  const synthesis = chart?.synthesis;

  if (!synthesis) {
    el.innerHTML = '<p>Synthèse indisponible.</p>';
    return;
  }

  el.innerHTML = `
    ${renderSection('Trépied central', synthesis.core)}
    ${renderSection('Dominantes', synthesis.dominants)}
    ${renderSection('Corps principaux', synthesis.bodies)}
    ${renderSection('Aspects majeurs', synthesis.aspects)}
    ${renderSection('Phase lunaire', synthesis.moonPhase)}
    ${renderSection('Lever / coucher', synthesis.riseSet)}
  `;
}
