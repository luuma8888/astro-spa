import { normalizeDeg } from '../core/angles.js';

const SIGNS = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'
];

export function getTropicalSign(longitudeDeg) {
  const lon = normalizeDeg(longitudeDeg);
  const index = Math.floor(lon / 30);
  return {
    index,
    name: SIGNS[index],
    degreeInSign: lon % 30
  };
}
