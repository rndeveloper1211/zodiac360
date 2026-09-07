/**
 * D4 (Chaturthamsha) Chart Core Engine
 * 
 * 0°00' - 7°30'   → Same sign (+0)
 * 7°30' - 15°00'  → 4th sign (+3)
 * 15°00' - 22°30' → 7th sign (+6)
 * 22°30' - 30°00' → 10th sign (+9)
 */

const { SIGNS, SIGN_LORDS, D4_PARTS } = require('./d4Rules');

function getD4Part(degree) {
  if (degree < 7.5) return { part: 1, offset: D4_PARTS.PART_1.offset };
  if (degree < 15) return { part: 2, offset: D4_PARTS.PART_2.offset };
  if (degree < 22.5) return { part: 3, offset: D4_PARTS.PART_3.offset };
  return { part: 4, offset: D4_PARTS.PART_4.offset };
}

function calculateD4Sign(signId, degree) {
  const { part, offset } = getD4Part(degree);
  const d4SignId = ((signId - 1 + offset) % 12) + 1;
  const signData = SIGNS.find(s => s.id === d4SignId);

  return {
    part,
    offset,
    d4SignId,
    d4SignName: signData.name,
    d4SignHindi: signData.hindi,
    element: signData.element,
    lord: SIGN_LORDS[d4SignId]
  };
}

function calculateD4House(lagnaSignId, planetSignId) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

function buildHouseSignsAndLords(lagnaD4SignId) {
  const houseSigns = {};
  const houseLords = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagnaD4SignId - 1 + (house - 1)) % 12) + 1;
    houseSigns[house] = signId;
    houseLords[house] = SIGN_LORDS[signId];
  }
  return { houseSigns, houseLords };
}

function generateD4Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  const lagnaD4 = calculateD4Sign(lagna.signId, lagna.degreeInSign);
  const { houseSigns, houseLords } = buildHouseSignsAndLords(lagnaD4.d4SignId);

  const houseOccupancy = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const planetCalculations = {};

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d4Info = calculateD4Sign(pData.signId, pData.degreeInSign);
    const house = calculateD4House(lagnaD4.d4SignId, d4Info.d4SignId);

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign || null,
      d1DegreeInSign: pData.degreeInSign,
      chaturthamshaPart: d4Info.part,
      d4SignId: d4Info.d4SignId,
      d4SignName: d4Info.d4SignName,
      d4SignHindi: d4Info.d4SignHindi,
      d4Lord: d4Info.lord,
      house,
      isRetrograde: Boolean(pData.isRetrograde)
    };

    houseOccupancy[house].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D4',
    chartName: 'Chaturthamsha Chart',
    calculationSystem: 'Parashari',
    meta: {
      dob: meta?.inputDate || null,
      tob: meta?.inputTime || null,
      d4LagnaSignId: lagnaD4.d4SignId,
      d4LagnaSignName: lagnaD4.d4SignName,
      d4LagnaSignHindi: lagnaD4.d4SignHindi
    },
    lagna: {
      d3SignId: lagnaD4.d4SignId, // legacy/compatibility key if needed
      d4SignId: lagnaD4.d4SignId,
      d4SignName: lagnaD4.d4SignName,
      d4SignHindi: lagnaD4.d4SignHindi,
      lord: lagnaD4.lord,
      degreeInSign: lagna.degreeInSign
    },
    houseSigns,
    houseLords,
    fourthLordName: houseLords[4],
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  generateD4Chart,
  calculateD4Sign,
  calculateD4House
};