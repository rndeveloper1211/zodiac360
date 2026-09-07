/**
 * D24 (Chaturvimshamsha) Chart Core Engine
 *
 * Rule:
 * - ODD sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
 *     counting starts from LEO (Simha)
 * - EVEN sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
 *     counting starts from CANCER (Kark)
 *
 * Each sign is divided into 24 equal parts of 30/24° (1°15') each.
 */

const { SIGNS, SIGN_LORDS, D24_PART_SPAN } = require('./d24Rules');

const LEO_SIGN_ID = 5;
const CANCER_SIGN_ID = 4;

function isOddSign(signId) {
  return signId % 2 === 1;
}

function getD24Part(degreeInSign) {
  let part = Math.floor(degreeInSign / D24_PART_SPAN);
  if (part > 23) part = 23; // guard against degreeInSign === 30 edge case
  if (part < 0) part = 0;
  return part; // 0-indexed (0-23)
}

function getChaturvimshamshaStartSign(signId) {
  return isOddSign(signId) ? LEO_SIGN_ID : CANCER_SIGN_ID;
}

function calculateD24Sign(signId, degreeInSign) {
  const partIndex = getD24Part(degreeInSign);
  const startSignId = getChaturvimshamshaStartSign(signId);
  const d24SignId = ((startSignId - 1 + partIndex) % 12) + 1;
  const signData = SIGNS.find(s => s.id === d24SignId);

  return {
    part: partIndex + 1, // 1-indexed for display
    d24SignId,
    d24SignName: signData.name,
    d24SignHindi: signData.hindi,
    element: signData.element,
    lord: SIGN_LORDS[d24SignId],
    // General same-sign strength marker (D1 sign === D24 sign). Note: classically
    // "Vargottama" is a D9-specific term — this is the D24-equivalent repetition
    // check, used here only as a mild strength bonus, not as the classical term.
    isSignRepeat: d24SignId === signId
  };
}

function calculateD24House(lagnaSignId, planetSignId) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

function buildHouseSignsAndLords(lagnaD24SignId) {
  const houseSigns = {};
  const houseLords = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagnaD24SignId - 1 + (house - 1)) % 12) + 1;
    houseSigns[house] = signId;
    houseLords[house] = SIGN_LORDS[signId];
  }
  return { houseSigns, houseLords };
}

function generateD24Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  const lagnaD24 = calculateD24Sign(lagna.signId, lagna.degreeInSign);
  const { houseSigns, houseLords } = buildHouseSignsAndLords(lagnaD24.d24SignId);

  const houseOccupancy = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const planetCalculations = {};

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d24Info = calculateD24Sign(pData.signId, pData.degreeInSign);
    const house = calculateD24House(lagnaD24.d24SignId, d24Info.d24SignId);

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign || null,
      d1DegreeInSign: pData.degreeInSign,
      chaturvimshamshaPart: d24Info.part,
      d24SignId: d24Info.d24SignId,
      d24SignName: d24Info.d24SignName,
      d24SignHindi: d24Info.d24SignHindi,
      d24Lord: d24Info.lord,
      house,
      isSignRepeat: d24Info.isSignRepeat,
      isRetrograde: Boolean(pData.isRetrograde)
    };

    houseOccupancy[house].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D24',
    chartName: 'Chaturvimshamsha Chart',
    calculationSystem: 'Parashari',
    meta: {
      dob: meta?.inputDate || null,
      tob: meta?.inputTime || null,
      d24LagnaSignId: lagnaD24.d24SignId,
      d24LagnaSignName: lagnaD24.d24SignName,
      d24LagnaSignHindi: lagnaD24.d24SignHindi,
      lagnaIsSignRepeat: lagnaD24.isSignRepeat
    },
    lagna: {
      d24SignId: lagnaD24.d24SignId,
      d24SignName: lagnaD24.d24SignName,
      d24SignHindi: lagnaD24.d24SignHindi,
      lord: lagnaD24.lord,
      degreeInSign: lagna.degreeInSign,
      isSignRepeat: lagnaD24.isSignRepeat
    },
    houseSigns,
    houseLords,
    fourthLordName: houseLords[4],
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  generateD24Chart,
  calculateD24Sign,
  calculateD24House,
  isOddSign,
  getChaturvimshamshaStartSign
};
