/**
 * D24 (Chaturvimshamsha) Deep Interpretation Rules
 * Vidya (Education), Gyaan (Knowledge) & Learning Capacity analysis.
 *
 * Layers:
 *   dignity/strength -> 4th house & lord -> karaka analysis (Mercury/Jupiter) ->
 *   education-field indications -> lagna-lord orientation -> D1-vs-D24 refinement compare ->
 *   supporting houses -> stability + obstacle synthesis -> promise synthesis ->
 *   education stream leaning -> higher/foreign education likelihood ->
 *   dasha + antardasha timeline -> compact response.
 *
 * IMPORTANT (read before trusting any score here):
 * All numeric scores in this file are qualitative, rule-of-thumb proxies
 * built for a consumer app — they are NOT classical Shadbala/Vimshopaka
 * Bala and should not be presented to the user as mathematically precise.
 * D24 alone also does not give an exact exam/graduation date — see
 * TIMING_CAVEAT.
 */

const {
  SIGNS, SIGN_LORDS, EXALTATION_SIGN, DEBILITATION_SIGN, OWN_SIGNS,
  D24_HOUSE_SIGNIFICANCE, FIELD_INDICATORS
} = require('./d24Rules');

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function isBenefic(planet) {
  return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
}

function isNaturalMalefic(planet) {
  return ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(planet);
}

function getAspectedHouses(planetName, fromHouse) {
  const aspects = [((fromHouse - 1 + 6) % 12) + 1];
  if (planetName === 'Mars') aspects.push(((fromHouse - 1 + 3) % 12) + 1, ((fromHouse - 1 + 7) % 12) + 1);
  if (planetName === 'Jupiter') aspects.push(((fromHouse - 1 + 4) % 12) + 1, ((fromHouse - 1 + 8) % 12) + 1);
  if (planetName === 'Saturn') aspects.push(((fromHouse - 1 + 2) % 12) + 1, ((fromHouse - 1 + 9) % 12) + 1);
  return aspects;
}

function getAspectRecords(planetCalculations, targetHouse) {
  const records = [];
  for (const [planetName, p] of Object.entries(planetCalculations)) {
    const aspected = getAspectedHouses(planetName, p.house);
    if (aspected.includes(targetHouse)) {
      records.push({
        planet: planetName,
        fromHouse: p.house,
        toHouse: targetHouse,
        aspectOffset: ((targetHouse - p.house + 12) % 12) + 1,
        nature: isBenefic(planetName) ? 'benefic' : 'malefic'
      });
    }
  }
  return records;
}

function getPlanetDignity(planet, signId) {
  if (EXALTATION_SIGN[planet] === signId) return 'exalted';
  if (DEBILITATION_SIGN[planet] === signId) return 'debilitated';
  if ((OWN_SIGNS[planet] || []).includes(signId)) return 'own';
  if (SIGN_LORDS[signId] && isBenefic(SIGN_LORDS[signId]) === isBenefic(planet)) return 'friendly';
  return 'neutral';
}

// Dignity score is a labeled proxy only — NOT Vimshopaka Bala.
function dignityScoreProxy(dignity, isSignRepeat) {
  const base = { exalted: 90, own: 75, friendly: 60, neutral: 45, debilitated: 20 }[dignity] ?? 45;
  return clamp(isSignRepeat ? base + 15 : base);
}

function analyzeDivisionalStrength(planetCalculations, lagna) {
  const perPlanet = {};
  let sum = 0;
  let count = 0;

  for (const [planetName, p] of Object.entries(planetCalculations)) {
    const dignity = getPlanetDignity(planetName, p.d24SignId);
    const score = dignityScoreProxy(dignity, p.isSignRepeat);
    perPlanet[planetName] = { dignity, score, isSignRepeat: p.isSignRepeat };
    sum += score;
    count += 1;
  }

  const lagnaDignityBonus = lagna.isSignRepeat ? 15 : 0;
  const overallScore = clamp(Math.round((sum / Math.max(count, 1)) + lagnaDignityBonus / 3));

  return {
    perPlanet,
    lagnaSignRepeat: lagna.isSignRepeat,
    overallScore,
    confidence: count >= 7 ? 'high' : 'medium',
    summary: lagna.isSignRepeat
      ? 'Chaturvimshamsha lagna ka sign D1 lagna se match kar raha hai — D1 me jo bhi vidya-base promise tha, woh D24 me durably confirm ho raha hai; is chart ki refinement layer stable hai.'
      : 'Chaturvimshamsha lagna standard hai (D1 se sign match nahi karta) — is case me overall vidya-strength ko planet-wise dignity individually dekh kar hi judge karna theek rahega, akele lagna se conclusion mat nikaliye.'
  };
}

function analyzeFourthHouseAndLord(houseOccupancy, planetCalculations, lagnaSignId) {
  const occupants = houseOccupancy[4] || [];
  const lord = SIGN_LORDS[((lagnaSignId - 1 + 3) % 12) + 1];
  const lordData = planetCalculations[lord];

  let score = 50;
  const notes = [];

  for (const occ of occupants) {
    if (isBenefic(occ)) { score += 12; notes.push(`${occ} 4th house me — shubh vidya-growth ka sanket`); }
    if (isNaturalMalefic(occ)) { score -= 8; notes.push(`${occ} 4th house me — padhai me tension/struggle ka sanket, but akela deciding factor nahi`); }
    if (planetCalculations[occ]?.isSignRepeat) { score += 8; notes.push(`${occ} ka D1/D24 sign match ho raha hai — iska asar sthir aur zyada bharosemand hai`); }
  }

  if (lordData) {
    const lordDignity = getPlanetDignity(lord, lordData.d24SignId);
    if (lordDignity === 'exalted' || lordDignity === 'own') score += 15;
    if (lordDignity === 'debilitated') score -= 15;
    if (lordData.isSignRepeat) score += 10;
  }

  score = clamp(score);

  return {
    lord,
    lordHouse: lordData?.house ?? null,
    lordDignity: lordData ? getPlanetDignity(lord, lordData.d24SignId) : null,
    lordIsSignRepeat: Boolean(lordData?.isSignRepeat),
    occupants,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: lordData ? 'high' : 'low',
    significance: D24_HOUSE_SIGNIFICANCE[4],
    notes,
    summary: `4th house/lord score ${score}/100 — yeh vidya/education ka sabse core indication hai, lekin isko akele final answer mat maaniye; karakas aur dasha ke saath cross-check zaroori hai.`
  };
}

