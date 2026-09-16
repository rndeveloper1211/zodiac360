const assert = require('assert');
const {
  calculateD30Position,
  getD30Segment
} = require('./D30.engine');

// Exact canonical segment checks.
const cases = [
  [2, 'Mars', 1],
  [7, 'Saturn', 11],
  [15, 'Jupiter', 9],
  [20, 'Mercury', 3],
  [27, 'Venus', 7],
  [32, 'Venus', 2],
  [37, 'Mercury', 6],
  [45, 'Jupiter', 12],
  [50, 'Saturn', 10],
  [57, 'Mars', 8]
];

for (const [longitude, lord, signId] of cases) {
  const out = calculateD30Position(longitude);
  assert.strictEqual(out.segmentLord, lord);
  assert.strictEqual(out.d30SignId, signId);
}

assert.strictEqual(getD30Segment(4.999999, 1).lord, 'Mars');
assert.strictEqual(getD30Segment(5, 1).lord, 'Saturn');
assert.strictEqual(getD30Segment(17.999999, 1).lord, 'Jupiter');
assert.strictEqual(getD30Segment(18, 1).lord, 'Mercury');
assert.strictEqual(getD30Segment(25, 1).lord, 'Venus');

console.log('D30 tests passed.');
