// E:/zodiac360/backend/src/engine/D1/D1.service.js

const { getUtcDate } = require('../../utils/time.util');
const { getD1Chart } = require('./D1.engine');
const { analyzeKundali } = require('../analysis.engine');
const { interpretD1Chart } = require('./d1Interpreter'); // Direct interpreter import

/**
 * 1. Raw D1 Chart Data जनरेट करता है
 */
function generateD1Report({ date, time, lat, lon, timezone = 5.5 }) {
  const utcDate = getUtcDate(date, time, timezone);

  const { ayanamsha, lagna, planets } = getD1Chart(
    utcDate,
    parseFloat(lat),
    parseFloat(lon)
  );

  const analysis = analyzeKundali(lagna, planets);

  // Houses map generate karna taaki interpreter ko data mil sake
  const houses = {};
  for (let h = 1; h <= 12; h++) {
    const currentSignIndex = ((lagna.signId - 1 + (h - 1)) % 12);
    houses[h] = {
      houseNumber: h,
      rashiIndex: currentSignIndex,
      rashi: planets ? Object.values(planets)[0]?.rashi : '',
      rashiHindi: '',
      signLord: '',
      planets: []
    };
  }

  // Planets ko unke house ke hisab se map karna
  Object.keys(planets).forEach(planetName => {
    const p = planets[planetName];
    const houseNum = p.house;
    if (houses[houseNum]) {
      houses[houseNum].planets.push({
        name: planetName,
        degree: p.degreeInSign
      });
    }
  });

  return {
    meta: {
      chart: 'D1',
      inputDate: date,
      inputTime: time,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      timezoneOffset: timezone,
      utcTimestamp: utcDate.toISOString(),
      ayanamshaUsed: 'Lahiri',
      ayanamshaValue: ayanamsha
    },
    lagna,
    planets: planets, // Interpreter ke liye
    grahas: planets,  // Backwards compatibility ke liye
    houses: houses,   // Houses data zaroori hai
    analysis
  };
}

/**
 * 2. जब क्लाइंट सीधे बना-बनाया D1 JSON भेजे, तब व्याख्या निकालना
 */
function interpretExistingD1(rawD1Payload) {
  return interpretD1Chart(rawD1Payload);
}

/**
 * 3. [Recommended] DOB/TOB/Lat/Lon लेते ही Raw Data + Full 6-Layer Hindi Report एक साथ देना
 */
function generateFullD1WithAnalysis(params) {
  const rawD1Data = generateD1Report(params);
  const interpretation = interpretD1Chart(rawD1Data);

  return {
    success: true,
    rawData: rawD1Data,
    interpretedReport: interpretation
  };
}

module.exports = {
  generateD1Report,
  interpretExistingD1,
  generateFullD1WithAnalysis
};