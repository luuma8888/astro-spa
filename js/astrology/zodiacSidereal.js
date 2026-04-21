import { normalizeDeg } from '../core/angles.js';
import { AYANAMSAS } from '../data/ayanamsas.js';
import { getTropicalSign } from './zodiacTropical.js';

export function getSiderealSign(longitudeDeg, ayanamsaKey = 'lahiri') {
  const ayanamsa = AYANAMSAS[ayanamsaKey] ?? AYANAMSAS.lahiri;
  const siderealLongitude = normalizeDeg(longitudeDeg - ayanamsa);
  return {
    ...getTropicalSign(siderealLongitude),
    siderealLongitude
  };
}
