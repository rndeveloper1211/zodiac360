/**
 * D9 (Navamsha) Deep Interpretation Rules
 * Vivah (Marriage), Dharma & Overall Strength (Vargottama) analysis.
 *
 * Layers:
 *   dignity/strength -> 7th house & lord -> karaka analysis (Venus/Jupiter) ->
 *   spouse-nature -> lagna-lord orientation -> D1-vs-D9 refinement compare ->
 *   supporting houses -> stability + delay synthesis -> promise synthesis ->
 *   dasha + antardasha timeline -> compact response.
 *
 * IMPORTANT (read before trusting any score here):
 * All numeric scores in this file are qualitative, rule-of-thumb proxies
 * built for a consumer app — they are NOT classical Shadbala/Vimshopaka
 * Bala and should not be presented to the user as mathematically precise.
 * D9 alone also does not give an exact marriage date — see TIMING_CAVEAT.
 */

const {
  SIGNS, SIGN_LORDS, EXALTATION_SIGN, DEBILITATION_SIGN, OWN_SIGNS, D9_HOUSE_SIGNIFICANCE
} = require('./d9Rules');

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
function dignityScoreProxy(dignity, isVargottama) {
  const base = { exalted: 90, own: 75, friendly: 60, neutral: 45, debilitated: 20 }[dignity] ?? 45;
  return clamp(isVargottama ? base + 15 : base);
}

function analyzeDivisionalStrength(planetCalculations, lagna) {
  const perPlanet = {};
  let sum = 0;
  let count = 0;

  for (const [planetName, p] of Object.entries(planetCalculations)) {
    const dignity = getPlanetDignity(planetName, p.d9SignId);
    const score = dignityScoreProxy(dignity, p.isVargottama);
    perPlanet[planetName] = { dignity, score, isVargottama: p.isVargottama };
    sum += score;
    count += 1;
  }

  const lagnaDignityBonus = lagna.isVargottama ? 15 : 0;
  const overallScore = clamp(Math.round((sum / Math.max(count, 1)) + lagnaDignityBonus / 3));

  return {
    perPlanet,
    lagnaVargottama: lagna.isVargottama,
    overallScore,
    confidence: count >= 7 ? 'high' : 'medium',
    summary: lagna.isVargottama
      ? 'Navamsha lagna Vargottama hai — D1 me jo bhi base promise tha, woh D9 me durably confirm ho raha hai; is chart ki refinement layer stable hai.'
      : 'Navamsha lagna standard (non-Vargottama) hai — is case me overall strength ko planet-wise dignity individually dekh kar hi judge karna theek rahega, akele lagna se conclusion mat nikaliye.'
  };
}

function analyzeSeventhHouseAndLord(houseOccupancy, planetCalculations, lagnaSignId) {
  const occupants = houseOccupancy[7] || [];
  const lord = SIGN_LORDS[((lagnaSignId - 1 + 6) % 12) + 1];
  const lordData = planetCalculations[lord];

  let score = 50;
  const notes = [];

  for (const occ of occupants) {
    if (isBenefic(occ)) { score += 12; notes.push(`${occ} 7th house me — shubh saathi-sukh ka sanket`); }
    if (isNaturalMalefic(occ)) { score -= 8; notes.push(`${occ} 7th house me — vivah me tension/delay ka sanket, but akela deciding factor nahi`); }
    if (planetCalculations[occ]?.isVargottama) { score += 8; notes.push(`${occ} Vargottama — iska asar sthir aur zyada bharosemand hai`); }
  }

  if (lordData) {
    const lordDignity = getPlanetDignity(lord, lordData.d9SignId);
    if (lordDignity === 'exalted' || lordDignity === 'own') score += 15;
    if (lordDignity === 'debilitated') score -= 15;
    if (lordData.isVargottama) score += 10;
  }

  score = clamp(score);

  return {
    lord,
    lordHouse: lordData?.house ?? null,
    lordDignity: lordData ? getPlanetDignity(lord, lordData.d9SignId) : null,
    lordIsVargottama: Boolean(lordData?.isVargottama),
    occupants,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: lordData ? 'high' : 'low',
    significance: D9_HOUSE_SIGNIFICANCE[7],
    notes,
    summary: `7th house/lord score ${score}/100 — yeh marriage ka sabse core indication hai, lekin isko akele final answer mat maaniye; karakas aur dasha ke saath cross-check zaroori hai.`
  };
}

