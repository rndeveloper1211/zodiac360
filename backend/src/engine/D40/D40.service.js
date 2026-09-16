'use strict';

const { getUtcDate } = require('../../utils/time.util');
const { getD1Chart } = require('../D1/D1.engine');
const { processD40Chart } = require('./D40.engine');
const { interpretD40Chart } = require('./d40Interpreter');

function buildAnalysisBlock(chart) {
  const analysis = interpretD40Chart(chart);
  return {
    purpose: analysis.purpose,
    lagnaInsight: {
      d40Sign: chart.lagna.d40Sign,
      d40SignHindi: chart.lagna.d40SignHindi,
      d40SignLord: chart.lagna.d40SignLord
    },
    planetInsights: analysis.planets,
    overallSummary: analysis.overallSummary
  };
}

function generateD40Report({ date, time, lat, lon, timezone = 5.5 }) {
  if (!date || !time || lat === undefined || lon === undefined) {
    throw new Error('date, time, lat and lon are required.');
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  const tz = Number(timezone);

  if (!Number.isFinite(latitude)) throw new Error('Invalid latitude.');
  if (!Number.isFinite(longitude)) throw new Error('Invalid longitude.');
  if (!Number.isFinite(tz)) throw new Error('Invalid timezone.');

  const utcDate = getUtcDate(date, time, tz);
  const d1 = getD1Chart(utcDate, latitude, longitude);
  const chart = processD40Chart(d1);

  return {
    meta: {
      chart: 'D40',
      chartName: 'Khavedamsha Chart',
      calculationSystem: 'Parashari Khavedamsha',
      inputDate: date,
      inputTime: time,
      latitude,
      longitude,
      timezoneOffset: tz,
      utcTimestamp: utcDate.toISOString(),
      ayanamshaUsed: 'Lahiri',
      ayanamshaValue: d1.ayanamsha
    },
    lagna: chart.lagna,
    planets: chart.planets,
    houses: chart.houses,
    analysis: buildAnalysisBlock(chart)
  };
}

function processExistingD1ToD40(d1Chart) {
  const chart = processD40Chart(d1Chart);

  return {
    lagna: chart.lagna,
    planets: chart.planets,
    houses: chart.houses,
    analysis: buildAnalysisBlock(chart)
  };
}

module.exports = {
  generateD40Report,
  processExistingD1ToD40
};
