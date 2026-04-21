import { normalizeDeg, sinDeg, cosDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { julianCenturiesSinceJ2000 } from '../core/time.js';
import { trueObliquityDeg } from '../core/obliquity.js';

export function computeSun(T, epsilonDeg) {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T);
  const eccentricity = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinDeg(M)
    + (0.019993 - 0.000101 * T) * sinDeg(2 * M)
    + 0.000289 * sinDeg(3 * M);

  const trueLongitude = normalizeDeg(L0 + C);
  const trueAnomaly = normalizeDeg(M + C);
  const omega = 125.04 - 1934.136 * T;
  const apparentLongitude = normalizeDeg(trueLongitude - 0.00569 - 0.00478 * sinDeg(omega));
  const distanceAu = (1.000001018 * (1 - eccentricity * eccentricity)) / (1 + eccentricity * cosDeg(trueAnomaly));
  const eq = eclipticToEquatorial(apparentLongitude, 0, epsilonDeg);

  return {
    longitudeDeg: apparentLongitude,
    latitudeDeg: 0,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceAu,
    geometricLongitudeDeg: trueLongitude,
    meanLongitudeDeg: L0,
    meanAnomalyDeg: M,
    trueAnomalyDeg: trueAnomaly
  };
}

export function computeSunFromJd(jd) {
  const T = julianCenturiesSinceJ2000(jd);
  return computeSun(T, trueObliquityDeg(T));
}
