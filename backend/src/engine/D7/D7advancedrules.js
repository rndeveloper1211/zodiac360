/**
 * D7 (Saptamsha) MASTER RULES
 * ============================
 * Single source of truth for D7 interpretation.
 *
 * Contains:
 * - D7 5th/5th lord analysis
 * - 2nd/7th/9th/11th supporting houses
 * - Parashari aspects
 * - Jupiter / Putra Karaka
 * - dignity proxy
 * - delay vs severe-obstruction synthesis
 * - qualitative progeny expansion indication
 * - D1 <-> D7 cross confirmation
 * - Vimshottari MD / AD / PD timing
 * - optional Jupiter/Saturn transit trigger scoring
 * - final promise / timing / confidence synthesis
 *
 * IMPORTANT:
 * This is a traditional symbolic astrology heuristic engine, not a medical,
 * fertility, or deterministic child-count system.
 */

const { SIGNS, SIGN_LORDS } = require('./d7Rules');

const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

const SPECIAL_ASPECTS = Object.freeze({
  Mars: [4, 7, 8],
  Jupiter: [5, 7, 9],
  Saturn: [3, 7, 10]
});

const D7_SUPPORT_HOUSES = Object.freeze([2, 7, 9, 11]);
const GOOD_HOUSES = Object.freeze([1, 4, 5, 7, 9, 10, 11]);
const DUSTHANA_HOUSES = Object.freeze([6, 8, 12]);

const OWN_SIGNS = Object.freeze({
  Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6],
  Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11]
});

const EXALTATION_SIGN = Object.freeze({
  Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4,
  Venus: 12, Saturn: 7, Rahu: 2, Ketu: 8
});

const DEBILITATION_SIGN = Object.freeze({
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10,
  Venus: 6, Saturn: 1, Rahu: 8, Ketu: 2
});

const DASHA_ORDER = Object.freeze(['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']);
const DASHA_YEARS = Object.freeze({
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
});
const NAKSHATRA_SPAN = 360 / 27;
const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function safeHouse(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : null;
}

function isPlanet(planet) {
  return typeof planet === 'string' && planet.length > 0;
}

function isBenefic(planet) {
  return BENEFICS.includes(planet);
}

function isNaturalMalefic(planet) {
  return NATURAL_MALEFICS.includes(planet);
}

function getPlanetSignId(p) {
  return Number(p?.d7SignId ?? p?.signId ?? 0) || null;
}

function getPlanetHouse(p) {
  return safeHouse(p?.house);
}

function getAspectedHouses(planetName, fromHouse) {
  const house = safeHouse(fromHouse);
  if (!house) return [];
  const offsets = SPECIAL_ASPECTS[planetName] || [7];
  return offsets.map(offset => ((house - 1 + (offset - 1)) % 12) + 1);
}

function getAspectRecords(planetCalculations, targetHouse) {
  const target = safeHouse(targetHouse);
  if (!target) return [];

  const aspects = [];
  for (const [planet, data] of Object.entries(planetCalculations || {})) {
    const fromHouse = getPlanetHouse(data);
    if (!fromHouse) continue;
    const offsets = SPECIAL_ASPECTS[planet] || [7];
    offsets.forEach(offset => {
      const toHouse = ((fromHouse - 1 + (offset - 1)) % 12) + 1;
      if (toHouse === target) {
        aspects.push({
          planet,
          fromHouse,
          toHouse,
          aspectOffset: offset,
          aspectType: offset === 7 ? '7th aspect' : `Parashari special aspect (${offset}th)`
        });
      }
    });
  }
  return aspects;
}

function getPlanetDignity(planet, signId) {
  const sign = Number(signId);
  if (!sign) return { status: 'Unknown', points: 10 };
  if (EXALTATION_SIGN[planet] === sign) return { status: 'Exalted', points: 20 };
  if (DEBILITATION_SIGN[planet] === sign) return { status: 'Debilitated', points: 0 };
  if (OWN_SIGNS[planet]?.includes(sign)) return { status: 'Own Sign', points: 15 };
  return { status: 'Neutral', points: 10 };
}

function analyzeDivisionalStrength(planetCalculations, lagna, fifthLordDetails) {
  const allPlanetsDignity = {};
  let totalPoints = 0;
  let count = 0;

  for (const [planet, data] of Object.entries(planetCalculations || {})) {
    const dignity = getPlanetDignity(planet, getPlanetSignId(data));
    allPlanetsDignity[planet] = dignity;
    totalPoints += dignity.points;
    count += 1;
  }

  const lagnaLord = lagna?.lord || null;
  const fifthLord = fifthLordDetails?.fifthLord || null;
  const lagnaLordDignity = lagnaLord && planetCalculations[lagnaLord]
    ? { planet: lagnaLord, ...getPlanetDignity(lagnaLord, getPlanetSignId(planetCalculations[lagnaLord])) }
    : null;
  const fifthLordDignity = fifthLord && planetCalculations[fifthLord]
    ? { planet: fifthLord, ...getPlanetDignity(fifthLord, getPlanetSignId(planetCalculations[fifthLord])) }
    : null;
  const jupiterDignity = planetCalculations.Jupiter
    ? { planet: 'Jupiter', ...getPlanetDignity('Jupiter', getPlanetSignId(planetCalculations.Jupiter)) }
    : null;

  const overallScore = count ? clamp((totalPoints / (count * 20)) * 100) : 0;

  return {
    allPlanetsDignity,
    lagnaLord: lagnaLordDignity,
    fifthLord: fifthLordDignity,
    jupiter: jupiterDignity,
    overallD7StrengthScore: overallScore,
    note: 'यह simplified dignity proxy है; classical Vimshopaka Bala का substitute नहीं है।',
    summary: `D7 planetary dignity proxy strength लगभग ${overallScore}/100 है।`
  };
}

function analyzeFifthHouseAndLord(houseOccupancy, planetCalculations, lagnaSignId) {
  const fifthSignId = ((Number(lagnaSignId) - 1 + 4) % 12) + 1;
  const fifthSignData = SIGNS.find(s => s.id === fifthSignId);
  const fifthLord = SIGN_LORDS[fifthSignId];
  const fifthLordData = planetCalculations?.[fifthLord] || null;
  const occupants = houseOccupancy?.[5] || [];
  const aspects = getAspectRecords(planetCalculations, 5);

  let score = 50;
  const supportingFactors = [];
  const cautionFactors = [];

  if (fifthLordData) {
    const house = getPlanetHouse(fifthLordData);
    if ([1, 4, 5, 7, 9, 10, 11].includes(house)) {
      score += 18;
      supportingFactors.push(`पंचमेश ${fifthLord} ${house}वें भाव में है; यह D7 पंचम भाव के लिए supportive placement है।`);
    } else if (DUSTHANA_HOUSES.includes(house)) {
      score -= 18;
      cautionFactors.push(`पंचमेश ${fifthLord} ${house}वें भाव में है; यह delay/challenge का संकेत दे सकता है।`);
    }

    const dignity = getPlanetDignity(fifthLord, getPlanetSignId(fifthLordData));
    if (dignity.status === 'Exalted') {
      score += 15;
      supportingFactors.push(`पंचमेश ${fifthLord} D7 में exalted है।`);
    } else if (dignity.status === 'Own Sign') {
      score += 10;
      supportingFactors.push(`पंचमेश ${fifthLord} D7 में own sign में है।`);
    } else if (dignity.status === 'Debilitated') {
      score -= 15;
      cautionFactors.push(`पंचमेश ${fifthLord} D7 में debilitated है।`);
    }
  }

  const beneficOccupants = occupants.filter(isBenefic);
  const maleficOccupants = occupants.filter(isNaturalMalefic);
  if (beneficOccupants.length) {
    score += Math.min(15, beneficOccupants.length * 8);
    supportingFactors.push(`पंचम भाव में शुभ ग्रह: ${beneficOccupants.join(', ')}।`);
  }
  if (maleficOccupants.length) {
    score -= Math.min(15, maleficOccupants.length * 7);
    cautionFactors.push(`पंचम भाव में natural malefic influence: ${maleficOccupants.join(', ')}। इसे अकेले denial नहीं माना जाता।`);
  }

  const beneficAspects = aspects.filter(a => isBenefic(a.planet));
  const maleficAspects = aspects.filter(a => isNaturalMalefic(a.planet));
  if (beneficAspects.length) {
    score += Math.min(12, beneficAspects.length * 6);
    supportingFactors.push(`पंचम भाव पर शुभ दृष्टि: ${beneficAspects.map(a => a.planet).join(', ')}।`);
  }
  if (maleficAspects.length) {
    score -= Math.min(12, maleficAspects.length * 5);
    cautionFactors.push(`पंचम भाव पर challenging aspect: ${maleficAspects.map(a => a.planet).join(', ')}।`);
  }

  return {
    fifthSignId,
    fifthSignName: fifthSignData?.name || null,
    fifthSignHindi: fifthSignData?.hindi || null,
    fifthLord,
    fifthLordHouse: getPlanetHouse(fifthLordData),
    occupants,
    aspects,
    score: clamp(score),
    confidence: fifthLordData ? 'high' : 'low',
    supportingFactors,
    cautionFactors,
    lordDignity: fifthLordData ? getPlanetDignity(fifthLord, getPlanetSignId(fifthLordData)) : null,
    lordAnalysisText:
      `D7 पंचम भाव ${fifthSignData?.name || 'unknown'} राशि में है और इसका स्वामी ${fifthLord} है। ` +
      (fifthLordData ? `पंचमेश ${fifthLord} ${getPlanetHouse(fifthLordData)}वें भाव में है। ` : '') +
      (aspects.length ? `पंचम भाव पर ${aspects.map(a => a.planet).join(', ')} की दृष्टि है।` : 'पंचम भाव पर प्रमुख ग्रह-दृष्टि नहीं मिली।')
  };
}

