/**
 * ============================================================
 * D20 SERVICE
 * ============================================================
 *
 * Flow:
 *
 * D1 Exact Longitudes
 *        ↓
 * D20 Calculation
 *        ↓
 * D20 Interpretation
 *        ↓
 * D1 + D20 Cross Confirmation
 *
 * IMPORTANT:
 * D20 planetary positions independently calculate nahi karta.
 * D1 ki exact longitudes ko reuse karta hai.
 * ============================================================
 */

const { generateD20Chart } = require('./d20Engine');
const { interpretD20 } = require('./d20Interpreter');
const { analyzeD1D20CrossConfirmation } = require('./d20CrossConfirmation');
const { calculateVimshottariDasha, getCurrentDasha } = require('../D1/d1Dasha');

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

function calculateD20(planetLongitudes) {
  const normalized = validatePlanetLongitudes(planetLongitudes);
  return generateD20Chart(normalized);
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

/**
 * ============================================================
 * FULL D20 PROCESS
 * ============================================================
 */
function processD20Chart(options) {
  options = options || {};

  const {
    planetLongitudes,
    currentDashaLord = null,
    d1Chart = null
  } = options;

  const normalizedLongitudes = validatePlanetLongitudes(planetLongitudes);

  const chart = generateD20Chart(normalizedLongitudes);

  // Caller-supplied currentDashaLord always wins; only auto-compute
  // from d1Chart when the caller didn't explicitly provide one.
  const resolvedDashaLord =
    currentDashaLord || autoComputeDashaLord(d1Chart);

  const interpretation = interpretD20(chart, {
    currentDashaLord: resolvedDashaLord || null
  });

  let crossConfirmation = {
    available: false,
    message: 'D1 chart उपलब्ध नहीं है। इसलिए D1-D20 cross confirmation नहीं किया गया।'
  };

  if (d1Chart && typeof d1Chart === 'object') {
    crossConfirmation = analyzeD1D20CrossConfirmation(
      d1Chart,
      {
        ...chart,
        interpretation: interpretation?.interpretation || [],
        simpleSummary: interpretation?.simpleSummary || [],
        detailedBreakdown: interpretation?.detailedBreakdown || {}
      }
    );
  }

  const chartInfo = {
    name: 'D20 - Vimshamsha',
    purpose:
      'Sadhana, purva punya, dharma, guru, diksha and worship style (upasana)',
    calculationSystem: 'Parashari Vimshamsha',
    primaryAreas: [
      'Sadhana and purva punya',
      'Dharma and guru',
      'Diksha (initiation)',
      'Ishta devata / worship style',
      'Overall spiritual bent'
    ]
  };

  return {
    chartInfo,
    d20Ascendant: chart?.d20Ascendant || null,
    houses: chart?.houses || {},
    planetaryPositions: chart?.planetaryPositions || {},
    interpretation: interpretation?.interpretation || [],
    simpleSummary: interpretation?.simpleSummary || [],
    detailedBreakdown: interpretation?.detailedBreakdown || {},
    scores: interpretation?.scores || {},
    crossConfirmation
  };
}

function processD20FromLongitudes(planetLongitudes, currentDashaLord = null, d1Chart = null) {
  return processD20Chart({ planetLongitudes, currentDashaLord, d1Chart });
}

/**
 * Low-level function. No interpretation. No cross confirmation.
 */
function getD20Chart(planetLongitudes) {
  const normalized = validatePlanetLongitudes(planetLongitudes);
  return generateD20Chart(normalized);
}

module.exports = {
  processD20Chart,
  processD20FromLongitudes,
  calculateD20,
  getD20Chart,
  validatePlanetLongitudes,
  normalizeLongitude,
  REQUIRED_PLANETS
};
