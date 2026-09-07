/**
 * D4 (Chaturthamsha) Chart Interpreter
 * -------------------------------------
 * Fully Integrated Interpretation Layer
 *
 * Covers:
 * - Property / Home
 * - 4th House
 * - 4th Lord
 * - Aspects
 * - Property Source
 * - Property Type
 * - Vehicles & Comforts
 * - Relocation
 * - Commercial Potential
 * - Planet-wise D4 effects
 */

const {
  D4_HOUSE_SIGNIFICANCE
} = require('./d4Rules');

const {
  analyzePropertyType,
  analyzeFourthHouseAndLord,
  analyzeAspectsOnFourthHouse,
  analyzeVehicleAndComforts,
  analyzeRelocation,
  detectPropertySource,
  analyzeCommercialPotential,
    analyzeParentalFinancialSupport,
  analyzeParentProvidedProperty,
  analyzePropertyLocation,

} = require('./d4AdvancedRules');

const {
  analyzeMotherWellbeingIndication,
  analyzeSukhIndex,
  analyzeWealthAndSavings,
  analyzeMultiplePropertiesIndication,
  analyzeDivisionalStrength
} = require('./d4ExtendedRules');

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

function getHouseMeaning(house) {
  return D4_HOUSE_SIGNIFICANCE?.[house] || '';
}

function getPlanetRole(planetName) {
  const roles = {
    Sun: 'authority, ownership, vitality',
    Moon: 'home, emotional comfort, residence',
    Mars: 'land, construction, property activity',
    Mercury: 'dealing, documentation, transactions',
    Jupiter: 'expansion, protection, blessings',
    Venus: 'comforts, vehicles, luxury',
    Saturn: 'land, permanence, delay, long-term assets',
    Rahu: 'unconventional property, foreign/urban themes',
    Ketu: 'detachment, irregularity, separation'
  };

  return roles[planetName] || 'general planetary influence';
}

function getHouseEffect(house) {
  const effects = {
    1: 'स्वयं, residence preference और overall property experience',
    2: 'family assets, accumulated wealth और family resources',
    3: 'effort, movement और property-related initiatives',
    4: 'home, land, building, vehicle और domestic comfort',
    5: 'planning, investment और property-related decisions',
    6: 'loan, disputes, documentation और obstacles',
    7: 'partnership, agreements, transactions और dealing',
    8: 'inheritance, shared assets और sudden changes',
    9: 'fortune, blessings, distant places और ancestral support',
    10: 'career, business और property-work connection',
    11: 'gains, realization और property income',
    12: 'expense, separation, relocation और foreign residence'
  };

  return effects[house] || '';
}

// ---------------------------------------------------------
// MAIN SYNTHESIS
// ---------------------------------------------------------

