/**
 * D4 (Chaturthamsha) Advanced Rules
 * ---------------------------------
 * Purpose:
 * - 4th house & 4th lord analysis
 * - Parashari planetary aspects
 * - Property source analysis
 * - Property type classification
 * - Vehicle & comforts
 * - Relocation / distant / foreign residence
 * - Commercial property potential
 *
 * IMPORTANT:
 * This module uses evidence-based scoring.
 * No single planet/sign is treated as a deterministic prediction.
 */

const { SIGNS, SIGN_LORDS } = require('./d4Rules');

// ---------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------

const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

const NATURAL_MALEFICS = [
  'Sun',
  'Mars',
  'Saturn',
  'Rahu',
  'Ketu'
];

const MOVABLE_SIGNS = [1, 4, 7, 10]; // Aries, Cancer, Libra, Capricorn
const FIXED_SIGNS = [2, 5, 8, 11];   // Taurus, Leo, Scorpio, Aquarius
const DUAL_SIGNS = [3, 6, 9, 12];    // Gemini, Virgo, Sagittarius, Pisces

const PROPERTY_HOUSES = {
  FAMILY: 2,
  PROPERTY: 4,
  INHERITANCE: 8,
  CAREER: 10,
  GAINS: 11,
  EXPENDITURE_FOREIGN: 12
};

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

function getSign(signId) {
  return SIGNS.find(s => s.id === Number(signId)) || null;
}

function getSignLord(signId) {
  const sign = getSign(signId);
  return sign?.lord || SIGN_LORDS?.[signId] || null;
}

function getHouseOccupants(houseOccupancy, house) {
  return Array.isArray(houseOccupancy?.[house])
    ? houseOccupancy[house]
    : [];
}

function getPlanet(planetCalculations, planetName) {
  if (!planetCalculations) return null;

  if (planetCalculations[planetName]) {
    return planetCalculations[planetName];
  }

  const key = Object.keys(planetCalculations).find(
    k => k.toLowerCase() === planetName.toLowerCase()
  );

  return key ? planetCalculations[key] : null;
}

function unique(arr) {
  return [...new Set(arr)];
}

function scoreToConfidence(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function buildScoreResult(score, supportingFactors, cautionFactors = []) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: normalizedScore,
    confidence: scoreToConfidence(normalizedScore),
    supportingFactors: unique(supportingFactors),
    cautionFactors: unique(cautionFactors)
  };
}

function getSignNature(signId) {
  signId = Number(signId);

  if (MOVABLE_SIGNS.includes(signId)) return 'movable';
  if (FIXED_SIGNS.includes(signId)) return 'fixed';
  if (DUAL_SIGNS.includes(signId)) return 'dual';

  return 'unknown';
}

function getFourthHouseSign(d4LagnaSignId) {
  return ((Number(d4LagnaSignId) - 1 + 3) % 12) + 1;
}

// ---------------------------------------------------------
// 1. PLANETARY ASPECT ENGINE
// ---------------------------------------------------------

/**
 * Standard Parashari aspects:
 *
 * All planets -> 7th
 * Mars        -> 4th, 7th, 8th
 * Jupiter     -> 5th, 7th, 9th
 * Saturn      -> 3rd, 7th, 10th
 *
 * Nodes are kept with 7th aspect here.
 * If your project uses a different Rahu/Ketu aspect convention,
 * change only this function.
 */

function getPlanetAspectedHouses(planetName, house) {
  const result = [];

  const addAspect = offset => {
    const target = ((house - 1 + offset) % 12) + 1;

    if (!result.includes(target)) {
      result.push(target);
    }
  };

  // 7th aspect
  addAspect(6);

  if (planetName === 'Mars') {
    addAspect(3); // 4th
    addAspect(7); // 8th
  }

  if (planetName === 'Jupiter') {
    addAspect(4); // 5th
    addAspect(8); // 9th
  }

  if (planetName === 'Saturn') {
    addAspect(2); // 3rd
    addAspect(9); // 10th
  }

  return result;
}

function calculateAspectsOnHouse(
  planetCalculations,
  targetHouse
) {
  const aspects = [];

  for (const [planetName, pData] of Object.entries(
    planetCalculations || {}
  )) {
    if (!pData?.house) continue;

    const aspectedHouses = getPlanetAspectedHouses(
      planetName,
      Number(pData.house)
    );

    if (aspectedHouses.includes(Number(targetHouse))) {
      aspects.push({
        planet: planetName,
        fromHouse: Number(pData.house),
        aspectType:
          planetName === 'Mars'
            ? 'Parashari Mars special + 7th aspect'
            : planetName === 'Jupiter'
              ? 'Parashari Jupiter special + 7th aspect'
              : planetName === 'Saturn'
                ? 'Parashari Saturn special + 7th aspect'
                : '7th aspect'
      });
    }
  }

  return aspects;
}

// ---------------------------------------------------------
// 2. FOURTH HOUSE + FOURTH LORD
// ---------------------------------------------------------

