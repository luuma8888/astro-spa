import { normalize180 } from '../core/angles.js';

export const DEFAULT_ASPECTS = [
  { name: 'conjonction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 4 },
  { name: 'carré', angle: 90, orb: 6 },
  { name: 'trigone', angle: 120, orb: 6 },
  { name: 'opposition', angle: 180, orb: 8 }
];

export function angularDistance(aDeg, bDeg) {
  return Math.abs(normalize180(aDeg - bDeg));
}

export function getAspectBetween(aName, aDeg, bName, bDeg, aspects = DEFAULT_ASPECTS) {
  const distance = angularDistance(aDeg, bDeg);

  for (const aspect of aspects) {
    const orb = Math.abs(distance - aspect.angle);
    if (orb <= aspect.orb) {
      return {
        bodyA: aName,
        bodyB: bName,
        aspect: aspect.name,
        exactAngle: aspect.angle,
        delta: distance,
        orb,
        applying: null
      };
    }
  }

  return null;
}

export function getAllAspects(points, aspects = DEFAULT_ASPECTS) {
  const result = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];

      const found = getAspectBetween(a.name, a.longitudeDeg, b.name, b.longitudeDeg, aspects);
      if (found) {
        result.push(found);
      }
    }
  }

  return result.sort((left, right) => left.orb - right.orb);
}

export function buildAspectPoints(chart) {
  const points = [];

  if (chart.bodies?.sun) {
    points.push({ name: 'Soleil', longitudeDeg: chart.bodies.sun.longitudeDeg });
  }

  if (chart.bodies?.moon) {
    points.push({ name: 'Lune', longitudeDeg: chart.bodies.moon.longitudeDeg });
  }

  if (chart.planets) {
    for (const [key, planet] of Object.entries(chart.planets)) {
      points.push({
        name: key,
        longitudeDeg: planet.longitudeDeg
      });
    }
  }

  if (chart.angles) {
    points.push({ name: 'Asc', longitudeDeg: chart.angles.asc });
    points.push({ name: 'MC', longitudeDeg: chart.angles.mc });
  }

  return points;
}