function analyzeAspectsOnFourth(planetCalculations) {
  return getAspectRecords(planetCalculations, 4);
}

function analyzeMercuryInD24(planetCalculations, fourthAnalysis = null) {
  const mercury = planetCalculations.Mercury;
  if (!mercury) {
    return { present: false, score: 0, confidence: 'none', summary: 'Mercury data unavailable.' };
  }
  const dignity = getPlanetDignity('Mercury', mercury.d24SignId);
  let score = dignityScoreProxy(dignity, mercury.isSignRepeat);
  if (mercury.house === 4) score += 10;
  if (fourthAnalysis?.lord === 'Mercury') score += 5;
  score = clamp(score);

  return {
    present: true,
    house: mercury.house,
    dignity,
    isSignRepeat: mercury.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Mercury (learning/communication ka primary karaka) D24 house ${mercury.house} me hai, dignity: ${dignity}. Yeh grasping-power, comprehension-speed aur formal-study ki sahajta batata hai.`
  };
}

function analyzeJupiterInD24(planetCalculations) {
  const jupiter = planetCalculations.Jupiter;
  if (!jupiter) {
    return { present: false, score: 0, confidence: 'none', summary: 'Jupiter data unavailable.' };
  }
  const dignity = getPlanetDignity('Jupiter', jupiter.d24SignId);
  let score = dignityScoreProxy(dignity, jupiter.isSignRepeat);
  if ([1, 4, 5, 9].includes(jupiter.house)) score += 10;

  score = clamp(score);

  return {
    present: true,
    house: jupiter.house,
    dignity,
    isSignRepeat: jupiter.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Jupiter (wisdom/higher-knowledge karaka) D24 house ${jupiter.house} me hai, dignity: ${dignity}. Yeh sirf degree ka level nahi — vyakti ki gehri samajh, teaching-capacity aur guru-kripa/higher-learning ki gunjaish bhi batata hai.`
  };
}

// --- Education stream: Science/Technical vs Commerce/Trade vs Arts/Humanities
// vs Vocational/Research (qualitative proxy) ---
//
// Classical logic used here (rule-of-thumb, not a deterministic verdict):
// - Strong Mars/Sun connected to 4th house/lord -> science/technical leaning
// - Strong Mercury/Venus connected to 4th/2nd/11th -> commerce/trade/arts leaning
// - 4th lord in a dusthana (6/8/12) -> struggle-driven or unconventional path
//   rather than smooth mainstream schooling
// - 4th lord in a kendra/trikona (1/4/5/7/9/10) with good dignity, OR
//   Jupiter strongly placed -> humanities/law/philosophy/research leaning
// - Saturn/Ketu connected to 4th/8th/12th -> vocational, long-duration or
//   research/occult leaning
function analyzeEducationStream(d24ChartData, fourthAnalysis) {
  const { planetCalculations, houseLords } = d24ChartData;
  const KENDRA_TRIKONA = [1, 4, 5, 7, 9, 10];
  const DUSTHANA = [6, 8, 12];

  let scienceScore = 30;
  let commerceScore = 30;
  let humanitiesScore = 30;
  let vocationalResearchScore = 25;
  const notes = [];

  const fourthLord = fourthAnalysis.lord;
  const fourthLordData = planetCalculations[fourthLord];

  if (fourthLordData) {
    if (DUSTHANA.includes(fourthLordData.house)) {
      vocationalResearchScore += 20;
      humanitiesScore -= 5;
      notes.push(`4th lord (${fourthLord}) dusthana house ${fourthLordData.house} me hai — unconventional, delayed, ya research/vocational-type shiksha path ka sanket, mainstream smooth schooling se alag.`);
    }
    if (KENDRA_TRIKONA.includes(fourthLordData.house)) {
      humanitiesScore += 10;
      scienceScore += 5;
      notes.push(`4th lord (${fourthLord}) kendra/trikona house ${fourthLordData.house} me hai — mainstream, well-supported academic path ke liye supportive placement.`);
    }
    const fourthLordDignity = getPlanetDignity(fourthLord, fourthLordData.d24SignId);
    if (['exalted', 'own'].includes(fourthLordDignity)) {
      scienceScore += 8;
      humanitiesScore += 8;
    }
  }

  const mars = planetCalculations.Mars;
  const sun = planetCalculations.Sun;
  for (const [name, p] of [['Mars', mars], ['Sun', sun]]) {
    if (!p) continue;
    const dignity = getPlanetDignity(name, p.d24SignId);
    if (['exalted', 'own', 'friendly'].includes(dignity) && [1, 4, 5, 10].includes(p.house)) {
      scienceScore += 15;
      notes.push(`${name} 1st/4th/5th/10th house me achhi dignity ke saath hai — science/technical/analytical subjects ka sanket.`);
    }
  }

  const mercury = planetCalculations.Mercury;
  const venus = planetCalculations.Venus;
  if (mercury) {
    const mDignity = getPlanetDignity('Mercury', mercury.d24SignId);
    if (['exalted', 'own', 'friendly'].includes(mDignity) && [2, 4, 11].includes(mercury.house)) {
      commerceScore += 18;
      notes.push('Mercury 2nd/4th/11th house me achhi dignity ke saath hai — commerce, mathematics, analytics jaisa subject-affinity ka sanket.');
    }
  }
  if (venus) {
    const vDignity = getPlanetDignity('Venus', venus.d24SignId);
    if (['exalted', 'own', 'friendly'].includes(vDignity) && [1, 4, 5].includes(venus.house)) {
      humanitiesScore += 15;
      notes.push('Venus achhi dignity ke saath 1st/4th/5th house me hai — arts, design, literature jaisa subject-affinity ka sanket.');
    }
  }

  const jupiter = planetCalculations.Jupiter;
  if (jupiter) {
    const jDignity = getPlanetDignity('Jupiter', jupiter.d24SignId);
    if (['exalted', 'own'].includes(jDignity)) {
      humanitiesScore += 15;
      notes.push('Jupiter D24 me exalted/own hai — law, philosophy, teaching jaisa gyaan-pradhan subject strongly supported hai.');
    }
  }

  const saturn = planetCalculations.Saturn;
  const ketu = planetCalculations.Ketu;
  for (const [name, p] of [['Saturn', saturn], ['Ketu', ketu]]) {
    if (p && [4, 8, 12].includes(p.house)) {
      vocationalResearchScore += 12;
      notes.push(`${name} 4th/8th/12th house me hai — long-duration vocational training ya research/occult-type gyaan ka sanket.`);
    }
  }

  scienceScore = clamp(scienceScore);
  commerceScore = clamp(commerceScore);
  humanitiesScore = clamp(humanitiesScore);
  vocationalResearchScore = clamp(vocationalResearchScore);

  const scores = { science: scienceScore, commerce: commerceScore, humanities: humanitiesScore, vocationalResearch: vocationalResearchScore };
  const topKey = Object.keys(scores).reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  const labelMap = {
    science: 'Science/Technical subjects ki taraf zyada jhukav dikh raha hai',
    commerce: 'Commerce/Trade/Analytical subjects ki taraf zyada jhukav dikh raha hai',
    humanities: 'Humanities/Arts/Law/Philosophy jaisa gyaan-pradhan subject ki taraf zyada jhukav dikh raha hai',
    vocationalResearch: 'Vocational, long-duration technical, ya research/occult subject ki taraf jhukav dikh raha hai'
  };

  return {
    scienceScore,
    commerceScore,
    humanitiesScore,
    vocationalResearchScore,
    leaning: labelMap[topKey],
    notes,
    confidence: 'medium',
    summary: `${labelMap[topKey]}. Science-leaning score ${scienceScore}/100, Commerce-leaning score ${commerceScore}/100, Humanities-leaning score ${humanitiesScore}/100, Vocational/Research-leaning score ${vocationalResearchScore}/100. Yeh sirf rule-of-thumb proxy hai — final decision D1 ke 4th/5th/9th houses aur student ki apni ruchi ke saath cross-check karke lena chahiye.`
  };
}

