// backend/src/engine/d1ChartEngine.js
const { calculateAscendant } = require('./ascendant');
const { calculatePlanets } = require('./planets');

// 12 राशियों के नाम और उनके स्वामी
const RASHI_DATA = [
  { name: "Aries", hindi: "मेष", lord: "Mars" },
  { name: "Taurus", hindi: "वृषभ", lord: "Venus" },
  { name: "Gemini", hindi: "मिथुन", lord: "Mercury" },
  { name: "Cancer", hindi: "कर्क", lord: "Moon" },
  { name: "Leo", hindi: "सिंह", lord: "Sun" },
  { name: "Virgo", hindi: "कन्या", lord: "Mercury" },
  { name: "Libra", hindi: "तुला", lord: "Venus" },
  { name: "Scorpio", hindi: "वृश्चिक", lord: "Mars" },
  { name: "Sagittarius", hindi: "धनु", lord: "Jupiter" },
  { name: "Capricorn", hindi: "मकर", lord: "Saturn" },
  { name: "Aquarius", hindi: "कुम्भ", lord: "Saturn" },
  { name: "Pisces", hindi: "मीन", lord: "Jupiter" }
];

function generateD1ChartData(dateObj, latitude, longitude) {
  // 1. लग्न (1st House) निकालें
  const ascendant = calculateAscendant(dateObj, latitude, longitude);
  const lagnaRashiIndex = ascendant.rashiIndex; // 0 से 11

  // 2. सभी 9 ग्रह निकालें
  const rawPlanets = calculatePlanets(dateObj);

  // 3. 1 से 12 भावों का ढांचा तैयार करें
  const houses = {};
  for (let h = 1; h <= 12; h++) {
    // भाव की राशि = (लग्न राशि + भाव - 1) % 12
    const currentSignIndex = (lagnaRashiIndex + (h - 1)) % 12;
    houses[h] = {
      houseNumber: h,
      rashiIndex: currentSignIndex,
      rashi: RASHI_DATA[currentSignIndex].name,
      rashiHindi: RASHI_DATA[currentSignIndex].hindi,
      signLord: RASHI_DATA[currentSignIndex].lord,
      planets: []
    };
  }

  // 4. प्रत्येक ग्रह को उसके सही भाव में बैठाएं
  const formattedPlanets = {};

  Object.keys(rawPlanets).forEach((planetName) => {
    const p = rawPlanets[planetName];
    
    // ग्रह की राशि निकालें
    const planetRashiIndex = p.rashiIndex !== undefined 
      ? p.rashiIndex 
      : Math.floor(p.totalDegree / 30);

    // भाव निकालने का वैदिक नियम: (ग्रह राशि - लग्न राशि + 12) % 12 + 1
    const houseNumber = ((planetRashiIndex - lagnaRashiIndex + 12) % 12) + 1;

    const planetInfo = {
      name: planetName,
      rashi: RASHI_DATA[planetRashiIndex].name,
      rashiHindi: RASHI_DATA[planetRashiIndex].hindi,
      rashiIndex: planetRashiIndex,
      degreeInRashi: Number((p.totalDegree % 30).toFixed(2)),
      totalDegree: Number(p.totalDegree.toFixed(2)),
      house: houseNumber
    };

    formattedPlanets[planetName] = planetInfo;

    // इस ग्रह को संबंधित भाव (House) की लिस्ट में जोड़ें
    houses[houseNumber].planets.push({
      name: planetName,
      degree: planetInfo.degreeInRashi
    });
  });

  return {
    chartType: "D1 - Rashi Chart",
    ascendant: ascendant,
    houses: houses,
    planets: formattedPlanets
  };
}

module.exports = { generateD1ChartData };