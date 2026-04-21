const SIGN_NAMES = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];

function formatPlacement(label, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  const degree = Number.isFinite(body?.tropical?.degreeInSign)
    ? body.tropical.degreeInSign.toFixed(2)
    : '?';

  return `${label} en ${sign} (${degree}°), maison ${house}.`;
}

function signTone(signName) {
  const map = {
    'Bélier': 'impulsion, démarrage, affirmation',
    'Taureau': 'stabilité, incarnation, continuité',
    'Gémeaux': 'curiosité, mouvement, mise en lien',
    'Cancer': 'sensibilité, intériorité, protection',
    'Lion': 'rayonnement, expression, centralité',
    'Vierge': 'tri, précision, mise en ordre',
    'Balance': 'relation, équilibre, ajustement',
    'Scorpion': 'intensité, profondeur, transformation',
    'Sagittaire': 'élan, sens, expansion',
    'Capricorne': 'structure, exigence, construction',
    'Verseau': 'vision, décalage, collectif',
    'Poissons': 'perméabilité, inspiration, dissolution'
  };

  return map[signName] ?? 'tonalité indéterminée';
}

function houseTone(house) {
  const map = {
    1: 'mise en avant de l’identité et de la manière d’entrer dans le monde',
    2: 'rapport aux ressources, à la matière et à la stabilité',
    3: 'expression, échanges, apprentissages et proximité',
    4: 'racines, intériorité, fondation et foyer',
    5: 'création, expression personnelle et rayonnement',
    6: 'organisation du quotidien, service et ajustement',
    7: 'relation directe à l’autre et dynamique de miroir',
    8: 'transformation, intensité, profondeur et passage',
    9: 'sens, vision, horizon et ouverture',
    10: 'visibilité, vocation, posture dans le monde',
    11: 'groupes, projets, réseaux et contribution',
    12: 'retrait, maturation intérieure et invisible'
  };

  return map[house] ?? 'champ d’expérience non précisé';
}

function planetFunction(name) {
  const map = {
    Mercury: 'la pensée, le langage, les liens et la manière de formuler',
    Venus: 'la relation, l’accord, l’attirance et l’évaluation de ce qui a de la valeur',
    Mars: 'l’élan, l’action, l’affirmation et la manière de mobiliser la force',
    Jupiter: 'l’expansion, la confiance, le sens et la manière d’ouvrir l’horizon',
    Saturn: 'la structure, la limite, l’exigence et la manière de construire dans le temps',
    Uranus: 'la rupture, la nouveauté, le décalage et la poussée de libération',
    Neptune: 'l’inspiration, la porosité, l’idéal et la dissolution des frontières'
  };

  return map[name] ?? 'une fonction non précisée';
}

function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getAscSignName(chart) {
  const asc = chart?.angles?.asc;
  if (!Number.isFinite(asc)) return 'inconnu';

  const signIndex = Math.floor(normalizeAngle(asc) / 30);
  return SIGN_NAMES[signIndex] ?? 'inconnu';
}

function aspectWeight(item) {
  const exactness = Math.max(0, 10 - item.orb * 2);
  const keyBodies = ['Soleil', 'Lune', 'Asc', 'MC'];
  const keyBonus = (keyBodies.includes(item.bodyA) ? 2 : 0) + (keyBodies.includes(item.bodyB) ? 2 : 0);
  const aspectBonus = item.aspect === 'conjonction' || item.aspect === 'opposition'
    ? 2
    : item.aspect === 'carré' || item.aspect === 'trigone'
      ? 1.5
      : 1;

  return exactness + keyBonus + aspectBonus;
}

