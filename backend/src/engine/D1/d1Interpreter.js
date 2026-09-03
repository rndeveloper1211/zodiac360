// backend/src/engine/d1Interpreter.js

/**
 * D1 Rashi Chart - Rule Based Interpreter
 *
 * Assumptions:
 * - House numbers: 1..12
 * - Rashi index: Aries=0 ... Pisces=11
 * - Parashari planetary aspects:
 *   Sun/Moon/Mercury/Venus = 7th
 *   Mars = 4th, 7th, 8th
 *   Jupiter = 5th, 7th, 9th
 *   Saturn = 3rd, 7th, 10th
 *
 * Rahu/Ketu aspects are configurable.
 */

// ============================================================
// 1. PLANET TRAITS
// ============================================================

const PLANET_TRAITS = {
  Sun: {
    nature: "तेजस्वी, आत्मविश्वासी, प्रशासनिक और नेतृत्वकारी",
    domain: "सरकार, प्रशासन, नेतृत्व, नीति-निर्माण, अधिकार"
  },

  Moon: {
    nature: "संवेदनशील, कल्पनाशील, जनमानस से जुड़ा और अनुकूलनशील",
    domain: "जनसंपर्क, मीडिया, सार्वजनिक जीवन, कला, सेवा"
  },

  Mars: {
    nature: "साहसी, ऊर्जावान, दृढ़-संकल्पी और रणनीतिक",
    domain: "खेल, रक्षा, पुलिस, इंजीनियरिंग, तकनीकी क्षेत्र, प्रतिस्पर्धा"
  },

  Mercury: {
    nature: "तार्किक, विश्लेषणात्मक, वाक्पटु और व्यावहारिक",
    domain: "आईटी, व्यापार, वित्त, लेखन, संचार, विश्लेषण"
  },

  Jupiter: {
    nature: "विद्वान, नैतिक, मार्गदर्शक और दूरदर्शी",
    domain: "शिक्षा, कानून, सलाहकार, नीति, संस्थागत नेतृत्व"
  },

  Venus: {
    nature: "कलात्मक, आकर्षक, कूटनीतिक और सौंदर्यप्रिय",
    domain: "कला, फिल्म, संगीत, डिजाइन, मीडिया, ब्रांडिंग"
  },

  Saturn: {
    nature: "अनुशासित, धैर्यवान, मेहनती और संगठनकारी",
    domain: "प्रबंधन, संगठन, उद्योग, प्रशासन, दीर्घकालिक संस्थान"
  },

  Rahu: {
    nature: "महत्वाकांक्षी, असामान्य, जोखिम लेने वाला और आधुनिक सोच वाला",
    domain: "तकनीक, मीडिया, राजनीति, विदेशी क्षेत्र, बड़े नेटवर्क"
  },

  Ketu: {
    nature: "सूक्ष्म, शोधप्रिय, अंतर्मुखी और गूढ़ प्रवृत्ति वाला",
    domain: "रिसर्च, आध्यात्म, विश्लेषण, तकनीकी/गूढ़ विषय"
  }
};

// ============================================================
// 2. RASHI NAMES
// ============================================================

const RASHI_NAMES = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुम्भ",
  "मीन"
];

// ============================================================
// 3. DIGNITY
// ============================================================

const DIGNITY = {
  Sun: {
    exalt: 0,
    debilitated: 6
  },

  Moon: {
    exalt: 1,
    debilitated: 7
  },

  Mars: {
    exalt: 9,
    debilitated: 3
  },

  Mercury: {
    exalt: 5,
    debilitated: 11
  },

  Jupiter: {
    exalt: 3,
    debilitated: 9
  },

  Venus: {
    exalt: 11,
    debilitated: 5
  },

  Saturn: {
    exalt: 6,
    debilitated: 0
  }
};

// ============================================================
// 4. OWN SIGNS
// ============================================================

const OWN_SIGNS = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10]
};

