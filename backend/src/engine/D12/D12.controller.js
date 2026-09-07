/**
 * ============================================================
 * D12 CONTROLLER
 * ============================================================
 *
 * Flow:
 *
 * Request
 *   ↓
 * D1 Service
 *   ↓
 * Exact D1 totalDegree
 *   ↓
 * D12 Service
 *   ↓
 * D12 Engine
 *   ↓
 * D12 Interpreter
 *   ↓
 * D1 + D12 Cross Confirmation
 *   ↓
 * JSON
 * ============================================================
 */

const D12Service =
  require('./D12.service');

const {
  generateD1Report
} = require('../D1/D1.service');


/**
 * ============================================================
 * REQUEST HELPERS
 * ============================================================
 */

function getRequestValue(req, key) {

  if (
    req?.query &&
    req.query[key] !== undefined
  ) {
    return req.query[key];
  }

  if (
    req?.body &&
    req.body[key] !== undefined
  ) {
    return req.body[key];
  }

  return undefined;
}


function parseNumber(
  value,
  fieldName
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    throw new Error(
      `${fieldName} must be a valid number.`
    );
  }

  return number;
}


function validateDate(date) {

  if (
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new Error(
      'date must be in YYYY-MM-DD format.'
    );
  }

  return date;
}


function validateTime(time) {

  if (
    !time ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    throw new Error(
      'time must be in HH:MM format.'
    );
  }

  const [
    hours,
    minutes
  ] = time
    .split(':')
    .map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(
      'Invalid time.'
    );
  }

  return time;
}


/**
 * ============================================================
 * EXTRACT D1 LONGITUDES
 * ============================================================
 *
 * D12 planetary calculation independently
 * nahi karta.
 *
 * D1 ke exact totalDegree ko reuse karta hai.
 * ============================================================
 */

function extractD1Longitudes(rawD1) {

  if (!rawD1) {
    throw new Error(
      'D1 report was not generated.'
    );
  }

  const longitudes = {};


  /**
   * ----------------------------------------------------------
   * Ascendant
   * ----------------------------------------------------------
   */

  const ascendant =
    rawD1?.lagna;

  if (
    !ascendant ||
    !Number.isFinite(
      Number(
        ascendant.totalDegree
      )
    )
  ) {
    throw new Error(
      'D1 Ascendant totalDegree is missing.'
    );
  }

  longitudes.Ascendant =
    Number(
      ascendant.totalDegree
    );


  /**
   * ----------------------------------------------------------
   * Planets
   * ----------------------------------------------------------
   */

  const requiredPlanets = [
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

  for (
    const planet of requiredPlanets
  ) {

    const data =
      rawD1?.grahas?.[planet];

    if (
      !data ||
      !Number.isFinite(
        Number(
          data.totalDegree
        )
      )
    ) {
      throw new Error(
        `D1 ${planet} totalDegree is missing.`
      );
    }

    longitudes[planet] =
      Number(
        data.totalDegree
      );
  }

  return longitudes;
}


/**
 * ============================================================
 * GET / POST D12 CHART
 * ============================================================
 */

async function getD12Chart(
  req,
  res
) {

  try {

    /**
     * --------------------------------------------------------
     * STEP 1
     * Request values
     * --------------------------------------------------------
     */

    const date =
      getRequestValue(
        req,
        'date'
      );

    const time =
      getRequestValue(
        req,
        'time'
      );

    const lat =
      getRequestValue(
        req,
        'lat'
      );

    const lon =
      getRequestValue(
        req,
        'lon'
      );

    const timezone =
      getRequestValue(
        req,
        'timezone'
      );

    const currentDashaLord =
      getRequestValue(
        req,
        'currentDashaLord'
      );


    /**
     * --------------------------------------------------------
     * STEP 2
     * Validation
     * --------------------------------------------------------
     */

    validateDate(date);

    validateTime(time);

    const latitude =
      parseNumber(
        lat,
        'lat'
      );

    const longitude =
      parseNumber(
        lon,
        'lon'
      );

    const timezoneOffset =
      timezone === undefined ||
      timezone === null ||
      timezone === ''
        ? 5.5
        : parseNumber(
            timezone,
            'timezone'
          );


    /**
     * Coordinate validation
     */

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error(
        'lat must be between -90 and 90.'
      );
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        'lon must be between -180 and 180.'
      );
    }


    /**
     * --------------------------------------------------------
     * STEP 3
     * Generate exact D1
     * --------------------------------------------------------
     */

    const rawD1 =
      generateD1Report({
        date,
        time,
        lat: latitude,
        lon: longitude,
        timezone: timezoneOffset
      });


    /**
     * --------------------------------------------------------
     * STEP 4
     * Extract exact D1 longitudes
     * --------------------------------------------------------
     */

    const d1Longitudes =
      extractD1Longitudes(
        rawD1
      );


    /**
     * --------------------------------------------------------
     * STEP 5
     * D12 calculation + interpretation
     * + D1/D12 cross confirmation
     *
     * IMPORTANT:
     * Full rawD1 is passed here.
     * --------------------------------------------------------
     */

    const result =
      D12Service.processD12Chart({

        planetLongitudes:
          d1Longitudes,

        currentDashaLord:
          currentDashaLord ||
          null,

        d1Chart:
          rawD1

      });


    /**
     * --------------------------------------------------------
     * STEP 6
     * Final response
     * --------------------------------------------------------
     */

    return res.json({

      success: true,

      data: {

        input: {

          date,

          time,

          lat:
            latitude,

          lon:
            longitude,

          timezone:
            timezoneOffset

        },

        source: {

          chart:
            'D1',

          divisionalChart:
            'D12',

          calculationSystem:
            'Parashari Dwadashamsha'

        },

        /**
         * Exact D1 longitudes
         * used by D12.
         */

        d1LongitudesUsed:
          d1Longitudes,

        /**
         * D12 complete result
         */

        ...result

      }

    });

  } catch (error) {

    console.error(
      'D12 Controller Error:',
      error
    );

    return res.status(400).json({

      success: false,

      error: {

        message:
          error?.message ||
          'Unable to generate D12 chart.'

      }

    });

  }

}