function analyzeAspectsOnFifthHouse(planetCalculations) {
  const aspects = getAspectRecords(planetCalculations, 5);
  const beneficAspects = aspects.filter(a => isBenefic(a.planet)).map(a => a.planet);
  const maleficAspects = aspects.filter(a => isNaturalMalefic(a.planet)).map(a => a.planet);
  const score = clamp(50 + beneficAspects.length * 10 - maleficAspects.length * 8);

  return {
    aspects,
    beneficAspects: [...new Set(beneficAspects)],
    maleficAspects: [...new Set(maleficAspects)],
    score,
    confidence: aspects.length ? 'medium' : 'low',
    summary: aspects.length
      ? `पंचम भाव पर ${[...new Set(aspects.map(a => a.planet))].join(', ')} की दृष्टि है।`
      : 'पंचम भाव पर कोई प्रमुख ग्रह-दृष्टि नहीं मिली।'
  };
}

function analyzeJupiterInD7(planetCalculations, fifthHouseAnalysis = null) {
  const jupiter = planetCalculations?.Jupiter;
  if (!jupiter) {
    return { score: 0, confidence: 'low', summary: 'D7 में Jupiter data उपलब्ध नहीं है।' };
  }

  let score = 50;
  const supportingFactors = [];
  const cautionFactors = [];
  const house = getPlanetHouse(jupiter);
  const dignity = getPlanetDignity('Jupiter', getPlanetSignId(jupiter));

  if ([1, 4, 5, 7, 9, 10, 11].includes(house)) {
    score += 20;
    supportingFactors.push(`Jupiter D7 के ${house}वें भाव में है; यह progeny support देता है।`);
  } else if (DUSTHANA_HOUSES.includes(house)) {
    score -= 15;
    cautionFactors.push(`Jupiter D7 के ${house}वें भाव में है; यह delay/challenge बढ़ा सकता है।`);
  }

  if (dignity.status === 'Exalted') {
    score += 18;
    supportingFactors.push('Jupiter D7 में exalted है।');
  } else if (dignity.status === 'Own Sign') {
    score += 15;
    supportingFactors.push('Jupiter D7 में own sign में है।');
  } else if (dignity.status === 'Debilitated') {
    score -= 15;
    cautionFactors.push('Jupiter D7 में debilitated है।');
  }

  if (fifthHouseAnalysis?.fifthLord === 'Jupiter') {
    score += 10;
    supportingFactors.push('Jupiter स्वयं D7 पंचमेश भी है — 5th-lord और Putra-Karaka roles एक जगह मिल रहे हैं।');
  }
  if (house === 5) {
    score += 8;
    supportingFactors.push('Jupiter D7 पंचम भाव में स्थित है।');
  }
  if (jupiter.isRetrograde) {
    cautionFactors.push('Jupiter वक्री है; इसे automatic denial नहीं माना गया, बल्कि timing/manifestation में complexity माना गया है।');
  }

  return {
    d7House: house,
    d7Sign: jupiter.d7SignName || null,
    d7SignId: getPlanetSignId(jupiter),
    dignity,
    isRetrograde: Boolean(jupiter.isRetrograde),
    score: clamp(score),
    confidence: 'high',
    supportingFactors,
    cautionFactors,
    summary: `Jupiter (Putra Karaka) का D7 progeny-support score ${clamp(score)}/100 है।`
  };
}

function analyzeSupportingHouses(d7ChartData) {
  const occupancy = d7ChartData?.houseOccupancy || {};
  const houseLords = d7ChartData?.houseLords || {};
  const planets = d7ChartData?.planetCalculations || {};
  const result = {};

  for (const house of D7_SUPPORT_HOUSES) {
    const lord = houseLords[house] || null;
    const lordData = lord ? planets[lord] : null;
    const occupants = occupancy[house] || [];
    let score = 50;
    const support = [];
    const caution = [];

    if (lordData) {
      const lordHouse = getPlanetHouse(lordData);
      if ([1, 2, 4, 5, 7, 9, 10, 11].includes(lordHouse)) score += 12;
      if (DUSTHANA_HOUSES.includes(lordHouse)) score -= 10;
      const dignity = getPlanetDignity(lord, getPlanetSignId(lordData));
      if (dignity.status === 'Exalted') score += 10;
      if (dignity.status === 'Own Sign') score += 7;
      if (dignity.status === 'Debilitated') score -= 10;
    }

    const benefics = occupants.filter(isBenefic);
    const malefics = occupants.filter(isNaturalMalefic);
    if (benefics.length) {
      score += Math.min(12, benefics.length * 6);
      support.push(`भाव ${house} में शुभ ग्रह: ${benefics.join(', ')}।`);
    }
    if (malefics.length) {
      score -= Math.min(10, malefics.length * 5);
      caution.push(`भाव ${house} में challenging planets: ${malefics.join(', ')}।`);
    }

    result[house] = {
      house,
      significance: {
        2: 'वंश/परिवार की continuity',
        7: 'partnership / joint progeny planning',
        9: 'fortune/blessing/support',
        11: 'fulfilment / expansion'
      }[house],
      lord,
      lordHouse: getPlanetHouse(lordData),
      occupants,
      score: clamp(score),
      supportingFactors: support,
      cautionFactors: caution
    };
  }
  return result;
}

function synthesizeDelayAndObstruction({ fifth, fifthAspects, jupiter, supportingHouses, divisionalStrength }) {
  let delay = 20;
  let severeObstruction = 10;
  const delayFactors = [];
  const obstructionFactors = [];

  const fifthLordHouse = fifth?.fifthLordHouse;
  if (DUSTHANA_HOUSES.includes(fifthLordHouse)) {
    delay += 18;
    delayFactors.push(`पंचमेश ${fifthLordHouse}वें दुष्ट भाव में है।`);
  }
  if (fifth?.lordDignity?.status === 'Debilitated') {
    delay += 15;
    severeObstruction += 8;
    delayFactors.push('पंचमेश debilitated है।');
  }
  if (fifthAspects?.maleficAspects?.length) {
    delay += Math.min(20, fifthAspects.maleficAspects.length * 7);
    delayFactors.push(`पंचम पर challenging aspects: ${fifthAspects.maleficAspects.join(', ')}।`);
  }
  if (jupiter?.dignity?.status === 'Debilitated') {
    delay += 10;
    severeObstruction += 10;
    delayFactors.push('Jupiter debilitated है।');
  }
  if (jupiter?.d7House && DUSTHANA_HOUSES.includes(jupiter.d7House)) {
    delay += 10;
    delayFactors.push(`Jupiter ${jupiter.d7House}वें भाव में है।`);
  }
  if (supportingHouses?.[11]?.score >= 65) {
    delay -= 8;
    delayFactors.push('D7 11th-house fulfilment support delay को reduce करता है।');
  }
  if (supportingHouses?.[9]?.score >= 65) {
    severeObstruction -= 5;
  }
  if ((divisionalStrength?.overallD7StrengthScore || 50) < 35) {
    severeObstruction += 8;
  }

  delay = clamp(delay);
  severeObstruction = clamp(severeObstruction);

  let delayLevel = 'LOW';
  if (delay >= 60) delayLevel = 'HIGH';
  else if (delay >= 35) delayLevel = 'MODERATE';

  let obstructionLevel = 'LOW';
  if (severeObstruction >= 60) obstructionLevel = 'HIGH';
  else if (severeObstruction >= 35) obstructionLevel = 'MODERATE';

  if (obstructionLevel !== 'HIGH') {
    obstructionFactors.push('Available D7 factors अकेले permanent denial establish नहीं करते।');
  }

  return {
    delayScore: delay,
    delayLevel,
    severeObstructionScore: severeObstruction,
    severeObstructionLevel: obstructionLevel,
    delayFactors,
    obstructionFactors,
    interpretation:
      obstructionLevel === 'HIGH'
        ? 'कई strong obstruction factors हैं; फिर भी इसे deterministic denial नहीं माना जाना चाहिए।'
        : delayLevel === 'HIGH'
          ? 'योग मौजूद हो सकते हैं लेकिन delay/effort की संभावना comparatively अधिक है।'
          : delayLevel === 'MODERATE'
            ? 'कुछ delay/challenge factors हैं, लेकिन strong progeny support होने पर manifestation संभव है।'
            : 'Major delay signal comparatively low है।'
  };
}