// ============================================================
// 5. HOUSE GROUPS
// ============================================================

const KENDRAS = [1, 4, 7, 10];
const TRIKONAS = [1, 5, 9];
const DUSTHANAS = [6, 8, 12];
const UPACHAYAS = [3, 6, 10, 11];

// ============================================================
// 6. BASIC HELPERS
// ============================================================

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getHousePlanets(houses, houseNumber) {
  return safeArray(houses?.[houseNumber]?.planets);
}

function hasPlanetInHouse(houses, houseNumber, planetName) {
  return getHousePlanets(houses, houseNumber)
    .some(p => p?.name === planetName);
}

function getPlanetHouse(planets, planetName) {
  return planets?.[planetName]?.house ?? null;
}

function getPlanetRashi(planets, planetName) {
  return planets?.[planetName]?.rashiIndex ?? null;
}

function isOwnSign(planetName, rashiIndex) {
  return (
    OWN_SIGNS[planetName] &&
    OWN_SIGNS[planetName].includes(rashiIndex)
  );
}

function isExalted(planetName, rashiIndex) {
  return (
    DIGNITY[planetName] &&
    DIGNITY[planetName].exalt === rashiIndex
  );
}

function isDebilitated(planetName, rashiIndex) {
  return (
    DIGNITY[planetName] &&
    DIGNITY[planetName].debilitated === rashiIndex
  );
}

function isOwnOrExalted(planetName, rashiIndex) {
  return (
    isOwnSign(planetName, rashiIndex) ||
    isExalted(planetName, rashiIndex)
  );
}

function houseDistance(fromHouse, toHouse) {
  if (!fromHouse || !toHouse) return null;

  return ((toHouse - fromHouse + 12) % 12) + 1;
}

// ============================================================
// 7. PLANETARY ASPECT ENGINE
// ============================================================

const ASPECT_RULES = {
  Sun: [7],
  Moon: [7],
  Mercury: [7],
  Venus: [7],

  Mars: [4, 7, 8],

  Jupiter: [5, 7, 9],

  Saturn: [3, 7, 10]
};

/**
 * Rahu/Ketu aspect tradition:
 *
 * false = only 7th aspect
 * true  = 5th, 7th, 9th
 *
 * Change to true only if your astrology system
 * intentionally follows that tradition.
 */
const USE_NODE_SPECIAL_ASPECTS = false;

function getAspectType(planetName, distance) {
  if (!distance) return null;

  if (planetName === "Rahu" || planetName === "Ketu") {
    if (distance === 7) {
      return "7वीं दृष्टि";
    }

    if (
      USE_NODE_SPECIAL_ASPECTS &&
      (distance === 5 || distance === 9)
    ) {
      return `${distance}वीं दृष्टि`;
    }

    return null;
  }

  const rules = ASPECT_RULES[planetName];

  if (!rules || !rules.includes(distance)) {
    return null;
  }

  if (distance === 7) {
    return "7वीं दृष्टि";
  }

  if (distance === 4 && planetName === "Mars") {
    return "4थी विशेष दृष्टि";
  }

  if (distance === 8 && planetName === "Mars") {
    return "8वीं विशेष दृष्टि";
  }

  if (
    (planetName === "Jupiter") &&
    (distance === 5 || distance === 9)
  ) {
    return `${distance}वीं विशेष दृष्टि`;
  }

  if (
    planetName === "Saturn" &&
    (distance === 3 || distance === 10)
  ) {
    return `${distance}वीं विशेष दृष्टि`;
  }

  return `${distance}वीं दृष्टि`;
}

function getAspectsOnHouse(targetHouse, planets) {
  const aspects = [];

  if (!planets || !targetHouse) {
    return aspects;
  }

  Object.entries(planets).forEach(([planetName, planetData]) => {
    const sourceHouse = planetData?.house;

    if (!sourceHouse) return;

    const distance = houseDistance(sourceHouse, targetHouse);
    const type = getAspectType(planetName, distance);

    if (type) {
      aspects.push({
        name: planetName,
        type,
        fromHouse: sourceHouse,
        toHouse: targetHouse,
        distance
      });
    }
  });

  return aspects;
}

