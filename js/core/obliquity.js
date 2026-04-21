import { cosDeg } from './angles.js';

export function meanObliquityDeg(T) {
  const seconds = 21.448 - T * (46.8150 + T * (0.00059 - T * 0.001813));
  return 23 + (26 + seconds / 60) / 60;
}

export function trueObliquityDeg(T) {
  const omega = 125.04 - 1934.136 * T;
  return meanObliquityDeg(T) + 0.00256 * cosDeg(omega);
}
