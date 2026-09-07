/**
 * D10 (Dashamsha) Deep Interpretation Rules
 * Career, Profession & Social Status analysis.
 *
 * Layers:
 *   dignity/strength -> 10th house & lord -> karaka analysis (Saturn/Sun) ->
 *   career-field indications -> lagna-lord orientation -> D1-vs-D10 refinement compare ->
 *   supporting houses -> stability + obstacle synthesis -> promise synthesis ->
 *   dasha + antardasha timeline -> compact response.
 *
 * IMPORTANT (read before trusting any score here):
 * All numeric scores in this file are qualitative, rule-of-thumb proxies
 * built for a consumer app — they are NOT classical Shadbala/Vimshopaka
 * Bala and should not be presented to the user as mathematically precise.
 * D10 alone also does not give an exact promotion/job-change date — see
 * TIMING_CAVEAT.
 */

const {
  SIGNS, SIGN_LORDS, EXALTATION_SIGN, DEBILITATION_SIGN, OWN_SIGNS,
  D10_HOUSE_SIGNIFICANCE, FIELD_INDICATORS
} = require('./d10Rules');

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
    const dignity = getPlanetDignity(planetName, p.d10SignId);
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
      ? 'Dashamsha lagna ka sign D1 lagna se match kar raha hai — D1 me jo bhi career-base promise tha, woh D10 me durably confirm ho raha hai; is chart ki refinement layer stable hai.'
      : 'Dashamsha lagna standard hai (D1 se sign match nahi karta) — is case me overall career-strength ko planet-wise dignity individually dekh kar hi judge karna theek rahega, akele lagna se conclusion mat nikaliye.'
  };
}

function analyzeTenthHouseAndLord(houseOccupancy, planetCalculations, lagnaSignId) {
  const occupants = houseOccupancy[10] || [];
  const lord = SIGN_LORDS[((lagnaSignId - 1 + 9) % 12) + 1];
  const lordData = planetCalculations[lord];

  let score = 50;
  const notes = [];

  for (const occ of occupants) {
    if (isBenefic(occ)) { score += 12; notes.push(`${occ} 10th house me — shubh career-growth ka sanket`); }
    if (isNaturalMalefic(occ)) { score -= 8; notes.push(`${occ} 10th house me — career me tension/struggle ka sanket, but akela deciding factor nahi`); }
    if (planetCalculations[occ]?.isSignRepeat) { score += 8; notes.push(`${occ} ka D1/D10 sign match ho raha hai — iska asar sthir aur zyada bharosemand hai`); }
  }

  if (lordData) {
    const lordDignity = getPlanetDignity(lord, lordData.d10SignId);
    if (lordDignity === 'exalted' || lordDignity === 'own') score += 15;
    if (lordDignity === 'debilitated') score -= 15;
    if (lordData.isSignRepeat) score += 10;
  }

  score = clamp(score);

  return {
    lord,
    lordHouse: lordData?.house ?? null,
    lordDignity: lordData ? getPlanetDignity(lord, lordData.d10SignId) : null,
    lordIsSignRepeat: Boolean(lordData?.isSignRepeat),
    occupants,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: lordData ? 'high' : 'low',
    significance: D10_HOUSE_SIGNIFICANCE[10],
    notes,
    summary: `10th house/lord score ${score}/100 — yeh career ka sabse core indication hai, lekin isko akele final answer mat maaniye; karakas aur dasha ke saath cross-check zaroori hai.`
  };
}

function analyzeAspectsOnTenth(planetCalculations) {
  return getAspectRecords(planetCalculations, 10);
}

