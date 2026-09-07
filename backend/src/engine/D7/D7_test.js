/**
 * D7 sanity test using the D1 planetary positions supplied in the request.
 *
 * Expected D7 results:
 * Sun      Aquarius 2.50  -> Aquarius
 * Moon     Scorpio  0.85  -> Taurus
 * Mercury  Capricorn 28.18 -> Capricorn
 * Venus    Pisces 15.58 -> Sagittarius
 * Mars     Scorpio  6.22  -> Gemini
 * Jupiter  Taurus   8.04 -> Sagittarius
 * Saturn   Taurus   0.61 -> Scorpio
 * Rahu     Gemini  19.44 -> Libra
 * Ketu     Sagittarius 19.44 -> Aries
 */

const assert = require('assert');
const { calculateD7Sign } = require('./D7chartengine');

const cases = [
  ['Sun', 11, 2.50, 11],
  ['Moon', 8, 0.85, 2],
  ['Mercury', 10, 28.18, 10],
  ['Venus', 12, 15.58, 9],
  ['Mars', 8, 6.22, 3],
  ['Jupiter', 2, 8.04, 9],
  ['Saturn', 2, 0.61, 8],
  ['Rahu', 3, 19.44, 7],
  ['Ketu', 9, 19.44, 1]
];

for (const [planet, signId, degree, expected] of cases) {
  const result = calculateD7Sign(signId, degree);
  assert.strictEqual(
    result.d7SignId,
    expected,
    `${planet}: expected D7 sign ${expected}, got ${result.d7SignId}`
  );
}

console.log('D7 calculation sanity test: PASS');
