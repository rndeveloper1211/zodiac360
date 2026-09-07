/**
 * ============================================================
 * D16 SERVICE
 * ============================================================
 *
 * Flow:
 *
 * D1 Exact Longitudes
 *        ↓
 * D16 Calculation
 *        ↓
 * D16 Interpretation
 *        ↓
 * D1 + D16 Cross Confirmation
 *
 * IMPORTANT:
 * D16 planetary positions independently calculate nahi karta.
 * D1 ki exact longitudes ko reuse karta hai.
 * ============================================================
 */

const { generateD16Chart } = require('./d16Engine');
const { interpretD16 } = require('./d16Interpreter');
const { analyzeD1D16CrossConfirmation } = require('./d16CrossConfirmation');
const { calculateVimshottariDasha, getCurrentDasha } = require('../D1/d1Dasha');
const D4Service = require('../D4/D4.service');

const REQUIRED_PLANETS = [
  'Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury',
  'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
];

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeLongitude(value) {
  let longitude = Number(value);

  if (!Number.isFinite(longitude)) {
    throw new Error(`Invalid longitude: ${value}`);
  }

  longitude = ((longitude % 360) + 360) % 360;

  return Number(longitude.toFixed(6));
}

function validatePlanetLongitudes(planetLongitudes) {
  if (!planetLongitudes || typeof planetLongitudes !== 'object') {
    throw new Error('planetLongitudes object is required.');
  }

  const normalized = {};

  for (const planet of REQUIRED_PLANETS) {
    if (
      planetLongitudes[planet] === undefined ||
      planetLongitudes[planet] === null
    ) {
      throw new Error(`Missing D1 longitude for ${planet}.`);
    }

    if (!isValidNumber(Number(planetLongitudes[planet]))) {
      throw new Error(`Invalid D1 longitude for ${planet}.`);
    }

    normalized[planet] = normalizeLongitude(planetLongitudes[planet]);
  }

  return normalized;
}

function calculateD16(planetLongitudes) {
  const normalized = validatePlanetLongitudes(planetLongitudes);
  return generateD16Chart(normalized);
}

/* ============================================================
 * AUTO DASHA (fallback when caller doesn't pass currentDashaLord)
 * ============================================================
 * d1Chart shapes vary across callers, so this reads Moon's
 * sidereal degree and the birth UTC timestamp tolerantly instead
 * of assuming one exact structure.
 */
function getMoonDegree(d1Chart) {
  const candidates = [
    d1Chart?.grahas?.Moon,
    d1Chart?.planets?.Moon,
    d1Chart?.planetaryPositions?.Moon,
    d1Chart?.data?.grahas?.Moon,
    d1Chart?.data?.planetaryPositions?.Moon
  ];
  for (const moon of candidates) {
    const deg = moon?.totalDegree ?? moon?.longitude ?? moon?.degree;
    if (typeof deg === 'number' && Number.isFinite(deg)) return deg;
  }
  return null;
}

function getBirthUtcIso(d1Chart) {
  const candidates = [
    d1Chart?.meta?.utcTimestamp,
    d1Chart?.data?.meta?.utcTimestamp,
    d1Chart?.meta?.inputDate,
    d1Chart?.data?.meta?.inputDate
  ];
  for (const value of candidates) {
    if (value && !isNaN(new Date(value).getTime())) return value;
  }
  return null;
}

function autoComputeDashaLord(d1Chart) {
  if (!d1Chart || typeof d1Chart !== 'object') return null;

  const moonDegree = getMoonDegree(d1Chart);
  const birthUtcIso = getBirthUtcIso(d1Chart);
  if (moonDegree === null || !birthUtcIso) return null;

  try {
    const vimDasha = calculateVimshottariDasha(new Date(birthUtcIso), moonDegree);
    const current = getCurrentDasha(vimDasha, new Date());
    return current?.current?.lord || null;
  } catch (error) {
    return null;
  }
}