function analyzeSaturnInD10(planetCalculations, tenthAnalysis = null) {
  const saturn = planetCalculations.Saturn;
  if (!saturn) {
    return { present: false, score: 0, confidence: 'none', summary: 'Saturn data unavailable.' };
  }
  const dignity = getPlanetDignity('Saturn', saturn.d10SignId);
  let score = dignityScoreProxy(dignity, saturn.isSignRepeat);
  if (saturn.house === 10) score += 10;
  if (tenthAnalysis?.lord === 'Saturn') score += 5;
  score = clamp(score);

  return {
    present: true,
    house: saturn.house,
    dignity,
    isSignRepeat: saturn.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Saturn (karma/career ka primary karaka) D10 house ${saturn.house} me hai, dignity: ${dignity}. Yeh mehnat, discipline aur career ki longevity/consistency ka level batata hai.`
  };
}

function analyzeSunInD10(planetCalculations) {
  const sun = planetCalculations.Sun;
  if (!sun) {
    return { present: false, score: 0, confidence: 'none', summary: 'Sun data unavailable.' };
  }
  const dignity = getPlanetDignity('Sun', sun.d10SignId);
  let score = dignityScoreProxy(dignity, sun.isSignRepeat);
  if ([1, 10, 11].includes(sun.house)) score += 10;

  score = clamp(score);

  return {
    present: true,
    house: sun.house,
    dignity,
    isSignRepeat: sun.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Sun (authority/status karaka) D10 house ${sun.house} me hai, dignity: ${dignity}. Yeh sirf naukri ka level nahi — vyakti ko milne wala adhikar, samman aur leadership-capacity bhi batata hai.`
  };
}

// --- Career type: Government vs Private-Service vs Business (qualitative proxy) ---
//
// Classical logic used here (rule-of-thumb, not a deterministic verdict):
// - Strong/well-placed Sun connected to 10th house/lord -> government/authority leaning
// - Strong Saturn connected to 10th -> structured/hierarchical service leaning
// - 10th lord in a dusthana (6/8/12) -> "service under someone" (naukri) rather than
//   independent business
// - 10th lord in a kendra/trikona (1/4/5/7/9/10) with good dignity, OR Mercury/Venus
//   strongly connected to 10th/7th/11th, OR a strong 11th lord -> business/self-employment leaning
// - Rahu connected to 10th/11th -> modern/corporate or unconventional business leaning
function analyzeCareerType(d10ChartData, tenthAnalysis) {
  const { planetCalculations, houseLords } = d10ChartData;
  const KENDRA_TRIKONA = [1, 4, 5, 7, 9, 10];
  const DUSTHANA = [6, 8, 12];

  let governmentScore = 30;
  let privateServiceScore = 35;
  let businessScore = 30;
  const notes = [];

  const tenthLord = tenthAnalysis.lord;
  const tenthLordData = planetCalculations[tenthLord];

  if (tenthLordData) {
    if (DUSTHANA.includes(tenthLordData.house)) {
      privateServiceScore += 20;
      businessScore -= 10;
      notes.push(`10th lord (${tenthLord}) dusthana house ${tenthLordData.house} me hai — yeh "naukri/service" (kisi ke under kaam) ki taraf zyada jhukav dikhata hai, independent business ki taraf kam.`);
    }
    if (KENDRA_TRIKONA.includes(tenthLordData.house)) {
      businessScore += 15;
      governmentScore += 5;
      notes.push(`10th lord (${tenthLord}) kendra/trikona house ${tenthLordData.house} me hai — self-driven career ya business ke liye supportive placement.`);
    }
    const tenthLordDignity = getPlanetDignity(tenthLord, tenthLordData.d10SignId);
    if (['exalted', 'own'].includes(tenthLordDignity)) {
      businessScore += 10;
      governmentScore += 10;
    }
  }

  const sun = planetCalculations.Sun;
  if (sun) {
    const sunDignity = getPlanetDignity('Sun', sun.d10SignId);
    if (['exalted', 'own'].includes(sunDignity)) { governmentScore += 25; notes.push(`Sun D10 me ${sunDignity} hai — government/authority/high-status position ka strong sanket.`); }
    else if (sunDignity === 'friendly') { governmentScore += 10; }
    else if (sunDignity === 'debilitated') { governmentScore -= 15; }
    if (sun.house === 10) { governmentScore += 15; notes.push('Sun 10th house me hai — career me authority/government-connection ka direct sanket.'); }
    else if ([1, 11].includes(sun.house)) { governmentScore += 5; }
  }

  const saturn = planetCalculations.Saturn;
  if (saturn) {
    const saturnDignity = getPlanetDignity('Saturn', saturn.d10SignId);
    if (['exalted', 'own'].includes(saturnDignity)) { governmentScore += 10; privateServiceScore += 15; }
    if ([6, 10].includes(saturn.house)) { privateServiceScore += 10; notes.push('Saturn 10th/6th house me hai — structured, hierarchical, long-term service-type career ka sanket.'); }
  }

  const mercury = planetCalculations.Mercury;
  const venus = planetCalculations.Venus;
  for (const [name, p] of [['Mercury', mercury], ['Venus', venus]]) {
    if (!p) continue;
    const dignity = getPlanetDignity(name, p.d10SignId);
    if (['exalted', 'own', 'friendly'].includes(dignity) && [7, 10, 11].includes(p.house)) {
      businessScore += 15;
      notes.push(`${name} 7th/10th/11th house me achhi dignity ke saath hai — trade, partnership ya business-oriented income ka sanket.`);
    }
  }

  const eleventhLord = houseLords[11];
  const eleventhLordData = planetCalculations[eleventhLord];
  if (eleventhLordData) {
    const elDignity = getPlanetDignity(eleventhLord, eleventhLordData.d10SignId);
    if (['exalted', 'own'].includes(elDignity)) { businessScore += 10; notes.push('11th lord (gains) strong hai — income-growth ya business-gains ka supportive sanket.'); }
  }

  const rahu = planetCalculations.Rahu;
  if (rahu && [10, 11].includes(rahu.house)) {
    businessScore += 10;
    notes.push('Rahu 10th/11th house me hai — modern/corporate, unconventional, ya foreign-connected business/career ka sanket.');
  }

  governmentScore = clamp(governmentScore);
  privateServiceScore = clamp(privateServiceScore);
  businessScore = clamp(businessScore);

  const naukriScore = Math.max(governmentScore, privateServiceScore);
  let leaning;
  if (businessScore > naukriScore + 10) {
    leaning = 'Business/self-employment ki taraf zyada jhukav dikh raha hai';
  } else if (governmentScore > businessScore + 10 && governmentScore >= privateServiceScore) {
    leaning = 'Government/public-sector ya high-authority service ki taraf zyada jhukav dikh raha hai';
  } else if (privateServiceScore > businessScore + 10) {
    leaning = 'Private-sector service (naukri) ki taraf zyada jhukav dikh raha hai';
  } else {
    leaning = 'Koi ek category clearly dominant nahi hai — mixed/hybrid indications hain (naukri ke andar bhi high-authority role, ya naukri se business ki taraf transition possible)';
  }

  return {
    governmentScore,
    privateServiceScore,
    businessScore,
    leaning,
    notes,
    confidence: 'medium',
    summary: `${leaning}. Government-leaning score ${governmentScore}/100, Private-service-leaning score ${privateServiceScore}/100, Business-leaning score ${businessScore}/100. Yeh sirf rule-of-thumb proxy hai — final decision D1 ke 10th/2nd/7th/11th houses aur dasha ke saath cross-check karke lena chahiye.`
  };
}

