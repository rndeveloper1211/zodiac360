/**
 * D10 sanity test using the same D1 planetary positions used in the
 * D7/D9 tests, so results are directly cross-checkable against those modules.
 *
 * Dashamsha rule: odd sign -> start from same sign,
 * even sign -> start from 9th sign. Each sign divided into 10 parts of 3°00' each.
 *
 * Expected D10 results (hand-derived):
 * Sun      Aquarius(11) 2.50  -> Aquarius(11)
 * Moon     Scorpio(8)   0.85  -> Cancer(4)
 * Mercury  Capricorn(10) 28.18 -> Gemini(3)
 * Venus    Pisces(12)   15.58 -> Aries(1)
 * Mars     Scorpio(8)   6.22  -> Virgo(6)
 * Jupiter  Taurus(2)    8.04  -> Pisces(12)
 * Saturn   Taurus(2)    0.61  -> Capricorn(10)
 * Rahu     Gemini(3)    19.44 -> Sagittarius(9)
 * Ketu     Sagittarius(9) 19.44 -> Gemini(3)
 */

const assert = require('assert');
const { calculateD10Sign } = require('./D10chartengine');

const cases = [
  ['Sun', 11, 2.50, 11],
  ['Moon', 8, 0.85, 4],
  ['Mercury', 10, 28.18, 3],
  ['Venus', 12, 15.58, 1],
  ['Mars', 8, 6.22, 6],
  ['Jupiter', 2, 8.04, 12],
  ['Saturn', 2, 0.61, 10],
  ['Rahu', 3, 19.44, 9],
  ['Ketu', 9, 19.44, 3]
];

for (const [planet, signId, degree, expected] of cases) {
  const result = calculateD10Sign(signId, degree);
  assert.strictEqual(
    result.d10SignId,
    expected,
    `${planet}: expected D10 sign ${expected}, got ${result.d10SignId}`
  );
}

// Sign-repeat guard check: odd sign, part 1 always starts on the same sign,
// so a low-degree planet in an odd sign should show D1 sign === D10 sign.
const signRepeatCase = calculateD10Sign(1, 1.0); // Aries, odd, part 0 -> starts at Aries itself
assert.strictEqual(signRepeatCase.isSignRepeat, true, 'Expected isSignRepeat flag to be true for Aries part 1');

console.log('D10 calculation sanity test: PASS');
