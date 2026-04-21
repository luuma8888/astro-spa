import { formatDeg, formatIsoUtc, formatIsoWithOffset } from '../ui/formatters.js';
import { createCalculationGroup, createCalculationItem } from './chartModel.js';

function entry({
  key,
  label,
  value,
  unit = null,
  category,
  method,
  usage,
  source = 'internal-model',
  expectedPrecision = null,
  notes = null
}) {
  return createCalculationItem({
    key,
    label,
    value,
    unit,
    category,
    method,
    usage,
    source,
    expectedPrecision,
    notes
  });
}

function ayanamsaLabel(key) {
  const labels = {
    lahiri: 'Lahiri',
    faganBradley: 'Fagan-Bradley',
    krishnamurti: 'Krishnamurti'
  };

  return labels[key] ?? key ?? 'n/a';
}

function buildAstronomyGroup(chart) {
  return createCalculationGroup({
    key: 'astronomy',
    title: 'Astronomie brute',
    category: 'astronomy',
    items: [
      entry({
        key: 'jd',
        label: 'Jour julien',
        value: chart.context.jd.toFixed(6),
        category: 'astronomy',
        method: 'Conversion UTC vers echelle julienne continue.',
        usage: 'Base temporelle commune a tous les calculs astronomiques.'
      }),
      entry({
        key: 'lst',
        label: 'Temps sideral local',
        value: formatDeg(chart.context.lstDeg),
        category: 'astronomy',
        method: 'Temps sideral derive du JD et de la longitude.',
        usage: 'Sert a orienter le ciel local et a calculer les angles.'
      }),
      entry({
        key: 'obliquity',
        label: 'Obliquite vraie',
        value: formatDeg(chart.context.epsilonDeg),
        category: 'astronomy',
        method: 'Obliquite moyenne corrigee par nutation simplifiee.',
        usage: 'Conversion entre ecliptique et equatorial.'
      }),
      entry({
        key: 'mean-node',
        label: 'Noeud lunaire moyen',
        value: formatDeg(chart.nodes.meanNode),
        category: 'astronomy',
        method: 'Modele lisse du point nodal lunaire.',
        usage: 'Repere astronomique utile pour les lectures nodales.'
      }),
      entry({
        key: 'true-node',
        label: 'Noeud lunaire vrai',
        value: formatDeg(chart.nodes.trueNode),
        category: 'astronomy',
        method: 'Variante plus dynamique du noeud lunaire.',
        usage: 'Version plus mobile du meme repere nodal.'
      })
    ]
  });
}

function buildAstrologyGroup(chart) {
  return createCalculationGroup({
    key: 'astrology',
    title: 'Derivations astrologiques',
    category: 'astrology',
    items: [
      entry({
        key: 'asc',
        label: 'Ascendant',
        value: formatDeg(chart.angles.asc),
        category: 'astrology',
        method: 'Intersection ecliptique-horizon est a partir du temps sideral local.',
        usage: 'Point d entree du theme et base des maisons.'
      }),
      entry({
        key: 'mc',
        label: 'Milieu du ciel',
        value: formatDeg(chart.angles.mc),
        category: 'astrology',
        method: 'Point culminant local derive du repere equatorial.',
        usage: 'Base de la maison 10 et de la culmination.'
      }),
      entry({
        key: 'desc',
        label: 'Descendant',
        value: formatDeg(chart.angles.desc),
        category: 'astrology',
        method: 'Oppose geometrique exact de l Ascendant.',
        usage: 'Pole relationnel du theme.'
      }),
      entry({
        key: 'ic',
        label: 'Fond du ciel',
        value: formatDeg(chart.angles.ic),
        category: 'astrology',
        method: 'Oppose geometrique exact du MC.',
        usage: 'Pole racine / fondation du theme.'
      }),
      entry({
        key: 'house-system',
        label: 'Systeme de maisons',
        value: chart.houseSystem,
        category: 'astrology',
        method: 'Projection du ciel dans 12 secteurs selon le systeme choisi.',
        usage: 'Attribue les corps aux domaines de vie.'
      }),
      entry({
        key: 'ayanamsa',
        label: 'Ayanamsa',
        value: ayanamsaLabel(chart.options?.ayanamsa),
        category: 'astrology',
        method: 'Decalage applique uniquement a la lecture siderale.',
        usage: 'Permet le passage du tropical au sideral.'
      }),
      entry({
        key: 'aspects',
        label: 'Aspects detectes',
        value: String(chart.aspects?.length ?? 0),
        category: 'astrology',
        method: 'Recherche d ecarts angulaires proches des aspects majeurs.',
        usage: 'Structure les relations geometriques du theme.'
      })
    ]
  });
}

