/**
 * ============================================================
 * D16 CROSS CONFIRMATION ENGINE
 * ============================================================
 *
 * Purpose:
 * - D1 + D16 cross confirmation
 * - Vehicles (vahana sukha)
 * - Mental peace / happiness
 * - Overall sukha
 *
 * IMPORTANT:
 * - D1 is the primary chart.
 * - D16 is the supporting chart.
 * - D16 alone never confirms a vehicle purchase or comfort event.
 * - D1 house data may be missing, so Whole Sign houses are
 *   derived from D1 Lagna when necessary.
 * ============================================================
 */

const SIGN_NAMES = [
  null, 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_HINDI = [
  null, 'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'
];

const SIGN_LORDS = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

/* ============================================================
 * BASIC HELPERS
 * ============================================================
 */
function isValidNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeSignId(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 12) return null;
  return Math.floor(n);
}

function normalizeLongitude(value) {
  if (!isValidNumber(value)) return null;
  let longitude = Number(value);
  return ((longitude % 360) + 360) % 360;
}

function signFromLongitude(longitude) {
  const lon = normalizeLongitude(longitude);
  if (lon === null) return null;
  return Math.floor(lon / 30) + 1;
}

function houseFromSigns(lagnaSignId, planetSignId) {
  const lagna = normalizeSignId(lagnaSignId);
  const planet = normalizeSignId(planetSignId);
  if (!lagna || !planet) return null;
  return ((planet - lagna + 12) % 12) + 1;
}

function getSignName(signId) {
  return SIGN_NAMES[normalizeSignId(signId)] || null;
}

function getSignHindi(signId) {
  return SIGN_HINDI[normalizeSignId(signId)] || null;
}

function getSignLord(signId) {
  return SIGN_LORDS[normalizeSignId(signId)] || null;
}

/* ============================================================
 * GENERIC NESTED OBJECT HELPERS (tolerant of varying D1 shapes)
 * ============================================================
 */
function getPossibleRoots(chart) {
  if (!chart || typeof chart !== 'object') return [];
  const roots = [chart];
  if (chart.chart && typeof chart.chart === 'object') roots.push(chart.chart);
  if (chart.data && typeof chart.data === 'object') roots.push(chart.data);
  if (chart.data?.chart && typeof chart.data.chart === 'object') {
    roots.push(chart.data.chart);
  }
  return roots;
}

function getLagnaObject(chart) {
  const roots = getPossibleRoots(chart);
  for (const root of roots) {
    if (root.lagna && typeof root.lagna === 'object') return root.lagna;
    if (root.ascendant && typeof root.ascendant === 'object') return root.ascendant;
    if (root.ascendantData && typeof root.ascendantData === 'object') return root.ascendantData;
  }
  return null;
}

function getLagnaSign(chart) {
  const lagna = getLagnaObject(chart);

  if (lagna) {
    const directSign =
      normalizeSignId(lagna.signId) ||
      normalizeSignId(lagna.rashiId) ||
      normalizeSignId(lagna.signNumber);

    if (directSign) return directSign;

    const signName = lagna.sign || lagna.signName || lagna.rashi;
    if (signName) {
      const found = SIGN_NAMES.findIndex(
        n => n && n.toLowerCase() === String(signName).toLowerCase()
      );
      if (found > 0) return found;
    }

    const longitude =
      lagna.totalDegree ?? lagna.longitude ?? lagna.absoluteLongitude ?? lagna.degree;

    const derived = signFromLongitude(longitude);
    if (derived) return derived;
  }

  for (const root of getPossibleRoots(chart)) {
    const longitude = root.lagnaLongitude ?? root.ascendantLongitude;
    const derived = signFromLongitude(longitude);
    if (derived) return derived;
  }

  return null;
}

