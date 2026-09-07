/**
 * ============================================================
 * D12 SERVICE
 * ============================================================
 *
 * Flow:
 *
 * D1 Exact Longitudes
 *        ↓
 * D12 Calculation
 *        ↓
 * D12 Interpretation
 *        ↓
 * D1 + D12 Cross Confirmation
 *
 * IMPORTANT:
 *
 * D12 planetary positions independently calculate
 * nahi karta.
 *
 * D1 ki exact longitudes ko reuse karta hai.
 *
 * ============================================================
 */

const {
  generateD12Chart
} = require('./d12Engine');

const {
  interpretD12
} = require('./d12Interpreter');

const {
  analyzeD1D12CrossConfirmation
} = require('./d12CrossConfirmation');


/**
 * ============================================================
 * REQUIRED PLANETS
 * ============================================================
 */

const REQUIRED_PLANETS = [

  'Ascendant',

  'Sun',

  'Moon',

  'Mars',

  'Mercury',

  'Jupiter',

  'Venus',

  'Saturn',

  'Rahu',

  'Ketu'

];


/**
 * ============================================================
 * NUMBER VALIDATION
 * ============================================================
 */

function isValidNumber(value) {

  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  );

}


/**
 * ============================================================
 * LONGITUDE NORMALIZATION
 * ============================================================
 */

function normalizeLongitude(value) {

  let longitude =
    Number(value);


  if (
    !Number.isFinite(
      longitude
    )
  ) {

    throw new Error(
      `Invalid longitude: ${value}`
    );

  }


  /**
   * Keep longitude between:
   *
   * 0° - 360°
   */

  longitude =
    (
      (longitude % 360) +
      360
    ) % 360;


  /**
   * Keep 6 decimal places
   */

  return Number(
    longitude.toFixed(6)
  );

}


/**
 * ============================================================
 * VALIDATE D1 LONGITUDES
 * ============================================================
 */

function validatePlanetLongitudes(
  planetLongitudes
) {

  if (
    !planetLongitudes ||
    typeof planetLongitudes !== 'object'
  ) {

    throw new Error(
      'planetLongitudes object is required.'
    );

  }


  const normalized = {};


  for (
    const planet of REQUIRED_PLANETS
  ) {

    /**
     * Missing value
     */

    if (
      planetLongitudes[planet] ===
        undefined ||
      planetLongitudes[planet] ===
        null
    ) {

      throw new Error(
        `Missing D1 longitude for ${planet}.`
      );

    }


    /**
     * Numeric validation
     */

    if (
      !isValidNumber(
        Number(
          planetLongitudes[planet]
        )
      )
    ) {

      throw new Error(
        `Invalid D1 longitude for ${planet}.`
      );

    }


    /**
     * Normalize
     */

    normalized[planet] =
      normalizeLongitude(
        planetLongitudes[planet]
      );

  }


  return normalized;

}


/**
 * ============================================================
 * LOW LEVEL D12 CALCULATION
 * ============================================================
 *
 * No interpretation.
 * No cross confirmation.
 *
 * Only D12 chart calculation.
 * ============================================================
 */

function calculateD12(
  planetLongitudes
) {

  const normalized =
    validatePlanetLongitudes(
      planetLongitudes
    );


  return generateD12Chart(
    normalized
  );

}


/**
 * ============================================================
 * FULL D12 PROCESS
 * ============================================================
 */