function analyzeFourthHouseAndLord(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  const fourthSignId = getFourthHouseSign(d4LagnaSignId);
  const fourthSign = getSign(fourthSignId);

  const fourthLordName =
    fourthSign?.lord ||
    getSignLord(fourthSignId);

  const occupants = getHouseOccupants(
    houseOccupancy,
    4
  );

  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  const aspects = calculateAspectsOnHouse(
    planetCalculations,
    4
  );

  const supportingFactors = [];
  const cautionFactors = [];

  if (occupants.length > 0) {
    supportingFactors.push(
      `चतुर्थ भाव में ${occupants.join(', ')} स्थित हैं।`
    );
  }

  if (fourthLord) {
    supportingFactors.push(
      `चतुर्थेश ${fourthLordName} D4 के ${fourthLord.house}वें भाव में स्थित है।`
    );

    if ([1, 4, 7, 10].includes(Number(fourthLord.house))) {
      supportingFactors.push(
        'चतुर्थेश केंद्र भाव में है, जिससे property/home matters को structural support मिलता है।'
      );
    }

    if ([2, 5, 9, 11].includes(Number(fourthLord.house))) {
      supportingFactors.push(
        'चतुर्थेश लाभ/धन/धर्म संबंधी भाव में है, जिससे property acquisition को support मिल सकता है।'
      );
    }

    if ([6, 8, 12].includes(Number(fourthLord.house))) {
      cautionFactors.push(
        `चतुर्थेश ${fourthLord.house}वें भाव में होने से property matters में अतिरिक्त effort, delay, adjustment या expense संभव है।`
      );
    }
  }

  if (aspects.length > 0) {
    supportingFactors.push(
      `चतुर्थ भाव पर ${aspects.map(a => a.planet).join(', ')} की दृष्टि है।`
    );
  }

  const score =
    40 +
    (occupants.length > 0 ? 10 : 0) +
    (fourthLord ? 20 : 0) +
    (fourthLord && [1, 2, 4, 5, 9, 10, 11].includes(Number(fourthLord.house))
      ? 20
      : 0) +
    (aspects.length > 0 ? 10 : 0) -
    (fourthLord && [6, 8, 12].includes(Number(fourthLord.house))
      ? 15
      : 0);

  const result = buildScoreResult(
    score,
    supportingFactors,
    cautionFactors
  );

  let lordAnalysisText =
    `चतुर्थ भाव ${fourthSign?.name || ''} राशि में है और इसका स्वामी ${fourthLordName || 'Unknown'} है।`;

  if (fourthLord) {
    lordAnalysisText +=
      ` चतुर्थेश ${fourthLordName} ${fourthLord.house}वें भाव में स्थित है।`;
  }

  if (aspects.length) {
    lordAnalysisText +=
      ` चतुर्थ भाव पर ${aspects.map(a => a.planet).join(', ')} की दृष्टि भी है।`;
  }

  return {
    fourthSignId,
    fourthSignName: fourthSign?.name || null,
    fourthSignHindi: fourthSign?.hindi || null,
    fourthLord: fourthLordName,
    fourthLordHouse: fourthLord?.house || null,
    occupants,
    aspects,
    lordAnalysisText,
    ...result
  };
}

// ---------------------------------------------------------
// 3. ASPECT ANALYSIS
// ---------------------------------------------------------

function analyzeAspectsOnFourthHouse(planetCalculations) {
  const aspects = calculateAspectsOnHouse(
    planetCalculations,
    4
  );

  const beneficAspects = [];
  const maleficAspects = [];
  const neutralAspects = [];

  for (const aspect of aspects) {
    if (BENEFICS.includes(aspect.planet)) {
      beneficAspects.push(aspect.planet);
    } else if (NATURAL_MALEFICS.includes(aspect.planet)) {
      maleficAspects.push(aspect.planet);
    } else {
      neutralAspects.push(aspect.planet);
    }
  }

  let score = 50;

  score += beneficAspects.length * 15;
  score -= maleficAspects.length * 10;

  score = Math.max(0, Math.min(100, score));

  const supportingFactors = [];
  const cautionFactors = [];

  if (beneficAspects.length) {
    supportingFactors.push(
      `चतुर्थ भाव पर ${beneficAspects.join(', ')} का शुभ प्रभाव है।`
    );
  }

  if (maleficAspects.length) {
    cautionFactors.push(
      `चतुर्थ भाव पर ${maleficAspects.join(', ')} का दबाव/चुनौतीपूर्ण प्रभाव है।`
    );
  }

  if (!aspects.length) {
    supportingFactors.push(
      'चतुर्थ भाव पर कोई प्रमुख Parashari aspect नहीं मिला।'
    );
  }

  return {
    aspects,
    beneficAspects: unique(beneficAspects),
    maleficAspects: unique(maleficAspects),
    neutralAspects: unique(neutralAspects),
    ...buildScoreResult(
      score,
      supportingFactors,
      cautionFactors
    ),
    summary:
      aspects.length
        ? `चतुर्थ भाव पर ${aspects.map(a => a.planet).join(', ')} की दृष्टि है।`
        : 'चतुर्थ भाव पर कोई प्रमुख ग्रह दृष्टि नहीं है।'
  };
}

// ---------------------------------------------------------
// 4. PROPERTY SOURCE
// ---------------------------------------------------------

