function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getAscSignName(chart) {
  const asc = chart?.angles?.asc;
  if (!Number.isFinite(asc)) return 'n/a';

  const signs = ['Belier', 'Taureau', 'Gemeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const index = Math.floor(normalizeAngle(asc) / 30);
  return signs[index] ?? 'n/a';
}

function countDominants(chart) {
  const signCounts = new Map();
  const houseCounts = new Map();
  const bodies = [chart?.bodies?.sun, chart?.bodies?.moon, ...Object.values(chart?.planets ?? {})].filter(Boolean);

  for (const body of bodies) {
    const sign = body?.tropical?.name;
    const house = body?.house;

    if (sign) signCounts.set(sign, (signCounts.get(sign) ?? 0) + 1);
    if (house != null) houseCounts.set(house, (houseCounts.get(house) ?? 0) + 1);
  }

  return {
    signs: [...signCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2),
    houses: [...houseCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)
  };
}

function renderCard(title, lead, lines, tone = '') {
  return `
    <article class="quick-card${tone ? ` ${tone}` : ''}">
      <span class="quick-card-label">${title}</span>
      <strong class="quick-card-lead">${lead}</strong>
      <div class="quick-card-lines">
        ${lines.map((line) => `<p>${line}</p>`).join('')}
      </div>
    </article>
  `;
}

function getOverviewLine(chart, level) {
  const overview = chart?.synthesis?.overview;
  if (!overview) return 'Synthese indisponible.';

  const lines = level === 'short'
    ? overview.short ?? overview.medium ?? overview.long ?? []
    : level === 'long'
      ? overview.long ?? overview.medium ?? overview.short ?? []
      : overview.medium ?? overview.short ?? overview.long ?? [];

  return lines[0] ?? 'Synthese indisponible.';
}

export function renderQuickScan(chart, transitResult = null, level = 'medium') {
  const el = document.getElementById('quick-scan');
  if (!el) return;

  if (!chart) {
    el.innerHTML = `
      <article class="quick-card quick-card-empty">
        <span class="quick-card-label">Lecture rapide</span>
        <strong class="quick-card-lead">Aucune carte active</strong>
        <div class="quick-card-lines">
          <p>Calcule une carte pour afficher ici les repères de lecture les plus utiles.</p>
        </div>
      </article>
    `;
    return;
  }

  const sun = chart.bodies?.sun;
  const moon = chart.bodies?.moon;
  const dominants = countDominants(chart);
  const topAspect = chart.aspects?.[0];
  const moonPhase = chart.moonPhase?.presentation?.labelText ?? chart.moonPhase?.label ?? 'n/a';
  const moonConstellation = chart.moonPhase?.presentation?.currentConstellationTitleText ?? 'n/a';
  const precision = chart.meta?.precision?.coreAstronomy?.level ?? 'n/a';
  const totalTransits = transitResult?.summary?.total ?? transitResult?.aspects?.length ?? 0;
  const strongTransits = (transitResult?.summary?.tresFort ?? 0) + (transitResult?.summary?.fort ?? 0);

  el.innerHTML = [
    renderCard(
      'Lecture immediate',
      `${sun?.tropical?.name ?? 'n/a'} / ${moon?.tropical?.name ?? 'n/a'} / Asc ${getAscSignName(chart)}`,
      [
        `Soleil en maison ${sun?.house ?? 'n/a'}, Lune en maison ${moon?.house ?? 'n/a'}.`,
        getOverviewLine(chart, level)
      ],
      'quick-card-featured'
    ),
    renderCard(
      'Dominantes',
      dominants.signs.length ? dominants.signs.map(([name, count]) => `${name} (${count})`).join(' • ') : 'Dominantes indisponibles',
      [
        dominants.houses.length
          ? `Maisons dominantes: ${dominants.houses.map(([house, count]) => `${house} (${count})`).join(' • ')}.`
          : 'Maisons dominantes indisponibles.',
        'Repere utile pour voir ou la carte se concentre avant de lire tout le detail.'
      ]
    ),
    renderCard(
      'Aspect structurant',
      topAspect?.presentation?.summaryText ?? 'Aucun aspect saillant',
      [
        topAspect
          ? `${topAspect.presentation?.emphasisText ?? 'Aspect notable'} avec un orbe de ${topAspect.presentation?.orbText ?? `${topAspect.orb.toFixed(2)}°`}.`
          : 'La carte ne remonte pas d aspect majeur prioritaire avec les criteres actuels.',
        'Ce bloc donne le premier point de tension, d appui ou de coherence a examiner.'
      ]
    ),
    renderCard(
      'Focus lunaire',
      moonPhase,
      [
        `Constellation actuelle: ${moonConstellation}.`,
        chart.moonPhase?.presentation?.nextMajorPhaseText
          ? `Prochaine phase majeure: ${chart.moonPhase.presentation.nextMajorPhaseText.labelText}, ${chart.moonPhase.presentation.nextMajorPhaseText.localText}.`
          : 'Prochaine phase majeure indisponible.'
      ]
    ),
    renderCard(
      'Cadre de calcul',
      `${chart.houseSystem} • ${chart.options?.ayanamsa ?? 'lahiri'}`,
      [
        `Precision annoncée: ${precision}.`,
        'L app separe mesure astronomique, lecture tropicale, comparaison siderale et symbolique.'
      ]
    ),
    renderCard(
      'Etat des transits',
      transitResult?.aspects?.length ? `${totalTransits} transits retenus` : 'Aucun transit calcule',
      [
        transitResult?.aspects?.length
          ? `${strongTransits} transits forts ou tres forts dans la comparaison courante.`
          : 'Ajoute une date de comparaison pour voir la densite et la hierarchie des transits.',
        transitResult?.synthesis?.short?.[0] ?? 'Le panneau transits reste separe pour la lecture comparee detaillee.'
      ],
      transitResult?.aspects?.length ? 'quick-card-transit' : ''
    )
  ].join('');
}
