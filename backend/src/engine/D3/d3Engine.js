/**
 * D3 (Drekkana) Engine Aggregator
 *
 * Combines:
 * 1. D1 Input Validation
 * 2. D3 Chart Calculation
 * 3. D3 Interpretation
 * 4. D1 + D3 Integrated Analysis
 *
 * Flow:
 *
 * D1 Data
 *   ↓
 * D3 Calculation
 *   ↓
 * D3 Chart
 *   ↓
 * D3 Interpretation
 *   ↓
 * D1 + D3 Integration
 *   ↓
 * Complete D3 Response
 */

const { generateD3Chart } = require('./d3ChartEngine');
const { synthesizeD3Analysis } = require('./d3Interpreter');

/**
 * Executes complete D3 chart processing.
 *
 * @param {Object} d1Data - Generated raw D1 chart data
 * @returns {Object} Complete D3 chart + interpretation
 */
function processD3Chart(d1Data) {

  /* =====================================================
   * 1. VALIDATE D1 INPUT
   * ===================================================== */

  if (!d1Data || typeof d1Data !== 'object') {
    throw new Error(
      'Invalid D1 chart data provided to D3 Engine.'
    );
  }

  if (!d1Data.lagna) {
    throw new Error(
      'D1 Lagna data is missing.'
    );
  }

  if (!d1Data.grahas || typeof d1Data.grahas !== 'object') {
    throw new Error(
      'D1 Graha data is missing.'
    );
  }


  /* =====================================================
   * 2. GENERATE D3 CHART
   * ===================================================== */

  let d3ChartData;

  try {

    d3ChartData = generateD3Chart(d1Data);

  } catch (error) {

    throw new Error(
      `D3 chart calculation failed: ${error.message}`
    );

  }


  /* =====================================================
   * 3. VALIDATE GENERATED D3 DATA
   * ===================================================== */

  if (!d3ChartData || typeof d3ChartData !== 'object') {
    throw new Error(
      'D3 chart engine returned invalid data.'
    );
  }

  if (!d3ChartData.lagna) {
    throw new Error(
      'Generated D3 chart is missing Lagna data.'
    );
  }

  if (
    !d3ChartData.planetCalculations ||
    typeof d3ChartData.planetCalculations !== 'object'
  ) {
    throw new Error(
      'Generated D3 chart is missing planet calculations.'
    );
  }


  /* =====================================================
   * 4. GENERATE D3 INTERPRETATION
   *
   * IMPORTANT:
   * Pass BOTH D3 data and D1 data.
   *
   * This allows the interpreter to perform:
   *
   * D3-only analysis
   * +
   * D1 + D3 integrated analysis
   * ===================================================== */

  let interpretationData;

  try {

    interpretationData = synthesizeD3Analysis(
      d3ChartData,
      d1Data
    );

  } catch (error) {

    throw new Error(
      `D3 interpretation failed: ${error.message}`
    );

  }


  /* =====================================================
   * 5. RETURN COMPLETE D3 RESPONSE
   * ===================================================== */

  return {

    /* -----------------------------------------------
     * Original D1 reference
     * ----------------------------------------------- */

    source: {
      chart: 'D1',
      divisionalChart: 'D3',
      calculationSystem: 'Parashari Drekkana'
    },


    /* -----------------------------------------------
     * D3 Chart
     * ----------------------------------------------- */

    ...d3ChartData,


    /* -----------------------------------------------
     * D3 Analysis
     * ----------------------------------------------- */

    analysis: {

      ...interpretationData

    }

  };
}


/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {
  processD3Chart
};