function detectPropertySource(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  const scores = {
    familySupport: 0,
    ancestral: 0,
    inheritance: 0,
    selfAcquired: 0,
    investmentGains: 0
  };

  const evidence = {
    familySupport: [],
    ancestral: [],
    inheritance: [],
    selfAcquired: [],
    investmentGains: []
  };

  const family = getHouseOccupants(houseOccupancy, 2);
  const property = getHouseOccupants(houseOccupancy, 4);
  const inheritance = getHouseOccupants(houseOccupancy, 8);
  const career = getHouseOccupants(houseOccupancy, 10);
  const gains = getHouseOccupants(houseOccupancy, 11);

  // 2nd house = family wealth/assets
  if (family.length) {
    scores.familySupport += 30;

    evidence.familySupport.push(
      `द्वितीय भाव में ${family.join(', ')} की उपस्थिति family wealth/assets को activate करती है।`
    );
  }

  // 4th house = property itself
  if (property.length) {
    scores.familySupport += 5;
    scores.selfAcquired += 5;
  }

  // 8th = inheritance / ancestral transfer
  if (inheritance.length) {
    scores.inheritance += 40;

    evidence.inheritance.push(
      `अष्टम भाव में ${inheritance.join(', ')} inheritance/shared assets theme को activate करते हैं।`
    );

    scores.ancestral += 20;

    evidence.ancestral.push(
      'अष्टम भाव की सक्रियता ancestral/shared assets की संभावना को support करती है।'
    );
  }

  // 10th = career-generated acquisition
  if (career.length) {
    scores.selfAcquired += 30;

    evidence.selfAcquired.push(
      `दशम भाव में ${career.join(', ')} career-based acquisition को support करते हैं।`
    );
  }

  // 11th = gains
  if (gains.length) {
    scores.selfAcquired += 20;
    scores.investmentGains += 30;

    evidence.selfAcquired.push(
      `एकादश भाव में ${gains.join(', ')} gains के माध्यम से property acquisition को support करते हैं।`
    );

    evidence.investmentGains.push(
      `एकादश भाव में ${gains.join(', ')} property gains/investment realization को support करते हैं।`
    );
  }

  // 4th lord
  const fourthSignId = getFourthHouseSign(d4LagnaSignId);
  const fourthLordName = getSignLord(fourthSignId);
  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  if (fourthLord) {
    if ([2, 4, 10, 11].includes(Number(fourthLord.house))) {
      scores.selfAcquired += 15;

      evidence.selfAcquired.push(
        `चतुर्थेश ${fourthLordName} ${fourthLord.house}वें भाव में है, जो acquisition/gains/career connection देता है।`
      );
    }

    if ([8].includes(Number(fourthLord.house))) {
      scores.inheritance += 30;

      evidence.inheritance.push(
        `चतुर्थेश ${fourthLordName} अष्टम भाव में है।`
      );
    }

    if ([2].includes(Number(fourthLord.house))) {
      scores.familySupport += 20;

      evidence.familySupport.push(
        `चतुर्थेश ${fourthLordName} द्वितीय भाव से जुड़ा है।`
      );
    }
  }

  // cap scores
  for (const key of Object.keys(scores)) {
    scores[key] = Math.min(100, scores[key]);
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([source, score]) => ({
      source,
      score,
      confidence: scoreToConfidence(score)
    }));

  const strongest = ranked[0];

  const labels = {
    familySupport: 'पारिवारिक संपत्ति/परिवार का सहयोग',
    ancestral: 'पैतृक/वंशानुगत संपत्ति',
    inheritance: 'Inheritance / विरासत',
    selfAcquired: 'स्वयं के प्रयास/करियर से संपत्ति',
    investmentGains: 'Investment / Property Gains'
  };

  return {
    scores,
    ranked,
    strongestSource: strongest
      ? labels[strongest.source]
      : 'मिश्रित स्रोत',
    evidence,
    sourceSummary:
      strongest && strongest.score >= 40
        ? `संपत्ति के स्रोत में ${labels[strongest.source]} का संकेत अपेक्षाकृत अधिक है।`
        : 'संपत्ति के स्रोत में किसी एक माध्यम का अत्यधिक स्पष्ट dominance नहीं है।'
  };
}

// ---------------------------------------------------------
// 5. PROPERTY TYPE
// ---------------------------------------------------------

function analyzePropertyType(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  const scores = {
    residential: 30,
    independentHouse: 0,
    apartment: 0,
    plotLand: 0,
    commercial: 0,
    investmentProperty: 0
  };

  const evidence = {
    residential: [],
    independentHouse: [],
    apartment: [],
    plotLand: [],
    commercial: [],
    investmentProperty: []
  };

  const fourthOccupants = getHouseOccupants(
    houseOccupancy,
    4
  );

  const tenthOccupants = getHouseOccupants(
    houseOccupancy,
    10
  );

  const eleventhOccupants = getHouseOccupants(
    houseOccupancy,
    11
  );

  const secondOccupants = getHouseOccupants(
    houseOccupancy,
    2
  );

  const fourthSignId = getFourthHouseSign(d4LagnaSignId);
  const fourthSign = getSign(fourthSignId);

  // -------------------------------------------------------
  // 4th house itself
  // -------------------------------------------------------

  if (fourthOccupants.length) {
    scores.residential += 20;

    evidence.residential.push(
      `चतुर्थ भाव में ${fourthOccupants.join(', ')} की उपस्थिति residential property theme को activate करती है।`
    );
  }

  // Earth signs support tangible/stable property
  if (fourthSign?.element === 'Earth') {
    scores.independentHouse += 15;
    scores.plotLand += 10;

    evidence.independentHouse.push(
      'चतुर्थ भाव की पृथ्वी तत्व राशि tangible/stable property preference को support करती है।'
    );
  }

  // Air signs can support apartment / transactions
  if (fourthSign?.element === 'Air') {
    scores.apartment += 10;

    evidence.apartment.push(
      'चतुर्थ भाव की वायु तत्व राशि multi-unit/urban residential environment को support कर सकती है।'
    );
  }

  // Fire signs can support land/construction initiative
  if (fourthSign?.element === 'Fire') {
    scores.plotLand += 10;

    evidence.plotLand.push(
      'चतुर्थ भाव की अग्नि तत्व राशि construction/land initiative को support कर सकती है।'
    );
  }

  // Water signs support residential comfort
  if (fourthSign?.element === 'Water') {
    scores.residential += 10;

    evidence.residential.push(
      'चतुर्थ भाव की जल तत्व राशि residential comfort orientation को support करती है।'
    );
  }

  // -------------------------------------------------------
  // 4th lord
  // -------------------------------------------------------

  const fourthLordName = getSignLord(fourthSignId);
  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  if (fourthLord) {
    const lordHouse = Number(fourthLord.house);

    if ([1, 2, 4, 5, 9, 11].includes(lordHouse)) {
      scores.residential += 10;
    }

    if ([4, 5, 9, 11].includes(lordHouse)) {
      scores.independentHouse += 8;
    }

    if ([10, 11].includes(lordHouse)) {
      scores.commercial += 12;

      evidence.commercial.push(
        `चतुर्थेश ${fourthLordName} का ${lordHouse}वें भाव से संबंध property-career/gains connection देता है।`
      );
    }

    if ([8, 11].includes(lordHouse)) {
      scores.investmentProperty += 10;
    }

    if ([6, 8, 12].includes(lordHouse)) {
      scores.residential -= 5;
    }
  }

  // -------------------------------------------------------
  // 10th / 11th / 2nd activation
  // -------------------------------------------------------

  if (tenthOccupants.length) {
    scores.commercial += 15;

    evidence.commercial.push(
      `दशम भाव में ${tenthOccupants.join(', ')} की उपस्थिति property-career/business connection को support करती है।`
    );
  }

  if (eleventhOccupants.length) {
    scores.investmentProperty += 15;
    scores.commercial += 8;

    evidence.investmentProperty.push(
      `एकादश भाव में ${eleventhOccupants.join(', ')} gains/realization को support करते हैं।`
    );
  }

  if (secondOccupants.length) {
    scores.residential += 5;
    scores.investmentProperty += 5;
  }

  // -------------------------------------------------------
  // Venus / Mercury / Saturn / Mars
  // -------------------------------------------------------

  const venus = getPlanet(
    planetCalculations,
    'Venus'
  );

  const mercury = getPlanet(
    planetCalculations,
    'Mercury'
  );

  const saturn = getPlanet(
    planetCalculations,
    'Saturn'
  );

  const mars = getPlanet(
    planetCalculations,
    'Mars'
  );

  if (venus && [2, 4, 5, 7, 11].includes(Number(venus.house))) {
    scores.residential += 8;
    scores.apartment += 5;

    evidence.residential.push(
      'शुक्र का property/comfort-related houses से संबंध residential comfort को support करता है।'
    );
  }

  if (mercury && [7, 10, 11].includes(Number(mercury.house))) {
    scores.commercial += 8;
  }

  if (saturn && [4, 10, 11].includes(Number(saturn.house))) {
    scores.independentHouse += 5;
    scores.commercial += 5;
  }

  if (mars && [4, 10, 11].includes(Number(mars.house))) {
    scores.plotLand += 8;
    scores.commercial += 5;

    evidence.plotLand.push(
      'मंगल का property/construction-related houses से संबंध land/construction theme को support करता है।'
    );
  }

  for (const key of Object.keys(scores)) {
    scores[key] = Math.max(
      0,
      Math.min(100, Math.round(scores[key]))
    );
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([type, score]) => ({
      type,
      score,
      confidence: scoreToConfidence(score)
    }));

  const labels = {
    residential: 'Residential Property',
    independentHouse: 'Independent House / Built-up Home',
    apartment: 'Apartment / Multi-unit Residence',
    plotLand: 'Plot / Land / Construction-oriented Property',
    commercial: 'Commercial Property',
    investmentProperty: 'Investment / Income-oriented Property'
  };

  const strongest = ranked[0];

  return {
    scores,
    ranked,
    primaryCategory: strongest
      ? labels[strongest.type]
      : 'Mixed Property Type',
    primaryType: strongest?.type || null,
    evidence,
    fourthHouseSign: fourthSign?.name || null,
    description:
      strongest
        ? `${labels[strongest.type]} की संभावना उपलब्ध D4 factors में अपेक्षाकृत अधिक दिखाई देती है।`
        : 'Property type का pattern mixed है।'
  };
}

