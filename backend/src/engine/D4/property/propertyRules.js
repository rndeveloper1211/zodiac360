
/**
 * D4 Property Rules
 *
 * Purpose:
 * - Property / Land / House related basic rules
 * - House significations
 * - Property source rules
 * - Property type rules
 * - Property location rules
 * - Scoring weights
 *
 * NOTE:
 * Ye file prediction calculate nahi karti.
 * Ye sirf rules/constants provide karti hai.
 */

/* =========================================================
 * 1. PROPERTY RELATED HOUSES
 * ========================================================= */

const PROPERTY_HOUSES = {
  FAMILY_WEALTH: 2,
  PROPERTY_HOME: 4,
  INHERITANCE: 8,
  FORTUNE: 9,
  CAREER: 10,
  GAINS: 11,
  FOREIGN_EXPENDITURE: 12
};


/* =========================================================
 * 2. HOUSE SIGNIFICATIONS
 * ========================================================= */

const PROPERTY_HOUSE_SIGNIFICATIONS = {

  2: [
    'family wealth',
    'family assets',
    'family support',
    'accumulated wealth',
    'family property'
  ],

  4: [
    'house',
    'home',
    'land',
    'plot',
    'property',
    'real estate',
    'residence',
    'comforts',
    'vehicles',
    'mother'
  ],

  8: [
    'inheritance',
    'ancestral property',
    'joint assets',
    'family legacy',
    'sudden property gain'
  ],

  9: [
    'fortune',
    'father',
    'dharma',
    'long distance',
    'distant places',
    'fortune through family'
  ],

  10: [
    'career',
    'profession',
    'self effort',
    'status',
    'professional assets',
    'business property'
  ],

  11: [
    'gains',
    'income',
    'fulfilment',
    'network',
    'financial gains',
    'property gains'
  ],

  12: [
    'foreign place',
    'distant place',
    'expenditure',
    'relocation',
    'settlement away from native place'
  ]
};


/* =========================================================
 * 3. PROPERTY SOURCE TYPES
 * ========================================================= */

const PROPERTY_SOURCE_TYPES = {
  SELF_ACQUIRED: 'selfAcquired',
  FAMILY_SUPPORT: 'familySupport',
  MOTHER: 'mother',
  FATHER: 'father',
  ANCESTRAL: 'ancestral',
  INHERITANCE: 'inheritance',
  INVESTMENT: 'investmentGains',
  LOAN: 'loan'
};


/* =========================================================
 * 4. PROPERTY TYPES
 * ========================================================= */

const PROPERTY_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  LAND: 'land',
  PLOT: 'plot',
  APARTMENT: 'apartment',
  INDEPENDENT_HOUSE: 'independentHouse'
};


/* =========================================================
 * 5. PROPERTY LOCATION TYPES
 * ========================================================= */

const PROPERTY_LOCATIONS = {
  NATIVE: 'native',
  NEARBY: 'nearby',
  OTHER_CITY: 'otherCity',
  DISTANT: 'distant',
  FOREIGN: 'foreign'
};


/* =========================================================
 * 6. SIGN NATURE
 *
 * Used mainly for property location.
 *
 * Movable:
 * Aries, Cancer, Libra, Capricorn
 *
 * Fixed:
 * Taurus, Leo, Scorpio, Aquarius
 *
 * Dual:
 * Gemini, Virgo, Sagittarius, Pisces
 * ========================================================= */

const MOVABLE_SIGNS = [1, 4, 7, 10];

const FIXED_SIGNS = [2, 5, 8, 11];

const DUAL_SIGNS = [3, 6, 9, 12];


/* =========================================================
 * 7. PROPERTY SIGNIFICATOR PLANETS
 * ========================================================= */

