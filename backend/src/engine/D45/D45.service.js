'use strict';

const { getUtcDate } = require('../../utils/time.util');
const { getD1Chart } = require('../D1/D1.engine');
const { processD45Chart } = require('./D45.engine');
const { interpretD45Chart } = require('./d45Interpreter');

function buildAnalysisBlock(chart) {
  const analysis = interpretD45Chart(chart);
  return {
    purpose: analysis.purpose,
    lagnaInsight: {
      d45Sign: chart.lagna.d45Sign,
      d45SignHindi: chart.lagna.d45SignHindi,
      d45SignLord: chart.lagna.d45SignLord,
      deity: chart.lagna.deity,
      sourceModality: chart.lagna.sourceModality
    },
    planetInsights: analysis.planets,
    overallSummary: analysis.overallSummary
  };
}

function generateD45Report({ date, time, lat, lon, timezone = 5.5 }) {
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
  const chart = processD45Chart(d1);

  return {
    meta: {
      chart: 'D45',
      chartName: 'Akshavedamsha Chart',
      calculationSystem: 'Parashari Akshavedamsha',
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
    timeSensitivity: chart.timeSensitivity,
    planets: chart.planets,
    houses: chart.houses,
    analysis: buildAnalysisBlock(chart)
  };
}

function processExistingD1ToD45(d1Chart) {
  const chart = processD45Chart(d1Chart);

  return {
    lagna: chart.lagna,
    timeSensitivity: chart.timeSensitivity,
    planets: chart.planets,
    houses: chart.houses,
    analysis: buildAnalysisBlock(chart)
  };
}

module.exports = {
  generateD45Report,
  processExistingD1ToD45
};