// --- Career field indications (qualitative — element + occupant based) ---

const ELEMENT_WORKSTYLE = Object.freeze({
  Fire: 'high-energy, leadership-oriented, risk-lene wala career-style — entrepreneurial ya action-driven roles suit karte hain',
  Earth: 'practical, structured, result-oriented career-style — finance, real estate, administration jaisa stable field suit karta hai',
  Air: 'communication-heavy, networking-based, intellectually driven career-style — media, IT, consulting jaisa field suit karta hai',
  Water: 'intuitive, service-oriented, emotionally-driven career-style — healthcare, counseling, hospitality jaisa field suit karta hai'
});

function analyzeCareerFieldIndications(d10ChartData, tenthAnalysis) {
  const tenthSignId = d10ChartData.houseSigns?.[10];
  const signData = SIGNS.find(s => s.id === tenthSignId);
  if (!signData) {
    return { confidence: 'none', summary: '10th sign data unavailable.' };
  }

  const baseWorkstyle = ELEMENT_WORKSTYLE[signData.element];
  const occupantInfluences = (tenthAnalysis.occupants || [])
    .filter(occ => FIELD_INDICATORS[occ])
    .map(occ => ({ planet: occ, note: FIELD_INDICATORS[occ] }));

  return {
    tenthSign: signData.name,
    tenthSignHindi: signData.hindi,
    element: signData.element,
    baseWorkstyle,
    occupantInfluences,
    confidence: occupantInfluences.length > 0 ? 'medium' : 'low',
    summary: `10th sign ${signData.name} (${signData.element} element) base work-style suggest karta hai: ${baseWorkstyle}.` +
      (occupantInfluences.length
        ? ` Isme occupant planets field ko modify karte hain — jaise ${occupantInfluences.map(o => o.planet).join(', ')}.`
        : ' Koi planet 10th house me nahi hai, isliye yeh sign-based reading hi primary signal hai.') +
      ' Yaad rahe — yeh qualitative tendency hai, exact job-title prediction nahi.'
  };
}