// ============================================================
// 8. ASPECT HELPERS
// ============================================================

function hasAspectFrom(aspects, planetName) {
  return aspects.some(a => a.name === planetName);
}

function getAspectNames(aspects) {
  return aspects.map(a => `${a.name} की ${a.type}`);
}

// ============================================================
// 9. YOGA ENGINE
// ============================================================

function detectMahapurushaYogas(planets) {
  const yogas = [];

  const checks = [
    {
      planet: "Mars",
      name: "रूचक महापुरुष योग",
      desc:
        "केंद्र में स्वग्रही या उच्च मंगल साहस, प्रतिस्पर्धात्मक क्षमता, तकनीकी दक्षता और नेतृत्व शक्ति को मजबूत करता है।"
    },

    {
      planet: "Mercury",
      name: "भद्र महापुरुष योग",
      desc:
        "केंद्र में स्वग्रही या उच्च बुध विश्लेषण, संचार, व्यापारिक बुद्धि और तार्किक क्षमता को मजबूत करता है।"
    },

    {
      planet: "Jupiter",
      name: "हंस महापुरुष योग",
      desc:
        "केंद्र में स्वग्रही या उच्च गुरु ज्ञान, मार्गदर्शन, शिक्षा, नैतिकता और संस्थागत प्रतिष्ठा को मजबूत करता है।"
    },

    {
      planet: "Venus",
      name: "मालव्य महापुरुष योग",
      desc:
        "केंद्र में स्वग्रही या उच्च शुक्र कला, आकर्षण, सुविधा, रचनात्मकता और सार्वजनिक लोकप्रियता को मजबूत करता है।"
    },

    {
      planet: "Saturn",
      name: "शश महापुरुष योग",
      desc:
        "केंद्र में स्वग्रही या उच्च शनि अनुशासन, संगठन, धैर्य और दीर्घकालिक उपलब्धि की क्षमता को मजबूत करता है।"
    }
  ];

  checks.forEach(check => {
    const p = planets?.[check.planet];

    if (!p) return;

    if (
      KENDRAS.includes(p.house) &&
      isOwnOrExalted(check.planet, p.rashiIndex)
    ) {
      yogas.push({
        type: "Mahapurusha",
        planet: check.planet,
        name: check.name,
        desc: check.desc
      });
    }
  });

  return yogas;
}

// ------------------------------------------------------------
// Budhaditya Yoga
// ------------------------------------------------------------

function detectBudhadityaYoga(planets) {
  const sun = planets?.Sun;
  const mercury = planets?.Mercury;

  if (!sun || !mercury) {
    return null;
  }

  if (sun.house !== mercury.house) {
    return null;
  }

  return {
    type: "Budhaditya",
    name: "बुधादित्य योग",
    desc:
      "सूर्य और बुध की युति बुद्धि, संचार, निर्णय क्षमता, प्रशासनिक सोच और अभिव्यक्ति को प्रभावित करती है।"
  };
}

// ------------------------------------------------------------
// Neechabhanga
// ------------------------------------------------------------

