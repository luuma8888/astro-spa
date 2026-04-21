import { createEmptyChart } from './chartModel.js';
import { toUtcDate, julianDayFromDate, julianCenturiesSinceJ2000 } from '../core/time.js';
import { meanObliquityDeg } from '../core/obliquity.js';
import { localSiderealTimeDeg } from '../core/sidereal.js';
import { computeSun } from '../astronomy/sun.js';
import { computeMoon } from '../astronomy/moon.js';
import { computePlanets } from '../astronomy/planets.js';
import { meanLunarNode, trueLunarNode } from '../astronomy/nodes.js';
import { evaluateEclipsePotential } from '../astronomy/eclipses.js';
import { buildMoonPhaseData } from '../astronomy/moonPhases.js';
import { computeSunRiseSet, computeMoonRiseSet } from '../astronomy/riseSet.js';
import { getTropicalSign } from '../astrology/zodiacTropical.js';
import { getSiderealSign } from '../astrology/zodiacSidereal.js';
import { getConstellationByRaDec } from '../astrology/constellations.js';
import { buildHouseSystem, findHouse } from '../astrology/houses.js';
import { buildAspectPoints, getAllAspects } from '../astrology/aspects.js';
import { buildSymbolicBodyData } from '../symbolic/correspondences.js';
import { buildChartSynthesis } from './synthesis.js';

export function buildChart(input, options = {}) {
  const chart = createEmptyChart();
  chart.input = input;
  chart.options = {
    houseSystem: options.houseSystem ?? 'porphyry',
    ayanamsa: options.ayanamsa ?? 'lahiri'
  };

  const utcDate = toUtcDate(input);
  const jd = julianDayFromDate(utcDate);
  const T = julianCenturiesSinceJ2000(jd);
  const epsilonDeg = meanObliquityDeg(T);
  const lstDeg = localSiderealTimeDeg(jd, input.longitude);

  chart.context = {
    utcIso: utcDate.toISOString(),
    jd,
    T,
    epsilonDeg,
    lstDeg
  };

  const sun = computeSun(T, epsilonDeg);
  const moon = computeMoon(T, epsilonDeg);
  const planetsRaw = computePlanets(T, epsilonDeg);
  const meanNode = meanLunarNode(T);
  const trueNode = trueLunarNode(T);

  const houseSystem = buildHouseSystem(
    chart.options.houseSystem,
    lstDeg,
    input.latitude,
    epsilonDeg
  );
  const houseCusps = houseSystem.cusps;

  const enrichedBodies = {
    sun: enrichBody(sun, houseCusps, chart.options.ayanamsa),
    moon: enrichBody(moon, houseCusps, chart.options.ayanamsa)
  };

  const planets = Object.fromEntries(
    Object.entries(planetsRaw).map(([key, planet]) => [
      key,
      enrichBody(planet, houseCusps, chart.options.ayanamsa)
    ])
  );

  chart.bodies = enrichedBodies;
  chart.planets = planets;
  chart.nodes = { meanNode, trueNode };
  chart.houses = houseCusps;
  chart.angles = houseSystem.angles;
  chart.houseSystem = houseSystem.system;

  chart.symbolic = {
    sun: buildSymbolicBodyData(enrichedBodies.sun),
    moon: buildSymbolicBodyData(enrichedBodies.moon)
  };

  for (const [key, planet] of Object.entries(planets)) {
    chart.symbolic[key] = buildSymbolicBodyData(planet);
  }

  chart.diagnostics.eclipse = evaluateEclipsePotential(sun.longitudeDeg, moon.longitudeDeg, trueNode);

  chart.moonPhase = buildMoonPhaseData(
    enrichedBodies.sun.longitudeDeg,
    enrichedBodies.moon.longitudeDeg
  );

  chart.riseSet = {
    sun: computeSunRiseSet({
      raDeg: enrichedBodies.sun.rightAscensionDeg,
      decDeg: enrichedBodies.sun.declinationDeg,
      latitudeDeg: input.latitude,
      longitudeDeg: input.longitude,
      jd
    }),
    moon: computeMoonRiseSet({
      raDeg: enrichedBodies.moon.rightAscensionDeg,
      decDeg: enrichedBodies.moon.declinationDeg,
      latitudeDeg: input.latitude,
      longitudeDeg: input.longitude,
      jd
    })
  };

  const aspectPoints = buildAspectPoints(chart);
  chart.aspects = getAllAspects(aspectPoints);
  chart.synthesis = buildChartSynthesis(chart);

  return chart;
}

function enrichBody(body, houseCusps, ayanamsaKey) {
  const tropical = getTropicalSign(body.longitudeDeg);
  const sidereal = getSiderealSign(body.longitudeDeg, ayanamsaKey);
  const constellation = getConstellationByRaDec(body.rightAscensionDeg, body.declinationDeg);
  const house = findHouse(body.longitudeDeg, houseCusps);

  return {
    ...body,
    tropical,
    sidereal,
    constellation,
    house
  };
}