function analyzeSantaanExpansion({ fifth, fifthAspects, jupiter, supportingHouses }) {
  // Qualitative expansion only. Exact child count is intentionally not inferred.
  const signals = [];
  let positive = 0;
  let negative = 0;
  const scorePart = (condition, points, text) => { if (condition) { positive += points; signals.push(text); } };
  scorePart((fifth?.score || 0) >= 75, 20, 'Strong D7 5th-house/5th-lord support');
  scorePart((jupiter?.score || 0) >= 75, 20, 'Strong Jupiter/Putra Karaka support');
  scorePart((supportingHouses?.[11]?.score || 0) >= 70, 15, 'Strong 11th-house fulfilment/expansion support');
  scorePart((supportingHouses?.[2]?.score || 0) >= 65, 10, '2nd-house lineage continuity support');
  scorePart((supportingHouses?.[9]?.score || 0) >= 65, 10, '9th-house blessing/support');
  scorePart((supportingHouses?.[7]?.score || 0) >= 65, 5, '7th-house partnership/progeny planning support');
  scorePart((fifthAspects?.beneficAspects?.length || 0) > 0, 10, 'Benefic influence on D7 5th');
  if (fifthAspects?.maleficAspects?.length) { negative += Math.min(15, fifthAspects.maleficAspects.length * 5); signals.push('Challenging influence on D7 5th'); }
  const score = clamp(30 + positive - negative);
  let level = 'LOW';
  if (score >= 80) level = 'VERY_STRONG';
  else if (score >= 65) level = 'STRONG';
  else if (score >= 50) level = 'MODERATE';
  const indication = level === 'VERY_STRONG' ? 'Very strong qualitative progeny-expansion support' : level === 'STRONG' ? 'Strong qualitative progeny-expansion support' : level === 'MODERATE' ? 'Moderate qualitative progeny-expansion support' : 'Limited qualitative progeny-expansion support';
  return {
    score, level, indication, confidence: level === 'VERY_STRONG' ? 'medium' : 'low-medium',
    positiveSignals: positive, negativeSignals: negative, signals,
    methodology: ['D7 2nd/5th/7th/9th/11th', '5th lord and Jupiter strength', 'benefic vs challenging influence'],
    note: 'यह exact child count नहीं बताता। Classical child-count rules को भी deterministic number में convert नहीं किया गया है; यह केवल expansion tendency है।',
    summary: `संतान expansion tendency: ${indication}।`
  };
}

function analyzeSantaanNature(fifth, jupiter, supportingHouses) {
  const score = clamp(
    (fifth?.score || 50) * 0.45 +
    (jupiter?.score || 50) * 0.35 +
    (supportingHouses?.[9]?.score || 50) * 0.20
  );
  let natureTag = 'Balanced / Mixed';
  if (score >= 72) natureTag = 'Positive & Supportive';
  else if (score <= 38) natureTag = 'Requires More Nurturing / Attention';

  return {
    natureTag,
    score,
    confidence: 'low-medium',
    summary: `संतान के सामान्य temperament/support का symbolic indication: ${natureTag}।`
  };
}

function analyzeConceptionEaseIndication(delayAnalysis, promiseScore) {
  // This is explicitly a symbolic ease/challenge indicator, not fertility diagnosis.
  const score = clamp(promiseScore - delayAnalysis.delayScore * 0.45 - delayAnalysis.severeObstructionScore * 0.20 + 20);
  let label = 'Moderate';
  if (score >= 70) label = 'Relatively Favorable';
  else if (score <= 38) label = 'May Need Patience / Further Analysis';

  return {
    score,
    label,
    confidence: 'low',
    summary: `संतान-प्राप्ति की symbolic ease/challenge level: ${label}।`,
    disclaimer: 'यह medical fertility/conception assessment नहीं है। वास्तविक fertility या pregnancy संबंधी निर्णय के लिए qualified medical professional से सलाह आवश्यक है।'
  };
}

function getD1AspectRecords(grahas, targetHouse, houseOf) {
  const records = [];
  for (const [planet, data] of Object.entries(grahas || {})) {
    const from = houseOf(data?.signId);
    if (!from) continue;
    const offsets = SPECIAL_ASPECTS[planet] || [7];
    for (const offset of offsets) {
      const to = ((from - 1 + (offset - 1)) % 12) + 1;
      if (to === targetHouse) records.push({ planet, fromHouse: from, toHouse: to, aspectOffset: offset });
    }
  }
  return records;
}

