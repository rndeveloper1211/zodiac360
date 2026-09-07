/**
 * ============================================================
 * D20 CROSS CONFIRMATION ENGINE
 * ============================================================
 *
 * Purpose:
 * - D1 + D20 cross confirmation
 * - Dharma / guru (9th house)
 * - Sadhana / purva punya (5th house)
 * - Overall spiritual bent
 *
 * IMPORTANT:
 * - D1 is the primary chart.
 * - D20 is the supporting chart.
 * - D20 alone never confirms a guru meeting, diksha, or spiritual event.
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
 * D1 DHARMA (9th house)
 * ============================================================
 */
function analyzeD1DharmaGuru(d1Chart, lagnaSignId) {
  const ninthHouse = getHouse(d1Chart, lagnaSignId, 9);
  const ninthLord = ninthHouse.lord;
  const ninthLordHouse = getPlanetHouse(d1Chart, lagnaSignId, ninthLord);

  const occupantsInNinth = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
    .filter(p => getPlanetHouse(d1Chart, lagnaSignId, p) === 9);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (occupantsInNinth.includes('Jupiter')) {
    score += 3;
    positiveFactors.push('D1 9th house में Jupiter (strong dharma/guru योग)');
  }
  if (occupantsInNinth.includes('Sun')) {
    score += 1;
    positiveFactors.push('D1 9th house में Sun');
  }
  const nodesInNinth = occupantsInNinth.filter(p => p === 'Rahu' || p === 'Ketu');
  if (nodesInNinth.length > 0) {
    score -= 1;
    challengeFactors.push(`D1 9th house में ${nodesInNinth.join('/')} का unconventional प्रभाव`);
  }
  if (occupantsInNinth.includes('Saturn')) {
    score -= 1;
    challengeFactors.push('D1 9th house में Saturn (dharma में देरी/discipline)');
  }
  if ([1, 5, 9, 10, 11].includes(ninthLordHouse)) {
    score += 2;
    positiveFactors.push(`D1 9th lord ${ninthLord} supportive house ${ninthLordHouse} में`);
  }
  if ([6, 8, 12].includes(ninthLordHouse)) {
    score -= 2;
    challengeFactors.push(`D1 9th lord ${ninthLord} ${ninthLordHouse}वें भाव में`);
  }

  let status = 'mixed';
  if (positiveFactors.length > 0 && challengeFactors.length === 0) status = 'supportive';
  if (challengeFactors.length > 0 && positiveFactors.length === 0) status = 'challenging';

  return {
    ninthHouse,
    ninthLord,
    ninthLordHouse,
    occupants: occupantsInNinth,
    score,
    positiveFactors,
    challengeFactors,
    status,
    confidence: occupantsInNinth.length > 0 ? 'high' : 'low'
  };
}

/* ============================================================
 * D20 BREAKDOWN EXTRACTION
 * ============================================================
 */
function getD20Breakdown(d20Chart) {
  const detailed = d20Chart?.detailedBreakdown || d20Chart?.data?.detailedBreakdown || {};
  return {
    sadhana: detailed.sadhana || null,
    dharmaGuru: detailed.dharmaGuru || null,
    worshipStyle: detailed.worshipStyle || null,
    overallSpirituality: detailed.overallSpirituality || null
  };
}

/* ============================================================
 * CROSS: DHARMA / GURU
 * ============================================================
 */
function crossDharmaGuru(d1DharmaGuru, d20DharmaGuru) {
  const d1Score = d1DharmaGuru?.score || 0;
  const d20Score = d20DharmaGuru?.score || 0;
  const combinedScore = d1Score + d20Score;

  const supportiveThreshold = 3;
  const challengingThreshold = -supportiveThreshold;

  let status = 'mixed';
  if (combinedScore >= supportiveThreshold) status = 'supportive';
  if (combinedScore <= challengingThreshold) status = 'challenging';

  const positiveFactors = [
    ...(d1DharmaGuru?.positiveFactors || []).map(f => `D1: ${f}`),
    ...(d20DharmaGuru?.positiveFactors || []).map(f => `D20: ${f}`)
  ];

  const challengeFactors = [
    ...(d1DharmaGuru?.challengeFactors || []).map(f => `D1: ${f}`),
    ...(d20DharmaGuru?.challengeFactors || []).map(f => `D20: ${f}`)
  ];

  return {
    d1Score,
    d20Score,
    combinedScore,
    status,
    confidence: d1DharmaGuru?.confidence || 'moderate',
    positiveFactors,
    challengeFactors,
    summary: `D1 और D20 को मिलाकर धर्म-गुरु के क्षेत्र में संकेत ${status} हैं।`
  };
}

