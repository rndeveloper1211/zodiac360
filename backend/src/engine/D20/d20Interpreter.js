/**
 * ============================================================
 * D20 INTERPRETER
 * ============================================================
 *
 * Purpose:
 * - Sadhana / purva punya (past-life merit)   -> 5th house
 * - Dharma / guru / diksha                    -> 9th house
 * - Ishta devata / worship style               -> Jupiter placement
 * - Overall spiritual bent                     -> combined
 * - Dasha based D20 activation
 *
 * IMPORTANT:
 * D20 alone does NOT guarantee a spiritual event, guru meeting,
 * or diksha. It must be read together with D1 (Rashi chart),
 * especially the 5th and 9th houses (dharma trikona).
 * ============================================================
 */

const {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D20
} = require('./d20Rules');

function getHouse(chart, house) {
  return chart?.houses?.[String(house)] || null;
}

function getOccupants(chart, house) {
  return getHouse(chart, house)?.occupants || [];
}

function getPlanet(chart, planet) {
  return chart?.planetaryPositions?.[planet] || null;
}

function getPlanetHouse(chart, planet) {
  const position = getPlanet(chart, planet);

  if (!position?.signId) {
    return null;
  }

  const ascendantSign = chart?.d20Ascendant?.signId;

  if (!ascendantSign) {
    return null;
  }

  return ((position.signId - ascendantSign + 12) % 12) + 1;
}

function getHouseLordHouse(chart, house) {
  const houseData = getHouse(chart, house);

  if (!houseData?.lord) {
    return null;
  }

  return getPlanetHouse(chart, houseData.lord);
}

function getConjunctions(chart, planet) {
  const house = getPlanetHouse(chart, planet);

  if (!house) {
    return [];
  }

  return getOccupants(chart, house)
    .map(item => item.planet)
    .filter(item => item !== planet);
}

function hasPlanetInHouse(chart, planet, house) {
  return getPlanetHouse(chart, planet) === house;
}

function getStrength(score) {
  const abs = Math.abs(score);

  if (abs >= 4) {
    return 'strong';
  }

  if (abs >= 2) {
    return 'moderate';
  }

  return 'mild';
}

/**
 * If both positive and challenge factors exist, overall = mixed.
 */
function resolveOverall({ score, positiveFactors = [], challengeFactors = [] }) {
  if (positiveFactors.length > 0 && challengeFactors.length > 0) {
    return 'mixed';
  }

  if (score > 0) {
    return 'supportive';
  }

  if (score < 0) {
    return 'challenging';
  }

  return 'mixed';
}

/**
 * ============================================================
 * SADHANA / PURVA PUNYA (5th house of D20)
 * ============================================================
 */
function analyzeSadhana(chart) {
  const house = 5;
  const houseData = getHouse(chart, house);

  const lord = houseData?.lord || null;
  const lordPlacementHouse = getHouseLordHouse(chart, house);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (hasPlanetInHouse(chart, 'Jupiter', house)) {
    score += 3;
    positiveFactors.push('5th house में Jupiter (strong sadhana / purva punya)');
  }

  if (hasPlanetInHouse(chart, 'Ketu', house)) {
    score += 2;
    positiveFactors.push('5th house में Ketu (moksha-oriented purva punya)');
  }

  if (hasPlanetInHouse(chart, 'Venus', house)) {
    score += 1;
    positiveFactors.push('5th house में Venus (bhakti/rasa-based sadhana)');
  }

  if (hasPlanetInHouse(chart, 'Saturn', house)) {
    score -= 1;
    challengeFactors.push('5th house में Saturn (sadhana में delay या discipline की ज़रूरत)');
  }

  if (hasPlanetInHouse(chart, 'Rahu', house)) {
    score -= 2;
    challengeFactors.push('5th house में Rahu (unconventional या restless sadhana)');
  }

  if (hasPlanetInHouse(chart, 'Mars', house)) {
    score -= 1;
    challengeFactors.push('5th house में Mars (impatience in sadhana)');
  }

  if ([1, 5, 9, 10, 11].includes(lordPlacementHouse)) {
    score += 2;
    positiveFactors.push(`5th lord ${lord} supportive house में`);
  }

  if ([6, 8, 12].includes(lordPlacementHouse)) {
    score -= 2;
    challengeFactors.push(`5th lord ${lord} ${lordPlacementHouse}वें भाव में`);
  }

  const overall = resolveOverall({ score, positiveFactors, challengeFactors });

  return {
    house,
    signId: houseData?.signId || null,
    sign: houseData?.signName || null,
    signHindi: houseData?.signHindi || null,
    lord,
    lordPlacementHouse,
    score,
    strength: getStrength(score),
    positiveFactors,
    challengeFactors,
    overall,
    theme: HOUSE_THEMES_D20[5]?.theme || 'Sadhana & Purva Punya',
    summary:
      overall === 'supportive'
        ? 'साधना और पूर्व पुण्य से जुड़े D20 संकेत supportive दिखाई देते हैं।'
        : overall === 'mixed'
          ? 'साधना और पूर्व पुण्य से जुड़े D20 संकेत mixed हैं।'
          : 'साधना में D20 के अनुसार कुछ बाधाओं या discipline की ज़रूरत के संकेत हैं।'
  };
}

