import { normalize180 } from '../core/angles.js';

export function evaluateEclipsePotential(sunLon, moonLon, nodeLon) {
  const phaseDelta = Math.abs(normalize180(moonLon - sunLon));
  const nodeDelta = Math.abs(normalize180(moonLon - nodeLon));

  const isNewMoon = phaseDelta < 12;
  const isFullMoon = Math.abs(phaseDelta - 180) < 12;
  const nearNode = nodeDelta < 15;

  return {
    isNewMoon,
    isFullMoon,
    nearNode,
    solarPossible: isNewMoon && nearNode,
    lunarPossible: isFullMoon && nearNode,
    nodeDelta
  };
}