// --- D10 Lagna lord orientation (approach to career / work-ethic capacity) ---

function analyzeLagnaLordOrientation(d10ChartData) {
  const { lagna, planetCalculations } = d10ChartData;
  const lagnaLord = lagna.lord;
  const lordData = planetCalculations[lagnaLord];

  if (!lordData) {
    return { present: false, confidence: 'none', summary: 'Lagna lord data unavailable.' };
  }

  const dignity = getPlanetDignity(lagnaLord, lordData.d10SignId);
  const score = clamp(dignityScoreProxy(dignity, lordData.isSignRepeat));

  return {
    lord: lagnaLord,
    house: lordData.house,
    dignity,
    isSignRepeat: lordData.isSignRepeat,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'medium',
    summary: `D10 lagna lord (${lagnaLord}) house ${lordData.house} me hai, dignity: ${dignity}. Yeh batata hai vyakti career ko kis orientation se approach karega, aur us domain me kitni self-driven capability aayegi — strong placement matlab responsibility aur growth dono me sahaj hai, weak placement matlab conscious effort aur skill-building zyada lagega.`
  };
}

// --- D1 vs D10 comparative strength ("D1 = promise, D10 = refinement/manifestation") ---

const DIGNITY_RANK = Object.freeze({ exalted: 5, own: 4, friendly: 3, neutral: 2, debilitated: 1 });

function compareD1D10Strength(d1RawData, planetCalculations) {
  const grahas = d1RawData?.grahas || d1RawData?.planets || {};
  const perPlanet = {};
  let comparedCount = 0;

  for (const [planetName, d10p] of Object.entries(planetCalculations)) {
    const d1p = grahas[planetName];
    const d1SignId = d1p ? Number(d1p.signId) : NaN;
    if (!Number.isFinite(d1SignId)) continue;

    const d1Dignity = getPlanetDignity(planetName, d1SignId);
    const d10Dignity = getPlanetDignity(planetName, d10p.d10SignId);
    const diff = (DIGNITY_RANK[d10Dignity] || 2) - (DIGNITY_RANK[d1Dignity] || 2);

    let verdict;
    if (diff >= 2) verdict = 'D10 me significantly refine/strengthen hua — D1 ka career-promise D10 me confidently manifest ho raha hai';
    else if (diff === 1) verdict = 'D10 me thoda mazboot hua — D1 promise ko D10 support kar raha hai';
    else if (diff === 0) verdict = 'D1 jaisi hi strength D10 me bhi consistent hai';
    else if (diff === -1) verdict = 'D10 me thoda kamzor hua — D1 promise poora manifest hone me kuch friction ho sakta hai';
    else verdict = 'D10 me significantly weaken hua — D1 ka promise dikhta accha hai lekin D10 refine karke usko dilute kar raha hai, is planet ke area me expectations thodi realistic rakhein';

    perPlanet[planetName] = { d1Dignity, d10Dignity, diff, verdict };
    comparedCount += 1;
  }

  return {
    perPlanet,
    comparedCount,
    confidence: comparedCount >= 6 ? 'high' : comparedCount >= 3 ? 'medium' : 'low',
    note: 'D1 vyakti ka base/surface career-promise dikhata hai, D10 uski refinement aur real manifestation-strength batata hai. Dono ko saath dekhna zaroori hai — sirf D1 ya sirf D10 se conclusion adhoori hoti hai.'
  };
}

function analyzeSupportingHouses(d10ChartData) {
  const { houseOccupancy, planetCalculations } = d10ChartData;
  const supportHouses = [2, 6, 9, 11];
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
    detail[h] = { occupants, score: hScore, significance: D10_HOUSE_SIGNIFICANCE[h] };
    supportScore += hScore;
  }

  return {
    detail,
    averageScore: clamp(Math.round(supportScore / supportHouses.length)),
    confidence: 'medium'
  };
}

