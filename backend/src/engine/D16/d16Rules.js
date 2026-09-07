/**
 * ============================================================
 * D16 RULES
 * Shodashamsha / Shodasamsa
 * ============================================================
 *
 * Parashari D16 (per Brihat Parashara Hora Shastra):
 *
 * Each sign = 30°
 * Each D16 part = 30/16 = 1°52'30" (1.875°)
 * 16 equal divisions
 *
 * Part 1  = 0.000° - 1.875°
 * Part 2  = 1.875° - 3.750°
 * ...
 * Part 16 = 28.125° - 30.000°
 *
 * D16 STARTING SIGN RULE (this is what makes D16 different from D12):
 * Unlike D12 (which always starts counting from the same D1 sign),
 * D16 starts counting from a DIFFERENT sign depending on the
 * nature (chara/sthira/dwiswabhava) of the D1 sign occupied:
 *
 *   - Movable / Chara signs   (Aries, Cancer, Libra, Capricorn)
 *       => counting starts from ARIES (sign 1)
 *   - Fixed / Sthira signs    (Taurus, Leo, Scorpio, Aquarius)
 *       => counting starts from LEO (sign 5)
 *   - Dual / Dwiswabhava signs (Gemini, Virgo, Sagittarius, Pisces)
 *       => counting starts from SAGITTARIUS (sign 9)
 *
 * Main themes:
 * - Vehicles (vahana sukha)
 * - Comforts / luxuries
 * - Mental peace and happiness
 * - General sukha (well-being)
 *
 * IMPORTANT:
 * D16 alone should not be used to make absolute claims.
 * It must be read together with D1 (Rashi chart).
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
 * Starting sign (signId) for D16 counting, keyed by D1 sign nature.
 */
const START_SIGN_BY_NATURE = {
  movable: 1,   // Aries
  fixed: 5,     // Leo
  dual: 9       // Sagittarius
};

const PLANET_DATA = {
  Sun: {
    nature: 'royal',
    theme: 'vitality, confidence in comforts',
    exaltedSign: 1,
    debilitatedSign: 7,
    ownSigns: [5]
  },
  Moon: {
    nature: 'nurturing',
    theme: 'mental peace, emotional comfort',
    exaltedSign: 2,
    debilitatedSign: 8,
    ownSigns: [4]
  },
  Mars: {
    nature: 'fiery',
    theme: 'vehicles, land, energy for comfort-seeking',
    exaltedSign: 10,
    debilitatedSign: 4,
    ownSigns: [1, 8]
  },
  Mercury: {
    nature: 'intellectual',
    theme: 'small vehicles, practical comforts',
    exaltedSign: 6,
    debilitatedSign: 12,
    ownSigns: [3, 6]
  },
  Jupiter: {
    nature: 'benefic',
    theme: 'overall sukha, blessings of comfort',
    exaltedSign: 4,
    debilitatedSign: 10,
    ownSigns: [9, 12]
  },
  Venus: {
    nature: 'benefic',
    theme: 'luxury vehicles, comfort, pleasure',
    exaltedSign: 12,
    debilitatedSign: 6,
    ownSigns: [2, 7]
  },
  Saturn: {
    nature: 'restrictive',
    theme: 'delays or discipline around comforts/vehicles',
    exaltedSign: 7,
    debilitatedSign: 1,
    ownSigns: [10, 11]
  },
  Rahu: {
    nature: 'shadow',
    theme: 'unusual or foreign comforts, sudden vehicle gains/losses',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  },
  Ketu: {
    nature: 'separative',
    theme: 'detachment from material comforts',
    exaltedSign: null,
    debilitatedSign: null,
    ownSigns: []
  }
};

const HOUSE_THEMES_D16 = {
  1: { name: 'Self / Overall Sukha', theme: 'व्यक्ति का सामान्य सुख और comfort-orientation' },
  2: { name: 'Accumulated Comforts', theme: 'संचित सुख-साधन, family comforts' },
  3: { name: 'Effort for Comfort', theme: 'सुख पाने के प्रयास, छोटी यात्राएँ/वाहन' },
  4: { name: 'Vehicles & Home Comfort', theme: 'वाहन सुख, घर का आराम, मातृ सुख' },
  5: { name: 'Pleasure & Enjoyment', theme: 'मनोरंजन, भोग-विलास, mental satisfaction' },
  6: { name: 'Obstacles to Comfort', theme: 'सुख में बाधाएँ, वाहन/स्वास्थ्य संबंधी परेशानी' },
  7: { name: 'Shared Comforts', theme: 'साझेदारी में सुख, partner-related comforts' },
  8: { name: 'Sudden Change in Comforts', theme: 'अचानक सुख-हानि या परिवर्तन, hidden comforts' },
  9: { name: 'Fortune in Comforts', theme: 'भाग्य से मिलने वाला सुख, long-distance vehicles/travel' },
  10: { name: 'Status through Comfort', theme: 'सुख-साधनों से सामाजिक प्रतिष्ठा' },
  11: { name: 'Gains of Comfort', theme: 'वाहन/सुख-साधनों की प्राप्ति, gains' },
  12: { name: 'Loss / Release of Comfort', theme: 'सुख-साधनों का व्यय, विदेश यात्रा वाहन' }
};

const PART_SIZE = 30 / 16; // 1.875

module.exports = {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D16,
  START_SIGN_BY_NATURE,
  PART_SIZE
};