/* ============================================================
 * MAIN FUNCTION
 * ============================================================
 */
function analyzeD1D20CrossConfirmation(d1Chart, d20Chart) {
  if (!d1Chart) {
    return { available: false, message: 'D1 chart उपलब्ध नहीं है।' };
  }
  if (!d20Chart) {
    return { available: false, message: 'D20 chart उपलब्ध नहीं है।' };
  }

  const lagnaSignId = getLagnaSign(d1Chart);

  if (!lagnaSignId) {
    return { available: false, message: 'D1 Lagna sign identify नहीं हो पाया।' };
  }

  const d1DharmaGuru = analyzeD1DharmaGuru(d1Chart, lagnaSignId);
  const breakdown = getD20Breakdown(d20Chart);
  const d20DharmaGuru = breakdown.dharmaGuru || null;

  const dharmaGuru = crossDharmaGuru(d1DharmaGuru, d20DharmaGuru);

  const overallScore =
    dharmaGuru.combinedScore +
    (breakdown.sadhana?.score || 0) +
    (breakdown.worshipStyle?.score || 0);

  let overallLevel = 'mixed';
  if (overallScore >= 5) overallLevel = 'supportive';
  if (overallScore <= -5) overallLevel = 'challenging';

  return {
    available: true,

    methodology: {
      primaryChart: 'D1',
      supportingChart: 'D20',
      houseSystem: 'Whole Sign fallback when D1 house data is unavailable',
      purpose: 'D1 और D20 के dharma/spiritual indicators का cross-confirmation',
      note: 'यह traditional Vedic astrology interpretation है। इसे निश्चित वैज्ञानिक प्रमाण या absolute prediction नहीं माना जाना चाहिए।'
    },

    d1Reference: {
      lagna: {
        signId: lagnaSignId,
        sign: getSignName(lagnaSignId),
        signHindi: getSignHindi(lagnaSignId)
      },
      ninthHouse: d1DharmaGuru.ninthHouse
    },

    dharmaGuru: {
      d1: {
        ninthHouse: d1DharmaGuru.ninthHouse,
        ninthLord: d1DharmaGuru.ninthLord,
        ninthLordHouse: d1DharmaGuru.ninthLordHouse,
        score: d1DharmaGuru.score,
        positiveFactors: d1DharmaGuru.positiveFactors,
        challengeFactors: d1DharmaGuru.challengeFactors,
        status: d1DharmaGuru.status,
        confidence: d1DharmaGuru.confidence
      },
      d20: d20DharmaGuru
        ? {
            house: d20DharmaGuru.house,
            signId: d20DharmaGuru.signId,
            sign: d20DharmaGuru.sign,
            signHindi: d20DharmaGuru.signHindi,
            lord: d20DharmaGuru.lord,
            lordPlacementHouse: d20DharmaGuru.lordPlacementHouse,
            score: d20DharmaGuru.score,
            strength: d20DharmaGuru.strength,
            overall: d20DharmaGuru.overall
          }
        : null,
      crossConfirmation: dharmaGuru
    },

    overallSpirituality: {
      score: overallScore,
      level: overallLevel,
      summary: `D1 और D20 के combined संकेतों में overall spiritual bent: ${overallLevel}.`
    },

    scores: {
      dharmaGuru: dharmaGuru.combinedScore,
      overallSpirituality: overallScore
    }
  };
}

module.exports = {
  analyzeD1D20CrossConfirmation,
  getLagnaSign,
  getPlanetSign,
  getPlanetHouse,
  getHouse,
  houseFromSigns
};