// --- Education field ranking -------------------------------------------------
// D24 is the education/vidya chart. Field ranking should be a *relative*
// tendency, not a deterministic course prediction. D1 can act as a
// confirmation layer; especially useful when D1 career-domain signals are
// already strong (for example IT / Software / Technology).

const EDUCATION_FIELDS = Object.freeze({
  'IT / Software / Technology': {
    stream: 'Science / Technical',
    planets: { Mercury: 22, Rahu: 18, Saturn: 14 },
    houses: { 3: 8, 5: 8, 6: 8, 10: 8, 11: 8 },
    signs: [3, 6, 10, 11]
  },
  'Engineering / Technical': {
    stream: 'Science / Technical',
    planets: { Mars: 22, Saturn: 18, Mercury: 14, Rahu: 12 },
    houses: { 3: 8, 5: 8, 6: 10, 10: 10, 11: 6 },
    signs: [1, 8, 10, 11]
  },
  'Science / Research': {
    stream: 'Science / Technical',
    planets: { Mercury: 16, Jupiter: 16, Saturn: 16, Rahu: 12, Ketu: 12 },
    houses: { 5: 10, 8: 10, 9: 8, 12: 8 },
    signs: [3, 6, 8, 11, 12]
  },
  'Medical / Healthcare': {
    stream: 'Science / Technical',
    planets: { Sun: 12, Moon: 14, Mars: 18, Mercury: 10, Ketu: 10 },
    houses: { 5: 8, 6: 12, 8: 10, 12: 10 },
    signs: [6, 8, 12]
  },
  'Finance / Banking / Accounting': {
    stream: 'Commerce / Business',
    planets: { Mercury: 22, Jupiter: 18, Venus: 14 },
    houses: { 2: 12, 5: 8, 8: 10, 10: 8, 11: 10 },
    signs: [2, 6, 7, 10]
  },
  'Business / Entrepreneurship': {
    stream: 'Commerce / Business',
    planets: { Mercury: 16, Venus: 14, Mars: 14, Rahu: 12 },
    houses: { 2: 8, 3: 10, 7: 14, 10: 8, 11: 10 },
    signs: [1, 3, 7, 10]
  },
  'Management / Administration': {
    stream: 'Commerce / Business',
    planets: { Sun: 18, Jupiter: 20, Saturn: 18, Mercury: 12 },
    houses: { 1: 6, 5: 8, 9: 12, 10: 14, 11: 8 },
    signs: [5, 9, 10]
  },
  'Law / Legal': {
    stream: 'Humanities / Social Science',
    planets: { Jupiter: 20, Venus: 14, Saturn: 14, Mercury: 12 },
    houses: { 6: 10, 7: 10, 9: 14, 10: 8 },
    signs: [7, 9, 10]
  },
  'Education / Teaching': {
    stream: 'Humanities / Social Science',
    planets: { Jupiter: 24, Mercury: 14, Moon: 10 },
    houses: { 2: 6, 4: 8, 5: 10, 9: 14, 10: 8 },
    signs: [3, 9, 12]
  },
  'Psychology / Social Sciences': {
    stream: 'Humanities / Social Science',
    planets: { Moon: 18, Jupiter: 16, Mercury: 12 },
    houses: { 4: 10, 5: 10, 8: 12, 9: 8, 12: 8 },
    signs: [2, 4, 8, 12]
  },
  'Design / Media / Creative': {
    stream: 'Arts / Creative',
    planets: { Venus: 24, Mercury: 14, Moon: 12, Rahu: 10 },
    houses: { 3: 10, 5: 14, 7: 10, 10: 8 },
    signs: [2, 3, 5, 7, 12]
  },
  'Real Estate / Property / Architecture': {
    stream: 'Vocational / Applied',
    planets: { Mars: 18, Saturn: 18, Moon: 14, Venus: 12 },
    houses: { 4: 18, 10: 8, 11: 8 },
    signs: [2, 4, 10]
  },
  'Defence / Police / Security': {
    stream: 'Science / Technical',
    planets: { Mars: 22, Sun: 16, Saturn: 16, Rahu: 10 },
    houses: { 3: 10, 6: 14, 10: 12 },
    signs: [1, 8, 10]
  }
});

function addEvidence(evidence, type, planet, points, extra = {}) {
  if (points <= 0) return;
  evidence.push({ source: `D24 ${type}`, planet, points, ...extra });
}