// Backward-compatible wrapper
function getPropertyClassification(
  d4SignId,
  planetName = null
) {
  const sign = getSign(d4SignId);

  if (!sign) {
    return {
      category: 'Unknown',
      description: 'अमान्य D4 राशि।'
    };
  }

  return {
    category: 'Supporting Sign Influence',
    description:
      `${sign.name} (${sign.hindi}) का ${sign.element} element property interpretation में केवल supporting factor के रूप में उपयोग किया गया है।`,
    signId: d4SignId,
    signName: sign.name,
    element: sign.element,
    planet: planetName
  };
}

// ---------------------------------------------------------
// 6. VEHICLE & COMFORTS
// ---------------------------------------------------------

function analyzeVehicleAndComforts(
  houseOccupancy,
  planetCalculations
) {
  const occupants = getHouseOccupants(
    houseOccupancy,
    4
  );

  const fourthLord = Object.entries(
    planetCalculations || {}
  ).find(([planet, data]) => {
    return Number(data.house) === 4;
  });

  const venus = getPlanet(
    planetCalculations,
    'Venus'
  );

  const moon = getPlanet(
    planetCalculations,
    'Moon'
  );

  let score = 45;
  const supportingFactors = [];
  const cautionFactors = [];

  const beneficOccupants = occupants.filter(
    p => BENEFICS.includes(p)
  );

  const maleficOccupants = occupants.filter(
    p => NATURAL_MALEFICS.includes(p)
  );

  if (beneficOccupants.length) {
    score += beneficOccupants.length * 12;

    supportingFactors.push(
      `चतुर्थ भाव में ${beneficOccupants.join(', ')} का प्रभाव comforts को support करता है।`
    );
  }

  if (maleficOccupants.length) {
    score -= maleficOccupants.length * 8;

    cautionFactors.push(
      `चतुर्थ भाव में ${maleficOccupants.join(', ')} का प्रभाव comfort acquisition में effort/delay दे सकता है।`
    );
  }

  if (venus && [1, 2, 4, 5, 7, 9, 11].includes(Number(venus.house))) {
    score += 15;

    supportingFactors.push(
      'शुक्र की अनुकूल स्थिति material comforts और vehicle enjoyment को support करती है।'
    );
  }

  if (moon && [1, 2, 4, 5, 7, 11].includes(Number(moon.house))) {
    score += 8;

    supportingFactors.push(
      'चंद्रमा की अनुकूल स्थिति residential/emotional comfort को support करती है।'
    );
  }

  return {
    comfortLevel:
      score >= 75
        ? 'High'
        : score >= 55
          ? 'Moderate-High'
          : score >= 40
            ? 'Moderate'
            : 'Challenging',
    ...buildScoreResult(
      score,
      supportingFactors,
      cautionFactors
    ),
    fourthHouseOccupants: occupants,
    fourthLordReference: fourthLord
      ? fourthLord[0]
      : null,
    summary:
      score >= 75
        ? 'घर, वाहन और भौतिक comforts के लिए मजबूत support दिखाई देता है।'
        : score >= 55
          ? 'घर, वाहन और comforts के लिए मध्यम से अच्छा support है।'
          : 'घर और vehicle comforts में अधिक effort या adjustment की आवश्यकता हो सकती है।'
  };
}

