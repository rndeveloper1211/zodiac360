const { getUtcDate } = require('../utils/time.util');
const { getPlanetaryPositions } = require('../engine/astronomy.engine');
const { analyzeKundali } = require('../engine/analysis.engine');

function generateKundaliReport({ date, time, lat, lon, timezone = 5.5 }) {
  const utcDate = getUtcDate(date, time, timezone);
  
  // 1. Physical & Sidereal planetary calculations
  const { ayanamsha, lagna, planets } = getPlanetaryPositions(
    utcDate, 
    parseFloat(lat), 
    parseFloat(lon)
  );

  // 2. Astrology rule engine processing
  const analysis = analyzeKundali(lagna, planets);

  return {
    meta: {
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

module.exports = {
  generateKundaliReport
};