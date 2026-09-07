/**
 * D7 Core Orchestrator
 * --------------------
 * D1 raw -> D7 calculation -> D1/D7 progeny analysis -> timing.
 */

const { generateD7Chart } = require('./D7chartengine');
const {
  computeMahadashaSequence,
  buildCompactD7Response
} = require('./D7advancedrules');
const { processD7Interpretation } = require('./d7Interpreter');

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

function processD7Chart(inputD1Data, options = {}) {
  try {
    const d1RawData = unwrapD1Data(inputD1Data);
    if (!d1RawData?.lagna || !d1RawData?.grahas) {
      throw new Error('Valid D1 raw data with lagna and grahas is required for D7 calculation.');
    }

    const d7ChartData = generateD7Chart(d1RawData);
    const moonTotalDegree = extractMoonTotalDegree(d1RawData);
    const birthDateISO = extractBirthDate(d1RawData);

    let mahadashaSequence = null;
    if (moonTotalDegree !== null && birthDateISO) {
      try {
        mahadashaSequence = computeMahadashaSequence(moonTotalDegree, birthDateISO);
      } catch (error) {
        console.warn('D7 Vimshottari computation skipped:', error.message);
      }
    }

    const interpretation = processD7Interpretation(
      d7ChartData,
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

    const publicAnalysis = buildCompactD7Response(interpretation);

    const compactChart = {
      chartType: d7ChartData.chartType,
      chartName: d7ChartData.chartName,
      calculationSystem: d7ChartData.calculationSystem,
      meta: d7ChartData.meta,
      lagna: d7ChartData.lagna,
      fifthLordName: d7ChartData.fifthLordName,
      houseSigns: d7ChartData.houseSigns,
      houseLords: d7ChartData.houseLords
    };

    const result = {
      success: true,
      chartType: 'D7',
      data: {
        chart: compactChart,
        analysis: publicAnalysis
      }
    };

    if (options.includeRaw === true || options.debug === true) {
      result.data.raw = d7ChartData;
      result.data.debugAnalysis = interpretation;
    }

    return result;
  } catch (error) {
    console.error('Error in processD7Chart:', error);
    throw error;
  }
}

module.exports = {
  processD7Chart,
  unwrapD1Data,
  extractMoonTotalDegree,
  extractBirthDate
};