function buildLunarGroup(chart) {
  const phase = chart.moonPhase;
  const transition = chart.diagnostics?.moonConstellationTransition;

  return createCalculationGroup({
    key: 'lunar',
    title: 'Lecture lunaire',
    category: 'lunar',
    items: [
      entry({
        key: 'phase',
        label: 'Phase lunaire',
        value: phase?.label ?? 'indisponible',
        category: 'lunar',
        method: 'Geometrie Soleil-Terre-Lune.',
        usage: 'Lecture du cycle synodique lunaire.'
      }),
      entry({
        key: 'illumination',
        label: 'Illumination',
        value: phase ? phase.illuminationPercent.toFixed(2) : 'n/a',
        unit: '%',
        category: 'lunar',
        method: 'Fraction illuminee geocentrique du disque lunaire.',
        usage: 'Mesure quantitative de la phase.',
        expectedPrecision: 'Validee sur fixtures USNO.'
      }),
      entry({
        key: 'age',
        label: 'Age lunaire',
        value: phase ? phase.ageDays.toFixed(2) : 'n/a',
        unit: 'jours',
        category: 'lunar',
        method: 'Projection de l angle Soleil-Lune sur le mois synodique.',
        usage: 'Position relative de la Lune dans son cycle.'
      }),
      entry({
        key: 'elongation',
        label: 'Angle Soleil-Lune',
        value: phase ? formatDeg(phase.angleDeg) : 'n/a',
        category: 'lunar',
        method: 'Elongation geocentrique.',
        usage: 'Base de la determination de phase.'
      }),
      entry({
        key: 'moon-constellation',
        label: 'Constellation actuelle de la Lune',
        value: chart.bodies?.moon?.constellation?.name ?? 'n/a',
        category: 'lunar',
        method: 'Test RA/Dec sur dataset de constellations actuel.',
        usage: 'Repere astronomique stellaire de la position lunaire.'
      }),
      entry({
        key: 'moon-next-constellation',
        label: 'Prochaine constellation de la Lune',
        value: transition?.to?.name ?? 'indisponible',
        category: 'lunar',
        method: 'Recherche iterative du prochain changement de zone de constellation.',
        usage: 'Anticipe le prochain passage stellaire lunaire.',
        expectedPrecision: transition?.utcIso ? `${formatIsoWithOffset(transition.utcIso, chart.input?.utcOffset ?? 0)} / ${formatIsoUtc(transition.utcIso)}` : 'n/a'
      })
    ]
  });
}

function buildSymbolicGroup(chart) {
  const entries = Object.entries(chart.symbolic ?? {}).slice(0, 4);
  const items = [
    entry({
      key: 'yking',
      label: 'Y-King',
      value: 'correspondance active',
      category: 'symbolic',
      method: 'Association par longitude ecliptique.',
      usage: 'Lecture symbolique complementaire, non astronomique.'
    })
  ];

  for (const [key, value] of entries) {
    items.push(entry({
      key: `yking-${key}`,
      label: `${key} -> hexagramme`,
      value: String(value.yking.id),
      category: 'symbolic',
      method: 'Projection longitudinale dans 64 segments.',
      usage: 'Correspondance symbolique simplifiee.'
    }));
  }

  return createCalculationGroup({
    key: 'symbolic',
    title: 'Correspondances symboliques',
    category: 'symbolic',
    items
  });
}

function buildMissingGroup() {
  return createCalculationGroup({
    key: 'missing',
    title: 'Non implemente',
    category: 'missing',
    items: [
      entry({
        key: 'human-design',
        label: 'Human Design',
        value: 'non calcule',
        category: 'missing',
        method: 'Aucun moteur HD actif dans le depot.',
        usage: 'Pas de bodygraph, type, autorite, profil, porte ou canal.'
      }),
      entry({
        key: 'polygon-constellations',
        label: 'Constellations polygonales reelles',
        value: 'chantier ouvert',
        category: 'missing',
        method: 'Architecture de fallback prevue, dataset reel absent ou vide.',
        usage: 'Remplacer les zones optimisees simplifiees.'
      }),
      entry({
        key: 'observatory-ephemerides',
        label: 'Ephemerides observatoire',
        value: 'hors perimetre actuel',
        category: 'missing',
        method: 'Pas de JPL/DE ni de chaine astrometrique complete.',
        usage: 'Le projet reste une SPA offline serieuse, pas un logiciel certifie d almanach.'
      })
    ]
  });
}

export function buildCalculationGroups(chart) {
  return [
    buildAstronomyGroup(chart),
    buildAstrologyGroup(chart),
    buildLunarGroup(chart),
    buildSymbolicGroup(chart),
    buildMissingGroup()
  ];
}