function analyzeAspectsOnSeventh(planetCalculations) {
  return getAspectRecords(planetCalculations, 7);
}

function analyzeVenusInD9(planetCalculations, seventhAnalysis = null) {
  const venus = planetCalculations.Venus;
  if (!venus) {
    return { present: false, score: 0, confidence: 'none', summary: 'Venus data unavailable.' };
  }
  const dignity = getPlanetDignity('Venus', venus.d9SignId);
  let score = dignityScoreProxy(dignity, venus.isVargottama);
  if (venus.house === 7) score += 10;
  if (seventhAnalysis?.lord === 'Venus') score += 5;
  score = clamp(score);

  return {
    present: true,
    house: venus.house,
    dignity,
    isVargottama: venus.isVargottama,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Venus (saathi/marriage ka primary karaka) D9 house ${venus.house} me hai, dignity: ${dignity}. Yeh romance, attraction aur relationship-comfort ka level batata hai.`
  };
}

function analyzeJupiterInD9(planetCalculations) {
  const jupiter = planetCalculations.Jupiter;
  if (!jupiter) {
    return { present: false, score: 0, confidence: 'none', summary: 'Jupiter data unavailable.' };
  }
  const dignity = getPlanetDignity('Jupiter', jupiter.d9SignId);
  let score = dignityScoreProxy(dignity, jupiter.isVargottama);
  if ([1, 5, 9].includes(jupiter.house)) score += 10;

  score = clamp(score);

  return {
    present: true,
    house: jupiter.house,
    dignity,
    isVargottama: jupiter.isVargottama,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'high',
    summary: `Jupiter (dharma karaka) D9 house ${jupiter.house} me hai, dignity: ${dignity}. Yeh sirf marriage nahi — vyakti ke dharma, values aur life-direction ki maturity bhi batata hai.`
  };
}

// --- Spouse nature/temperament (qualitative — element + occupant based) ---

const ELEMENT_TEMPERAMENT = Object.freeze({
  Fire: 'energetic, assertive, independent-minded — thoda impulsive/short-tempered bhi ho sakta hai',
  Earth: 'practical, grounded, stability-pasand — thoda rigid ya traditional-minded ho sakta hai',
  Air: 'communicative, social, intellectually curious — thoda restless ya emotionally-detached lag sakta hai',
  Water: 'emotional, caring, intuitive — thoda moody ya sensitive ho sakta hai'
});

const OCCUPANT_SPOUSE_NOTES = Object.freeze({
  Venus: 'spouse attractive, artistic aur relationship ko priority dene wala ho sakta hai',
  Mars: 'spouse assertive/energetic ho sakta hai — occasional ego-clash ya temperament-friction ka sanket bhi',
  Saturn: 'spouse mature, reserved ya thoda older-natured ho sakta hai — relationship me responsibility-heavy dynamic',
  Jupiter: 'spouse wise, supportive aur guru-jaisa guiding influence de sakta hai',
  Rahu: 'unconventional attraction ya different background/culture se connection possible',
  Ketu: 'relationship me kuch detachment ya spiritual undertone — emotional distance ka bhi sanket ho sakta hai',
  Moon: 'spouse emotionally nurturing hoga, lekin mood-sensitive dynamic bhi ho sakta hai',
  Sun: 'spouse ki personality dominant/authoritative ho sakti hai — ego-balance zaroori rahega',
  Mercury: 'spouse communicative, witty aur intellectually engaging ho sakta hai'
});

function analyzeSpouseNature(d9ChartData, seventh) {
  const seventhSignId = d9ChartData.houseSigns?.[7];
  const signData = SIGNS.find(s => s.id === seventhSignId);
  if (!signData) {
    return { confidence: 'none', summary: '7th sign data unavailable.' };
  }

  const baseTemperament = ELEMENT_TEMPERAMENT[signData.element];
  const occupantInfluences = (seventh.occupants || [])
    .filter(occ => OCCUPANT_SPOUSE_NOTES[occ])
    .map(occ => ({ planet: occ, note: OCCUPANT_SPOUSE_NOTES[occ] }));

  return {
    seventhSign: signData.name,
    seventhSignHindi: signData.hindi,
    element: signData.element,
    baseTemperament,
    occupantInfluences,
    confidence: occupantInfluences.length > 0 ? 'medium' : 'low',
    summary: `7th sign ${signData.name} (${signData.element} element) base temperament suggest karta hai: ${baseTemperament}.` +
      (occupantInfluences.length
        ? ` Isme occupant planets modify karte hain — jaise ${occupantInfluences.map(o => o.planet).join(', ')}.`
        : ' Koi planet 7th house me nahi hai, isliye yeh sign-based reading hi primary signal hai.') +
      ' Yaad rahe — yeh qualitative tendency hai, exact personality prediction nahi.'
  };
}

// --- D9 Lagna lord orientation (marriage-orientation / self-development capacity) ---

function analyzeLagnaLordOrientation(d9ChartData) {
  const { lagna, planetCalculations } = d9ChartData;
  const lagnaLord = lagna.lord;
  const lordData = planetCalculations[lagnaLord];

  if (!lordData) {
    return { present: false, confidence: 'none', summary: 'Lagna lord data unavailable.' };
  }

  const dignity = getPlanetDignity(lagnaLord, lordData.d9SignId);
  const score = clamp(dignityScoreProxy(dignity, lordData.isVargottama));

  return {
    lord: lagnaLord,
    house: lordData.house,
    dignity,
    isVargottama: lordData.isVargottama,
    score,
    strength: score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'weak',
    confidence: 'medium',
    summary: `D9 lagna lord (${lagnaLord}) house ${lordData.house} me hai, dignity: ${dignity}. Yeh batata hai vyakti vivah ke baad relationship ko kis orientation se nibhayega, aur us domain me kitna self-development/maturity aayegi — strong placement matlab responsibility aur adjustment dono me sahaj hai, weak placement matlab conscious effort aur self-work zyada lagega.`
  };
}

// --- D1 vs D9 comparative strength ("D1 = promise, D9 = refinement/manifestation") ---

const DIGNITY_RANK = Object.freeze({ exalted: 5, own: 4, friendly: 3, neutral: 2, debilitated: 1 });

function compareD1D9Strength(d1RawData, planetCalculations) {
  const grahas = d1RawData?.grahas || d1RawData?.planets || {};
  const perPlanet = {};
  let comparedCount = 0;

  for (const [planetName, d9p] of Object.entries(planetCalculations)) {
    const d1p = grahas[planetName];
    const d1SignId = d1p ? Number(d1p.signId) : NaN;
    if (!Number.isFinite(d1SignId)) continue;

    const d1Dignity = getPlanetDignity(planetName, d1SignId);
    const d9Dignity = getPlanetDignity(planetName, d9p.d9SignId);
    const diff = (DIGNITY_RANK[d9Dignity] || 2) - (DIGNITY_RANK[d1Dignity] || 2);

    let verdict;
    if (diff >= 2) verdict = 'D9 me significantly refine/strengthen hua — D1 ka promise D9 me confidently manifest ho raha hai';
    else if (diff === 1) verdict = 'D9 me thoda mazboot hua — D1 promise ko D9 support kar raha hai';
    else if (diff === 0) verdict = 'D1 jaisi hi strength D9 me bhi consistent hai';
    else if (diff === -1) verdict = 'D9 me thoda kamzor hua — D1 promise poora manifest hone me kuch friction ho sakta hai';
    else verdict = 'D9 me significantly weaken hua — D1 ka promise dikhta accha hai lekin D9 refine karke usko dilute kar raha hai, is planet ke area me expectations thodi realistic rakhein';

    perPlanet[planetName] = { d1Dignity, d9Dignity, diff, verdict };
    comparedCount += 1;
  }

  return {
    perPlanet,
    comparedCount,
    confidence: comparedCount >= 6 ? 'high' : comparedCount >= 3 ? 'medium' : 'low',
    note: 'D1 vyakti ka base/surface promise dikhata hai, D9 uski refinement aur real manifestation-strength batata hai. Dono ko saath dekhna zaroori hai — sirf D1 ya sirf D9 se conclusion adhoori hoti hai.'
  };
}

function analyzeSupportingHouses(d9ChartData) {
  const { houseOccupancy, planetCalculations } = d9ChartData;
  const supportHouses = [2, 4, 9, 11];
  const detail = {};
  let supportScore = 0;

  for (const h of supportHouses) {
    const occupants = houseOccupancy[h] || [];
    let hScore = 40;
    for (const occ of occupants) {
      hScore += isBenefic(occ) ? 12 : -8;
      if (planetCalculations[occ]?.isVargottama) hScore += 6;
    }
    hScore = clamp(hScore);
    detail[h] = { occupants, score: hScore, significance: D9_HOUSE_SIGNIFICANCE[h] };
    supportScore += hScore;
  }

  return {
    detail,
    averageScore: clamp(Math.round(supportScore / supportHouses.length)),
    confidence: 'medium'
  };
}

function synthesizeDelayAndObstruction({ seventh, seventhAspects, divisionalStrength }) {
  let delayScore = 30;
  let severeObstruction = false;

  const maleficAspects = seventhAspects.filter(a => a.nature === 'malefic');
  delayScore += maleficAspects.length * 12;

  if (seventh.lordDignity === 'debilitated') { delayScore += 20; severeObstruction = true; }
  if (seventh.occupants.some(o => isNaturalMalefic(o))) delayScore += 10;
  if (divisionalStrength.lagnaVargottama) delayScore -= 15;

  delayScore = clamp(delayScore);

  return {
    delayLevel: delayScore >= 65 ? 'high' : delayScore >= 40 ? 'moderate' : 'low',
    delayScore,
    severeObstruction,
    obstructionScore: clamp(maleficAspects.length * 20),
    confidence: 'medium',
    summary: `Delay/obstruction score ${delayScore}/100 — 7th house pe padne wale aspects aur lord ki dignity ke basis pe. High score ka matlab shaadi nahi hogi nahi hai, sirf itna ki timing me zyada patience/effort lag sakta hai.`
  };
}

// --- Marital stability (separate from "promise" — sustainability of the relationship) ---

function assessMaritalStability({ seventh, seventhAspects, delayAnalysis, divisionalStrength }) {
  let stabilityScore = 55;
  const maleficCount = seventhAspects.filter(a => a.nature === 'malefic').length;
  const beneficCount = seventhAspects.filter(a => a.nature === 'benefic').length;

  stabilityScore += beneficCount * 8 - maleficCount * 10;
  if (seventh.lordDignity === 'debilitated') stabilityScore -= 15;
  if (seventh.lordDignity === 'exalted' || seventh.lordDignity === 'own') stabilityScore += 10;
  if (divisionalStrength.lagnaVargottama) stabilityScore += 10;
  if (delayAnalysis.severeObstruction) stabilityScore -= 15;

  stabilityScore = clamp(stabilityScore);

  return {
    stabilityScore,
    level: stabilityScore >= 70 ? 'stable' : stabilityScore >= 45 ? 'moderate — ups-downs expected' : 'fragile — extra conscious effort/counsel helpful',
    confidence: 'medium',
    summary: `Marital stability score ${stabilityScore}/100 — yeh "kitna acha match hai" se alag hai; yeh batata hai relationship long-term me kitni sustain karegi, sirf shuruaati attraction/promise nahi.`
  };
}

function buildPromiseSynthesis({ seventh, venus, jupiter, supportingHouses, divisionalStrength, delayAnalysis }) {
  const weights = { seventh: 0.4, venus: 0.2, jupiter: 0.15, support: 0.15, overall: 0.1 };
  const raw =
    seventh.score * weights.seventh +
    venus.score * weights.venus +
    jupiter.score * weights.jupiter +
    supportingHouses.averageScore * weights.support +
    divisionalStrength.overallScore * weights.overall;

  const marriagePromise = clamp(Math.round(raw));
  const penalty = delayAnalysis.severeObstruction ? 10 : 0;
  const finalScore = clamp(marriagePromise - penalty);

  let synthesisText;
  if (finalScore >= 70) {
    synthesisText = 'Vivah aur dharma yog overall achha lag raha hai — 7th house/lord aur karakas ka support strong hai. Isका matlab yeh nahi ki sab kuch smooth hi hoga, but base promise solid hai.';
  } else if (finalScore >= 45) {
    synthesisText = 'Vivah yog moderate hai — kuch factors support kar rahe hain, kuch friction bhi dikh raha hai. 7th lord aur karakas dono ko saath dekh kar hi realistic picture banegi.';
  } else {
    synthesisText = 'Is chart me vivah/dharma yog me kuch genuine challenges dikh rahe hain — isका matlab shaadi nahi hogi aisa bilkul nahi hai, but timing aur adjustment dono pe zyada dhyan dena padega. Remedial guidance aur dasha-timing dhyan se check karein.';
  }

  return { marriagePromise: finalScore, weightsUsed: weights, synthesisText };
}

// --- Vimshottari Mahadasha + Antardasha ---

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = Object.freeze({
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
});
const NAKSHATRA_SPAN = 360 / 27;
const TOTAL_DASHA_YEARS = 120;

const TIMING_CAVEAT = 'D9 akela exact shaadi ki tareekh nahi deta — yeh sirf potential, quality aur possible timing-windows dikhata hai. Real timing ke liye D1 + D9 + Vimshottari Dasha + Gochar (transit), in charon ko saath me dekhna zaroori hai.';

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

function buildDashaMarriageTimeline(mahadashaSequence, d9ChartData, seventhAnalysis) {
  const relevantPlanets = new Set(['Venus', 'Jupiter', seventhAnalysis.lord].filter(Boolean));

  return mahadashaSequence
    .filter(p => relevantPlanets.has(p.planet))
    .map(p => {
      const { antardashas, approximate } = buildAntardashaSequence(p);
      const relevantAntardashas = antardashas
        .filter(ad => relevantPlanets.has(ad.planet))
        .map(ad => {
          let relevance;
          if (ad.planet === seventhAnalysis.lord && ad.planet === p.planet) {
            relevance = '7th lord ki apni Mahadasha-Antardasha (MD=AD) — is period ki strongest possible activation window';
          } else if (ad.planet === seventhAnalysis.lord) {
            relevance = '7th lord ki Antardasha — marriage-activation ke liye is sub-period pe dhyan dein';
          } else {
            relevance = `${ad.planet} karaka ki Antardasha — supportive sub-period, gochar ke saath cross-check karein`;
          }
          return { ...ad, relevance };
        });

      return {
        planet: p.planet,
        startDate: p.startDate,
        endDate: p.endDate,
        relevance: p.planet === seventhAnalysis.lord
          ? '7th lord Mahadasha — vivah ki sambhavit activation window'
          : `${p.planet} karaka Mahadasha — sambandhit gochar ke saath cross-check karein`,
        antardashaApproximate: approximate,
        relevantAntardashas
      };
    });
}

function buildCompactD9Response(a) {
  const get = (o, keys) => {
    if (!o || typeof o !== 'object') return {};
    return Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  };
  return {
    summary: get(a.summary, [
      'marriagePromise', 'delayLevel', 'obstructionLevel', 'lagnaVargottama', 'confidence'
    ]),
    marriage: {
      seventhHouse: get(a.seventh, ['score', 'strength', 'confidence', 'summary']),
      seventhLord: get(a.seventh, ['lord', 'lordDignity', 'lordIsVargottama']),
      venus: get(a.venus, ['house', 'dignity', 'isVargottama', 'score', 'strength', 'summary']),
      jupiter: get(a.jupiter, ['house', 'dignity', 'isVargottama', 'score', 'strength', 'summary']),
      spouseNature: get(a.spouseNature, ['seventhSign', 'element', 'baseTemperament', 'occupantInfluences', 'confidence', 'summary']),
      supportingHouses: get(a.supportingHouses, ['averageScore', 'confidence'])
    },
    lagnaOrientation: get(a.lagnaOrientation, ['lord', 'house', 'dignity', 'isVargottama', 'score', 'strength', 'summary']),
    d1VsD9: {
      perPlanet: a.d1VsD9?.perPlanet || {},
      confidence: a.d1VsD9?.confidence || 'low',
      note: a.d1VsD9?.note || null
    },
    overallStrength: get(a.divisionalStrength, ['overallScore', 'lagnaVargottama', 'confidence', 'summary']),
    maritalStability: get(a.maritalStability, ['stabilityScore', 'level', 'confidence', 'summary']),
    delayAndObstruction: get(a.delayAnalysis, [
      'delayLevel', 'delayScore', 'severeObstruction', 'obstructionScore', 'confidence', 'summary'
    ]),
    timing: {
      relevantDashas: Array.isArray(a.dashaTimeline) ? a.dashaTimeline.slice(0, 8) : [],
      caveat: TIMING_CAVEAT
    },
    synthesis: a.synthesisText || null
  };
}

function analyzeD9Deep(d9ChartData, context = {}) {
  const { houseOccupancy, planetCalculations, lagna } = d9ChartData;

  const divisionalStrength = analyzeDivisionalStrength(planetCalculations, lagna);
  const seventh = analyzeSeventhHouseAndLord(houseOccupancy, planetCalculations, lagna.d9SignId);
  const seventhAspects = analyzeAspectsOnSeventh(planetCalculations);
  const venus = analyzeVenusInD9(planetCalculations, seventh);
  const jupiter = analyzeJupiterInD9(planetCalculations);
  const spouseNature = analyzeSpouseNature(d9ChartData, seventh);
  const lagnaOrientation = analyzeLagnaLordOrientation(d9ChartData);
  const supportingHouses = analyzeSupportingHouses(d9ChartData);
  const delayAnalysis = synthesizeDelayAndObstruction({ seventh, seventhAspects, divisionalStrength });
  const maritalStability = assessMaritalStability({ seventh, seventhAspects, delayAnalysis, divisionalStrength });
  const promise = buildPromiseSynthesis({ seventh, venus, jupiter, supportingHouses, divisionalStrength, delayAnalysis });

  let d1VsD9 = { perPlanet: {}, comparedCount: 0, confidence: 'none', note: 'D1 raw data unavailable — D1-vs-D9 comparison skip ho gaya.' };
  if (context.d1RawData) {
    try {
      d1VsD9 = compareD1D9Strength(context.d1RawData, planetCalculations);
    } catch (error) {
      console.warn('D9 D1-vs-D9 comparison skipped:', error.message);
    }
  }

  let dashaTimeline = [];
  if (context.mahadashaSequence) {
    try {
      dashaTimeline = buildDashaMarriageTimeline(context.mahadashaSequence, d9ChartData, seventh);
    } catch (error) {
      console.warn('D9 dasha timeline skipped:', error.message);
    }
  }

  return {
    summary: {
      marriagePromise: promise.marriagePromise,
      delayLevel: delayAnalysis.delayLevel,
      obstructionLevel: delayAnalysis.delayScore >= 65 ? 'high' : delayAnalysis.delayScore >= 40 ? 'moderate' : 'low',
      lagnaVargottama: divisionalStrength.lagnaVargottama,
      confidence: seventh.confidence
    },
    seventh,
    seventhAspects,
    venus,
    jupiter,
    spouseNature,
    lagnaOrientation,
    d1VsD9,
    supportingHouses,
    divisionalStrength,
    maritalStability,
    delayAnalysis,
    dashaTimeline,
    synthesisText: promise.synthesisText
  };
}

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength,
  analyzeSeventhHouseAndLord,
  analyzeAspectsOnSeventh,
  analyzeVenusInD9,
  analyzeJupiterInD9,
  analyzeSpouseNature,
  analyzeLagnaLordOrientation,
  compareD1D9Strength,
  analyzeSupportingHouses,
  synthesizeDelayAndObstruction,
  assessMaritalStability,
  buildPromiseSynthesis,
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  getCurrentDashaState,
  buildAntardashaSequence,
  buildDashaMarriageTimeline,
  buildCompactD9Response,
  analyzeD9Deep,
  TIMING_CAVEAT
};
