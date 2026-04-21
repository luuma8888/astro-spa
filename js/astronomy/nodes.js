import { normalizeDeg, sinDeg } from '../core/angles.js';

export function meanLunarNode(T) {
  return normalizeDeg(
    125.04452
    - 1934.136261 * T
    + 0.0020708 * T * T
    + (T * T * T) / 450000
  );
}

export function trueLunarNode(T) {
  const omega = meanLunarNode(T);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T);

  return normalizeDeg(omega - 1.4979 * sinDeg(2 * D) - 0.1500 * sinDeg(M));
}
