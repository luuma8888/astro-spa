import { normalizeDeg, sinDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';

export function computeMoon(T, epsilonDeg) {
  const L = normalizeDeg(218.3164477 + 481267.88123421 * T);
  const M = normalizeDeg(134.9633964 + 477198.8675055 * T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T);

  const longitude = normalizeDeg(
    L
    + 6.289 * sinDeg(M)
    + 1.274 * sinDeg(2 * D - M)
    + 0.658 * sinDeg(2 * D)
    + 0.214 * sinDeg(2 * M)
    - 0.186 * sinDeg(357.529 + 35999.050 * T)
  );

  const latitude =
    5.128 * sinDeg(F)
    + 0.280 * sinDeg(M + F)
    + 0.277 * sinDeg(M - F)
    + 0.173 * sinDeg(2 * D - F);

  const distanceKm = 385001 - 20905 * Math.cos(M * Math.PI / 180);
  const eq = eclipticToEquatorial(longitude, latitude, epsilonDeg);

  return {
    longitudeDeg: longitude,
    latitudeDeg: latitude,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceKm
  };
}
