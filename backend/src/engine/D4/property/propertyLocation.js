/**
 * D4 Property Location Analysis
 *
 * Determines the likely location of property / land / house:
 *
 * - Native place
 * - Nearby
 * - Other city
 * - Distant place
 * - Foreign
 *
 * IMPORTANT:
 * This module analyzes PROPERTY LOCATION only.
 *
 * Relocation and permanent settlement are handled separately.
 */

const {
  PROPERTY_LOCATIONS,
  MOVABLE_SIGNS,
  FIXED_SIGNS,
  DUAL_SIGNS
} = require('./propertyRules');

const {
  getSignLord,
  getPlanet,
  getHouseOccupants,
  getSignNature,
  scoreToConfidence
} = require('../utils/d4Helpers');


/* =========================================================
 * HELPERS
 * ========================================================= */

/**
 * Get sign of a house from D4 Lagna.
 */
function getHouseSign(lagnaSign, house) {

  const lagna = Number(lagnaSign);

  if (!lagna || lagna < 1 || lagna > 12) {
    return null;
  }

  return ((lagna + house - 2) % 12) + 1;
}


/**
 * Get lord of a house.
 */
function getHouseLord(lagnaSign, house) {

  const sign = getHouseSign(lagnaSign, house);

  if (!sign) return null;

  return getSignLord(sign);
}


/**
 * Get house occupied by planet.
 */
function getPlanetHouse(
  planetCalculations,
  planetName
) {

  if (!planetName) return null;

  const planet =
    getPlanet(
      planetCalculations,
      planetName
    );

  if (!planet) return null;

  const house = Number(planet.house);

  return Number.isFinite(house)
    ? house
    : null;
}


/**
 * Add score.
 */
function addScore(
  scores,
  factors,
  location,
  amount,
  factor
) {

  if (!scores[location]) {
    scores[location] = 0;
  }

  scores[location] += amount;

  if (
    factors[location] &&
    factor &&
    !factors[location].includes(factor)
  ) {
    factors[location].push(factor);
  }
}


/**
 * Cap score between 0 and 100.
 */
function capScores(scores) {

  Object.keys(scores).forEach(location => {

    scores[location] = Math.min(
      100,
      Math.max(
        0,
        Math.round(scores[location])
      )
    );

  });

  return scores;
}


/**
 * Check whether a house contains any of given planets.
 */
function hasAnyPlanet(
  houseOccupancy,
  house,
  planets
) {

  const occupants =
    getHouseOccupants(
      houseOccupancy,
      house
    );

  return occupants.some(
    planet => planets.includes(planet)
  );
}


/* =========================================================
 * MAIN ANALYSIS
 * ========================================================= */

