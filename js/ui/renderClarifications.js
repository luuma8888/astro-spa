function ayanamsaLabel(key) {
  const labels = {
    lahiri: 'Lahiri',
    faganBradley: 'Fagan-Bradley',
    krishnamurti: 'Krishnamurti'
  };

  return labels[key] ?? key ?? 'n/a';
}

export function renderClarifications(chart) {
  const el = document.getElementById('clarifications');
  if (!el) return;

  if (!chart?.context) {
    el.innerHTML = '<p>Les clés de lecture apparaîtront après le calcul d’une carte.</p>';
    return;
  }

  const precision = chart?.meta?.precision;
  const frameworks = chart?.meta?.frameworks ?? {};
  const policy = chart?.meta?.interpretationPolicy ?? [];

  function renderCard(title, lines) {
    return `
      <article class="info-card">
        <h3>${title}</h3>
        <div class="bullet-list">
          ${lines.map((line) => `<p>${line}</p>`).join('')}
        </div>
      </article>
    `;
  }

  el.innerHTML = `
    <div class="info-grid">
      ${renderCard('Cadre de fiabilité', [
        `<strong>Calcul astronomique</strong> : ${precision?.coreAstronomy?.summary ?? 'n/a'}`,
        `<strong>Lecture dérivée</strong> : ${precision?.derivedAstrology?.summary ?? 'n/a'}`,
        `<strong>Traduction humaine</strong> : ${precision?.interpretation?.summary ?? 'n/a'}`,
        `<strong>Base de contrôle</strong> : ${precision?.coreAstronomy?.evidence ?? 'n/a'}`
      ])}
      ${renderCard('Quatre lectures distinctes', [
        `<strong>${frameworks?.astronomy?.title ?? 'Lecture astronomique'}</strong> : ${frameworks?.astronomy?.summary ?? 'n/a'}`,
        `<strong>${frameworks?.tropical?.title ?? 'Lecture astrologique tropicale'}</strong> : ${frameworks?.tropical?.summary ?? 'n/a'}`,
        `<strong>${frameworks?.sidereal?.title ?? 'Lecture astrologique sidérale'}</strong> : ${frameworks?.sidereal?.summary ?? 'n/a'}`,
        `<strong>${frameworks?.humanDesign?.title ?? 'Repères utiles au design humain'}</strong> : ${frameworks?.humanDesign?.summary ?? 'n/a'}`
      ])}
      ${renderCard('Repères pratiques', [
        '<strong>JD / LST / obliquité</strong> sont des repères astronomiques internes utiles aux angles, maisons et conversions.',
        `<strong>Ayanamsa ${ayanamsaLabel(chart.options?.ayanamsa)}</strong> reste actif en arrière-plan pour la lecture sidérale, sans être demandé dans le flux principal.`,
        '<strong>Signe tropical</strong> correspond à la position zodiacale saisonnière la plus utilisée en astrologie occidentale.',
        '<strong>Signe sidéral</strong> correspond à cette même position après correction par ayanamsa.',
        '<strong>Constellation</strong> correspond ici à une zone astronomique IAU du ciel. Elle ne doit pas être confondue avec le signe tropical ni avec le signe sidéral.',
        `<strong>Maison</strong> correspond au secteur de vie où la position projetée du corps est lue dans le système choisi : ${chart.houseSystem}.`,
        '<strong>Aspect</strong> correspond à un écart angulaire entre deux points. Angle = séparation mesurée, orbe = écart par rapport à l’aspect exact.'
      ])}
      ${policy.length ? `
        <details class="compact-disclosure" data-persist-key="panel:clarification-policy">
          <summary>
            <span class="compact-disclosure-title">Notes de méthode</span>
            <span class="compact-disclosure-meta">${policy.length} note(s)</span>
          </summary>
          <div class="content-stack">
            ${policy.map((line) => `<p>${line}</p>`).join('')}
          </div>
        </details>
      ` : ''}
    </div>
  `;
}
