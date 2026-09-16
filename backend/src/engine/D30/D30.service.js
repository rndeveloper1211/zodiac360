'use strict';

const { getUtcDate } = require('../../utils/time.util');
const { getD1Chart } = require('../D1/D1.engine');
const { processD30Chart } = require('./D30.engine');
const { interpretD30Chart } = require('./d30Interpreter');

function buildAnalysisBlock(chart) {
  const analysis = interpretD30Chart(chart);
  return {
    purpose: analysis.purpose,
    lagnaInsight: {
      d30Sign: chart.lagna.d30Sign,
      d30SignHindi: chart.lagna.d30SignHindi,
      segmentLord: chart.lagna.segmentLord
    },
    planetInsights: analysis.planets,
    doshas: analysis.doshas,
    healthProfile: analysis.healthProfile,
    overallSeverity: analysis.overallSeverity
  };
}

function generateD30Report({ date, time, lat, lon, timezone = 5.5 }) {
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
  const chart = processD30Chart(d1);

  return {
    meta: {
      chart: 'D30',
      chartName: 'Trimshamsha Chart',
      calculationSystem: 'Parashari Trimshamsha',
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

function processExistingD1ToD30(d1Chart) {
  const chart = processD30Chart(d1Chart);

  return {
    lagna: chart.lagna,
    planets: chart.planets,
    houses: chart.houses,
    analysis: buildAnalysisBlock(chart)
  };
}

module.exports = {
  generateD30Report,
  processExistingD1ToD30
};