
/**
 * D4 Common Helpers
 *
 * Used by:
 * - propertyType.js
 * - propertySource.js
 * - propertyLocation.js
 * - other D4 analysis modules
 *
 * Purpose:
 * - Planet lookup
 * - House lookup
 * - Sign lord calculation
 * - Sign nature
 * - Score / confidence helpers
 */

/* =========================================================
 * 1. SIGN LORDS
 * ========================================================= */

const SIGN_LORDS = {
  1: 'Mars',      // Aries
  2: 'Venus',     // Taurus
  3: 'Mercury',   // Gemini
  4: 'Moon',      // Cancer
  5: 'Sun',       // Leo
  6: 'Mercury',   // Virgo
  7: 'Venus',     // Libra
  8: 'Mars',      // Scorpio
  9: 'Jupiter',   // Sagittarius
  10: 'Saturn',   // Capricorn
  11: 'Saturn',   // Aquarius
  12: 'Jupiter'   // Pisces
};


/* =========================================================
 * 2. SIGN NATURE
 * ========================================================= */

const MOVABLE_SIGNS = [1, 4, 7, 10];

const FIXED_SIGNS = [2, 5, 8, 11];

const DUAL_SIGNS = [3, 6, 9, 12];


/* =========================================================
 * 3. GET SIGN LORD
 * ========================================================= */

/**
 * Example:
 * getSignLord(1) -> Mars
 * getSignLord(10) -> Saturn
 */
function getSignLord(sign) {

  const numericSign = Number(sign);

  if (
    !Number.isInteger(numericSign) ||
    numericSign < 1 ||
    numericSign > 12
  ) {
    return null;
  }

  return SIGN_LORDS[numericSign] || null;
}


/* =========================================================
 * 4. GET SIGN NATURE
 * ========================================================= */

/**
 * Returns:
 * - movable
 * - fixed
 * - dual
 */
function getSignNature(sign) {

  const numericSign = Number(sign);

  if (
    !Number.isInteger(numericSign) ||
    numericSign < 1 ||
    numericSign > 12
  ) {
    return null;
  }

  if (MOVABLE_SIGNS.includes(numericSign)) {
    return 'movable';
  }

  if (FIXED_SIGNS.includes(numericSign)) {
    return 'fixed';
  }

  if (DUAL_SIGNS.includes(numericSign)) {
    return 'dual';
  }

  return null;
}


/* =========================================================
 * 5. NORMALIZE PLANET NAME
 * ========================================================= */

function normalizePlanetName(name) {

  if (!name) return null;

  const value =
    String(name)
      .trim()
      .toLowerCase();

  const aliases = {

    sun: 'Sun',
    surya: 'Sun',

    moon: 'Moon',
    chandra: 'Moon',

    mars: 'Mars',
    mangal: 'Mars',

    mercury: 'Mercury',
    budh: 'Mercury',

    jupiter: 'Jupiter',
    guru: 'Jupiter',

    venus: 'Venus',
    shukra: 'Venus',

    saturn: 'Saturn',
    shani: 'Saturn',

    rahu: 'Rahu',

    ketu: 'Ketu'
  };

  return aliases[value] || name;
}


/* =========================================================
 * 6. GET PLANET
 * ========================================================= */

/**
 * Supports:
 *
 * planetCalculations = {
 *   Sun: { sign: 2, house: 2 },
 *   Moon: { sign: 11, house: 11 }
 * }
 *
 * Also handles lowercase / common aliases.
 */
function getPlanet(
  planetCalculations = {},
  planetName
) {

  if (
    !planetCalculations ||
    !planetName
  ) {
    return null;
  }

  const normalized =
    normalizePlanetName(
      planetName
    );


  /* Direct lookup */

  if (
    planetCalculations[normalized]
  ) {
    return planetCalculations[normalized];
  }


  /* Search case-insensitively */

  const entry =
    Object.entries(
      planetCalculations
    ).find(
      ([key]) =>
        normalizePlanetName(key) === normalized
    );


  return entry
    ? entry[1]
    : null;
}


/* =========================================================
 * 7. GET PLANET HOUSE
 * ========================================================= */

function getPlanetHouse(
  planetCalculations = {},
  planetName
) {

  const planet =
    getPlanet(
      planetCalculations,
      planetName
    );

  if (!planet) {
    return null;
  }

  const house =
    Number(planet.house);

  if (
    !Number.isInteger(house) ||
    house < 1 ||
    house > 12
  ) {
    return null;
  }

  return house;
}


/* =========================================================
 * 8. GET PLANET SIGN
 * ========================================================= */

function getPlanetSign(
  planetCalculations = {},
  planetName
) {

  const planet =
    getPlanet(
      planetCalculations,
      planetName
    );

  if (!planet) {
    return null;
  }

  const sign =
    Number(
      planet.sign
    );

  if (
    !Number.isInteger(sign) ||
    sign < 1 ||
    sign > 12
  ) {
    return null;
  }

  return sign;
}


/* =========================================================
 * 9. GET HOUSE OCCUPANTS
 * ========================================================= */

/**
 * Supports:
 *
 * houseOccupancy = {
 *   1: [],
 *   2: ['Sun'],
 *   3: [],
 *   4: ['Moon']
 * }
 *
 * Also supports numeric/string house keys.
 */
