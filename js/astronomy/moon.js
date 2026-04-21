import { normalizeDeg, sinDeg, cosDeg } from '../core/angles.js';
import { eclipticToEquatorial } from '../core/coordinates.js';
import { julianCenturiesSinceJ2000 } from '../core/time.js';
import { trueObliquityDeg } from '../core/obliquity.js';

const LONGITUDE_DISTANCE_TERMS = [
  { d: 0, m: 0, mp: 1, f: 0, lon: 6.288774, dist: -20905.355 },
  { d: 2, m: 0, mp: -1, f: 0, lon: 1.274027, dist: -3699.111 },
  { d: 2, m: 0, mp: 0, f: 0, lon: 0.658314, dist: -2955.968 },
  { d: 0, m: 0, mp: 2, f: 0, lon: 0.213618, dist: -569.925 },
  { d: 0, m: 1, mp: 0, f: 0, lon: -0.185116, dist: 48.888 },
  { d: 0, m: 0, mp: 0, f: 2, lon: -0.114332, dist: 0 },
  { d: 2, m: 0, mp: -2, f: 0, lon: 0.058793, dist: 246.158 },
  { d: 2, m: -1, mp: -1, f: 0, lon: 0.057066, dist: -152.138 },
  { d: 2, m: 0, mp: 1, f: 0, lon: 0.053322, dist: -170.733 },
  { d: 2, m: -1, mp: 0, f: 0, lon: 0.045758, dist: -204.586 },
  { d: 0, m: 1, mp: -1, f: 0, lon: -0.040923, dist: -129.620 },
  { d: 1, m: 0, mp: 0, f: 0, lon: -0.034720, dist: 108.743 },
  { d: 0, m: 1, mp: 1, f: 0, lon: -0.030383, dist: 104.755 },
  { d: 2, m: 0, mp: 0, f: -2, lon: 0.015327, dist: 10.321 },
  { d: 0, m: 0, mp: 1, f: 2, lon: -0.012528, dist: 0 },
  { d: 0, m: 0, mp: 1, f: -2, lon: 0.010980, dist: 79.661 },
  { d: 4, m: 0, mp: -1, f: 0, lon: 0.010675, dist: -34.782 },
  { d: 0, m: 0, mp: 3, f: 0, lon: 0.010034, dist: -23.210 },
  { d: 4, m: 0, mp: -2, f: 0, lon: 0.008548, dist: -21.636 },
  { d: 2, m: 1, mp: -1, f: 0, lon: -0.007888, dist: 24.208 },
  { d: 2, m: 1, mp: 0, f: 0, lon: -0.006766, dist: 30.824 },
  { d: 1, m: 0, mp: -1, f: 0, lon: -0.005163, dist: -8.379 },
  { d: 1, m: 1, mp: 0, f: 0, lon: 0.004987, dist: -16.675 },
  { d: 2, m: 0, mp: 2, f: 0, lon: 0.004036, dist: -12.831 },
  { d: 2, m: 0, mp: -3, f: 0, lon: 0.003994, dist: 14.403 },
  { d: 2, m: 1, mp: -2, f: 0, lon: 0.003861, dist: -11.650 },
  { d: 0, m: 1, mp: -2, f: 0, lon: -0.003665, dist: -7.003 },
  { d: 2, m: -1, mp: 1, f: 0, lon: 0.002695, dist: 0 },
  { d: 2, m: 0, mp: 1, f: -2, lon: 0.002602, dist: 0 },
  { d: 2, m: -1, mp: -2, f: 0, lon: 0.002396, dist: 0 }
];

