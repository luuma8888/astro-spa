import { formatDeg } from './formatters.js';

function renderLines(title, items) {
  if (!items?.length) return '';

  return `
    <div class="calc-group">
      <h3>${title}</h3>
      ${items.map((item) => `<p>${item}</p>`).join('')}
    </div>
  `;
}

function buildAstronomyLines(chart) {
  return [
    `Jour julien (JD) : ${chart.context.jd.toFixed(6)}. Base continue utilisée pour dater tous les calculs astronomiques.`,
    `Temps sidéral local (LST) : ${formatDeg(chart.context.lstDeg)}. Sert à orienter le ciel local et à calculer les angles.`,
    `Obliquité moyenne : ${formatDeg(chart.context.epsilonDeg)}. Sert à convertir les positions entre repères célestes.`,
    `Nœud lunaire moyen : ${formatDeg(chart.nodes.meanNode)}. Modèle lissé du point nodal lunaire.`,
    `Nœud lunaire vrai : ${formatDeg(chart.nodes.trueNode)}. Variante plus dynamique du même point nodal.`
  ];
}

function buildAstrologyLines(chart) {
  return [
    `Ascendant : ${formatDeg(chart.angles.asc)}. Correspond au point de l’écliptique qui se lève à l’est.`,
    `Milieu du ciel (MC) : ${formatDeg(chart.angles.mc)}. Correspond au point culminant local utilisé pour la lecture vocationnelle et la maison 10.`,
    `Descendant : ${formatDeg(chart.angles.desc)}. Opposé exact de l’Ascendant.`,
    `Fond du ciel (IC) : ${formatDeg(chart.angles.ic)}. Opposé exact du MC.`,
    `Système de maisons : ${chart.houseSystem}. Définit comment les 12 secteurs sont découpés.`,
    `Ayanamsa : ${chart.options?.ayanamsa ?? 'lahiri'}. Sert uniquement à la lecture sidérale.`,
    `Aspects détectés : ${chart.aspects?.length ?? 0}. Ils proviennent d’écarts angulaires entre points du thème.`
  ];
}

function buildLunarLines(chart) {
  const phase = chart.moonPhase;
  const lines = [];

  if (!phase) {
    lines.push('Phase lunaire indisponible.');
    return lines;
  }

  lines.push(`Phase : ${phase.label}. Déduite de l’angle Soleil-Lune.`);
  lines.push(`Âge lunaire : ${phase.ageDays.toFixed(2)} jours depuis la dernière nouvelle lune théorique.`);
  lines.push(`Illumination : ${phase.illuminationPercent.toFixed(2)}% du disque visible.`);
  lines.push(`Angle Soleil-Lune : ${phase.angleDeg.toFixed(2)}°. Élongation géocentrique utile pour la phase.`);
  lines.push(`Tendance : ${phase.waxing ? 'croissante' : 'décroissante'}.`);

  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;

  if (sun) {
    lines.push(`Soleil local : lever ${sun.rise ?? 'n/a'} UTC, coucher ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune locale : lever ${moon.rise ?? 'n/a'} UTC, coucher ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

function buildSymbolicLines(chart) {
  const firstEntries = Object.entries(chart.symbolic ?? {}).slice(0, 4);
  const lines = [
    'Y-King : correspondance symbolique calculée à partir de la longitude écliptique de chaque corps.'
  ];

  if (firstEntries.length) {
    lines.push(...firstEntries.map(([key, value]) =>
      `${key} correspond actuellement à l’hexagramme ${value.yking.id}.`
    ));
  }

  return lines;
}

function buildMissingLines() {
  return [
    'Human Design : non calculé actuellement. Aucun bodygraph, type, autorité, profil, porte ou canal n’est produit.',
    'Éphémérides de précision observatoire : non visées à ce stade.',
    'Constellations polygonales réelles : non intégrées pour l’instant.'
  ];
}

export function renderCalculationGroups(chart) {
  const el = document.getElementById('calculation-groups');
  if (!el) return;

  if (!chart?.context) {
    el.innerHTML = '<p>Le regroupement des calculs apparaîtra après le calcul d’une carte.</p>';
    return;
  }

  el.innerHTML = `
    ${renderLines('Astronomie brute', buildAstronomyLines(chart))}
    ${renderLines('Dérivations astrologiques', buildAstrologyLines(chart))}
    ${renderLines('Lecture lunaire', buildLunarLines(chart))}
    ${renderLines('Correspondances symboliques', buildSymbolicLines(chart))}
    ${renderLines('Non implémenté', buildMissingLines())}
  `;
}
