import { asinDeg, atan2Deg, cosDeg, normalizeDeg, sinDeg } from './angles.js';

export function precessEquatorial(raDeg, decDeg, fromJd, toJd) {
  const T = (fromJd - 2451545.0) / 36525;
  const t = (toJd - fromJd) / 36525;

  const zetaArcsec = (
    (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t
    + (0.30188 - 0.000344 * T) * t * t
    + 0.017998 * t * t * t
  );

  const zArcsec = (
    (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t
    + (1.09468 + 0.000066 * T) * t * t
    + 0.018203 * t * t * t
  );

  const thetaArcsec = (
    (2004.3109 - 0.85330 * T - 0.000217 * T * T) * t
    - (0.42665 + 0.000217 * T) * t * t
    - 0.041833 * t * t * t
  );

  const zetaDeg = zetaArcsec / 3600;
  const zDeg = zArcsec / 3600;
  const thetaDeg = thetaArcsec / 3600;

  const a = cosDeg(decDeg) * sinDeg(raDeg + zetaDeg);
  const b = cosDeg(thetaDeg) * cosDeg(decDeg) * cosDeg(raDeg + zetaDeg)
    - sinDeg(thetaDeg) * sinDeg(decDeg);
  const c = sinDeg(thetaDeg) * cosDeg(decDeg) * cosDeg(raDeg + zetaDeg)
    + cosDeg(thetaDeg) * sinDeg(decDeg);

  return {
    raDeg: normalizeDeg(atan2Deg(a, b) + zDeg),
    decDeg: asinDeg(c)
  };
}