function detectNeechabhanga(d1Data) {
  const { planets } = d1Data;

  const results = [];

  Object.keys(DIGNITY).forEach(planetName => {
    const planet = planets?.[planetName];

    if (!planet) return;

    if (!isDebilitated(planetName, planet.rashiIndex)) {
      return;
    }

    /*
     * Basic Neechabhanga conditions.
     *
     * This is intentionally conservative.
     * We do NOT automatically call every cancellation
     * "Neechabhanga Rajayoga".
     */

    const debilitationSign = planet.rashiIndex;

    let cancellationReason = null;

    // Lord of debilitation sign
    const signLords = {
      0: "Mars",
      1: "Venus",
      2: "Mercury",
      3: "Moon",
      4: "Sun",
      5: "Mercury",
      6: "Venus",
      7: "Mars",
      8: "Jupiter",
      9: "Saturn",
      10: "Saturn",
      11: "Jupiter"
    };

    const debilityLord = signLords[debilitationSign];
    const debilityLordData = planets?.[debilityLord];

    if (
      debilityLordData &&
      KENDRAS.includes(debilityLordData.house)
    ) {
      cancellationReason =
        `${debilityLord} केंद्र में स्थित है`;
    }

    // Exaltation lord in Kendra
    if (!cancellationReason) {
      const exaltationSign = DIGNITY[planetName]?.exalt;
      const exaltationLord = signLords[exaltationSign];
      const exaltationLordData = planets?.[exaltationLord];

      if (
        exaltationLordData &&
        KENDRAS.includes(exaltationLordData.house)
      ) {
        cancellationReason =
          `${exaltationLord} केंद्र में स्थित है`;
      }
    }

    if (cancellationReason) {
      results.push({
        type: "Neechabhanga",
        planet: planetName,
        name: `${planetName} नीचभंग`,
        desc:
          `${planetName} की नीच स्थिति को ${cancellationReason} के कारण आंशिक रूप से शमन मिलता है।`,
        reason: cancellationReason
      });
    }
  });

  return results;
}

// ------------------------------------------------------------
// Rajayoga - basic lord relationship
// ------------------------------------------------------------

function getHouseLord(houses, houseNumber) {
  return houses?.[houseNumber]?.signLord || null;
}

function detectBasicRajaConnections(d1Data) {
  const { houses, planets } = d1Data;
  const results = [];

  const lord5 = getHouseLord(houses, 5);
  const lord9 = getHouseLord(houses, 9);
  const lord1 = getHouseLord(houses, 1);
  const lord10 = getHouseLord(houses, 10);

  const pairs = [
    [lord5, lord9, "5वें और 9वें भाव के स्वामियों का संबंध"],
    [lord1, lord5, "लग्नेश और पंचमेश का संबंध"],
    [lord1, lord9, "लग्नेश और नवमेश का संबंध"],
    [lord5, lord10, "पंचमेश और दशमेश का संबंध"],
    [lord9, lord10, "नवमेश और दशमेश का संबंध"]
  ];

  pairs.forEach(([p1, p2, description]) => {
    if (!p1 || !p2 || p1 === p2) return;

    const d1 = planets?.[p1];
    const d2 = planets?.[p2];

    if (!d1 || !d2) return;

    const sameHouse = d1.house === d2.house;

    const mutualAspect =
      getAspectType(p1, houseDistance(d1.house, d2.house)) ||
      getAspectType(p2, houseDistance(d2.house, d1.house));

    if (sameHouse || mutualAspect) {
      results.push({
        type: "RajaConnection",
        name: "राजयोग संबंध",
        desc: description,
        planets: [p1, p2]
      });
    }
  });

  return results;
}

// ------------------------------------------------------------
// Complete Yoga detector
// ------------------------------------------------------------

function detectYogas(d1Data) {
  const { planets } = d1Data;

  const yogas = [];

  yogas.push(...detectMahapurushaYogas(planets));

  const budhaditya = detectBudhadityaYoga(planets);

  if (budhaditya) {
    yogas.push(budhaditya);
  }

  yogas.push(...detectNeechabhanga(d1Data));
  yogas.push(...detectBasicRajaConnections(d1Data));

  return yogas;
}

// ============================================================
// 10. PLANET DIGNITY DESCRIPTION
// ============================================================

function getDignityDescription(planetName, rashiIndex) {
  if (isExalted(planetName, rashiIndex)) {
    return "उच्च";
  }

  if (isDebilitated(planetName, rashiIndex)) {
    return "नीच";
  }

  if (isOwnSign(planetName, rashiIndex)) {
    return "स्वग्रही";
  }

  return "सामान्य";
}