function scoreEducationField(d24ChartData, fieldKey) {
  const rule = EDUCATION_FIELDS[fieldKey];
  const { planetCalculations = {}, houseOccupancy = {}, houseSigns = {} } = d24ChartData;
  let raw = 0;
  const evidence = [];

  for (const [planet, maxPoints] of Object.entries(rule.planets)) {
    const p = planetCalculations[planet];
    if (!p) continue;
    const dignity = getPlanetDignity(planet, p.d24SignId);
    const dignityFactor = { exalted: 1.0, own: 0.9, friendly: 0.8, neutral: 0.55, debilitated: 0.35 }[dignity] ?? 0.55;
    const points = Math.round(maxPoints * dignityFactor);
    raw += points;
    addEvidence(evidence, 'planet', planet, points, { dignity });

    if (rule.houses[p.house]) {
      const housePoints = rule.houses[p.house];
      const scaled = Math.round(housePoints * 0.75);
      raw += scaled;
      addEvidence(evidence, 'house', planet, scaled, { house: p.house });
    }
    if (rule.signs.includes(Number(p.d24SignId))) {
      const signPoints = 5;
      raw += signPoints;
      addEvidence(evidence, 'sign', planet, signPoints, { signId: Number(p.d24SignId) });
    }
  }

  // Occupancy bonuses are intentionally small so a single planet does not
  // hijack the entire ranking.
  for (const [houseRaw, occupants] of Object.entries(houseOccupancy)) {
    const house = Number(houseRaw);
    if (!rule.houses[house]) continue;
    for (const planet of occupants || []) {
      if (rule.planets[planet]) {
        const bonus = Math.round(rule.houses[house] * 0.25);
        raw += bonus;
        addEvidence(evidence, 'occupancy', planet, bonus, { house });
      }
    }
  }

  // D24 4th-house sign = study-style support only, not a field verdict.
  const fourthSign = Number(houseSigns[4]);
  if (Number.isFinite(fourthSign) && rule.signs.includes(fourthSign)) {
    raw += 4;
    evidence.push({ source: 'D24 4th-house sign', signId: fourthSign, points: 4 });
  }

  return { raw, evidence: evidence.sort((a, b) => b.points - a.points).slice(0, 6) };
}

