import { sinDeg, cosDeg, atan2Deg, asinDeg, normalizeDeg } from './angles.js';

export function eclipticToEquatorial(lambdaDeg, betaDeg, epsilonDeg) {
  const x = cosDeg(lambdaDeg) * cosDeg(betaDeg);
  const y = sinDeg(lambdaDeg) * cosDeg(betaDeg) * cosDeg(epsilonDeg) - sinDeg(betaDeg) * sinDeg(epsilonDeg);
  const z = sinDeg(lambdaDeg) * cosDeg(betaDeg) * sinDeg(epsilonDeg) + sinDeg(betaDeg) * cosDeg(epsilonDeg);

  const ra = normalizeDeg(atan2Deg(y, x));
  const dec = asinDeg(z);

  return { raDeg: ra, decDeg: dec };
}
