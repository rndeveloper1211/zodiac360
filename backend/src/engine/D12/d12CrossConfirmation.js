/**
 * ============================================================
 * D12 CROSS CONFIRMATION ENGINE
 * ============================================================
 *
 * Purpose:
 * - D1 + D12 cross confirmation
 * - Father analysis
 * - Mother analysis
 * - Ancestral pressure
 * - Pitru-related indicators
 * - Parent support
 *
 * IMPORTANT:
 * - D1 is the primary chart.
 * - D12 is the supporting chart.
 * - D12 alone never confirms Pitru Dosha.
 * - D1 house data may be missing, so Whole Sign houses
 *   are derived from D1 Lagna when necessary.
 *
 * ============================================================
 */

const SIGN_NAMES = [
  null,
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
];

const SIGN_HINDI = [
  null,
  'मेष',
  'वृषभ',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुंभ',
  'मीन'
];

const SIGN_LORDS = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter'
};

const PLANETS = [
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

const MALEFICS = [
  'Sun',
  'Mars',
  'Saturn',
  'Rahu',
  'Ketu'
];

const BENEFICS = [
  'Jupiter',
  'Venus',
  'Mercury',
  'Moon'
];

/* ============================================================
 * BASIC HELPERS
 * ============================================================
 */

function isValidNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
}

function normalizeSignId(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return null;
  }

  if (n < 1 || n > 12) {
    return null;
  }

  return Math.floor(n);
}

function normalizeLongitude(value) {
  if (!isValidNumber(value)) {
    return null;
  }

  let longitude = Number(value);

  longitude = ((longitude % 360) + 360) % 360;

  return longitude;
}

function signFromLongitude(longitude) {
  const lon = normalizeLongitude(longitude);

  if (lon === null) {
    return null;
  }

  return Math.floor(lon / 30) + 1;
}

function degreeInSignFromLongitude(longitude) {
  const lon = normalizeLongitude(longitude);

  if (lon === null) {
    return null;
  }

  return lon % 30;
}

function houseFromSigns(lagnaSignId, planetSignId) {
  const lagna = normalizeSignId(lagnaSignId);
  const planet = normalizeSignId(planetSignId);

  if (!lagna || !planet) {
    return null;
  }

  return ((planet - lagna + 12) % 12) + 1;
}

