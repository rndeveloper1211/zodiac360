/**
 * D3 (Drekkana) Engine Aggregator
 * Combines Chart Generation and Interpretations
 */

const { generateD3Chart } = require('./d3ChartEngine');
const { synthesizeD3Analysis } = require('./d3Interpreter');

/**
 * Executes end-to-end D3 chart processing
 * @param {Object} d1Data - The generated raw D1 chart data
 * @returns {Object} Complete D3 analysis response
 */
function processD3Chart(d1Data) {
  if (!d1Data || !d1Data.lagna || !d1Data.grahas) {
    throw new Error('Invalid D1 chart data provided to D3 Engine.');
  }

  // 1. Calculate Core D3 Chart (Lagna, Signs, Houses)
  const d3ChartData = generateD3Chart(d1Data);

  // 2. Synthesize Predictions and Astrological Interpretations
  const interpretationData = synthesizeD3Analysis(d3ChartData);

  // 3. Return consolidated result matching D2 structure
  return {
    ...d3ChartData,
    analysis: {
      lagnaAnalysis: interpretationData.lagnaAnalysis,
      siblingsSummary: interpretationData.siblingsSummary,
      detailedPlanetaryEffects: interpretationData.detailedPlanetaryEffects
    }
  };
}

module.exports = {
  processD3Chart
};