const PROPERTY_KARAKAS = {
  PROPERTY: ['Mars', 'Venus'],
  LAND: ['Mars'],
  HOUSE: ['Venus', 'Moon'],
  COMFORT: ['Venus', 'Moon'],
  VEHICLE: ['Venus', 'Moon'],
  INHERITANCE: ['Saturn', 'Jupiter'],
  FAMILY_WEALTH: ['Jupiter'],
  MOTHER: ['Moon'],
  FATHER: ['Sun', 'Jupiter'],
  CAREER: ['Sun', 'Saturn', 'Mercury']
};


/* =========================================================
 * 8. PROPERTY TYPE WEIGHTS
 *
 * Ye final score nahi hain.
 * Analysis modules in weights ko use karenge.
 * ========================================================= */

const PROPERTY_TYPE_WEIGHTS = {

  residential: {
    fourthHouse: 30,
    fourthLord: 30,
    venus: 15,
    moon: 15,
    secondHouse: 5,
    eleventhHouse: 5
  },

  commercial: {
    fourthHouse: 15,
    fourthLord: 20,
    tenthHouse: 25,
    tenthLord: 15,
    eleventhHouse: 15,
    mercury: 5,
    saturn: 5
  },

  land: {
    fourthHouse: 30,
    fourthLord: 25,
    mars: 25,
    secondHouse: 5,
    eleventhHouse: 5,
    saturn: 10
  },

  plot: {
    fourthHouse: 25,
    fourthLord: 30,
    mars: 20,
    saturn: 15,
    eleventhHouse: 10
  },

  apartment: {
    fourthHouse: 25,
    fourthLord: 25,
    venus: 20,
    moon: 15,
    saturn: 10,
    eleventhHouse: 5
  },

  independentHouse: {
    fourthHouse: 30,
    fourthLord: 30,
    mars: 15,
    moon: 10,
    venus: 10,
    secondHouse: 5
  }
};


/* =========================================================
 * 9. PROPERTY SOURCE WEIGHTS
 * ========================================================= */

const PROPERTY_SOURCE_WEIGHTS = {

  selfAcquired: {
    fourthLordIn10: 30,
    fourthLordIn11: 25,
    tenthHouseConnection: 20,
    eleventhHouseConnection: 15,
    marsConnection: 5,
    saturnConnection: 5
  },

  familySupport: {
    secondHouse: 30,
    secondLordConnection: 25,
    fourthHouseConnection: 20,
    eleventhHouseConnection: 15,
    jupiterConnection: 10
  },

  mother: {
    fourthHouse: 30,
    fourthLord: 30,
    moon: 30,
    fourthMoonConnection: 10
  },

  father: {
    ninthHouse: 30,
    ninthLord: 30,
    sun: 25,
    jupiter: 15
  },

  ancestral: {
    eighthHouse: 35,
    eighthLord: 30,
    secondHouseConnection: 15,
    fourthHouseConnection: 10,
    saturn: 10
  },

  inheritance: {
    eighthHouse: 40,
    eighthLord: 35,
    secondHouseConnection: 10,
    eleventhHouseConnection: 10,
    jupiter: 5
  },

  investmentGains: {
    fifthHouse: 15,
    eighthHouse: 15,
    eleventhHouse: 35,
    fourthHouseConnection: 15,
    tenthHouseConnection: 10,
    venus: 10
  },

  loan: {
    sixthHouse: 35,
    sixthLord: 25,
    fourthHouseConnection: 20,
    eighthHouseConnection: 10,
    twelfthHouseConnection: 10
  }
};


/* =========================================================
 * 10. PROPERTY LOCATION WEIGHTS
 * ========================================================= */

