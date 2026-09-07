/**
 * ============================================================
 * D16 INTERPRETER
 * ============================================================
 *
 * Purpose:
 * - Vehicles (vahana sukha) -> 4th house
 * - General comforts / luxuries -> Lagna (1st house)
 * - Mental peace / happiness -> Moon placement
 * - Overall sukha -> combined
 * - Dasha based D16 activation
 *
 * IMPORTANT:
 * D16 alone does NOT guarantee a vehicle or comfort event.
 * It must be read together with D1 (Rashi chart).
 * ============================================================
 */

const {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D16
} = require('./d16Rules');

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

  const ascendantSign = chart?.d16Ascendant?.signId;

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
 * VEHICLES (4th house of D16)
 * ============================================================
 */
function analyzeVehicles(chart) {
  const house = 4;
  const houseData = getHouse(chart, house);

  const lord = houseData?.lord || null;
  const lordPlacementHouse = getHouseLordHouse(chart, house);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (hasPlanetInHouse(chart, 'Venus', house)) {
    score += 3;
    positiveFactors.push('4th house में Venus (luxury vehicle indicator)');
  }

  if (hasPlanetInHouse(chart, 'Mars', house)) {
    score += 2;
    positiveFactors.push('4th house में Mars (vehicle ownership drive)');
  }

  if (hasPlanetInHouse(chart, 'Jupiter', house)) {
    score += 2;
    positiveFactors.push('4th house में Jupiter');
  }

  if (hasPlanetInHouse(chart, 'Saturn', house)) {
    score -= 2;
    challengeFactors.push('4th house में Saturn (delay in vehicle sukha)');
  }

  if (hasPlanetInHouse(chart, 'Rahu', house)) {
    score -= 2;
    challengeFactors.push('4th house में Rahu (unusual vehicle situations)');
  }

  if (hasPlanetInHouse(chart, 'Ketu', house)) {
    score -= 3;
    challengeFactors.push('4th house में Ketu (detachment from vehicle comfort)');
  }

  if ([1, 5, 9, 10, 11].includes(lordPlacementHouse)) {
    score += 2;
    positiveFactors.push(`4th lord ${lord} supportive house में`);
  }

  if ([6, 8, 12].includes(lordPlacementHouse)) {
    score -= 2;
    challengeFactors.push(`4th lord ${lord} ${lordPlacementHouse}वें भाव में`);
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
    theme: HOUSE_THEMES_D16[4]?.theme || 'Vehicles & Home Comfort',
    summary:
      overall === 'supportive'
        ? 'वाहन सुख से जुड़े D16 संकेत supportive दिखाई देते हैं।'
        : overall === 'mixed'
          ? 'वाहन सुख से जुड़े D16 संकेत mixed हैं।'
          : 'वाहन सुख में D16 के अनुसार कुछ बाधाओं या देरी के संकेत हैं।'
  };
}

/**
 * ============================================================
 * GENERAL COMFORTS / LUXURIES (Lagna / 1st house of D16)
 * ============================================================
 */
function analyzeComforts(chart) {
  const house = 1;
  const houseData = getHouse(chart, house);

  const lagnaLord = houseData?.lord || null;
  const lagnaLordHouse = getHouseLordHouse(chart, house);

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if (hasPlanetInHouse(chart, 'Venus', house)) {
    score += 3;
    positiveFactors.push('D16 Lagna में Venus (comfort-loving nature)');
  }

  if (hasPlanetInHouse(chart, 'Jupiter', house)) {
    score += 2;
    positiveFactors.push('D16 Lagna में Jupiter');
  }

  if (hasPlanetInHouse(chart, 'Saturn', house)) {
    score -= 2;
    challengeFactors.push('D16 Lagna में Saturn (comfort में delay/discipline)');
  }

  if (hasPlanetInHouse(chart, 'Rahu', house)) {
    score -= 1;
    challengeFactors.push('D16 Lagna में Rahu');
  }

  if (hasPlanetInHouse(chart, 'Ketu', house)) {
    score -= 2;
    challengeFactors.push('D16 Lagna में Ketu (comforts से detachment)');
  }

  if ([1, 5, 9, 10, 11].includes(lagnaLordHouse)) {
    score += 2;
    positiveFactors.push(`D16 लग्नेश ${lagnaLordHouse}वें भाव में`);
  }

  if ([6, 8, 12].includes(lagnaLordHouse)) {
    score -= 2;
    challengeFactors.push(`D16 लग्नेश ${lagnaLordHouse}वें भाव में`);
  }

  const overall = resolveOverall({ score, positiveFactors, challengeFactors });

  return {
    house,
    signId: houseData?.signId || null,
    sign: houseData?.signName || null,
    signHindi: houseData?.signHindi || null,
    lagnaLord,
    lagnaLordHouse,
    score,
    strength: getStrength(score),
    positiveFactors,
    challengeFactors,
    overall,
    theme: HOUSE_THEMES_D16[1]?.theme || 'Self / Overall Sukha',
    summary:
      overall === 'supportive'
        ? 'सामान्य सुख-सुविधाओं से जुड़े D16 संकेत supportive हैं।'
        : overall === 'mixed'
          ? 'सामान्य सुख-सुविधाओं से जुड़े D16 संकेत mixed हैं।'
          : 'सामान्य सुख-सुविधाओं में D16 के अनुसार कुछ चुनौतियाँ दिखती हैं।'
  };
}

