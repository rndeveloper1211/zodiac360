/**
 * D4 Extended Rules
 * -----------------
 * Additional classical D4 significations not covered by d4AdvancedRules.js:
 * - Mother's wellbeing indication (symbolic/astrological — NOT medical)
 * - Sukh Index (overall happiness/comfort score)
 * - Wealth & Savings (fixed deposits / accumulated assets) synthesis
 * - Multiple Properties indication
 * - Divisional (dignity) strength of D4 Lagna Lord & 4th Lord
 *
 * All scores are heuristic (0-100) and meant as directional indicators only,
 * consistent with the scoring style used in d4AdvancedRules.js.
 */

const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

// ---------------------------------------------------------
// Dignity tables (whole-sign, simplified — no friend/enemy nuance)
// ---------------------------------------------------------
const OWN_SIGNS = {
  Sun: [5],
  Moon: [4],
  Mars: [1, 8],
  Mercury: [3, 6],
  Jupiter: [9, 12],
  Venus: [2, 7],
  Saturn: [10, 11]
};

const EXALTATION_SIGN = {
  Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7,
  Rahu: 2, Ketu: 8 // node exaltation varies by tradition; commonly used values
};

const DEBILITATION_SIGN = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1,
  Rahu: 8, Ketu: 2
};

function getPlanetDignity(planet, signId) {
  if (EXALTATION_SIGN[planet] === signId) return { status: 'Exalted', points: 20 };
  if (DEBILITATION_SIGN[planet] === signId) return { status: 'Debilitated', points: 0 };
  if (OWN_SIGNS[planet]?.includes(signId)) return { status: 'Own Sign', points: 15 };
  return { status: 'Neutral', points: 10 };
}

// ---------------------------------------------------------
// 1. MOTHER'S WELLBEING INDICATION (symbolic, not medical)
// ---------------------------------------------------------
function analyzeMotherWellbeingIndication(houseOccupancy, planetCalculations, lagnaSignId) {
  const moon = planetCalculations['Moon'];
  const supportingFactors = [];
  const cautionFactors = [];
  let score = 50;

  if (moon) {
    const dignity = getPlanetDignity('Moon', moon.d4SignId);
    if (dignity.status === 'Exalted' || dignity.status === 'Own Sign') {
      score += 20;
      supportingFactors.push(`D4 में Moon ${dignity.status} है, जो मातृ-सुख/wellbeing के लिए शुभ संकेत है।`);
    } else if (dignity.status === 'Debilitated') {
      score -= 20;
      cautionFactors.push('D4 में Moon दुर्बल (debilitated) है — मातृ-पक्ष से जुड़े matters में सजगता आवश्यक हो सकती है।');
    }

    if ([4, 9, 11].includes(Number(moon.house))) {
      score += 10;
      supportingFactors.push('Moon 4/9/11 भाव में है, जो family/mother-side wellbeing को support करता है।');
    }
    if ([6, 8, 12].includes(Number(moon.house))) {
      score -= 10;
      cautionFactors.push('Moon 6/8/12 भाव में है — इस क्षेत्र में अतिरिक्त ध्यान देने का संकेत हो सकता है।');
    }
  }

  const fourthHouseOccupants = houseOccupancy[4] || [];
  const beneficIn4th = fourthHouseOccupants.filter(p => BENEFICS.includes(p));
  const maleficIn4th = fourthHouseOccupants.filter(p => MALEFICS.includes(p));

  if (beneficIn4th.length > 0) {
    score += 10;
    supportingFactors.push(`चतुर्थ भाव में ${beneficIn4th.join(', ')} जैसे शुभ ग्रह मातृ-सुख को support करते हैं।`);
  }
  if (maleficIn4th.length > 0) {
    score -= 5;
    cautionFactors.push(`चतुर्थ भाव में ${maleficIn4th.join(', ')} की उपस्थिति के कारण अतिरिक्त सजगता उचित हो सकती है।`);
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    confidence: moon ? 'medium' : 'low',
    supportingFactors,
    cautionFactors,
    summary:
      score >= 65
        ? 'D4 चार्ट में मातृ-पक्ष के wellbeing का संकेत अनुकूल दिखाई देता है।'
        : score <= 35
        ? 'D4 चार्ट में मातृ-पक्ष से जुड़े matters में अतिरिक्त सजगता का संकेत है।'
        : 'D4 चार्ट में मातृ-पक्ष wellbeing का संकेत मिश्रित/सामान्य है।',
    disclaimer:
      'यह विश्लेषण पूर्णतः पारंपरिक ज्योतिषीय प्रतीकात्मकता (symbolic astrology) पर आधारित है, ' +
      'यह चिकित्सीय (medical) निदान या सलाह नहीं है। स्वास्थ्य संबंधी किसी भी चिंता के लिए कृपया एक योग्य चिकित्सक से परामर्श करें।'
  };
}