function signForHouse(lagnaSignId, houseNumber) {
  const lagna = normalizeSignId(lagnaSignId);
  const house = Number(houseNumber);

  if (!lagna || !Number.isInteger(house) || house < 1 || house > 12) {
    return null;
  }

  return ((lagna - 1 + house - 1) % 12) + 1;
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
 * GENERIC NESTED OBJECT HELPERS
 * ============================================================
 */

function getPossibleRoots(chart) {
  if (!chart || typeof chart !== 'object') {
    return [];
  }

  const roots = [chart];

  if (chart.chart && typeof chart.chart === 'object') {
    roots.push(chart.chart);
  }

  if (chart.data && typeof chart.data === 'object') {
    roots.push(chart.data);
  }

  if (
    chart.data &&
    chart.data.chart &&
    typeof chart.data.chart === 'object'
  ) {
    roots.push(chart.data.chart);
  }

  return roots;
}

/* ============================================================
 * D1 LAGNA EXTRACTION
 * ============================================================
 */

function getLagnaObject(chart) {
  const roots = getPossibleRoots(chart);

  for (const root of roots) {
    if (root.lagna && typeof root.lagna === 'object') {
      return root.lagna;
    }

    if (root.ascendant && typeof root.ascendant === 'object') {
      return root.ascendant;
    }

    if (root.ascendantData && typeof root.ascendantData === 'object') {
      return root.ascendantData;
    }
  }

  return null;
}

function getLagnaSign(chart) {
  const roots = getPossibleRoots(chart);

  const lagna = getLagnaObject(chart);

  if (lagna) {
    const directSign =
      normalizeSignId(lagna.signId) ||
      normalizeSignId(lagna.rashiId) ||
      normalizeSignId(lagna.signNumber) ||
      normalizeSignId(lagna.zodiacSignId);

    if (directSign) {
      return directSign;
    }

    const signName =
      lagna.sign ||
      lagna.signName ||
      lagna.rashi ||
      lagna.rashiName;

    if (signName) {
      const found = SIGN_NAMES.findIndex(
        name =>
          name &&
          name.toLowerCase() === String(signName).toLowerCase()
      );

      if (found > 0) {
        return found;
      }
    }

    const longitude =
      lagna.totalDegree ??
      lagna.longitude ??
      lagna.absoluteLongitude ??
      lagna.degree;

    const derived = signFromLongitude(longitude);

    if (derived) {
      return derived;
    }
  }

  for (const root of roots) {
    const longitude =
      root.lagnaLongitude ??
      root.ascendantLongitude ??
      root.ascendantTotalDegree;

    const derived = signFromLongitude(longitude);

    if (derived) {
      return derived;
    }
  }

  return null;
}

/* ============================================================
 * PLANETARY DATA EXTRACTION
 * ============================================================
 */

function getPlanetaryContainer(chart) {
  const roots = getPossibleRoots(chart);

  for (const root of roots) {
    if (
      root.planetaryPositions &&
      typeof root.planetaryPositions === 'object'
    ) {
      return root.planetaryPositions;
    }

    if (
      root.planets &&
      typeof root.planets === 'object' &&
      !Array.isArray(root.planets)
    ) {
      return root.planets;
    }

    if (
      root.grahas &&
      typeof root.grahas === 'object' &&
      !Array.isArray(root.grahas)
    ) {
      return root.grahas;
    }

    if (
      root.planetaryData &&
      typeof root.planetaryData === 'object'
    ) {
      return root.planetaryData;
    }
  }

  return {};
}

function getPlanetObject(chart, planet) {
  const container = getPlanetaryContainer(chart);

  if (!container) {
    return null;
  }

  return container[planet] || null;
}

function getPlanetSign(chart, planet) {
  const obj = getPlanetObject(chart, planet);

  if (!obj) {
    return null;
  }

  const directSign =
    normalizeSignId(obj.signId) ||
    normalizeSignId(obj.rashiId) ||
    normalizeSignId(obj.signNumber) ||
    normalizeSignId(obj.zodiacSignId) ||
    normalizeSignId(obj.d1SignId);

  if (directSign) {
    return directSign;
  }

  const signName =
    obj.sign ||
    obj.signName ||
    obj.d1Sign ||
    obj.d1SignName ||
    obj.rashi;

  if (signName) {
    const found = SIGN_NAMES.findIndex(
      name =>
        name &&
        name.toLowerCase() === String(signName).toLowerCase()
    );

    if (found > 0) {
      return found;
    }
  }

  const longitude =
    obj.totalDegree ??
    obj.longitude ??
    obj.absoluteLongitude;

  return signFromLongitude(longitude);
}

function getPlanetHouse(chart, planet, lagnaSignId) {
  const obj = getPlanetObject(chart, planet);

  if (obj) {
    const explicitHouse =
      obj.house ??
      obj.houseNumber ??
      obj.bhava ??
      obj.bhavaNumber;

    if (
      Number.isInteger(Number(explicitHouse)) &&
      Number(explicitHouse) >= 1 &&
      Number(explicitHouse) <= 12
    ) {
      return Number(explicitHouse);
    }
  }

  const signId = getPlanetSign(chart, planet);

  return houseFromSigns(lagnaSignId, signId);
}

/* ============================================================
 * D1 HOUSE EXTRACTION
 * ============================================================
 *
 * First tries explicit house data.
 * If unavailable, derives Whole Sign house from Lagna.
 * ============================================================
 */

function getHouseContainer(chart) {
  const roots = getPossibleRoots(chart);

  for (const root of roots) {
    if (root.houses && typeof root.houses === 'object') {
      return root.houses;
    }

    if (root.houseData && typeof root.houseData === 'object') {
      return root.houseData;
    }

    if (root.bhavas && typeof root.bhavas === 'object') {
      return root.bhavas;
    }
  }

  return {};
}

function getExplicitHouse(chart, houseNumber) {
  const houses = getHouseContainer(chart);

  const raw =
    houses[String(houseNumber)] ||
    houses[houseNumber];

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return raw;
}

function normalizeOccupantName(item) {
  if (!item) {
    return null;
  }

  if (typeof item === 'string') {
    return item;
  }

  if (typeof item === 'object') {
    return (
      item.planet ||
      item.name ||
      item.graha ||
      null
    );
  }

  return null;
}

function getOccupantsFromExplicitHouse(house) {
  if (!house) {
    return [];
  }

  const raw =
    house.occupants ||
    house.planets ||
    house.grahas ||
    house.planetaryPositions ||
    [];

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(normalizeOccupantName)
    .filter(Boolean);
}

function deriveHouseFromD1(chart, houseNumber, lagnaSignId) {
  const signId = signForHouse(
    lagnaSignId,
    houseNumber
  );

  const occupants = [];

  for (const planet of PLANETS) {
    const planetHouse = getPlanetHouse(
      chart,
      planet,
      lagnaSignId
    );

    if (planetHouse === houseNumber) {
      occupants.push(planet);
    }
  }

  return {
    house: houseNumber,
    signId,
    sign: getSignName(signId),
    signHindi: getSignHindi(signId),
    lord: getSignLord(signId),
    occupants
  };
}

function getHouse(chart, houseNumber, lagnaSignId) {
  const explicit = getExplicitHouse(
    chart,
    houseNumber
  );

  const derived = deriveHouseFromD1(
    chart,
    houseNumber,
    lagnaSignId
  );

  if (!explicit) {
    return derived;
  }

  const explicitSign =
    normalizeSignId(explicit.signId) ||
    normalizeSignId(explicit.rashiId);

  const finalSign =
    explicitSign || derived.signId;

  const explicitLord =
    explicit.lord ||
    explicit.houseLord ||
    explicit.ruler;

  const finalLord =
    explicitLord ||
    getSignLord(finalSign);

  const explicitOccupants =
    getOccupantsFromExplicitHouse(explicit);

  const finalOccupants =
    explicitOccupants.length > 0
      ? explicitOccupants
      : derived.occupants;

  return {
    house: houseNumber,
    signId: finalSign,
    sign:
      explicit.sign ||
      explicit.signName ||
      getSignName(finalSign),
    signHindi:
      explicit.signHindi ||
      getSignHindi(finalSign),
    lord: finalLord,
    occupants: finalOccupants
  };
}

/* ============================================================
 * PLANET DETAILS
 * ============================================================
 */

function getPlanetDetails(chart, planet, lagnaSignId) {
  const signId = getPlanetSign(chart, planet);

  const house = getPlanetHouse(
    chart,
    planet,
    lagnaSignId
  );

  return {
    planet,
    house,
    signId,
    sign: getSignName(signId),
    signHindi: getSignHindi(signId)
  };
}

function getConjunctions(chart, planet, lagnaSignId) {
  const planetHouse = getPlanetHouse(
    chart,
    planet,
    lagnaSignId
  );

  if (!planetHouse) {
    return [];
  }

  return PLANETS.filter(other => {
    if (other === planet) {
      return false;
    }

    return (
      getPlanetHouse(
        chart,
        other,
        lagnaSignId
      ) === planetHouse
    );
  });
}

/* ============================================================
 * FATHER — D1
 * ============================================================
 *
 * Primary:
 * - 9th house
 * - 9th lord
 * - Sun
 * ============================================================
 */

function analyzeD1Father(chart, lagnaSignId) {
  const ninthHouse = getHouse(
    chart,
    9,
    lagnaSignId
  );

  const ninthLord = ninthHouse.lord;

  const ninthLordHouse = ninthLord
    ? getPlanetHouse(
        chart,
        ninthLord,
        lagnaSignId
      )
    : null;

  const sun = getPlanetDetails(
    chart,
    'Sun',
    lagnaSignId
  );

  const sunConjunctions =
    getConjunctions(
      chart,
      'Sun',
      lagnaSignId
    );

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /* 9th house occupants */

  for (const planet of ninthHouse.occupants) {
    if (BENEFICS.includes(planet)) {
      score += 2;

      positiveFactors.push(
        `D1 9th house में ${planet} का supportive प्रभाव`
      );
    }

    if (MALEFICS.includes(planet)) {
      score -= 2;

      challengeFactors.push(
        `D1 9th house में ${planet} का challenging प्रभाव`
      );
    }
  }

  /* 9th lord */

  if (ninthLordHouse) {
    if ([1, 2, 4, 5, 7, 9, 10, 11].includes(ninthLordHouse)) {
      score += 2;

      positiveFactors.push(
        `D1 9th lord ${ninthLord} supportive house ${ninthLordHouse} में`
      );
    }

    if ([6, 8, 12].includes(ninthLordHouse)) {
      score -= 2;

      challengeFactors.push(
        `D1 9th lord ${ninthLord} ${ninthLordHouse}वें भाव में`
      );
    }
  }

  /* Sun */

  if ([1, 2, 4, 5, 7, 9, 10, 11].includes(sun.house)) {
    score += 1;

    positiveFactors.push(
      `D1 सूर्य supportive house ${sun.house} में`
    );
  }

  if ([6, 8, 12].includes(sun.house)) {
    score -= 2;

    challengeFactors.push(
      `D1 सूर्य ${sun.house}वें भाव में`
    );
  }

  /* Sun conjunctions */

  if (sunConjunctions.includes('Saturn')) {
    score -= 2;

    challengeFactors.push(
      'D1 सूर्य-Saturn युति'
    );
  }

  if (sunConjunctions.includes('Rahu')) {
    score -= 3;

    challengeFactors.push(
      'D1 सूर्य-Rahu युति'
    );
  }

  if (sunConjunctions.includes('Ketu')) {
    score -= 3;

    challengeFactors.push(
      'D1 सूर्य-Ketu युति'
    );
  }

  let status = 'balanced';

  if (score >= 3) {
    status = 'supportive';
  } else if (score <= -3) {
    status = 'challenging';
  } else {
    status = 'mixed';
  }

  const absoluteScore = Math.abs(score);

  const confidence =
    absoluteScore >= 5
      ? 'high'
      : absoluteScore >= 3
        ? 'moderate'
        : 'low';

  return {
    ninthHouse,
    ninthLord,
    ninthLordHouse,
    sun: {
      house: sun.house,
      sign: sun.sign,
      signHindi: sun.signHindi,
      conjunctions: sunConjunctions
    },
    score,
    positiveFactors,
    challengeFactors,
    status,
    confidence
  };
}

/* ============================================================
 * MOTHER — D1
 * ============================================================
 *
 * Primary:
 * - 4th house
 * - 4th lord
 * - Moon
 * ============================================================
 */

function analyzeD1Mother(chart, lagnaSignId) {
  const fourthHouse = getHouse(
    chart,
    4,
    lagnaSignId
  );

  const fourthLord = fourthHouse.lord;

  const fourthLordHouse = fourthLord
    ? getPlanetHouse(
        chart,
        fourthLord,
        lagnaSignId
      )
    : null;

  const moon = getPlanetDetails(
    chart,
    'Moon',
    lagnaSignId
  );

  const moonConjunctions =
    getConjunctions(
      chart,
      'Moon',
      lagnaSignId
    );

  let score = 0;

  const positiveFactors = [];
  const challengeFactors = [];

  /* 4th house occupants */

  for (const planet of fourthHouse.occupants) {
    if (BENEFICS.includes(planet)) {
      score += 2;

      positiveFactors.push(
        `D1 4th house में ${planet} का supportive प्रभाव`
      );
    }

    if (MALEFICS.includes(planet)) {
      score -= 2;

      challengeFactors.push(
        `D1 4th house में ${planet} का challenging प्रभाव`
      );
    }
  }

  /* 4th lord */

  if (fourthLordHouse) {
    if ([1, 2, 4, 5, 7, 9, 10, 11].includes(fourthLordHouse)) {
      score += 2;

      positiveFactors.push(
        `D1 4th lord ${fourthLord} supportive house ${fourthLordHouse} में`
      );
    }

    if ([6, 8, 12].includes(fourthLordHouse)) {
      score -= 2;

      challengeFactors.push(
        `D1 4th lord ${fourthLord} ${fourthLordHouse}वें भाव में`
      );
    }
  }

  /* Moon */

  if ([1, 2, 4, 5, 7, 9, 10, 11].includes(moon.house)) {
    score += 1;

    positiveFactors.push(
      `D1 चंद्रमा supportive house ${moon.house} में`
    );
  }

  if ([6, 8, 12].includes(moon.house)) {
    score -= 2;

    challengeFactors.push(
      `D1 चंद्रमा ${moon.house}वें भाव में`
    );
  }

  /* Moon conjunctions */

  if (moonConjunctions.includes('Saturn')) {
    score -= 2;

    challengeFactors.push(
      'D1 चंद्रमा-Saturn युति'
    );
  }

  if (moonConjunctions.includes('Rahu')) {
    score -= 2;

    challengeFactors.push(
      'D1 चंद्रमा-Rahu युति'
    );
  }

  if (moonConjunctions.includes('Ketu')) {
    score -= 2;

    challengeFactors.push(
      'D1 चंद्रमा-Ketu युति'
    );
  }

  let status = 'balanced';

  if (score >= 3) {
    status = 'supportive';
  } else if (score <= -3) {
    status = 'challenging';
  } else {
    status = 'mixed';
  }

  const absoluteScore = Math.abs(score);

  const confidence =
    absoluteScore >= 5
      ? 'high'
      : absoluteScore >= 3
        ? 'moderate'
        : 'low';

  return {
    fourthHouse,
    fourthLord,
    fourthLordHouse,
    moon: {
      house: moon.house,
      sign: moon.sign,
      signHindi: moon.signHindi,
      conjunctions: moonConjunctions
    },
    score,
    positiveFactors,
    challengeFactors,
    status,
    confidence
  };
}

/* ============================================================
 * D1 ANCESTRAL PRESSURE
 * ============================================================
 *
 * This is NOT a Pitru Dosha confirmation.
 * It only identifies traditional ancestral-pressure indicators.
 * ============================================================
 */

function analyzeD1AncestralPressure(
  chart,
  lagnaSignId
) {
  const ninthHouse = getHouse(
    chart,
    9,
    lagnaSignId
  );

  const ninthLord = ninthHouse.lord;

  const ninthLordHouse = ninthLord
    ? getPlanetHouse(
        chart,
        ninthLord,
        lagnaSignId
      )
    : null;

  const sun = getPlanetDetails(
    chart,
    'Sun',
    lagnaSignId
  );

  const sunConjunctions =
    getConjunctions(
      chart,
      'Sun',
      lagnaSignId
    );

  let score = 0;

  const factors = [];

  /* Ketu in 9th */

  if (ninthHouse.occupants.includes('Ketu')) {
    score += 3;

    factors.push({
      type: 'strong',
      factor: 'D1 Ketu 9th house में'
    });
  }

  /* Rahu in 9th */

  if (ninthHouse.occupants.includes('Rahu')) {
    score += 2;

    factors.push({
      type: 'moderate',
      factor: 'D1 Rahu 9th house में'
    });
  }

  /* Sun-Saturn */

  if (sunConjunctions.includes('Saturn')) {
    score += 3;

    factors.push({
      type: 'strong',
      factor: 'D1 Sun-Saturn conjunction'
    });
  }

  /* Sun-Rahu */

  if (sunConjunctions.includes('Rahu')) {
    score += 3;

    factors.push({
      type: 'strong',
      factor: 'D1 Sun-Rahu conjunction'
    });
  }

  /* Sun-Ketu */

  if (sunConjunctions.includes('Ketu')) {
    score += 3;

    factors.push({
      type: 'strong',
      factor: 'D1 Sun-Ketu conjunction'
    });
  }

  /* 9th lord in dusthana */

  if ([6, 8, 12].includes(ninthLordHouse)) {
    score += 2;

    factors.push({
      type: 'moderate',
      factor:
        `D1 9th lord ${ninthLord} ${ninthLordHouse}वें भाव में`
    });
  }

  /* Sun in dusthana */

  if ([6, 8, 12].includes(sun.house)) {
    score += 1;

    factors.push({
      type: 'mild',
      factor:
        `D1 सूर्य ${sun.house}वें भाव में`
    });
  }

  let status = 'not_confirmed';

  if (
    score >= 6 &&
    factors.filter(
      x => x.type === 'strong'
    ).length >= 2
  ) {
    status = 'strong_indicators';
  } else if (
    score >= 4 &&
    factors.length >= 2
  ) {
    status = 'moderate_indicators';
  } else if (score >= 2) {
    status = 'mild_indicators';
  }

  return {
    score,
    status,
    factors,
    ninthHouse: {
      signId: ninthHouse.signId,
      sign: ninthHouse.sign,
      signHindi: ninthHouse.signHindi,
      occupants: ninthHouse.occupants,
      lord: ninthLord,
      lordHouse: ninthLordHouse
    },
    sun: {
      house: sun.house,
      sign: sun.sign,
      conjunctions: sunConjunctions
    },
    pitruDoshaConfirmed: false,
    requiresTraditionalConfirmation: true,
    explanation:
      'D1 में ancestral/Pitru-related indicators पाए जा सकते हैं, लेकिन इन्हें अकेले final Pitru Dosha confirmation नहीं माना जाना चाहिए।'
  };
}

/* ============================================================
 * D12 DATA EXTRACTION
 * ============================================================
 */

function getD12Breakdown(d12Chart) {
  if (!d12Chart) {
    return {};
  }

  if (
    d12Chart.detailedBreakdown &&
    typeof d12Chart.detailedBreakdown === 'object'
  ) {
    return d12Chart.detailedBreakdown;
  }

  if (
    d12Chart.interpretation &&
    d12Chart.interpretation.detailedBreakdown
  ) {
    return d12Chart.interpretation.detailedBreakdown;
  }

  if (
    d12Chart.data &&
    d12Chart.data.detailedBreakdown
  ) {
    return d12Chart.data.detailedBreakdown;
  }

  return {};
}

/* ============================================================
 * STATUS HELPERS
 * ============================================================
 */

function statusFromCombinedScore(score) {
  if (score >= 4) {
    return 'supportive';
  }

  if (score <= -4) {
    return 'challenging';
  }

  return 'mixed';
}

function confidenceFromScores(
  d1Score,
  d12Score
) {
  const difference = Math.abs(
    Number(d1Score || 0) -
    Number(d12Score || 0)
  );

  const magnitude =
    Math.abs(Number(d1Score || 0)) +
    Math.abs(Number(d12Score || 0));

  if (magnitude >= 10 && difference <= 6) {
    return 'high';
  }

  if (magnitude >= 5) {
    return 'moderate';
  }

  return 'low';
}

/* ============================================================
 * FATHER CROSS CONFIRMATION
 * ============================================================
 */

function crossFather(
  d1Father,
  d12Father
) {
  const d1Score =
    Number(d1Father?.score || 0);

  const d12Score =
    Number(d12Father?.score || 0);

  const combinedScore =
    d1Score + d12Score;

  const positiveFactors = [
    ...(d1Father?.positiveFactors || [])
      .map(x => `D1: ${x}`)
  ];

  const challengeFactors = [
    ...(d1Father?.challengeFactors || [])
      .map(x => `D1: ${x}`)
  ];

  if (
    d12Father?.overall === 'supportive'
  ) {
    positiveFactors.push(
      'D12 में पिता से जुड़े संकेत supportive'
    );
  }

  if (
    d12Father?.overall === 'challenging'
  ) {
    challengeFactors.push(
      'D12 में पिता से जुड़े संकेत challenging'
    );
  }

  if (
    d12Father?.overall === 'mixed'
  ) {
    challengeFactors.push(
      'D12 में पिता से जुड़े संकेत mixed'
    );
  }

  return {
    d1Score,
    d12Score,
    combinedScore,
    status:
      statusFromCombinedScore(
        combinedScore
      ),
    confidence:
      confidenceFromScores(
        d1Score,
        d12Score
      ),
    positiveFactors,
    challengeFactors,
    summary:
      combinedScore <= -4
        ? 'D1 और D12 दोनों को मिलाकर पिता से जुड़े क्षेत्र में challenging संकेत अधिक हैं।'
        : combinedScore >= 4
          ? 'D1 और D12 दोनों को मिलाकर पिता से जुड़े क्षेत्र में supportive संकेत अधिक हैं।'
          : 'D1 और D12 को मिलाकर पिता से जुड़े संकेत mixed हैं।'
  };
}

/* ============================================================
 * MOTHER CROSS CONFIRMATION
 * ============================================================
 */

function crossMother(
  d1Mother,
  d12Mother
) {
  const d1Score =
    Number(d1Mother?.score || 0);

  const d12Score =
    Number(d12Mother?.score || 0);

  const combinedScore =
    d1Score + d12Score;

  const positiveFactors = [
    ...(d1Mother?.positiveFactors || [])
      .map(x => `D1: ${x}`)
  ];

  const challengeFactors = [
    ...(d1Mother?.challengeFactors || [])
      .map(x => `D1: ${x}`)
  ];

  if (
    d12Mother?.overall === 'supportive'
  ) {
    positiveFactors.push(
      'D12 में माता से जुड़े संकेत supportive'
    );
  }

  if (
    d12Mother?.overall === 'challenging'
  ) {
    challengeFactors.push(
      'D12 में माता से जुड़े संकेत challenging'
    );
  }

  if (
    d12Mother?.overall === 'mixed'
  ) {
    challengeFactors.push(
      'D12 में माता से जुड़े संकेत mixed'
    );
  }

  return {
    d1Score,
    d12Score,
    combinedScore,
    status:
      statusFromCombinedScore(
        combinedScore
      ),
    confidence:
      confidenceFromScores(
        d1Score,
        d12Score
      ),
    positiveFactors,
    challengeFactors,
    summary:
      combinedScore <= -4
        ? 'D1 और D12 दोनों को मिलाकर माता से जुड़े क्षेत्र में challenging संकेत अधिक हैं।'
        : combinedScore >= 4
          ? 'D1 और D12 दोनों को मिलाकर माता से जुड़े क्षेत्र में supportive संकेत अधिक हैं।'
          : 'D1 और D12 को मिलाकर माता से जुड़े संकेत mixed हैं।'
  };
}

/* ============================================================
 * ANCESTRAL CROSS CONFIRMATION
 * ============================================================
 */

function crossAncestral(
  d1Ancestral,
  d12Ancestral
) {
  const d1Score =
    Number(d1Ancestral?.score || 0);

  const d12Score =
    Number(d12Ancestral?.score || 0);

  const combinedScore =
    d1Score + d12Score;

  const factors = [];

  for (
    const factor of
    d1Ancestral?.factors || []
  ) {
    factors.push({
      source: 'D1',
      type: factor.type,
      factor: factor.factor
    });
  }

  if (d12Ancestral) {
    factors.push({
      source: 'D12',
      type: 'strong',
      factor:
        'D12 में ancestral pressure indicators'
    });
  }

  let status = 'mild';

  if (combinedScore >= 8) {
    status = 'strong';
  } else if (combinedScore >= 5) {
    status = 'moderate';
  } else if (combinedScore >= 2) {
    status = 'mild';
  } else {
    status = 'low';
  }

  return {
    d1Score,
    d12Score,
    combinedScore,
    status,
    confidence:
      confidenceFromScores(
        d1Score,
        d12Score
      ),
    factors,
    interpretation:
      combinedScore >= 5
        ? 'D1 और D12 दोनों में ancestral/family pressure के multiple indicators दिखाई देते हैं।'
        : combinedScore >= 2
          ? 'कुछ ancestral/family influence indicators दिखाई देते हैं।'
          : 'Ancestral pressure के संकेत comparatively limited हैं।'
  };
}

/* ============================================================
 * PITRU DOSHA CROSS CHECK
 * ============================================================
 *
 * NEVER returns pitruDoshaConfirmed = true.
 * Traditional confirmation requires broader analysis.
 * ============================================================
 */

function crossPitruDosha(
  d1Ancestral,
  d12Ancestral
) {
  const d1Score =
    Number(d1Ancestral?.score || 0);

  const d12Score =
    Number(d12Ancestral?.score || 0);

  const d1Status =
    d1Ancestral?.status ||
    'not_confirmed';

  const d12Status =
    d12Ancestral?.status ||
    'not_available';

  let status =
    'not_confirmed';

  if (
    d1Status === 'strong_indicators' &&
    (
      d12Status === 'strong_indicators' ||
      d12Status === 'moderate_indicators'
    )
  ) {
    status = 'strong_cross_chart_indication';
  } else if (
    (
      d1Status === 'strong_indicators' ||
      d1Status === 'moderate_indicators'
    ) &&
    (
      d12Status === 'strong_indicators' ||
      d12Status === 'moderate_indicators'
    )
  ) {
    status = 'moderate_cross_chart_indication';
  } else if (
    d1Score >= 2 &&
    d12Score >= 2
  ) {
    status = 'mild_cross_chart_indication';
  }

  const factors = [];

  for (
    const factor of
    d1Ancestral?.factors || []
  ) {
    factors.push({
      source: 'D1',
      type: factor.type,
      factor: factor.factor
    });
  }

  if (d12Score > 0) {
    factors.push({
      source: 'D12',
      type:
        d12Status === 'strong_indicators'
          ? 'strong'
          : 'moderate',
      factor:
        'D12 ancestral pressure indicators'
    });
  }

  return {
    d1Score,
    d12Score,
    d1Status,
    d12Status,
    status,
    confidence:
      status === 'strong_cross_chart_indication'
        ? 'moderate'
        : status === 'moderate_cross_chart_indication'
          ? 'moderate'
          : status === 'mild_cross_chart_indication'
            ? 'low'
            : 'low',

    pitruDoshaConfirmed: false,

    requiresTraditionalConfirmation: true,

    factors,

    explanation:
      status === 'strong_cross_chart_indication'
        ? 'D1 और D12 में strong ancestral/Pitru-related indicators दिखाई देते हैं, फिर भी इसे final Pitru Dosha confirmation नहीं माना जाना चाहिए।'
        : status === 'moderate_cross_chart_indication'
          ? 'D1 और D12 में ancestral/Pitru-related indicators का cross-chart support है, लेकिन final confirmation के लिए traditional broader analysis आवश्यक है।'
          : status === 'mild_cross_chart_indication'
            ? 'कुछ ancestral/Pitru-related indicators दोनों charts में दिखाई देते हैं, लेकिन cross-chart confirmation strong नहीं है।'
            : 'D1 और D12 से Pitru Dosha का पर्याप्त cross-chart confirmation नहीं मिलता।'
  };
}

/* ============================================================
 * MAIN FUNCTION
 * ============================================================
 */

function analyzeD1D12CrossConfirmation(
  d1Chart,
  d12Chart
) {
  if (!d1Chart) {
    return {
      available: false,
      message:
        'D1 chart उपलब्ध नहीं है।'
    };
  }

  if (!d12Chart) {
    return {
      available: false,
      message:
        'D12 chart उपलब्ध नहीं है।'
    };
  }

  /* ----------------------------------------------------------
   * D1 LAGNA
   * ----------------------------------------------------------
   */

  const lagnaSignId =
    getLagnaSign(d1Chart);

  if (!lagnaSignId) {
    return {
      available: false,
      message:
        'D1 Lagna sign identify नहीं हो पाया।'
    };
  }

  /* ----------------------------------------------------------
   * D1 ANALYSIS
   * ----------------------------------------------------------
   */

  const d1Father =
    analyzeD1Father(
      d1Chart,
      lagnaSignId
    );

  const d1Mother =
    analyzeD1Mother(
      d1Chart,
      lagnaSignId
    );

  const d1Ancestral =
    analyzeD1AncestralPressure(
      d1Chart,
      lagnaSignId
    );

  /* ----------------------------------------------------------
   * D12 ANALYSIS
   * ----------------------------------------------------------
   */

  const breakdown =
    getD12Breakdown(d12Chart);

  const d12Father =
    breakdown.father || null;

  const d12Mother =
    breakdown.mother || null;

  const d12Ancestral =
    breakdown.ancestralPressure || null;

  /* ----------------------------------------------------------
   * CROSS
   * ----------------------------------------------------------
   */

  const father =
    crossFather(
      d1Father,
      d12Father
    );

  const mother =
    crossMother(
      d1Mother,
      d12Mother
    );

  const ancestralPressure =
    crossAncestral(
      d1Ancestral,
      d12Ancestral
    );

  const pitruDosha =
    crossPitruDosha(
      d1Ancestral,
      d12Ancestral
    );

  /* ----------------------------------------------------------
   * PARENT SUPPORT
   * ----------------------------------------------------------
   */

  const parentSupportScore =
    father.combinedScore +
    mother.combinedScore;

  let parentSupportLevel =
    'mixed';

  if (parentSupportScore <= -6) {
    parentSupportLevel =
      'challenging';
  } else if (parentSupportScore >= 6) {
    parentSupportLevel =
      'supportive';
  }

  /* ----------------------------------------------------------
   * FINAL OUTPUT
   * ----------------------------------------------------------
   */

  return {
    available: true,

    methodology: {
      primaryChart: 'D1',
      supportingChart: 'D12',
      houseSystem:
        'Whole Sign fallback when D1 house data is unavailable',
      purpose:
        'D1 और D12 के parent तथा ancestral indicators का cross-confirmation',

      note:
        'यह traditional Vedic astrology interpretation है। इसे निश्चित वैज्ञानिक प्रमाण या absolute prediction नहीं माना जाना चाहिए।'
    },

    d1Reference: {
      lagna: {
        signId: lagnaSignId,
        sign: getSignName(lagnaSignId),
        signHindi:
          getSignHindi(lagnaSignId)
      },

      fourthHouse:
        d1Mother.fourthHouse,

      ninthHouse:
        d1Father.ninthHouse
    },

    father: {
      d1: {
        ninthHouse:
          d1Father.ninthHouse,

        ninthLord:
          d1Father.ninthLord,

        ninthLordHouse:
          d1Father.ninthLordHouse,

        sun:
          d1Father.sun,

        score:
          d1Father.score,

        positiveFactors:
          d1Father.positiveFactors,

        challengeFactors:
          d1Father.challengeFactors,

        status:
          d1Father.status,

        confidence:
          d1Father.confidence
      },

      d12: d12Father
        ? {
            house:
              d12Father.house,

            signId:
              d12Father.signId,

            sign:
              d12Father.sign,

            signHindi:
              d12Father.signHindi,

            lord:
              d12Father.lord,

            lordPlacementHouse:
              d12Father.lordPlacementHouse,

            sunHouse:
              d12Father.sunHouse,

            sunSign:
              d12Father.sunSign,

            sunConjunctions:
              d12Father.sunConjunctions,

            score:
              d12Father.score,

            strength:
              d12Father.strength,

            overall:
              d12Father.overall
          }
        : null,

      crossConfirmation:
        father
    },

    mother: {
      d1: {
        fourthHouse:
          d1Mother.fourthHouse,

        fourthLord:
          d1Mother.fourthLord,

        fourthLordHouse:
          d1Mother.fourthLordHouse,

        moon:
          d1Mother.moon,

        score:
          d1Mother.score,

        positiveFactors:
          d1Mother.positiveFactors,

        challengeFactors:
          d1Mother.challengeFactors,

        status:
          d1Mother.status,

        confidence:
          d1Mother.confidence
      },

      d12: d12Mother
        ? {
            house:
              d12Mother.house,

            signId:
              d12Mother.signId,

            sign:
              d12Mother.sign,

            signHindi:
              d12Mother.signHindi,

            lord:
              d12Mother.lord,

            lordPlacementHouse:
              d12Mother.lordPlacementHouse,

            moonHouse:
              d12Mother.moonHouse,

            moonSign:
              d12Mother.moonSign,

            moonConjunctions:
              d12Mother.moonConjunctions,

            score:
              d12Mother.score,

            strength:
              d12Mother.strength,

            overall:
              d12Mother.overall
          }
        : null,

      crossConfirmation:
        mother
    },

    ancestralPressure,

    pitruDosha,

    parentSupport: {
      score:
        parentSupportScore,

      level:
        parentSupportLevel,

      fatherStatus:
        father.status,

      motherStatus:
        mother.status,

      summary:
        parentSupportLevel === 'challenging'
          ? 'D1 और D12 के combined संकेतों में parental support/relationship के क्षेत्र में challenges दिखाई देते हैं।'
          : parentSupportLevel === 'supportive'
            ? 'D1 और D12 के combined संकेतों में parental support के क्षेत्र में supportive संकेत अधिक हैं।'
            : 'D1 और D12 के combined संकेत parental support के क्षेत्र में mixed हैं।'
    },

    scores: {
      father:
        father.combinedScore,

      mother:
        mother.combinedScore,

      ancestralPressure:
        ancestralPressure.combinedScore,

      pitruDosha:
        d1Ancestral.score +
        d12Ancestral?.score || 0,

      parentSupport:
        parentSupportScore
    }
  };
}

/* ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  analyzeD1D12CrossConfirmation,

  // Export helpers for testing/debugging
  getLagnaSign,
  getPlanetSign,
  getPlanetHouse,
  getHouse,
  deriveHouseFromD1,
  signForHouse,
  houseFromSigns
};