/**
 * D4 Property Type Analysis
 *
 * Determines the likely type/nature of property:
 * - Residential
 * - Commercial
 * - Land
 * - Plot
 * - Apartment
 * - Independent House
 *
 * This file only analyzes property TYPE.
 * Property source/location are handled separately.
 */

const {
  PROPERTY_TYPES,
  PROPERTY_TYPE_WEIGHTS,
  PROPERTY_BENEFICS,
  PROPERTY_MALEFICS
} = require('./propertyRules');

const {
  getSignLord,
  getPlanet,
  getHouseOccupants,
  getSignNature,
  scoreToConfidence,
  buildScoreResult
} = require('../utils/d4Helpers');


/* =========================================================
 * BASIC HELPERS
 * ========================================================= */

/**
 * Get 4th house sign from D4 Lagna sign.
 */
function getFourthHouseSign(lagnaSign) {
  const sign = Number(lagnaSign);

  if (!sign || sign < 1 || sign > 12) {
    return null;
  }

  return ((sign + 2) % 12) + 1;
}


/**
 * Find lord of a house.
 */
function getHouseLord(d4LagnaSign, houseNumber) {
  const houseSign =
    ((Number(d4LagnaSign) + Number(houseNumber) - 2) % 12) + 1;

  return getSignLord(houseSign);
}


/**
 * Check whether a house has a particular planet.
 */
function hasPlanetInHouse(houseOccupancy, house, planet) {
  const occupants = getHouseOccupants(houseOccupancy, house);

  return occupants.some(p => String(p).toLowerCase() === planet.toLowerCase());
}


/**
 * Check whether a house contains any planet from a list.
 */
function hasAnyPlanetInHouse(houseOccupancy, house, planets) {
  const occupants = getHouseOccupants(houseOccupancy, house);

  return occupants.some(planet =>
    planets.includes(planet)
  );
}


/**
 * Get planet house safely.
 */
function getPlanetHouse(planetCalculations, planetName) {
  const planet = getPlanet(planetCalculations, planetName);

  if (!planet) return null;

  const house = Number(planet.house);

  return Number.isFinite(house) ? house : null;
}


/**
 * Add score safely.
 */
function addScore(scores, type, amount, factor, supportingFactors) {
  if (!scores[type]) {
    scores[type] = 0;
  }

  scores[type] += amount;

  if (factor && supportingFactors[type]) {
    supportingFactors[type].push(factor);
  }
}


/* =========================================================
 * PROPERTY TYPE ANALYSIS
 * ========================================================= */