function analyzePropertyLocation(d4Data) {

  const {
    d4LagnaSign,
    lagnaSign,
    houseOccupancy = {},
    planetCalculations = {}
  } = d4Data || {};


  /* -------------------------------------------------------
   * D4 LAGNA
   * ------------------------------------------------------- */

  const effectiveLagna =
    d4LagnaSign ||
    lagnaSign ||
    d4Data?.lagna?.sign ||
    d4Data?.d4Lagna?.sign;


  if (!effectiveLagna) {

    return {
      success: false,
      error:
        'D4 Lagna sign is required for property location analysis'
    };
  }


  /* -------------------------------------------------------
   * HOUSE SIGNS
   * ------------------------------------------------------- */

  const fourthSign =
    getHouseSign(
      effectiveLagna,
      4
    );

  const thirdSign =
    getHouseSign(
      effectiveLagna,
      3
    );

  const ninthSign =
    getHouseSign(
      effectiveLagna,
      9
    );

  const twelfthSign =
    getHouseSign(
      effectiveLagna,
      12
    );


  /* -------------------------------------------------------
   * HOUSE LORDS
   * ------------------------------------------------------- */

  const fourthLord =
    getHouseLord(
      effectiveLagna,
      4
    );

  const ninthLord =
    getHouseLord(
      effectiveLagna,
      9
    );

  const twelfthLord =
    getHouseLord(
      effectiveLagna,
      12
    );


  /* -------------------------------------------------------
   * LORD HOUSES
   * ------------------------------------------------------- */

  const fourthLordHouse =
    getPlanetHouse(
      planetCalculations,
      fourthLord
    );

  const ninthLordHouse =
    getPlanetHouse(
      planetCalculations,
      ninthLord
    );

  const twelfthLordHouse =
    getPlanetHouse(
      planetCalculations,
      twelfthLord
    );


  /* -------------------------------------------------------
   * PLANET HOUSES
   * ------------------------------------------------------- */

  const rahuHouse =
    getPlanetHouse(
      planetCalculations,
      'Rahu'
    );

  const ketuHouse =
    getPlanetHouse(
      planetCalculations,
      'Ketu'
    );

  const venusHouse =
    getPlanetHouse(
      planetCalculations,
      'Venus'
    );

  const moonHouse =
    getPlanetHouse(
      planetCalculations,
      'Moon'
    );

  const marsHouse =
    getPlanetHouse(
      planetCalculations,
      'Mars'
    );


  /* -------------------------------------------------------
   * HOUSE OCCUPANTS
   * ------------------------------------------------------- */

  const fourthOccupants =
    getHouseOccupants(
      houseOccupancy,
      4
    );

  const thirdOccupants =
    getHouseOccupants(
      houseOccupancy,
      3
    );

  const ninthOccupants =
    getHouseOccupants(
      houseOccupancy,
      9
    );

  const twelfthOccupants =
    getHouseOccupants(
      houseOccupancy,
      12
    );


  /* =======================================================
   * INITIAL SCORES
   * ======================================================= */

  const scores = {

    native: 0,

    nearby: 0,

    otherCity: 0,

    distant: 0,

    foreign: 0
  };


  const supportingFactors = {

    native: [],

    nearby: [],

    otherCity: [],

    distant: [],

    foreign: []
  };


  const cautionFactors = {

    native: [],

    nearby: [],

    otherCity: [],

    distant: [],

    foreign: []
  };


  /* =======================================================
   * 1. 4TH HOUSE SIGN NATURE
   *
   * Fixed   → stability/native
   * Movable → movement/other place
   * Dual    → mixed/flexible
   * ======================================================= */

  const fourthSignNature =
    getSignNature(
      fourthSign
    );


  if (
    fourthSignNature === 'fixed'
  ) {

    addScore(
      scores,
      supportingFactors,
      'native',
      20,
      'Fixed sign in 4th house supports stable/native-place property'
    );

    addScore(
      scores,
      supportingFactors,
      'nearby',
      5,
      'Fixed 4th sign gives some nearby stability'
    );
  }


  if (
    fourthSignNature === 'movable'
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      20,
      'Movable sign in 4th house supports property away from native place'
    );

    addScore(
      scores,
      supportingFactors,
      'nearby',
      10,
      'Movable 4th sign can indicate movement within nearby region'
    );
  }


  if (
    fourthSignNature === 'dual'
  ) {

    addScore(
      scores,
      supportingFactors,
      'nearby',
      10,
      'Dual 4th sign supports flexible/nearby location'
    );

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      15,
      'Dual 4th sign can support property in another city'
    );
  }


  /* =======================================================
   * 2. PLANETS IN 4TH HOUSE
   *
   * Property is directly tied to the 4th house.
   * ======================================================= */

  if (fourthOccupants.length) {

    addScore(
      scores,
      supportingFactors,
      'native',
      10,
      'Planets occupying 4th house create direct residence/property connection'
    );

  }


  /* =======================================================
   * 3. 3RD HOUSE
   *
   * 3rd = short distance / nearby movement
   * ======================================================= */

  if (thirdOccupants.length) {

    addScore(
      scores,
      supportingFactors,
      'nearby',
      25,
      '3rd house activation supports nearby/short-distance property'
    );

  }


  if (
    fourthLordHouse === 3
  ) {

    addScore(
      scores,
      supportingFactors,
      'nearby',
      30,
      '4th lord in 3rd house strongly connects property with nearby movement'
    );

  }


  /* =======================================================
   * 4. 4TH LORD
   *
   * Most important factor after 4th house.
   * ======================================================= */

  if (
    [1, 2, 4].includes(
      fourthLordHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'native',
      25,
      `4th lord ${fourthLord} in ${fourthLordHouse}th house supports native/stable property`
    );

  }


  if (
    fourthLordHouse === 3
  ) {

    addScore(
      scores,
      supportingFactors,
      'nearby',
      20,
      '4th lord in 3rd supports nearby property'
    );

  }


  if (
    [6, 9, 10, 11].includes(
      fourthLordHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      20,
      `4th lord ${fourthLord} in ${fourthLordHouse}th house supports property away from birthplace`
    );

  }


  if (
    fourthLordHouse === 8
  ) {

    addScore(
      scores,
      supportingFactors,
      'native',
      8,
      '4th lord in 8th can connect property with family/ancestral area'
    );

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      12,
      '4th lord in 8th can create mixed property-location circumstances'
    );

  }


  if (
    fourthLordHouse === 12
  ) {

    addScore(
      scores,
      supportingFactors,
      'foreign',
      30,
      '4th lord in 12th strongly supports property away from birthplace/foreign connection'
    );

    addScore(
      scores,
      supportingFactors,
      'distant',
      15,
      '4th lord in 12th supports distant residence/property'
    );

  }


  /* =======================================================
   * 5. 9TH HOUSE
   *
   * Long-distance / distant places.
   * ======================================================= */

  if (ninthOccupants.length) {

    addScore(
      scores,
      supportingFactors,
      'distant',
      25,
      '9th house active — long-distance property connection'
    );

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      15,
      '9th house active — property away from native place'
    );

  }


  if (
    [6, 9, 10, 11, 12].includes(
      ninthLordHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'distant',
      15,
      `9th lord ${ninthLord} supports distant-location themes`
    );

  }


  /* =======================================================
   * 6. 12TH HOUSE
   *
   * Strongest house for foreign/distant relocation themes.
   * ======================================================= */

  if (twelfthOccupants.length) {

    addScore(
      scores,
      supportingFactors,
      'foreign',
      30,
      '12th house active — foreign/distant property connection'
    );

    addScore(
      scores,
      supportingFactors,
      'distant',
      15,
      '12th house active — distant residence/property'
    );

  }


  if (
    [9, 12].includes(
      twelfthLordHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'foreign',
      20,
      `12th lord ${twelfthLord} connected with distant/foreign houses`
    );

  }


  /* =======================================================
   * 7. RAHU
   *
   * Rahu can indicate unconventional/distant/foreign places.
   * ======================================================= */

  if (
    [4, 7, 9, 12].includes(
      rahuHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      15,
      `Rahu in ${rahuHouse}th house supports non-native property circumstances`
    );

  }


  if (
    [9, 12].includes(
      rahuHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'foreign',
      25,
      `Rahu in ${rahuHouse}th house supports foreign/distant connection`
    );

  }


  /* =======================================================
   * 8. KETU
   * ======================================================= */

  if (
    [4, 9, 12].includes(
      ketuHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      10,
      `Ketu in ${ketuHouse}th house can create detachment from native-place residence`
    );

  }


  if (
    [9, 12].includes(
      ketuHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'foreign',
      15,
      `Ketu in ${ketuHouse}th house supports distant/foreign themes`
    );

  }


  /* =======================================================
   * 9. VENUS
   *
   * Venus = property comforts / residence.
   * ======================================================= */

  if (
    [4, 7, 9, 10, 11, 12].includes(
      venusHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      5,
      `Venus in ${venusHouse}th house connects property with broader opportunities`
    );

  }


  /* =======================================================
   * 10. MOON
   *
   * Moon is important for residence/home.
   * ======================================================= */

  if (
    moonHouse === 4
  ) {

    addScore(
      scores,
      supportingFactors,
      'native',
      12,
      'Moon in 4th strongly supports home/residence connection'
    );

  }


  if (
    [9, 12].includes(
      moonHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'distant',
      12,
      `Moon in ${moonHouse}th house connects residence with distant places`
    );

  }


  /* =======================================================
   * 11. MARS
   *
   * Land/property activity.
   * Location effect is secondary.
   * ======================================================= */

  if (
    [4, 10, 11].includes(
      marsHouse
    )
  ) {

    addScore(
      scores,
      supportingFactors,
      'otherCity',
      5,
      `Mars in ${marsHouse}th house supports active property acquisition`
    );

  }


  /* =======================================================
   * 12. CAUTION FACTORS
   * ======================================================= */

  if (
    fourthLordHouse === 12
  ) {

    cautionFactors.native.push(
      '4th lord in 12th reduces the strength of native-place property indication'
    );

  }


  if (
    rahuHouse === 12
  ) {

    cautionFactors.native.push(
      'Rahu in 12th can reduce attachment to native-place residence'
    );

  }


  if (
    ketuHouse === 4
  ) {

    cautionFactors.native.push(
      'Ketu in 4th can create detachment or instability in native residence'
    );

  }


  /* =======================================================
   * 13. CAP SCORES
   * ======================================================= */

  capScores(scores);


  /* =======================================================
   * 14. RANK LOCATIONS
   * ======================================================= */

  const ranked =
    Object.entries(scores)
      .sort(
        (a, b) => b[1] - a[1]
      )
      .map(
        ([location, score]) => ({
          location,
          score,
          confidence:
            scoreToConfidence(score),

          supportingFactors:
            supportingFactors[location] || [],

          cautionFactors:
            cautionFactors[location] || []
        })
      );


  const primary =
    ranked[0] || null;


  const secondary =
    ranked
      .slice(1, 3)
      .filter(
        item => item.score >= 30
      );


  /* =======================================================
   * 15. STRONGEST LOCATION
   * ======================================================= */

  let strongestLocation =
    primary?.location || null;


  /* =======================================================
   * 16. SUMMARY
   * ======================================================= */

  const summary =
    buildLocationSummary(
      primary,
      secondary
    );


  /* =======================================================
   * 17. FINAL RESULT
   * ======================================================= */

  return {

    success: true,

    analysisType:
      'D4 Property Location',

    fourthHouse: {

      sign:
        fourthSign,

      lord:
        fourthLord,

      lordHouse:
        fourthLordHouse,

      signNature:
        fourthSignNature
    },

    ninthHouse: {

      sign:
        ninthSign,

      lord:
        ninthLord,

      lordHouse:
        ninthLordHouse
    },

    twelfthHouse: {

      sign:
        twelfthSign,

      lord:
        twelfthLord,

      lordHouse:
        twelfthLordHouse
    },

    scores,

    ranked,

    strongestLocation,

    strongestScore:
      primary?.score || 0,

    confidence:
      primary?.confidence || 'low',

    secondaryLocations:
      secondary,

    supportingFactors:
      primary
        ? supportingFactors[
            primary.location
          ] || []
        : [],

    cautionFactors:
      primary
        ? cautionFactors[
            primary.location
          ] || []
        : [],

    summary
  };
}


