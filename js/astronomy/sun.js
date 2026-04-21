import { normalizeDeg, sinDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';

export function computeSun(T, epsilonDeg) {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T);

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinDeg(M)
    + (0.019993 - 0.000101 * T) * sinDeg(2 * M)
    + 0.000289 * sinDeg(3 * M);

  const trueLongitude = normalizeDeg(L0 + C);
  const distanceAu = 1.00014 - 0.01671 * Math.cos(M * Math.PI / 180) - 0.00014 * Math.cos(2 * M * Math.PI / 180);
  const eq = eclipticToEquatorial(trueLongitude, 0, epsilonDeg);

  return {
    longitudeDeg: trueLongitude,
    latitudeDeg: 0,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceAu
  };
}
