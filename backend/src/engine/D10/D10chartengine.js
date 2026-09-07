/**
 * D10 (Dashamsha) Chart Core Engine
 *
 * Rule (odd/even rule — same family as D7's, different from D9's
 * movable/fixed/dual rule):
 * - ODD sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
 *     counting starts from the SAME sign
 * - EVEN sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
 *     counting starts from the 9th sign from it
 *
 * Each sign is divided into 10 equal parts of 30/10° (3°00') each.
 */

const { SIGNS, SIGN_LORDS, D10_PART_SPAN } = require('./d10Rules');

function isOddSign(signId) {
  return signId % 2 === 1;
}

function nthSignFrom(signId, n) {
  // n is 1-indexed count-inclusive (n=1 => same sign, n=9 => 9th sign from signId)
  return ((signId - 1 + (n - 1)) % 12) + 1;
}

function getD10Part(degreeInSign) {
  let part = Math.floor(degreeInSign / D10_PART_SPAN);
  if (part > 9) part = 9; // guard against degreeInSign === 30 edge case
  if (part < 0) part = 0;
  return part; // 0-indexed (0-9)
}

function getDashamshaStartSign(signId) {
  return isOddSign(signId) ? signId : nthSignFrom(signId, 9);
}

function calculateD10Sign(signId, degreeInSign) {
  const partIndex = getD10Part(degreeInSign);
  const startSignId = getDashamshaStartSign(signId);
  const d10SignId = ((startSignId - 1 + partIndex) % 12) + 1;
  const signData = SIGNS.find(s => s.id === d10SignId);

  return {
    part: partIndex + 1, // 1-indexed for display
    d10SignId,
    d10SignName: signData.name,
    d10SignHindi: signData.hindi,
    element: signData.element,
    lord: SIGN_LORDS[d10SignId],
    // General same-sign strength marker (D1 sign === D10 sign). Note: classically
    // "Vargottama" is a D9-specific term — this is the D10-equivalent repetition
    // check, used here only as a mild strength bonus, not as the classical term.
    isSignRepeat: d10SignId === signId
  };
}

function calculateD10House(lagnaSignId, planetSignId) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

function buildHouseSignsAndLords(lagnaD10SignId) {
  const houseSigns = {};
  const houseLords = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagnaD10SignId - 1 + (house - 1)) % 12) + 1;
    houseSigns[house] = signId;
    houseLords[house] = SIGN_LORDS[signId];
  }
  return { houseSigns, houseLords };
}

function generateD10Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  const lagnaD10 = calculateD10Sign(lagna.signId, lagna.degreeInSign);
  const { houseSigns, houseLords } = buildHouseSignsAndLords(lagnaD10.d10SignId);

  const houseOccupancy = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const planetCalculations = {};

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d10Info = calculateD10Sign(pData.signId, pData.degreeInSign);
    const house = calculateD10House(lagnaD10.d10SignId, d10Info.d10SignId);

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign || null,
      d1DegreeInSign: pData.degreeInSign,
      dashamshaPart: d10Info.part,
      d10SignId: d10Info.d10SignId,
      d10SignName: d10Info.d10SignName,
      d10SignHindi: d10Info.d10SignHindi,
      d10Lord: d10Info.lord,
      house,
      isSignRepeat: d10Info.isSignRepeat,
      isRetrograde: Boolean(pData.isRetrograde)
    };

    houseOccupancy[house].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D10',
    chartName: 'Dashamsha Chart',
    calculationSystem: 'Parashari',
    meta: {
      dob: meta?.inputDate || null,
      tob: meta?.inputTime || null,
      d10LagnaSignId: lagnaD10.d10SignId,
      d10LagnaSignName: lagnaD10.d10SignName,
      d10LagnaSignHindi: lagnaD10.d10SignHindi,
      lagnaIsSignRepeat: lagnaD10.isSignRepeat
    },
    lagna: {
      d10SignId: lagnaD10.d10SignId,
      d10SignName: lagnaD10.d10SignName,
      d10SignHindi: lagnaD10.d10SignHindi,
      lord: lagnaD10.lord,
      degreeInSign: lagna.degreeInSign,
      isSignRepeat: lagnaD10.isSignRepeat
    },
    houseSigns,
    houseLords,
    tenthLordName: houseLords[10],
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  generateD10Chart,
  calculateD10Sign,
  calculateD10House,
  isOddSign,
  nthSignFrom
};