function processD12Chart(
  options
) {

  options =
    options || {};


  const {

    /**
     * Exact D1 longitudes
     */

    planetLongitudes,


    /**
     * Optional current dasha lord
     */

    currentDashaLord =
      null,


    /**
     * Full D1 chart
     *
     * Required for:
     *
     * D1 + D12
     * Cross Confirmation
     */

    d1Chart =
      null

  } = options;


  /**
   * ----------------------------------------------------------
   * STEP 1
   * Validate D1 longitudes
   * ----------------------------------------------------------
   */

  const normalizedLongitudes =
    validatePlanetLongitudes(
      planetLongitudes
    );


  /**
   * ----------------------------------------------------------
   * STEP 2
   * Generate D12
   * ----------------------------------------------------------
   */

  const chart =
    generateD12Chart(
      normalizedLongitudes
    );


  /**
   * ----------------------------------------------------------
   * STEP 3
   * D12 Interpretation
   * ----------------------------------------------------------
   */

  const interpretation =
    interpretD12(
      chart,
      {

        currentDashaLord:
          currentDashaLord ||
          null

      }
    );


  /**
   * ----------------------------------------------------------
   * STEP 4
   * D1 + D12 Cross Confirmation
   * ----------------------------------------------------------
   */

  let crossConfirmation = {

    available:
      false,

    message:
      'D1 chart उपलब्ध नहीं है। इसलिए D1-D12 cross confirmation नहीं किया गया।'

  };


  /**
   * Full D1 available?
   */

  if (
    d1Chart &&
    typeof d1Chart === 'object'
  ) {

    crossConfirmation =
      analyzeD1D12CrossConfirmation(

        d1Chart,

        {

          /**
           * D12 raw chart
           */

          ...chart,


          /**
           * D12 interpretation
           */

          interpretation:
            interpretation?.interpretation ||
            [],


          /**
           * Simple summary
           */

          simpleSummary:
            interpretation?.simpleSummary ||
            [],


          /**
           * Detailed breakdown
           *
           * Cross confirmation
           * isi data ko use karega.
           */

          detailedBreakdown:
            interpretation?.detailedBreakdown ||
            {}

        }

      );

  }


  /**
   * ----------------------------------------------------------
   * STEP 5
   * Chart Information
   * ----------------------------------------------------------
   */

  const chartInfo = {

    name:
      'D12 - Dwadashamsha',

    purpose:
      'Parents, grandparents, ancestral lineage and inherited family patterns',

    calculationSystem:
      'Parashari Dwadashamsha',

    primaryAreas: [

      'Father',

      'Mother',

      'Paternal grandparents',

      'Maternal grandparents',

      'Ancestral lineage',

      'Family traditions',

      'Inherited patterns'

    ]

  };


  /**
   * ----------------------------------------------------------
   * STEP 6
   * FINAL RESULT
   * ----------------------------------------------------------
   */

  return {

    /**
     * Chart information
     */

    chartInfo,


    /**
     * D12 Ascendant
     */

    d12Ascendant:
      chart?.d12Ascendant ||
      null,


    /**
     * Houses
     */

    houses:
      chart?.houses ||
      {},


    /**
     * Planetary positions
     */

    planetaryPositions:
      chart?.planetaryPositions ||
      {},


    /**
     * D12 interpretation
     */

    interpretation:
      interpretation?.interpretation ||
      [],


    /**
     * Simple summary
     */

    simpleSummary:
      interpretation?.simpleSummary ||
      [],


    /**
     * Detailed breakdown
     */

    detailedBreakdown:
      interpretation?.detailedBreakdown ||
      {},


    /**
     * Scores
     */

    scores:
      interpretation?.scores ||
      {},


    /**
     * D12 confirmation
     */

    confirmation:
      interpretation?.confirmation ||
      {},


    /**
     * D1 + D12 Cross Confirmation
     */

    crossConfirmation

  };

}


/**
 * ============================================================
 * PROCESS FROM LONGITUDES
 * ============================================================
 */

function processD12FromLongitudes(

  planetLongitudes,

  currentDashaLord =
    null,

  d1Chart =
    null

) {

  return processD12Chart({

    planetLongitudes,

    currentDashaLord,

    d1Chart

  });

}


/**
 * ============================================================
 * RAW D12 CHART
 * ============================================================
 *
 * Low-level function.
 *
 * No interpretation.
 * No cross confirmation.
 * ============================================================
 */

function getD12Chart(
  planetLongitudes
) {

  const normalized =
    validatePlanetLongitudes(
      planetLongitudes
    );


  return generateD12Chart(
    normalized
  );

}


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

  processD12Chart,

  processD12FromLongitudes,

  calculateD12,

  getD12Chart,

  validatePlanetLongitudes,

  normalizeLongitude,

  REQUIRED_PLANETS

};