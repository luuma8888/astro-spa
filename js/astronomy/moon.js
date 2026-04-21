import { normalizeDeg, sinDeg, cosDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { julianCenturiesSinceJ2000 } from '../core/time.js';
import { trueObliquityDeg } from '../core/obliquity.js';

export function computeMoon(T, epsilonDeg) {
  const L = normalizeDeg(218.3164477 + 481267.88123421 * T);
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T);
  const Mprime = normalizeDeg(134.9633964 + 477198.8675055 * T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T);

  const longitude = normalizeDeg(
    L
    + 6.289 * sinDeg(Mprime)
    + 1.274 * sinDeg(2 * D - Mprime)
    + 0.658 * sinDeg(2 * D)
    + 0.214 * sinDeg(2 * Mprime)
    - 0.186 * sinDeg(M)
    - 0.114 * sinDeg(2 * F)
    + 0.059 * sinDeg(2 * D - 2 * Mprime)
    - 0.057 * sinDeg(2 * D - M - Mprime)
    + 0.053 * sinDeg(2 * D + Mprime)
    + 0.046 * sinDeg(2 * D - M)
    + 0.041 * sinDeg(Mprime - M)
    - 0.035 * sinDeg(D)
    - 0.031 * sinDeg(Mprime + M)
    - 0.015 * sinDeg(2 * F - 2 * D)
    + 0.011 * sinDeg(Mprime - 4 * D)
  );

  const latitude =
    5.128 * sinDeg(F)
    + 0.280 * sinDeg(Mprime + F)
    + 0.277 * sinDeg(Mprime - F)
    + 0.173 * sinDeg(2 * D - F);

  const distanceKm =
    385000.56
    - 20905.355 * cosDeg(Mprime)
    - 3699.111 * cosDeg(2 * D - Mprime)
    - 2955.968 * cosDeg(2 * D)
    - 569.925 * cosDeg(2 * Mprime);
  const eq = eclipticToEquatorial(longitude, latitude, epsilonDeg);

  return {
    longitudeDeg: longitude,
    latitudeDeg: latitude,
    rightAscensionDeg: eq.raDeg,
    declinationDeg: eq.decDeg,
    distanceKm,
    meanLongitudeDeg: L,
    meanAnomalyDeg: Mprime,
    argumentLatitudeDeg: F,
    elongationDeg: D
  };
}

export function computeMoonFromJd(jd) {
  const T = julianCenturiesSinceJ2000(jd);
  return computeMoon(T, trueObliquityDeg(T));
}
