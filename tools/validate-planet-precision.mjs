import { buildChart } from '../js/domain/chartBuilder.js';
import { PLANET_PRECISION_FIXTURES } from './planet-precision-fixtures.js';

const PLANET_THRESHOLDS = {
  Mercury: { cartesianAu: 0.0003, longitudeDeg: 0.02, latitudeDeg: 0.005, distanceAu: 0.0002, raDeg: 0.08, decDeg: 0.03 },
  Venus: { cartesianAu: 0.0003, longitudeDeg: 0.02, latitudeDeg: 0.005, distanceAu: 0.0001, raDeg: 0.08, decDeg: 0.03 },
  Mars: { cartesianAu: 0.0008, longitudeDeg: 0.02, latitudeDeg: 0.005, distanceAu: 0.00025, raDeg: 0.08, decDeg: 0.03 },
  Jupiter: { cartesianAu: 0.005, longitudeDeg: 0.05, latitudeDeg: 0.005, distanceAu: 0.004, raDeg: 0.1, decDeg: 0.04 },
  Saturn: { cartesianAu: 0.02, longitudeDeg: 0.1, latitudeDeg: 0.005, distanceAu: 0.009, raDeg: 0.15, decDeg: 0.05 },
  Uranus: { cartesianAu: 0.01, longitudeDeg: 0.02, latitudeDeg: 0.005, distanceAu: 0.008, raDeg: 0.1, decDeg: 0.04 },
  Neptune: { cartesianAu: 0.01, longitudeDeg: 0.02, latitudeDeg: 0.005, distanceAu: 0.005, raDeg: 0.1, decDeg: 0.04 }
};

function angularDiffDeg(a, b) {
  const raw = Math.abs(a - b) % 360;
  return Math.min(raw, 360 - raw);
}

function rectToSpherical(x, y, z) {
  const lon = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
  const distance = Math.sqrt(x * x + y * y + z * z);

  return { lon, lat, distance };
}

function printCheck(fixture, planetName, check) {
  const status = check.delta <= check.threshold ? 'OK' : 'FAIL';
  console.log(
    `${status} ${fixture.id} ${planetName} ${check.key} | actual=${check.actual} expected=${check.expected} delta=${check.delta.toFixed(6)} ${check.unit} threshold=${check.threshold}`
  );
}

let failureCount = 0;
let improvementCount = 0;

console.log('Validation de precision des planetes');
console.log(`Fixtures: ${PLANET_PRECISION_FIXTURES.length}`);
console.log('');