function analyzeD1ProgenyContext(d1RawData) {
  if (!d1RawData?.lagna || !d1RawData?.grahas) {
    return { available: false, score: null, factors: [], note: 'D1 data उपलब्ध नहीं है; D7-only analysis किया गया।' };
  }

  const lagnaSignId = Number(d1RawData.lagna.signId);
  if (!lagnaSignId) return { available: false, score: null, factors: [], note: 'D1 Lagna sign उपलब्ध नहीं है।' };

  const houseOf = signId => ((Number(signId) - lagnaSignId + 12) % 12) + 1;
  const grahas = d1RawData.grahas;
  const fifthSignId = ((lagnaSignId - 1 + 4) % 12) + 1;
  const fifthLord = SIGN_LORDS[fifthSignId];
  const fifthLordData = grahas[fifthLord];
  const jupiter = grahas.Jupiter;
  const fifthOccupants = Object.entries(grahas).filter(([, p]) => houseOf(p?.signId) === 5).map(([name]) => name);
  const fifthAspects = getD1AspectRecords(grahas, 5, houseOf);
  const supportHouses = {};

  let score = 50;
  const factors = [];
  const caution = [];

  if (fifthLordData) {
    const house = houseOf(fifthLordData.signId);
    if ([1, 4, 5, 7, 9, 10, 11].includes(house)) { score += 15; factors.push(`D1 पंचमेश ${fifthLord} ${house}वें भाव में है।`); }
    if (DUSTHANA_HOUSES.includes(house)) { score -= 15; caution.push(`D1 पंचमेश ${fifthLord} ${house}वें भाव में है।`); }
    const dignity = getPlanetDignity(fifthLord, fifthLordData.signId);
    if (dignity.status === 'Exalted') { score += 10; factors.push(`D1 पंचमेश ${fifthLord} exalted है।`); }
    if (dignity.status === 'Own Sign') { score += 7; factors.push(`D1 पंचमेश ${fifthLord} own sign में है।`); }
    if (dignity.status === 'Debilitated') { score -= 10; caution.push(`D1 पंचमेश ${fifthLord} debilitated है।`); }
  }

  const benefics = fifthOccupants.filter(isBenefic);
  const malefics = fifthOccupants.filter(isNaturalMalefic);
  if (benefics.length) { score += Math.min(12, benefics.length * 6); factors.push(`D1 पंचम में शुभ ग्रह: ${benefics.join(', ')}।`); }
  if (malefics.length) { score -= Math.min(12, malefics.length * 6); caution.push(`D1 पंचम में challenging planets: ${malefics.join(', ')}।`); }

  const beneficAspects = fifthAspects.filter(a => isBenefic(a.planet));
  const maleficAspects = fifthAspects.filter(a => isNaturalMalefic(a.planet));
  if (beneficAspects.length) { score += Math.min(10, beneficAspects.length * 5); factors.push(`D1 पंचम पर शुभ दृष्टि: ${beneficAspects.map(a => a.planet).join(', ')}।`); }
  if (maleficAspects.length) { score -= Math.min(10, maleficAspects.length * 5); caution.push(`D1 पंचम पर challenging दृष्टि: ${maleficAspects.map(a => a.planet).join(', ')}।`); }

  if (jupiter) {
    const jHouse = houseOf(jupiter.signId);
    if ([1, 4, 5, 7, 9, 10, 11].includes(jHouse)) { score += 10; factors.push(`D1 Jupiter ${jHouse}वें भाव में है।`); }
    if (DUSTHANA_HOUSES.includes(jHouse)) { score -= 10; caution.push(`D1 Jupiter ${jHouse}वें भाव में है।`); }
    const jd = getPlanetDignity('Jupiter', jupiter.signId);
    if (jd.status === 'Exalted' || jd.status === 'Own Sign') { score += 7; factors.push(`D1 Jupiter ${jd.status} है।`); }
    if (jd.status === 'Debilitated') { score -= 7; caution.push('D1 Jupiter debilitated है।'); }
  }

  for (const house of D7_SUPPORT_HOUSES) {
    const signId = ((lagnaSignId - 1 + (house - 1)) % 12) + 1;
    const lord = SIGN_LORDS[signId];
    const lordData = grahas[lord];
    const occupants = Object.entries(grahas).filter(([, p]) => houseOf(p?.signId) === house).map(([name]) => name);
    let hScore = 50;
    if (lordData) {
      const lh = houseOf(lordData.signId);
      if ([1,2,4,5,7,9,10,11].includes(lh)) hScore += 12;
      if (DUSTHANA_HOUSES.includes(lh)) hScore -= 10;
    }
    hScore += Math.min(10, occupants.filter(isBenefic).length * 5);
    hScore -= Math.min(10, occupants.filter(isNaturalMalefic).length * 5);
    supportHouses[house] = { house, lord, lordHouse: lordData ? houseOf(lordData.signId) : null, occupants, score: clamp(hScore) };
  }

  const d1TimingRelevance = {};
  for (const planet of Object.keys(grahas)) {
    let relevance = 0;
    const reasons = [];
    const house = houseOf(grahas[planet]?.signId);
    if (planet === fifthLord) { relevance += 40; reasons.push('D1 5th lord'); }
    if (planet === 'Jupiter') { relevance += 35; reasons.push('D1 Putra Karaka Jupiter'); }
    if (house === 5) { relevance += 25; reasons.push('D1 5th-house occupant'); }
    for (const h of [2,7,9,11]) {
      if (house === h) { relevance += h === 11 ? 18 : 10; reasons.push(`D1 ${h}th-house occupant`); }
      if (supportHouses[h]?.lord === planet) { relevance += h === 11 ? 18 : 10; reasons.push(`D1 ${h}th lord`); }
    }
    if (fifthAspects.some(a => a.planet === planet)) { relevance += 10; reasons.push('D1 5th-house aspecting planet'); }
    d1TimingRelevance[planet] = { score: clamp(relevance), reasons };
  }

  return {
    available: true,
    score: clamp(score),
    fifthSignId,
    fifthLord,
    fifthLordHouse: fifthLordData ? houseOf(fifthLordData.signId) : null,
    fifthOccupants,
    fifthAspects,
    supportHouses,
    timingRelevance: d1TimingRelevance,
    factors,
    cautionFactors: caution,
    confidence: 'medium',
    note: 'D1 promise में 5th lord, 5th occupants/aspects, Jupiter और 2/7/9/11 support को अलग layers में पढ़ा जाता है।'
  };
}

function buildCrossConfirmation(d1Context, fifth, jupiter, supportingHouses) {
  if (!d1Context?.available) return { available: false, score: 50, level: 'D1_NOT_AVAILABLE', confirmedFactors: [], conflictingFactors: [], details: [] };
  let score = 50;
  const confirmedFactors = [];
  const conflictingFactors = [];
  const details = [];
  const d1FifthLord = d1Context.fifthLord;

  const add = (points, detail, confirmed, conflict) => {
    score += points;
    details.push(detail);
    if (confirmed) confirmedFactors.push(detail);
    if (conflict) conflictingFactors.push(detail);
  };

  if (d1FifthLord === fifth.fifthLord) add(15, `D1 और D7 दोनों में 5th lord ${fifth.fifthLord} है।`, true, false);
  else add(-2, `D1 5th lord ${d1FifthLord || 'unknown'} और D7 5th lord ${fifth.fifthLord || 'unknown'} अलग हैं; इसे अपने-आप में conflict नहीं माना गया।`, false, false);

  if (d1Context.fifthLordHouse && d1Context.fifthLordHouse === fifth.fifthLordHouse) add(12, `D1 और D7 में 5th lord दोनों ${fifth.fifthLordHouse}वें भाव में हैं।`, true, false);
  if (d1Context.fifthOccupants?.some(p => p === fifth.fifthLord) || d1Context.fifthAspects?.some(a => a.planet === fifth.fifthLord)) add(6, 'D1 में D7 5th lord को progeny axis से अतिरिक्त linkage मिलता है।', true, false);
  if (d1Context.score >= 70 && fifth.score >= 70) add(12, 'D1 और D7 दोनों 5th-house promise को strong support देते हैं।', true, false);
  if (d1Context.score <= 40 && fifth.score >= 70) add(-12, 'D7 strong है लेकिन D1 promise comparatively weak है।', false, true);
  if (d1Context.score >= 70 && fifth.score <= 40) add(-12, 'D1 strong है लेकिन D7 confirmation comparatively weak है।', false, true);
  if (d1Context.supportHouses?.[11]?.score >= 65 && supportingHouses?.[11]?.score >= 65) add(8, 'D1 और D7 दोनों में 11th-house fulfilment support है।', true, false);
  if (d1Context.supportHouses?.[9]?.score >= 65 && supportingHouses?.[9]?.score >= 65) add(6, 'D1 और D7 दोनों में 9th-house blessing/support है।', true, false);
  if (d1Context.fifthAspects?.some(a => isBenefic(a.planet)) && jupiter?.score >= 70) add(5, 'D1 5th benefic influence और D7 Jupiter support एक दिशा में हैं।', true, false);
  if (d1Context.fifthAspects?.some(a => isNaturalMalefic(a.planet)) && fifth.score < 60) add(-6, 'D1 5th challenge और D7 promise weakness साथ दिखते हैं।', false, true);

  score = clamp(score);
  const level = score >= 75 ? 'STRONG_CONFIRMATION' : score >= 60 ? 'PARTIAL_CONFIRMATION' : score <= 40 ? 'CONFLICT' : 'MIXED';
  return { available: true, score, level, confirmedFactors, conflictingFactors, details };
}

function buildD1TimingActivation(d1Context, dashaTimeline) {
  if (!d1Context?.available || !dashaTimeline?.fullTimeline) {
return {
  available: false,
  bestScore: 0,
  currentScore: null,
  windows: [],
  scope: 'unavailable',
  note: 'D1 timing activation unavailable.'
};
  }

  const windows = [];
  for (const md of dashaTimeline.fullTimeline) {
    for (const ad of md.antardasha || []) {
      for (const pd of ad.pratyantar || []) {
        const mdR = Number(d1Context.timingRelevance?.[md.planet]?.score) || 0;
        const adR = Number(d1Context.timingRelevance?.[ad.planet]?.score) || 0;
        const pdR = Number(d1Context.timingRelevance?.[pd.planet]?.score) || 0;
        const score = clamp(mdR * 0.35 + adR * 0.30 + pdR * 0.35);
        const reasons = [
          ...(d1Context.timingRelevance?.[md.planet]?.reasons || []).map(x => `MD: ${x}`),
          ...(d1Context.timingRelevance?.[ad.planet]?.reasons || []).map(x => `AD: ${x}`),
          ...(d1Context.timingRelevance?.[pd.planet]?.reasons || []).map(x => `PD: ${x}`)
        ];

        if (score >= 35) {
          windows.push({
            from: pd.startDate,
            to: pd.endDate,
            score,
            confidence: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low',
            dasha: { mahadasha: md.planet, antardasha: ad.planet, pratyantar: pd.planet },
            reasons: [...new Set(reasons)]
          });
        }
      }
    }
  }

  windows.sort((a, b) => b.score - a.score || parseDate(a.from) - parseDate(b.from));
  const bestScore = windows[0]?.score || 0;

return {
  available: true,
  bestScore,
  currentScore: null,
  windows,
  scope: 'full evaluated timeline',
  note: 'bestScore पूरे evaluated timeline में उपलब्ध सबसे strong D1 activation है; यह current-period score नहीं है।'
};
}

