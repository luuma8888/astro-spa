export function degToRad(deg) {
  return deg * Math.PI / 180;
}

export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

export function normalizeDeg(deg) {
  let result = deg % 360;
  if (result < 0) result += 360;
  return result;
}

export function normalize180(deg) {
  let result = normalizeDeg(deg);
  if (result > 180) result -= 360;
  return result;
}

export function sinDeg(deg) {
  return Math.sin(degToRad(deg));
}

export function cosDeg(deg) {
  return Math.cos(degToRad(deg));
}

export function tanDeg(deg) {
  return Math.tan(degToRad(deg));
}

export function atan2Deg(y, x) {
  return radToDeg(Math.atan2(y, x));
}

export function asinDeg(value) {
  return radToDeg(Math.asin(value));
}

export function acosDeg(value) {
  return radToDeg(Math.acos(value));
}
