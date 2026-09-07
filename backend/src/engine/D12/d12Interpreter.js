/**
 * ============================================================
 * D12 INTERPRETER
 * ============================================================
 *
 * Purpose:
 * - Father
 * - Mother
 * - Paternal grandparents
 * - Maternal grandparents
 * - Ancestral pressure
 * - Pitru Dosha indication
 * - Parent support
 * - Family heritage
 * - Dasha based D12 activation
 *
 * IMPORTANT:
 * D12 alone does NOT confirm Pitru Dosha.
 */

const {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES_D12
} = require('./d12Rules');

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

  const ascendantSign =
    chart?.d12Ascendant?.signId;

  if (!ascendantSign) {
    return null;
  }

  return (
    ((position.signId - ascendantSign + 12) % 12) + 1
  );
}

function getHouseLordHouse(chart, house) {
  const houseData = getHouse(chart, house);

  if (!houseData?.lord) {
    return null;
  }

  return getPlanetHouse(
    chart,
    houseData.lord
  );
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
 * IMPORTANT:
 *
 * If both positive and challenge factors exist,
 * overall = mixed.
 *
 * This prevents:
 * score +2 + challenge factor
 * from incorrectly becoming "supportive".
 */
function resolveOverall({
  score,
  positiveFactors = [],
  challengeFactors = []
}) {
  if (
    positiveFactors.length > 0 &&
    challengeFactors.length > 0
  ) {
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

function analyzeFather(chart) {
  const house = 9;
  const houseData = getHouse(chart, house);

  const lord =
    houseData?.lord || null;

  const lordPlacementHouse =
    getHouseLordHouse(chart, house);

  const sunHouse =
    getPlanetHouse(chart, 'Sun');

  const sun =
    getPlanet(chart, 'Sun');

  const sunConjunctions =
    getConjunctions(chart, 'Sun');

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /**
   * 9th house
   */
  if (hasPlanetInHouse(chart, 'Jupiter', 9)) {
    score += 2;

    positiveFactors.push(
      '9th house में Jupiter'
    );
  }

  if (hasPlanetInHouse(chart, 'Venus', 9)) {
    score += 1;

    positiveFactors.push(
      '9th house में Venus'
    );
  }

  if (hasPlanetInHouse(chart, 'Ketu', 9)) {
    score -= 4;

    challengeFactors.push(
      '9th house में Ketu'
    );
  }

  if (hasPlanetInHouse(chart, 'Rahu', 9)) {
    score -= 4;

    challengeFactors.push(
      '9th house में Rahu'
    );
  }

  if (hasPlanetInHouse(chart, 'Saturn', 9)) {
    score -= 3;

    challengeFactors.push(
      '9th house में Saturn'
    );
  }

  if (hasPlanetInHouse(chart, 'Mars', 9)) {
    score -= 2;

    challengeFactors.push(
      '9th house में Mars'
    );
  }

  /**
   * 9th lord
   */
  if (lordPlacementHouse === 1) {
    score += 2;

    positiveFactors.push(
      '9th lord Lagna में'
    );
  }

  if (
    [5, 9, 10, 11].includes(
      lordPlacementHouse
    )
  ) {
    score += 2;

    positiveFactors.push(
      `9th lord Mercury supportive house में`
    );
  }

  if (
    [6, 8, 12].includes(
      lordPlacementHouse
    )
  ) {
    score -= 2;

    challengeFactors.push(
      `9th lord ${lord} ${lordPlacementHouse}वें भाव में`
    );
  }

  /**
   * Sun
   */
  if (sunHouse === 9) {
    score += 2;

    positiveFactors.push(
      'सूर्य 9वें भाव में'
    );
  }

  if (
    sunConjunctions.includes('Jupiter') ||
    sunConjunctions.includes('Venus')
  ) {
    score += 1;

    positiveFactors.push(
      'सूर्य benefic ग्रह के साथ'
    );
  }

  if (
    sunConjunctions.includes('Saturn') ||
    sunConjunctions.includes('Rahu') ||
    sunConjunctions.includes('Ketu')
  ) {
    score -= 3;

    challengeFactors.push(
      `सूर्य-${sunConjunctions
        .filter(p =>
          ['Saturn', 'Rahu', 'Ketu'].includes(p)
        )
        .join('/')} युति`
    );
  }

  const overall =
    resolveOverall({
      score,
      positiveFactors,
      challengeFactors
    });

  return {
    house,

    signId: houseData?.signId || null,

    sign: houseData?.signName || null,

    signHindi: houseData?.signHindi || null,

    lord,

    lordPlacementHouse,

    sunHouse,

    sunSign: sun?.signName || null,

    sunConjunctions,

    score,

    strength: getStrength(score),

    positiveFactors,

    challengeFactors,

    overall,

    theme:
      HOUSE_THEMES_D12[9]?.theme ||
      'Father / Paternal Heritage',

    summary:
      overall === 'supportive'
        ? 'पिता से जुड़े D12 संकेत supportive दिखाई देते हैं।'
        : overall === 'mixed'
          ? 'पिता से जुड़े D12 संकेत mixed हैं।'
          : 'पिता से जुड़े D12 संकेतों में challenges या दूरी के संकेत हैं।'
  };
}

function analyzeMother(chart) {
  const house = 4;
  const houseData = getHouse(chart, house);

  const lord =
    houseData?.lord || null;

  const lordPlacementHouse =
    getHouseLordHouse(chart, house);

  const moonHouse =
    getPlanetHouse(chart, 'Moon');

  const moon =
    getPlanet(chart, 'Moon');

  const moonConjunctions =
    getConjunctions(chart, 'Moon');

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /**
   * 4th house
   */
  if (hasPlanetInHouse(chart, 'Jupiter', 4)) {
    score += 2;

    positiveFactors.push(
      '4th house में Jupiter'
    );
  }

  if (hasPlanetInHouse(chart, 'Venus', 4)) {
    score += 1;

    positiveFactors.push(
      '4th house में Venus'
    );
  }

  if (hasPlanetInHouse(chart, 'Saturn', 4)) {
    score -= 2;

    challengeFactors.push(
      '4th house में Saturn'
    );
  }

  if (hasPlanetInHouse(chart, 'Rahu', 4)) {
    score -= 3;

    challengeFactors.push(
      '4th house में Rahu'
    );
  }

  if (hasPlanetInHouse(chart, 'Ketu', 4)) {
    score -= 3;

    challengeFactors.push(
      '4th house में Ketu'
    );
  }

  if (hasPlanetInHouse(chart, 'Mars', 4)) {
    score -= 2;

    challengeFactors.push(
      '4th house में Mars'
    );
  }

  /**
   * 4th lord
   */
  if (lordPlacementHouse === 1) {
    score += 2;

    positiveFactors.push(
      '4th lord Lagna में'
    );
  }

  if (
    [5, 9, 10, 11].includes(
      lordPlacementHouse
    )
  ) {
    score += 2;

    positiveFactors.push(
      `4th lord ${lord} supportive house में`
    );
  }

  if (
    [6, 8, 12].includes(
      lordPlacementHouse
    )
  ) {
    score -= 2;

    challengeFactors.push(
      `4th lord ${lord} ${lordPlacementHouse}वें भाव में`
    );
  }

  /**
   * Moon
   */
  if (moon?.signId === 4) {
    score += 2;

    positiveFactors.push(
      'चंद्रमा Own Sign'
    );
  }

  if (moon?.signId === 2) {
    score += 2;

    positiveFactors.push(
      'चंद्रमा Exalted Sign'
    );
  }

  if (
    moonConjunctions.includes('Saturn') ||
    moonConjunctions.includes('Rahu') ||
    moonConjunctions.includes('Ketu')
  ) {
    score -= 2;

    challengeFactors.push(
      `चंद्रमा-${moonConjunctions
        .filter(p =>
          ['Saturn', 'Rahu', 'Ketu'].includes(p)
        )
        .join('/')} प्रभाव`
    );
  }

  if (moonHouse === 4) {
    score += 1;

    positiveFactors.push(
      'चंद्रमा 4th house में'
    );
  }

  const overall =
    resolveOverall({
      score,
      positiveFactors,
      challengeFactors
    });

  return {
    house,

    signId: houseData?.signId || null,

    sign: houseData?.signName || null,

    signHindi: houseData?.signHindi || null,

    lord,

    lordPlacementHouse,

    moonHouse,

    moonSign: moon?.signName || null,

    moonConjunctions,

    score,

    strength: getStrength(score),

    positiveFactors,

    challengeFactors,

    overall,

    theme:
      HOUSE_THEMES_D12[4]?.theme ||
      'Mother / Home',

    summary:
      overall === 'supportive'
        ? 'माता से जुड़े D12 संकेत supportive दिखाई देते हैं।'
        : overall === 'mixed'
          ? 'माता से जुड़े D12 संकेत mixed हैं।'
          : 'माता से जुड़े D12 संकेतों में challenges या दूरी के संकेत हैं।'
  };
}

function analyzePaternalGrandparents(chart) {
  const house = 5;
  const houseData = getHouse(chart, house);

  const lord =
    houseData?.lord || null;

  const lordPlacementHouse =
    getHouseLordHouse(chart, house);

  const occupants =
    getOccupants(chart, house);

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /**
   * Benefics
   */
  if (hasPlanetInHouse(chart, 'Jupiter', 5)) {
    score += 2;

    positiveFactors.push(
      '5th house में Jupiter'
    );
  }

  if (hasPlanetInHouse(chart, 'Venus', 5)) {
    score += 1;

    positiveFactors.push(
      '5th house में Venus'
    );
  }

  /**
   * Challenges
   */
  if (hasPlanetInHouse(chart, 'Saturn', 5)) {
    score -= 2;

    challengeFactors.push(
      '5th house में Saturn'
    );
  }

  if (hasPlanetInHouse(chart, 'Rahu', 5)) {
    score -= 2;

    challengeFactors.push(
      '5th house में Rahu'
    );
  }

  if (hasPlanetInHouse(chart, 'Ketu', 5)) {
    score -= 2;

    challengeFactors.push(
      '5th house में Ketu'
    );
  }

  if (hasPlanetInHouse(chart, 'Mars', 5)) {
    score -= 1;

    challengeFactors.push(
      '5th house में Mars'
    );
  }

  /**
   * Lord
   */
  if (lordPlacementHouse === 1) {
    score += 2;

    positiveFactors.push(
      '5th lord Lagna में'
    );
  }

  if (
    [5, 9, 10, 11].includes(
      lordPlacementHouse
    )
  ) {
    score += 2;

    positiveFactors.push(
      `5th lord ${lord} supportive house में`
    );
  }

  if (
    [6, 8, 12].includes(
      lordPlacementHouse
    )
  ) {
    score -= 2;

    challengeFactors.push(
      `5th lord ${lord} ${lordPlacementHouse}वें भाव में`
    );
  }

  const overall =
    resolveOverall({
      score,
      positiveFactors,
      challengeFactors
    });

  const description =
    overall === 'supportive'
      ? 'पैतृक वंश और दादा-दादी से जुड़े संकेत supportive दिखाई देते हैं।'
      : overall === 'challenging'
        ? 'पैतृक वंश और दादा-दादी से जुड़े संकेतों में challenges दिखाई देते हैं।'
        : 'पैतृक वंश और दादा-दादी से जुड़े संकेत mixed हैं।';

  return {
    house,

    signId: houseData?.signId || null,

    sign: houseData?.signName || null,

    signHindi: houseData?.signHindi || null,

    lord,

    lordPlacementHouse,

    occupants: occupants.map(
      item => item.planet
    ),

    score,

    strength: getStrength(score),

    positiveFactors,

    challengeFactors,

    overall,

    theme:
      'Paternal Grandparents / Ancestral Lineage',

    description
  };
}

function analyzeMaternalGrandparents(chart) {
  const house = 12;
  const houseData = getHouse(chart, house);

  const lord =
    houseData?.lord || null;

  const lordPlacementHouse =
    getHouseLordHouse(chart, house);

  const occupants =
    getOccupants(chart, house);

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  if (hasPlanetInHouse(chart, 'Jupiter', 12)) {
    score += 2;

    positiveFactors.push(
      '12th house में Jupiter'
    );
  }

  if (hasPlanetInHouse(chart, 'Venus', 12)) {
    score += 1;

    positiveFactors.push(
      '12th house में Venus'
    );
  }

  if (hasPlanetInHouse(chart, 'Mercury', 12)) {
    score += 1;

    positiveFactors.push(
      'Mercury का प्रभाव'
    );
  }

  if (hasPlanetInHouse(chart, 'Saturn', 12)) {
    score -= 2;

    challengeFactors.push(
      'Saturn का प्रभाव'
    );
  }

  if (hasPlanetInHouse(chart, 'Rahu', 12)) {
    score -= 2;

    challengeFactors.push(
      'Rahu का प्रभाव'
    );
  }

  if (hasPlanetInHouse(chart, 'Ketu', 12)) {
    score -= 2;

    challengeFactors.push(
      'Ketu का प्रभाव'
    );
  }

  if (hasPlanetInHouse(chart, 'Mars', 12)) {
    score -= 1;

    challengeFactors.push(
      'Mars का प्रभाव'
    );
  }

  if (lordPlacementHouse === 1) {
    score += 2;

    positiveFactors.push(
      '12th lord Lagna में'
    );
  }

  if (
    [5, 9, 10, 11].includes(
      lordPlacementHouse
    )
  ) {
    score += 2;

    positiveFactors.push(
      `12th lord ${lord} supportive house में`
    );
  }

  if (
    [6, 8].includes(
      lordPlacementHouse
    )
  ) {
    score -= 1;

    challengeFactors.push(
      `12th lord ${lord} ${lordPlacementHouse}वें भाव में`
    );
  }

  const overall =
    resolveOverall({
      score,
      positiveFactors,
      challengeFactors
    });

  const description =
    overall === 'supportive'
      ? 'मातृ वंश और नाना-नानी से जुड़े संकेत supportive दिखाई देते हैं।'
      : overall === 'challenging'
        ? 'मातृ वंश और नाना-नानी से जुड़े संकेतों में challenges दिखाई देते हैं।'
        : 'मातृ वंश और नाना-नानी से जुड़े संकेत mixed हैं।';

  return {
    house,

    signId: houseData?.signId || null,

    sign: houseData?.signName || null,

    signHindi: houseData?.signHindi || null,

    lord,

    lordPlacementHouse,

    occupants: occupants.map(
      item => item.planet
    ),

    score,

    strength: getStrength(score),

    positiveFactors,

    challengeFactors,

    overall,

    theme:
      'Maternal Grandparents / Maternal Lineage',

    description
  };
}

function analyzeAncestralPressure(chart) {
  let score = 0;

  const strongFactors = [];
  const moderateFactors = [];
  const factors = [];

  const ninthHouse =
    getHouse(chart, 9);

  const ninthLord =
    ninthHouse?.lord || null;

  const ninthLordHouse =
    getHouseLordHouse(chart, 9);

  const ninthOccupants =
    getOccupants(chart, 9);

  const sunHouse =
    getPlanetHouse(chart, 'Sun');

  const sunConjunctions =
    getConjunctions(chart, 'Sun');

  /**
   * Ketu / Rahu in 9th
   */
  if (
    hasPlanetInHouse(chart, 'Ketu', 9)
  ) {
    score += 3;

    strongFactors.push(
      'Ketu 9th house में'
    );

    factors.push({
      type: 'strong',
      factor: 'Ketu 9th house में'
    });
  }

  if (
    hasPlanetInHouse(chart, 'Rahu', 9)
  ) {
    score += 3;

    strongFactors.push(
      'Rahu 9th house में'
    );

    factors.push({
      type: 'strong',
      factor: 'Rahu 9th house में'
    });
  }

  /**
   * Saturn / Mars in 9th
   */
  if (
    hasPlanetInHouse(chart, 'Saturn', 9)
  ) {
    score += 2;

    moderateFactors.push(
      'Saturn 9th house में'
    );

    factors.push({
      type: 'moderate',
      factor: 'Saturn 9th house में'
    });
  }

  if (
    hasPlanetInHouse(chart, 'Mars', 9)
  ) {
    score += 2;

    moderateFactors.push(
      'Mars 9th house में'
    );

    factors.push({
      type: 'moderate',
      factor: 'Mars 9th house में'
    });
  }

  /**
   * 9th lord in difficult houses
   */
  if (
    [6, 8, 12].includes(
      ninthLordHouse
    )
  ) {
    score += 1;

    moderateFactors.push(
      `9th lord ${ninthLord} ${ninthLordHouse}वें भाव में`
    );

    factors.push({
      type: 'moderate',
      factor:
        `9th lord ${ninthLord} ${ninthLordHouse}वें भाव में`
    });
  }

  /**
   * Sun conjunction with Saturn/Rahu/Ketu
   */
  const ancestralSunConjunctions =
    sunConjunctions.filter(
      planet =>
        ['Saturn', 'Rahu', 'Ketu']
          .includes(planet)
    );

  if (
    ancestralSunConjunctions.length > 0
  ) {
    score += 3;

    strongFactors.push(
      `Sun-${ancestralSunConjunctions.join('/')} conjunction`
    );

    factors.push({
      type: 'strong',
      factor:
        `Sun-${ancestralSunConjunctions.join('/')} conjunction`
    });
  }

  let status = 'low ancestral pressure';

  if (score >= 5) {
    status =
      'strong ancestral pressure indicators';
  } else if (score >= 3) {
    status =
      'moderate ancestral pressure indicators';
  } else if (score > 0) {
    status =
      'mild ancestral pressure indicators';
  }

  /**
   * IMPORTANT:
   * This is NOT Pitru Dosha confirmation.
   */
  return {
    score,

    status,

    strongFactors,

    moderateFactors,

    factors,

    ninthHouse: {
      signId:
        ninthHouse?.signId || null,

      sign:
        ninthHouse?.signName || null,

      signHindi:
        ninthHouse?.signHindi || null,

      occupants:
        ninthOccupants.map(
          item => item.planet
        ),

      lord: ninthLord,

      lordHouse: ninthLordHouse
    },

    sun: {
      house: sunHouse,

      sign:
        getPlanet(chart, 'Sun')?.signName ||
        null,

      conjunctions:
        sunConjunctions
    },

    pitruDoshaConfirmed: false,

    requiresD1Confirmation: true,

    explanation:
      score >= 3
        ? 'D12 में ancestral pressure indicators हैं। इन्हें ancestral/family influence के संकेत के रूप में देखा जाना चाहिए। D12 अकेले Pitru Dosha confirm नहीं करता। D1 से confirmation आवश्यक है।'
        : 'D12 में सीमित ancestral indicators हैं। D12 अकेले Pitru Dosha confirm नहीं करता।'
  };
}

function analyzePitruDosha(ancestralPressure) {
  const score =
    ancestralPressure?.score || 0;

  let status =
    'no_strong_confirmation_from_D12';

  if (score >= 5) {
    status =
      'strong_ancestral_indicators_but_not_confirmed';
  } else if (score >= 3) {
    status =
      'moderate_ancestral_indicators_but_not_confirmed';
  } else if (score > 0) {
    status =
      'mild_ancestral_indicators';
  }

  return {
    status,

    d12Score: score,

    d1Confirmation:
      'not_available',

    pitruDoshaConfirmed: false,

    requiresD1Confirmation: true,

    explanation:
      score >= 3
        ? 'D12 में ancestral pressure indicators हो सकते हैं, लेकिन D12 अकेले Pitru Dosha का final confirmation नहीं करता।'
        : 'D12 अकेले Pitru Dosha का final confirmation नहीं करता।'
  };
}

function analyzeParentSupport(
  father,
  mother
) {
  const score =
    (father?.score || 0) +
    (mother?.score || 0);

  const positiveFactors = [
    ...(father?.positiveFactors || []),
    ...(mother?.positiveFactors || [])
  ];

  const challengeFactors = [
    ...(father?.challengeFactors || []),
    ...(mother?.challengeFactors || [])
  ];

  let level = 'mixed';

  if (score >= 3) {
    level = 'supportive';
  } else if (score <= -3) {
    level = 'challenging';
  }

  return {
    score,

    level,

    fatherOverall:
      father?.overall || 'mixed',

    motherOverall:
      mother?.overall || 'mixed',

    positiveFactors,

    challengeFactors,

    summary:
      `माता-पिता के support को D12 में 4th/9th house, उनके lords तथा Moon/Sun से देखा गया है। कुल संकेत: ${level}.`
  };
}

function analyzeFamilyReputation(chart) {
  const lagna =
    chart?.d12Ascendant || null;

  const lagnaSignId =
    lagna?.signId || null;

  const lagnaSign =
    SIGN_DATA[lagnaSignId] || null;

  const lagnaLord =
    lagnaSign?.lord || null;

  const lagnaLordHouse =
    getPlanetHouse(
      chart,
      lagnaLord
    );

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /**
   * Lagna lord in supportive houses
   */
  if (
    [1, 5, 9, 10, 11]
      .includes(lagnaLordHouse)
  ) {
    score += 1;

    positiveFactors.push(
      `D12 लग्नेश ${lagnaLordHouse}वें भाव में`
    );
  }

  /**
   * Lagna lord in difficult houses
   */
  if (
    [6, 8, 12]
      .includes(lagnaLordHouse)
  ) {
    score -= 1;

    challengeFactors.push(
      `D12 लग्नेश ${lagnaLordHouse}वें भाव में`
    );
  }

  const overall =
    resolveOverall({
      score,
      positiveFactors,
      challengeFactors
    });

  return {
    lagna:
      lagnaSign?.name || null,

    lagnaHindi:
      lagnaSign?.hindi || null,

    lagnaSignId,

    lagnaLord,

    lagnaLordHouse,

    score,

    strength:
      getStrength(score),

    positiveFactors,

    challengeFactors,

    overall,

    summary:
      `D12 लग्न ${lagnaSign?.name || 'अज्ञात'} है। इसके स्वामी ${lagnaLord || 'अज्ञात'} ${lagnaLordHouse || 'अज्ञात'}वें भाव में हैं। यह family heritage, संस्कार और ancestral patterns की छाप को समझने में मदद करता है।`,

    theme:
      'D12 Lagna, Self, Ancestral Heritage, Family Reputation'
  };
}

function analyzeDasha(chart, currentDashaLord) {
  if (!currentDashaLord) {
    return {
      available: false,

      currentDashaLord: null,

      interpretation:
        'Dasha lord नहीं दिया गया है, इसलिए अभी केवल D12 की जन्म स्थिति बताई गई है।'
    };
  }

  const position =
    getPlanet(
      chart,
      currentDashaLord
    );

  const house =
    getPlanetHouse(
      chart,
      currentDashaLord
    );

  if (!position) {
    return {
      available: false,

      currentDashaLord,

      interpretation:
        `Dasha lord ${currentDashaLord} D12 में उपलब्ध नहीं है।`
    };
  }

  const planetData =
    PLANET_DATA[currentDashaLord] || {};

  return {
    available: true,

    currentDashaLord,

    house,

    sign:
      position.signName,

    signHindi:
      position.signHindi,

    degreeInSign:
      position.d12DegreeInSign,

    nature:
      planetData.nature || null,

    familyTheme:
      planetData.familyTheme || null,

    interpretation:
      `${currentDashaLord} की Dasha के दौरान D12 से जुड़े ${planetData.familyTheme || 'family/ancestral'} themes अधिक सक्रिय हो सकते हैं। यह timing indication है, final event prediction नहीं।`
  };
}

function interpretD12(
  chart,
  options
) {
  options = options || {};

  const {
    currentDashaLord = null
  } = options;

  if (!chart) {
    throw new Error(
      'D12 chart is required for interpretation.'
    );
  }

  const father =
    analyzeFather(chart);

  const mother =
    analyzeMother(chart);

  const paternalGrandparents =
    analyzePaternalGrandparents(chart);

  const maternalGrandparents =
    analyzeMaternalGrandparents(chart);

  const ancestralPressure =
    analyzeAncestralPressure(chart);

  const pitruDosha =
    analyzePitruDosha(
      ancestralPressure
    );

  const parentSupport =
    analyzeParentSupport(
      father,
      mother
    );

  const familyReputation =
    analyzeFamilyReputation(chart);

  const dashaAnalysis =
    analyzeDasha(
      chart,
      currentDashaLord
    );

  const lagna =
    chart?.d12Ascendant;

  const interpretation = [
    {
      area: 'D12 का सीधा मतलब',

      detail:
        'D12 मुख्य रूप से माता-पिता, दादा-दादी/नाना-नानी, पारिवारिक संस्कार, inherited patterns और ancestral influence को समझने में मदद करता है। इसे अकेले किसी घटना का final proof नहीं माना जाना चाहिए।'
    },

    {
      area: 'Father (पिता)',

      detail:
        father.summary
    },

    {
      area: 'Mother (माता)',

      detail:
        mother.summary
    },

    {
      area:
        'Paternal grandparents (दादा-दादी)',

      detail:
        paternalGrandparents.description
    },

    {
      area:
        'Maternal grandparents (नाना-नानी)',

      detail:
        maternalGrandparents.description
    },

    {
      area:
        'Ancestral karma / वंश',

      detail:
        ancestralPressure.explanation
    },

    {
      area:
        'Parents support',

      detail:
        parentSupport.summary
    },

    {
      area:
        'Family reputation / संस्कार',

      detail:
        familyReputation.summary
    },

    {
      area:
        'Pitru Dosha check',

      detail:
        pitruDosha.explanation
    },

    {
      area:
        'Timing',

      detail:
        dashaAnalysis.interpretation
    }
  ];

  const simpleSummary = [
    `D12 लग्न ${lagna?.signName || 'अज्ञात'} है। यह व्यक्ति पर family heritage और ancestral संस्कारों की छाप को दर्शाता है।`,

    `पिता के लिए D12 का 9वां भाव ${father.sign || 'अज्ञात'} है। 9th lord ${father.lord || 'अज्ञात'} ${father.lordPlacementHouse || 'अज्ञात'}वें भाव में है। सूर्य ${father.sunHouse || 'अज्ञात'}वें भाव में है। ${father.challengeFactors.length > 0 ? father.challengeFactors.join(', ') + '।' : ''} पिता से जुड़े संकेत ${father.overall} हैं।`,

    `माता के लिए D12 का 4था भाव ${mother.sign || 'अज्ञात'} है। 4th lord ${mother.lord || 'अज्ञात'} ${mother.lordPlacementHouse || 'अज्ञात'}वें भाव में है। चंद्रमा ${mother.moonHouse || 'अज्ञात'}वें भाव में है। माता से जुड़े संकेत ${mother.overall} हैं।`,

    `पैतृक दादा-दादी/वंश के संकेत: 5वां भाव ${paternalGrandparents.sign || 'अज्ञात'} है। 5th lord ${paternalGrandparents.lord || 'अज्ञात'} ${paternalGrandparents.lordPlacementHouse || 'अज्ञात'}वें भाव में है। कुल संकेत ${paternalGrandparents.overall} हैं।`,

    `मातृ नाना-नानी/वंश के संकेत: 12वां भाव ${maternalGrandparents.sign || 'अज्ञात'} है। 12th lord ${maternalGrandparents.lord || 'अज्ञात'} ${maternalGrandparents.lordPlacementHouse || 'अज्ञात'}वें भाव में है। कुल संकेत ${maternalGrandparents.overall} हैं।`,

    `वंश/पूर्वजों के मामले में: ${ancestralPressure.status}. मुख्य factors: ${ancestralPressure.factors.map(f => f.factor).join(', ') || 'कोई प्रमुख factor नहीं'}`
  ];

  return {
    interpretation,

    simpleSummary,

    detailedBreakdown: {
      father,

      mother,

      paternalGrandparents,

      maternalGrandparents,

      ancestralPressure,

      pitruDosha,

      parentSupport,

      familyReputation,

      dashaAnalysis
    },

    scores: {
      father: father.score,

      mother: mother.score,

      paternalGrandparents:
        paternalGrandparents.score,

      maternalGrandparents:
        maternalGrandparents.score,

      ancestralPressure:
        ancestralPressure.score,

      parentSupport:
        parentSupport.score,

      familyReputation:
        familyReputation.score
    },

    confirmation: {
      pitruDosha:
        pitruDosha.pitruDoshaConfirmed,

      requiresD1Confirmation:
        pitruDosha.requiresD1Confirmation,

      d1Confirmation: null
    }
  };
}

module.exports = {
  resolveOverall,
  getStrength,

  analyzeFather,
  analyzeMother,

  analyzePaternalGrandparents,
  analyzeMaternalGrandparents,

  analyzeAncestralPressure,
  analyzePitruDosha,

  analyzeParentSupport,
  analyzeFamilyReputation,

  analyzeDasha,

  interpretD12
};