// ---------------------------------------------------------
// 2. SUKH INDEX (overall happiness/comfort score)
// ---------------------------------------------------------
function analyzeSukhIndex(houseOccupancy, planetCalculations, fourthLordDetails, aspectAnalysis) {
  let score = 40;
  const supportingFactors = [];
  const cautionFactors = [];

  if (fourthLordDetails?.fourthLordHouse) {
    const houseNum = Number(fourthLordDetails.fourthLordHouse);
    if ([1, 4, 5, 9, 11].includes(houseNum)) {
      score += 20;
      supportingFactors.push(`चतुर्थेश शुभ भाव (${houseNum}) में स्थित है, जो sukh को बढ़ाता है।`);
    } else if ([6, 8, 12].includes(houseNum)) {
      score -= 15;
      cautionFactors.push(`चतुर्थेश दुष्ट भाव (${houseNum}) में स्थित है, जो sukh में कमी का संकेत दे सकता है।`);
    }
  }

  const beneficAspectCount = aspectAnalysis?.beneficAspects?.length || 0;
  const maleficAspectCount = aspectAnalysis?.maleficAspects?.length || 0;
  if (beneficAspectCount > 0) {
    score += beneficAspectCount * 10;
    supportingFactors.push(`चतुर्थ भाव पर ${beneficAspectCount} शुभ ग्रह(ों) की दृष्टि sukh को बढ़ाती है।`);
  }
  if (maleficAspectCount > 0) {
    score -= maleficAspectCount * 8;
    cautionFactors.push(`चतुर्थ भाव पर ${maleficAspectCount} अशुभ ग्रह(ों) की दृष्टि sukh को कम कर सकती है।`);
  }

  const fourthOccupants = houseOccupancy[4] || [];
  const beneficOccupants = fourthOccupants.filter(p => BENEFICS.includes(p));
  const maleficOccupants = fourthOccupants.filter(p => MALEFICS.includes(p));
  if (beneficOccupants.length > 0) {
    score += 15;
    supportingFactors.push(`चतुर्थ भाव में शुभ ग्रह (${beneficOccupants.join(', ')}) उपस्थित हैं।`);
  }
  if (maleficOccupants.length > 0) {
    score -= 10;
    cautionFactors.push(`चतुर्थ भाव में अशुभ ग्रह (${maleficOccupants.join(', ')}) उपस्थित हैं।`);
  }

  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? 'High' : score >= 45 ? 'Moderate' : 'Low';

  return {
    score,
    label,
    confidence: fourthLordDetails ? 'medium' : 'low',
    supportingFactors,
    cautionFactors,
    summary: `D4 के आधार पर overall sukh (घरेलू सुख-शांति एवं मानसिक संतोष) का स्तर "${label}" दिखाई देता है।`
  };
}

// ---------------------------------------------------------
// 3. WEALTH & SAVINGS (fixed deposits / accumulated assets)
// ---------------------------------------------------------
function analyzeWealthAndSavings(houseOccupancy, planetCalculations) {
  const secondHouseOccupants = houseOccupancy[2] || [];
  const eleventhHouseOccupants = houseOccupancy[11] || [];
  const supportingFactors = [];
  const cautionFactors = [];
  let score = 40;

  const beneficIn2nd = secondHouseOccupants.filter(p => BENEFICS.includes(p));
  const beneficIn11th = eleventhHouseOccupants.filter(p => BENEFICS.includes(p));

  if (beneficIn2nd.length > 0) {
    score += 20;
    supportingFactors.push(`द्वितीय भाव (accumulated wealth) में शुभ ग्रह (${beneficIn2nd.join(', ')}) उपस्थित हैं।`);
  }
  if (beneficIn11th.length > 0) {
    score += 20;
    supportingFactors.push(`एकादश भाव (gains/income) में शुभ ग्रह (${beneficIn11th.join(', ')}) उपस्थित हैं।`);
  }

  const maleficIn2nd = secondHouseOccupants.filter(p => MALEFICS.includes(p));
  if (maleficIn2nd.length > 0) {
    score -= 10;
    cautionFactors.push(`द्वितीय भाव में अशुभ ग्रह (${maleficIn2nd.join(', ')}) संचय में उतार-चढ़ाव दिखा सकते हैं।`);
  }

  if (secondHouseOccupants.length === 0 && eleventhHouseOccupants.length === 0) {
    supportingFactors.push('द्वितीय व एकादश भाव रिक्त हैं; निर्णय संबंधित भाव-स्वामियों की स्थिति से लिया जाना चाहिए।');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    confidence: (secondHouseOccupants.length + eleventhHouseOccupants.length) > 0 ? 'medium' : 'low',
    supportingFactors,
    cautionFactors,
    summary:
      score >= 65
        ? 'संचित धन/fixed assets और savings का संकेत अपेक्षाकृत मजबूत है।'
        : score <= 35
        ? 'संचित धन/savings के लिए अतिरिक्त प्रयास व अनुशासन आवश्यक हो सकता है।'
        : 'संचित धन/savings का संकेत मध्यम है।'
  };
}

