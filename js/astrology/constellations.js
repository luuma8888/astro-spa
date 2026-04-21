import { CONSTELLATIONS_OPTIMIZED } from '../data/constellationsOptimized.js';

export function getConstellationByRaDec(raDeg, decDeg) {
  return (
    CONSTELLATIONS_OPTIMIZED.find(c => {
      const raInRange = c.raMin <= c.raMax
        ? raDeg >= c.raMin && raDeg <= c.raMax
        : raDeg >= c.raMin || raDeg <= c.raMax;

      return raInRange && decDeg >= c.decMin && decDeg <= c.decMax;
    }) || null
  );
}
