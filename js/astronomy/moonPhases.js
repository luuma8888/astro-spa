import { normalizeDeg } from '../core/angles.js';

const SYNODIC_MONTH = 29.530588853;

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