/* ============================================================
 * AUTO D4 (fallback when caller doesn't pass d4Chart)
 * ============================================================
 * D4Service.getD4FromD1Data expects raw D1 data shaped like
 * { lagna, grahas, meta } (see D4/d4ChartEngine.js). If d1Chart
 * doesn't have that shape (e.g. a minimal/partial object), this
 * fails safe and returns null rather than throwing — D4 just
 * stays unavailable in that case, same as if it were never sent.
 */
function autoComputeD4Chart(d1Chart) {
  if (!d1Chart || typeof d1Chart !== 'object') return null;
  if (!d1Chart.lagna || !d1Chart.grahas) return null;

  try {
    return D4Service.getD4FromD1Data(d1Chart);
  } catch (error) {
    return null;
  }
}

/**
 * ============================================================
 * FULL D16 PROCESS
 * ============================================================
 */
function processD16Chart(options) {
  options = options || {};

  const {
    planetLongitudes,
    currentDashaLord = null,
    d1Chart = null,
    d4Chart = null
  } = options;

  const normalizedLongitudes = validatePlanetLongitudes(planetLongitudes);

  const chart = generateD16Chart(normalizedLongitudes);

  // Caller-supplied currentDashaLord always wins; only auto-compute
  // from d1Chart when the caller didn't explicitly provide one.
  const resolvedDashaLord =
    currentDashaLord || autoComputeDashaLord(d1Chart);

  const interpretation = interpretD16(chart, {
    currentDashaLord: resolvedDashaLord || null
  });

  let crossConfirmation = {
    available: false,
    message: 'D1 chart उपलब्ध नहीं है। इसलिए D1-D16 cross confirmation नहीं किया गया।'
  };

  if (d1Chart && typeof d1Chart === 'object') {
    // Caller-supplied d4Chart always wins; only auto-compute from
    // d1Chart when the caller didn't explicitly provide one.
    const resolvedD4Chart =
      (d4Chart && typeof d4Chart === 'object' ? d4Chart : null) ||
      autoComputeD4Chart(d1Chart);

    crossConfirmation = analyzeD1D16CrossConfirmation(
      d1Chart,
      {
        ...chart,
        interpretation: interpretation?.interpretation || [],
        simpleSummary: interpretation?.simpleSummary || [],
        detailedBreakdown: interpretation?.detailedBreakdown || {}
      },
      resolvedD4Chart
    );
  }

  const chartInfo = {
    name: 'D16 - Shodashamsha',
    purpose:
      'Vehicles (vahana sukha), comforts, luxuries and mental/emotional happiness',
    calculationSystem: 'Parashari Shodashamsha',
    primaryAreas: [
      'Vehicles',
      'Comforts and luxuries',
      'Mental peace and happiness',
      'General sukha / well-being'
    ]
  };

  return {
    chartInfo,
    d16Ascendant: chart?.d16Ascendant || null,
    houses: chart?.houses || {},
    planetaryPositions: chart?.planetaryPositions || {},
    interpretation: interpretation?.interpretation || [],
    simpleSummary: interpretation?.simpleSummary || [],
    detailedBreakdown: interpretation?.detailedBreakdown || {},
    scores: interpretation?.scores || {},
    crossConfirmation
  };
}

function processD16FromLongitudes(planetLongitudes, currentDashaLord = null, d1Chart = null, d4Chart = null) {
  return processD16Chart({ planetLongitudes, currentDashaLord, d1Chart, d4Chart });
}

/**
 * Low-level function. No interpretation. No cross confirmation.
 */
function getD16Chart(planetLongitudes) {
  const normalized = validatePlanetLongitudes(planetLongitudes);
  return generateD16Chart(normalized);
}

module.exports = {
  processD16Chart,
  processD16FromLongitudes,
  calculateD16,
  getD16Chart,
  validatePlanetLongitudes,
  normalizeLongitude,
  REQUIRED_PLANETS
};