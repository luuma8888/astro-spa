import { getYKingHexagram } from './yking.js';

export function buildSymbolicBodyData(body) {
  return {
    yking: getYKingHexagram(body.longitudeDeg)
  };
}
