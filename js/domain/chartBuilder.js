import {
  createAnglesPresentation,
  createAspectPresentation,
  createBodyPresentation,
  createCalculationCatalog,
  createEmptyChart,
  createHouseDetails,
  createModelMeta,
  createMoonPhasePresentation,
  createRiseSetPresentation
} from './chartModel.js';
import { toUtcDate, julianDayFromDate, julianCenturiesSinceJ2000 } from '../core/time.js';
import { trueObliquityDeg } from '../core/obliquity.js';
import { localSiderealTimeDeg } from '../core/sidereal.js';
import { computeSun } from '../astronomy/sun.js';
import { computeMoon } from '../astronomy/moon.js';
import { computeNextMoonConstellationTransition } from '../astronomy/moonConstellationTransitions.js';
import { computePlanets } from '../astronomy/planets.js';
import { meanLunarNode, trueLunarNode } from '../astronomy/nodes.js';
import { evaluateEclipsePotential } from '../astronomy/eclipses.js';
import { buildMoonPhaseDataFromBodiesAtJd } from '../astronomy/moonPhases.js';
import { computeSunRiseSet, computeMoonRiseSet } from '../astronomy/riseSet.js';
import { getTropicalSign } from '../astrology/zodiacTropical.js';
import { getSiderealSign } from '../astrology/zodiacSidereal.js';
import { getConstellationByRaDec } from '../astrology/constellations.js';
import { buildHouseSystem, findHouse } from '../astrology/houses.js';
import { buildAspectPoints, getAllAspects } from '../astrology/aspects.js';
import { buildSymbolicBodyData } from '../symbolic/correspondences.js';
import { buildChartSynthesis } from './synthesis.js';
import { buildCalculationGroups } from './calculationGroups.js';

export function buildChart(input, options = {}) {
  const chart = createEmptyChart();
  chart.input = input;
  chart.meta = createModelMeta();
  chart.options = {
    houseSystem: options.houseSystem ?? 'porphyry',
    ayanamsa: options.ayanamsa ?? 'lahiri'
  };

  const utcDate = toUtcDate(input);
  const jd = julianDayFromDate(utcDate);
  const T = julianCenturiesSinceJ2000(jd);
  const epsilonDeg = trueObliquityDeg(T);
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
  chart.anglePresentation = createAnglesPresentation(chart.angles);
  chart.houseDetails = createHouseDetails(chart.houses);
  chart.houseSystem = houseSystem.system;

  chart.symbolic = {
    sun: buildSymbolicBodyData(enrichedBodies.sun),
    moon: buildSymbolicBodyData(enrichedBodies.moon)
  };

  for (const [key, planet] of Object.entries(planets)) {
    chart.symbolic[key] = buildSymbolicBodyData(planet);
  }

  chart.diagnostics.eclipse = evaluateEclipsePotential(sun.longitudeDeg, moon.longitudeDeg, trueNode);
  chart.diagnostics.moonConstellationTransition = computeNextMoonConstellationTransition(
    input,
    enrichedBodies.moon
  );

  chart.moonPhase = buildMoonPhaseDataFromBodiesAtJd(enrichedBodies.sun, enrichedBodies.moon, jd);
  chart.moonPhase.presentation = createMoonPhasePresentation(chart.moonPhase, input.utcOffset);

  chart.riseSet = {
    sun: computeSunRiseSet(input),
    moon: computeMoonRiseSet(input, enrichedBodies.moon)
  };
  chart.riseSet.sun.presentation = createRiseSetPresentation(chart.riseSet.sun);
  chart.riseSet.moon.presentation = createRiseSetPresentation(chart.riseSet.moon);

  const aspectPoints = buildAspectPoints(chart);
  chart.aspects = getAllAspects(aspectPoints);
  chart.aspects = chart.aspects.map((aspect) => ({
    ...aspect,
    presentation: createAspectPresentation(aspect)
  }));
  chart.calculations = createCalculationCatalog(buildCalculationGroups(chart));
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
    house,
    presentation: createBodyPresentation({
      ...body,
      tropical,
      sidereal,
      constellation,
      house
    })
  };
}