function buildFinalPromiseSynthesis({ d1Context, d7Promise, crossConfirmation, delayAnalysis, expansion }) {
  const d1Score = d1Context?.available ? d1Context.score : 50;
  const d7Score = d7Promise?.score || 50;
  const crossScore = crossConfirmation?.available ? crossConfirmation.score : 50;
  const obstructionPenalty = Math.min(20, (delayAnalysis?.delayScore || 0) * 0.15 + (delayAnalysis?.severeObstructionScore || 0) * 0.10);
  const score = clamp(d1Context?.available
    ? d1Score * 0.30 + d7Score * 0.40 + crossScore * 0.20 + (expansion?.score || 50) * 0.10 - obstructionPenalty
    : d7Score * 0.65 + crossScore * 0.15 + (expansion?.score || 50) * 0.20 - obstructionPenalty);
  let verdict = 'MODERATE / MIXED PROGENY PROMISE';
  if (score >= 75) verdict = 'HIGHLY FAVORABLE / STRONG PROGENY PROMISE';
  else if (score >= 62) verdict = 'FAVORABLE / GOOD PROGENY PROMISE';
  else if (score <= 40) verdict = 'CHALLENGED / REQUIRES FURTHER CONFIRMATION';
  const confidence = crossConfirmation?.level === 'STRONG_CONFIRMATION' && score >= 70 ? 'high' : score >= 60 ? 'medium' : 'low';
  return { score, verdict, confidence, components: { d1Score, d7Score, crossScore, expansionScore: expansion?.score || 50, obstructionPenalty }, note: 'Final verdict D7 score alone पर आधारित नहीं है; D1, D7, cross-confirmation, expansion और obstruction सभी layers शामिल हैं।' };
}

function buildPromiseSynthesis({ fifth, jupiter, supportingHouses, d1Context, divisionalStrength, delayAnalysis }) {
  // Weighted, deliberately capped synthesis to reduce double-counting.
  const d7Core = clamp(
    fifth.score * 0.42 +
    jupiter.score * 0.30 +
    (supportingHouses[11]?.score || 50) * 0.10 +
    (supportingHouses[9]?.score || 50) * 0.08 +
    divisionalStrength.overallD7StrengthScore * 0.10
  );

  let score = d7Core;
  const confirmations = [];
  const contradictions = [];

  if (d1Context.available) {
    // D1 is a confirmation layer, not another full copy of D7 score.
    score = clamp(d7Core * 0.72 + d1Context.score * 0.28);
    if (d1Context.score >= 65) confirmations.push('D1 progeny indicators भी supportive हैं।');
    else if (d1Context.score <= 40) contradictions.push('D1 में कुछ challenging progeny indicators हैं।');
  }

  if (delayAnalysis.delayLevel === 'HIGH') contradictions.push('Delay factors strong हैं।');
  if (jupiter.score >= 75 && fifth.score >= 70) confirmations.push('D7 5th-house/5th-lord और Jupiter दोनों strong हैं।');

  let verdict = 'MODERATE';
  if (score >= 72) verdict = 'STRONG';
  else if (score <= 42) verdict = 'WEAK / CHALLENGED';

  let confidence = 'medium';
  if (d1Context.available && confirmations.length >= 2 && contradictions.length <= 1) confidence = 'high';
  if (!d1Context.available) confidence = 'medium';

  return { score, verdict, confidence, d7CoreScore: d7Core, confirmations, contradictions };
}

function parseDate(dateLike) {
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addYears(date, years) {
  return new Date(date.getTime() + years * YEAR_IN_MS);
}

function computeMahadashaSequence(moonTotalDegree, birthDateISO) {
  if (!Number.isFinite(Number(moonTotalDegree))) throw new Error('moonTotalDegree is required to compute Vimshottari Dasha.');
  const birthDate = parseDate(birthDateISO);
  if (!birthDate) throw new Error(`Invalid birthDateISO: ${birthDateISO}`);

  const normalizedDegree = ((Number(moonTotalDegree) % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(normalizedDegree / NAKSHATRA_SPAN);
  const lordIndex = nakshatraIndex % 9;
  const degreeIntoNakshatra = normalizedDegree - nakshatraIndex * NAKSHATRA_SPAN;
  const fractionElapsed = degreeIntoNakshatra / NAKSHATRA_SPAN;
  const firstLord = DASHA_ORDER[lordIndex];
  const balanceYears = DASHA_YEARS[firstLord] * (1 - fractionElapsed);

  const sequence = [];
  let cursor = birthDate;
  let elapsed = 0;
  let idx = lordIndex;

  while (elapsed < 120) {
    const planet = DASHA_ORDER[idx];
    const years = sequence.length === 0 ? balanceYears : DASHA_YEARS[planet];
    const end = addYears(cursor, years);
    sequence.push({
      planet,
      years: Number(years.toFixed(4)),
      isBalanceOfBirthDasha: sequence.length === 0,
      startDate: cursor.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    });
    cursor = end;
    elapsed += years;
    idx = (idx + 1) % 9;
  }
  return sequence;
}

function buildAntardashaSequence(mdPeriod) {
  if (!mdPeriod?.planet || !mdPeriod.startDate) return [];
  const mdLordIndex = DASHA_ORDER.indexOf(mdPeriod.planet);
  if (mdLordIndex < 0) return [];

  const start = parseDate(mdPeriod.startDate);
  const end = parseDate(mdPeriod.endDate);
  if (!start || !end) return [];
  const mdMs = end.getTime() - start.getTime();
  const sequence = [];
  let cursor = start;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(mdLordIndex + i) % 9];
    const fraction = DASHA_YEARS[lord] / 120;
    const duration = mdMs * fraction;
    const adEnd = i === 8 ? end : new Date(cursor.getTime() + duration);
    sequence.push({
      planet: lord,
      startDate: cursor.toISOString().slice(0, 10),
      endDate: adEnd.toISOString().slice(0, 10),
      parentMahadasha: mdPeriod.planet
    });
    cursor = adEnd;
  }
  return sequence;
}

function buildPratyantarSequence(adPeriod) {
  if (!adPeriod?.planet || !adPeriod?.startDate || !adPeriod?.endDate) return [];
  const mdLord = adPeriod.parentMahadasha;
  const mdIndex = DASHA_ORDER.indexOf(mdLord);
  const adIndex = DASHA_ORDER.indexOf(adPeriod.planet);
  if (mdIndex < 0 || adIndex < 0) return [];

  const start = parseDate(adPeriod.startDate);
  const end = parseDate(adPeriod.endDate);
  if (!start || !end) return [];
  const adMs = end.getTime() - start.getTime();
  const sequence = [];
  let cursor = start;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(adIndex + i) % 9];
    const duration = adMs * (DASHA_YEARS[lord] / 120);
    const pdEnd = i === 8 ? end : new Date(cursor.getTime() + duration);
    sequence.push({
      planet: lord,
      startDate: cursor.toISOString().slice(0, 10),
      endDate: pdEnd.toISOString().slice(0, 10),
      parentMahadasha: mdLord,
      parentAntardasha: adPeriod.planet
    });
    cursor = pdEnd;
  }
  return sequence;
}

function getDashaRelevance(planet, d7ChartData) {
  const fifthLord = d7ChartData?.fifthLordName;
  const occupants5 = d7ChartData?.houseOccupancy?.[5] || [];
  const reasons = [];
  let score = 20;

  if (planet === fifthLord) { score += 35; reasons.push('D7 पंचमेश'); }
  if (occupants5.includes(planet)) { score += 25; reasons.push('D7 पंचम भाव occupant'); }
  if (planet === 'Jupiter') { score += 30; reasons.push('Putra Karaka Jupiter'); }
  if (planet === 'Venus' || planet === 'Moon') { score += 12; reasons.push('secondary progeny-support significator'); }

  for (const house of [2, 7, 9, 11]) {
    const occupants = d7ChartData?.houseOccupancy?.[house] || [];
    if (occupants.includes(planet)) { score += 7; reasons.push(`D7 ${house}th-house occupant`); }
  }

  const relevance = score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low';
  return { score: clamp(score), relevance, reasons };
}