// ============================================================
// 11. CAREER SCORING ENGINE
// ============================================================

function calculateCareerScore(d1Data) {
  const { houses, planets } = d1Data;

  const h10 = houses?.[10];

  if (!h10) {
    return {
      score: 0,
      factors: []
    };
  }

  let score = 0;
  const factors = [];

  const h10Lord = h10.signLord;
  const h10LordData = planets?.[h10Lord];

  // 10th house planets
  getHousePlanets(houses, 10).forEach(p => {
    if (!p?.name) return;

    score += 10;

    factors.push(
      `दशम भाव में ${p.name} की स्थिति`
    );
  });

  // 10th lord dignity
  if (h10LordData) {
    if (isExalted(h10Lord, h10LordData.rashiIndex)) {
      score += 20;
      factors.push(`दशमेश ${h10Lord} उच्च का है`);
    } else if (isOwnSign(h10Lord, h10LordData.rashiIndex)) {
      score += 15;
      factors.push(`दशमेश ${h10Lord} स्वग्रही है`);
    }

    if (KENDRAS.includes(h10LordData.house)) {
      score += 10;
      factors.push(`दशमेश ${h10Lord} केंद्र में है`);
    }

    if (TRIKONAS.includes(h10LordData.house)) {
      score += 10;
      factors.push(`दशमेश ${h10Lord} त्रिकोण में है`);
    }

    if (UPACHAYAS.includes(h10LordData.house)) {
      score += 5;
      factors.push(`दशमेश ${h10Lord} उपचय भाव में है`);
    }
  }

  // Aspects on 10th
  const aspects = getAspectsOnHouse(10, planets);

  aspects.forEach(aspect => {
    if (aspect.name === "Jupiter") {
      score += 10;
      factors.push("दशम भाव पर गुरु की दृष्टि");
    }

    if (aspect.name === "Saturn") {
      score += 8;
      factors.push("दशम भाव पर शनि की दृष्टि");
    }

    if (aspect.name === "Mars") {
      score += 8;
      factors.push("दशम भाव पर मंगल की दृष्टि");
    }

    if (aspect.name === "Sun") {
      score += 6;
      factors.push("दशम भाव पर सूर्य की दृष्टि");
    }
  });

  return {
    score,
    factors
  };
}

// ============================================================
// 12. PERSONALITY
// ============================================================

function buildPersonality(d1Data, yogas) {
  const { houses, planets } = d1Data;

  const h1 = houses?.[1];

  if (!h1) {
    return "";
  }

  const lagnaLord = h1.signLord;
  const lagnaLordData = planets?.[lagnaLord];

  let text =
    `लग्न राशि ${h1.rashiHindi || RASHI_NAMES[h1.rashiIndex]} (${h1.rashi || ""}) है, जिसके स्वामी ${lagnaLord} हैं। `;

  const h1Planets = getHousePlanets(houses, 1);

  if (h1Planets.length) {
    const names = h1Planets.map(p => p.name);

    text +=
      `प्रथम भाव में ${names.join(", ")} की स्थिति व्यक्तित्व पर ${names
        .map(p => PLANET_TRAITS[p]?.nature || "")
        .filter(Boolean)
        .join("; ")} का प्रभाव डालती है। `;
  }

  const aspects = getAspectsOnHouse(1, planets);

  if (aspects.length) {
    text +=
      `लग्न पर ${getAspectNames(aspects).join(", ")} का प्रभाव है। `;
  }

  const mahapurusha = yogas.filter(
    y => y.type === "Mahapurusha"
  );

  if (mahapurusha.length) {
    text +=
      `${mahapurusha.map(y => y.name).join(" और ")} व्यक्तित्व में विशेष ग्रहबल जोड़ते हैं। `;
  }

  if (lagnaLordData) {
    const dignity = getDignityDescription(
      lagnaLord,
      lagnaLordData.rashiIndex
    );

    text +=
      `लग्नेश ${lagnaLord} भाव ${lagnaLordData.house} में ${dignity} स्थिति में है।`;
  }

  return text;
}

