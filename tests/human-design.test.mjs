import test from 'node:test';
import assert from 'node:assert/strict';

import { buildChart } from '../js/domain/chartBuilder.js';
import { getHumanDesignActivation } from '../js/astronomy/humanDesign.js';

test('la roue HD place bien le debut de la gate 41 a 02° Verseau', () => {
  const activation = getHumanDesignActivation(302);
  assert.equal(activation.gate, 41);
  assert.equal(activation.line, 1);
  assert.equal(activation.color, 1);
  assert.equal(activation.tone, 1);
  assert.equal(activation.base, 1);
});

test('la decomposition gate/line/color/tone/base respecte les sous-divisions internes', () => {
  const activation = getHumanDesignActivation(302 + (360 / 64) - 1e-8);
  assert.equal(activation.gate, 41);
  assert.equal(activation.line, 6);
  assert.equal(activation.color, 6);
  assert.equal(activation.tone, 6);
  assert.equal(activation.base, 5);
});

test('le design est calcule sur un arc solaire de 88° en amont', () => {
  const chart = buildChart({
    date: '2026-03-20',
    time: '12:00:00',
    latitude: 48.8566,
    longitude: 2.3522,
    utcOffset: 1
  });

  assert.ok(chart.humanDesign, 'human design data should be present');

  const consciousSun = chart.humanDesign.personality.Sun;
  const designSun = chart.humanDesign.design.Sun;
  const diff = (consciousSun.longitudeDeg - designSun.longitudeDeg + 360) % 360;

  assert.ok(Math.abs(diff - 88) < 1e-5, `expected 88°, got ${diff}`);
  assert.ok(chart.humanDesign.designAgeDays > 80 && chart.humanDesign.designAgeDays < 100);
});

test('la carte expose les activations conscientes et inconscientes pour les corps supportes', () => {
  const chart = buildChart({
    date: '2026-09-23',
    time: '00:00:00',
    latitude: 0,
    longitude: 0,
    utcOffset: 0
  });

  for (const key of ['Sun', 'Earth', 'Moon', 'NorthNode', 'SouthNode', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
    assert.ok(chart.humanDesign.personality[key], `${key} should exist in personality`);
    assert.ok(chart.humanDesign.design[key], `${key} should exist in design`);
  }

  assert.deepEqual(chart.humanDesign.missingBodies, []);
  assert.match(chart.humanDesign.profile, /^[1-6]\/[1-6]$/);
  assert.equal(chart.humanDesign.ephemeris.provider, 'swisseph-v2');
});

test('regression HD: Soleil/Terre/Lune et noeuds restent alignes sur le modele HD specialise', () => {
  const chart = buildChart({
    date: '1985-05-01',
    time: '06:36:00',
    latitude: 50.8503,
    longitude: 4.3517,
    utcOffset: 2,
    timeZone: 'Europe/Brussels'
  });

  assert.equal(chart.humanDesign.personality.Sun.base, 2);
  assert.equal(chart.humanDesign.personality.Earth.base, 2);
  assert.equal(chart.humanDesign.personality.Moon.base, 3);
  assert.equal(chart.humanDesign.design.Sun.base, 1);
  assert.equal(chart.humanDesign.design.Earth.base, 1);
  assert.equal(chart.humanDesign.design.Moon.base, 4);

  assert.equal(chart.humanDesign.personality.NorthNode.gate, 2);
  assert.equal(chart.humanDesign.personality.SouthNode.gate, 1);
  assert.equal(chart.humanDesign.design.NorthNode.gate, 23);
  assert.equal(chart.humanDesign.design.SouthNode.gate, 43);
});
