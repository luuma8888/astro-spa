import { normalizeDeg } from '../core/angles.js';
import { YKING_64 } from '../data/yking64.js';

export function getYKingHexagram(longitudeDeg) {
  const lon = normalizeDeg(longitudeDeg);
  return YKING_64.find(item => lon >= item.startDeg && lon < item.endDeg) || YKING_64[63];
}