/**
 * ============================================================
 * DHARMA / GURU / DIKSHA (9th house of D20)
 * ============================================================
 */
function analyzeDharmaGuru(chart) {
  const house = 9;
  const houseData = getHouse(chart, house);

  const lord = houseData?.lord || null;
  const lordPlacementHouse = getHouseLordHouse(chart, house);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (hasPlanetInHouse(chart, 'Jupiter', house)) {
    score += 3;
    positiveFactors.push('9th house में Jupiter (guru कृपा, strong dharma)');
  }

  if (hasPlanetInHouse(chart, 'Sun', house)) {
    score += 1;
    positiveFactors.push('9th house में Sun (dharma में confidence, guide/authority का साथ)');
  }

  if (hasPlanetInHouse(chart, 'Venus', house)) {
    score += 1;
    positiveFactors.push('9th house में Venus (ritualistic/aesthetic dharma)');
  }

  if (hasPlanetInHouse(chart, 'Saturn', house)) {
    score -= 1;
    challengeFactors.push('9th house में Saturn (dharma में देरी/discipline)');
  }

  if (hasPlanetInHouse(chart, 'Rahu', house)) {
    score -= 2;
    challengeFactors.push('9th house में Rahu (unorthodox या foreign dharma path)');
  }

  if (hasPlanetInHouse(chart, 'Ketu', house)) {
    score -= 1;
    challengeFactors.push('9th house में Ketu (traditional guru से detachment, पर moksha की ओर झुकाव)');
  }

  if ([1, 5, 9, 10, 11].includes(lordPlacementHouse)) {
    score += 2;
    positiveFactors.push(`9th lord ${lord} supportive house में`);
  }

  if ([6, 8, 12].includes(lordPlacementHouse)) {
    score -= 2;
    challengeFactors.push(`9th lord ${lord} ${lordPlacementHouse}वें भाव में`);
  }

  const overall = resolveOverall({ score, positiveFactors, challengeFactors });

  return {
    house,
    signId: houseData?.signId || null,
    sign: houseData?.signName || null,
    signHindi: houseData?.signHindi || null,
    lord,
    lordPlacementHouse,
    score,
    strength: getStrength(score),
    positiveFactors,
    challengeFactors,
    overall,
    theme: HOUSE_THEMES_D20[9]?.theme || 'Dharma & Guru',
    summary:
      overall === 'supportive'
        ? 'धर्म, गुरु और दीक्षा से जुड़े D20 संकेत supportive हैं।'
        : overall === 'mixed'
          ? 'धर्म और गुरु से जुड़े D20 संकेत mixed हैं।'
          : 'धर्म-मार्ग में D20 के अनुसार कुछ चुनौतियाँ दिखती हैं।'
  };
}

/**
 * ============================================================
 * ISHTA DEVATA / WORSHIP STYLE (Jupiter placement in D20)
 * ============================================================
 */
