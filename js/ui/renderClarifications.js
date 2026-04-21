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

  el.innerHTML = `
    <div>
      <h3>Astro technique</h3>
      <p><strong>JD</strong> correspond au jour julien, la base continue utilisée pour enchaîner les calculs astronomiques.</p>
      <p><strong>LST</strong> correspond au temps sidéral local, qui sert surtout à calculer l’Ascendant, le MC et les maisons.</p>
      <p><strong>Obliquité</strong> correspond à l’inclinaison de l’écliptique utilisée pour passer entre repères célestes.</p>
      <p><strong>Ayanamsa ${ayanamsaLabel(chart.options?.ayanamsa)}</strong> correspond au décalage appliqué pour le zodiaque sidéral. Le tropical, lui, reste non décalé.</p>
    </div>
    <div>
      <h3>Lecture astrologique</h3>
      <p><strong>Signe tropical</strong> correspond à la position zodiacale saisonnière la plus utilisée en astrologie occidentale.</p>
      <p><strong>Signe sidéral</strong> correspond à cette même position après correction par ayanamsa.</p>
      <p><strong>Maison</strong> correspond au secteur de vie où la position projetée du corps est lue dans le système choisi: ${chart.houseSystem}.</p>
      <p><strong>Aspect</strong> correspond à un écart angulaire entre deux points. <strong>Angle</strong> = séparation mesurée, <strong>orbe</strong> = écart par rapport à l’aspect exact.</p>
    </div>
    <div>
      <h3>Lecture lunaire</h3>
      <p><strong>Âge lunaire</strong> correspond au temps écoulé depuis la dernière nouvelle lune, dans le modèle simplifié actuel.</p>
      <p><strong>Illumination</strong> correspond à la fraction visible du disque lunaire vue depuis la Terre.</p>
      <p><strong>Angle Soleil-Lune</strong> correspond à l’élongation géocentrique, c’est-à-dire la séparation angulaire utile pour la phase.</p>
      <p><strong>Croissante / décroissante</strong> indique si la Lune s’éloigne de la nouvelle lune ou revient vers elle.</p>
    </div>
    <div>
      <h3>Symbolique</h3>
      <p><strong>Hexagramme Y-King</strong> correspond ici à une correspondance symbolique dérivée de la longitude écliptique.</p>
      <p><strong>Human Design</strong> n’est pas encore calculé dans ce projet. Aucun type, profil, porte, canal ou bodygraph n’est produit pour l’instant.</p>
    </div>
  `;
}
