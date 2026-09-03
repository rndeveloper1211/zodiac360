// E:/zodiac360/backend/src/engine/D2/d2Engine.js

const {
  calculateD2Positions
} = require("./d2ChartEngine");

const {
  interpretD2Chart
} = require("./d2Interpreter");


/**
 * ============================================================
 * D2 CHART ANALYSIS
 * ============================================================
 *
 * Input:
 *   payload.data.raw
 *   OR
 *   payload.raw
 *   OR
 *   payload itself
 *
 * Output:
 *   - D2 calculation
 *   - Lagna Hora
 *   - Hora placements
 *   - D2 chart
 *   - Planetary calculations
 *   - Wealth interpretation
 * ============================================================
 */

function analyzeD2Chart(payload) {

  if (!payload || typeof payload !== "object") {
    throw new Error(
      "D2 Analysis Failed: Payload is required."
    );
  }


  // ==========================================================
  // GET D1 DATA
  // ==========================================================

  const d1Data = payload.data
    ? payload.data
    : payload;


  // ==========================================================
  // GET RAW DATA
  // ==========================================================

  const rawData = d1Data.raw
    ? d1Data.raw
    : d1Data;


  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!rawData || typeof rawData !== "object") {
    throw new Error(
      "D2 Analysis Failed: Invalid D1 data."
    );
  }


  if (!rawData.lagna) {
    throw new Error(
      "D2 Analysis Failed: Lagna data is missing."
    );
  }


  if (!rawData.grahas) {
    throw new Error(
      "D2 Analysis Failed: Grahas data is missing."
    );
  }


  // ==========================================================
  // 1. D2 MATHEMATICAL CALCULATION
  // ==========================================================

  const calculation = calculateD2Positions(rawData);


  // ==========================================================
  // 2. D2 INTERPRETATION
  // ==========================================================

  let interpretation = {
    lagnaAnalysis: {},
    wealthSynthesis: {},
    detailedPlanetaryAnalysis: {}
  };


  if (typeof interpretD2Chart === "function") {
    interpretation = interpretD2Chart(
      calculation,
      rawData
    );
  }


  // ==========================================================
  // 3. META
  // ==========================================================

  const meta = {
    dob: rawData.meta
      ? rawData.meta.inputDate
      : undefined,

    tob: rawData.meta
      ? rawData.meta.inputTime
      : undefined,

    lagnaHora: calculation.lagnaHora,

    d2LagnaSignId: calculation.lagna.d2SignId,

    d2LagnaSignName: calculation.lagna.d2SignName
  };


  // ==========================================================
  // 4. FINAL RESPONSE
  // ==========================================================

  return {

    success: true,

    statusCode: 200,

    chartType: "D2",

    chartName: "Hora Chart",

    purpose: [
      "Wealth",
      "Financial Resources",
      "Accumulated Wealth",
      "Financial Strength"
    ],


    // --------------------------------------------------------
    // META
    // --------------------------------------------------------

    meta,


    // --------------------------------------------------------
    // D2 LAGNA
    // --------------------------------------------------------

    lagna: calculation.lagna,

    lagnaHora: calculation.lagnaHora,


    // --------------------------------------------------------
    // HORA PLACEMENTS
    // --------------------------------------------------------

    horaPlacements: calculation.horaPlacements,

    horaCounts: calculation.horaCounts,


    // --------------------------------------------------------
    // D2 CHART
    // --------------------------------------------------------

    d2Chart: calculation.d2Chart,


    // --------------------------------------------------------
    // EACH PLANET'S D2 POSITION
    // --------------------------------------------------------

    planetCalculations: calculation.planetCalculations,


    // --------------------------------------------------------
    // INTERPRETATION
    // --------------------------------------------------------

    lagnaAnalysis:
      interpretation.lagnaAnalysis || {},

    wealthSynthesis:
      interpretation.wealthSynthesis || {},

    detailedPlanetaryWealthAnalysis:
      interpretation.detailedPlanetaryAnalysis || {}
  };
}


module.exports = {
  analyzeD2Chart
};