// --- Transfer / Relocation likelihood (qualitative proxy) ---
//
// Classical houses checked: 3rd (short-distance/effort-driven movement),
// 9th (long-distance/foreign/fortune-driven movement), 12th (foreign
// settlement/relocation/isolation). Occupant nature and Rahu/Ketu/Moon
// placement modify the likelihood.
function analyzeTransferRelocation(d10ChartData) {
  const { houseOccupancy, planetCalculations, lagna } = d10ChartData;
  const movementHouses = [3, 9, 12];
  let score = 30;
  const notes = [];
  const houseDetail = {};

  for (const h of movementHouses) {
    const occupants = houseOccupancy[h] || [];
    houseDetail[h] = { occupants, significance: D10_HOUSE_SIGNIFICANCE[h] };
    for (const occ of occupants) {
      if (['Rahu', 'Ketu'].includes(occ)) {
        score += 15;
        notes.push(`${occ} house ${h} me hai — foreign-connection ya achanak/unconventional relocation ka strong sanket.`);
      } else if (isNaturalMalefic(occ)) {
        score += 10;
        notes.push(`${occ} house ${h} me hai — circumstantial ya thoda upheaval-wala movement/transfer possible.`);
      } else if (isBenefic(occ)) {
        score += 5;
        notes.push(`${occ} house ${h} me hai — opportunity-driven (promotion/growth ke saath) movement possible.`);
      }
    }
  }

  const lagnaLord = lagna.lord;
  const lagnaLordData = planetCalculations[lagnaLord];
  if (lagnaLordData && movementHouses.includes(lagnaLordData.house)) {
    score += 15;
    notes.push(`Lagna lord (${lagnaLord}) house ${lagnaLordData.house} me hai — career ke saath relocation/movement ka element judaa hua hai.`);
  }

  const moon = planetCalculations.Moon;
  if (moon) {
    if (movementHouses.includes(moon.house)) {
      score += 10;
      notes.push(`Moon house ${moon.house} me hai — mann me restlessness/badlaav ki chaah movement ko support karti hai.`);
    }
    const moonDignity = getPlanetDignity('Moon', moon.d10SignId);
    if (moonDignity === 'debilitated') { score += 5; notes.push('Moon debilitated hai — mental restlessness thoda zyada, jo movement/change ki taraf le ja sakta hai.'); }
  }

  score = clamp(score);

  return {
    score,
    level: score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low',
    houseDetail,
    notes,
    confidence: 'medium',
    summary: `Transfer/relocation likelihood score ${score}/100 (${score >= 65 ? 'high' : score >= 40 ? 'moderate' : 'low'}) — 3rd (short-distance), 9th (long-distance/foreign) aur 12th (relocation/foreign-settlement) house ke occupants aur lagna lord/Moon placement ke basis pe. Yeh sirf tendency hai — exact transfer D1 ke 4th/12th house, gochar (transit) aur dasha ke saath hi confirm hoti hai.`
  };
}

function synthesizeObstacleAndDelay({ tenth, tenthAspects, divisionalStrength }) {
  let obstacleScore = 30;
  let severeObstruction = false;

  const maleficAspects = tenthAspects.filter(a => a.nature === 'malefic');
  obstacleScore += maleficAspects.length * 12;

  if (tenth.lordDignity === 'debilitated') { obstacleScore += 20; severeObstruction = true; }
  if (tenth.occupants.some(o => isNaturalMalefic(o))) obstacleScore += 10;
  if (divisionalStrength.lagnaSignRepeat) obstacleScore -= 15;

  obstacleScore = clamp(obstacleScore);

  return {
    delayLevel: obstacleScore >= 65 ? 'high' : obstacleScore >= 40 ? 'moderate' : 'low',
    delayScore: obstacleScore,
    severeObstruction,
    obstructionScore: clamp(maleficAspects.length * 20),
    confidence: 'medium',
    summary: `Career obstacle/delay score ${obstacleScore}/100 — 10th house pe padne wale aspects aur lord ki dignity ke basis pe. High score ka matlab career nahi banega aisa nahi hai, sirf itna ki growth/promotion me zyada patience/effort lag sakta hai.`
  };
}

// --- Career stability (separate from "promise" — sustainability of the career) ---