function getPlanetaryContainer(chart) {
  const roots = getPossibleRoots(chart);
  for (const root of roots) {
    if (root.planetaryPositions && typeof root.planetaryPositions === 'object') {
      return root.planetaryPositions;
    }
    if (root.planets && typeof root.planets === 'object' && !Array.isArray(root.planets)) {
      return root.planets;
    }
    if (root.grahas && typeof root.grahas === 'object' && !Array.isArray(root.grahas)) {
      return root.grahas;
    }
  }
  return {};
}

function getPlanetObject(chart, planet) {
  const container = getPlanetaryContainer(chart);
  return container?.[planet] || null;
}

function getPlanetSign(chart, planet) {
  const obj = getPlanetObject(chart, planet);
  if (!obj) return null;

  const directSign =
    normalizeSignId(obj.signId) ||
    normalizeSignId(obj.rashiId) ||
    normalizeSignId(obj.d1SignId);

  if (directSign) return directSign;

  const signName = obj.sign || obj.signName || obj.d1Sign || obj.rashi;
  if (signName) {
    const found = SIGN_NAMES.findIndex(
      n => n && n.toLowerCase() === String(signName).toLowerCase()
    );
    if (found > 0) return found;
  }

  const longitude = obj.totalDegree ?? obj.longitude ?? obj.degree;
  return signFromLongitude(longitude);
}

function getPlanetHouse(chart, lagnaSignId, planet) {
  const planetSign = getPlanetSign(chart, planet);
  return houseFromSigns(lagnaSignId, planetSign);
}

function getHouse(chart, lagnaSignId, houseNumber) {
  const signId = ((lagnaSignId - 1 + houseNumber - 1) % 12) + 1;
  return {
    house: houseNumber,
    signId,
    sign: getSignName(signId),
    signHindi: getSignHindi(signId),
    lord: getSignLord(signId)
  };
}

/* ============================================================
 * D1 VEHICLES (4th house)
 * ============================================================
 */
function analyzeD1Vehicles(d1Chart, lagnaSignId) {
  const fourthHouse = getHouse(d1Chart, lagnaSignId, 4);
  const fourthLord = fourthHouse.lord;
  const fourthLordHouse = getPlanetHouse(d1Chart, lagnaSignId, fourthLord);

  const occupantsInFourth = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
    .filter(p => getPlanetHouse(d1Chart, lagnaSignId, p) === 4);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (occupantsInFourth.includes('Venus')) {
    score += 2;
    positiveFactors.push('D1 4th house में Venus');
  }
  if (occupantsInFourth.includes('Mars')) {
    score += 1;
    positiveFactors.push('D1 4th house में Mars');
  }
  const nodesInFourth = occupantsInFourth.filter(p => p === 'Rahu' || p === 'Ketu');
  if (nodesInFourth.length > 0) {
    score -= 2;
    challengeFactors.push(`D1 4th house में ${nodesInFourth.join('/')} का challenging प्रभाव`);
  }
  if (occupantsInFourth.includes('Saturn')) {
    score -= 1;
    challengeFactors.push('D1 4th house में Saturn (delay)');
  }
  if ([1, 5, 9, 10, 11].includes(fourthLordHouse)) {
    score += 2;
    positiveFactors.push(`D1 4th lord ${fourthLord} supportive house ${fourthLordHouse} में`);
  }
  if ([6, 8, 12].includes(fourthLordHouse)) {
    score -= 2;
    challengeFactors.push(`D1 4th lord ${fourthLord} ${fourthLordHouse}वें भाव में`);
  }

  let status = 'mixed';
  if (positiveFactors.length > 0 && challengeFactors.length === 0) status = 'supportive';
  if (challengeFactors.length > 0 && positiveFactors.length === 0) status = 'challenging';

  return {
    fourthHouse,
    fourthLord,
    fourthLordHouse,
    occupants: occupantsInFourth,
    score,
    positiveFactors,
    challengeFactors,
    status,
    confidence: occupantsInFourth.length > 0 ? 'high' : 'low'
  };
}