// ============================================================
// 13. WEALTH
// ============================================================

function buildWealth(d1Data) {
  const { houses, planets } = d1Data;

  const h2 = houses?.[2];
  const h4 = houses?.[4];
  const h11 = houses?.[11];

  let text = "";

  if (h2) {
    text +=
      `द्वितीय भाव में ${h2.rashiHindi || RASHI_NAMES[h2.rashiIndex]} राशि है और इसके स्वामी ${h2.signLord} हैं। `;

    const p2 = getHousePlanets(houses, 2);

    if (p2.length) {
      text +=
        `धन भाव में ${p2.map(p => p.name).join(", ")} की स्थिति धन-संचय के विषय को सक्रिय करती है। `;
    } else {
      const lordData = planets?.[h2.signLord];

      if (lordData) {
        text +=
          `द्वितीयेश ${h2.signLord} भाव ${lordData.house} में स्थित हैं। `;
      }
    }
  }

  if (h4) {
    const p4 = getHousePlanets(houses, 4);

    text +=
      `चतुर्थ भाव ${h4.rashiHindi || RASHI_NAMES[h4.rashiIndex]} राशि का है। `;

    if (p4.length) {
      text +=
        `इस भाव में ${p4.map(p => p.name).join(", ")} की स्थिति संपत्ति, सुविधा और घरेलू स्थिरता को प्रभावित करती है। `;
    }
  }

  if (h11) {
    const p11 = getHousePlanets(houses, 11);

    text +=
      `एकादश भाव में ${h11.rashiHindi || RASHI_NAMES[h11.rashiIndex]} राशि है और इसके स्वामी ${h11.signLord} हैं। `;

    if (p11.length) {
      text +=
        `एकादश भाव में ${p11.map(p => p.name).join(", ")} लाभ और नेटवर्क संबंधी विषयों को सक्रिय करते हैं। `;
    } else {
      const lordData = planets?.[h11.signLord];

      if (lordData) {
        text +=
          `एकादशेश ${h11.signLord} भाव ${lordData.house} में स्थित हैं। `;
      }
    }
  }

  return text.trim();
}

// ============================================================
// 14. INTELLECT
// ============================================================

function buildIntellect(d1Data) {
  const { houses, planets } = d1Data;

  const h3 = houses?.[3];
  const h5 = houses?.[5];

  let text = "";

  if (h3) {
    const p3 = getHousePlanets(houses, 3);

    text +=
      `तृतीय भाव ${h3.rashiHindi || RASHI_NAMES[h3.rashiIndex]} राशि का है। `;

    if (p3.length) {
      text +=
        `इस भाव में ${p3.map(p => p.name).join(", ")} की स्थिति साहस, संचार और प्रयास क्षमता को प्रभावित करती है। `;
    }

    const lordData = planets?.[h3.signLord];

    if (lordData) {
      text +=
        `तृतीयेश ${h3.signLord} भाव ${lordData.house} में स्थित हैं। `;
    }
  }

  if (h5) {
    const p5 = getHousePlanets(houses, 5);

    text +=
      `पंचम भाव ${h5.rashiHindi || RASHI_NAMES[h5.rashiIndex]} राशि का है। `;

    if (p5.length) {
      text +=
        `पंचम भाव में ${p5.map(p => p.name).join(", ")} की स्थिति बुद्धि, रचनात्मकता और निर्णय क्षमता को प्रभावित करती है। `;
    }

    const lordData = planets?.[h5.signLord];

    if (lordData) {
      text +=
        `पंचमेश ${h5.signLord} भाव ${lordData.house} में स्थित हैं।`;
    }
  }

  return text.trim();
}