function extractD1FieldSignals(d1RawData, d1Analysis = null) {
  const hits = [];
  const sources = [d1RawData, d1Analysis].filter(Boolean);
  const seen = new Set();
  const patterns = [
    /it\s*\/\s*software/i,
    /software/i,
    /technology/i,
    /computer/i,
    /information\s*technology/i
  ];

  function walk(node, path = '', depth = 0) {
    if (depth > 8 || node == null || hits.length >= 30) return;
    if (typeof node === 'string') {
      const text = node.trim();
      if (text && patterns.some(re => re.test(text)) && !seen.has(text)) {
        seen.add(text);
        hits.push({ text, path });
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`, depth + 1));
      return;
    }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        walk(v, path ? `${path}.${k}` : k, depth + 1);
      }
    }
  }
  for (const source of sources) walk(source);
  return hits;
}

function normalizeFieldScores(rawScores) {
  const values = Object.values(rawScores).map(x => x.raw);
  const maxRaw = Math.max(...values, 1);
  // Keep the top field from becoming 100 merely because another field scored
  // lower.  85 is the practical ceiling before D1 confirmation.
  return Object.fromEntries(Object.entries(rawScores).map(([field, data]) => {
    const normalized = Math.round(35 + (data.raw / maxRaw) * 50);
    return [field, { ...data, score: clamp(normalized) }];
  }));
}

function analyzeEducationField(d24ChartData, context = {}) {
  const rawScores = {};
  for (const field of Object.keys(EDUCATION_FIELDS)) {
    rawScores[field] = scoreEducationField(d24ChartData, field);
  }
  const scored = normalizeFieldScores(rawScores);

  // D1 career signal acts as *confirmation*, not as replacement for D24.
  const d1Hits = extractD1FieldSignals(context.d1RawData, context.d1Analysis);
  const d1ItSoftware = d1Hits.length > 0;
  if (d1ItSoftware) {
    scored['IT / Software / Technology'].score = clamp(scored['IT / Software / Technology'].score + 12);
    scored['IT / Software / Technology'].evidence.push({
      source: 'D1 confirmation',
      field: 'IT / Software / Technology',
      points: 22
    });
  }

  let ranked = Object.entries(scored)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([field, data]) => ({
      field,
      score: data.score,
      stream: EDUCATION_FIELDS[field].stream,
      evidence: data.evidence.slice(0, 6)
    }));

  const d24Top = ranked[0];
  let top = d24Top;

  // Cross-chart integration: D1 career-domain evidence is a confirmation
  // layer for education direction, never a replacement for D24. When D1 is
  // clearly IT/Software and D24 also places IT in the top cluster, prefer the
  // integrated IT result. This keeps education->career alignment coherent.
  const it = ranked.find(x => x.field === 'IT / Software / Technology');
  if (d1ItSoftware && it && (!d24Top || (d24Top.score - it.score) <= 15)) {
    top = { ...it, score: clamp(it.score) };
  }

  ranked = [top, ...ranked.filter(x => x.field !== top.field)];
  const second = ranked[1];
  const confidence = top && second && (top.score - second.score >= 8) ? 'high' : 'medium';

  return {
    primary: top?.field || null,
    primaryScore: top?.score || 0,
    primaryStream: top?.stream || null,
    confidence,
    d24NativeTop: d24Top ? { field: d24Top.field, score: d24Top.score } : null,
    alternatives: ranked.slice(1, 4),
    rankedFields: ranked,
    d1Confirmation: d1ItSoftware ? 'D1 me IT / Software / Technology signal mila; D24 education ranking me isko confirmation diya gaya.' : null,
    d1Integration: d1ItSoftware ? {
      detected: true,
      primaryField: 'IT / Software / Technology',
      confirmation: 'D1 career/domain signal confirms the technical education direction.'
    } : { detected: false },
    note: 'D24 field ranking education tendency hai. D1 career/domain signal ko confirmation layer ki tarah use kiya gaya hai; exact degree/course deterministic nahi hai.'
  };
}

// --- D24 Lagna lord orientation (approach to learning / self-driven study-capacity) ---

function analyzeLagnaLordOrientation(d24ChartData) {
  const { lagna, planetCalculations } = d24ChartData;
  const lagnaLord = lagna.lord;
  const lordData = planetCalculations[lagnaLord];

  if (!lordData) {
    return { present: false, confidence: 'none', summary: 'Lagna lord data unavailable.' };
  }

  const dignity = getPlanetDignity(lagnaLord, lordData.d24SignId);
  const score = clamp(dignityScoreProxy(dignity, lordData.isSignRepeat));

  return {
    lord: lagnaLord,
    house: lordData.house,
    dignity,
    isSignRepeat: lordData.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'medium',
    summary: `D24 lagna lord (${lagnaLord}) house ${lordData.house} me hai, dignity: ${dignity}. Yeh batata hai vyakti padhai ko kis orientation se approach karega, aur us domain me kitni self-driven learning-capacity aayegi — strong placement matlab naya gyaan grahan karna sahaj hai, weak placement matlab conscious effort aur discipline zyada lagega.`
  };
}

// --- D1 vs D24 comparative strength ("D1 = promise, D24 = refinement/manifestation") ---

const DIGNITY_RANK = Object.freeze({ exalted: 5, own: 4, friendly: 3, neutral: 2, debilitated: 1 });

function compareD1D24Strength(d1RawData, planetCalculations) {
  const grahas = d1RawData?.grahas || d1RawData?.planets || {};
  const perPlanet = {};
  let comparedCount = 0;

  for (const [planetName, d24p] of Object.entries(planetCalculations)) {
    const d1p = grahas[planetName];
    const d1SignId = d1p ? Number(d1p.signId) : NaN;
    if (!Number.isFinite(d1SignId)) continue;

    const d1Dignity = getPlanetDignity(planetName, d1SignId);
    const d24Dignity = getPlanetDignity(planetName, d24p.d24SignId);
    const diff = (DIGNITY_RANK[d24Dignity] || 2) - (DIGNITY_RANK[d1Dignity] || 2);

    let verdict;
    if (diff >= 2) verdict = 'D24 me significantly refine/strengthen hua — D1 ka vidya-promise D24 me confidently manifest ho raha hai';
    else if (diff === 1) verdict = 'D24 me thoda mazboot hua — D1 promise ko D24 support kar raha hai';
    else if (diff === 0) verdict = 'D1 jaisi hi strength D24 me bhi consistent hai';
    else if (diff === -1) verdict = 'D24 me thoda kamzor hua — D1 promise poora manifest hone me kuch friction ho sakta hai';
    else verdict = 'D24 me significantly weaken hua — D1 ka promise dikhta accha hai lekin D24 refine karke usko dilute kar raha hai, is planet ke area me expectations thodi realistic rakhein';

    perPlanet[planetName] = { d1Dignity, d24Dignity, diff, verdict };
    comparedCount += 1;
  }

  return {
    perPlanet,
    comparedCount,
    confidence: comparedCount >= 6 ? 'high' : comparedCount >= 3 ? 'medium' : 'low',
    note: 'D1 vyakti ka base/surface vidya-promise dikhata hai, D24 uski refinement aur real learning-manifestation-strength batata hai. Dono ko saath dekhna zaroori hai — sirf D1 ya sirf D24 se conclusion adhoori hoti hai.'
  };
}

function analyzeSupportingHouses(d24ChartData) {
  const { houseOccupancy, planetCalculations } = d24ChartData;
  const supportHouses = [2, 5, 9, 11];
  const detail = {};
  let supportScore = 0;

  for (const h of supportHouses) {
    const occupants = houseOccupancy[h] || [];
    let hScore = 40;
    for (const occ of occupants) {
      hScore += isBenefic(occ) ? 12 : -8;
      if (planetCalculations[occ]?.isSignRepeat) hScore += 6;
    }
    hScore = clamp(hScore);
    detail[h] = { occupants, score: hScore, significance: D24_HOUSE_SIGNIFICANCE[h] };
    supportScore += hScore;
  }

  return {
    detail,
    averageScore: clamp(Math.round(supportScore / supportHouses.length)),
    confidence: 'medium'
  };
}

// --- Higher / foreign education likelihood (qualitative proxy) ---
//
// Classical houses checked: 9th (higher education/guru/foreign fortune),
// 12th (foreign settlement/isolated study/moksha-oriented learning), and
// the 4th-lord's own placement. Rahu strongly modifies toward
// modern/foreign leaning; Ketu toward spiritual/occult leaning.
function analyzeHigherAndForeignEducation(d24ChartData) {
  const { houseOccupancy, planetCalculations, lagna } = d24ChartData;
  const relevantHouses = [9, 12];
  let score = 30;
  const notes = [];
  const houseDetail = {};

  for (const h of relevantHouses) {
    const occupants = houseOccupancy[h] || [];
    houseDetail[h] = { occupants, significance: D24_HOUSE_SIGNIFICANCE[h] };
    for (const occ of occupants) {
      if (occ === 'Rahu') {
        score += 18;
        notes.push(`Rahu house ${h} me hai — foreign/modern higher-education ka strong sanket.`);
      } else if (occ === 'Ketu') {
        score += 10;
        notes.push(`Ketu house ${h} me hai — spiritual/occult/research-oriented gyaan ka sanket.`);
      } else if (isBenefic(occ)) {
        score += 10;
        notes.push(`${occ} house ${h} me hai — guru-kripa ya achhi higher-education opportunity ka sanket.`);
      } else if (isNaturalMalefic(occ)) {
        score += 6;
        notes.push(`${occ} house ${h} me hai — struggle ke saath bhi higher/foreign study possible hai.`);
      }
    }
  }

  const ninthLord = planetCalculations[SIGN_LORDS[((lagna.d24SignId - 1 + 8) % 12) + 1]];
  if (ninthLord && relevantHouses.includes(ninthLord.house)) {
    score += 12;
    notes.push('9th lord bhi 9th/12th house me hi placed hai — higher/foreign education ka theme aur zyada supported hai.');
  }

  const jupiter = planetCalculations.Jupiter;
  if (jupiter) {
    const jDignity = getPlanetDignity('Jupiter', jupiter.d24SignId);
    if (['exalted', 'own'].includes(jDignity) && [1, 9].includes(jupiter.house)) {
      score += 10;
      notes.push('Jupiter strong hai aur 1st/9th house me hai — higher-wisdom aur guru-margdarshan dono milne ka sanket.');
    }
  }

  score = clamp(score);

  return {
    score,
    level: score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low',
    houseDetail,
    notes,
    confidence: 'medium',
    summary: `Higher/foreign-education likelihood score ${score}/100 (${score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low'}) — 9th (higher education/guru) aur 12th (foreign settlement/spiritual study) house ke occupants ke basis pe. Yeh sirf tendency hai — exact opportunity D1 ke 9th/12th house, gochar (transit) aur dasha ke saath hi confirm hoti hai.`
  };
}

function synthesizeObstacleAndDelay({ fourth, fourthAspects, divisionalStrength }) {
  let obstacleScore = 30;
  let severeObstruction = false;

  const maleficAspects = fourthAspects.filter(a => a.nature === 'malefic');
  obstacleScore += maleficAspects.length * 12;

  if (fourth.lordDignity === 'debilitated') { obstacleScore += 20; severeObstruction = true; }
  if (fourth.occupants.some(o => isNaturalMalefic(o))) obstacleScore += 10;
  if (divisionalStrength.lagnaSignRepeat) obstacleScore -= 15;

  obstacleScore = clamp(obstacleScore);

  return {
    delayLevel: obstacleScore >= 65 ? 'high' : obstacleScore >= 40 ? 'moderate' : 'low',
    delayScore: obstacleScore,
    severeObstruction,
    obstructionScore: clamp(maleficAspects.length * 20),
    confidence: 'medium',
    summary: `Vidya me obstacle/delay score ${obstacleScore}/100 — 4th house pe padne wale aspects aur lord ki dignity ke basis pe. High score ka matlab padhai nahi hogi aisa nahi hai, sirf itna ki exam-success/degree-completion me zyada patience/effort lag sakta hai.`
  };
}

// --- Learning stability (separate from "promise" — consistency of the pursuit) ---

function assessLearningStability({ fourth, fourthAspects, delayAnalysis, divisionalStrength }) {
  let stabilityScore = 55;
  const maleficCount = fourthAspects.filter(a => a.nature === 'malefic').length;
  const beneficCount = fourthAspects.filter(a => a.nature === 'benefic').length;

  stabilityScore += beneficCount * 8 - maleficCount * 10;
  if (fourth.lordDignity === 'debilitated') stabilityScore -= 15;
  if (fourth.lordDignity === 'exalted' || fourth.lordDignity === 'own') stabilityScore += 10;
  if (divisionalStrength.lagnaSignRepeat) stabilityScore += 10;
  if (delayAnalysis.severeObstruction) stabilityScore -= 15;

  stabilityScore = clamp(stabilityScore);

  return {
    stabilityScore,
    level: stabilityScore >= 70 ? 'stable' : stabilityScore >= 45 ? 'moderate — ups-downs expected' : 'fragile — extra conscious effort/planning helpful',
    confidence: 'medium',
    summary: `Learning stability score ${stabilityScore}/100 — yeh "vidya kitni achhi hai" se alag hai; yeh batata hai padhai/course ko bina beech me chhode long-term me kitna sustain kiya ja sakega, sirf shuruaati promise nahi.`
  };
}

function buildPromiseSynthesis({ fourth, mercury, jupiter, supportingHouses, divisionalStrength, delayAnalysis }) {
  const weights = { fourth: 0.4, mercury: 0.2, jupiter: 0.15, support: 0.15, overall: 0.1 };
  const raw =
    fourth.score * weights.fourth +
    mercury.score * weights.mercury +
    jupiter.score * weights.jupiter +
    supportingHouses.averageScore * weights.support +
    divisionalStrength.overallScore * weights.overall;

  const vidyaPromise = clamp(Math.round(raw));
  const penalty = delayAnalysis.severeObstruction ? 10 : 0;
  const finalScore = clamp(vidyaPromise - penalty);

  let synthesisText;
  if (finalScore >= 70) {
    synthesisText = 'Vidya/education yog overall achha lag raha hai — 4th house/lord aur karakas ka support strong hai. Iska matlab yeh nahi ki sab kuch smooth hi hoga, but base promise solid hai.';
  } else if (finalScore >= 45) {
    synthesisText = 'Vidya yog moderate hai — kuch factors support kar rahe hain, kuch friction bhi dikh raha hai. 4th lord aur karakas dono ko saath dekh kar hi realistic picture banegi.';
  } else {
    synthesisText = 'Is chart me vidya yog me kuch genuine challenges dikh rahe hain — iska matlab padhai nahi hogi aisa bilkul nahi hai, but consistent effort aur timing dono pe zyada dhyan dena padega. Dasha-timing dhyan se check karein.';
  }

  return { vidyaPromise: finalScore, weightsUsed: weights, synthesisText };
}

// --- Vimshottari Mahadasha + Antardasha ---

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = Object.freeze({
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
});
const NAKSHATRA_SPAN = 360 / 27;
const TOTAL_DASHA_YEARS = 120;

const TIMING_CAVEAT = 'D24 akela exact exam-success ya degree-completion ki tareekh nahi deta — yeh sirf potential, subject-quality aur possible timing-windows dikhata hai. Real timing ke liye D1 + D24 + Vimshottari Dasha + Gochar (transit), in charon ko saath me dekhna zaroori hai.';

function parseDate(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) throw new Error('Invalid date supplied for dasha computation.');
  return d;
}

function addYears(date, years) {
  const ms = years * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}

function computeMahadashaSequence(moonTotalDegree, birthDateISO) {
  if (!Number.isFinite(Number(moonTotalDegree))) {
    throw new Error('moonTotalDegree is required for Vimshottari computation.');
  }
  const birthDate = parseDate(birthDateISO);
  const nakshatraIndex = Math.floor(moonTotalDegree / NAKSHATRA_SPAN);
  const degreeIntoNakshatra = moonTotalDegree % NAKSHATRA_SPAN;
  const startPlanetIndex = nakshatraIndex % 9;
  const startPlanet = DASHA_ORDER[startPlanetIndex];

  const fractionElapsed = degreeIntoNakshatra / NAKSHATRA_SPAN;
  const firstDashaFullYears = DASHA_YEARS[startPlanet];
  const firstDashaRemainingYears = firstDashaFullYears * (1 - fractionElapsed);

  const sequence = [];
  let cursor = birthDate;
  let yearsAccumulated = 0;
  let idx = startPlanetIndex;
  let isFirst = true;

  while (yearsAccumulated < TOTAL_DASHA_YEARS - 0.001) {
    const planet = DASHA_ORDER[idx % 9];
    let years = isFirst ? firstDashaRemainingYears : DASHA_YEARS[planet];
    if (yearsAccumulated + years > TOTAL_DASHA_YEARS) {
      years = TOTAL_DASHA_YEARS - yearsAccumulated;
    }
    const startDate = cursor;
    const endDate = addYears(cursor, years);

    sequence.push({ planet, startDate, endDate, years: Number(years.toFixed(4)), isFullPeriod: !isFirst });

    cursor = endDate;
    yearsAccumulated += years;
    idx += 1;
    isFirst = false;
  }

  return sequence;
}

function getCurrentDashaState(mahadashaSequence, dateLike = new Date()) {
  const now = parseDate(dateLike);
  const current = mahadashaSequence.find(p => now >= p.startDate && now < p.endDate);
  return current || null;
}

// Classical rule: Antardasha #1 within any Mahadasha is of the same planet as
// the Mahadasha lord, then continues in the standard 9-planet order.
// Duration formula: AD years = (MD lord's full years x AD lord's full years) / 120.
// For a truncated (partial, birth-balance) Mahadasha this is an approximation —
// flagged via `approximate: true`.
function buildAntardashaSequence(mdPeriod) {
  const isFull = mdPeriod.isFullPeriod !== false &&
    Math.abs(mdPeriod.years - DASHA_YEARS[mdPeriod.planet]) < 0.01;

  const startIdx = DASHA_ORDER.indexOf(mdPeriod.planet);
  const antardashas = [];
  let cursor = mdPeriod.startDate;

  for (let i = 0; i < 9; i++) {
    const adPlanet = DASHA_ORDER[(startIdx + i) % 9];
    const adYears = (DASHA_YEARS[mdPeriod.planet] * DASHA_YEARS[adPlanet]) / TOTAL_DASHA_YEARS;
    const adStart = cursor;
    const adEnd = addYears(cursor, adYears);
    antardashas.push({ planet: adPlanet, startDate: adStart, endDate: adEnd, years: Number(adYears.toFixed(4)) });
    cursor = adEnd;
  }

  return { antardashas, approximate: !isFull };
}

function buildDashaEducationTimeline(mahadashaSequence, d24ChartData, fourthAnalysis) {
  const relevantPlanets = new Set(['Mercury', 'Jupiter', fourthAnalysis.lord].filter(Boolean));

  return mahadashaSequence
    .filter(p => relevantPlanets.has(p.planet))
    .map(p => {
      const { antardashas, approximate } = buildAntardashaSequence(p);
      const relevantAntardashas = antardashas
        .filter(ad => relevantPlanets.has(ad.planet))
        .map(ad => {
          let relevance;
          if (ad.planet === fourthAnalysis.lord && ad.planet === p.planet) {
            relevance = '4th lord ki apni Mahadasha-Antardasha (MD=AD) — is period ki strongest possible activation window';
          } else if (ad.planet === fourthAnalysis.lord) {
            relevance = '4th lord ki Antardasha — vidya-activation ke liye is sub-period pe dhyan dein';
          } else {
            relevance = `${ad.planet} karaka ki Antardasha — supportive sub-period, gochar ke saath cross-check karein`;
          }
          return { ...ad, relevance };
        });

      return {
        planet: p.planet,
        startDate: p.startDate,
        endDate: p.endDate,
        relevance: p.planet === fourthAnalysis.lord
          ? '4th lord Mahadasha — vidya ki sambhavit activation window'
          : `${p.planet} karaka Mahadasha — sambandhit gochar ke saath cross-check karein`,
        antardashaApproximate: approximate,
        relevantAntardashas
      };
    });
}

// --- Learning-quality trend across the full dasha lifespan (qualitative proxy) ---
//
// For every Mahadasha in the full 120-year Vimshottari cycle (not just the
// vidya-karaka-filtered ones), the ruling planet's own D24 dignity/house
// strength is used as a proxy for whether that phase leans growth, plateau,
// or dip. Upachaya houses (3/6/10/11) get a small "growth-through-effort"
// bump since they classically improve over time / with sustained effort.
const UPACHAYA_HOUSES = [3, 6, 10, 11];

function buildLearningGrowthTimeline(mahadashaSequence, planetCalculations, divisionalStrength) {
  return mahadashaSequence.map(p => {
    const planetData = planetCalculations[p.planet];
    const strengthScore = divisionalStrength.perPlanet[p.planet]?.score ?? 45;
    let adjusted = strengthScore;

    if (planetData && UPACHAYA_HOUSES.includes(planetData.house)) {
      adjusted = clamp(adjusted + 8);
    }

    const growthLevel = adjusted >= 70 ? 'growth' : adjusted >= 45 ? 'stable/plateau' : 'challenging/dip';
    const note = growthLevel === 'growth'
      ? `${p.planet} Mahadasha me learning/exam-success ke supportive signs hain.`
      : growthLevel === 'stable/plateau'
        ? `${p.planet} Mahadasha me padhai largely stable rahegi, bada breakthrough zaroori nahi.`
        : `${p.planet} Mahadasha me padhai me extra effort/patience lag sakta hai, is period me bade academic decisions se pehle achhi tarah plan karein.`;

    return {
      planet: p.planet,
      startDate: p.startDate,
      endDate: p.endDate,
      years: p.years,
      house: planetData?.house ?? null,
      strengthScore: adjusted,
      growthLevel,
      note
    };
  });
}

// --- Exam-success/graduation-probable windows: clean extraction from the education dasha timeline ---
function extractGraduationWindows(dashaTimeline) {
  const windows = [];
  for (const mdPeriod of dashaTimeline) {
    for (const ad of mdPeriod.relevantAntardashas || []) {
      if (ad.relevance && ad.relevance.includes('MD=AD')) {
        windows.push({ planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate, strength: 'strongest', note: ad.relevance });
      } else if (ad.relevance && ad.relevance.includes('4th lord')) {
        windows.push({ planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate, strength: 'supportive', note: ad.relevance });
      }
    }
  }
  return windows;
}

function buildCompactD24Response(a) {
  const get = (o, keys) => {
    if (!o || typeof o !== 'object') return {};
    return Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  };
  return {
    summary: get(a.summary, [
      'vidyaPromise', 'delayLevel', 'obstructionLevel', 'lagnaSignRepeat', 'confidence'
    ]),
    education: {
      fourthHouse: get(a.fourth, ['score', 'strength', 'confidence', 'summary']),
      fourthLord: get(a.fourth, ['lord', 'lordDignity', 'lordIsSignRepeat']),
      mercury: get(a.mercury, ['house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
      jupiter: get(a.jupiter, ['house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
      educationField: get(a.educationField, ['primary', 'primaryScore', 'primaryStream', 'confidence', 'd24NativeTop', 'alternatives', 'd1Confirmation', 'd1Integration', 'note']),
      supportingHouses: get(a.supportingHouses, ['averageScore', 'confidence'])
    },
    lagnaOrientation: get(a.lagnaOrientation, ['lord', 'house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
    d1VsD24: {
      perPlanet: a.d1VsD24?.perPlanet || {},
      confidence: a.d1VsD24?.confidence || 'low',
      note: a.d1VsD24?.note || null
    },
    overallStrength: get(a.divisionalStrength, ['overallScore', 'lagnaSignRepeat', 'confidence', 'summary']),
    learningStability: get(a.learningStability, ['stabilityScore', 'level', 'confidence', 'summary']),
    obstacleAndDelay: get(a.delayAnalysis, [
      'delayLevel', 'delayScore', 'severeObstruction', 'obstructionScore', 'confidence', 'summary'
    ]),
    educationStream: get(a.educationStream, ['scienceScore', 'commerceScore', 'humanitiesScore', 'vocationalResearchScore', 'leaning', 'confidence', 'summary']),
    higherForeignEducation: get(a.higherForeignEducation, ['score', 'level', 'confidence', 'summary']),
    timing: {
      graduationWindows: Array.isArray(a.graduationWindows) ? a.graduationWindows.slice(0, 3) : [],
      caveat: TIMING_CAVEAT
    },
    synthesis: a.synthesisText || null
  };
}

function analyzeD24Deep(d24ChartData, context = {}) {
  const { houseOccupancy, planetCalculations, lagna } = d24ChartData;

  const divisionalStrength = analyzeDivisionalStrength(planetCalculations, lagna);
  const fourth = analyzeFourthHouseAndLord(houseOccupancy, planetCalculations, lagna.d24SignId);
  const fourthAspects = analyzeAspectsOnFourth(planetCalculations);
  const mercury = analyzeMercuryInD24(planetCalculations, fourth);
  const jupiter = analyzeJupiterInD24(planetCalculations);
  const educationField = analyzeEducationField(d24ChartData, context);
  const lagnaOrientation = analyzeLagnaLordOrientation(d24ChartData);
  const supportingHouses = analyzeSupportingHouses(d24ChartData);
  const delayAnalysis = synthesizeObstacleAndDelay({ fourth, fourthAspects, divisionalStrength });
  const learningStability = assessLearningStability({ fourth, fourthAspects, delayAnalysis, divisionalStrength });
  const promise = buildPromiseSynthesis({ fourth, mercury, jupiter, supportingHouses, divisionalStrength, delayAnalysis });
  const educationStream = analyzeEducationStream(d24ChartData, fourth);
  const higherForeignEducation = analyzeHigherAndForeignEducation(d24ChartData);

  let d1VsD24 = { perPlanet: {}, comparedCount: 0, confidence: 'none', note: 'D1 raw data unavailable — D1-vs-D24 comparison skip ho gaya.' };
  if (context.d1RawData) {
    try {
      d1VsD24 = compareD1D24Strength(context.d1RawData, planetCalculations);
    } catch (error) {
      console.warn('D24 D1-vs-D24 comparison skipped:', error.message);
    }
  }

  let dashaTimeline = [];
  let growthTimeline = [];
  let graduationWindows = [];
  if (context.mahadashaSequence) {
    try {
      dashaTimeline = buildDashaEducationTimeline(context.mahadashaSequence, d24ChartData, fourth);
      graduationWindows = extractGraduationWindows(dashaTimeline);
    } catch (error) {
      console.warn('D24 dasha timeline skipped:', error.message);
    }
    try {
      growthTimeline = buildLearningGrowthTimeline(context.mahadashaSequence, planetCalculations, divisionalStrength);
    } catch (error) {
      console.warn('D24 growth timeline skipped:', error.message);
    }
  }

  return {
    summary: {
      vidyaPromise: promise.vidyaPromise,
      delayLevel: delayAnalysis.delayLevel,
      obstructionLevel: delayAnalysis.delayScore >= 65 ? 'high' : delayAnalysis.delayScore >= 40 ? 'moderate' : 'low',
      lagnaSignRepeat: divisionalStrength.lagnaSignRepeat,
      confidence: fourth.confidence
    },
    fourth,
    fourthAspects,
    mercury,
    jupiter,
    educationField,
    lagnaOrientation,
    d1VsD24,
    supportingHouses,
    divisionalStrength,
    learningStability,
    delayAnalysis,
    educationStream,
    higherForeignEducation,
    dashaTimeline,
    growthTimeline,
    graduationWindows,
    synthesisText: promise.synthesisText
  };
}

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength,
  analyzeFourthHouseAndLord,
  analyzeAspectsOnFourth,
  analyzeMercuryInD24,
  analyzeJupiterInD24,
  analyzeEducationStream,
  analyzeEducationField,
  analyzeLagnaLordOrientation,
  compareD1D24Strength,
  analyzeSupportingHouses,
  analyzeHigherAndForeignEducation,
  synthesizeObstacleAndDelay,
  assessLearningStability,
  buildPromiseSynthesis,
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  getCurrentDashaState,
  buildAntardashaSequence,
  buildDashaEducationTimeline,
  buildLearningGrowthTimeline,
  extractGraduationWindows,
  buildCompactD24Response,
  analyzeD24Deep,
  TIMING_CAVEAT
};
