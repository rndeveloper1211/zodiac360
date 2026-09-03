// E:/zodiac360/backend/src/engine/D1/D1.service.js

const { getUtcDate } = require('../../utils/time.util');
const { getD1Chart } = require('./D1.engine');
const { analyzeKundali } = require('../analysis.engine');
const { analyzeD1Chart } = require('./d1Engine'); // हमारी 6-लेयर्स वाली इंजन फ़ाइल

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
    grahas: planets,
    analysis
  };
}

/**
 * 2. जब क्लाइंट सीधे बना-बनाया D1 JSON भेजे, तब व्याख्या निकालना
 */
function interpretExistingD1(rawD1Payload) {
  return analyzeD1Chart(rawD1Payload);
}

/**
 * 3. [Recommended] DOB/TOB/Lat/Lon लेते ही Raw Data + Full 6-Layer Hindi Report एक साथ देना
 */
function generateFullD1WithAnalysis(params) {
  // पहले गणितीय गणना (Raw Data)
  const rawD1Data = generateD1Report(params);

  // फिर 6 लेयर्स की फलित व्याख्या (Interpretation)
  const interpretation = analyzeD1Chart(rawD1Data);

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