/**
 * ============================================================
 * MENTAL PEACE / HAPPINESS (Moon placement in D16)
 * ============================================================
 */
function analyzeMentalPeace(chart) {
  const moonHouse = getPlanetHouse(chart, 'Moon');
  const moon = getPlanet(chart, 'Moon');
  const moonConjunctions = getConjunctions(chart, 'Moon');

  let score = 0;
  const positiveFactors = [];
  const challengeFactors = [];

  if ([1, 4, 5, 9, 10, 11].includes(moonHouse)) {
    score += 2;
    positiveFactors.push(`चंद्रमा ${moonHouse}वें भाव में (supportive)`);
  }

  if ([6, 8, 12].includes(moonHouse)) {
    score -= 2;
    challengeFactors.push(`चंद्रमा ${moonHouse}वें भाव में (challenging)`);
  }

  if (
    moonConjunctions.includes('Jupiter') ||
    moonConjunctions.includes('Venus')
  ) {
    score += 2;
    positiveFactors.push('चंद्रमा benefic ग्रह के साथ');
  }

  if (
    moonConjunctions.includes('Saturn') ||
    moonConjunctions.includes('Rahu') ||
    moonConjunctions.includes('Ketu')
  ) {
    score -= 2;
    challengeFactors.push(
      `चंद्रमा-${moonConjunctions
        .filter(p => ['Saturn', 'Rahu', 'Ketu'].includes(p))
        .join('/')} युति`
    );
  }

  const overall = resolveOverall({ score, positiveFactors, challengeFactors });

  return {
    moonHouse,
    moonSign: moon?.signName || null,
    moonConjunctions,
    score,
    strength: getStrength(score),
    positiveFactors,
    challengeFactors,
    overall,
    theme: 'Mental peace and emotional happiness (D16 Moon)',
    summary:
      overall === 'supportive'
        ? 'मानसिक शांति और खुशी से जुड़े D16 संकेत supportive हैं।'
        : overall === 'mixed'
          ? 'मानसिक शांति से जुड़े D16 संकेत mixed हैं।'
          : 'मानसिक शांति में D16 के अनुसार कुछ चुनौतियाँ दिखती हैं।'
  };
}

/**
 * ============================================================
 * OVERALL SUKHA (combined)
 * ============================================================
 */