/* =========================================================
 * SUMMARY BUILDER
 * ========================================================= */

function buildLocationSummary(
  primary,
  secondary = []
) {

  if (!primary) {

    return 'Property location could not be determined.';
  }


  const labels = {

    native:
      'native place',

    nearby:
      'nearby area',

    otherCity:
      'another city',

    distant:
      'a distant place',

    foreign:
      'foreign country'
  };


  const primaryLabel =
    labels[primary.location] ||
    primary.location;


  let summary =
    `Property in ${primaryLabel} has the strongest indication in D4.`;


  if (secondary.length) {

    const secondaryText =
      secondary
        .map(
          item =>
            labels[item.location] ||
            item.location
        )
        .join(' + ');


    summary +=
      ` Secondary possibilities include ${secondaryText}.`;
  }


  return summary;
}


/* =========================================================
 * SIMPLE LOCATION CLASSIFICATION
 * ========================================================= */

function getPropertyLocationClassification(
  d4Data
) {

  const result =
    analyzePropertyLocation(
      d4Data
    );


  if (!result.success) {
    return result;
  }


  return {

    native:
      result.scores.native,

    nearby:
      result.scores.nearby,

    otherCity:
      result.scores.otherCity,

    distant:
      result.scores.distant,

    foreign:
      result.scores.foreign,

    strongestLocation:
      result.strongestLocation,

    strongestScore:
      result.strongestScore,

    confidence:
      result.confidence,

    summary:
      result.summary
  };
}


/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {

  analyzePropertyLocation,

  getPropertyLocationClassification
};
