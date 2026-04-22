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
        `<strong>Base de contrôle</strong> : ${precision?.coreAstronomy?.evidence ?? 'n/a'}`,
        ...policy
      ])}
      ${renderCard('Astro technique', [
        '<strong>JD</strong> correspond au jour julien, base continue utilisée pour enchaîner les calculs astronomiques.',
        '<strong>LST</strong> correspond au temps sidéral local, utile surtout pour l’Ascendant, le MC et les maisons.',
        '<strong>Obliquité</strong> correspond à l’inclinaison de l’écliptique utilisée pour passer entre repères célestes.',
        `<strong>Ayanamsa ${ayanamsaLabel(chart.options?.ayanamsa)}</strong> correspond au décalage appliqué pour le zodiaque sidéral.`
      ])}
      ${renderCard('Lecture astrologique', [
        '<strong>Signe tropical</strong> correspond à la position zodiacale saisonnière la plus utilisée en astrologie occidentale.',
        '<strong>Signe sidéral</strong> correspond à cette même position après correction par ayanamsa.',
        `<strong>Maison</strong> correspond au secteur de vie où la position projetée du corps est lue dans le système choisi : ${chart.houseSystem}.`,
        '<strong>Aspect</strong> correspond à un écart angulaire entre deux points. Angle = séparation mesurée, orbe = écart par rapport à l’aspect exact.'
      ])}
      ${renderCard('Lecture lunaire', [
        '<strong>Âge lunaire</strong> correspond au temps écoulé depuis la dernière nouvelle lune dans le modèle courant.',
        '<strong>Illumination</strong> correspond à la fraction visible du disque lunaire vue depuis la Terre.',
        '<strong>Angle Soleil-Lune</strong> correspond à l’élongation géocentrique utile pour la phase.',
        '<strong>Croissante / décroissante</strong> indique si la Lune s’éloigne de la nouvelle lune ou revient vers elle.'
      ])}
      ${renderCard('Symbolique', [
        '<strong>Hexagramme Y-King</strong> correspond ici à une correspondance symbolique dérivée de la longitude écliptique.',
        '<strong>Human Design</strong> n’est pas encore calculé dans ce projet.'
      ])}
    </div>
  `;
}