function countDominants(chart) {
  const signCounts = new Map();
  const houseCounts = new Map();
  const allBodies = [chart.bodies?.sun, chart.bodies?.moon, ...Object.values(chart.planets ?? {})]
    .filter(Boolean);

  for (const body of allBodies) {
    const sign = body?.tropical?.name;
    const house = body?.house;

    if (sign) signCounts.set(sign, (signCounts.get(sign) ?? 0) + 1);
    if (house != null) houseCounts.set(house, (houseCounts.get(house) ?? 0) + 1);
  }

  return {
    topSigns: [...signCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
    topHouses: [...houseCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  };
}

function summarizeDominants(chart) {
  const { topSigns, topHouses } = countDominants(chart);
  const lines = [];

  if (topSigns.length) {
    lines.push(`Dominantes de signe : ${topSigns.map(([name, count]) => `${name} (${count})`).join(', ')}.`);
  }

  if (topHouses.length) {
    lines.push(`Dominantes de maison : ${topHouses.map(([name, count]) => `maison ${name} (${count})`).join(', ')}.`);
  }

  return lines;
}

function buildSunMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `Le Soleil indique un axe d’expression centré sur ${signTone(sign)}, avec une mise en jeu particulière dans le domaine ${houseTone(house)}.`;
}

function buildMoonMeaning(body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `La Lune met l’accent sur une vie intérieure liée à ${signTone(sign)}, vécue principalement à travers ${houseTone(house)}.`;
}

function buildAscMeaning(chart) {
  const sign = getAscSignName(chart);
  return `L’Ascendant colore la manière d’entrer en relation avec le monde par une tonalité de ${signTone(sign)}.`;
}

function buildPlanetMeaning(name, body) {
  const sign = body?.tropical?.name ?? 'inconnu';
  const house = body?.house ?? '?';
  return `${name} montre comment ${planetFunction(name)} se déploie à travers ${signTone(sign)}, dans le champ ${houseTone(house)}.`;
}

function rankAspects(chart) {
  return [...(chart.aspects ?? [])]
    .map((item) => ({ ...item, weight: aspectWeight(item) }))
    .sort((a, b) => b.weight - a.weight);
}

function summarizeCoreTripod(chart) {
  const lines = [];

  if (chart.bodies?.sun) {
    lines.push(formatPlacement('Soleil', chart.bodies.sun));
    lines.push(buildSunMeaning(chart.bodies.sun));
  }

  if (chart.bodies?.moon) {
    lines.push(formatPlacement('Lune', chart.bodies.moon));
    lines.push(buildMoonMeaning(chart.bodies.moon));
  }

  if (chart.angles?.asc != null) {
    lines.push(`Ascendant à ${chart.angles.asc.toFixed(2)}°.`);
    lines.push(buildAscMeaning(chart));
  }

  return lines;
}

function summarizeMajorBodies(chart) {
  const result = [];

  for (const [key, body] of Object.entries(chart.planets ?? {})) {
    result.push(formatPlacement(key, body));
    result.push(buildPlanetMeaning(key, body));
  }

  return result;
}

function summarizeAspects(chart) {
  const ranked = rankAspects(chart).slice(0, 6);

  if (!ranked.length) {
    return ['Aucun aspect majeur suffisamment net n’a été détecté dans les critères actuels.'];
  }

  return ranked.map((item) => {
    const emphasis = item.orb <= 1.5
      ? 'Aspect très serré'
      : item.orb <= 3
        ? 'Aspect structurant'
        : 'Aspect notable';

    return `${emphasis} : ${item.bodyA} ${item.aspect} ${item.bodyB}, orbe ${item.orb.toFixed(2)}°.`;
  });
}

function summarizeMoonPhase(chart) {
  const phase = chart.moonPhase;
  if (!phase) return ['Phase lunaire indisponible.'];

  return [
    `Phase lunaire : ${phase.label}.`,
    `Illumination : ${phase.illuminationPercent.toFixed(2)}%.`,
    `Âge lunaire : ${phase.ageDays.toFixed(2)} jours.`
  ];
}

function summarizeRiseSet(chart) {
  const sun = chart.riseSet?.sun;
  const moon = chart.riseSet?.moon;
  const lines = [];

  if (sun) {
    lines.push(`Soleil — lever: ${sun.rise ?? 'n/a'} UTC, coucher: ${sun.set ?? 'n/a'} UTC.`);
  }

  if (moon) {
    lines.push(`Lune — lever: ${moon.rise ?? 'n/a'} UTC, coucher: ${moon.set ?? 'n/a'} UTC.`);
  }

  return lines;
}

function buildShortOverview(chart, dominants, rankedAspects) {
  const sunSign = chart.bodies?.sun?.tropical?.name ?? 'inconnu';
  const moonSign = chart.bodies?.moon?.tropical?.name ?? 'inconnu';
  const ascSign = getAscSignName(chart);
  const topSign = dominants.topSigns[0]?.[0];
  const topHouse = dominants.topHouses[0]?.[0];
  const mainAspect = rankedAspects[0];
  const lines = [];

  lines.push(`Axe central : Soleil en ${sunSign}, Lune en ${moonSign}, Ascendant ${ascSign}.`);

  if (topSign || topHouse) {
    const fragments = [];

    if (topSign) fragments.push(`une dominante ${topSign}`);
    if (topHouse != null) fragments.push(`un accent sur la maison ${topHouse}`);

    lines.push(`Le thème met surtout en avant ${fragments.join(' et ')}.`);
  }

  if (mainAspect) {
    lines.push(`Le point de tension ou de cohérence principal semble passer par ${mainAspect.bodyA} ${mainAspect.aspect} ${mainAspect.bodyB} (orbe ${mainAspect.orb.toFixed(2)}°).`);
  }

  return lines;
}

function buildMediumOverview(chart, dominants, rankedAspects) {
  const lines = [...buildShortOverview(chart, dominants, rankedAspects)];
  const sunHouse = chart.bodies?.sun?.house ?? '?';
  const moonHouse = chart.bodies?.moon?.house ?? '?';
  const topAspect = rankedAspects.slice(0, 2);

  lines.push(`Le Soleil agit surtout dans ${houseTone(sunHouse)}, tandis que la Lune ramène l’expérience vers ${houseTone(moonHouse)}.`);

  if (topAspect.length) {
    lines.push(`Les aspects les plus parlants sont ${topAspect.map((item) => `${item.bodyA} ${item.aspect} ${item.bodyB}`).join(' et ')}.`);
  }

  return lines;
}

function buildLongOverview(chart, dominants, rankedAspects) {
  const lines = [...buildMediumOverview(chart, dominants, rankedAspects)];
  const moonPhase = chart.moonPhase?.label;
  const riseSet = chart.riseSet?.sun;

  if (moonPhase) {
    lines.push(`La phase lunaire actuelle est ${moonPhase.toLowerCase()}, ce qui nuance le rythme global du thème.`);
  }

  if (riseSet?.rise && riseSet?.set) {
    lines.push(`Le contexte local garde aussi un ancrage concret avec un lever du Soleil à ${riseSet.rise} UTC et un coucher à ${riseSet.set} UTC.`);
  }

  if (dominants.topSigns.length > 1) {
    lines.push(`En arrière-plan, ${dominants.topSigns.slice(0, 2).map(([name]) => name).join(' puis ')} structurent la coloration générale.`);
  }

  return lines;
}

export function buildChartSynthesis(chart) {
  const dominants = countDominants(chart);
  const rankedAspects = rankAspects(chart);

  return {
    overview: {
      short: buildShortOverview(chart, dominants, rankedAspects),
      medium: buildMediumOverview(chart, dominants, rankedAspects),
      long: buildLongOverview(chart, dominants, rankedAspects)
    },
    sections: {
      core: summarizeCoreTripod(chart),
      dominants: summarizeDominants(chart),
      bodies: summarizeMajorBodies(chart),
      aspects: summarizeAspects(chart),
      moonPhase: summarizeMoonPhase(chart),
      riseSet: summarizeRiseSet(chart)
    }
  };
}
