import { getConstellationLabel } from './displayLabels.js';

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

function formatClockWithOffset(value, utcOffsetHours = 0) {
  if (!value) return 'n/a';
  const parts = value.split(':').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return 'n/a';

  let totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  totalSeconds += Math.round(utcOffsetHours * 3600);
  totalSeconds %= 86400;
  if (totalSeconds < 0) totalSeconds += 86400;

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function formatIsoUtcText(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return `${formatHumanDate(date)} UTC`;
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
  return formatHumanDate(new Date(Date.UTC(year, Number(month) - 1, day, hours, minutes, 0)));
}

function formatIsoUtcRawText(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toISOString().replace('.000Z', ' UTC');
}

function formatIsoWithOffsetRawText(isoString, utcOffsetHours = 0) {
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

function formatHumanDate(date) {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).formatToParts(date);

  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const weekday = map.weekday ? map.weekday.charAt(0).toUpperCase() + map.weekday.slice(1) : '';
  return `${weekday} ${map.day} ${map.month} ${map.year} à ${map.hour}h${map.minute}`;
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
  const constellationLabel = getConstellationLabel(body?.constellation);
  return {
    longitudeText: formatDegrees(body?.longitudeDeg),
    latitudeText: formatDegrees(body?.latitudeDeg),
    tropicalSignText: body?.tropical?.name ?? 'n/a',
    siderealSignText: body?.sidereal?.name ?? 'n/a',
    houseText: body?.house != null ? String(body.house) : 'n/a',
    constellationText: constellationLabel.short,
    constellationTitleText: constellationLabel.title,
    constellationSourceText: body?.constellation?.source ?? 'n/a'
  };
}

function formatPhaseEvent(event, utcOffsetHours = 0) {
  if (!event?.utcIso) return null;

  return {
    labelText: event.label ?? 'n/a',
    localText: formatIsoWithOffsetText(event.utcIso, utcOffsetHours),
    localTitleText: formatIsoWithOffsetRawText(event.utcIso, utcOffsetHours),
    utcText: formatIsoUtcText(event.utcIso),
    utcTitleText: formatIsoUtcRawText(event.utcIso)
  };
}

function formatMoonRiseSet(riseSet, utcOffsetHours = 0) {
  if (!riseSet) return null;

  const status = riseSet.neverRises ? 'never-rises' : riseSet.circumpolar ? 'circumpolar' : 'normal';
  const statusText = status === 'never-rises'
    ? 'ne se lève pas à cette latitude / date'
    : status === 'circumpolar'
      ? 'circumpolaire'
      : 'normal';

  return {
    status,
    statusText,
    riseUtcText: formatClock(riseSet.rise),
    setUtcText: formatClock(riseSet.set),
    riseLocalText: formatClockWithOffset(riseSet.rise, utcOffsetHours),
    setLocalText: formatClockWithOffset(riseSet.set, utcOffsetHours)
  };
}

function formatConstellationTransition(transition, utcOffsetHours = 0) {
  if (!transition?.utcIso) return null;

  return {
    fromText: transition.from?.name ?? 'n/a',
    fromTitleText: getConstellationLabel(transition.from).title,
    toText: getConstellationLabel(transition.to).short,
    toTitleText: getConstellationLabel(transition.to).title,
    localText: formatIsoWithOffsetText(transition.utcIso, utcOffsetHours),
    localTitleText: formatIsoWithOffsetRawText(transition.utcIso, utcOffsetHours),
    utcText: formatIsoUtcText(transition.utcIso),
    utcTitleText: formatIsoUtcRawText(transition.utcIso)
  };
}

function formatOrbitEvent(event, utcOffsetHours = 0) {
  if (!event?.utcIso) return null;

  return {
    labelText: event.label ?? 'n/a',
    localText: formatIsoWithOffsetText(event.utcIso, utcOffsetHours),
    localTitleText: formatIsoWithOffsetRawText(event.utcIso, utcOffsetHours),
    utcText: formatIsoUtcText(event.utcIso),
    utcTitleText: formatIsoUtcRawText(event.utcIso),
    distanceText: Number.isFinite(event.distanceKm) ? `${Math.round(event.distanceKm).toLocaleString('fr-FR')} km` : null,
    eclipseTypeText: event.eclipseType ?? null,
    nodeDeltaText: Number.isFinite(event.nodeDeltaDeg) ? formatDegrees(event.nodeDeltaDeg, 2) : null
  };
}

export function createMoonPhasePresentation(phase, utcOffsetHours = 0) {
  if (!phase) return null;
  const currentConstellationLabel = getConstellationLabel(phase.currentConstellation);

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
    nextMajorPhaseText: formatPhaseEvent(phase.nextMajorPhase, utcOffsetHours),
    currentConstellationText: currentConstellationLabel.short,
    currentConstellationTitleText: currentConstellationLabel.title,
    currentConstellationSourceText: phase.currentConstellation?.source ?? 'n/a',
    nextConstellationText: formatConstellationTransition(phase.nextConstellationTransition, utcOffsetHours),
    visibilityText: phase.visibilityText ?? 'n/a',
    trajectoryText: phase.trajectoryText ?? 'n/a',
    riseSetText: formatMoonRiseSet(phase.riseSet, utcOffsetHours),
    nextNodeText: formatOrbitEvent(phase.nextNode, utcOffsetHours),
    nextPerigeeText: formatOrbitEvent(phase.nextPerigee, utcOffsetHours),
    nextApogeeText: formatOrbitEvent(phase.nextApogee, utcOffsetHours),
    nextLunarEclipseText: formatOrbitEvent(phase.nextLunarEclipse, utcOffsetHours)
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
