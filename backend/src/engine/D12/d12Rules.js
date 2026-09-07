/**
 * ============================================================
 * D12 RULES
 * Dwadashamsha / Dwadashamsa
 * ============================================================
 *
 * Parashari D12:
 *
 * Each sign = 30°
 * Each D12 part = 2°30'
 * 12 equal divisions
 *
 * Part 1  = 0°00' - 2°30'
 * Part 2  = 2°30' - 5°00'
 * ...
 * Part 12 = 27°30' - 30°00'
 *
 * D12 sign:
 * Starting from the natal D1 sign, count forward by part index.
 *
 * Main themes:
 * - Parents
 * - Grandparents
 * - Ancestral lineage
 * - Family traditions
 * - Inherited patterns
 *
 * IMPORTANT:
 * D12 alone should not be used to make absolute claims.
 */

const SIGN_DATA = {
  1: {
    name: 'Aries',
    hindi: 'मेष',
    lord: 'Mars'
  },
  2: {
    name: 'Taurus',
    hindi: 'वृषभ',
    lord: 'Venus'
  },
  3: {
    name: 'Gemini',
    hindi: 'मिथुन',
    lord: 'Mercury'
  },
  4: {
    name: 'Cancer',
    hindi: 'कर्क',
    lord: 'Moon'
  },
  5: {
    name: 'Leo',
    hindi: 'सिंह',
    lord: 'Sun'
  },
  6: {
    name: 'Virgo',
    hindi: 'कन्या',
    lord: 'Mercury'
  },
  7: {
    name: 'Libra',
    hindi: 'तुला',
    lord: 'Venus'
  },
  8: {
    name: 'Scorpio',
    hindi: 'वृश्चिक',
    lord: 'Mars'
  },
  9: {
    name: 'Sagittarius',
    hindi: 'धनु',
    lord: 'Jupiter'
  },
  10: {
    name: 'Capricorn',
    hindi: 'मकर',
    lord: 'Saturn'
  },
  11: {
    name: 'Aquarius',
    hindi: 'कुंभ',
    lord: 'Saturn'
  },
  12: {
    name: 'Pisces',
    hindi: 'मीन',
    lord: 'Jupiter'
  }
};

const PLANET_DATA = {
  Sun: {
    nature: 'royal',
    familyTheme: 'father, authority, lineage',
    exaltedSign: 1,
    debilitatedSign: 7,
    ownSigns: [5]
  },

  Moon: {
    nature: 'nurturing',
    familyTheme: 'mother, emotional heritage, care',
    exaltedSign: 2,
    debilitatedSign: 8,
    ownSigns: [4]
  },

  Mars: {
    nature: 'fiery',
    familyTheme: 'conflict, courage, inheritance',
    exaltedSign: 10,
    debilitatedSign: 4,
    ownSigns: [1, 8]
  },

  Mercury: {
    nature: 'intellectual',
    familyTheme: 'communication, traditions, skills',
    exaltedSign: 6,
    debilitatedSign: 12,
    ownSigns: [3, 6]
  },

  Jupiter: {
    nature: 'benefic',
    familyTheme: 'blessings, wisdom, lineage',
    exaltedSign: 4,
    debilitatedSign: 10,
    ownSigns: [9, 12]
  },

  Venus: {
    nature: 'benefic',
    familyTheme: 'comfort, harmony, family values',
    exaltedSign: 12,
    debilitatedSign: 6,
    ownSigns: [2, 7]
  },

  Saturn: {
    nature: 'restrictive',
    familyTheme: 'karma, duty, burdens, inherited patterns',
    exaltedSign: 7,
    debilitatedSign: 1,
    ownSigns: [10, 11]
  },

  Rahu: {
    nature: 'shadow',
    familyTheme: 'unusual inherited patterns, disruption',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  },

  Ketu: {
    nature: 'separative',
    familyTheme: 'detachment, ancestral discontinuity',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  }
};

const HOUSE_THEMES_D12 = {
  1: {
    name: 'Self / Heritage',
    theme: 'व्यक्ति, ancestral imprint, inherited constitution'
  },

  2: {
    name: 'Family Values',
    theme: 'परिवार, कुल परंपरा, संस्कार और family values'
  },

  3: {
    name: 'Relatives / Courage',
    theme: 'छोटे रिश्तेदार, पारिवारिक प्रयास और साहस'
  },

  4: {
    name: 'Mother / Home',
    theme: 'माता, मातृ-सुख, घर और domestic heritage'
  },

  5: {
    name: 'Paternal Lineage',
    theme: 'पैतृक वंश, दादा-दादी, ancestral blessings'
  },

  6: {
    name: 'Family Challenges',
    theme: 'family conflicts, duties, debts और inherited obstacles'
  },

  7: {
    name: 'Family Influence',
    theme: 'partnerships पर family influence'
  },

  8: {
    name: 'Hidden Ancestral Matters',
    theme: 'ancestral transformation, hidden family patterns'
  },

  9: {
    name: 'Father / Paternal Heritage',
    theme: 'पिता, paternal lineage, dharma और blessings'
  },

  10: {
    name: 'Family Status',
    theme: 'family reputation, public standing और lineage'
  },

  11: {
    name: 'Family Gains',
    theme: 'family support, gains और maternal lineage related benefits'
  },

  12: {
    name: 'Maternal Lineage',
    theme: 'नाना-नानी, maternal ancestry, expenses और ancestral release'
  }
};

const PART_SIZE = 2.5;

module.exports = {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D12,
  PART_SIZE
};