// ---------------------------------------------------------
// 7. RELOCATION / MIGRATION
// ---------------------------------------------------------

function analyzeRelocation(
  d4LagnaSignId,
  planetCalculations,
  houseOccupancy = {}
) {
  const fourthSignId = getFourthHouseSign(
    d4LagnaSignId
  );

  const fourthSignNature = getSignNature(
    fourthSignId
  );

  const twelfthOccupants = getHouseOccupants(
    houseOccupancy,
    12
  );

  const ninthOccupants = getHouseOccupants(
    houseOccupancy,
    9
  );

  const thirdOccupants = getHouseOccupants(
    houseOccupancy,
    3
  );

  let localRelocationScore = 0;
  let distantRelocationScore = 0;
  let foreignScore = 0;

  const supportingFactors = [];
  const cautionFactors = [];

  if (fourthSignNature === 'movable') {
    localRelocationScore += 25;
    distantRelocationScore += 15;

    supportingFactors.push(
      'चतुर्थ भाव movable sign में है, जिससे residence movement की संभावना बढ़ती है।'
    );
  }

  if (fourthSignNature === 'fixed') {
    localRelocationScore -= 10;
    distantRelocationScore -= 5;

    supportingFactors.push(
      'चतुर्थ भाव fixed sign में होने से residence stability को support मिलता है।'
    );
  }

  if (twelfthOccupants.length) {
    foreignScore += 25;
    distantRelocationScore += 15;

    supportingFactors.push(
      `द्वादश भाव में ${twelfthOccupants.join(', ')} residence-away/foreign theme को activate करते हैं।`
    );
  }

  if (ninthOccupants.length) {
    distantRelocationScore += 15;
    foreignScore += 10;

    supportingFactors.push(
      `नवम भाव में ${ninthOccupants.join(', ')} long-distance movement को support करते हैं।`
    );
  }

  if (thirdOccupants.length) {
    localRelocationScore += 10;

    supportingFactors.push(
      `तृतीय भाव में ${thirdOccupants.join(', ')} movement/short-distance change को activate करते हैं।`
    );
  }

  const fourthLordName = getSignLord(
    fourthSignId
  );

  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  if (fourthLord) {
    if ([3, 6, 8, 9, 12].includes(Number(fourthLord.house))) {
      distantRelocationScore += 15;
    }

    if (Number(fourthLord.house) === 12) {
      foreignScore += 25;

      supportingFactors.push(
        `चतुर्थेश ${fourthLordName} द्वादश भाव में है, जिससे residence-away/foreign indication मजबूत होती है।`
      );
    }

    if (Number(fourthLord.house) === 4) {
      localRelocationScore -= 10;

      supportingFactors.push(
        `चतुर्थेश ${fourthLordName} अपने ही भाव में होने से residence stability को support करता है।`
      );
    }
  }

  localRelocationScore = Math.max(
    0,
    Math.min(100, localRelocationScore)
  );

  distantRelocationScore = Math.max(
    0,
    Math.min(100, distantRelocationScore)
  );

  foreignScore = Math.max(
    0,
    Math.min(100, foreignScore)
  );

  let relocationInsight;

  if (foreignScore >= 60) {
    relocationInsight =
      'विदेश/जन्मस्थान से दूर निवास की संभावना अपेक्षाकृत मजबूत है।';
  } else if (distantRelocationScore >= 50) {
    relocationInsight =
      'दूर स्थान पर relocation या residence change की संभावना दिखाई देती है।';
  } else if (localRelocationScore >= 35) {
    relocationInsight =
      'जीवन में residence change या स्थान परिवर्तन के कुछ संकेत हैं।';
  } else {
    relocationInsight =
      'D4 में residence stability का संकेत relocation की तुलना में अधिक है।';
  }

  return {
    fourthSignNature,
    localRelocationScore,
    distantRelocationScore,
    foreignSettlementScore: foreignScore,
    ...buildScoreResult(
      Math.max(
        localRelocationScore,
        distantRelocationScore,
        foreignScore
      ),
      supportingFactors,
      cautionFactors
    ),
    relocationInsight
  };
}

