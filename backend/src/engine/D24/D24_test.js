/**
 * D24 sanity test using the same D1 planetary positions used in the
 * D7/D9/D10 tests, so results are directly cross-checkable against those modules.
 *
 * Chaturvimshamsha rule: odd sign -> start from Leo (Simha),
 * even sign -> start from Cancer (Kark). Each sign divided into 24
 * parts of 1°15' (30/24°) each.
 *
 * Expected D24 results (hand-derived, cross-checked programmatically):
 * Sun      Aquarius(11) 2.50  -> Libra(7)
 * Moon     Scorpio(8)   0.85  -> Cancer(4)
 * Mercury  Capricorn(10) 28.18 -> Taurus(2)
 * Venus    Pisces(12)   15.58 -> Cancer(4)
 * Mars     Scorpio(8)   6.22  -> Scorpio(8)   [sign-repeat]
 * Jupiter  Taurus(2)    8.04  -> Capricorn(10)
 * Saturn   Taurus(2)    0.61  -> Cancer(4)
 * Rahu     Gemini(3)    19.44 -> Scorpio(8)
 * Ketu     Sagittarius(9) 19.44 -> Scorpio(8)
 */

const assert = require('assert');
const { calculateD24Sign } = require('./D24chartengine');

const cases = [
  ['Sun', 11, 2.50, 7],
  ['Moon', 8, 0.85, 4],
  ['Mercury', 10, 28.18, 2],
  ['Venus', 12, 15.58, 4],
  ['Mars', 8, 6.22, 8],
  ['Jupiter', 2, 8.04, 10],
  ['Saturn', 2, 0.61, 4],
  ['Rahu', 3, 19.44, 8],
  ['Ketu', 9, 19.44, 8]
];

for (const [planet, signId, degree, expected] of cases) {
  const result = calculateD24Sign(signId, degree);
  assert.strictEqual(
    result.d24SignId,
    expected,
    `${planet}: expected D24 sign ${expected}, got ${result.d24SignId}`
  );
}

// Sign-repeat guard check: Mars (Scorpio, even sign) at 6.22° lands back
// in Scorpio itself in D24 — confirms D1 sign === D24 sign flag works.
const marsCase = calculateD24Sign(8, 6.22);
assert.strictEqual(marsCase.isSignRepeat, true, 'Expected isSignRepeat flag to be true for this Mars case');

// Odd-sign part-1 guard check: any odd sign at a very low degree should
// start counting from Leo itself (part 1).
const oddSignCase = calculateD24Sign(1, 0.5); // Aries, odd, part 0 -> starts at Leo
assert.strictEqual(oddSignCase.d24SignId, 5, 'Expected odd-sign part 1 to start from Leo');

console.log('D24 calculation sanity test: PASS');
