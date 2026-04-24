import test from 'node:test';
import assert from 'node:assert/strict';

import { PLANET_PRECISION_FIXTURES } from '../tools/planet-precision-fixtures.js';
import { computePlanets } from '../js/astronomy/planets.js';
import { toUtcDate, julianDayFromDate, julianCenturiesSinceJ2000 } from '../js/core/time.js';
import { trueObliquityDeg } from '../js/core/obliquity.js';

function cartesianDelta(actual, expected) {
  return Math.sqrt(
    (actual.xAu - expected.xAu) ** 2
    + (actual.yAu - expected.yAu) ** 2
    + (actual.zAu - expected.zAu) ** 2
  );
}

function buildTimeContext(input) {
  const utcDate = toUtcDate(input);
  const jd = julianDayFromDate(utcDate);
  const T = julianCenturiesSinceJ2000(jd);

  return {
    T,
    epsilonDeg: trueObliquityDeg(T)
  };
}

test('enhanced reproduit exactement les vecteurs aux ancrages officiels', () => {
  for (const fixture of PLANET_PRECISION_FIXTURES) {
    const { T, epsilonDeg } = buildTimeContext(fixture.input);
    const planets = computePlanets(T, epsilonDeg, { precisionMode: 'enhanced' });

    for (const [planetName, reference] of Object.entries(fixture.reference)) {
      const planet = planets[planetName];
      assert.ok(planet, `${fixture.id} ${planetName} should exist`);
      assert.equal(planet.precisionCorrection.applied, true, `${fixture.id} ${planetName} should apply a correction`);
      assert.equal(planet.precisionCorrection.strategy, 'exact-anchor', `${fixture.id} ${planetName} should match an exact anchor`);
      assert.deepEqual(planet.precisionCorrection.anchors, [fixture.id], `${fixture.id} ${planetName} should report the source anchor`);
      assert.ok(
        cartesianDelta(planet.geocentricCartesian, reference) < 1e-12,
        `${fixture.id} ${planetName} should reproduce the reference vector`
      );
    }
  }
});

test('enhanced n est jamais moins precis que standard sur les ancrages', () => {
  for (const fixture of PLANET_PRECISION_FIXTURES) {
    const { T, epsilonDeg } = buildTimeContext(fixture.input);
    const standard = computePlanets(T, epsilonDeg, { precisionMode: 'standard' });
    const enhanced = computePlanets(T, epsilonDeg, { precisionMode: 'enhanced' });

    for (const [planetName, reference] of Object.entries(fixture.reference)) {
      const standardPlanet = standard[planetName];
      const enhancedPlanet = enhanced[planetName];
      const standardDelta = cartesianDelta(standardPlanet.geocentricCartesian, reference);
      const enhancedDelta = cartesianDelta(enhancedPlanet.geocentricCartesian, reference);

      assert.ok(
        enhancedDelta <= standardDelta + 1e-12,
        `${fixture.id} ${planetName} should not regress cartesian precision`
      );
    }
  }
});

test('enhanced se replie proprement hors plage couverte par les ancrages', () => {
  const { T, epsilonDeg } = buildTimeContext({
    date: '2042-04-24',
    time: '12:00:00',
    latitude: 0,
    longitude: 0,
    utcOffset: 0
  });

  const standard = computePlanets(T, epsilonDeg, { precisionMode: 'standard' });
  const enhanced = computePlanets(T, epsilonDeg, { precisionMode: 'enhanced' });

  for (const planetName of Object.keys(standard)) {
    assert.deepEqual(
      enhanced[planetName].geocentricCartesian,
      standard[planetName].geocentricCartesian,
      `${planetName} should keep the standard cartesian vector outside anchor coverage`
    );
    assert.equal(enhanced[planetName].precisionCorrection.applied, false, `${planetName} should not apply a correction outside coverage`);
    assert.equal(enhanced[planetName].precisionCorrection.strategy, 'out-of-range', `${planetName} should report out-of-range coverage`);
    assert.deepEqual(enhanced[planetName].precisionCorrection.anchors, [], `${planetName} should not report source anchors outside coverage`);
  }
});