// ---------------------------------------------------------
// 8. COMMERCIAL PROPERTY
// ---------------------------------------------------------
function analyzeParentalFinancialSupport(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  let motherSupportScore = 0;
  let fatherSupportScore = 0;
  let familySupportScore = 0;

  const motherEvidence = [];
  const fatherEvidence = [];
  const familyEvidence = [];

  const second = getHouseOccupants(houseOccupancy, 2);
  const fourth = getHouseOccupants(houseOccupancy, 4);
  const ninth = getHouseOccupants(houseOccupancy, 9);
  const eleventh = getHouseOccupants(houseOccupancy, 11);
  const eighth = getHouseOccupants(houseOccupancy, 8);

  // -----------------------------
  // FAMILY WEALTH
  // -----------------------------

  if (second.length) {
    familySupportScore += 25;

    familyEvidence.push(
      `द्वितीय भाव में ${second.join(', ')} की स्थिति family wealth/support को activate करती है।`
    );
  }

  if (eleventh.length) {
    familySupportScore += 10;

    familyEvidence.push(
      `एकादश भाव की सक्रियता financial assistance/gains realization को support करती है।`
    );
  }

  // -----------------------------
  // MOTHER / HOME SUPPORT
  // -----------------------------

  if (fourth.length) {
    motherSupportScore += 20;

    motherEvidence.push(
      `चतुर्थ भाव में ${fourth.join(', ')} की स्थिति mother/home/property support को activate करती है।`
    );
  }

  // -----------------------------
  // FATHER SUPPORT
  // -----------------------------

  if (ninth.length) {
    fatherSupportScore += 20;

    fatherEvidence.push(
      `नवम भाव में ${ninth.join(', ')} की स्थिति father-side support/blessings को activate करती है।`
    );
  }

  // -----------------------------
  // INHERITANCE
  // -----------------------------

  if (eighth.length) {
    familySupportScore += 10;

    familyEvidence.push(
      `अष्टम भाव की सक्रियता inherited/shared family assets की संभावना बढ़ाती है।`
    );
  }

  // -----------------------------
  // BENEFIC FAMILY SUPPORT
  // -----------------------------

  const beneficPlanets = [
    'Jupiter',
    'Venus',
    'Mercury',
    'Moon'
  ];

  for (const planet of beneficPlanets) {
    const p = getPlanet(planetCalculations, planet);

    if (!p) continue;

    if ([2, 4, 9, 11].includes(Number(p.house))) {
      familySupportScore += 8;

      familyEvidence.push(
        `${planet} का 2/4/9/11 भाव से संबंध family/parental support को strengthen करता है।`
      );
    }

    if ([4].includes(Number(p.house))) {
      motherSupportScore += 8;
    }

    if ([9].includes(Number(p.house))) {
      fatherSupportScore += 8;
    }
  }

  familySupportScore = Math.min(100, familySupportScore);
  motherSupportScore = Math.min(100, motherSupportScore);
  fatherSupportScore = Math.min(100, fatherSupportScore);

  const combined =
    Math.round(
      (familySupportScore +
        motherSupportScore +
        fatherSupportScore) / 3
    );

  return {
    familyFinancialSupport: buildScoreResult(
      familySupportScore,
      familyEvidence
    ),

    motherSupport: buildScoreResult(
      motherSupportScore,
      motherEvidence
    ),

    fatherSupport: buildScoreResult(
      fatherSupportScore,
      fatherEvidence
    ),

    overallParentalSupport: buildScoreResult(
      combined,
      unique([
        ...familyEvidence,
        ...motherEvidence,
        ...fatherEvidence
      ])
    ),

    summary:
      combined >= 70
        ? 'परिवार/माता-पिता से financial या property-related support का मजबूत संकेत है।'
        : combined >= 50
          ? 'परिवार/माता-पिता से कुछ financial या property support मिलने का संकेत है।'
          : 'माता-पिता से direct financial/property support का संकेत सीमित है; self-acquisition अधिक महत्वपूर्ण हो सकता है।'
  };
}
function analyzeCommercialPotential(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  let score = 20;

  const evidence = [];
  const cautionFactors = [];

  const fourth = getHouseOccupants(
    houseOccupancy,
    4
  );

  const second = getHouseOccupants(
    houseOccupancy,
    2
  );

  const seventh = getHouseOccupants(
    houseOccupancy,
    7
  );

  const tenth = getHouseOccupants(
    houseOccupancy,
    10
  );

  const eleventh = getHouseOccupants(
    houseOccupancy,
    11
  );

  if (fourth.length) {
    score += 5;
  }

  if (second.length) {
    score += 10;

    evidence.push(
      `द्वितीय भाव में ${second.join(', ')} financial asset connection को support करते हैं।`
    );
  }

  if (seventh.length) {
    score += 15;

    evidence.push(
      `सप्तम भाव में ${seventh.join(', ')} business/dealing/partnership connection को support करते हैं।`
    );
  }

  if (tenth.length) {
    score += 20;

    evidence.push(
      `दशम भाव में ${tenth.join(', ')} career/business connection को activate करते हैं।`
    );
  }

  if (eleventh.length) {
    score += 20;

    evidence.push(
      `एकादश भाव में ${eleventh.join(', ')} gains/income realization को support करते हैं।`
    );
  }

  const fourthSignId = getFourthHouseSign(
    d4LagnaSignId
  );

  const fourthLordName = getSignLord(
    fourthSignId
  );

  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  if (fourthLord && [7, 10, 11].includes(Number(fourthLord.house))) {
    score += 20;

    evidence.push(
      `चतुर्थेश ${fourthLordName} ${fourthLord.house}वें भाव से property-business connection बनाता है।`
    );
  }

  const mercury = getPlanet(
    planetCalculations,
    'Mercury'
  );

  if (mercury && [2, 7, 10, 11].includes(Number(mercury.house))) {
    score += 10;

    evidence.push(
      'बुध का धन/व्यवसाय/gains houses से संबंध commercial dealing को support करता है।'
    );
  }

  const venus = getPlanet(
    planetCalculations,
    'Venus'
  );

  if (venus && [4, 7, 10, 11].includes(Number(venus.house))) {
    score += 8;

    evidence.push(
      'शुक्र का property/business-related houses से संबंध commercial/residential income potential को support करता है।'
    );
  }

  score = Math.max(
    0,
    Math.min(100, score)
  );

  return {
    scope:
      score >= 70
        ? 'High'
        : score >= 50
          ? 'Moderate-High'
          : score >= 35
            ? 'Moderate'
            : 'Low',
    score,
    confidence: scoreToConfidence(score),
    supportingFactors: unique(evidence),
    cautionFactors,
    insight:
      score >= 70
        ? 'D4 में commercial/income-oriented property का मजबूत support दिखाई देता है।'
        : score >= 50
          ? 'Commercial property या property-linked income की मध्यम से अच्छी संभावना है।'
          : 'D4 में residential property की तुलना में commercial indication बहुत dominant नहीं है।'
  };
}

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------
function analyzeParentProvidedProperty(
  houseOccupancy,
  planetCalculations,
  d4LagnaSignId
) {
  let score = 20;
  const evidence = [];
  const cautionFactors = [];

  const second = getHouseOccupants(houseOccupancy, 2);
  const fourth = getHouseOccupants(houseOccupancy, 4);
  const ninth = getHouseOccupants(houseOccupancy, 9);
  const eleventh = getHouseOccupants(houseOccupancy, 11);

  if (second.length) {
    score += 20;

    evidence.push(
      'द्वितीय भाव family assets/wealth connection को support करता है।'
    );
  }

  if (fourth.length) {
    score += 15;

    evidence.push(
      'चतुर्थ भाव की सक्रियता property/home acquisition को support करती है।'
    );
  }

  if (ninth.length) {
    score += 20;

    evidence.push(
      'नवम भाव father-side/family blessings/support connection को strengthen करता है।'
    );
  }

  if (eleventh.length) {
    score += 15;

    evidence.push(
      'एकादश भाव acquisition/gain realization को support करता है।'
    );
  }

  const fourthSignId = getFourthHouseSign(d4LagnaSignId);
  const fourthLordName = getSignLord(fourthSignId);
  const fourthLord = getPlanet(
    planetCalculations,
    fourthLordName
  );

  if (
    fourthLord &&
    [2, 4, 9, 11].includes(Number(fourthLord.house))
  ) {
    score += 20;

    evidence.push(
      `चतुर्थेश ${fourthLordName} का ${fourthLord.house}वें भाव से family/property support connection है।`
    );
  }

  score = Math.min(100, score);

  return {
    score,
    confidence: scoreToConfidence(score),
    likely:
      score >= 70
        ? 'Strong indication'
        : score >= 50
          ? 'Moderate indication'
          : 'Weak indication',
    supportingFactors: unique(evidence),
    cautionFactors
  };
}