function analyzeWorshipStyle(chart) {
  const jupiterHouse = getPlanetHouse(chart, 'Jupiter');
  const jupiter = getPlanet(chart, 'Jupiter');
  const jupiterConjunctions = getConjunctions(chart, 'Jupiter');

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if ([1, 5, 9, 10, 11].includes(jupiterHouse)) {
    score += 2;
    positiveFactors.push(`गुरु (Jupiter) ${jupiterHouse}वें भाव में (supportive)`);
  }

  if ([6, 8, 12].includes(jupiterHouse)) {
    score -= 2;
    challengeFactors.push(`गुरु (Jupiter) ${jupiterHouse}वें भाव में (challenging)`);
  }

  if (
    jupiterConjunctions.includes('Venus') ||
    jupiterConjunctions.includes('Moon')
  ) {
    score += 2;
    positiveFactors.push('गुरु benefic ग्रह के साथ (bhakti-oriented worship)');
  }

  if (
    jupiterConjunctions.includes('Saturn') ||
    jupiterConjunctions.includes('Rahu') ||
    jupiterConjunctions.includes('Ketu')
  ) {
    score -= 1;
    challengeFactors.push(
      `गुरु-${jupiterConjunctions
        .filter(p => ['Saturn', 'Rahu', 'Ketu'].includes(p))
        .join('/')} युति (unconventional या disciplined worship style)`
    );
  }

  const overall = resolveOverall({ score, positiveFactors, challengeFactors });

  return {
    jupiterHouse,
    jupiterSign: jupiter?.signName || null,
    jupiterConjunctions,
    score,
    strength: getStrength(score),
    positiveFactors,
    challengeFactors,
    overall,
    theme: 'Ishta devata and worship style (D20 Jupiter)',
    summary:
      overall === 'supportive'
        ? 'इष्ट देवता और उपासना-शैली से जुड़े D20 संकेत supportive हैं।'
        : overall === 'mixed'
          ? 'उपासना-शैली से जुड़े D20 संकेत mixed हैं।'
          : 'उपासना-शैली में D20 के अनुसार कुछ चुनौतियाँ दिखती हैं।'
  };
}

/**
 * ============================================================
 * OVERALL SPIRITUAL BENT (combined)
 * ============================================================
 */
function analyzeOverallSpirituality(sadhana, dharmaGuru, worshipStyle) {
  const score =
    (sadhana?.score || 0) +
    (dharmaGuru?.score || 0) +
    (worshipStyle?.score || 0);

  const positiveFactors = [
    ...(sadhana?.positiveFactors || []),
    ...(dharmaGuru?.positiveFactors || []),
    ...(worshipStyle?.positiveFactors || [])
  ];

  const challengeFactors = [
    ...(sadhana?.challengeFactors || []),
    ...(dharmaGuru?.challengeFactors || []),
    ...(worshipStyle?.challengeFactors || [])
  ];

  let level = 'mixed';

  if (score >= 4) {
    level = 'supportive';
  } else if (score <= -4) {
    level = 'challenging';
  }

  return {
    score,
    level,
    sadhanaOverall: sadhana?.overall || 'mixed',
    dharmaGuruOverall: dharmaGuru?.overall || 'mixed',
    worshipStyleOverall: worshipStyle?.overall || 'mixed',
    positiveFactors,
    challengeFactors,
    summary: `साधना, धर्म-गुरु और उपासना-शैली को मिलाकर D20 के अनुसार overall spiritual bent: ${level}.`
  };
}

/**
 * ============================================================
 * DASHA TIMING
 * ============================================================
 */