function synthesizeD4Analysis(d4Data, dashaTimeline = null) {
  const {
    planetCalculations = {},
    houseOccupancy = {},
    lagna = {}
  } = d4Data || {};

  if (!lagna?.d4SignId) {
    throw new Error(
      'Invalid D4 data: d4SignId missing from lagna.'
    );
  }

  // -------------------------------------------------------
  // 1. FOURTH HOUSE
  // -------------------------------------------------------

  const fourthHouseOccupants =
    houseOccupancy[4] || [];

  let propertySummary;

  if (fourthHouseOccupants.length > 0) {
    propertySummary =
      `चतुर्थ भाव में ${fourthHouseOccupants.join(', ')} स्थित हैं। ` +
      `इससे home, land, property और domestic comfort matters D4 में सक्रिय होते हैं।`;
  } else {
    propertySummary =
      'चतुर्थ भाव रिक्त है। इसका अर्थ property matters कमजोर होना नहीं है; ' +
      'मुख्य judgment चतुर्थेश, उसके house/sign, aspects और संबंधित property houses से किया जाएगा।';
  }

  // -------------------------------------------------------
  // 2. PROPERTY TYPE
  // -------------------------------------------------------

  const propertyType =
    analyzePropertyType(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 3. FOURTH LORD
  // -------------------------------------------------------

  const fourthLordDetails =
    analyzeFourthHouseAndLord(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 4. ASPECTS
  // -------------------------------------------------------

  const aspectAnalysis =
    analyzeAspectsOnFourthHouse(
      planetCalculations
    );

  // -------------------------------------------------------
  // 5. VEHICLE / COMFORT
  // -------------------------------------------------------

  const vehicleInsights =
    analyzeVehicleAndComforts(
      houseOccupancy,
      planetCalculations
    );

  // -------------------------------------------------------
  // 6. RELOCATION
  // -------------------------------------------------------

  const relocationInsights =
    analyzeRelocation(
      lagna.d4SignId,
      planetCalculations,
      houseOccupancy
    );

  // -------------------------------------------------------
  // 7. PROPERTY SOURCE
  // -------------------------------------------------------

  const propertySourceInsights =
    detectPropertySource(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 8. PARENTAL FINANCIAL SUPPORT
  // -------------------------------------------------------

  const parentalFinancialSupport =
    analyzeParentalFinancialSupport(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 9. PARENTS PROVIDE / BUY PROPERTY
  // -------------------------------------------------------

  const parentProvidedProperty =
    analyzeParentProvidedProperty(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 10. PROPERTY LOCATION
  // -------------------------------------------------------

  const propertyLocation =
    analyzePropertyLocation(
      lagna.d4SignId,
      planetCalculations,
      houseOccupancy
    );

  // -------------------------------------------------------
  // 11. COMMERCIAL
  // -------------------------------------------------------

  const commercialInsights =
    analyzeCommercialPotential(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 13. MOTHER'S WELLBEING INDICATION (symbolic, not medical)
  // -------------------------------------------------------

  const motherWellbeingIndication =
    analyzeMotherWellbeingIndication(
      houseOccupancy,
      planetCalculations,
      lagna.d4SignId
    );

  // -------------------------------------------------------
  // 14. SUKH INDEX
  // -------------------------------------------------------

  const sukhIndex =
    analyzeSukhIndex(
      houseOccupancy,
      planetCalculations,
      fourthLordDetails,
      aspectAnalysis
    );

  // -------------------------------------------------------
  // 15. WEALTH & SAVINGS
  // -------------------------------------------------------

  const wealthAndSavings =
    analyzeWealthAndSavings(
      houseOccupancy,
      planetCalculations
    );

  // -------------------------------------------------------
  // 16. MULTIPLE PROPERTIES INDICATION
  // -------------------------------------------------------

  const multiplePropertiesIndication =
    analyzeMultiplePropertiesIndication(
      houseOccupancy,
      planetCalculations,
      fourthLordDetails,
      aspectAnalysis
    );

  // -------------------------------------------------------
  // 17. DIVISIONAL (DIGNITY) STRENGTH
  // -------------------------------------------------------

  const divisionalStrength =
    analyzeDivisionalStrength(
      planetCalculations,
      lagna,
      fourthLordDetails
    );

  // -------------------------------------------------------
  // 12. FINAL INTEGRATED SYNTHESIS
  // -------------------------------------------------------

  const synthesisParts = [];

  synthesisParts.push(
    `D4 (चतुर्थांश) लग्न ${lagna.d4SignName || ''} (${lagna.d4SignHindi || ''}) है।`
  );

  synthesisParts.push(
    fourthLordDetails.lordAnalysisText
  );

  // Property type
  if (propertyType.primaryCategory) {
    synthesisParts.push(
      `Property classification में ${propertyType.primaryCategory} का संकेत अपेक्षाकृत अधिक है।`
    );
  }

  // Property source
  if (propertySourceInsights.strongestSource) {
    synthesisParts.push(
      `संपत्ति के संभावित स्रोत में ${propertySourceInsights.strongestSource} प्रमुख दिखाई देता है।`
    );
  }

  // Parental financial support
  if (parentalFinancialSupport.summary) {
    synthesisParts.push(
      parentalFinancialSupport.summary
    );
  }

  // Parents providing property
  if (parentProvidedProperty.likely) {
    synthesisParts.push(
      `माता-पिता द्वारा property खरीदने/दिलाने का संकेत ${parentProvidedProperty.likely} है।`
    );
  }

  // Property location
  if (propertyLocation.strongestLocation) {
    synthesisParts.push(
      `Property location में ${propertyLocation.strongestLocation.label} का संकेत अपेक्षाकृत अधिक है।`
    );
  }

  // Aspect
  if (aspectAnalysis.aspects.length > 0) {
    synthesisParts.push(
      `चतुर्थ भाव पर ${aspectAnalysis.aspects
        .map(a => a.planet)
        .join(', ')} की दृष्टि है।`
    );
  }

  // Vehicle / comforts
  synthesisParts.push(
    vehicleInsights.summary
  );

  // Relocation
  synthesisParts.push(
    relocationInsights.relocationInsight
  );

  // Commercial
  synthesisParts.push(
    commercialInsights.insight
  );

  // Sukh Index
  synthesisParts.push(
    sukhIndex.summary
  );

  // Wealth & Savings
  synthesisParts.push(
    wealthAndSavings.summary
  );

  // Multiple properties
  synthesisParts.push(
    multiplePropertiesIndication.summary
  );

  // Mother wellbeing (symbolic)
  synthesisParts.push(
    motherWellbeingIndication.summary
  );

  // Divisional strength
  synthesisParts.push(
    divisionalStrength.summary
  );

  // Dasha timing (if available)
  if (dashaTimeline?.summary) {
    synthesisParts.push(dashaTimeline.summary);
  }

  const integratedSynthesis =
    synthesisParts.join(' ');

  // -------------------------------------------------------
  // 13. PLANETARY EFFECTS
  // -------------------------------------------------------

  const detailedPlanetaryEffects =
    Object.keys(planetCalculations).reduce(
      (acc, planetName) => {

        const p =
          planetCalculations[planetName];

        const house =
          Number(p.house);

        const houseMeaning =
          getHouseMeaning(house);

        const role =
          getPlanetRole(planetName);

        acc[planetName] = {
          ...p,

          interpretation: {
            planetaryRole: role,

            houseImpact: houseMeaning,

            effect:
              `${planetName} D4 के ${house}वें भाव में है। ` +
              `यह ${houseMeaning || 'संबंधित जीवन क्षेत्र'} को प्रभावित करता है। ` +
              `${planetName} का प्राकृतिक theme ${role} से जुड़ा है।`,

            houseEffect:
              getHouseEffect(house)
          }
        };

        return acc;
      },
      {}
    );

  // -------------------------------------------------------
  // 14. RETURN
  // -------------------------------------------------------

  return {

    // Basic property summary
    propertyAndHomeSummary:
      propertySummary,

    // Final human-readable synthesis
    integratedD4Synthesis:
      integratedSynthesis,

    // Advanced structured analysis
    advancedD4Insights: {

      // -------------------------
      // PROPERTY
      // -------------------------

      propertyClassification:
        propertyType,

      fourthHouseAndLord:
        fourthLordDetails,

      aspectAnalysisOnFourth:
        aspectAnalysis,

      // -------------------------
      // VEHICLE / COMFORT
      // -------------------------

      vehicleAndComforts:
        vehicleInsights,

      // -------------------------
      // RELOCATION
      // -------------------------

      relocationAndMigration:
        relocationInsights,

      // -------------------------
      // PROPERTY SOURCE
      // -------------------------

      propertySource:
        propertySourceInsights,

      // -------------------------
      // PARENTS / FAMILY
      // -------------------------

      parentalFinancialSupport:
        parentalFinancialSupport,

      parentProvidedProperty:
        parentProvidedProperty,

      // -------------------------
      // PROPERTY LOCATION
      // -------------------------

      propertyLocation:
        propertyLocation,

      // -------------------------
      // COMMERCIAL
      // -------------------------

      commercialPotential:
        commercialInsights,

      // -------------------------
      // SUKH / WEALTH / MULTIPLE PROPERTIES / MOTHER / STRENGTH (NEW)
      // -------------------------

      sukhIndex,

      wealthAndSavings,

      multiplePropertiesIndication,

      motherWellbeingIndication,

      divisionalStrength,

      // -------------------------
      // DASHA-BASED TIMING (NEW)
      // -------------------------

      propertyTimingDasha:
        dashaTimeline || {
          note: 'Dasha timing उपलब्ध नहीं है — Moon totalDegree या birth timestamp missing है।'
        }
    },

    // Planet-wise D4 analysis
    detailedPlanetaryEffects
  };
}


module.exports = {
  synthesizeD4Analysis
};