// ---------------------------------------------------------
// 4. MULTIPLE PROPERTIES INDICATION
// ---------------------------------------------------------
function analyzeMultiplePropertiesIndication(houseOccupancy, planetCalculations, fourthLordDetails, aspectAnalysis) {
  let signalCount = 0;
  const supportingFactors = [];

  const fourthOccupants = houseOccupancy[4] || [];
  const eleventhOccupants = houseOccupancy[11] || [];

  if (fourthOccupants.length >= 2) {
    signalCount += 1;
    supportingFactors.push('चतुर्थ भाव में एक से अधिक ग्रह होने से multiple property-events की संभावना बढ़ती है।');
  }
  if (eleventhOccupants.length >= 2) {
    signalCount += 1;
    supportingFactors.push('एकादश भाव में एक से अधिक ग्रह gains/acquisitions के एक से अधिक अवसर दिखा सकते हैं।');
  }
  const beneficAspectCount = aspectAnalysis?.beneficAspects?.length || 0;
  if (beneficAspectCount >= 2) {
    signalCount += 1;
    supportingFactors.push('चतुर्थ भाव पर एक से अधिक शुभ ग्रहों की दृष्टि property gains को सहयोग देती है।');
  }
  if (fourthLordDetails?.fourthLordHouse && [2, 4, 11].includes(Number(fourthLordDetails.fourthLordHouse))) {
    signalCount += 1;
    supportingFactors.push('चतुर्थेश धन/संपत्ति संबंधी भाव में स्थित है, जो एक से अधिक संपत्ति की संभावना बढ़ाता है।');
  }

  let indication;
  if (signalCount >= 3) indication = 'Strong indication of multiple properties';
  else if (signalCount === 2) indication = 'Moderate indication (2-3 properties possible)';
  else if (signalCount === 1) indication = 'Mild indication';
  else indication = 'Single/primary property more likely';

  return {
    signalCount,
    indication,
    confidence: signalCount >= 3 ? 'medium' : 'low',
    supportingFactors,
    summary: `Multiple properties के लिए संकेत स्तर: "${indication}"।`
  };
}

// ---------------------------------------------------------
// 5. DIVISIONAL (DIGNITY) STRENGTH — simplified Vimshopaka-style proxy
// ---------------------------------------------------------
function analyzeDivisionalStrength(planetCalculations, lagna, fourthLordDetails) {
  const allPlanetsDignity = {};
  let totalPoints = 0;
  let count = 0;

  for (const [planetName, p] of Object.entries(planetCalculations)) {
    const dignity = getPlanetDignity(planetName, p.d4SignId);
    allPlanetsDignity[planetName] = dignity;
    totalPoints += dignity.points;
    count += 1;
  }

  const lagnaLordPlanet = lagna?.lord;
  const lagnaLordData = lagnaLordPlanet ? planetCalculations[lagnaLordPlanet] : null;
  const lagnaLordDignity = lagnaLordData ? getPlanetDignity(lagnaLordPlanet, lagnaLordData.d4SignId) : null;

  const fourthLordPlanet = fourthLordDetails?.fourthLord;
  const fourthLordData = fourthLordPlanet ? planetCalculations[fourthLordPlanet] : null;
  const fourthLordDignity = fourthLordData ? getPlanetDignity(fourthLordPlanet, fourthLordData.d4SignId) : null;

  const overallScore = count > 0 ? Math.round((totalPoints / (count * 20)) * 100) : 0;

  return {
    allPlanetsDignity,
    lagnaLord: lagnaLordPlanet
      ? { planet: lagnaLordPlanet, ...lagnaLordDignity }
      : null,
    fourthLord: fourthLordPlanet
      ? { planet: fourthLordPlanet, ...fourthLordDignity }
      : null,
    overallD4StrengthScore: overallScore,
    note:
      'यह एक सरलीकृत dignity-based strength proxy है (exalted/own/neutral/debilitated), ' +
      'पूर्ण classical Vimshopaka Bala (जिसमें सभी 6/7/16 divisional charts का weighted combination होता है) नहीं है।',
    summary: `D4 चार्ट की overall planetary dignity strength लगभग ${overallScore}/100 है।`
  };
}

module.exports = {
  getPlanetDignity,
  analyzeMotherWellbeingIndication,
  analyzeSukhIndex,
  analyzeWealthAndSavings,
  analyzeMultiplePropertiesIndication,
  analyzeDivisionalStrength
};