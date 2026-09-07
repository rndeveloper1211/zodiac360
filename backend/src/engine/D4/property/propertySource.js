/**
 * D4 Property Source Analysis
 *
 * Determines the likely source of property acquisition:
 *
 * - Self acquired
 * - Family support
 * - Mother
 * - Father
 * - Ancestral
 * - Inheritance
 * - Investment gains
 * - Loan / debt supported
 *
 * IMPORTANT:
 * This module analyzes SOURCE only.
 * Property type and location are handled separately.
 */

const {
  PROPERTY_SOURCE_TYPES
} = require('./propertyRules');

const {
  getSignLord,
  getPlanet,
  getHouseOccupants,
  scoreToConfidence
} = require('../utils/d4Helpers');


/* =========================================================
 * HELPERS
 * ========================================================= */

/**
 * Get sign occupied by a house.
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
 * Get house of a planet.
 */
function getPlanetHouse(planetCalculations, planetName) {

  const planet = getPlanet(
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
 * Add score and factor.
 */
function addScore(
  scores,
  factors,
  type,
  amount,
  factor
) {

  if (!scores[type]) {
    scores[type] = 0;
  }

  scores[type] += amount;

  if (
    factors[type] &&
    factor &&
    !factors[type].includes(factor)
  ) {
    factors[type].push(factor);
  }
}


/**
 * Cap score at 100.
 */
function capScores(scores) {

  Object.keys(scores).forEach(type => {
    scores[type] = Math.min(
      100,
      Math.max(0, Math.round(scores[type]))
    );
  });

  return scores;
}


/* =========================================================
 * MAIN ANALYSIS
 * ========================================================= */

function analyzePropertySource(d4Data) {

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
      error: 'D4 Lagna sign is required for property source analysis'
    };
  }


  /* =======================================================
   * INITIAL SCORES
   * ======================================================= */

  const scores = {

    selfAcquired: 0,

    familySupport: 0,

    mother: 0,

    father: 0,

    ancestral: 0,

    inheritance: 0,

    investmentGains: 0,

    loan: 0
  };


  const supportingFactors = {

    selfAcquired: [],

    familySupport: [],

    mother: [],

    father: [],

    ancestral: [],

    inheritance: [],

    investmentGains: [],

    loan: []
  };


  const cautionFactors = {

    selfAcquired: [],
    familySupport: [],
    mother: [],
    father: [],
    ancestral: [],
    inheritance: [],
    investmentGains: [],
    loan: []
  };


  /* =======================================================
   * HOUSE LORDS
   * ======================================================= */

  const secondLord =
    getHouseLord(effectiveLagna, 2);

  const fourthLord =
    getHouseLord(effectiveLagna, 4);

  const sixthLord =
    getHouseLord(effectiveLagna, 6);

  const eighthLord =
    getHouseLord(effectiveLagna, 8);

  const ninthLord =
    getHouseLord(effectiveLagna, 9);

  const tenthLord =
    getHouseLord(effectiveLagna, 10);

  const eleventhLord =
    getHouseLord(effectiveLagna, 11);


  /* =======================================================
   * HOUSE OCCUPANTS
   * ======================================================= */

  const secondHouse =
    getHouseOccupants(houseOccupancy, 2);

  const fourthHouse =
    getHouseOccupants(houseOccupancy, 4);

  const sixthHouse =
    getHouseOccupants(houseOccupancy, 6);

  const eighthHouse =
    getHouseOccupants(houseOccupancy, 8);

  const ninthHouse =
    getHouseOccupants(houseOccupancy, 9);

  const tenthHouse =
    getHouseOccupants(houseOccupancy, 10);

  const eleventhHouse =
    getHouseOccupants(houseOccupancy, 11);

  const twelfthHouse =
    getHouseOccupants(houseOccupancy, 12);


  /* =======================================================
   * PLANET HOUSES
   * ======================================================= */

  const marsHouse =
    getPlanetHouse(planetCalculations, 'Mars');

  const moonHouse =
    getPlanetHouse(planetCalculations, 'Moon');

  const sunHouse =
    getPlanetHouse(planetCalculations, 'Sun');

  const jupiterHouse =
    getPlanetHouse(planetCalculations, 'Jupiter');

  const venusHouse =
    getPlanetHouse(planetCalculations, 'Venus');

  const saturnHouse =
    getPlanetHouse(planetCalculations, 'Saturn');

  const mercuryHouse =
    getPlanetHouse(planetCalculations, 'Mercury');

  const rahuHouse =
    getPlanetHouse(planetCalculations, 'Rahu');

  const ketuHouse =
    getPlanetHouse(planetCalculations, 'Ketu');


  /* =======================================================
   * LORD HOUSES
   * ======================================================= */

  const secondLordHouse =
    getPlanetHouse(
      planetCalculations,
      secondLord
    );

  const fourthLordHouse =
    getPlanetHouse(
      planetCalculations,
      fourthLord
    );

  const sixthLordHouse =
    getPlanetHouse(
      planetCalculations,
      sixthLord
    );

  const eighthLordHouse =
    getPlanetHouse(
      planetCalculations,
      eighthLord
    );

  const ninthLordHouse =
    getPlanetHouse(
      planetCalculations,
      ninthLord
    );

  const tenthLordHouse =
    getPlanetHouse(
      planetCalculations,
      tenthLord
    );

  const eleventhLordHouse =
    getPlanetHouse(
      planetCalculations,
      eleventhLord
    );


  /* =======================================================
   * 1. SELF-ACQUIRED PROPERTY
   *
   * Main houses:
   * 4th + 10th + 11th
   * ======================================================= */

  if (tenthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      15,
      '10th house active — property through career/profession'
    );
  }

  if (eleventhHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      12,
      '11th house active — property through gains'
    );
  }

  if ([2, 4, 10, 11].includes(fourthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      20,
      `4th lord ${fourthLord} placed in ${fourthLordHouse}th house`
    );
  }

  if ([10, 11].includes(tenthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      15,
      `10th lord ${tenthLord} connected with career/gains`
    );
  }

  if ([10, 11].includes(eleventhLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      10,
      `11th lord ${eleventhLord} connected with gains`
    );
  }

  if ([4, 10, 11].includes(marsHouse)) {

    addScore(
      scores,
      supportingFactors,
      'selfAcquired',
      8,
      `Mars in ${marsHouse}th house supports self-effort/property acquisition`
    );
  }


  /* =======================================================
   * 2. FAMILY SUPPORT
   *
   * 2nd + 4th + 11th
   * ======================================================= */

  if (secondHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'familySupport',
      25,
      '2nd house occupied — family wealth/assets connection'
    );
  }

  if ([2, 4, 11].includes(secondLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'familySupport',
      20,
      `2nd lord ${secondLord} connected with family/property/gains`
    );
  }

  if (fourthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'familySupport',
      15,
      '4th house active — family/home/property connection'
    );
  }

  if (eleventhHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'familySupport',
      10,
      '11th house supports fulfilment/gains'
    );
  }


  /* =======================================================
   * 3. MOTHER
   *
   * 4th house + 4th lord + Moon
   *
   * IMPORTANT:
   * Sirf 4th house occupancy se mother score nahi banega.
   * ======================================================= */

  if (fourthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'mother',
      20,
      '4th house active — mother/property connection'
    );
  }

  if ([1, 2, 4, 5, 7, 9, 10, 11].includes(fourthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'mother',
      25,
      `4th lord ${fourthLord} in supportive house ${fourthLordHouse}`
    );
  }

  if ([1, 2, 4, 5, 7, 9, 11].includes(moonHouse)) {

    addScore(
      scores,
      supportingFactors,
      'mother',
      25,
      `Moon in supportive house ${moonHouse}`
    );
  }

  if (moonHouse === 4) {

    addScore(
      scores,
      supportingFactors,
      'mother',
      15,
      'Moon directly occupying 4th house'
    );
  }


  /* =======================================================
   * 4. FATHER
   *
   * 9th house + 9th lord + Sun + Jupiter
   * ======================================================= */

  if (ninthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'father',
      20,
      '9th house active — father/fortune connection'
    );
  }

  if ([1, 2, 4, 5, 9, 10, 11].includes(ninthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'father',
      25,
      `9th lord ${ninthLord} in supportive house ${ninthLordHouse}`
    );
  }

  if ([1, 2, 4, 5, 9, 10, 11].includes(sunHouse)) {

    addScore(
      scores,
      supportingFactors,
      'father',
      20,
      `Sun in supportive house ${sunHouse}`
    );
  }

  if ([1, 2, 4, 5, 9, 10, 11].includes(jupiterHouse)) {

    addScore(
      scores,
      supportingFactors,
      'father',
      15,
      `Jupiter in supportive house ${jupiterHouse}`
    );
  }


  /* =======================================================
   * 5. ANCESTRAL PROPERTY
   *
   * Strong focus on 8th + Saturn + 2nd/4th connection
   * ======================================================= */

  if (eighthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'ancestral',
      35,
      '8th house occupied — ancestral/inherited asset connection'
    );
  }

  if ([2, 4, 8, 11].includes(eighthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'ancestral',
      30,
      `8th lord ${eighthLord} connected with asset/property houses`
    );
  }

  if ([2, 4, 8, 11].includes(saturnHouse)) {

    addScore(
      scores,
      supportingFactors,
      'ancestral',
      15,
      `Saturn in ${saturnHouse}th house supports old/family assets`
    );
  }

  if (secondHouse.length && eighthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'ancestral',
      10,
      '2nd + 8th connection — family wealth and inherited assets'
    );
  }


  /* =======================================================
   * 6. INHERITANCE
   *
   * 8th + 8th lord + 11th
   * ======================================================= */

  if (eighthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'inheritance',
      40,
      '8th house active — inheritance indication'
    );
  }

  if ([2, 4, 8, 11].includes(eighthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'inheritance',
      30,
      `8th lord ${eighthLord} connected with wealth/property/gains`
    );
  }

  if (eleventhHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'inheritance',
      10,
      '11th house can convert inheritance indication into gains'
    );
  }

  if ([2, 4, 11].includes(eighthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'inheritance',
      10,
      '8th lord connected with 2nd/4th/11th'
    );
  }


  /* =======================================================
   * 7. INVESTMENT GAINS
   *
   * 5th + 8th + 11th + 4th
   * ======================================================= */

  if (eleventhHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'investmentGains',
      30,
      '11th house active — gains'
    );
  }

  if ([5, 8, 11].includes(eleventhLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'investmentGains',
      20,
      `11th lord ${eleventhLord} connected with speculative/investment houses`
    );
  }

  if ([5, 8, 11].includes(fourthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'investmentGains',
      15,
      `4th lord ${fourthLord} connected with investment/gain houses`
    );
  }

  if ([5, 8, 11].includes(venusHouse)) {

    addScore(
      scores,
      supportingFactors,
      'investmentGains',
      10,
      `Venus in ${venusHouse}th house supports asset/investment themes`
    );
  }


  /* =======================================================
   * 8. LOAN / DEBT
   *
   * 6th + 4th + 8th + 12th
   *
   * IMPORTANT:
   * Loan indication means possibility of financing property
   * through debt. It does NOT automatically mean bad result.
   * ======================================================= */

  if (sixthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'loan',
      30,
      '6th house active — debt/loan connection'
    );
  }

  if ([4, 6, 8, 12].includes(sixthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'loan',
      25,
      `6th lord ${sixthLord} connected with property/debt houses`
    );
  }

  if ([6, 8, 12].includes(fourthLordHouse)) {

    addScore(
      scores,
      supportingFactors,
      'loan',
      15,
      `4th lord ${fourthLord} connected with financing/pressure houses`
    );
  }

  if (twelfthHouse.length) {

    addScore(
      scores,
      supportingFactors,
      'loan',
      10,
      '12th house active — expenditure/financial outflow'
    );
  }


  /* =======================================================
   * 9. CAUTION FACTORS
   * ======================================================= */

  if (rahuHouse === 4 || ketuHouse === 4) {

    cautionFactors.selfAcquired.push(
      'Node influence on 4th house may create unconventional property circumstances'
    );

    cautionFactors.familySupport.push(
      'Node influence can make family-property results less straightforward'
    );
  }

  if (saturnHouse === 4) {

    cautionFactors.selfAcquired.push(
      'Saturn in 4th can indicate delay before stable property acquisition'
    );
  }

  if (rahuHouse === 8 || ketuHouse === 8) {

    cautionFactors.inheritance.push(
      'Node influence on 8th can make inheritance irregular or uncertain'
    );
  }


  /* =======================================================
   * 10. CAP SCORES
   * ======================================================= */

  capScores(scores);


  /* =======================================================
   * 11. RANK RESULTS
   * ======================================================= */

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([source, score]) => ({
      source,
      score,
      confidence: scoreToConfidence(score),
      supportingFactors:
        supportingFactors[source] || [],
      cautionFactors:
        cautionFactors[source] || []
    }));


  const primary = ranked[0];

  const secondary = ranked
    .slice(1, 4)
    .filter(item => item.score >= 30);


  /* =======================================================
   * 12. DIRECT PARENT-PROVIDED PROPERTY
   *
   * VERY IMPORTANT:
   *
   * Family support ≠ parent directly giving property.
   *
   * Direct parent-provided property is marked strong only
   * when mother/father score is independently strong.
   * ======================================================= */

  const motherScore = scores.mother;
  const fatherScore = scores.father;

  const parentScores = [
    motherScore,
    fatherScore
  ];

  const strongestParentScore =
    Math.max(...parentScores);

  let parentProvidedProperty = false;

  let parentProvidedConfidence = 'low';

  if (strongestParentScore >= 70) {

    parentProvidedProperty = true;
    parentProvidedConfidence = 'high';

  } else if (strongestParentScore >= 55) {

    parentProvidedProperty = true;
    parentProvidedConfidence = 'medium';
  }


  /* =======================================================
   * 13. SUMMARY
   * ======================================================= */

  const summary =
    buildPropertySourceSummary(
      primary,
      secondary,
      parentProvidedProperty
    );


  /* =======================================================
   * 14. FINAL RESULT
   * ======================================================= */

  return {

    success: true,

    analysisType: 'D4 Property Source',

    scores,

    ranked,

    primarySource:
      primary?.source || null,

    primaryScore:
      primary?.score || 0,

    primaryConfidence:
      primary?.confidence || 'low',

    secondarySources:
      secondary,

    parentProvidedProperty: {
      indicated: parentProvidedProperty,
      score: strongestParentScore,
      confidence: parentProvidedConfidence,

      motherScore,
      fatherScore,

      strongestSide:
        motherScore > fatherScore
          ? 'mother'
          : fatherScore > motherScore
            ? 'father'
            : 'balanced'
    },

    supportingFactors:
      primary
        ? supportingFactors[primary.source] || []
        : [],

    cautionFactors:
      primary
        ? cautionFactors[primary.source] || []
        : [],

    summary
  };
}