/**
 * ============================================================
 * POST /from-longitudes
 * ============================================================
 *
 * Purpose:
 *
 * Already calculated D1 longitudes se
 * D12 test karna.
 *
 * Optional:
 * Full d1Chart dene par
 * D1 + D12 cross confirmation bhi chalega.
 *
 * Body:
 *
 * {
 *   "planetLongitudes": {
 *      "Ascendant": 356.5496,
 *      "Sun": 200.4775,
 *      "Moon": 314.1529,
 *      ...
 *   },
 *
 *   "currentDashaLord": "Sun",
 *
 *   "d1Chart": {}
 * }
 *
 * ============================================================
 */

async function getD12FromPlanetLongitudes(
  req,
  res
) {

  try {

    const body =
      req?.body || {};


    /**
     * --------------------------------------------------------
     * STEP 1
     * Supplied D1 longitudes
     * --------------------------------------------------------
     */

    const planetLongitudes =
      body.planetLongitudes;


    /**
     * --------------------------------------------------------
     * STEP 2
     * Optional full D1 chart
     * --------------------------------------------------------
     */

    const d1Chart =
      body.d1Chart ||
      null;


    /**
     * --------------------------------------------------------
     * STEP 3
     * Dasha
     * --------------------------------------------------------
     */

    const currentDashaLord =
      body.currentDashaLord ||
      null;


    /**
     * --------------------------------------------------------
     * STEP 4
     * Generate D12
     * --------------------------------------------------------
     */

    const result =
      D12Service.processD12Chart({

        planetLongitudes,

        currentDashaLord,

        d1Chart

      });


    /**
     * --------------------------------------------------------
     * STEP 5
     * Response
     * --------------------------------------------------------
     */

    return res.json({

      success: true,

      data: {

        source: {

          chart:
            'D1',

          divisionalChart:
            'D12',

          calculationSystem:
            'Parashari Dwadashamsha'

        },

        d1LongitudesUsed:
          D12Service.validatePlanetLongitudes(
            planetLongitudes
          ),

        ...result

      }

    });

  } catch (error) {

    console.error(
      'D12 From Longitudes Error:',
      error
    );

    return res.status(400).json({

      success: false,

      error: {

        message:
          error?.message ||
          'Unable to generate D12 chart.'

      }

    });

  }

}


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {

  getD12Chart,

  getD12FromPlanetLongitudes,

  extractD1Longitudes

};