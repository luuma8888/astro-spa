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
import { computeMoonOrbitEvents } from '../astronomy/moonOrbitEvents.js';
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
    ayanamsa: options.ayanamsa ?? 'lahiri',
    planetPrecisionMode: options.planetPrecisionMode ?? 'enhanced'
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
  const planetsRaw = computePlanets(T, epsilonDeg, {
    precisionMode: chart.options.planetPrecisionMode
  });
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
    sun: enrichBody({ ...sun, jd }, houseCusps, chart.options.ayanamsa),
    moon: enrichBody({ ...moon, jd }, houseCusps, chart.options.ayanamsa)
  };

  const planets = Object.fromEntries(
    Object.entries(planetsRaw).map(([key, planet]) => [
      key,
      enrichBody({ ...planet, jd }, houseCusps, chart.options.ayanamsa)
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
  chart.riseSet = {
    sun: computeSunRiseSet(input),
    moon: computeMoonRiseSet(input, enrichedBodies.moon)
  };
  chart.riseSet.sun.presentation = createRiseSetPresentation(chart.riseSet.sun);
  chart.riseSet.moon.presentation = createRiseSetPresentation(chart.riseSet.moon);
  chart.diagnostics.moonOrbit = computeMoonOrbitEvents(
    jd,
    {
      ...enrichedBodies.moon,
      phaseLabel: chart.moonPhase.label
    },
    chart.riseSet.moon
  );
  chart.moonPhase = {
    ...chart.moonPhase,
    currentConstellation: chart.diagnostics.moonOrbit.currentConstellation ?? enrichedBodies.moon.constellation ?? null,
    nextConstellationTransition: chart.diagnostics.moonConstellationTransition ?? null,
    visibilityText: chart.diagnostics.moonOrbit.visibilityText ?? null,
    trajectoryText: chart.diagnostics.moonOrbit.trajectoryText ?? null,
    nextNode: chart.diagnostics.moonOrbit.nextNode ?? null,
    nextPerigee: chart.diagnostics.moonOrbit.nextPerigee ?? null,
    nextApogee: chart.diagnostics.moonOrbit.nextApogee ?? null,
    nextLunarEclipse: chart.diagnostics.moonOrbit.nextLunarEclipse ?? null,
    riseSet: chart.riseSet.moon
  };
  chart.moonPhase.presentation = createMoonPhasePresentation(chart.moonPhase, input.utcOffset);

  const aspectPoints = buildAspectPoints(chart);
  chart.aspects = getAllAspects(aspectPoints);
  chart.aspects = chart.aspects.map((aspect) => ({
    ...aspect,
    presentation: createAspectPresentation(aspect)
  }));
  chart.calculations = createCalculationCatalog(buildCalculationGroups(chart));
  chart.synthesis = buildChartSynthesis(chart);

  if (chart.options.planetPrecisionMode === 'enhanced') {
    chart.meta.precision.coreAstronomy.level = 'élevée pragmatique renforcée';
    chart.meta.precision.coreAstronomy.summary = 'Le moteur combine le calcul local Soleil/Lune/planètes avec une correction interpolée sur ancrages officiels JPL Horizons pour améliorer les coordonnées planétaires géocentriques.';
    chart.meta.precision.coreAstronomy.evidence = 'Validation locale sur fixtures USNO pour Soleil/Lune et ancrages officiels JPL Horizons versionnés pour les planètes.';
  }

  return chart;
}

function enrichBody(body, houseCusps, ayanamsaKey) {
  const tropical = getTropicalSign(body.longitudeDeg);
  const sidereal = getSiderealSign(body.longitudeDeg, ayanamsaKey);
  const constellation = getConstellationByRaDec(body.rightAscensionDeg, body.declinationDeg, {
    jd: body.jd
  });
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