function analyzeDasha(chart, currentDashaLord) {
  if (!currentDashaLord) {
    return {
      available: false,
      currentDashaLord: null,
      interpretation:
        'Dasha lord नहीं दिया गया है, इसलिए अभी केवल D20 की जन्म स्थिति बताई गई है।'
    };
  }

  const position = getPlanet(chart, currentDashaLord);
  const house = getPlanetHouse(chart, currentDashaLord);

  if (!position) {
    return {
      available: false,
      currentDashaLord,
      interpretation: `Dasha lord ${currentDashaLord} D20 में उपलब्ध नहीं है।`
    };
  }

  const planetData = PLANET_DATA[currentDashaLord] || {};

  return {
    available: true,
    currentDashaLord,
    house,
    sign: position.signName,
    signHindi: position.signHindi,
    degreeInSign: position.d20DegreeInSign,
    nature: planetData.nature || null,
    familyTheme: planetData.theme || null,
    interpretation: `${currentDashaLord} की Dasha के दौरान D20 से जुड़े ${planetData.theme || 'spiritual/dharma'} themes अधिक सक्रिय हो सकते हैं। यह timing indication है, final event prediction नहीं।`
  };
}

/**
 * ============================================================
 * MAIN INTERPRETER
 * ============================================================
 */
function interpretD20(chart, options) {
  options = options || {};

  const { currentDashaLord = null } = options;

  if (!chart) {
    throw new Error('D20 chart is required for interpretation.');
  }

  const sadhana = analyzeSadhana(chart);
  const dharmaGuru = analyzeDharmaGuru(chart);
  const worshipStyle = analyzeWorshipStyle(chart);
  const overallSpirituality = analyzeOverallSpirituality(sadhana, dharmaGuru, worshipStyle);
  const dashaAnalysis = analyzeDasha(chart, currentDashaLord);

  const lagna = chart?.d20Ascendant;

  const interpretation = [
    {
      area: 'D20 का सीधा मतलब',
      detail:
        'D20 मुख्य रूप से साधना, पूर्व पुण्य, धर्म, गुरु, दीक्षा और उपासना-शैली को समझने में मदद करता है। इसे अकेले किसी घटना का final proof नहीं माना जाना चाहिए।'
    },
    { area: 'Sadhana / Purva Punya (साधना)', detail: sadhana.summary },
    { area: 'Dharma / Guru (धर्म-गुरु)', detail: dharmaGuru.summary },
    { area: 'Worship Style (उपासना-शैली)', detail: worshipStyle.summary },
    { area: 'Overall Spiritual Bent', detail: overallSpirituality.summary },
    { area: 'Timing', detail: dashaAnalysis.interpretation }
  ];

  const simpleSummary = [
    `D20 लग्न ${lagna?.signName || 'अज्ञात'} है। यह व्यक्ति के overall spiritual bent की छाप को दर्शाता है।`,
    `साधना/पूर्व पुण्य के लिए D20 का 5वाँ भाव ${sadhana.sign || 'अज्ञात'} है। 5th lord ${sadhana.lord || 'अज्ञात'} ${sadhana.lordPlacementHouse || 'अज्ञात'}वें भाव में है। संकेत ${sadhana.overall} हैं।`,
    `धर्म और गुरु के लिए D20 का 9वाँ भाव ${dharmaGuru.sign || 'अज्ञात'} है। 9th lord ${dharmaGuru.lord || 'अज्ञात'} ${dharmaGuru.lordPlacementHouse || 'अज्ञात'}वें भाव में है। संकेत ${dharmaGuru.overall} हैं।`,
    `उपासना-शैली के लिए गुरु (Jupiter) D20 के ${worshipStyle.jupiterHouse || 'अज्ञात'}वें भाव में है। संकेत ${worshipStyle.overall} हैं।`,
    `कुल मिलाकर D20 के अनुसार overall spiritual bent: ${overallSpirituality.level}.`
  ];

  return {
    interpretation,
    simpleSummary,
    detailedBreakdown: {
      sadhana,
      dharmaGuru,
      worshipStyle,
      overallSpirituality,
      dashaAnalysis
    },
    scores: {
      sadhana: sadhana.score,
      dharmaGuru: dharmaGuru.score,
      worshipStyle: worshipStyle.score,
      overallSpirituality: overallSpirituality.score
    }
  };
}

module.exports = {
  resolveOverall,
  getStrength,
  analyzeSadhana,
  analyzeDharmaGuru,
  analyzeWorshipStyle,
  analyzeOverallSpirituality,
  analyzeDasha,
  interpretD20
};
