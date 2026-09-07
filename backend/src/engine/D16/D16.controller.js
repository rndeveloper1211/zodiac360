/**
 * ============================================================
 * D16 CONTROLLER
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
 * D16 Service
 *   ↓
 * D16 Engine
 *   ↓
 * D16 Interpreter
 *   ↓
 * D1 + D16 Cross Confirmation
 *   ↓
 * JSON
 * ============================================================
 *
 * NOTE:
 * This assumes the D16 folder sits at the same directory level
 * as the D12 folder (both siblings of a D1 folder), exactly like:
 *
 *   /charts
 *     /D1
 *     /D12
 *     /D16   <-- this folder
 *
 * If your project layout is different, update the require path
 * below (`../D1/D1.service`) to match.
 * ============================================================
 */

const D16Service = require('./D16.service');

const { generateD1Report } = require('../D1/D1.service');

/**
 * ============================================================
 * REQUEST HELPERS
 * ============================================================
 */
function getRequestValue(req, key) {
  if (req?.query && req.query[key] !== undefined) {
    return req.query[key];
  }

  if (req?.body && req.body[key] !== undefined) {
    return req.body[key];
  }

  return undefined;
}

function parseNumber(value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return number;
}

function validateDate(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('date must be in YYYY-MM-DD format.');
  }

  return date;
}

function validateTime(time) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('time must be in HH:MM format.');
  }

  const [hours, minutes] = time.split(':').map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time.');
  }

  return time;
}

/**
 * ============================================================
 * EXTRACT D1 LONGITUDES
 * ============================================================
 *
 * D16 planetary calculation independently nahi karta.
 * D1 ke exact totalDegree ko reuse karta hai.
 * ============================================================
 */
function extractD1Longitudes(rawD1) {
  if (!rawD1) {
    throw new Error('D1 report was not generated.');
  }

  const longitudes = {};

  const ascendant = rawD1?.lagna;

  if (!ascendant || !Number.isFinite(Number(ascendant.totalDegree))) {
    throw new Error('D1 Ascendant totalDegree is missing.');
  }

  longitudes.Ascendant = Number(ascendant.totalDegree);

  const requiredPlanets = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  for (const planet of requiredPlanets) {
    const data = rawD1?.grahas?.[planet];

    if (!data || !Number.isFinite(Number(data.totalDegree))) {
      throw new Error(`D1 ${planet} totalDegree is missing.`);
    }

    longitudes[planet] = Number(data.totalDegree);
  }

  return longitudes;
}

/**
 * ============================================================
 * GET / POST D16 CHART
 * ============================================================
 */
async function getD16Chart(req, res) {
  try {
    const date = getRequestValue(req, 'date');
    const time = getRequestValue(req, 'time');
    const lat = getRequestValue(req, 'lat');
    const lon = getRequestValue(req, 'lon');
    const timezone = getRequestValue(req, 'timezone');
    const currentDashaLord = getRequestValue(req, 'currentDashaLord');

    validateDate(date);
    validateTime(time);

    const latitude = parseNumber(lat, 'lat');
    const longitude = parseNumber(lon, 'lon');

    const timezoneOffset =
      timezone === undefined || timezone === null || timezone === ''
        ? 5.5
        : parseNumber(timezone, 'timezone');

    if (latitude < -90 || latitude > 90) {
      throw new Error('lat must be between -90 and 90.');
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('lon must be between -180 and 180.');
    }

    const rawD1 = generateD1Report({
      date,
      time,
      lat: latitude,
      lon: longitude,
      timezone: timezoneOffset
    });

    const d1Longitudes = extractD1Longitudes(rawD1);

    const result = D16Service.processD16Chart({
      planetLongitudes: d1Longitudes,
      currentDashaLord: currentDashaLord || null,
      d1Chart: rawD1
    });

    return res.json({
      success: true,
      data: {
        input: {
          date,
          time,
          lat: latitude,
          lon: longitude,
          timezone: timezoneOffset
        },
        source: {
          chart: 'D1',
          divisionalChart: 'D16',
          calculationSystem: 'Parashari Shodashamsha'
        },
        d1LongitudesUsed: d1Longitudes,
        ...result
      }
    });
  } catch (error) {
    console.error('D16 Controller Error:', error);

    return res.status(400).json({
      success: false,
      error: {
        message: error?.message || 'Unable to generate D16 chart.'
      }
    });
  }
}

/**
 * ============================================================
 * POST /from-longitudes
 * ============================================================
 *
 * Body:
 * {
 *   "planetLongitudes": { "Ascendant": ..., "Sun": ..., ... },
 *   "currentDashaLord": "Sun",
 *   "d1Chart": {}
 * }
 * ============================================================
 */
async function getD16FromPlanetLongitudes(req, res) {
  try {
    const body = req?.body || {};

    const planetLongitudes = body.planetLongitudes;
    const d1Chart = body.d1Chart || null;
    const currentDashaLord = body.currentDashaLord || null;

    const result = D16Service.processD16Chart({
      planetLongitudes,
      currentDashaLord,
      d1Chart
    });

    return res.json({
      success: true,
      data: {
        source: {
          chart: 'D1',
          divisionalChart: 'D16',
          calculationSystem: 'Parashari Shodashamsha'
        },
        d1LongitudesUsed: D16Service.validatePlanetLongitudes(planetLongitudes),
        ...result
      }
    });
  } catch (error) {
    console.error('D16 From Longitudes Error:', error);

    return res.status(400).json({
      success: false,
      error: {
        message: error?.message || 'Unable to generate D16 chart.'
      }
    });
  }
}

module.exports = {
  getD16Chart,
  getD16FromPlanetLongitudes,
  extractD1Longitudes
};
