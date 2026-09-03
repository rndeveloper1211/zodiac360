// E:/zodiac360/backend/src/engine/D1/d1Engine.js

const { 
  SIGN_DATA, 
  PLANET_DATA, 
  HOUSE_THEMES, 
  PLANET_IN_LAGNA, 
  PLANET_DIGNITY_MEANINGS,
  CAREER_PLANET_ROLES,
  CAREER_IN_10TH,
  CAREER_COMBINATIONS,
  SPECIAL_ASPECTS 
} = require('./d1Rules');

// करियर और जॉब सेक्टर का सटीक विश्लेषण करने वाला हेल्पर फंक्शन
function generateCareerAnalysis(d1Data, lagnaId, houseAspects) {
  // 10वें भाव (करियर) की राशि और उसके स्वामी की गणना
  const tenthHouseSignId = ((lagnaId - 1 + 9) % 12) + 1;
  const tenthLord = SIGN_DATA[tenthHouseSignId].ruler;
  const tenthLordHouse = d1Data.grahas[tenthLord].house;
  
  const tenthOccupants = d1Data.analysis.houseOccupancy["10"] || [];
  const tenthAspects = houseAspects[10] || [];
  const sixthOccupants = d1Data.analysis.houseOccupancy["6"] || [];
  const secondOccupants = d1Data.analysis.houseOccupancy["2"] || [];

  let primarySectors = [];
  let suitableRoles = [];
  let detailedInsights = [];

  // 1. 10वें भाव में उपस्थित ग्रहों के आधार पर
  if (tenthOccupants.length > 0) {
    tenthOccupants.forEach(planet => {
      if (CAREER_IN_10TH[planet]) {
        detailedInsights.push(`दशम भाव में ${PLANET_DATA[planet].hindi} (${planet}): ${CAREER_IN_10TH[planet]}`);
      }
      if (CAREER_PLANET_ROLES[planet]) {
        primarySectors.push(CAREER_PLANET_ROLES[planet].sector);
        suitableRoles.push(CAREER_PLANET_ROLES[planet].roles);
      }
    });
  } else {
    // यदि 10वां भाव खाली है, तो दशमेश (10th Lord) के आधार पर
    if (CAREER_PLANET_ROLES[tenthLord]) {
      detailedInsights.push(
        `दशमेश ${PLANET_DATA[tenthLord].hindi} (${tenthLord}) ${tenthLordHouse}वें भाव में स्थित हैं, जो मुख्य रूप से ${CAREER_PLANET_ROLES[tenthLord].sector} के अनुकूल है।`
      );
      primarySectors.push(CAREER_PLANET_ROLES[tenthLord].sector);
      suitableRoles.push(CAREER_PLANET_ROLES[tenthLord].roles);
    }
  }

  // 2. विशिष्ट ग्रह युतियों (Combinations) की जाँच
  const allCombinations = [
    { key: "Sun_Mercury", check: secondOccupants.includes("Sun") && secondOccupants.includes("Mercury") },
    { key: "Mercury_Rahu", check: (tenthOccupants.includes("Rahu") && tenthLord === "Mercury") || (tenthOccupants.includes("Mercury") && tenthOccupants.includes("Rahu")) },
    { key: "Sun_Mars", check: tenthOccupants.includes("Mars") && tenthLord === "Sun" },
    { key: "Sun_Jupiter", check: tenthOccupants.includes("Jupiter") && tenthLord === "Sun" },
    { key: "Mars_Saturn", check: sixthOccupants.includes("Saturn") && tenthAspects.includes("Mars") },
    { key: "Jupiter_Moon", check: d1Data.analysis.yogasAndDoshas?.some(y => y.name === "Gajakesari Yoga") }
  ];

  allCombinations.forEach(combo => {
    if (combo.check && CAREER_COMBINATIONS[combo.key]) {
      detailedInsights.push(`सक्रिय योग प्रभाव (${combo.key}): ${CAREER_COMBINATIONS[combo.key]}`);
    }
  });

  // 3. 6वें भाव (सर्विस/नौकरी) का विश्लेषण
  let workEnvironment = "सामान्य कार्यक्षेत्र व नियमित सेवा।";
  if (sixthOccupants.length > 0) {
    const sixthDesc = sixthOccupants.map(p => `${PLANET_DATA[p].hindi} (${PLANET_DATA[p].easyMeaning})`).join(", ");
    workEnvironment = `षष्ठ भाव में ग्रहों की स्थिति (${sixthDesc}) दर्शाती है कि कार्यक्षेत्र में प्रतियोगिता और अनुशासन से बड़ी सफलता मिलेगी।`;
  }

  return {
    primarySectors: [...new Set(primarySectors)],
    suitableJobRoles: suitableRoles.join(" | "),
    workEnvironment: workEnvironment,
    detailedCareerInsights: detailedInsights
  };
}

