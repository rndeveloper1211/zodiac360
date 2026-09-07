/**
 * D9 Core Orchestrator
 * --------------------
 * D1 raw -> D9 calculation -> 7th house/Venus/Jupiter/Vargottama analysis -> timing.
 */

const { generateD9Chart } = require('./D9chartengine');
const {
  computeMahadashaSequence,
  buildCompactD9Response
} = require('./D9advancedrules');
const { processD9Interpretation } = require('./d9Interpreter');

function unwrapD1Data(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('D1 input data is required.');
  }
  if (input.data?.raw) return input.data.raw;
  if (input.data?.lagna && input.data?.grahas) return input.data;
  return input;
}

function extractMoonTotalDegree(d1RawData) {
  const moon = d1RawData?.grahas?.Moon || d1RawData?.planets?.Moon;
  if (!moon) return null;
  if (Number.isFinite(Number(moon.totalDegree))) return Number(moon.totalDegree);
  if (Number.isFinite(Number(moon.signId)) && Number.isFinite(Number(moon.degreeInSign))) {
    return (Number(moon.signId) - 1) * 30 + Number(moon.degreeInSign);
  }
  return null;
}

function extractBirthDate(d1RawData) {
  return d1RawData?.meta?.inputDate ||
    d1RawData?.meta?.dob ||
    d1RawData?.meta?.birthDate ||
    null;
}

function processD9Chart(inputD1Data, options = {}) {
  try {
    const d1RawData = unwrapD1Data(inputD1Data);
    if (!d1RawData?.lagna || !d1RawData?.grahas) {
      throw new Error('Valid D1 raw data with lagna and grahas is required for D9 calculation.');
    }

    const d9ChartData = generateD9Chart(d1RawData);
    const moonTotalDegree = extractMoonTotalDegree(d1RawData);
    const birthDateISO = extractBirthDate(d1RawData);

    let mahadashaSequence = null;
    if (moonTotalDegree !== null && birthDateISO) {
      try {
        mahadashaSequence = computeMahadashaSequence(moonTotalDegree, birthDateISO);
      } catch (error) {
        console.warn('D9 Vimshottari computation skipped:', error.message);
      }
    }

    const interpretation = processD9Interpretation(
      d9ChartData,
      moonTotalDegree,
      birthDateISO,
      mahadashaSequence,
      {
        d1RawData,
        transits: options.transits || d1RawData.transits || null,
        asOfDate: options.asOfDate || new Date(),
        maxTimingYears: options.maxTimingYears || 20
      }
    );

    const publicAnalysis = buildCompactD9Response(interpretation);

    const compactChart = {
      chartType: d9ChartData.chartType,
      chartName: d9ChartData.chartName,
      calculationSystem: d9ChartData.calculationSystem,
      meta: d9ChartData.meta,
      lagna: d9ChartData.lagna,
      seventhLordName: d9ChartData.seventhLordName,
      houseSigns: d9ChartData.houseSigns,
      houseLords: d9ChartData.houseLords
    };

    const result = {
      success: true,
      chartType: 'D9',
      data: {
        chart: compactChart,
        analysis: publicAnalysis
      }
    };

    if (options.includeRaw === true || options.debug === true) {
      result.data.raw = d9ChartData;
      result.data.debugAnalysis = interpretation;
    }

    return result;
  } catch (error) {
    console.error('Error in processD9Chart:', error);
    throw error;
  }
}

module.exports = {
  processD9Chart,
  unwrapD1Data,
  extractMoonTotalDegree,
  extractBirthDate
};