function assessCareerStability({ tenth, tenthAspects, delayAnalysis, divisionalStrength }) {
  let stabilityScore = 55;
  const maleficCount = tenthAspects.filter(a => a.nature === 'malefic').length;
  const beneficCount = tenthAspects.filter(a => a.nature === 'benefic').length;

  stabilityScore += beneficCount * 8 - maleficCount * 10;
  if (tenth.lordDignity === 'debilitated') stabilityScore -= 15;
  if (tenth.lordDignity === 'exalted' || tenth.lordDignity === 'own') stabilityScore += 10;
  if (divisionalStrength.lagnaSignRepeat) stabilityScore += 10;
  if (delayAnalysis.severeObstruction) stabilityScore -= 15;

  stabilityScore = clamp(stabilityScore);

  return {
    stabilityScore,
    level: stabilityScore >= 70 ? 'stable' : stabilityScore >= 45 ? 'moderate — ups-downs expected' : 'fragile — extra conscious effort/planning helpful',
    confidence: 'medium',
    summary: `Career stability score ${stabilityScore}/100 — yeh "career kitna accha hai" se alag hai; yeh batata hai job/business long-term me kitni sustain karegi, sirf shuruaati promise nahi.`
  };
}

function buildPromiseSynthesis({ tenth, saturn, sun, supportingHouses, divisionalStrength, delayAnalysis }) {
  const weights = { tenth: 0.4, saturn: 0.2, sun: 0.15, support: 0.15, overall: 0.1 };
  const raw =
    tenth.score * weights.tenth +
    saturn.score * weights.saturn +
    sun.score * weights.sun +
    supportingHouses.averageScore * weights.support +
    divisionalStrength.overallScore * weights.overall;

  const careerPromise = clamp(Math.round(raw));
  const penalty = delayAnalysis.severeObstruction ? 10 : 0;
  const finalScore = clamp(careerPromise - penalty);

  let synthesisText;
  if (finalScore >= 70) {
    synthesisText = 'Career/professional yog overall achha lag raha hai — 10th house/lord aur karakas ka support strong hai. Iska matlab yeh nahi ki sab kuch smooth hi hoga, but base promise solid hai.';
  } else if (finalScore >= 45) {
    synthesisText = 'Career yog moderate hai — kuch factors support kar rahe hain, kuch friction bhi dikh raha hai. 10th lord aur karakas dono ko saath dekh kar hi realistic picture banegi.';
  } else {
    synthesisText = 'Is chart me career yog me kuch genuine challenges dikh rahe hain — iska matlab career nahi banega aisa bilkul nahi hai, but consistent effort aur timing dono pe zyada dhyan dena padega. Dasha-timing dhyan se check karein.';
  }

  return { careerPromise: finalScore, weightsUsed: weights, synthesisText };
}

// --- Vimshottari Mahadasha + Antardasha ---

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = Object.freeze({
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
});
const NAKSHATRA_SPAN = 360 / 27;
const TOTAL_DASHA_YEARS = 120;

const TIMING_CAVEAT = 'D10 akela exact promotion/job-change ya business-launch ki tareekh nahi deta — yeh sirf potential, field-quality aur possible timing-windows dikhata hai. Real timing ke liye D1 + D10 + Vimshottari Dasha + Gochar (transit), in charon ko saath me dekhna zaroori hai.';

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

function buildDashaCareerTimeline(mahadashaSequence, d10ChartData, tenthAnalysis) {
  const relevantPlanets = new Set(['Saturn', 'Sun', tenthAnalysis.lord].filter(Boolean));

  return mahadashaSequence
    .filter(p => relevantPlanets.has(p.planet))
    .map(p => {
      const { antardashas, approximate } = buildAntardashaSequence(p);
      const relevantAntardashas = antardashas
        .filter(ad => relevantPlanets.has(ad.planet))
        .map(ad => {
          let relevance;
          if (ad.planet === tenthAnalysis.lord && ad.planet === p.planet) {
            relevance = '10th lord ki apni Mahadasha-Antardasha (MD=AD) — is period ki strongest possible activation window';
          } else if (ad.planet === tenthAnalysis.lord) {
            relevance = '10th lord ki Antardasha — career-activation ke liye is sub-period pe dhyan dein';
          } else {
            relevance = `${ad.planet} karaka ki Antardasha — supportive sub-period, gochar ke saath cross-check karein`;
          }
          return { ...ad, relevance };
        });

      return {
        planet: p.planet,
        startDate: p.startDate,
        endDate: p.endDate,
        relevance: p.planet === tenthAnalysis.lord
          ? '10th lord Mahadasha — career ki sambhavit activation window'
          : `${p.planet} karaka Mahadasha — sambandhit gochar ke saath cross-check karein`,
        antardashaApproximate: approximate,
        relevantAntardashas
      };
    });
}

