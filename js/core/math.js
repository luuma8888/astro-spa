export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;

export function sqr(value) {
  return value * value;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
