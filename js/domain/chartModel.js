function normalizeCalculationValue(value, unit) {
  if (value === null || value === undefined || value === '') {
    return unit ? `n/a ${unit}` : 'n/a';
  }

  return unit ? `${value} ${unit}` : String(value);
}

function formatNumeric(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : 'n/a';
}

function formatDegrees(value, digits = 4) {
  return Number.isFinite(value) ? `${value.toFixed(digits)}°` : 'n/a';
}

function formatPercent(value, digits = 2) {
  return Number.isFinite(value) ? `${value.toFixed(digits)}%` : 'n/a';
}

function formatClock(value) {
  return value ?? 'n/a';
}

function formatIsoUtcText(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toISOString().replace('.000Z', ' UTC');
}

function formatIsoWithOffsetText(isoString, utcOffsetHours = 0) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';

  const shifted = new Date(date.getTime() + Math.round(utcOffsetHours * 60) * 60000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const sign = utcOffsetHours >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(Math.round(utcOffsetHours * 60));
  const offsetHoursPart = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const offsetMinutesPart = String(absoluteMinutes % 60).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} UTC${sign}${offsetHoursPart}:${offsetMinutesPart}`;
}

export function createCalculationItem({
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
  return {
    key,
    label,
    category,
    value,
    unit,
    valueText: normalizeCalculationValue(value, unit),
    method,
    usage,
    source,
    expectedPrecision,
    notes
  };
}

export function createCalculationGroup({ key, title, category, items }) {
  return {
    key,
    title,
    category,
    items
  };
}

export function createCalculationCatalog(groups = []) {
  const byKey = {};

  for (const group of groups) {
    for (const item of group.items ?? []) {
      byKey[item.key] = item;
    }
  }

  return {
    groups,
    byKey
  };
}

export function createBodyPresentation(body) {
  return {
    longitudeText: formatDegrees(body?.longitudeDeg),
    latitudeText: formatDegrees(body?.latitudeDeg),
    tropicalSignText: body?.tropical?.name ?? 'n/a',
    siderealSignText: body?.sidereal?.name ?? 'n/a',
    houseText: body?.house != null ? String(body.house) : 'n/a',
    constellationText: body?.constellation?.name ?? 'n/a',
    constellationSourceText: body?.constellation?.source ?? 'n/a'
  };
}

function formatPhaseEvent(event, utcOffsetHours = 0) {
  if (!event?.utcIso) return null;

  return {
    labelText: event.label ?? 'n/a',
    localText: formatIsoWithOffsetText(event.utcIso, utcOffsetHours),
    utcText: formatIsoUtcText(event.utcIso)
  };
}

export function createMoonPhasePresentation(phase, utcOffsetHours = 0) {
  if (!phase) return null;

  return {
    labelText: phase.label ?? 'n/a',
    ageText: `${formatNumeric(phase.ageDays)} jours`,
    trueAgeText: `${formatNumeric(phase.trueAgeDays ?? phase.ageDays)} jours`,
    illuminationText: formatPercent(phase.illuminationPercent),
    angleText: formatDegrees(phase.angleDeg, 2),
    brightLimbAngleText: formatDegrees(phase.brightLimbPhaseAngleDeg, 2),
    trendText: phase.waxing ? 'Croissante' : 'Décroissante',
    distanceText: Number.isFinite(phase.distanceKm) ? `${Math.round(phase.distanceKm).toLocaleString('fr-FR')} km` : 'n/a',
    apparentDiameterText: Number.isFinite(phase.apparentAngularDiameterArcMin)
      ? `${formatNumeric(phase.apparentAngularDiameterArcMin, 2)}′`
      : 'n/a',
    cycleLengthText: `${formatNumeric(phase.synodicCycleLengthDays ?? 29.530588853)} jours`,
    previousMajorPhaseText: formatPhaseEvent(phase.previousMajorPhase, utcOffsetHours),
    nextMajorPhaseText: formatPhaseEvent(phase.nextMajorPhase, utcOffsetHours)
  };
}

export function createRiseSetPresentation(data) {
  if (!data) return null;

  return {
    status: data.neverRises ? 'never-rises' : data.circumpolar ? 'circumpolar' : 'normal',
    riseText: formatClock(data.rise),
    setText: formatClock(data.set)
  };
}

export function createAnglesPresentation(angles) {
  if (!angles) return null;

  return {
    ascText: formatDegrees(angles.asc, 2),
    mcText: formatDegrees(angles.mc, 2),
    descText: formatDegrees(angles.desc, 2),
    icText: formatDegrees(angles.ic, 2)
  };
}

export function createHouseDetails(houses = []) {
  return houses.map((cusp, index) => ({
    index: index + 1,
    longitudeDeg: cusp,
    longitudeText: formatDegrees(cusp, 2)
  }));
}

export function createAspectPresentation(aspect) {
  if (!aspect) return null;

  return {
    angleText: formatDegrees(aspect.delta, 2),
    orbText: formatDegrees(aspect.orb, 2),
    exactAngleText: formatDegrees(aspect.exactAngle, 2),
    summaryText: `${aspect.bodyA} ${aspect.aspect} ${aspect.bodyB}`,
    emphasisText: aspect.orb <= 1.5
      ? 'Aspect très serré'
      : aspect.orb <= 3
        ? 'Aspect structurant'
        : 'Aspect notable'
  };
}

export function createModelMeta() {
  return {
    precision: {
      coreAstronomy: {
        level: 'élevée pragmatique',
        summary: 'Les positions Soleil/Lune, la phase et le rise/set sont calculés numériquement avec validation locale, mais ne constituent pas des éphémérides d’observatoire.',
        evidence: 'Validation locale sur fixtures USNO pour lever/coucher Soleil-Lune et illumination.'
      },
      derivedAstrology: {
        level: 'dépendante du modèle astronomique',
        summary: 'Signes, maisons et aspects sont des lectures dérivées de positions calculées; leur cohérence dépend directement de la qualité des coordonnées de départ.',
        evidence: 'Ascendant, MC, maisons et aspects sont issus de projections géométriques sur les positions calculées.'
      },
      interpretation: {
        level: 'langage humain interprétatif',
        summary: 'La synthèse textuelle traduit les structures calculées en langage astrologique lisible; elle ne doit pas être confondue avec une mesure physique.',
        evidence: 'Les blocs de synthèse reformulent les placements, dominantes et aspects en vocabulaire humain.'
      }
    },
    interpretationPolicy: [
      'Mesure brute: valeur astronomique ou géométrique calculée directement.',
      'Lecture dérivée: signe, maison, aspect ou phase construits à partir des mesures brutes.',
      'Traduction humaine: reformulation astrologique destinée à être compréhensible, sans prétention de mesure.'
    ]
  };
}

export function createEmptyChart() {
  return {
    input: null,
    options: null,
    context: null,
    meta: createModelMeta(),
    calculations: createCalculationCatalog(),
    bodies: {},
    planets: {},
    houses: [],
    angles: null,
    houseSystem: null,
    aspects: [],
    symbolic: {},
    diagnostics: {},
    synthesis: null
  };
}
