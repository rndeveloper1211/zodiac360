/**
 * D3 (Drekkana) Chart Core Engine
 * Mathematical calculation & Sign mapping
 */

const { SIGNS, DREKKANA_PARTS } = require('./d3Rules');

/**
 * Calculates D3 sign based on D1 sign and exact degree
 * @param {number} signId (1-12)
 * @param {number} degree (0.00 - 29.99...)
 */
function calculateD3Sign(signId, degree) {
  let part = 1;
  let offset = DREKKANA_PARTS.FIRST.offset;

  if (degree >= 10 && degree < 20) {
    part = 2;
    offset = DREKKANA_PARTS.SECOND.offset;
  } else if (degree >= 20) {
    part = 3;
    offset = DREKKANA_PARTS.THIRD.offset;
  }

  // Formula: ((signId - 1 + offset) % 12) + 1
  const d3SignId = ((signId - 1 + offset) % 12) + 1;
  const signData = SIGNS.find((s) => s.id === d3SignId);

  return {
    part,
    d3SignId,
    d3SignName: signData.name,
    d3SignHindi: signData.hindi,
    element: signData.element,
    lord: signData.lord
  };
}

/**
 * Generates structured D3 chart calculations from D1 raw output
 * @param {Object} d1Data 
 */
function generateD3Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  // 1. Calculate D3 Lagna
  const lagnaD3 = calculateD3Sign(lagna.signId, lagna.degreeInSign);

  // 2. Map all Grahas into D3
  const planetCalculations = {};
  const houseOccupancy = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  const d3SignOccupancy = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d3Info = calculateD3Sign(pData.signId, pData.degreeInSign);

    // Calculate house position relative to D3 Lagna
    const house = ((d3Info.d3SignId - lagnaD3.d3SignId + 12) % 12) + 1;

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign,
      d1DegreeInSign: pData.degreeInSign,
      drekkanaPart: d3Info.part,
      d3SignId: d3Info.d3SignId,
      d3SignName: d3Info.d3SignName,
      d3SignHindi: d3Info.d3SignHindi,
      d3Lord: d3Info.lord,
      element: d3Info.element,
      house: house,
      isRetrograde: pData.isRetrograde || false
    };

    houseOccupancy[house].push(planetName);
    d3SignOccupancy[d3Info.d3SignId].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D3',
    chartName: 'Drekkana Chart',
    purpose: [
      'Siblings & Family Bond',
      'Courage, Valour & Drive',
      'Third House Micro-Analysis',
      'Energy & Initiative'
    ],
    meta: {
      dob: meta.inputDate,
      tob: meta.inputTime,
      d3LagnaSignId: lagnaD3.d3SignId,
      d3LagnaSignName: lagnaD3.d3SignName
    },
    lagna: {
      d1SignId: lagna.signId,
      d1SignName: lagna.sign,
      degreeInSign: lagna.degreeInSign,
      drekkanaPart: lagnaD3.part,
      d3SignId: lagnaD3.d3SignId,
      d3SignName: lagnaD3.d3SignName,
      d3SignHindi: lagnaD3.d3SignHindi,
      lord: lagnaD3.lord
    },
    d3SignOccupancy,
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  calculateD3Sign,
  generateD3Chart
};