// ============================================================
// 15. CAREER INTERPRETATION
// ============================================================

function buildCareer(d1Data, yogas) {
  const { houses, planets } = d1Data;

  const h10 = houses?.[10];

  if (!h10) {
    return "";
  }

  const h10Planets = getHousePlanets(houses, 10);
  const aspects = getAspectsOnHouse(10, planets);

  const careerScore = calculateCareerScore(d1Data);

  let text =
    `दशम (कर्म) भाव में ${h10.rashiHindi || RASHI_NAMES[h10.rashiIndex]} राशि है, जिसके स्वामी ${h10.signLord} हैं। `;

  const h10LordData = planets?.[h10.signLord];

  if (h10LordData) {
    const dignity = getDignityDescription(
      h10.signLord,
      h10LordData.rashiIndex
    );

    text +=
      `दशमेश ${h10.signLord} भाव ${h10LordData.house} में ${dignity} स्थिति में हैं। `;
  }

  if (h10Planets.length) {
    text +=
      `कर्म भाव में ${h10Planets.map(p => p.name).join(", ")} स्थित हैं, जिससे ${h10Planets
        .map(p => PLANET_TRAITS[p]?.domain || "")
        .filter(Boolean)
        .join("; ")} जैसे क्षेत्र सक्रिय हो सकते हैं। `;
  }

  if (aspects.length) {
    text +=
      `दशम भाव पर ${getAspectNames(aspects).join(", ")} का प्रभाव है। `;

    if (hasAspectFrom(aspects, "Jupiter")) {
      text +=
        `गुरु की दृष्टि करियर में ज्ञान, सलाह, मार्गदर्शन और संस्थागत प्रतिष्ठा की संभावनाओं को मजबूत कर सकती है। `;
    }

    if (hasAspectFrom(aspects, "Saturn")) {
      text +=
        `शनि की दृष्टि दीर्घकालिक मेहनत, अनुशासन, जिम्मेदारी और धीरे-धीरे बनने वाली प्रतिष्ठा को मजबूत कर सकती है। `;
    }

    if (hasAspectFrom(aspects, "Mars")) {
      text +=
        `मंगल की दृष्टि प्रतिस्पर्धा, तकनीकी क्षमता, साहस और निर्णायक कार्यशैली को सक्रिय कर सकती है। `;
    }

    if (hasAspectFrom(aspects, "Sun")) {
      text +=
        `सूर्य का प्रभाव नेतृत्व, अधिकार और प्रशासनिक जिम्मेदारियों की दिशा को मजबूत कर सकता है। `;
    }
  }

  const careerYogas = yogas.filter(y =>
    [
      "Mahapurusha",
      "Budhaditya",
      "RajaConnection"
    ].includes(y.type)
  );

  if (careerYogas.length) {
    text +=
      `प्रमुख योग/संबंध: ${careerYogas.map(y => y.name).join(", ")}। `;
  }

  text +=
    `करियर-संबंधी नियमों के आधार पर संकेतक स्कोर ${careerScore.score} है।`;

  return text.trim();
}

// ============================================================
// 16. RELATIONSHIPS
// ============================================================

function buildRelationships(d1Data) {
  const { houses, planets } = d1Data;

  const h7 = houses?.[7];

  if (!h7) {
    return "";
  }

  const h7Planets = getHousePlanets(houses, 7);
  const aspects = getAspectsOnHouse(7, planets);

  let text =
    `सप्तम भाव में ${h7.rashiHindi || RASHI_NAMES[h7.rashiIndex]} राशि है, जिसके स्वामी ${h7.signLord} हैं। `;

  if (h7Planets.length) {
    text +=
      `सप्तम भाव में ${h7Planets.map(p => p.name).join(", ")} की स्थिति साझेदारी, विवाह और सार्वजनिक व्यवहार को प्रभावित करती है। `;
  } else {
    text +=
      `सप्तम भाव में कोई ग्रह नहीं है; इसलिए इसके स्वामी और सप्तम भाव पर पड़ने वाली दृष्टियां महत्वपूर्ण हो जाती हैं। `;
  }

  if (aspects.length) {
    text +=
      `सप्तम भाव पर ${getAspectNames(aspects).join(", ")} का प्रभाव है। `;
  }

  const lordData = planets?.[h7.signLord];

  if (lordData) {
    text +=
      `सप्तमेश ${h7.signLord} भाव ${lordData.house} में स्थित हैं।`;
  }

  return text.trim();
}