// --- Career growth trend across the full dasha lifespan (qualitative proxy) ---
//
// For every Mahadasha in the full 120-year Vimshottari cycle (not just the
// career-karaka-filtered ones), the ruling planet's own D10 dignity/house
// strength is used as a proxy for whether that phase leans growth, plateau,
// or dip. Upachaya houses (3/6/10/11) get a small "growth-through-effort"
// bump since they classically improve over time / with sustained effort.
const UPACHAYA_HOUSES = [3, 6, 10, 11];

function buildCareerGrowthTimeline(mahadashaSequence, planetCalculations, divisionalStrength) {
  return mahadashaSequence.map(p => {
    const planetData = planetCalculations[p.planet];
    const strengthScore = divisionalStrength.perPlanet[p.planet]?.score ?? 45;
    let adjusted = strengthScore;

    if (planetData && UPACHAYA_HOUSES.includes(planetData.house)) {
      adjusted = clamp(adjusted + 8);
    }

    const growthLevel = adjusted >= 70 ? 'growth' : adjusted >= 45 ? 'stable/plateau' : 'challenging/dip';
    const note = growthLevel === 'growth'
      ? `${p.planet} Mahadasha me career-growth ke supportive signs hain.`
      : growthLevel === 'stable/plateau'
        ? `${p.planet} Mahadasha me career largely stable rahega, bada jump zaroori nahi.`
        : `${p.planet} Mahadasha me career me extra effort/patience lag sakta hai, is period me bade risky decisions se pehle achhi tarah plan karein.`;

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

// --- Promotion-probable windows: clean extraction from the career dasha timeline ---
function extractPromotionWindows(dashaTimeline) {
  const windows = [];
  for (const mdPeriod of dashaTimeline) {
    for (const ad of mdPeriod.relevantAntardashas || []) {
      if (ad.relevance && ad.relevance.includes('MD=AD')) {
        windows.push({ planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate, strength: 'strongest', note: ad.relevance });
      } else if (ad.relevance && ad.relevance.includes('10th lord')) {
        windows.push({ planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate, strength: 'supportive', note: ad.relevance });
      }
    }
  }
  return windows;
}

function buildCompactD10Response(a) {
  const get = (o, keys) => {
    if (!o || typeof o !== 'object') return {};
    return Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  };
  return {
    summary: get(a.summary, [
      'careerPromise', 'delayLevel', 'obstructionLevel', 'lagnaSignRepeat', 'confidence'
    ]),
    career: {
      tenthHouse: get(a.tenth, ['score', 'strength', 'confidence', 'summary']),
      tenthLord: get(a.tenth, ['lord', 'lordDignity', 'lordIsSignRepeat']),
      saturn: get(a.saturn, ['house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
      sun: get(a.sun, ['house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
      careerField: get(a.careerField, ['tenthSign', 'element', 'baseWorkstyle', 'occupantInfluences', 'confidence', 'summary']),
      supportingHouses: get(a.supportingHouses, ['averageScore', 'confidence'])
    },
    lagnaOrientation: get(a.lagnaOrientation, ['lord', 'house', 'dignity', 'isSignRepeat', 'score', 'strength', 'summary']),
    d1VsD10: {
      perPlanet: a.d1VsD10?.perPlanet || {},
      confidence: a.d1VsD10?.confidence || 'low',
      note: a.d1VsD10?.note || null
    },
    overallStrength: get(a.divisionalStrength, ['overallScore', 'lagnaSignRepeat', 'confidence', 'summary']),
    careerStability: get(a.careerStability, ['stabilityScore', 'level', 'confidence', 'summary']),
    obstacleAndDelay: get(a.delayAnalysis, [
      'delayLevel', 'delayScore', 'severeObstruction', 'obstructionScore', 'confidence', 'summary'
    ]),
    careerType: get(a.careerType, ['governmentScore', 'privateServiceScore', 'businessScore', 'leaning', 'notes', 'confidence', 'summary']),
    transferRelocation: get(a.transferRelocation, ['score', 'level', 'houseDetail', 'notes', 'confidence', 'summary']),
    timing: {
      relevantDashas: Array.isArray(a.dashaTimeline) ? a.dashaTimeline.slice(0, 8) : [],
      growthTimeline: Array.isArray(a.growthTimeline) ? a.growthTimeline.slice(0, 12) : [],
      promotionWindows: Array.isArray(a.promotionWindows) ? a.promotionWindows : [],
      caveat: TIMING_CAVEAT
    },
    synthesis: a.synthesisText || null
  };
}

function analyzeD10Deep(d10ChartData, context = {}) {
  const { houseOccupancy, planetCalculations, lagna } = d10ChartData;

  const divisionalStrength = analyzeDivisionalStrength(planetCalculations, lagna);
  const tenth = analyzeTenthHouseAndLord(houseOccupancy, planetCalculations, lagna.d10SignId);
  const tenthAspects = analyzeAspectsOnTenth(planetCalculations);
  const saturn = analyzeSaturnInD10(planetCalculations, tenth);
  const sun = analyzeSunInD10(planetCalculations);
  const careerField = analyzeCareerFieldIndications(d10ChartData, tenth);
  const lagnaOrientation = analyzeLagnaLordOrientation(d10ChartData);
  const supportingHouses = analyzeSupportingHouses(d10ChartData);
  const delayAnalysis = synthesizeObstacleAndDelay({ tenth, tenthAspects, divisionalStrength });
  const careerStability = assessCareerStability({ tenth, tenthAspects, delayAnalysis, divisionalStrength });
  const promise = buildPromiseSynthesis({ tenth, saturn, sun, supportingHouses, divisionalStrength, delayAnalysis });
  const careerType = analyzeCareerType(d10ChartData, tenth);
  const transferRelocation = analyzeTransferRelocation(d10ChartData);

  let d1VsD10 = { perPlanet: {}, comparedCount: 0, confidence: 'none', note: 'D1 raw data unavailable — D1-vs-D10 comparison skip ho gaya.' };
  if (context.d1RawData) {
    try {
      d1VsD10 = compareD1D10Strength(context.d1RawData, planetCalculations);
    } catch (error) {
      console.warn('D10 D1-vs-D10 comparison skipped:', error.message);
    }
  }

  let dashaTimeline = [];
  let growthTimeline = [];
  let promotionWindows = [];
  if (context.mahadashaSequence) {
    try {
      dashaTimeline = buildDashaCareerTimeline(context.mahadashaSequence, d10ChartData, tenth);
      promotionWindows = extractPromotionWindows(dashaTimeline);
    } catch (error) {
      console.warn('D10 dasha timeline skipped:', error.message);
    }
    try {
      growthTimeline = buildCareerGrowthTimeline(context.mahadashaSequence, planetCalculations, divisionalStrength);
    } catch (error) {
      console.warn('D10 growth timeline skipped:', error.message);
    }
  }

  return {
    summary: {
      careerPromise: promise.careerPromise,
      delayLevel: delayAnalysis.delayLevel,
      obstructionLevel: delayAnalysis.delayScore >= 65 ? 'high' : delayAnalysis.delayScore >= 40 ? 'moderate' : 'low',
      lagnaSignRepeat: divisionalStrength.lagnaSignRepeat,
      confidence: tenth.confidence
    },
    tenth,
    tenthAspects,
    saturn,
    sun,
    careerField,
    lagnaOrientation,
    d1VsD10,
    supportingHouses,
    divisionalStrength,
    careerStability,
    delayAnalysis,
    careerType,
    transferRelocation,
    dashaTimeline,
    growthTimeline,
    promotionWindows,
    synthesisText: promise.synthesisText
  };
}

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength,
  analyzeTenthHouseAndLord,
  analyzeAspectsOnTenth,
  analyzeSaturnInD10,
  analyzeSunInD10,
  analyzeCareerType,
  analyzeCareerFieldIndications,
  analyzeLagnaLordOrientation,
  compareD1D10Strength,
  analyzeSupportingHouses,
  analyzeTransferRelocation,
  synthesizeObstacleAndDelay,
  assessCareerStability,
  buildPromiseSynthesis,
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  getCurrentDashaState,
  buildAntardashaSequence,
  buildDashaCareerTimeline,
  buildCareerGrowthTimeline,
  extractPromotionWindows,
  buildCompactD10Response,
  analyzeD10Deep,
  TIMING_CAVEAT
};
