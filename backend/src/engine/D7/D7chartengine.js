/**
 * D7 (Saptamsha) Chart Core Engine
 *
 * Rule (different from D4!):
 * - ODD sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
 *     counting starts from the SAME sign
 * - EVEN sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
 *     counting starts from the 7th sign from it
 *
 * Each sign is divided into 7 equal parts of 30/7° (~4°17'8.57") each.
 */

const { SIGNS, SIGN_LORDS, D7_PART_SPAN } = require('./d7Rules');

function isOddSign(signId) {
  return signId % 2 === 1;
}

function getD7Part(degreeInSign) {
  let part = Math.floor(degreeInSign / D7_PART_SPAN);
  if (part > 6) part = 6; // guard against degreeInSign === 30 edge case
  if (part < 0) part = 0;
  return part; // 0-indexed (0-6)
}

function calculateD7Sign(signId, degreeInSign) {
  const partIndex = getD7Part(degreeInSign);

  const startSignId = isOddSign(signId)
    ? signId
    : ((signId - 1 + 6) % 12) + 1; // 7th sign from signId

  const d7SignId = ((startSignId - 1 + partIndex) % 12) + 1;
  const signData = SIGNS.find(s => s.id === d7SignId);

  return {
    part: partIndex + 1, // 1-indexed for display
    d7SignId,
    d7SignName: signData.name,
    d7SignHindi: signData.hindi,
    element: signData.element,
    lord: SIGN_LORDS[d7SignId]
  };
}

function calculateD7House(lagnaSignId, planetSignId) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

function buildHouseSignsAndLords(lagnaD7SignId) {
  const houseSigns = {};
  const houseLords = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagnaD7SignId - 1 + (house - 1)) % 12) + 1;
    houseSigns[house] = signId;
    houseLords[house] = SIGN_LORDS[signId];
  }
  return { houseSigns, houseLords };
}

function generateD7Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  const lagnaD7 = calculateD7Sign(lagna.signId, lagna.degreeInSign);
  const { houseSigns, houseLords } = buildHouseSignsAndLords(lagnaD7.d7SignId);

  const houseOccupancy = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const planetCalculations = {};

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d7Info = calculateD7Sign(pData.signId, pData.degreeInSign);
    const house = calculateD7House(lagnaD7.d7SignId, d7Info.d7SignId);

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign || null,
      d1DegreeInSign: pData.degreeInSign,
      saptamshaPart: d7Info.part,
      d7SignId: d7Info.d7SignId,
      d7SignName: d7Info.d7SignName,
      d7SignHindi: d7Info.d7SignHindi,
      d7Lord: d7Info.lord,
      house,
      isRetrograde: Boolean(pData.isRetrograde)
    };

    houseOccupancy[house].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D7',
    chartName: 'Saptamsha Chart',
    calculationSystem: 'Parashari',
    meta: {
      dob: meta?.inputDate || null,
      tob: meta?.inputTime || null,
      d7LagnaSignId: lagnaD7.d7SignId,
      d7LagnaSignName: lagnaD7.d7SignName,
      d7LagnaSignHindi: lagnaD7.d7SignHindi
    },
    lagna: {
      d7SignId: lagnaD7.d7SignId,
      d7SignName: lagnaD7.d7SignName,
      d7SignHindi: lagnaD7.d7SignHindi,
      lord: lagnaD7.lord,
      degreeInSign: lagna.degreeInSign
    },
    houseSigns,
    houseLords,
    fifthLordName: houseLords[5],
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  generateD7Chart,
  calculateD7Sign,
  calculateD7House
};