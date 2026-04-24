import { formatDeg, formatIsoUtc, formatIsoWithOffset } from '../ui/formatters.js';
import { createCalculationGroup, createCalculationItem } from './chartModel.js';
import { getConstellationLabel } from './displayLabels.js';
import { getConstellationDatasetStatus } from '../astrology/constellations.js';

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
  const constellationDataset = getConstellationDatasetStatus();

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
      }),
      entry({
        key: 'constellation-dataset',
        label: 'Couverture du dataset de constellations',
        value: `${constellationDataset.polygonCount}/${constellationDataset.optimizedCount}`,
        category: 'astronomy',
        method: 'Le moteur Roman 1987 precesse d abord vers B1875 pour la determination exacte; la couche polygonale puis le dataset optimise restent disponibles en repli.',
        usage: 'Permet de savoir si la constellation affichee vient de la couche exacte Roman87, d un polygone ou d un fallback simplifie.',
        expectedPrecision: `${(constellationDataset.coverageRatio * 100).toFixed(1)}% de couverture polygonale`,
        notes: constellationDataset.syntheticPolygonCount
          ? `${constellationDataset.roman87RowCount} lignes Roman87 et ${constellationDataset.roman87NameCount} noms IAU sont charges; ${constellationDataset.syntheticPolygonCount} constellations polygonales sont synthetiques et ${constellationDataset.exactPolygonCount} sont exactes; ${constellationDataset.fallbackCount} restent en fallback optimise.`
          : constellationDataset.fallbackCount
            ? `${constellationDataset.roman87RowCount} lignes Roman87 et ${constellationDataset.roman87NameCount} noms IAU sont charges; ${constellationDataset.fallbackCount} constellations utilisent encore le fallback optimise.`
            : 'Couverture polygonale complete.'
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

function buildFrameworksGroup(chart) {
  const frameworks = chart.meta?.frameworks ?? {};

  return createCalculationGroup({
    key: 'frameworks',
    title: 'Cadres de lecture',
    category: 'frameworks',
    items: [
      entry({
        key: 'framework-astronomy',
        label: 'Astronomie',
        value: 'mesure du ciel',
        category: 'frameworks',
        method: frameworks.astronomy?.summary ?? 'n/a',
        usage: frameworks.astronomy?.scope ?? 'n/a'
      }),
      entry({
        key: 'framework-tropical',
        label: 'Astrologie tropicale',
        value: frameworks.tropical?.defaultInApp ? 'lecture principale affichée' : 'lecture disponible',
        category: 'frameworks',
        method: frameworks.tropical?.summary ?? 'n/a',
        usage: frameworks.tropical?.scope ?? 'n/a'
      }),
      entry({
        key: 'framework-sidereal',
        label: 'Astrologie sidérale',
        value: ayanamsaLabel(chart.options?.ayanamsa),
        category: 'frameworks',
        method: frameworks.sidereal?.summary ?? 'n/a',
        usage: frameworks.sidereal?.scope ?? 'n/a'
      }),
      entry({
        key: 'framework-human-design',
        label: 'Design humain',
        value: chart.humanDesign ? 'actif partiel' : 'partiel / non implémenté',
        category: 'frameworks',
        method: frameworks.humanDesign?.summary ?? 'n/a',
        usage: frameworks.humanDesign?.scope ?? 'n/a'
      })
    ]
  });
}

function buildLunarGroup(chart) {
  const phase = chart.moonPhase;
  const transition = chart.diagnostics?.moonConstellationTransition;
  const orbit = chart.diagnostics?.moonOrbit;
  const riseSet = chart.riseSet?.moon;

  const nextNodeText = orbit?.nextNode?.utcIso
    ? `${orbit.nextNode.label} — ${formatIsoWithOffset(orbit.nextNode.utcIso, chart.input?.utcOffset ?? 0)}`
    : 'indisponible';
  const nextPerigeeText = orbit?.nextPerigee?.utcIso
    ? `${formatIsoWithOffset(orbit.nextPerigee.utcIso, chart.input?.utcOffset ?? 0)} — ${Math.round(orbit.nextPerigee.distanceKm).toLocaleString('fr-FR')} km`
    : 'indisponible';
  const nextApogeeText = orbit?.nextApogee?.utcIso
    ? `${formatIsoWithOffset(orbit.nextApogee.utcIso, chart.input?.utcOffset ?? 0)} — ${Math.round(orbit.nextApogee.distanceKm).toLocaleString('fr-FR')} km`
    : 'indisponible';
  const nextEclipseText = orbit?.nextLunarEclipse?.utcIso
    ? `${formatIsoWithOffset(orbit.nextLunarEclipse.utcIso, chart.input?.utcOffset ?? 0)} — ${orbit.nextLunarEclipse.eclipseType}`
    : 'indisponible';
  const riseSetText = riseSet?.neverRises
    ? 'ne se lève pas à cette latitude / date'
    : riseSet?.circumpolar
      ? 'circumpolaire'
      : riseSet
        ? `lever ${riseSet.rise ?? 'n/a'} UTC / coucher ${riseSet.set ?? 'n/a'} UTC`
        : 'indisponible';

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
        value: getConstellationLabel(chart.bodies?.moon?.constellation).short,
        category: 'lunar',
        method: 'Test RA/Dec sur dataset de constellations actuel.',
        usage: 'Repere astronomique stellaire de la position lunaire.'
      }),
      entry({
        key: 'moon-next-constellation',
        label: 'Prochaine constellation de la Lune',
        value: transition?.to ? getConstellationLabel(transition.to).short : 'indisponible',
        category: 'lunar',
        method: 'Recherche iterative du prochain changement de zone de constellation.',
        usage: 'Anticipe le prochain passage stellaire lunaire.',
        expectedPrecision: transition?.utcIso ? `${formatIsoWithOffset(transition.utcIso, chart.input?.utcOffset ?? 0)} / ${formatIsoUtc(transition.utcIso)}` : 'n/a'
      }),
      entry({
        key: 'moon-visibility',
        label: 'Visibilité lunaire',
        value: phase?.visibilityText ?? 'indisponible',
        category: 'lunar',
        method: 'Heuristique issue de la phase et du comportement lever/coucher.',
        usage: 'Donne une lecture pratique de la visibilité probable.'
      }),
      entry({
        key: 'moon-trajectory',
        label: 'Trajectoire lunaire',
        value: phase?.trajectoryText ?? 'indisponible',
        category: 'lunar',
        method: 'Lecture de la latitude écliptique et de la direction vers le prochain nœud.',
        usage: 'Situe la Lune par rapport au plan de l écliptique.'
      }),
      entry({
        key: 'moon-rise-set',
        label: 'Lever / coucher de la Lune',
        value: riseSetText,
        category: 'lunar',
        method: 'Recherche itérative de franchissement d horizon lunaire apparent.',
        usage: 'Informe sur la présence de la Lune au-dessus de l horizon local.'
      }),
      entry({
        key: 'moon-next-node',
        label: 'Prochain nœud lunaire',
        value: nextNodeText,
        category: 'lunar',
        method: 'Recherche du prochain croisement de latitude écliptique nulle.',
        usage: 'Repère le prochain passage nodal de la Lune.'
      }),
      entry({
        key: 'moon-next-perigee',
        label: 'Prochain périgée',
        value: nextPerigeeText,
        category: 'lunar',
        method: 'Recherche du prochain minimum de distance Terre-Lune.',
        usage: 'Anticipe le prochain resserrement orbital lunaire.'
      }),
      entry({
        key: 'moon-next-apogee',
        label: 'Prochain apogée',
        value: nextApogeeText,
        category: 'lunar',
        method: 'Recherche du prochain maximum de distance Terre-Lune.',
        usage: 'Anticipe le prochain éloignement orbital lunaire.'
      }),
      entry({
        key: 'moon-next-eclipse',
        label: 'Prochaine éclipse de Lune',
        value: nextEclipseText,
        category: 'lunar',
        method: 'Recherche de la prochaine Pleine Lune proche d un nœud.',
        usage: 'Signale la prochaine opportunité d éclipse lunaire.'
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

function buildHumanDesignGroup(chart) {
  const hd = chart.humanDesign;
  if (!hd) return null;

  const personalitySun = hd.personality?.Sun;
  const designSun = hd.design?.Sun;
  const personalityEarth = hd.personality?.Earth;
  const designEarth = hd.design?.Earth;

  return createCalculationGroup({
    key: 'human-design',
    title: 'Human Design',
    category: 'symbolic',
    items: [
      entry({
        key: 'human-design-design-date',
        label: 'Date de design',
        value: hd.designUtcIso,
        category: 'symbolic',
        method: 'Recherche inverse du point où le Soleil est 88° en amont de la naissance.',
        usage: 'Base des activations inconscientes.'
      }),
      entry({
        key: 'human-design-design-age',
        label: 'Ecart naissance-design',
        value: `${hd.designAgeDays.toFixed(3)} jours`,
        category: 'symbolic',
        method: 'Différence entre JD natal et JD de design.',
        usage: 'Mesure l’écart temporel du design.'
      }),
      entry({
        key: 'human-design-solar-arc',
        label: 'Arc solaire réel',
        value: `${hd.solarArcActualDeg.toFixed(6)}°`,
        category: 'symbolic',
        method: 'Écart exact entre Soleil natal et Soleil de design.',
        usage: 'Vérifie le calage effectif de la recherche de design.'
      }),
      entry({
        key: 'human-design-profile',
        label: 'Profil',
        value: hd.profile ?? 'n/a',
        category: 'symbolic',
        method: 'Ligne du Soleil conscient / ligne du Soleil inconscient.',
        usage: 'Donne la structure de profil de base sans bodygraph.'
      }),
      entry({
        key: 'human-design-personality-sun',
        label: 'Soleil conscient',
        value: personalitySun ? `${personalitySun.gate}.${personalitySun.line} c${personalitySun.color} t${personalitySun.tone} b${personalitySun.base}` : 'n/a',
        category: 'symbolic',
        method: 'Projection longitudinale sur la Rave Mandala.',
        usage: 'Activation principale de personnalité.'
      }),
      entry({
        key: 'human-design-design-sun',
        label: 'Soleil inconscient',
        value: designSun ? `${designSun.gate}.${designSun.line} c${designSun.color} t${designSun.tone} b${designSun.base}` : 'n/a',
        category: 'symbolic',
        method: 'Projection à la date de design.',
        usage: 'Activation principale du design.'
      }),
      entry({
        key: 'human-design-personality-earth',
        label: 'Terre consciente',
        value: personalityEarth ? `${personalityEarth.gate}.${personalityEarth.line} c${personalityEarth.color} t${personalityEarth.tone} b${personalityEarth.base}` : 'n/a',
        category: 'symbolic',
        method: 'Opposition exacte du Soleil natal.',
        usage: 'Ancrage complémentaire de la personnalité.'
      }),
      entry({
        key: 'human-design-design-earth',
        label: 'Terre inconsciente',
        value: designEarth ? `${designEarth.gate}.${designEarth.line} c${designEarth.color} t${designEarth.tone} b${designEarth.base}` : 'n/a',
        category: 'symbolic',
        method: 'Opposition exacte du Soleil de design.',
        usage: 'Ancrage complémentaire du design.'
      }),
      entry({
        key: 'human-design-missing-bodies',
        label: 'Corps absents',
        value: hd.missingBodies?.join(', ') || 'aucun',
        category: 'symbolic',
        method: 'Comparaison au set standard du Design Humain.',
        usage: 'Repère les corps encore manquants dans le moteur.'
      })
    ]
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
        label: 'Human Design avance',
        value: 'partiellement calcule',
        category: 'missing',
        method: 'Le moteur calcule design date et activations planetaires, mais pas encore la logique complète du bodygraph.',
        usage: 'Restent à ajouter centres, canaux, définition, type, autorité, profil, croix d’incarnation et Pluto.'
      }),
      entry({
        key: 'polygon-constellations',
        label: 'Constellations polygonales reelles',
        value: 'partiellement remplacees par un dataset polygonal de transition',
        category: 'missing',
        method: 'Le moteur polygonal est branche, mais la source actuelle peut rester synthetique tant que les frontieres IAU exactes ne sont pas injectees.',
        usage: 'Remplacer ensuite les polygones de bornes par un vrai dataset de frontieres.'
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
    buildFrameworksGroup(chart),
    buildAstronomyGroup(chart),
    buildAstrologyGroup(chart),
    buildLunarGroup(chart),
    buildSymbolicGroup(chart),
    buildHumanDesignGroup(chart),
    buildMissingGroup()
  ].filter(Boolean);
}
