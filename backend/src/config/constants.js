module.exports = {
  RASHIS: [
    { id: 1, name: 'Aries', hindi: 'मेष', lord: 'Mars' },
    { id: 2, name: 'Taurus', hindi: 'वृषभ', lord: 'Venus' },
    { id: 3, name: 'Gemini', hindi: 'मिथुन', lord: 'Mercury' },
    { id: 4, name: 'Cancer', hindi: 'कर्क', lord: 'Moon' },
    { id: 5, name: 'Leo', hindi: 'सिंह', lord: 'Sun' },
    { id: 6, name: 'Virgo', hindi: 'कन्या', lord: 'Mercury' },
    { id: 7, name: 'Libra', hindi: 'तुला', lord: 'Venus' },
    { id: 8, name: 'Scorpio', hindi: 'वृश्चिक', lord: 'Mars' },
    { id: 9, name: 'Sagittarius', hindi: 'धनु', lord: 'Jupiter' },
    { id: 10, name: 'Capricorn', hindi: 'मकर', lord: 'Saturn' },
    { id: 11, name: 'Aquarius', hindi: 'कुंभ', lord: 'Saturn' },
    { id: 12, name: 'Pisces', hindi: 'मीन', lord: 'Jupiter' }
  ],

  NAKSHATRAS: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ],

  // Exaltation (Uchha) & Debilitation (Neecha) signs (1-indexed: 1 = Aries, etc.)
  PLANET_DIGNITIES: {
    Sun: { exalted: 1, debilitated: 7, mooltrikona: 5 },
    Moon: { exalted: 2, debilitated: 8, mooltrikona: 2 },
    Mars: { exalted: 10, debilitated: 4, mooltrikona: 1 },
    Mercury: { exalted: 6, debilitated: 12, mooltrikona: 6 },
    Jupiter: { exalted: 4, debilitated: 10, mooltrikona: 9 },
    Venus: { exalted: 12, debilitated: 6, mooltrikona: 7 },
    Saturn: { exalted: 7, debilitated: 1, mooltrikona: 11 },
    Rahu: { exalted: 2, debilitated: 8, mooltrikona: 11 },
    Ketu: { exalted: 8, debilitated: 2, mooltrikona: 9 }
  }
};