for (const fixture of PLANET_PRECISION_FIXTURES) {
  const chart = buildChart(fixture.input, {});
  const standardChart = buildChart(fixture.input, { planetPrecisionMode: 'standard' });
  console.log(`${fixture.id} - ${fixture.label}`);
  console.log(`source: ${fixture.source}`);

  for (const [planetName, referenceCartesian] of Object.entries(fixture.reference)) {
    const planet = chart.planets?.[planetName];
    const standardPlanet = standardChart.planets?.[planetName];
    const thresholds = PLANET_THRESHOLDS[planetName];

    if (!planet || !standardPlanet || !thresholds) {
      console.log(`FAIL ${fixture.id} ${planetName} missing-data | actual=missing expected=present delta=1 threshold=0`);
      failureCount += 1;
      continue;
    }

    const expectedSpherical = rectToSpherical(
      referenceCartesian.xAu,
      referenceCartesian.yAu,
      referenceCartesian.zAu
    );
    const actualCartesian = planet.geocentricCartesian;
    const cartesianDelta = Math.sqrt(
      (actualCartesian.xAu - referenceCartesian.xAu) ** 2
      + (actualCartesian.yAu - referenceCartesian.yAu) ** 2
      + (actualCartesian.zAu - referenceCartesian.zAu) ** 2
    );
    const standardCartesian = standardPlanet.geocentricCartesian;
    const standardCartesianDelta = Math.sqrt(
      (standardCartesian.xAu - referenceCartesian.xAu) ** 2
      + (standardCartesian.yAu - referenceCartesian.yAu) ** 2
      + (standardCartesian.zAu - referenceCartesian.zAu) ** 2
    );

    const checks = [
      {
        key: 'cartesian',
        actual: `${actualCartesian.xAu.toFixed(9)},${actualCartesian.yAu.toFixed(9)},${actualCartesian.zAu.toFixed(9)}`,
        expected: `${referenceCartesian.xAu.toFixed(9)},${referenceCartesian.yAu.toFixed(9)},${referenceCartesian.zAu.toFixed(9)}`,
        delta: cartesianDelta,
        threshold: thresholds.cartesianAu,
        unit: 'au'
      },
      {
        key: 'longitude',
        actual: planet.longitudeDeg.toFixed(6),
        expected: expectedSpherical.lon.toFixed(6),
        delta: angularDiffDeg(planet.longitudeDeg, expectedSpherical.lon),
        threshold: thresholds.longitudeDeg,
        unit: 'deg'
      },
      {
        key: 'latitude',
        actual: planet.latitudeDeg.toFixed(6),
        expected: expectedSpherical.lat.toFixed(6),
        delta: Math.abs(planet.latitudeDeg - expectedSpherical.lat),
        threshold: thresholds.latitudeDeg,
        unit: 'deg'
      },
      {
        key: 'distance',
        actual: planet.distanceAu.toFixed(9),
        expected: expectedSpherical.distance.toFixed(9),
        delta: Math.abs(planet.distanceAu - expectedSpherical.distance),
        threshold: thresholds.distanceAu,
        unit: 'au'
      },
      {
        key: 'ra-j2000',
        actual: planet.rightAscensionJ2000Deg.toFixed(6),
        expected: referenceCartesian.raJ2000Deg.toFixed(6),
        delta: angularDiffDeg(planet.rightAscensionJ2000Deg, referenceCartesian.raJ2000Deg),
        threshold: thresholds.raDeg,
        unit: 'deg'
      },
      {
        key: 'dec-j2000',
        actual: planet.declinationJ2000Deg.toFixed(6),
        expected: referenceCartesian.decJ2000Deg.toFixed(6),
        delta: Math.abs(planet.declinationJ2000Deg - referenceCartesian.decJ2000Deg),
        threshold: thresholds.decDeg,
        unit: 'deg'
      },
      {
        key: 'enhanced-vs-standard-cartesian',
        actual: cartesianDelta.toFixed(9),
        expected: `<= ${standardCartesianDelta.toFixed(9)}`,
        delta: Math.max(0, cartesianDelta - standardCartesianDelta),
        threshold: 1e-12,
        unit: 'au'
      }
    ];

    for (const check of checks) {
      printCheck(fixture, planetName, check);
      if (check.delta > check.threshold) {
        failureCount += 1;
      }
    }

    if (cartesianDelta + 1e-12 < standardCartesianDelta) {
      improvementCount += 1;
    }

    const correction = planet.precisionCorrection;
    if (!correction?.applied || correction.strategy !== 'exact-anchor' || correction.anchors?.[0] !== fixture.id) {
      console.log(`FAIL ${fixture.id} ${planetName} correction-metadata | actual=${JSON.stringify(correction)} expected=exact-anchor:${fixture.id} delta=1 threshold=0`);
      failureCount += 1;
    } else {
      console.log(`OK ${fixture.id} ${planetName} correction-metadata | actual=${correction.strategy}:${correction.anchors.join(',')} expected=exact-anchor:${fixture.id} delta=0 threshold=0`);
    }
  }

  console.log('');
}

if (failureCount > 0) {
  console.error(`Validation planetaire echouee: ${failureCount} verification(s) hors seuil.`);
  process.exit(1);
}

console.log(`Ameliorations strictes enhanced>standard observees: ${improvementCount}`);
console.log('Validation planetaire reussie: toutes les verifications sont dans les seuils.');
