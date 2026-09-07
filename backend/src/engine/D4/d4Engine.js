const { generateD4Chart } = require('./d4ChartEngine');
const { synthesizeD4Analysis } = require('./d4Interpreter');
const { computeMahadashaSequence, buildDashaPropertyTimeline } = require('./d4DashaEngine');

function processD4Chart(d1Data) {
  if (!d1Data || !d1Data.lagna || !d1Data.grahas) {
    throw new Error('Invalid D1 chart data provided to D4 Engine.');
  }

  const d4ChartData = generateD4Chart(d1Data);

  // ---------------------------------------------------------
  // Dasha-based timing (best-effort; no dasha module existed in
  // the project, so this is computed independently — see d4DashaEngine.js)
  // ---------------------------------------------------------
  let dashaTimeline = null;
  try {
    const moon = d1Data.grahas.Moon;
    const birthDateISO = d1Data.meta?.utcTimestamp || d1Data.meta?.inputDate;

    if (moon && moon.totalDegree !== undefined && birthDateISO) {
      const mahadashaSequence = computeMahadashaSequence(moon.totalDegree, birthDateISO);
      dashaTimeline = buildDashaPropertyTimeline(mahadashaSequence, d4ChartData);
    } else {
      dashaTimeline = {
        note:
          'Dasha timing skip हुई: Moon.totalDegree या meta.utcTimestamp/inputDate ' +
          'D1 raw data में उपलब्ध नहीं था।'
      };
    }
  } catch (error) {
    dashaTimeline = { error: `Dasha timeline could not be computed: ${error.message}` };
  }

  const interpretationData = synthesizeD4Analysis(d4ChartData, dashaTimeline);

  return {
    source: {
      chart: 'D1',
      divisionalChart: 'D4',
      calculationSystem: 'Parashari Chaturthamsha'
    },
    ...d4ChartData,
    analysis: {
      ...interpretationData
    }
  };
}

module.exports = {
  processD4Chart
};