// ---------------------------------------------------------
// 9. PROPERTY LOCATION
// ---------------------------------------------------------

function analyzePropertyLocation(
  d4LagnaSignId,
  planetCalculations,
  houseOccupancy = {}
) {
  const fourthSignId =
    getFourthHouseSign(d4LagnaSignId);

  const fourthSignNature =
    getSignNature(fourthSignId);

  const fourthSign =
    getSign(fourthSignId);

  const fourthLordName =
    getSignLord(fourthSignId);

  const fourthLord =
    getPlanet(
      planetCalculations,
      fourthLordName
    );

  const nativePlace = {
    score: 20,
    evidence: []
  };

  const nearby = {
    score: 10,
    evidence: []
  };

  const otherCity = {
    score: 10,
    evidence: []
  };

  const foreign = {
    score: 0,
    evidence: []
  };

  // -------------------------------------------------------
  // 1. FOURTH HOUSE SIGN NATURE
  // -------------------------------------------------------

  if (fourthSignNature === 'fixed') {

    nativePlace.score += 30;

    nativePlace.evidence.push(
      `चतुर्थ भाव ${fourthSign?.name || ''} fixed sign में है, इसलिए मूल स्थान/home stability का support है।`
    );

  }

  if (fourthSignNature === 'movable') {

    otherCity.score += 20;
    nearby.score += 10;

    otherCity.evidence.push(
      `चतुर्थ भाव ${fourthSign?.name || ''} movable sign में है, जिससे residence/property location change की संभावना बढ़ती है।`
    );

  }

  if (fourthSignNature === 'dual') {

    nearby.score += 15;
    otherCity.score += 15;

    nearby.evidence.push(
      'चतुर्थ भाव dual sign में होने से location pattern flexible/changeable हो सकता है।'
    );

    otherCity.evidence.push(
      'Dual sign के कारण property एक ही स्थान तक सीमित न रहकर दूसरे स्थान से भी जुड़ सकती है।'
    );

  }

  // -------------------------------------------------------
  // 2. PROPERTY HOUSE
  // -------------------------------------------------------

  const fourthOccupants =
    getHouseOccupants(
      houseOccupancy,
      4
    );

  if (fourthOccupants.length) {

    nativePlace.score += 8;

    nativePlace.evidence.push(
      `चतुर्थ भाव में ${fourthOccupants.join(', ')} स्थित हैं, जिससे home/property connection मजबूत होता है।`
    );
  }

  // -------------------------------------------------------
  // 3. THIRD HOUSE = NEARBY
  // -------------------------------------------------------

  const thirdOccupants =
    getHouseOccupants(
      houseOccupancy,
      3
    );

  if (thirdOccupants.length) {

    nearby.score += 25;

    nearby.evidence.push(
      `तृतीय भाव में ${thirdOccupants.join(', ')} होने से nearby/short-distance location का संकेत मिलता है।`
    );
  }

  // -------------------------------------------------------
  // 4. NINTH HOUSE = DISTANT
  // -------------------------------------------------------

  const ninthOccupants =
    getHouseOccupants(
      houseOccupancy,
      9
    );

  if (ninthOccupants.length) {

    otherCity.score += 25;

    ninthOccupants.forEach(planet => {

      otherCity.evidence.push(
        `नवम भाव में ${planet} की स्थिति distant/other-city property connection को support करती है।`
      );

    });
  }

  // -------------------------------------------------------
  // 5. TWELFTH HOUSE = FOREIGN / FAR AWAY
  // -------------------------------------------------------

  const twelfthOccupants =
    getHouseOccupants(
      houseOccupancy,
      12
    );

  if (twelfthOccupants.length) {

    foreign.score += 30;
    otherCity.score += 10;

    foreign.evidence.push(
      `द्वादश भाव में ${twelfthOccupants.join(', ')} होने से foreign/very distant residence-property connection बढ़ता है।`
    );
  }

  // -------------------------------------------------------
  // 6. FOURTH LORD LOCATION
  // -------------------------------------------------------

  if (fourthLord) {

    const lordHouse =
      Number(fourthLord.house);

    // Native / home connection
    if ([1, 2, 4].includes(lordHouse)) {

      nativePlace.score += 25;

      nativePlace.evidence.push(
        `चतुर्थेश ${fourthLordName} ${lordHouse}वें भाव में है, जिससे native/home connection मजबूत होता है।`
      );
    }

    // Nearby
    if (lordHouse === 3) {

      nearby.score += 30;

      nearby.evidence.push(
        `चतुर्थेश ${fourthLordName} तृतीय भाव में है, जिससे nearby location का संकेत मजबूत होता है।`
      );
    }

    // Other city / distant
    if ([6, 9].includes(lordHouse)) {

      otherCity.score += 20;

      otherCity.evidence.push(
        `चतुर्थेश ${fourthLordName} ${lordHouse}वें भाव में है, जिससे native place से बाहर property/residence का संकेत बढ़ता है।`
      );
    }

    // Foreign
    if (lordHouse === 12) {

      foreign.score += 35;

      foreign.evidence.push(
        `चतुर्थेश ${fourthLordName} द्वादश भाव में है, जिससे foreign/very distant property-residence indication मजबूत होता है।`
      );
    }

    // 8th = change / ancestral transfer
    if (lordHouse === 8) {

      otherCity.score += 10;

      nativePlace.score += 10;

      nativePlace.evidence.push(
        `चतुर्थेश ${fourthLordName} अष्टम भाव में होने से inherited/ancestral property के कारण location connection बन सकता है।`
      );
    }

    // 10th = career location
    if (lordHouse === 10) {

      otherCity.score += 15;

      otherCity.evidence.push(
        `चतुर्थेश ${fourthLordName} दशम भाव में है, इसलिए property career/work location से जुड़ सकती है।`
      );
    }

    // 11th = acquisition/gains
    if (lordHouse === 11) {

      nativePlace.score += 8;
      otherCity.score += 8;

    }
  }

  // -------------------------------------------------------
  // 7. RAHU / KETU FOREIGN-UNCONVENTIONAL FACTOR
  // -------------------------------------------------------

  const rahu =
    getPlanet(
      planetCalculations,
      'Rahu'
    );

  const ketu =
    getPlanet(
      planetCalculations,
      'Ketu'
    );

  if (
    rahu &&
    [4, 7, 9, 12].includes(
      Number(rahu.house)
    )
  ) {

    otherCity.score += 10;
    foreign.score += 15;

    foreign.evidence.push(
      'राहु का 4/7/9/12 भाव से संबंध unconventional/foreign/urban location theme को बढ़ाता है।'
    );
  }

  if (
    ketu &&
    [4, 9, 12].includes(
      Number(ketu.house)
    )
  ) {

    otherCity.score += 8;
    foreign.score += 8;

  }

  // -------------------------------------------------------
  // 8. NORMALIZE
  // -------------------------------------------------------

  const locations = {
    nativePlace,
    nearby,
    otherCity,
    foreign
  };

  for (const key of Object.keys(locations)) {

    locations[key].score =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            locations[key].score
          )
        )
      );
  }

  // -------------------------------------------------------
  // 9. RANK
  // -------------------------------------------------------

  const labels = {

    nativePlace:
      'मूल स्थान / जन्मस्थान के आसपास',

    nearby:
      'मूल स्थान के पास / nearby area',

    otherCity:
      'दूसरा शहर / दूर स्थान',

    foreign:
      'विदेश / बहुत दूर स्थान'

  };

  const ranked =
    Object.entries(locations)
      .sort(
        (a, b) =>
          b[1].score - a[1].score
      )
      .map(
        ([location, data]) => ({
          location,
          label: labels[location],
          score: data.score,
          confidence:
            scoreToConfidence(
              data.score
            ),
          evidence:
            unique(data.evidence)
        })
      );

  const strongest =
    ranked[0] || null;

  // -------------------------------------------------------
  // 10. SUMMARY
  // -------------------------------------------------------

  let summary;

  if (
    strongest?.location ===
    'nativePlace'
  ) {

    summary =
      'Property के मूल स्थान या जन्मस्थान के आसपास मिलने का संकेत अपेक्षाकृत अधिक है।';

  } else if (
    strongest?.location ===
    'nearby'
  ) {

    summary =
      'Property मूल स्थान से बहुत दूर नहीं, nearby क्षेत्र में होने का संकेत अधिक है।';

  } else if (
    strongest?.location ===
    'otherCity'
  ) {

    summary =
      'Property दूसरे शहर या native place से दूर स्थान पर होने का संकेत अधिक है।';

  } else if (
    strongest?.location ===
    'foreign'
  ) {

    summary =
      'Property/residence foreign या बहुत दूर स्थान से जुड़ने का संकेत अपेक्षाकृत मजबूत है।';

  } else {

    summary =
      'Property location का pattern mixed है।';

  }

  return {

    fourthHouseSign:
      fourthSign?.name || null,

    fourthHouseSignNature:
      fourthSignNature,

    fourthLord:
      fourthLordName,

    fourthLordHouse:
      fourthLord?.house || null,

    scores: {

      nativePlace:
        locations.nativePlace.score,

      nearby:
        locations.nearby.score,

      otherCity:
        locations.otherCity.score,

      foreign:
        locations.foreign.score

    },

    ranked,

    strongestLocation:
      strongest,

    summary,

    supportingFactors:
      unique(
        ranked.flatMap(
          item => item.evidence
        )
      ),

    confidence:
      strongest
        ? scoreToConfidence(
            strongest.score
          )
        : 'low'
  };
}

module.exports = {
  getPropertyClassification,
  analyzePropertyType,
  analyzeFourthHouseAndLord,
  analyzeAspectsOnFourthHouse,
  calculateAspectsOnHouse,
  getPlanetAspectedHouses,
  analyzeVehicleAndComforts,
  analyzeRelocation,
  detectPropertySource,
  analyzeCommercialPotential,
  analyzeParentProvidedProperty,
  analyzeParentalFinancialSupport,
   analyzeParentalFinancialSupport,
  analyzeParentProvidedProperty,
  analyzePropertyLocation,

};