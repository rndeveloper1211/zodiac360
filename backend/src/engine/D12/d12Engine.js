/**
 * ============================================================
 * D12 ENGINE
 * Parashari Dwadashamsha
 * ============================================================
 */

const {
  SIGN_DATA,
  HOUSE_THEMES_D12,
  PART_SIZE
} = require('./d12Rules');

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
 * Standard Parashari D12 calculation.
 */
function calculateD12Position(longitude) {
  const normalizedLongitude = normalizeLongitude(longitude);

  const d1SignId =
    getSignIdFromLongitude(normalizedLongitude);

  const degreeInSign =
    getDegreeInSign(normalizedLongitude);

  /**
   * 0°00 - 2°30  => index 0
   * 2°30 - 5°00  => index 1
   * ...
   * 27°30 - 30°00 => index 11
   */
  let partIndex = Math.floor(
    degreeInSign / PART_SIZE
  );

  partIndex = Math.max(
    0,
    Math.min(11, partIndex)
  );

  const part = partIndex + 1;

  /**
   * D12 sign starts from D1 sign
   * and moves forward according to part index.
   */
  const d12SignId =
    ((d1SignId - 1 + partIndex) % 12) + 1;

  /**
   * Position inside the 2°30' D12 subdivision.
   */
  const degreeInsidePart =
    degreeInSign - (partIndex * PART_SIZE);

  /**
   * Convert 0°-2°30' into 0°-30'
   */
  const d12DegreeInSign =
    degreeInsidePart * 12;

  const startDegree =
    partIndex * PART_SIZE;

  const endDegree =
    startDegree + PART_SIZE;

  return {
    longitude: normalizedLongitude,

    d1SignId,

    d1SignName:
      SIGN_DATA[d1SignId]?.name || null,

    degreeInSign:
      Number(degreeInSign.toFixed(4)),

    part,

    partIndex,

    partRange:
      `${startDegree.toFixed(2)}°-${endDegree.toFixed(2)}°`,

    signId: d12SignId,

    signName:
      SIGN_DATA[d12SignId]?.name || null,

    signHindi:
      SIGN_DATA[d12SignId]?.hindi || null,

    d12DegreeInSign:
      Number(d12DegreeInSign.toFixed(4))
  };
}

function buildHouses(d12AscendantSignId, planetaryPositions) {
  const houses = {};

  for (let house = 1; house <= 12; house++) {
    const signId =
      ((d12AscendantSignId - 1 + (house - 1)) % 12) + 1;

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

  for (const [planet, position] of Object.entries(
    planetaryPositions
  )) {
    if (!position?.signId) continue;

    const house =
      ((position.signId - d12AscendantSignId + 12) % 12) + 1;

    if (!houses[String(house)]) continue;

    houses[String(house)].occupants.push({
      planet,

      signId: position.signId,

      signName: position.signName,

      signHindi: position.signHindi,

      degreeInSign: position.degreeInSign,

      d12DegreeInSign: position.d12DegreeInSign,

      part: position.part
    });
  }

  return houses;
}

function generateD12Chart(planetLongitudes) {
  if (
    !planetLongitudes ||
    typeof planetLongitudes !== 'object'
  ) {
    throw new Error(
      'planetLongitudes object is required.'
    );
  }

  if (
    planetLongitudes.Ascendant === undefined ||
    planetLongitudes.Ascendant === null
  ) {
    throw new Error(
      'Ascendant longitude is required.'
    );
  }

  const planetaryPositions = {};

  /**
   * Ascendant
   */
  const ascendant =
    calculateD12Position(
      planetLongitudes.Ascendant
    );

  planetaryPositions.Ascendant = ascendant;

  /**
   * Planets
   */
  for (const planet of PLANETS) {
    if (
      planetLongitudes[planet] === undefined ||
      planetLongitudes[planet] === null
    ) {
      throw new Error(
        `Missing longitude for ${planet}.`
      );
    }

    planetaryPositions[planet] =
      calculateD12Position(
        planetLongitudes[planet]
      );
  }

  const d12Ascendant = {
    signId: ascendant.signId,

    signName: ascendant.signName,

    signHindi: ascendant.signHindi,

    degreeInSign: ascendant.d12DegreeInSign
  };

  const houses =
    buildHouses(
      d12Ascendant.signId,
      planetaryPositions
    );

  return {
    chartType: 'D12',

    chartName: 'Dwadashamsha Chart',

    calculationSystem:
      'Parashari Dwadashamsha',

    d12Ascendant,

    houses,

    planetaryPositions,

    houseThemes: HOUSE_THEMES_D12
  };
}

module.exports = {
  normalizeLongitude,
  getSignIdFromLongitude,
  getDegreeInSign,
  calculateD12Position,
  buildHouses,
  generateD12Chart
};