const PROPERTY_LOCATION_WEIGHTS = {

  native: {
    fixedFourthSign: 25,
    fourthHouseOccupied: 20,
    fourthLordIn1: 15,
    fourthLordIn2: 10,
    fourthLordIn4: 20,
    fourthLordIn11: 10
  },

  nearby: {
    movableFourthSign: 20,
    dualFourthSign: 15,
    thirdHouseConnection: 30,
    fourthLordIn3: 25,
    fourthLordIn11: 10
  },

  otherCity: {
    movableFourthSign: 20,
    dualFourthSign: 15,
    ninthHouseConnection: 20,
    fourthLordIn9: 20,
    fourthLordIn10: 15,
    fourthLordIn11: 10
  },

  distant: {
    ninthHouseConnection: 30,
    ninthLordConnection: 25,
    twelfthHouseConnection: 20,
    fourthLordIn9: 15,
    fourthLordIn12: 10
  },

  foreign: {
    twelfthHouseConnection: 35,
    rahuConnection: 25,
    fourthLordIn12: 20,
    ninthTwelfthConnection: 10,
    ketuConnection: 10
  }
};


/* =========================================================
 * 11. PROPERTY PROBLEM / RISK FACTORS
 * ========================================================= */

const PROPERTY_RISK_FACTORS = {

  dispute: [
    'Mars',
    'Rahu',
    'Ketu',
    'Saturn'
  ],

  delay: [
    'Saturn',
    'Rahu',
    'Ketu'
  ],

  legalIssue: [
    'Rahu',
    'Saturn',
    'Mars'
  ],

  loss: [
    'Rahu',
    'Ketu',
    'Saturn'
  ],

  loan: [
    '6th house',
    '6th lord',
    '8th house',
    '12th house'
  ]
};


/* =========================================================
 * 12. PROPERTY POSITIVE PLANETS
 * ========================================================= */

const PROPERTY_BENEFICS = [
  'Jupiter',
  'Venus',
  'Mercury',
  'Moon'
];


/* =========================================================
 * 13. PROPERTY CHALLENGE PLANETS
 * ========================================================= */

const PROPERTY_MALEFICS = [
  'Sun',
  'Mars',
  'Saturn',
  'Rahu',
  'Ketu'
];


/* =========================================================
 * 14. PROPERTY YOGA CONNECTIONS
 *
 * Basic connection definitions.
 * Actual scoring analysis module mein hoga.
 * ========================================================= */

const PROPERTY_YOGA_CONNECTIONS = {

  PROPERTY_GAIN: [
    [4, 11],
    [4, 2],
    [4, 10]
  ],

  SELF_ACQUIRED_PROPERTY: [
    [4, 10],
    [4, 11],
    [4, 2]
  ],

  INHERITANCE_PROPERTY: [
    [4, 8],
    [8, 11],
    [2, 8]
  ],

  FAMILY_PROPERTY: [
    [2, 4],
    [2, 8],
    [2, 11]
  ],

  COMMERCIAL_PROPERTY: [
    [4, 10],
    [4, 11],
    [10, 11]
  ],

  FOREIGN_PROPERTY: [
    [4, 12],
    [9, 12],
    [4, 9]
  ]
};


/* =========================================================
 * 15. CONFIDENCE THRESHOLDS
 * ========================================================= */

const PROPERTY_CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 80,
  HIGH: 65,
  MEDIUM: 45,
  LOW: 25
};


/* =========================================================
 * 16. SCORE LIMITS
 * ========================================================= */

const PROPERTY_SCORE = {
  MIN: 0,
  MAX: 100
};


/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {

  PROPERTY_HOUSES,
  PROPERTY_HOUSE_SIGNIFICATIONS,

  PROPERTY_SOURCE_TYPES,
  PROPERTY_TYPES,
  PROPERTY_LOCATIONS,

  MOVABLE_SIGNS,
  FIXED_SIGNS,
  DUAL_SIGNS,

  PROPERTY_KARAKAS,

  PROPERTY_TYPE_WEIGHTS,
  PROPERTY_SOURCE_WEIGHTS,
  PROPERTY_LOCATION_WEIGHTS,

  PROPERTY_RISK_FACTORS,

  PROPERTY_BENEFICS,
  PROPERTY_MALEFICS,

  PROPERTY_YOGA_CONNECTIONS,

  PROPERTY_CONFIDENCE_THRESHOLDS,
  PROPERTY_SCORE
};
