/**
 * ============================================================
 * D16 ENGINE
 * Parashari Shodashamsha
 * ============================================================
 */

const {
  SIGN_DATA,
  HOUSE_THEMES_D16,
  START_SIGN_BY_NATURE,
  PART_SIZE
} = require('./d16Rules');

const PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu'
];

function normalizeLongitude(value) {
  let longitude = Number(value);

  if (!Number.isFinite(longitude)) {
    throw new Error(`Invalid longitude: ${value}`);
  }

  longitude = ((longitude % 360) + 360) % 360;

  return Number(longitude.toFixed(6));
}

function getSignIdFromLongitude(longitude) {
  const normalized = normalizeLongitude(longitude);

  return Math.floor(normalized / 30) + 1;
}

function getDegreeInSign(longitude) {
  const normalized = normalizeLongitude(longitude);

  const signId = getSignIdFromLongitude(normalized);

  return Number(
    (normalized - ((signId - 1) * 30)).toFixed(6)
  );
}

/**
 * Standard Parashari D16 calculation.
 *
 * Unlike D12, the starting sign for counting depends on
 * the NATURE (movable / fixed / dual) of the D1 sign occupied:
 *   movable -> start from Aries (1)
 *   fixed   -> start from Leo (5)
 *   dual    -> start from Sagittarius (9)
 */
function calculateD16Position(longitude) {
  const normalizedLongitude = normalizeLongitude(longitude);

  const d1SignId = getSignIdFromLongitude(normalizedLongitude);

  const degreeInSign = getDegreeInSign(normalizedLongitude);

  const d1SignData = SIGN_DATA[d1SignId];

  if (!d1SignData) {
    throw new Error(`Invalid D1 sign id derived: ${d1SignId}`);
  }

  /**
   * 0.000° - 1.875°  => index 0
   * 1.875° - 3.750°  => index 1
   * ...
   * 28.125° - 30.00° => index 15
   */
  let partIndex = Math.floor(degreeInSign / PART_SIZE);

  partIndex = Math.max(0, Math.min(15, partIndex));

  const part = partIndex + 1;

  const startSignId = START_SIGN_BY_NATURE[d1SignData.nature];

  if (!startSignId) {
    throw new Error(
      `Unknown sign nature for signId ${d1SignId}: ${d1SignData.nature}`
    );
  }

  /**
   * D16 sign = starting sign (based on D1 sign's nature)
   * moved forward by partIndex.
   */
  const d16SignId = ((startSignId - 1 + partIndex) % 12) + 1;

  /**
   * Position inside the 1.875° D16 subdivision.
   */
  const degreeInsidePart = degreeInSign - (partIndex * PART_SIZE);

  /**
   * Convert 0°-1.875° into 0°-30' (scale factor = 16)
   */
  const d16DegreeInSign = degreeInsidePart * 16;

  const startDegree = partIndex * PART_SIZE;
  const endDegree = startDegree + PART_SIZE;

  return {
    longitude: normalizedLongitude,

    d1SignId,

    d1SignName: d1SignData.name || null,

    d1SignNature: d1SignData.nature || null,

    degreeInSign: Number(degreeInSign.toFixed(4)),

    part,

    partIndex,

    partRange: `${startDegree.toFixed(3)}°-${endDegree.toFixed(3)}°`,

    startSignId,

    startSignName: SIGN_DATA[startSignId]?.name || null,

    signId: d16SignId,

    signName: SIGN_DATA[d16SignId]?.name || null,

    signHindi: SIGN_DATA[d16SignId]?.hindi || null,

    d16DegreeInSign: Number(d16DegreeInSign.toFixed(4))
  };
}

function buildHouses(d16AscendantSignId, planetaryPositions) {
  const houses = {};

  for (let house = 1; house <= 12; house++) {
    const signId = ((d16AscendantSignId - 1 + (house - 1)) % 12) + 1;

    const signData = SIGN_DATA[signId];

    houses[String(house)] = {
      house,

      signId,

      signName: signData?.name || null,

      signHindi: signData?.hindi || null,

      lord: signData?.lord || null,

      occupants: []
    };
  }

  for (const [planet, position] of Object.entries(planetaryPositions)) {
    if (!position?.signId) continue;

    const house = ((position.signId - d16AscendantSignId + 12) % 12) + 1;

    if (!houses[String(house)]) continue;

    houses[String(house)].occupants.push({
      planet,

      signId: position.signId,

      signName: position.signName,

      signHindi: position.signHindi,

      degreeInSign: position.degreeInSign,

      d16DegreeInSign: position.d16DegreeInSign,

      part: position.part
    });
  }

  return houses;
}

function generateD16Chart(planetLongitudes) {
  if (!planetLongitudes || typeof planetLongitudes !== 'object') {
    throw new Error('planetLongitudes object is required.');
  }

  if (
    planetLongitudes.Ascendant === undefined ||
    planetLongitudes.Ascendant === null
  ) {
    throw new Error('Ascendant longitude is required.');
  }

  const planetaryPositions = {};

  /**
   * Ascendant
   */
  const ascendant = calculateD16Position(planetLongitudes.Ascendant);

  planetaryPositions.Ascendant = ascendant;

  /**
   * Planets
   */
  for (const planet of PLANETS) {
    if (
      planetLongitudes[planet] === undefined ||
      planetLongitudes[planet] === null
    ) {
      throw new Error(`Missing longitude for ${planet}.`);
    }

    planetaryPositions[planet] = calculateD16Position(
      planetLongitudes[planet]
    );
  }

  const d16Ascendant = {
    signId: ascendant.signId,

    signName: ascendant.signName,

    signHindi: ascendant.signHindi,

    degreeInSign: ascendant.d16DegreeInSign
  };

  const houses = buildHouses(d16Ascendant.signId, planetaryPositions);

  return {
    chartType: 'D16',

    chartName: 'Shodashamsha Chart',

    calculationSystem: 'Parashari Shodashamsha',

    d16Ascendant,

    houses,

    planetaryPositions,

    houseThemes: HOUSE_THEMES_D16
  };
}

module.exports = {
  normalizeLongitude,
  getSignIdFromLongitude,
  getDegreeInSign,
  calculateD16Position,
  buildHouses,
  generateD16Chart
};
