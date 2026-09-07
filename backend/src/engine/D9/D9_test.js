/**
 * D9 sanity test using the same D1 planetary positions used in the D7 test,
 * so results are directly cross-checkable against that module.
 *
 * Navamsha rule: movable sign -> start from same sign,
 * fixed sign -> start from 9th sign, dual sign -> start from 5th sign.
 * Each sign divided into 9 parts of 3°20' each.
 *
 * Expected D9 results (hand-derived):
 * Sun      Aquarius(11) 2.50  -> Libra(7)
 * Moon     Scorpio(8)   0.85  -> Cancer(4)
 * Mercury  Capricorn(10) 28.18 -> Virgo(6)
 * Venus    Pisces(12)   15.58 -> Scorpio(8)
 * Mars     Scorpio(8)   6.22  -> Leo(5)
 * Jupiter  Taurus(2)    8.04  -> Pisces(12)
 * Saturn   Taurus(2)    0.61  -> Capricorn(10)
 * Rahu     Gemini(3)    19.44 -> Pisces(12)
 * Ketu     Sagittarius(9) 19.44 -> Virgo(6)
 */

const assert = require('assert');
const { calculateD9Sign } = require('./D9chartengine');

const cases = [
  ['Sun', 11, 2.50, 7],
  ['Moon', 8, 0.85, 4],
  ['Mercury', 10, 28.18, 6],
  ['Venus', 12, 15.58, 8],
  ['Mars', 8, 6.22, 5],
  ['Jupiter', 2, 8.04, 12],
  ['Saturn', 2, 0.61, 10],
  ['Rahu', 3, 19.44, 12],
  ['Ketu', 9, 19.44, 6]
];

for (const [planet, signId, degree, expected] of cases) {
  const result = calculateD9Sign(signId, degree);
  assert.strictEqual(
    result.d9SignId,
    expected,
    `${planet}: expected D9 sign ${expected}, got ${result.d9SignId}`
  );
}

// Vargottama guard check: same signId/degree combo where D1 sign === D9 sign
const vargottamaCase = calculateD9Sign(1, 1.0); // Aries, movable, part 0 -> starts at Aries itself
assert.strictEqual(vargottamaCase.isVargottama, true, 'Expected Vargottama flag to be true for Aries part 1');

console.log('D9 calculation sanity test: PASS');