/* ============================================================
 * D4 VEHICLES (optional third source)
 * ============================================================
 * D4 (Chaturthamsha) already computes a 0-100 vehicle/comfort
 * score in d4AdvancedRules.js::analyzeVehicleAndComforts, surfaced
 * at d4Chart.analysis.advancedD4Insights.vehicleAndComforts.
 * That scale doesn't match D1/D16's small +/- scale, so it's
 * normalized here before blending in.
 */
function getD4VehicleInsights(d4Chart) {
  const insights =
    d4Chart?.analysis?.advancedD4Insights?.vehicleAndComforts ||
    d4Chart?.data?.analysis?.advancedD4Insights?.vehicleAndComforts ||
    null;

  if (!insights || !isValidNumber(insights.score)) return null;

  const rawScore = Number(insights.score);
  let normalizedScore = -2;
  if (rawScore >= 75) normalizedScore = 2;
  else if (rawScore >= 55) normalizedScore = 1;
  else if (rawScore >= 40) normalizedScore = 0;

  return {
    rawScore,
    normalizedScore,
    comfortLevel: insights.comfortLevel || null,
    positiveFactors: insights.supportingFactors || [],
    challengeFactors: insights.cautionFactors || [],
    summary: insights.summary || null
  };
}

/* ============================================================
 * D16 BREAKDOWN EXTRACTION
 * ============================================================
 */
function getD16Breakdown(d16Chart) {
  const detailed = d16Chart?.detailedBreakdown || d16Chart?.data?.detailedBreakdown || {};
  return {
    vehicles: detailed.vehicles || null,
    comforts: detailed.comforts || null,
    mentalPeace: detailed.mentalPeace || null,
    overallSukha: detailed.overallSukha || null
  };
}

/* ============================================================
 * CROSS: VEHICLES
 * ============================================================
 */
function crossVehicles(d1Vehicles, d16Vehicles, d4Vehicles) {
  const d1Score = d1Vehicles?.score || 0;
  const d16Score = d16Vehicles?.score || 0;
  const d4Score = d4Vehicles?.normalizedScore || 0;
  const sourcesUsed = 2 + (d4Vehicles ? 1 : 0);
  const combinedScore = d1Score + d16Score + d4Score;

  // Thresholds scale with how many sources actually contributed,
  // so adding D4 doesn't silently make "supportive"/"challenging" harder to reach.
  const supportiveThreshold = sourcesUsed === 3 ? 4 : 3;
  const challengingThreshold = -supportiveThreshold;

  let status = 'mixed';
  if (combinedScore >= supportiveThreshold) status = 'supportive';
  if (combinedScore <= challengingThreshold) status = 'challenging';

  const positiveFactors = [
    ...(d1Vehicles?.positiveFactors || []).map(f => `D1: ${f}`),
    ...(d16Vehicles?.positiveFactors || []).map(f => `D16: ${f}`),
    ...(d4Vehicles?.positiveFactors || []).map(f => `D4: ${f}`)
  ];

  const challengeFactors = [
    ...(d1Vehicles?.challengeFactors || []).map(f => `D1: ${f}`),
    ...(d16Vehicles?.challengeFactors || []).map(f => `D16: ${f}`),
    ...(d4Vehicles?.challengeFactors || []).map(f => `D4: ${f}`)
  ];

  const chartsUsed = d4Vehicles ? 'D1, D16 और D4' : 'D1 और D16';

  return {
    d1Score,
    d16Score,
    d4Score: d4Vehicles ? d4Score : undefined,
    d4RawScore: d4Vehicles ? d4Vehicles.rawScore : undefined,
    combinedScore,
    status,
    confidence: d1Vehicles?.confidence || 'moderate',
    positiveFactors,
    challengeFactors,
    summary: `${chartsUsed} को मिलाकर वाहन सुख के क्षेत्र में संकेत ${status} हैं।`
  };
}

/* ============================================================
 * MAIN FUNCTION
 * ============================================================
 */
