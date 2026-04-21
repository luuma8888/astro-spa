import { normalizeDeg, sinDeg, cosDeg, tanDeg, atan2Deg } from '../core/angles.js';

function zodiacArcDistance(startDeg, endDeg) {
  return normalizeDeg(endDeg - startDeg);
}

function divideArc(startDeg, endDeg, parts) {
  const arc = zodiacArcDistance(startDeg, endDeg);
  const step = arc / parts;
  return Array.from({ length: parts + 1 }, (_, index) => normalizeDeg(startDeg + step * index));
}

export function computeMidheaven(lstDeg, epsilonDeg) {
  const mc = atan2Deg(tanDeg(lstDeg), cosDeg(epsilonDeg));

  let result = normalizeDeg(mc);

  if (Math.cos(lstDeg * Math.PI / 180) < 0) {
    result = normalizeDeg(result + 180);
  }

  return result;
}

export function computeAscendant(lstDeg, latitudeDeg, epsilonDeg) {
  const numerator = -cosDeg(lstDeg);
  const denominator = sinDeg(epsilonDeg) * tanDeg(latitudeDeg) + cosDeg(epsilonDeg) * sinDeg(lstDeg);

  return normalizeDeg(atan2Deg(numerator, denominator));
}

export function computeAngles(lstDeg, latitudeDeg, epsilonDeg) {
  const asc = computeAscendant(lstDeg, latitudeDeg, epsilonDeg);
  const mc = computeMidheaven(lstDeg, epsilonDeg);
  const desc = normalizeDeg(asc + 180);
  const ic = normalizeDeg(mc + 180);

  return {
    asc,
    mc,
    desc,
    ic
  };
}

export function computeEqualHouses(ascDeg) {
  return Array.from({ length: 12 }, (_, i) => normalizeDeg(ascDeg + i * 30));
}

export function computeWholeSignHouses(ascDeg) {
  const firstSignStart = Math.floor(normalizeDeg(ascDeg) / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => normalizeDeg(firstSignStart + i * 30));
}

export function computePorphyryHouses(ascDeg, mcDeg) {
  const descDeg = normalizeDeg(ascDeg + 180);
  const icDeg = normalizeDeg(mcDeg + 180);

  const h10to1 = divideArc(mcDeg, ascDeg, 3);
  const h1to4 = divideArc(ascDeg, icDeg, 3);
  const h4to7 = divideArc(icDeg, descDeg, 3);
  const h7to10 = divideArc(descDeg, mcDeg, 3);

  return [
    ascDeg,
    h1to4[1],
    h1to4[2],
    icDeg,
    h4to7[1],
    h4to7[2],
    descDeg,
    h7to10[1],
    h7to10[2],
    mcDeg,
    h10to1[1],
    h10to1[2]
  ].map(normalizeDeg);
}

export function findHouse(longitudeDeg, houseCusps) {
  const lon = normalizeDeg(longitudeDeg);

  for (let i = 0; i < 12; i++) {
    const start = normalizeDeg(houseCusps[i]);
    const end = normalizeDeg(houseCusps[(i + 1) % 12]);

    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }

  return 1;
}

export function buildHouseSystem(systemName, lstDeg, latitudeDeg, epsilonDeg) {
  const angles = computeAngles(lstDeg, latitudeDeg, epsilonDeg);

  switch (systemName) {
    case 'whole-sign':
      return {
        system: systemName,
        angles,
        cusps: computeWholeSignHouses(angles.asc)
      };

    case 'porphyry':
      return {
        system: systemName,
        angles,
        cusps: computePorphyryHouses(angles.asc, angles.mc)
      };

    case 'equal':
    default:
      return {
        system: 'equal',
        angles,
        cusps: computeEqualHouses(angles.asc)
      };
  }
}
