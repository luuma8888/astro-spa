import { buildChart } from '../js/domain/chartBuilder.js';
import { HUMAN_DESIGN_PROFILE_FIXTURES } from './human-design-profile-fixtures.js';

const SIDES = [
  ['conscious', 'personality'],
  ['unconscious', 'design']
];
const FIELDS = ['gate', 'line', 'color', 'tone', 'base'];

function printMismatch(fixtureId, side, body, field, actual, expected) {
  console.log(`FAIL ${fixtureId} ${side} ${body} ${field} | actual=${actual} expected=${expected}`);
}

function printMatchRate(fieldCounts, totalComparisons) {
  console.log('');
  console.log('Taux de correspondance par champ');
  for (const field of FIELDS) {
    const matches = fieldCounts[field] ?? 0;
    const ratio = totalComparisons === 0 ? 0 : matches / totalComparisons;
    console.log(`${field}: ${matches}/${totalComparisons} (${(ratio * 100).toFixed(1)}%)`);
  }
}

let failureCount = 0;
let totalComparisons = 0;
const fieldCounts = Object.fromEntries(FIELDS.map((field) => [field, 0]));

console.log('Validation HD sur profils anonymises');
console.log(`Fixtures: ${HUMAN_DESIGN_PROFILE_FIXTURES.length}`);
console.log('Reference: profils JSON fournis en local, anonymises puis reduits aux corps supportes par le moteur.');
console.log('');

for (const fixture of HUMAN_DESIGN_PROFILE_FIXTURES) {
  const chart = buildChart(fixture.input, {});

  console.log(`${fixture.id} - ${fixture.input.date} ${fixture.input.time} ${fixture.input.timeZone}`);

  for (const [expectedSide, actualSide] of SIDES) {
    const expectedBodies = fixture.expected[expectedSide];
    const actualBodies = chart.humanDesign?.[actualSide] ?? {};

    for (const [body, expected] of Object.entries(expectedBodies)) {
      const actual = actualBodies[body];

      if (!actual) {
        console.log(`FAIL ${fixture.id} ${expectedSide} ${body} missing-body | actual=missing expected=present`);
        failureCount += 1;
        totalComparisons += FIELDS.length;
        continue;
      }

      for (const field of FIELDS) {
        totalComparisons += 1;
        if (actual[field] === expected[field]) {
          fieldCounts[field] += 1;
          continue;
        }

        failureCount += 1;
        printMismatch(fixture.id, expectedSide, body, field, actual[field], expected[field]);
      }
    }
  }

  console.log('');
}

printMatchRate(fieldCounts, totalComparisons / FIELDS.length);

if (failureCount > 0) {
  console.error('');
  console.error(`Validation HD echouee: ${failureCount} divergence(s) detectee(s).`);
  process.exit(1);
}

console.log('');
console.log('Validation HD reussie: toutes les activations correspondent.');