function analyzeD1D16CrossConfirmation(d1Chart, d16Chart, d4Chart = null) {
  if (!d1Chart) {
    return { available: false, message: 'D1 chart उपलब्ध नहीं है।' };
  }
  if (!d16Chart) {
    return { available: false, message: 'D16 chart उपलब्ध नहीं है।' };
  }

  const lagnaSignId = getLagnaSign(d1Chart);

  if (!lagnaSignId) {
    return { available: false, message: 'D1 Lagna sign identify नहीं हो पाया।' };
  }

  const d1Vehicles = analyzeD1Vehicles(d1Chart, lagnaSignId);
  const breakdown = getD16Breakdown(d16Chart);
  const d16Vehicles = breakdown.vehicles || null;
  const d4Vehicles = d4Chart ? getD4VehicleInsights(d4Chart) : null;

  const vehicles = crossVehicles(d1Vehicles, d16Vehicles, d4Vehicles);

  const overallScore = vehicles.combinedScore + (breakdown.mentalPeace?.score || 0);

  let overallLevel = 'mixed';
  if (overallScore >= 4) overallLevel = 'supportive';
  if (overallScore <= -4) overallLevel = 'challenging';

  return {
    available: true,

    methodology: {
      primaryChart: 'D1',
      supportingChart: d4Vehicles ? 'D16 और D4' : 'D16',
      houseSystem: 'Whole Sign fallback when D1 house data is unavailable',
      purpose: d4Vehicles
        ? 'D1, D16 और D4 के vehicle/comfort indicators का cross-confirmation'
        : 'D1 और D16 के vehicle/comfort indicators का cross-confirmation',
      note: 'यह traditional Vedic astrology interpretation है। इसे निश्चित वैज्ञानिक प्रमाण या absolute prediction नहीं माना जाना चाहिए।'
    },

    d1Reference: {
      lagna: {
        signId: lagnaSignId,
        sign: getSignName(lagnaSignId),
        signHindi: getSignHindi(lagnaSignId)
      },
      fourthHouse: d1Vehicles.fourthHouse
    },

    vehicles: {
      d1: {
        fourthHouse: d1Vehicles.fourthHouse,
        fourthLord: d1Vehicles.fourthLord,
        fourthLordHouse: d1Vehicles.fourthLordHouse,
        score: d1Vehicles.score,
        positiveFactors: d1Vehicles.positiveFactors,
        challengeFactors: d1Vehicles.challengeFactors,
        status: d1Vehicles.status,
        confidence: d1Vehicles.confidence
      },
      d16: d16Vehicles
        ? {
            house: d16Vehicles.house,
            signId: d16Vehicles.signId,
            sign: d16Vehicles.sign,
            signHindi: d16Vehicles.signHindi,
            lord: d16Vehicles.lord,
            lordPlacementHouse: d16Vehicles.lordPlacementHouse,
            score: d16Vehicles.score,
            strength: d16Vehicles.strength,
            overall: d16Vehicles.overall
          }
        : null,
      d4: d4Vehicles
        ? {
            score: d4Vehicles.rawScore,
            normalizedScore: d4Vehicles.normalizedScore,
            comfortLevel: d4Vehicles.comfortLevel,
            positiveFactors: d4Vehicles.positiveFactors,
            challengeFactors: d4Vehicles.challengeFactors,
            summary: d4Vehicles.summary
          }
        : null,
      crossConfirmation: vehicles
    },

    overallSukha: {
      score: overallScore,
      level: overallLevel,
      summary: d4Vehicles
        ? `D1, D16 और D4 के combined संकेतों में overall vehicle/comfort sukha: ${overallLevel}.`
        : `D1 और D16 के combined संकेतों में overall vehicle/comfort sukha: ${overallLevel}.`
    },

    scores: {
      vehicles: vehicles.combinedScore,
      overallSukha: overallScore
    }
  };
}

module.exports = {
  analyzeD1D16CrossConfirmation,
  getLagnaSign,
  getPlanetSign,
  getPlanetHouse,
  getHouse,
  houseFromSigns
};