function analyzeD1Chart(payload) {
  const d1Data = payload.data ? payload.data : payload;

  const lagna = d1Data.lagna;
  const lagnaId = lagna.signId;
  const lagnaMeta = SIGN_DATA[lagnaId];
  const lagnaLord = lagnaMeta.ruler;
  const lagnaLordData = d1Data.grahas[lagnaLord];
  const lagnaLordHouse = lagnaLordData.house;

  // 1. सभी 12 भावों पर दृष्टियों (Aspects) की गणना
  const houseAspects = {};
  for (let i = 1; i <= 12; i++) houseAspects[i] = [];

  for (const [planet, pData] of Object.entries(d1Data.grahas)) {
    const fromHouse = pData.house;
    const offsets = SPECIAL_ASPECTS[planet] || [7];
    offsets.forEach(offset => {
      let target = ((fromHouse - 1 + offset - 1) % 12) + 1;
      houseAspects[target].push(planet);
    });
  }

  // 2. 12 भावों का लेयर-वाइज़ और व्याख्यात्मक विश्लेषण
  const houseAnalysis = {};
  for (let h = 1; h <= 12; h++) {
    const signId = ((lagnaId - 1 + (h - 1)) % 12) + 1;
    const signInfo = SIGN_DATA[signId];
    const lord = signInfo.ruler;
    const lordPlacement = d1Data.grahas[lord].house;
    const occupants = d1Data.analysis.houseOccupancy[h.toString()] || [];
    const aspects = houseAspects[h] || [];

    let details = [];

    // भावेश की स्थिति व प्रभाव
    details.push(
      `इस भाव के स्वामी ${PLANET_DATA[lord].hindi} (${lord}) ${lordPlacement}वें भाव में स्थित हैं, जो दर्शाता है कि ${HOUSE_THEMES[lordPlacement].impact}`
    );

    // भाव का सीधा अर्थ
    if (HOUSE_THEMES[h].easyMeaning) {
      details.push(`सरल शब्दों में: ${HOUSE_THEMES[h].easyMeaning}`);
    }

    // सीधे उपस्थित ग्रह (Occupants)
    if (occupants.length > 0) {
      const occupantDesc = occupants.map(p => {
        const dignity = d1Data.analysis.planetaryDignities?.[p]?.dignity || "Neutral";
        const isRetro = d1Data.grahas[p]?.isRetrograde;
        const retroText = isRetro ? " (वक्री)" : "";
        
        let dignityNote = "";
        if (PLANET_DIGNITY_MEANINGS && PLANET_DIGNITY_MEANINGS[dignity]) {
          dignityNote = ` [${PLANET_DIGNITY_MEANINGS[dignity]}]`;
        }

        return `${PLANET_DATA[p].hindi} [${p}] (${dignity}${retroText} - ${PLANET_DATA[p].trait})${dignityNote}`;
      }).join(", ");

      details.push(`इस भाव में सीधे उपस्थित ग्रह: ${occupantDesc}।`);
    } else {
      details.push("इस भाव में कोई प्रत्यक्ष ग्रह नहीं है, अतः इसका फल भावेश की स्थिति और दृष्टियों पर आधारित रहेगा।");
    }

    // दृष्टियों का प्रभाव
    if (aspects.length > 0) {
      const aspectDesc = aspects.map(p => `${PLANET_DATA[p].hindi} (${PLANET_DATA[p].trait})`).join(", ");
      details.push(`इस भाव पर दृष्टि प्रभाव: ${aspectDesc} की दृष्टि इस भाव के फलों को सक्रिय करती है।`);
    }

    houseAnalysis[`house_${h}`] = {
      title: HOUSE_THEMES[h].title,
      domain: HOUSE_THEMES[h].domain,
      rulingSign: `${signInfo.name} (${signInfo.hindi})`,
      signLord: `${lord} (Placed in House ${lordPlacement})`,
      occupants: occupants,
      aspectingPlanets: aspects,
      synthesis: details.join(" ")
    };
  }

  // 3. कोर पर्सनालिटी व बॉडी समरी (लग्न में बैठे ग्रह का सटीक विवरण)
  const lagnaOccupants = d1Data.analysis.houseOccupancy["1"] || [];
  let bodySummary = `${lagnaMeta.hindi} लग्न (${lagnaMeta.element} तत्व) के आधार पर: ${lagnaMeta.body}`;

  if (lagnaOccupants.length > 0) {
    const occupantTraits = lagnaOccupants.map(p => {
      if (PLANET_IN_LAGNA && PLANET_IN_LAGNA[p]) {
        return PLANET_IN_LAGNA[p];
      }
      return `लग्न में ${PLANET_DATA[p].hindi} की स्थिति व्यक्तित्व पर विशेष प्रभाव डालती है।`;
    }).join(" ");

    bodySummary += ` ${occupantTraits}`;
  }

  let personalitySummary = `मूल मानसिक प्रकृति: ${lagnaMeta.personality} ${lagnaMeta.easyMeaning ? `(${lagnaMeta.easyMeaning}) ` : ""}लग्नेश (${PLANET_DATA[lagnaLord].hindi}) के ${lagnaLordHouse}वें भाव में होने से व्यक्ति की जीवन प्राथमिकता ${HOUSE_THEMES[lagnaLordHouse].domain} रहेगी।`;

  // 4. करियर का डायनामिक विश्लेषण
  const careerAnalysis = generateCareerAnalysis(d1Data, lagnaId, houseAspects);

  return {
    success: true,
    statusCode: 200,
    chartType: "D1 (Lagna / Rashi Chart)",
    meta: {
      dob: d1Data.meta.inputDate,
      tob: d1Data.meta.inputTime,
      ascendant: `${lagna.sign} (${lagna.signHindi})`,
      ascendantDegree: lagna.degreeInSign,
      nakshatra: `${lagna.nakshatra} (चरण ${lagna.charan})`,
      ayanamsha: `${d1Data.meta.ayanamshaUsed} (${d1Data.meta.ayanamshaValue})`
    },
    coreSynthesis: {
      bodyAndConstitution: bodySummary,
      personalityAndTemperament: personalitySummary,
      overallLifeDirection: HOUSE_THEMES[lagnaLordHouse].impact
    },
    careerAnalysis: careerAnalysis,
    houseWiseDetailedAnalysis: houseAnalysis,
    activeYogasAndDoshas: (d1Data.analysis.yogasAndDoshas || []).map(y => ({
      name: y.name,
      type: y.type,
      impact: y.description
    }))
  };
}

module.exports = {
  analyzeD1Chart
};