function analyzeOverallSukha(vehicles, comforts, mentalPeace) {
  const score =
    (vehicles?.score || 0) +
    (comforts?.score || 0) +
    (mentalPeace?.score || 0);

  const positiveFactors = [
    ...(vehicles?.positiveFactors || []),
    ...(comforts?.positiveFactors || []),
    ...(mentalPeace?.positiveFactors || [])
  ];

  const challengeFactors = [
    ...(vehicles?.challengeFactors || []),
    ...(comforts?.challengeFactors || []),
    ...(mentalPeace?.challengeFactors || [])
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
    vehiclesOverall: vehicles?.overall || 'mixed',
    comfortsOverall: comforts?.overall || 'mixed',
    mentalPeaceOverall: mentalPeace?.overall || 'mixed',
    positiveFactors,
    challengeFactors,
    summary: `वाहन, सामान्य सुख-सुविधाओं और मानसिक शांति को मिलाकर D16 के अनुसार overall sukha: ${level}.`
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
        'Dasha lord नहीं दिया गया है, इसलिए अभी केवल D16 की जन्म स्थिति बताई गई है।'
    };
  }

  const position = getPlanet(chart, currentDashaLord);
  const house = getPlanetHouse(chart, currentDashaLord);

  if (!position) {
    return {
      available: false,
      currentDashaLord,
      interpretation: `Dasha lord ${currentDashaLord} D16 में उपलब्ध नहीं है।`
    };
  }

  const planetData = PLANET_DATA[currentDashaLord] || {};

  return {
    available: true,
    currentDashaLord,
    house,
    sign: position.signName,
    signHindi: position.signHindi,
    degreeInSign: position.d16DegreeInSign,
    nature: planetData.nature || null,
    familyTheme: planetData.theme || null,
    interpretation: `${currentDashaLord} की Dasha के दौरान D16 से जुड़े ${planetData.theme || 'comfort/vehicle'} themes अधिक सक्रिय हो सकते हैं। यह timing indication है, final event prediction नहीं।`
  };
}

/**
 * ============================================================
 * MAIN INTERPRETER
 * ============================================================
 */
function interpretD16(chart, options) {
  options = options || {};

  const { currentDashaLord = null } = options;

  if (!chart) {
    throw new Error('D16 chart is required for interpretation.');
  }

  const vehicles = analyzeVehicles(chart);
  const comforts = analyzeComforts(chart);
  const mentalPeace = analyzeMentalPeace(chart);
  const overallSukha = analyzeOverallSukha(vehicles, comforts, mentalPeace);
  const dashaAnalysis = analyzeDasha(chart, currentDashaLord);

  const lagna = chart?.d16Ascendant;

  const interpretation = [
    {
      area: 'D16 का सीधा मतलब',
      detail:
        'D16 मुख्य रूप से वाहन सुख, सामान्य सुख-सुविधाओं, luxuries और मानसिक/भावनात्मक happiness को समझने में मदद करता है। इसे अकेले किसी घटना का final proof नहीं माना जाना चाहिए।'
    },
    { area: 'Vehicles (वाहन सुख)', detail: vehicles.summary },
    { area: 'Comforts / Luxuries (सुख-सुविधाएँ)', detail: comforts.summary },
    { area: 'Mental Peace (मानसिक शांति)', detail: mentalPeace.summary },
    { area: 'Overall Sukha', detail: overallSukha.summary },
    { area: 'Timing', detail: dashaAnalysis.interpretation }
  ];

  const simpleSummary = [
    `D16 लग्न ${lagna?.signName || 'अज्ञात'} है। यह व्यक्ति के comforts और general sukha की छाप को दर्शाता है।`,
    `वाहन सुख के लिए D16 का 4था भाव ${vehicles.sign || 'अज्ञात'} है। 4th lord ${vehicles.lord || 'अज्ञात'} ${vehicles.lordPlacementHouse || 'अज्ञात'}वें भाव में है। वाहन से जुड़े संकेत ${vehicles.overall} हैं।`,
    `सामान्य सुख-सुविधाओं के लिए D16 लग्नेश ${comforts.lagnaLord || 'अज्ञात'} ${comforts.lagnaLordHouse || 'अज्ञात'}वें भाव में है। संकेत ${comforts.overall} हैं।`,
    `मानसिक शांति के लिए चंद्रमा D16 के ${mentalPeace.moonHouse || 'अज्ञात'}वें भाव में है। संकेत ${mentalPeace.overall} हैं।`,
    `कुल मिलाकर D16 के अनुसार overall sukha: ${overallSukha.level}.`
  ];

  return {
    interpretation,
    simpleSummary,
    detailedBreakdown: {
      vehicles,
      comforts,
      mentalPeace,
      overallSukha,
      dashaAnalysis
    },
    scores: {
      vehicles: vehicles.score,
      comforts: comforts.score,
      mentalPeace: mentalPeace.score,
      overallSukha: overallSukha.score
    }
  };
}

module.exports = {
  resolveOverall,
  getStrength,
  analyzeVehicles,
  analyzeComforts,
  analyzeMentalPeace,
  analyzeOverallSukha,
  analyzeDasha,
  interpretD16
};