function analyzePropertyType(d4Data) {

  const {
    d4LagnaSign,
    lagnaSign,
    houseOccupancy = {},
    planetCalculations = {}
  } = d4Data || {};

  const effectiveLagna =
    d4LagnaSign ||
    lagnaSign ||
    d4Data?.lagna?.sign ||
    d4Data?.d4Lagna?.sign;

  if (!effectiveLagna) {
    return {
      success: false,
      error: 'D4 Lagna sign is required for property type analysis'
    };
  }

  const fourthHouse = 4;
  const tenthHouse = 10;
  const eleventhHouse = 11;
  const secondHouse = 2;

  const fourthSign = getFourthHouseSign(effectiveLagna);
  const fourthLord = getHouseLord(effectiveLagna, 4);

  const tenthLord = getHouseLord(effectiveLagna, 10);
  const eleventhLord = getHouseLord(effectiveLagna, 11);

  const fourthLordHouse = fourthLord
    ? getPlanetHouse(planetCalculations, fourthLord)
    : null;

  const tenthLordHouse = tenthLord
    ? getPlanetHouse(planetCalculations, tenthLord)
    : null;

  const eleventhLordHouse = eleventhLord
    ? getPlanetHouse(planetCalculations, eleventhLord)
    : null;

  const scores = {
    [PROPERTY_TYPES.RESIDENTIAL]: 0,
    [PROPERTY_TYPES.COMMERCIAL]: 0,
    [PROPERTY_TYPES.LAND]: 0,
    [PROPERTY_TYPES.PLOT]: 0,
    [PROPERTY_TYPES.APARTMENT]: 0,
    [PROPERTY_TYPES.INDEPENDENT_HOUSE]: 0
  };

  const supportingFactors = {
    residential: [],
    commercial: [],
    land: [],
    plot: [],
    apartment: [],
    independentHouse: []
  };

  const cautionFactors = {
    residential: [],
    commercial: [],
    land: [],
    plot: [],
    apartment: [],
    independentHouse: []
  };


  /* =======================================================
   * 1. 4TH HOUSE OCCUPANTS
   * ======================================================= */

  const fourthOccupants =
    getHouseOccupants(houseOccupancy, fourthHouse);

  if (fourthOccupants.length) {

    fourthOccupants.forEach(planet => {

      if (planet === 'Venus') {
        addScore(
          scores,
          'residential',
          10,
          'Venus occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'apartment',
          8,
          'Venus occupying 4th house',
          supportingFactors
        );
      }

      if (planet === 'Moon') {
        addScore(
          scores,
          'residential',
          10,
          'Moon occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'independentHouse',
          6,
          'Moon occupying 4th house',
          supportingFactors
        );
      }

      if (planet === 'Mars') {
        addScore(
          scores,
          'land',
          12,
          'Mars occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'plot',
          10,
          'Mars occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'independentHouse',
          5,
          'Mars occupying 4th house',
          supportingFactors
        );
      }

      if (planet === 'Saturn') {
        addScore(
          scores,
          'land',
          7,
          'Saturn occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'plot',
          7,
          'Saturn occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'commercial',
          5,
          'Saturn occupying 4th house',
          supportingFactors
        );
      }

      if (planet === 'Mercury') {
        addScore(
          scores,
          'commercial',
          8,
          'Mercury occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'apartment',
          4,
          'Mercury occupying 4th house',
          supportingFactors
        );
      }

      if (planet === 'Jupiter') {
        addScore(
          scores,
          'residential',
          8,
          'Jupiter occupying 4th house',
          supportingFactors
        );

        addScore(
          scores,
          'independentHouse',
          6,
          'Jupiter occupying 4th house',
          supportingFactors
        );
      }

      if (PROPERTY_MALEFICS.includes(planet)) {
        cautionFactors.residential.push(
          `${planet} in 4th house may create property-related pressure`
        );
      }
    });
  }


  /* =======================================================
   * 2. 4TH LORD
   * ======================================================= */

  if (fourthLord && fourthLordHouse) {

    if ([1, 2, 4, 5, 7, 11].includes(fourthLordHouse)) {

      addScore(
        scores,
        'residential',
        8,
        `4th lord ${fourthLord} in supportive house ${fourthLordHouse}`,
        supportingFactors
      );
    }

    if ([2, 4, 5, 10, 11].includes(fourthLordHouse)) {

      addScore(
        scores,
        'independentHouse',
        6,
        `4th lord ${fourthLord} supports house ownership`,
        supportingFactors
      );
    }

    if ([4, 5, 8, 10, 11].includes(fourthLordHouse)) {

      addScore(
        scores,
        'land',
        6,
        `4th lord ${fourthLord} connected with property/asset houses`,
        supportingFactors
      );
    }

    if ([3, 6, 8, 10, 11].includes(fourthLordHouse)) {

      addScore(
        scores,
        'commercial',
        5,
        `4th lord ${fourthLord} connected with activity/income houses`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 3. 10TH HOUSE / 10TH LORD
   * ======================================================= */

  const tenthOccupants =
    getHouseOccupants(houseOccupancy, tenthHouse);

  if (tenthOccupants.length) {

    if (hasAnyPlanetInHouse(
      houseOccupancy,
      tenthHouse,
      ['Mercury', 'Saturn', 'Sun', 'Rahu']
    )) {

      addScore(
        scores,
        'commercial',
        12,
        'Strong 10th house planetary activity',
        supportingFactors
      );
    }

    if (hasAnyPlanetInHouse(
      houseOccupancy,
      tenthHouse,
      ['Venus', 'Moon']
    )) {

      addScore(
        scores,
        'commercial',
        5,
        '10th house connection with Venus/Moon',
        supportingFactors
      );
    }
  }

  if ([2, 4, 10, 11].includes(tenthLordHouse)) {

    addScore(
      scores,
      'commercial',
      8,
      `10th lord ${tenthLord} connected with property/income houses`,
      supportingFactors
    );
  }


  /* =======================================================
   * 4. 11TH HOUSE / 11TH LORD
   * ======================================================= */

  const eleventhOccupants =
    getHouseOccupants(houseOccupancy, eleventhHouse);

  if (eleventhOccupants.length) {

    addScore(
      scores,
      'commercial',
      5,
      '11th house occupied — gains connection',
      supportingFactors
    );

    addScore(
      scores,
      'investmentGains',
      5,
      '11th house occupied — gains connection',
      supportingFactors
    );
  }

  if ([2, 4, 10, 11].includes(eleventhLordHouse)) {

    addScore(
      scores,
      'commercial',
      5,
      `11th lord ${eleventhLord} connected with property/gain houses`,
      supportingFactors
    );
  }


  /* =======================================================
   * 5. 2ND HOUSE / FAMILY ASSET CONNECTION
   * ======================================================= */

  const secondOccupants =
    getHouseOccupants(houseOccupancy, secondHouse);

  if (secondOccupants.length) {

    addScore(
      scores,
      'residential',
      4,
      '2nd house connection with family assets',
      supportingFactors
    );

    addScore(
      scores,
      'independentHouse',
      4,
      '2nd house connection with accumulated family assets',
      supportingFactors
    );
  }


  /* =======================================================
   * 6. MARS
   * ======================================================= */

  const marsHouse =
    getPlanetHouse(planetCalculations, 'Mars');

  if (marsHouse) {

    if ([2, 4, 10, 11].includes(marsHouse)) {

      addScore(
        scores,
        'land',
        10,
        `Mars in property-related house ${marsHouse}`,
        supportingFactors
      );

      addScore(
        scores,
        'plot',
        8,
        `Mars in property-related house ${marsHouse}`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 7. VENUS
   * ======================================================= */

  const venusHouse =
    getPlanetHouse(planetCalculations, 'Venus');

  if (venusHouse) {

    if ([1, 2, 4, 5, 7, 11].includes(venusHouse)) {

      addScore(
        scores,
        'residential',
        7,
        `Venus in comfort/property-supporting house ${venusHouse}`,
        supportingFactors
      );

      addScore(
        scores,
        'apartment',
        6,
        `Venus in comfort/property-supporting house ${venusHouse}`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 8. MOON
   * ======================================================= */

  const moonHouse =
    getPlanetHouse(planetCalculations, 'Moon');

  if (moonHouse) {

    if ([1, 2, 4, 7, 11].includes(moonHouse)) {

      addScore(
        scores,
        'residential',
        6,
        `Moon in residential-supporting house ${moonHouse}`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 9. MERCURY
   * ======================================================= */

  const mercuryHouse =
    getPlanetHouse(planetCalculations, 'Mercury');

  if (mercuryHouse) {

    if ([2, 10, 11].includes(mercuryHouse)) {

      addScore(
        scores,
        'commercial',
        7,
        `Mercury in business/gain house ${mercuryHouse}`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 10. SATURN
   * ======================================================= */

  const saturnHouse =
    getPlanetHouse(planetCalculations, 'Saturn');

  if (saturnHouse) {

    if ([4, 10, 11].includes(saturnHouse)) {

      addScore(
        scores,
        'commercial',
        6,
        `Saturn connected with property/career/gain house ${saturnHouse}`,
        supportingFactors
      );

      addScore(
        scores,
        'land',
        5,
        `Saturn supports durable/long-term assets from house ${saturnHouse}`,
        supportingFactors
      );
    }
  }


  /* =======================================================
   * 11. SIGN NATURE OF 4TH HOUSE
   * ======================================================= */

  const fourthSignNature =
    getSignNature(fourthSign);

  if (fourthSignNature === 'fixed') {

    addScore(
      scores,
      'residential',
      4,
      'Fixed sign in 4th house supports stable residence',
      supportingFactors
    );

    addScore(
      scores,
      'independentHouse',
      3,
      'Fixed 4th sign supports stable ownership',
      supportingFactors
    );
  }

  if (fourthSignNature === 'movable') {

    addScore(
      scores,
      'plot',
      3,
      'Movable 4th sign supports changing/property development themes',
      supportingFactors
    );
  }

  if (fourthSignNature === 'dual') {

    addScore(
      scores,
      'apartment',
      3,
      'Dual 4th sign can support flexible/residential arrangements',
      supportingFactors
    );
  }


  /* =======================================================
   * 12. NORMALIZE SCORES
   * ======================================================= */

  const maxScore = Math.max(...Object.values(scores), 1);

  const normalizedScores = {};

  Object.entries(scores).forEach(([type, score]) => {

    normalizedScores[type] = Math.min(
      100,
      Math.round((score / maxScore) * 100)
    );
  });


  /* =======================================================
   * 13. RANK PROPERTY TYPES
   * ======================================================= */

  const ranked = Object.entries(normalizedScores)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score]) => ({
      type,
      score,
      confidence: scoreToConfidence(score),
      supportingFactors: supportingFactors[type] || [],
      cautionFactors: cautionFactors[type] || []
    }));


  const primary = ranked[0];

  const secondary = ranked
    .slice(1, 3)
    .filter(item => item.score >= 35);


  /* =======================================================
   * 14. FINAL RESULT
   * ======================================================= */

  return {
    success: true,

    analysisType: 'D4 Property Type',

    fourthHouse: {
      house: 4,
      sign: fourthSign,
      lord: fourthLord,
      lordHouse: fourthLordHouse,
      signNature: fourthSignNature
    },

    scores: normalizedScores,

    ranked,

    primaryType: primary?.type || null,
    primaryScore: primary?.score || 0,
    primaryConfidence: primary?.confidence || 'low',

    secondaryTypes: secondary,

    summary: buildPropertyTypeSummary(
      primary,
      secondary
    ),

    supportingFactors:
      primary
        ? supportingFactors[primary.type] || []
        : [],

    cautionFactors:
      primary
        ? cautionFactors[primary.type] || []
        : []
  };
}


/* =========================================================
 * SUMMARY
 * ========================================================= */

function buildPropertyTypeSummary(primary, secondary = []) {

  if (!primary) {
    return 'Property type could not be determined.';
  }

  const labels = {
    residential: 'Residential property',
    commercial: 'Commercial property',
    land: 'Land',
    plot: 'Plot',
    apartment: 'Apartment',
    independentHouse: 'Independent house'
  };

  const primaryLabel =
    labels[primary.type] || primary.type;

  if (!secondary.length) {
    return `${primaryLabel} has the strongest indication in D4.`;
  }

  const secondaryText =
    secondary
      .map(item => labels[item.type] || item.type)
      .join(' + ');

  return `${primaryLabel} has the strongest indication, with ${secondaryText} also supported.`;
}


/* =========================================================
 * SIMPLE PROPERTY CLASSIFICATION WRAPPER
 * ========================================================= */

function getPropertyClassification(d4Data) {

  const result = analyzePropertyType(d4Data);

  if (!result.success) {
    return result;
  }

  return {
    residential: result.scores.residential,
    commercial: result.scores.commercial,
    land: result.scores.land,
    plot: result.scores.plot,
    apartment: result.scores.apartment,
    independentHouse: result.scores.independentHouse,

    primary: result.primaryType,
    primaryScore: result.primaryScore,
    confidence: result.primaryConfidence,

    summary: result.summary
  };
}


/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {
  analyzePropertyType,
  getPropertyClassification
};