function buildDashaSantaanTimeline(mahadashaSequence, d7ChartData, options = {}) {
  const includeADPD = options.includeADPD !== false;
  const timeline = (mahadashaSequence || []).map(md => {
    const mdRel = getDashaRelevance(md.planet, d7ChartData);
    const ads = includeADPD ? buildAntardashaSequence(md) : [];
    const adTimeline = ads.map(ad => {
      const rel = getDashaRelevance(ad.planet, d7ChartData);
      const combined = clamp(mdRel.score * 0.45 + rel.score * 0.55);
      const pds = includeADPD ? buildPratyantarSequence(ad).map(pd => {
        const pdRel = getDashaRelevance(pd.planet, d7ChartData);
        return {
          ...pd,
          relevanceScore: clamp(combined * 0.45 + pdRel.score * 0.55),
          relevance: clamp(combined * 0.45 + pdRel.score * 0.55) >= 70 ? 'high' : clamp(combined * 0.45 + pdRel.score * 0.55) >= 45 ? 'moderate' : 'low',
          reasons: [...new Set([...mdRel.reasons, ...rel.reasons, ...pdRel.reasons])]
        };
      }) : [];
      return {
        ...ad,
        relevanceScore: combined,
        relevance: combined >= 70 ? 'high' : combined >= 45 ? 'moderate' : 'low',
        reasons: [...new Set([...mdRel.reasons, ...rel.reasons])],
        pratyantar: pds
      };
    });

    return {
      ...md,
      relevanceScore: mdRel.score,
      relevance: mdRel.relevance,
      reasons: mdRel.reasons,
      antardasha: adTimeline
    };
  });

  const strongADPD = [];
  for (const md of timeline) {
    for (const ad of md.antardasha || []) {
      for (const pd of ad.pratyantar || []) {
        if (pd.relevance === 'high') strongADPD.push(pd);
      }
    }
  }

  return {
    disclaimer: 'यह Vimshottari timing symbolic astrology heuristic है; exact event guarantee नहीं।',
    method: 'D1 Vimshottari MD + D7 progeny relevance + AD + PD',
    fullTimeline: timeline,
    strongWindows: strongADPD,
    favorableWindows: timeline.filter(x => x.relevance === 'high'),
    moderateWindows: timeline.filter(x => x.relevance === 'moderate')
  };
}

function normalizeTransit(transit) {
  if (!transit) return null;
  if (typeof transit === 'number') return { signId: transit, house: null };
  return {
    signId: Number(transit.signId || transit.d7SignId || 0) || null,
    house: safeHouse(transit.house)
  };
}

function analyzeTransitTriggers(transits, d7ChartData, d1RawData = null) {
  const jupiter = normalizeTransit(transits?.Jupiter);
  const saturn = normalizeTransit(transits?.Saturn);
  const findings = [];

  const fifthSign = d7ChartData?.houseSigns?.[5];
  const fifthLord = d7ChartData?.fifthLordName;
  const fifthLordData = d7ChartData?.planetCalculations?.[fifthLord];

  if (jupiter) {
    if (jupiter.house === 5 || jupiter.signId === fifthSign) findings.push({ planet: 'Jupiter', score: 30, reason: 'Transit Jupiter activates D7 5th-house sign/house.' });
    if (fifthLordData && jupiter.signId === fifthLordData.d7SignId) findings.push({ planet: 'Jupiter', score: 20, reason: 'Transit Jupiter activates D7 5th lord sign.' });
  }
  if (saturn) {
    if (saturn.house === 5 || saturn.signId === fifthSign) findings.push({ planet: 'Saturn', score: 10, reason: 'Transit Saturn activates D7 5th; interpreted mainly as a timing/pressure modifier.' });
    if (fifthLordData && saturn.signId === fifthLordData.d7SignId) findings.push({ planet: 'Saturn', score: 8, reason: 'Transit Saturn activates D7 5th lord sign.' });
  }

  // Optional D1 transit confirmation when caller supplies house/sign fields.
  if (d1RawData?.transits) {
    if (d1RawData.transits.Jupiter?.house === 5) findings.push({ planet: 'Jupiter', chart: 'D1', score: 20, reason: 'Transit Jupiter activates D1 5th house.' });
    if (d1RawData.transits.Saturn?.house === 5) findings.push({ planet: 'Saturn', chart: 'D1', score: 8, reason: 'Transit Saturn activates D1 5th house.' });
  }

  const score = clamp(50 + findings.reduce((sum, x) => sum + x.score, 0));
  return {
    available: Boolean(transits),
    score,
    findings,
    confidence: transits ? 'medium' : 'not-available',
    note: transits ? 'Transit layer is supportive trigger analysis, not a standalone event predictor.' : 'Transit dates/data not supplied; timing is dasha-only.'
  };
}

function buildTimingWindows({ dashaTimeline, transitAnalysis }) {
  const windows = [];
  for (const md of dashaTimeline?.fullTimeline || []) {
    for (const ad of md.antardasha || []) {
      for (const pd of ad.pratyantar || []) {
        const dashaScore = Number(pd.relevanceScore) || 0;
        const transitAvailable = Boolean(transitAnalysis?.available);
        const transitScore = transitAvailable ? Number(transitAnalysis.score) || 0 : null;

        // Keep D7 windows broad enough for D1 cross-checking.
        // Very low D7 periods are retained here; final candidate filtering
        // happens after D1+D7 union so D1-only activation is not lost.
        const score = transitAvailable
          ? clamp(dashaScore * 0.75 + transitScore * 0.25)
          : clamp(dashaScore);

        windows.push({
          from: pd.startDate,
          to: pd.endDate,
          score,
          d7DashaScore: dashaScore,
          confidence: score >= 80 && transitAvailable ? 'high' : score >= 70 ? 'medium' : 'low',
          dasha: {
            mahadasha: pd.parentMahadasha,
            antardasha: pd.parentAntardasha,
            pratyantar: pd.planet
          },
          transitSupport: transitAvailable ? transitAnalysis.findings : [],
          reasons: pd.reasons || [],
          candidateReason: dashaScore >= 70
            ? 'D7 strong activation'
            : dashaScore >= 45
              ? 'D7 moderate activation'
              : 'D7 low activation retained for D1 cross-check'
        });
      }
    }
  }

  windows.sort((a, b) => b.score - a.score || parseDate(a.from) - parseDate(b.from));
  return windows;
}

function getCurrentDashaState(dashaTimeline, dateLike = new Date()) {
  const target = parseDate(dateLike);
  if (!target || !dashaTimeline?.fullTimeline) return null;
  for (const md of dashaTimeline.fullTimeline) {
    const mdStart = parseDate(md.startDate);
    const mdEnd = parseDate(md.endDate);
    if (!mdStart || !mdEnd || target < mdStart || target >= mdEnd) continue;
    for (const ad of md.antardasha || []) {
      const adStart = parseDate(ad.startDate);
      const adEnd = parseDate(ad.endDate);
      if (!adStart || !adEnd || target < adStart || target >= adEnd) continue;
      for (const pd of ad.pratyantar || []) {
        const pdStart = parseDate(pd.startDate);
        const pdEnd = parseDate(pd.endDate);
        if (pdStart && pdEnd && target >= pdStart && target < pdEnd) {
          return {
            mahadasha: md.planet,
            antardasha: ad.planet,
            pratyantar: pd.planet,
            from: pd.startDate,
            to: pd.endDate,
            relevance: pd.relevance,
            relevanceScore: pd.relevanceScore,
            reasons: pd.reasons || []
          };
        }
      }
      return { mahadasha: md.planet, antardasha: ad.planet, pratyantar: null, from: ad.startDate, to: ad.endDate, relevance: ad.relevance, relevanceScore: ad.relevanceScore, reasons: ad.reasons || [] };
    }
    return { mahadasha: md.planet, antardasha: null, pratyantar: null, from: md.startDate, to: md.endDate, relevance: md.relevance, relevanceScore: md.relevanceScore, reasons: md.reasons || [] };
  }
  return null;
}

function filterRelevantTimingWindows(windows, birthDateISO, options = {}) {
  const now = parseDate(options.asOf || new Date()) || new Date();
  const maxYears = Number.isFinite(Number(options.maxYears)) ? Number(options.maxYears) : 20;
  const futureLimit = addYears(now, maxYears);
  const birth = parseDate(birthDateISO);
  return (windows || [])
    .filter(w => {
      const from = parseDate(w.from);
      const to = parseDate(w.to);
      if (!from || !to) return false;
      if (birth && to < birth) return false;
      if (to < now) return false;
      if (from > futureLimit) return false;
      return true;
    })
    .sort((a,b) => (b.finalTimingScore ?? b.score ?? 0) - (a.finalTimingScore ?? a.score ?? 0) || parseDate(a.from) - parseDate(b.from));
}

