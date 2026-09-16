/**
 * D40 (Khavedamsha) interpretation rules.
 * Calculation stays in D40.engine.js — this file is pure interpretation data.
 *
 * Classical Parashari usage: Khavedamsha shows general shubha/ashubha
 * (auspicious/inauspicious) effects; several living traditions — including
 * this app's convention — extend its reading to blessings/obstacles coming
 * through the maternal lineage. Both framings are given below.
 */

// Functional nature of each sign-lord (used since D40, unlike D30, has no
// fixed 5-graha segment-lord scheme — every one of the 40 parts maps to a
// regular sign, so we judge shubha/ashubha via that sign's ruling planet).
const LORD_NATURE = {
  Sun: 'ashubha',
  Moon: 'shubha',
  Mars: 'ashubha',
  Mercury: 'shubha',
  Jupiter: 'shubha',
  Venus: 'shubha',
  Saturn: 'ashubha'
};

const NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

const KENDRA_TRIKONA_HOUSES = [1, 4, 5, 7, 9, 10]; // auspicious houses
const DUSTHANA_HOUSES = [6, 8, 12]; // inauspicious houses

const LORD_THEMES = {
  Sun: {
    themes: ['ego friction with maternal side', 'authority clashes', 'pride-driven distance'],
    positive: 'आत्म-सम्मान और नेतृत्व क्षमता, अगर विनम्रता के साथ इस्तेमाल हो।'
  },
  Moon: {
    themes: ['emotional bonding', 'nurturing support', 'maternal blessings'],
    positive: 'मातृ-पक्ष से भावनात्मक जुड़ाव और मानसिक शांति।'
  },
  Mars: {
    themes: ['friction/disputes on maternal side', 'sudden separations', 'impulsive conflict'],
    positive: 'ज़रूरत के समय maternal side से protective courage।'
  },
  Mercury: {
    themes: ['communication-based connection', 'practical support', 'shared learning'],
    positive: 'सलाह-मशवरे और व्यावहारिक सहयोग का माहौल।'
  },
  Jupiter: {
    themes: ['blessings', 'wisdom passed down', 'protection', 'good fortune through lineage'],
    positive: 'मातृ-पक्ष से आशीर्वाद, मार्गदर्शन और दीर्घकालिक शुभता।'
  },
  Venus: {
    themes: ['warmth', 'comfort', 'affection', 'aesthetic/cultural inheritance'],
    positive: 'स्नेह, सुख-सुविधा और रिश्तों में मिठास।'
  },
  Saturn: {
    themes: ['delay/distance in maternal bond', 'duty-bound but cold ties', 'long-term karmic lessons'],
    positive: 'धैर्य और ज़िम्मेदारी की सीख, भले ही रिश्ता आसान न हो।'
  }
};

module.exports = {
  LORD_NATURE,
  NATURAL_MALEFICS,
  KENDRA_TRIKONA_HOUSES,
  DUSTHANA_HOUSES,
  LORD_THEMES
};
