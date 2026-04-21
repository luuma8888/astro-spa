import { normalizeDeg } from './angles.js';

export function greenwichSiderealTimeDeg(jd) {
  const T = (jd - 2451545.0) / 36525;
  const theta = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - (T * T * T) / 38710000;

  return normalizeDeg(theta);
}

export function localSiderealTimeDeg(jd, longitudeDeg) {
  return normalizeDeg(greenwichSiderealTimeDeg(jd) + longitudeDeg);
}