function getHouseOccupants(
  houseOccupancy = {},
  house
) {

  const numericHouse =
    Number(house);

  if (
    !Number.isInteger(numericHouse) ||
    numericHouse < 1 ||
    numericHouse > 12
  ) {
    return [];
  }


  let occupants =
    houseOccupancy[numericHouse];


  if (!occupants) {
    occupants =
      houseOccupancy[
        String(numericHouse)
      ];
  }


  if (!occupants) {
    return [];
  }


  /* If already array */

  if (Array.isArray(occupants)) {

    return occupants
      .map(
        planet =>
          normalizePlanetName(planet)
      )
      .filter(Boolean);
  }


  /*
   * Some chart structures may store:
   *
   * { Sun: true, Moon: true }
   */

  if (
    typeof occupants === 'object'
  ) {

    return Object.keys(
      occupants
    )
      .filter(
        planet =>
          occupants[planet]
      )
      .map(
        planet =>
          normalizePlanetName(planet)
      );
  }


  /*
   * Single planet string
   */

  if (
    typeof occupants === 'string'
  ) {

    return [
      normalizePlanetName(
        occupants
      )
    ];
  }


  return [];
}


/* =========================================================
 * 10. CHECK PLANET IN HOUSE
 * ========================================================= */

function isPlanetInHouse(
  houseOccupancy = {},
  house,
  planetName
) {

  const occupants =
    getHouseOccupants(
      houseOccupancy,
      house
    );

  const normalized =
    normalizePlanetName(
      planetName
    );

  return occupants.includes(
    normalized
  );
}


/* =========================================================
 * 11. GET HOUSE SIGN
 * ========================================================= */

/**
 * D4 lagna se house sign calculate karta hai.
 *
 * Example:
 * Lagna = 10 (Capricorn)
 *
 * 1st = 10
 * 2nd = 11
 * 3rd = 12
 * 4th = 1
 */
function getHouseSign(
  lagnaSign,
  house
) {

  const lagna =
    Number(lagnaSign);

  const numericHouse =
    Number(house);

  if (
    !Number.isInteger(lagna) ||
    lagna < 1 ||
    lagna > 12
  ) {
    return null;
  }

  if (
    !Number.isInteger(numericHouse) ||
    numericHouse < 1 ||
    numericHouse > 12
  ) {
    return null;
  }

  return (
    (
      lagna +
      numericHouse -
      2
    ) % 12
  ) + 1;
}


/* =========================================================
 * 12. GET HOUSE LORD
 * ========================================================= */

function getHouseLord(
  lagnaSign,
  house
) {

  const sign =
    getHouseSign(
      lagnaSign,
      house
    );

  if (!sign) {
    return null;
  }

  return getSignLord(
    sign
  );
}


/* =========================================================
 * 13. SCORE TO CONFIDENCE
 * ========================================================= */

function scoreToConfidence(
  score
) {

  const value =
    Number(score) || 0;


  if (value >= 80) {
    return 'veryHigh';
  }

  if (value >= 65) {
    return 'high';
  }

  if (value >= 45) {
    return 'medium';
  }

  if (value >= 25) {
    return 'low';
  }

  return 'veryLow';
}


/* =========================================================
 * 14. BUILD SCORE RESULT
 * ========================================================= */

function buildScoreResult({
  score = 0,
  factors = [],
  cautionFactors = [],
  label = null
} = {}) {

  const normalizedScore =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          Number(score) || 0
        )
      )
    );


  return {

    score:
      normalizedScore,

    confidence:
      scoreToConfidence(
        normalizedScore
      ),

    label,

    factors:
      Array.isArray(factors)
        ? factors
        : [],

    cautionFactors:
      Array.isArray(cautionFactors)
        ? cautionFactors
        : []
  };
}


/* =========================================================
 * 15. GET FOURTH HOUSE SIGN
 * ========================================================= */

function getFourthHouseSign(
  lagnaSign
) {

  return getHouseSign(
    lagnaSign,
    4
  );
}


/* =========================================================
 * 16. CHECK ANY PLANET IN HOUSE
 * ========================================================= */

function hasAnyPlanetInHouse(
  houseOccupancy = {},
  house,
  planets = []
) {

  const occupants =
    getHouseOccupants(
      houseOccupancy,
      house
    );

  const normalizedPlanets =
    planets.map(
      planet =>
        normalizePlanetName(
          planet
        )
    );

  return occupants.some(
    planet =>
      normalizedPlanets.includes(
        planet
      )
  );
}


/* =========================================================
 * 17. UNIQUE ARRAY
 * ========================================================= */

function unique(
  array = []
) {

  return [
    ...new Set(
      Array.isArray(array)
        ? array
        : []
    )
  ];
}


/* =========================================================
 * 18. EXPORT
 * ========================================================= */

module.exports = {

  SIGN_LORDS,

  MOVABLE_SIGNS,
  FIXED_SIGNS,
  DUAL_SIGNS,

  getSignLord,
  getSignNature,

  normalizePlanetName,

  getPlanet,
  getPlanetHouse,
  getPlanetSign,

  getHouseOccupants,
  isPlanetInHouse,
  hasAnyPlanetInHouse,

  getHouseSign,
  getHouseLord,
  getFourthHouseSign,

  scoreToConfidence,
  buildScoreResult,

  unique
};
