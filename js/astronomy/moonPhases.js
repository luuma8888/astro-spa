import { normalizeDeg, degToRad, radToDeg } from '../core/angles.js';
import { computeMoonPhaseEventsAround } from './moonPhaseEvents.js';

const SYNODIC_MONTH = 29.530588853;
const KM_PER_AU = 149597870.7;
const MOON_RADIUS_KM = 1737.4;

export function moonPhaseAngle(sunLonDeg, moonLonDeg) {
  return normalizeDeg(moonLonDeg - sunLonDeg);
}

export function moonIlluminationFraction(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg) * Math.PI / 180;
  return (1 - Math.cos(angle)) / 2;
}

export function moonAgeDays(sunLonDeg, moonLonDeg) {
  return (moonPhaseAngle(sunLonDeg, moonLonDeg) / 360) * SYNODIC_MONTH;
}

export function moonIlluminationFractionPrecise(sunBody, moonBody) {
  const phaseAngle = moonPhaseAngle(sunBody.longitudeDeg, moonBody.longitudeDeg);
  const phaseAngleRad = degToRad(phaseAngle);
  const sunDistanceKm = (sunBody.distanceAu ?? 1) * KM_PER_AU;
  const moonDistanceKm = moonBody.distanceKm ?? 384400;
  const i = Math.atan2(
    sunDistanceKm * Math.sin(phaseAngleRad),
    moonDistanceKm - sunDistanceKm * Math.cos(phaseAngleRad)
  );

  return {
    illuminationFraction: (1 + Math.cos(i)) / 2,
    brightLimbPhaseAngleDeg: normalizeDeg(radToDeg(i))
  };
}

export function getMoonPhaseLabel(sunLonDeg, moonLonDeg) {
  const phase = moonPhaseAngle(sunLonDeg, moonLonDeg);

  if (phase < 22.5 || phase >= 337.5) return 'Nouvelle Lune';
  if (phase < 67.5) return 'Premier croissant';
  if (phase < 112.5) return 'Premier quartier';
  if (phase < 157.5) return 'Gibbeuse croissante';
  if (phase < 202.5) return 'Pleine Lune';
  if (phase < 247.5) return 'Gibbeuse décroissante';
  if (phase < 292.5) return 'Dernier quartier';
  return 'Dernier croissant';
}

export function isWaxingMoon(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg);
  return angle > 0 && angle < 180;
}

export function buildMoonPhaseData(sunLonDeg, moonLonDeg) {
  const angle = moonPhaseAngle(sunLonDeg, moonLonDeg);
  const illumination = moonIlluminationFraction(sunLonDeg, moonLonDeg);
  const ageDays = moonAgeDays(sunLonDeg, moonLonDeg);
  const waxing = isWaxingMoon(sunLonDeg, moonLonDeg);

  return {
    angleDeg: angle,
    illuminationFraction: illumination,
    illuminationPercent: illumination * 100,
    ageDays,
    label: getMoonPhaseLabel(sunLonDeg, moonLonDeg),
    waxing,
    waning: !waxing
  };
}

export function buildMoonPhaseDataFromBodies(sunBody, moonBody) {
  const angle = moonPhaseAngle(sunBody.longitudeDeg, moonBody.longitudeDeg);
  const precise = moonIlluminationFractionPrecise(sunBody, moonBody);
  const ageDays = moonAgeDays(sunBody.longitudeDeg, moonBody.longitudeDeg);
  const waxing = isWaxingMoon(sunBody.longitudeDeg, moonBody.longitudeDeg);

  return {
    angleDeg: angle,
    illuminationFraction: precise.illuminationFraction,
    illuminationPercent: precise.illuminationFraction * 100,
    brightLimbPhaseAngleDeg: precise.brightLimbPhaseAngleDeg,
    ageDays,
    label: getMoonPhaseLabel(sunBody.longitudeDeg, moonBody.longitudeDeg),
    waxing,
    waning: !waxing
  };
}

export function buildMoonPhaseDataFromBodiesAtJd(sunBody, moonBody, jd) {
  const phase = buildMoonPhaseDataFromBodies(sunBody, moonBody);
  const events = computeMoonPhaseEventsAround(jd);
  const previousNewMoon = events.previousByKey.newMoon ?? null;
  const nextNewMoon = events.nextByKey.newMoon ?? null;
  const currentCycleLengthDays = previousNewMoon && nextNewMoon
    ? nextNewMoon.jd - previousNewMoon.jd
    : SYNODIC_MONTH;
  const trueAgeDays = previousNewMoon ? jd - previousNewMoon.jd : phase.ageDays;
  const synodicProgress = currentCycleLengthDays > 0 ? trueAgeDays / currentCycleLengthDays : null;
  const apparentAngularDiameterDeg = Number.isFinite(moonBody?.distanceKm) && moonBody.distanceKm > 0
    ? radToDeg(2 * Math.atan(MOON_RADIUS_KM / moonBody.distanceKm))
    : null;

  return {
    ...phase,
    jd,
    distanceKm: moonBody?.distanceKm ?? null,
    trueAgeDays,
    synodicCycleLengthDays: currentCycleLengthDays,
    synodicProgress,
    apparentAngularDiameterDeg,
    apparentAngularDiameterArcMin: Number.isFinite(apparentAngularDiameterDeg)
      ? apparentAngularDiameterDeg * 60
      : null,
    previousMajorPhase: events.previous[0] ?? null,
    nextMajorPhase: events.next[0] ?? null,
    previousNewMoon,
    nextNewMoon,
    events
  };
}
