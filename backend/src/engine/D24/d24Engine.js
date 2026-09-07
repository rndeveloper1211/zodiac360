/**
 * D24 Core Orchestrator
 * ---------------------
 * D1 raw -> D24 calculation -> 4th house/Mercury/Jupiter/education-field analysis -> timing.
 */

const { generateD24Chart } = require('./D24chartengine');
const {
  computeMahadashaSequence,
  buildCompactD24Response
} = require('./D24advancedrules');
const { processD24Interpretation } = require('./d24Interpreter');

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

function processD24Chart(inputD1Data, options = {}) {
  try {
    const d1RawData = unwrapD1Data(inputD1Data);
    if (!d1RawData?.lagna || !d1RawData?.grahas) {
      throw new Error('Valid D1 raw data with lagna and grahas is required for D24 calculation.');
    }

    const d24ChartData = generateD24Chart(d1RawData);
    const moonTotalDegree = extractMoonTotalDegree(d1RawData);
    const birthDateISO = extractBirthDate(d1RawData);

    let mahadashaSequence = null;
    if (moonTotalDegree !== null && birthDateISO) {
      try {
        mahadashaSequence = computeMahadashaSequence(moonTotalDegree, birthDateISO);
      } catch (error) {
        console.warn('D24 Vimshottari computation skipped:', error.message);
      }
    }

    const interpretation = processD24Interpretation(
      d24ChartData,
      moonTotalDegree,
      birthDateISO,
      mahadashaSequence,
      {
        d1RawData,
        d1Analysis: options.d1Analysis || null,
        transits: options.transits || d1RawData.transits || null,
        asOfDate: options.asOfDate || new Date(),
        maxTimingYears: options.maxTimingYears || 20
      }
    );

    const publicAnalysis = buildCompactD24Response(interpretation);

    const compactChart = {
      chartType: d24ChartData.chartType,
      chartName: d24ChartData.chartName,
      calculationSystem: d24ChartData.calculationSystem,
      meta: d24ChartData.meta,
      lagna: d24ChartData.lagna,
      fourthLordName: d24ChartData.fourthLordName,
      houseSigns: d24ChartData.houseSigns,
      houseLords: d24ChartData.houseLords
    };

    const result = {
      success: true,
      chartType: 'D24',
      data: {
        chart: compactChart,
        analysis: publicAnalysis
      }
    };

    if (options.includeRaw === true || options.debug === true) {
      result.data.raw = d24ChartData;
      result.data.debugAnalysis = interpretation;
    }

    return result;
  } catch (error) {
    console.error('Error in processD24Chart:', error);
    throw error;
  }
}

module.exports = {
  processD24Chart,
  unwrapD1Data,
  extractMoonTotalDegree,
  extractBirthDate
};