function buildD1D7Synthesis(d1Context, promise, d7Score) {
  const d1Score = d1Context?.available ? d1Context.score : null;
  if (d1Score === null) {
    return { score: Math.round(d7Score), level: d7Score >= 72 ? 'STRONG' : d7Score <= 42 ? 'CHALLENGED' : 'MODERATE', d1Score: null, d7Score: Math.round(d7Score), confirmation: 'D7_ONLY', confirmedFactors: [], conflictingFactors: [], finalInterpretation: 'D1 confirmation उपलब्ध नहीं है; D7 को अकेले timing/guarantee के रूप में नहीं पढ़ना चाहिए।' };
  }
  const score = clamp(d7Score * 0.70 + d1Score * 0.30);
  const confirmedFactors = [];
  const conflictingFactors = [];
  if (d1Score >= 65 && d7Score >= 65) {
    confirmedFactors.push('D1 और D7 दोनों में progeny promise broadly supportive है।');
  } else if (d1Score <= 40 && d7Score >= 65) {
    conflictingFactors.push('D7 supportive है लेकिन D1 में caution/challenge है।');
  } else if (d1Score >= 65 && d7Score <= 40) {
    conflictingFactors.push('D1 supportive है लेकिन D7 confirmation कमजोर है।');
  } else {
    conflictingFactors.push('D1 और D7 संकेत पूरी तरह एक दिशा में नहीं हैं।');
  }
  const confirmation = conflictingFactors.length && !confirmedFactors.length ? 'PARTIAL_OR_MIXED' : 'CONFIRMED';
  const level = score >= 72 ? 'STRONG' : score <= 42 ? 'CHALLENGED' : 'MODERATE';
  return { score: Math.round(score), level, d1Score: Math.round(d1Score), d7Score: Math.round(d7Score), confirmation, confirmedFactors, conflictingFactors, finalInterpretation: level === 'STRONG' ? 'D1 और D7 का संयुक्त संकेत संतान promise के पक्ष में है; timing के लिए dasha/transit confirmation आवश्यक है।' : level === 'CHALLENGED' ? 'D1 और D7 में पर्याप्त challenges हैं; denial का निष्कर्ष केवल इस score से नहीं निकालना चाहिए।' : 'D1 और D7 का संयुक्त संकेत mixed/moderate है; timing layers से further confirmation चाहिए।' };
}
function classifyTimingScore(score, layerAvailability = {}) {
  const value = Number(score) || 0;

  const d7 = Boolean(layerAvailability.d7);
  const d1 = Boolean(layerAvailability.d1);
  const transit = Boolean(layerAvailability.transit);

  // D7 + D1 + Transit
  if (value >= 75 && d7 && d1 && transit) {
    return 'STRONG_MULTI_LAYER';
  }

  // D7 + D1
  if (value >= 75 && d7 && d1) {
    return 'STRONG_D7_D1';
  }

  // D7 only
  if (value >= 75 && d7 && !d1 && !transit) {
    return 'STRONG_D7_ONLY';
  }

  if (value >= 60) return 'FAVORABLE';
  if (value >= 45) return 'MODERATE';
  if (value >= 30) return 'WEAK';

  return 'VERY_WEAK';
}

function classifyD1Activation(score) {
  const value = Number(score) || 0;
  if (value >= 75) return 'STRONG_D1_CONFIRMATION';
  if (value >= 60) return 'D1_CONFIRMED';
  if (value >= 45) return 'PARTIAL_D1_SUPPORT';
  if (value >= 30) return 'WEAK_D1_SUPPORT';
  return 'NO_D1_SUPPORT';
}

function buildCompactD7Response(a) {
  if (!a) return null;
  const fifth = a.fifthHouseAndLord || {};
  const jup = a.jupiterPutraKaraka || {};
  const delay = a.delayAndObstruction || {};
  const currentDasha = a.dashaTiming?.current || null;
  return {
    overallScore: a.overallScore,
    overallVerdict: a.overallVerdict,
    confidence: a.confidence,
    d1D7Synthesis: a.d1D7Synthesis,
    crossConfirmation: a.crossConfirmation,
    d1TimingActivation: { available: a.d1TimingActivation?.available, score: a.d1TimingActivation?.score, note: a.d1TimingActivation?.note },
    progeny: {
      fifthHouse: { house: 5, signId: fifth.fifthSignId, signName: fifth.fifthSignName, score: fifth.score, confidence: fifth.confidence },
      fifthLord: { planet: fifth.fifthLord, house: fifth.fifthLordHouse, score: fifth.lordScore, confidence: fifth.confidence },
      jupiter: { planet: 'Jupiter', house: jup.house, signId: jup.signId, score: jup.score, confidence: jup.confidence },
      expansion: { score: a.santaanExpansion?.score, level: a.santaanExpansion?.level, indication: a.santaanExpansion?.indication, confidence: a.santaanExpansion?.confidence, signals: a.santaanExpansion?.signals },
      nature: { score: a.santaanNature?.score, natureTag: a.santaanNature?.natureTag, confidence: a.santaanNature?.confidence },
      conceptionEase: { score: a.conceptionEase?.score, label: a.conceptionEase?.label, confidence: a.conceptionEase?.confidence, disclaimer: a.conceptionEase?.disclaimer }
    },
    delay: {
      level: delay.delayLevel,
      score: delay.delayScore,
      severeObstructionScore: delay.severeObstructionScore,
      severeObstructionLevel: delay.severeObstructionLevel,
      interpretation: delay.interpretation
    },
    dasha: currentDasha ? { ...currentDasha } : {},
    timing: {
      strongWindows: (a.timingWindows || []).filter(w => w.timingClass === 'STRONG').slice(0, 6),
      favorableWindows: (a.timingWindows || []).filter(w => w.timingClass === 'FAVORABLE').slice(0, 6),
      moderateWindows: (a.timingWindows || []).filter(w => w.timingClass === 'MODERATE').slice(0, 6),
      weakWindows: (a.timingWindows || []).filter(w => w.timingClass === 'WEAK').slice(0, 6),
      d1Confirmed: (a.timingWindows || []).filter(w => ['STRONG_D1_CONFIRMATION', 'D1_CONFIRMED'].includes(w.d1Confirmation)).slice(0, 6),
      d1PartialSupport: (a.timingWindows || []).filter(w => w.d1Confirmation === 'PARTIAL_D1_SUPPORT').slice(0, 6)
    },
    transit: { available: a.transitTriggers?.available, score: a.transitTriggers?.score, findings: a.transitTriggers?.findings || [] },
    methodology: a.methodology,
    synthesisText: a.synthesisText
  };
}