const LATITUDE_TERMS = [
  { d: 0, m: 0, mp: 0, f: 1, lat: 5.128122 },
  { d: 0, m: 0, mp: 1, f: 1, lat: 0.280602 },
  { d: 0, m: 0, mp: 1, f: -1, lat: 0.277693 },
  { d: 2, m: 0, mp: 0, f: -1, lat: 0.173237 },
  { d: 2, m: 0, mp: -1, f: 1, lat: 0.055413 },
  { d: 2, m: 0, mp: -1, f: -1, lat: 0.046271 },
  { d: 2, m: 0, mp: 0, f: 1, lat: 0.032573 },
  { d: 0, m: 0, mp: 2, f: 1, lat: 0.017198 },
  { d: 2, m: 0, mp: 1, f: -1, lat: 0.009266 },
  { d: 0, m: 0, mp: 2, f: -1, lat: 0.008822 },
  { d: 2, m: -1, mp: 0, f: -1, lat: 0.008216 },
  { d: 2, m: 0, mp: -2, f: -1, lat: 0.004324 },
  { d: 2, m: 0, mp: 1, f: 1, lat: 0.004200 },
  { d: 2, m: 1, mp: 0, f: -1, lat: -0.003359 },
  { d: 2, m: -1, mp: -1, f: 1, lat: 0.002463 },
  { d: 2, m: -1, mp: 0, f: 1, lat: 0.002211 },
  { d: 2, m: -1, mp: -1, f: -1, lat: 0.002065 },
  { d: 0, m: 1, mp: -1, f: -1, lat: -0.001870 },
  { d: 4, m: 0, mp: -1, f: -1, lat: 0.001828 },
  { d: 0, m: 1, mp: 0, f: 1, lat: -0.001794 },
  { d: 0, m: 0, mp: 0, f: 3, lat: -0.001749 },
  { d: 0, m: 1, mp: -1, f: 1, lat: -0.001565 },
  { d: 1, m: 0, mp: 0, f: 1, lat: -0.001491 },
  { d: 0, m: 1, mp: 1, f: 1, lat: -0.001475 },
  { d: 0, m: 1, mp: 1, f: -1, lat: -0.001410 },
  { d: 0, m: 1, mp: 0, f: -1, lat: -0.001344 },
  { d: 1, m: 0, mp: 0, f: -1, lat: -0.001335 },
  { d: 0, m: 0, mp: 3, f: 1, lat: 0.001107 },
  { d: 4, m: 0, mp: 0, f: -1, lat: 0.001021 },
  { d: 4, m: 0, mp: -1, f: 1, lat: 0.000833 }
];

function termEccentricityFactor(term, E) {
  if (term.m === 0) return 1;
  return E ** Math.abs(term.m);
}

function termArgumentDeg(term, D, M, Mprime, F) {
  return term.d * D + term.m * M + term.mp * Mprime + term.f * F;
}

export function computeMoon(T, epsilonDeg) {
  const L = normalizeDeg(218.3164477 + 481267.88123421 * T);
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T);
  const Mprime = normalizeDeg(134.9633964 + 477198.8675055 * T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T);
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const A1 = normalizeDeg(119.75 + 131.849 * T);
  const A2 = normalizeDeg(53.09 + 479264.290 * T);
  const A3 = normalizeDeg(313.45 + 481266.484 * T);

  let longitudeCorrection = 0;
  let latitudeCorrection = 0;
  let distanceCorrectionKm = 0;

  for (const term of LONGITUDE_DISTANCE_TERMS) {
    const factor = termEccentricityFactor(term, E);
    const angleDeg = termArgumentDeg(term, D, M, Mprime, F);
    longitudeCorrection += term.lon * factor * sinDeg(angleDeg);
    distanceCorrectionKm += term.dist * factor * cosDeg(angleDeg);
  }

  for (const term of LATITUDE_TERMS) {
    const factor = termEccentricityFactor(term, E);
    const angleDeg = termArgumentDeg(term, D, M, Mprime, F);
    latitudeCorrection += term.lat * factor * sinDeg(angleDeg);
  }

  // Small additive perturbations preserved from the truncated Meeus-style model.
  longitudeCorrection += 0.003958 * sinDeg(A1);
  longitudeCorrection += 0.001962 * sinDeg(L - F);
  longitudeCorrection += 0.000318 * sinDeg(A2);

  latitudeCorrection += -0.002235 * sinDeg(L);
  latitudeCorrection += 0.000382 * sinDeg(A3);
  latitudeCorrection += 0.000175 * sinDeg(A1 - F);
  latitudeCorrection += 0.000175 * sinDeg(A1 + F);
  latitudeCorrection += 0.000127 * sinDeg(L - Mprime);
  latitudeCorrection += -0.000115 * sinDeg(L + Mprime);

  const longitude = normalizeDeg(L + longitudeCorrection);

  const latitude = latitudeCorrection;

  const distanceKm = 385000.56 + distanceCorrectionKm;
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
