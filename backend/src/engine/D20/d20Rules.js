/**
 * ============================================================
 * D20 RULES
 * Vimshamsha / Vimsamsa
 * ============================================================
 *
 * Parashari D20 (per Brihat Parashara Hora Shastra):
 *
 * Each sign = 30°
 * Each D20 part = 30/20 = 1°30' (1.5°)
 * 20 equal divisions
 *
 * Part 1  = 0.000° - 1.500°
 * Part 2  = 1.500° - 3.000°
 * ...
 * Part 20 = 28.500° - 30.000°
 *
 * D20 STARTING SIGN RULE (this is what makes D20 different from D16):
 * Like D16, D20 starts counting from a DIFFERENT sign depending on
 * the nature (chara/sthira/dwiswabhava) of the D1 sign occupied —
 * but the fixed/dual assignment is SWAPPED compared to D16:
 *
 *   - Movable / Chara signs   (Aries, Cancer, Libra, Capricorn)
 *       => counting starts from ARIES (sign 1)
 *   - Fixed / Sthira signs    (Taurus, Leo, Scorpio, Aquarius)
 *       => counting starts from SAGITTARIUS (sign 9)
 *   - Dual / Dwiswabhava signs (Gemini, Virgo, Sagittarius, Pisces)
 *       => counting starts from LEO (sign 5)
 *
 * Main themes:
 * - Spiritual life and sadhana (upasana)
 * - Dharma, worship style, ishta devata
 * - Guru / diksha (initiation)
 * - Purva punya (merit from past life) and moksha-oriented growth
 *
 * IMPORTANT:
 * D20 alone should not be used to make absolute claims.
 * It must be read together with D1 (Rashi chart), especially the
 * 5th and 9th houses (dharma trikona).
 */

const SIGN_DATA = {
  1: { name: 'Aries', hindi: 'मेष', lord: 'Mars', nature: 'movable' },
  2: { name: 'Taurus', hindi: 'वृषभ', lord: 'Venus', nature: 'fixed' },
  3: { name: 'Gemini', hindi: 'मिथुन', lord: 'Mercury', nature: 'dual' },
  4: { name: 'Cancer', hindi: 'कर्क', lord: 'Moon', nature: 'movable' },
  5: { name: 'Leo', hindi: 'सिंह', lord: 'Sun', nature: 'fixed' },
  6: { name: 'Virgo', hindi: 'कन्या', lord: 'Mercury', nature: 'dual' },
  7: { name: 'Libra', hindi: 'तुला', lord: 'Venus', nature: 'movable' },
  8: { name: 'Scorpio', hindi: 'वृश्चिक', lord: 'Mars', nature: 'fixed' },
  9: { name: 'Sagittarius', hindi: 'धनु', lord: 'Jupiter', nature: 'dual' },
  10: { name: 'Capricorn', hindi: 'मकर', lord: 'Saturn', nature: 'movable' },
  11: { name: 'Aquarius', hindi: 'कुंभ', lord: 'Saturn', nature: 'fixed' },
  12: { name: 'Pisces', hindi: 'मीन', lord: 'Jupiter', nature: 'dual' }
};

/**
 * Starting sign (signId) for D20 counting, keyed by D1 sign nature.
 * NOTE: fixed/dual assignment is swapped relative to D16.
 */
const START_SIGN_BY_NATURE = {
  movable: 1,   // Aries
  fixed: 9,     // Sagittarius
  dual: 5       // Leo
};

const PLANET_DATA = {
  Sun: {
    nature: 'royal',
    theme: 'confidence in dharma, connection to authority/guru figures',
    exaltedSign: 1,
    debilitatedSign: 7,
    ownSigns: [5]
  },
  Moon: {
    nature: 'nurturing',
    theme: 'devotional/emotional bhakti, intuitive worship',
    exaltedSign: 2,
    debilitatedSign: 8,
    ownSigns: [4]
  },
  Mars: {
    nature: 'fiery',
    theme: 'disciplined or tantric sadhana, energetic devotion',
    exaltedSign: 10,
    debilitatedSign: 4,
    ownSigns: [1, 8]
  },
  Mercury: {
    nature: 'intellectual',
    theme: 'scriptural study, mantra, gyan marg',
    exaltedSign: 6,
    debilitatedSign: 12,
    ownSigns: [3, 6]
  },
  Jupiter: {
    nature: 'benefic',
    theme: 'guru tattva, dharma, higher wisdom, blessings in sadhana',
    exaltedSign: 4,
    debilitatedSign: 10,
    ownSigns: [9, 12]
  },
  Venus: {
    nature: 'benefic',
    theme: 'bhakti marg, ritualistic/aesthetic worship, temple arts',
    exaltedSign: 12,
    debilitatedSign: 6,
    ownSigns: [2, 7]
  },
  Saturn: {
    nature: 'restrictive',
    theme: 'disciplined, austere, delayed but deep spiritual practice',
    exaltedSign: 7,
    debilitatedSign: 1,
    ownSigns: [10, 11]
  },
  Rahu: {
    nature: 'shadow',
    theme: 'unconventional worship, foreign or unorthodox spiritual paths',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  },
  Ketu: {
    nature: 'separative',
    theme: 'moksha orientation, detachment, past-life spiritual sanskaras',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  }
};

const HOUSE_THEMES_D20 = {
  1: { name: 'Self / Overall Spiritual Bent', theme: 'व्यक्ति की सामान्य अध्यात्मिक प्रवृत्ति' },
  2: { name: 'Accumulated Spiritual Values', theme: 'पारिवारिक/सांस्कृतिक धार्मिक संस्कार, वाणी में भक्ति' },
  3: { name: 'Effort in Sadhana', theme: 'साधना के प्रयास, छोटी तीर्थ यात्राएँ' },
  4: { name: 'Inner Peace through Devotion', theme: 'भक्ति से मिलने वाली मानसिक शांति, घर में पूजा-पाठ' },
  5: { name: 'Sadhana & Purva Punya', theme: 'साधना, मंत्र-सिद्धि, पूर्व जन्म का पुण्य' },
  6: { name: 'Obstacles in Spiritual Path', theme: 'साधना में बाधाएँ, संदेह' },
  7: { name: 'Shared Worship', theme: 'साझा उपासना, guru-shishya या sangha से संबंध' },
  8: { name: 'Occult & Transformation', theme: 'गुप्त विद्या, तंत्र, गहन आध्यात्मिक परिवर्तन' },
  9: { name: 'Dharma & Guru', theme: 'धर्म, गुरु, दीक्षा, तीर्थ यात्रा, इष्ट देवता' },
  10: { name: 'Public Spiritual Standing', theme: 'धर्म-कर्म से सामाजिक प्रतिष्ठा, प्रवचन/उपदेश' },
  11: { name: 'Gains through Dharma', theme: 'धार्मिक कार्यों से लाभ, सत्संग से प्राप्ति' },
  12: { name: 'Moksha', theme: 'मोक्ष, वैराग्य, आश्रम/तीर्थ में वास' }
};

const PART_SIZE = 30 / 20; // 1.5

module.exports = {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D20,
  START_SIGN_BY_NATURE,
  PART_SIZE
};