function analyzeD7Deep(d7ChartData, context = {}) {
  if (!d7ChartData?.lagna || !d7ChartData?.planetCalculations) throw new Error('Valid D7 chart data is required for deep analysis.');
  const fifth = analyzeFifthHouseAndLord(d7ChartData.houseOccupancy, d7ChartData.planetCalculations, d7ChartData.lagna.d7SignId);
  const fifthAspects = analyzeAspectsOnFifthHouse(d7ChartData.planetCalculations);
  const jupiter = analyzeJupiterInD7(d7ChartData.planetCalculations, fifth);
  const supportingHouses = analyzeSupportingHouses(d7ChartData);
  const divisionalStrength = analyzeDivisionalStrength(d7ChartData.planetCalculations, d7ChartData.lagna, fifth);
  const d1Context = analyzeD1ProgenyContext(context.d1RawData);
  const delayAnalysis = synthesizeDelayAndObstruction({ fifth, fifthAspects, jupiter, supportingHouses, divisionalStrength });
  const d7Promise = buildPromiseSynthesis({ fifth, jupiter, supportingHouses, d1Context: { available: false }, divisionalStrength, delayAnalysis });
  const expansion = analyzeSantaanExpansion({ fifth, fifthAspects, jupiter, supportingHouses });
  const nature = analyzeSantaanNature(fifth, jupiter, supportingHouses);
  const conceptionEase = analyzeConceptionEaseIndication(delayAnalysis, d7Promise.score);
  const crossConfirmation = buildCrossConfirmation(d1Context, fifth, jupiter, supportingHouses);
  const finalPromise = buildFinalPromiseSynthesis({ d1Context, d7Promise, crossConfirmation, delayAnalysis, expansion });

  let dashaTiming = null;
  if (context.mahadashaSequence) dashaTiming = buildDashaSantaanTimeline(context.mahadashaSequence, d7ChartData, { includeADPD: true });
  const d1Timing = buildD1TimingActivation(d1Context, dashaTiming);
  const transitAnalysis = analyzeTransitTriggers(context.transits, d7ChartData, context.d1RawData);
  const allTimingWindows = buildTimingWindows({ dashaTimeline: dashaTiming, transitAnalysis });
  const d1Map = new Map((d1Timing.windows || []).map(w => [`${w.from}|${w.to}`, w]));
  const candidateKeys = new Set([
    ...allTimingWindows.map(w => `${w.from}|${w.to}`),
    ...(d1Timing.windows || []).map(w => `${w.from}|${w.to}`)
  ]);

  const d7Map = new Map(allTimingWindows.map(w => [`${w.from}|${w.to}`, w]));
  const combinedTimingWindows = [];

  for (const key of candidateKeys) {
    const d7w = d7Map.get(key);
    const d1w = d1Map.get(key);
    const d7Score = Number(d7w?.d7DashaScore ?? d7w?.score) || 0;
    const d1Score = Number(d1w?.score) || 0;
    const transitAvailable = Boolean(transitAnalysis?.available);
    const transitScore = transitAvailable ? Number(transitAnalysis.score) || 0 : 0;

    // Only meaningful D7 or D1 activations become final candidates.
    if (d7Score < 35 && d1Score < 35) continue;

    let weightedTotal = 0;
    let weightTotal = 0;
    if (d7w) { weightedTotal += d7Score * 0.45; weightTotal += 0.45; }
    if (d1Timing.available && d1w) { weightedTotal += d1Score * 0.40; weightTotal += 0.40; }
    if (transitAvailable) { weightedTotal += transitScore * 0.15; weightTotal += 0.15; }

    const finalScore = weightTotal > 0 ? clamp(weightedTotal / weightTotal) : 0;
    const base = d7w || d1w;
    const d1Activation = d1w || { score: 0, reasons: [] };

    combinedTimingWindows.push({
      ...base,
      d7Activation: {
        available: Boolean(d7w),
        score: d7Score,
        reasons: d7w?.reasons || []
      },
      d1Activation,
      transitActivation: {
        available: transitAvailable,
        score: transitAvailable ? transitScore : null,
        findings: transitAvailable ? transitAnalysis.findings : []
      },
      finalTimingScore: Math.round(finalScore),
timingClass: classifyTimingScore(finalScore, {
  d7: Boolean(d7w),
  d1: Boolean(d1Timing.available && d1w),
  transit: transitAvailable
}),

confidence:
  transitAvailable && d7w && d1Timing.available && d1w
    ? (finalScore >= 75 ? 'high' : 'medium')
    : d7w && d1Timing.available && d1w
      ? (finalScore >= 60 ? 'medium' : 'low')
      : d7w
        ? (finalScore >= 75 ? 'medium' : 'low')
        : 'low',
      d1Confirmation: classifyD1Activation(d1Score),
      layerAvailability: { d7: Boolean(d7w), d1: Boolean(d1Timing.available && d1w), transit: transitAvailable },
      confidence: finalScore >= 80 ? 'high' : finalScore >= 65 ? 'medium' : 'low',
      timingMethod: d1Timing.available
        ? 'D7 activation + D1 activation + optional Jupiter/Saturn transit; available layers are renormalized'
        : 'D7 activation only + optional Jupiter/Saturn transit',
      combinedReasons: [...new Set([...(d7w?.reasons || []), ...(d1w?.reasons || [])])]
    });
  }
  combinedTimingWindows.sort((a,b) => b.finalTimingScore - a.finalTimingScore || b.score - a.score || parseDate(a.from) - parseDate(b.from));
  const relevantTimingWindows = filterRelevantTimingWindows(combinedTimingWindows, context.birthDateISO, { maxYears: context.maxTimingYears || 20, asOf: context.asOfDate || new Date() });
  if (dashaTiming) dashaTiming.current = getCurrentDashaState(dashaTiming, context.asOfDate || new Date());

  const currentDasha = dashaTiming?.current || null;
  const timingSupport = relevantTimingWindows[0]?.finalTimingScore || 0;
  const promiseScore = clamp(finalPromise.score);
  const timingScore = clamp(timingSupport);
  // Natal progeny promise is kept separate from future timing activation.
  const finalOverallScore = promiseScore;
  let overallVerdict = finalPromise.verdict;
  if (finalOverallScore >= 75) overallVerdict = 'Highly Favorable / Strong Progeny Promise';
  else if (finalOverallScore >= 62) overallVerdict = 'Favorable / Good Progeny Promise';
  else if (finalOverallScore <= 40) overallVerdict = 'Challenged / Requires Further Confirmation';

  const evidence = [...crossConfirmation.confirmedFactors, ...crossConfirmation.conflictingFactors, ...delayAnalysis.delayFactors.slice(0,4), ...expansion.signals.slice(0,6)];
  return {
    overallScore: finalOverallScore,
    promiseScore,
    timingScore,
    overallVerdict,
    confidence: finalPromise.confidence,
    promise: { score: promiseScore, verdict: overallVerdict, confidence: finalPromise.confidence, d7CoreScore: d7Promise.d7CoreScore, d1Confirmation: d1Context, finalSynthesis: finalPromise, confirmations: crossConfirmation.confirmedFactors, contradictions: crossConfirmation.conflictingFactors },
    fifthHouseAndLord: fifth, aspectsOnFifth: fifthAspects, jupiterPutraKaraka: jupiter, supportingHouses, divisionalStrength,
    delayAndObstruction: delayAnalysis, santaanExpansion: expansion, santaanNature: nature, conceptionEase,
    dashaTiming, d1TimingActivation: d1Timing, crossConfirmation,
    transitTriggers: transitAnalysis, timingWindows: relevantTimingWindows.slice(0,25), allTimingWindows: combinedTimingWindows.slice(0,100),
    d1D7Synthesis: { score: crossConfirmation.available ? clamp(d1Context.score * 0.45 + fifth.score * 0.35 + crossConfirmation.score * 0.20) : fifth.score, level: crossConfirmation.level, d1Score: d1Context.available ? d1Context.score : null, d7Score: fifth.score, confirmation: crossConfirmation.level, confirmedFactors: crossConfirmation.confirmedFactors, conflictingFactors: crossConfirmation.conflictingFactors, finalInterpretation: crossConfirmation.available ? 'D1 और D7 के specific significators तथा support houses को cross-confirm करके synthesis बनाया गया है।' : 'D1 उपलब्ध नहीं है; D7-only synthesis।' },
    currentTiming: currentDasha ? { ...currentDasha, bestUpcomingWindowScore: timingSupport, bestUpcomingWindowClass: relevantTimingWindows[0]?.timingClass || null, bestUpcomingWindow: relevantTimingWindows[0] || null, note: 'bestUpcomingWindowScore future evaluated timing activation है; यह natal promise score नहीं है।' } : null,
    evidence,
    methodology: { system: 'Parashari D7 + D1 5th/Jupiter/support-house cross-confirmation + MD/AD/PD D1+D7 activation + optional Jupiter/Saturn transit', childCount: 'qualitative expansion only; exact number intentionally not inferred', medicalClaims: false, note: 'Final score heuristic है; यह classical guaranteed event probability या medical fertility diagnosis नहीं है।' },
    synthesisText: `Final D1+D7 progeny promise ${finalOverallScore}/100 (${overallVerdict}). D1 score ${d1Context.available ? d1Context.score : 'N/A'}, D7 core ${d7Promise.score}, cross-confirmation ${crossConfirmation.score}. ${delayAnalysis.interpretation}`
  };
}

// Backward-compatible wrappers used by older interpreter code.
function analyzeSantaanCountIndication(houseOccupancy, fifth, aspects, jupiter) {
  return analyzeSantaanExpansion({
    fifth,
    fifthAspects: aspects,
    jupiter,
    supportingHouses: {
      2: { score: 50 },
      7: { score: 50 },
      9: { score: 50 },
      11: { score: (houseOccupancy?.[11]?.length || 0) ? 60 : 50 }
    }
  });
}

module.exports = {
  BENEFICS,
  NATURAL_MALEFICS,
  SPECIAL_ASPECTS,
  DASHA_ORDER,
  DASHA_YEARS,
  getAspectedHouses,
  getAspectRecords,
  getPlanetDignity,
  analyzeDivisionalStrength,
  analyzeFifthHouseAndLord,
  analyzeAspectsOnFifthHouse,
  analyzeJupiterInD7,
  analyzeSupportingHouses,
  analyzeSantaanCountIndication,
  analyzeSantaanExpansion,
  analyzeSantaanNature,
  analyzeConceptionEaseIndication,
  analyzeD1ProgenyContext,
  synthesizeDelayAndObstruction,
  buildPromiseSynthesis,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildPratyantarSequence,
  buildDashaSantaanTimeline,
  analyzeTransitTriggers,
  buildTimingWindows,
  analyzeD7Deep,
  getCurrentDashaState,
  filterRelevantTimingWindows,
  buildD1D7Synthesis,
  buildCompactD7Response
};