/* =========================================================
 * SUMMARY BUILDER
 * ========================================================= */

function buildPropertySourceSummary(
  primary,
  secondary,
  parentProvidedProperty
) {

  if (!primary) {
    return 'Property source could not be determined.';
  }

  const labels = {

    selfAcquired: 'self-acquired property',

    familySupport: 'family-supported property',

    mother: 'mother-side property/support',

    father: 'father-side property/support',

    ancestral: 'ancestral property',

    inheritance: 'inherited property',

    investmentGains: 'investment/gains-based property',

    loan: 'loan-financed property'
  };


  const primaryLabel =
    labels[primary.source] ||
    primary.source;


  let summary =
    `${primaryLabel} has the strongest indication in D4.`;


  if (secondary.length) {

    const secondaryText =
      secondary
        .map(item => labels[item.source] || item.source)
        .join(', ');

    summary +=
      ` Other supporting possibilities are ${secondaryText}.`;
  }


  if (parentProvidedProperty) {

    summary +=
      ' Direct property support from a parent is also indicated.';
  }


  return summary;
}


/* =========================================================
 * SIMPLE SOURCE DETECTOR
 * ========================================================= */

function detectPropertySource(d4Data) {

  const result =
    analyzePropertySource(d4Data);

  if (!result.success) {
    return result;
  }

  return {

    selfAcquired:
      result.scores.selfAcquired,

    familySupport:
      result.scores.familySupport,

    mother:
      result.scores.mother,

    father:
      result.scores.father,

    ancestral:
      result.scores.ancestral,

    inheritance:
      result.scores.inheritance,

    investmentGains:
      result.scores.investmentGains,

    loan:
      result.scores.loan,

    primary:
      result.primarySource,

    confidence:
      result.primaryConfidence,

    parentProvidedProperty:
      result.parentProvidedProperty,

    summary:
      result.summary
  };
}


/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {
  analyzePropertySource,
  detectPropertySource
};
