/**
 * D9 (Navamsha) Chart Core Engine
 *
 * Rule (different from D7's odd/even rule!):
 * - MOVABLE sign (Aries, Cancer, Libra, Capricorn):
 *     counting starts from the SAME sign
 * - FIXED sign (Taurus, Leo, Scorpio, Aquarius):
 *     counting starts from the 9th sign from it
 * - DUAL sign (Gemini, Virgo, Sagittarius, Pisces):
 *     counting starts from the 5th sign from it
 *
 * Each sign is divided into 9 equal parts of 30/9° (3°20') each.
 */

const { SIGNS, SIGN_LORDS, D9_PART_SPAN } = require('./d9Rules');

function getModality(signId) {
  const mod = (signId - 1) % 3;
  if (mod === 0) return 'movable';
  if (mod === 1) return 'fixed';
  return 'dual';
}

function nthSignFrom(signId, n) {
  // n is 1-indexed count-inclusive (n=1 => same sign, n=9 => 9th sign from signId)
  return ((signId - 1 + (n - 1)) % 12) + 1;
}

function getD9Part(degreeInSign) {
  let part = Math.floor(degreeInSign / D9_PART_SPAN);
  if (part > 8) part = 8; // guard against degreeInSign === 30 edge case
  if (part < 0) part = 0;
  return part; // 0-indexed (0-8)
}

function getNavamshaStartSign(signId) {
  const modality = getModality(signId);
  if (modality === 'movable') return signId;
  if (modality === 'fixed') return nthSignFrom(signId, 9);
  return nthSignFrom(signId, 5); // dual
}

function calculateD9Sign(signId, degreeInSign) {
  const partIndex = getD9Part(degreeInSign);
  const startSignId = getNavamshaStartSign(signId);
  const d9SignId = ((startSignId - 1 + partIndex) % 12) + 1;
  const signData = SIGNS.find(s => s.id === d9SignId);

  return {
    part: partIndex + 1, // 1-indexed for display
    d9SignId,
    d9SignName: signData.name,
    d9SignHindi: signData.hindi,
    element: signData.element,
    lord: SIGN_LORDS[d9SignId],
    isVargottama: d9SignId === signId // planet in same sign in D1 and D9 — key D9-only strength marker
  };
}

function calculateD9House(lagnaSignId, planetSignId) {
  return ((planetSignId - lagnaSignId + 12) % 12) + 1;
}

function buildHouseSignsAndLords(lagnaD9SignId) {
  const houseSigns = {};
  const houseLords = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagnaD9SignId - 1 + (house - 1)) % 12) + 1;
    houseSigns[house] = signId;
    houseLords[house] = SIGN_LORDS[signId];
  }
  return { houseSigns, houseLords };
}

function generateD9Chart(d1Data) {
  const { lagna, grahas, meta } = d1Data;

  const lagnaD9 = calculateD9Sign(lagna.signId, lagna.degreeInSign);
  const { houseSigns, houseLords } = buildHouseSignsAndLords(lagnaD9.d9SignId);

  const houseOccupancy = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };
  const planetCalculations = {};

  for (const [planetName, pData] of Object.entries(grahas)) {
    const d9Info = calculateD9Sign(pData.signId, pData.degreeInSign);
    const house = calculateD9House(lagnaD9.d9SignId, d9Info.d9SignId);

    planetCalculations[planetName] = {
      planet: planetName,
      d1SignId: pData.signId,
      d1SignName: pData.sign || null,
      d1DegreeInSign: pData.degreeInSign,
      navamshaPart: d9Info.part,
      d9SignId: d9Info.d9SignId,
      d9SignName: d9Info.d9SignName,
      d9SignHindi: d9Info.d9SignHindi,
      d9Lord: d9Info.lord,
      house,
      isVargottama: d9Info.isVargottama,
      isRetrograde: Boolean(pData.isRetrograde)
    };

    houseOccupancy[house].push(planetName);
  }

  return {
    success: true,
    statusCode: 200,
    chartType: 'D9',
    chartName: 'Navamsha Chart',
    calculationSystem: 'Parashari',
    meta: {
      dob: meta?.inputDate || null,
      tob: meta?.inputTime || null,
      d9LagnaSignId: lagnaD9.d9SignId,
      d9LagnaSignName: lagnaD9.d9SignName,
      d9LagnaSignHindi: lagnaD9.d9SignHindi,
      lagnaIsVargottama: lagnaD9.isVargottama
    },
    lagna: {
      d9SignId: lagnaD9.d9SignId,
      d9SignName: lagnaD9.d9SignName,
      d9SignHindi: lagnaD9.d9SignHindi,
      lord: lagnaD9.lord,
      degreeInSign: lagna.degreeInSign,
      isVargottama: lagnaD9.isVargottama
    },
    houseSigns,
    houseLords,
    seventhLordName: houseLords[7],
    houseOccupancy,
    planetCalculations
  };
}

module.exports = {
  generateD9Chart,
  calculateD9Sign,
  calculateD9House,
  getModality,
  nthSignFrom
};