// ============================================================
// 17. CHALLENGES
// ============================================================

function buildChallenges(d1Data) {
  const { houses, planets } = d1Data;

  const sections = [
    {
      house: 6,
      label: "षष्ठ",
      topic: "प्रतिस्पर्धा, संघर्ष और सेवा"
    },
    {
      house: 8,
      label: "अष्टम",
      topic: "परिवर्तन, अनिश्चितता और गूढ़ विषय"
    },
    {
      house: 12,
      label: "द्वादश",
      topic: "व्यय, अलगाव और दूरस्थ क्षेत्र"
    }
  ];

  let text = "";

  sections.forEach(section => {
    const h = houses?.[section.house];

    if (!h) return;

    const p = getHousePlanets(houses, section.house);

    text +=
      `${section.label} भाव ${h.rashiHindi || RASHI_NAMES[h.rashiIndex]} राशि का है और ${section.topic} से संबंधित है। `;

    if (p.length) {
      text +=
        `इस भाव में ${p.map(x => x.name).join(", ")} स्थित हैं। `;
    }

    const lordData = planets?.[h.signLord];

    if (lordData) {
      text +=
        `${section.label} भावेश ${h.signLord} भाव ${lordData.house} में स्थित हैं। `;
    }
  });

  return text.trim();
}

// ============================================================
// 18. MAIN INTERPRETER
// ============================================================

function interpretD1Chart(d1Data) {
  if (!d1Data) {
    throw new Error("d1Data is required");
  }

  const houses = d1Data.houses || {};
  const planets = d1Data.planets || {};

  const normalizedData = {
    ...d1Data,
    houses,
    planets
  };

  const yogas = detectYogas(normalizedData);

  return {
    personality: {
      title: "शारीरिक संरचना, व्यक्तित्व और स्वभाव",
      house: 1,
      analysis: buildPersonality(
        normalizedData,
        yogas
      )
    },

    wealth: {
      title: "धन, संपत्ति और पारिवारिक पृष्ठभूमि",
      houses: [2, 4, 11],
      analysis: buildWealth(normalizedData)
    },

    intellect: {
      title: "बौद्धिक क्षमता, शिक्षा और सोच",
      houses: [3, 5],
      analysis: buildIntellect(normalizedData)
    },

    career: {
      title: "करियर, सामाजिक प्रतिष्ठा और सत्ता",
      house: 10,
      analysis: buildCareer(
        normalizedData,
        yogas
      )
    },

    relationships: {
      title: "संबंध, विवाह और पार्टनरशिप",
      house: 7,
      analysis: buildRelationships(normalizedData)
    },

    challenges: {
      title: "संघर्ष, चुनौतियाँ, स्वास्थ्य और जीवन में परिवर्तन",
      houses: [6, 8, 12],
      analysis: buildChallenges(normalizedData)
    },

    // Optional internal metadata.
    // Frontend can ignore this if not needed.
    _meta: {
      yogas,
      careerScore: calculateCareerScore(normalizedData),
      aspects: {
        house1: getAspectsOnHouse(1, planets),
        house7: getAspectsOnHouse(7, planets),
        house10: getAspectsOnHouse(10, planets)
      }
    }
  };
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  interpretD1Chart,
  detectYogas,
  getAspectsOnHouse,
  calculateCareerScore
};