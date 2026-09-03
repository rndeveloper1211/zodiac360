/**
 * Zodiac360 - Advanced Career Analyzer Engine
 *
 * Rule-based Vedic career analysis using:
 * - 10th house
 * - 10th lord
 * - House lordships
 * - Planet placements
 * - Planet conjunctions
 * - Vedic planetary aspects
 * - Planet dignity
 * - 2nd / 3rd / 5th / 6th / 7th / 9th / 10th / 11th influences
 * - Public visibility
 * - Creative indicators
 * - Technical indicators
 * - Business indicators
 * - Sports indicators
 *
 * IMPORTANT:
 * This is a rule-based interpretation engine.
 * It does NOT hard-code any celebrity or profession result.
 */

// ============================================================
// CONSTANTS
// ============================================================

const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];

const SIGN_LORDS = [
  "Mars",    // Aries
  "Venus",   // Taurus
  "Mercury", // Gemini
  "Moon",    // Cancer
  "Sun",     // Leo
  "Mercury", // Virgo
  "Venus",   // Libra
  "Mars",    // Scorpio
  "Jupiter", // Sagittarius
  "Saturn",  // Capricorn
  "Saturn",  // Aquarius
  "Jupiter"  // Pisces
];

const EXALTATION_SIGNS = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra"
};

const DEBILITATION_SIGNS = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries"
};

const OWN_SIGNS = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"]
};

const PLANET_CAREER_TRAITS = {
  Sun: [
    "leadership",
    "government",
    "authority",
    "administration",
    "public image",
    "executive role"
  ],
  Moon: [
    "public connection",
    "media",
    "hospitality",
    "care",
    "people management",
    "popularity"
  ],
  Mars: [
    "sports",
    "defense",
    "engineering",
    "competition",
    "operations",
    "physical performance"
  ],
  Mercury: [
    "communication",
    "technology",
    "analysis",
    "writing",
    "business",
    "media"
  ],
  Jupiter: [
    "education",
    "finance",
    "law",
    "consulting",
    "guidance",
    "management"
  ],
  Venus: [
    "film",
    "acting",
    "entertainment",
    "music",
    "fashion",
    "luxury",
    "arts"
  ],
  Saturn: [
    "discipline",
    "engineering",
    "industry",
    "management",
    "systems",
    "long-term career"
  ],
  Rahu: [
    "mass popularity",
    "foreign influence",
    "technology",
    "cinema",
    "unconventional career",
    "media"
  ],
  Ketu: [
    "research",
    "spirituality",
    "analysis",
    "detachment",
    "occult"
  ]
};

// ============================================================
// BASIC HELPERS
// ============================================================

function normalizePlanetName(name) {
  if (!name) return "";
  return String(name).trim();
}

function getPlanet(chartData, planetName) {
  return chartData?.planets?.[planetName] || null;
}

function getHouse(chartData, houseNumber) {
  return chartData?.houses?.[String(houseNumber)] ||
    chartData?.houses?.[houseNumber] ||
    null;
}

function getPlanetsInHouse(chartData, houseNumber) {
  const result = [];

  if (!chartData?.planets) return result;

  for (const [name, data] of Object.entries(chartData.planets)) {
    if (Number(data?.house) === Number(houseNumber)) {
      result.push(name);
    }
  }

  return result;
}

function getSignLordByIndex(signIndex) {
  return SIGN_LORDS[signIndex] || null;
}

function getHouseSignIndex(chartData, houseNumber) {
  const explicitHouse = getHouse(chartData, houseNumber);

  if (
    explicitHouse &&
    explicitHouse.rashiIndex !== undefined &&
    explicitHouse.rashiIndex !== null
  ) {
    return Number(explicitHouse.rashiIndex);
  }

  const ascIndex = Number(chartData?.ascendant?.rashiIndex);

  if (Number.isNaN(ascIndex)) return null;

  return (ascIndex + houseNumber - 1) % 12;
}

function getHouseLord(chartData, houseNumber) {
  const signIndex = getHouseSignIndex(chartData, houseNumber);

  if (signIndex === null) return null;

  return getSignLordByIndex(signIndex);
}

function getPlanetHouse(chartData, planetName) {
  return Number(chartData?.planets?.[planetName]?.house || 0) || null;
}

function isPlanetInHouse(chartData, planetName, houseNumber) {
  return getPlanetHouse(chartData, planetName) === houseNumber;
}

function areConjunct(chartData, planetA, planetB) {
  const houseA = getPlanetHouse(chartData, planetA);
  const houseB = getPlanetHouse(chartData, planetB);

  return !!houseA && !!houseB && houseA === houseB;
}

function getDegreeDifference(chartData, planetA, planetB) {
  const a = getPlanet(chartData, planetA);
  const b = getPlanet(chartData, planetB);

  if (!a || !b) return null;

  const degreeA =
    a.totalDegree !== undefined
      ? Number(a.totalDegree)
      : Number(a.degreeInRashi);

  const degreeB =
    b.totalDegree !== undefined
      ? Number(b.totalDegree)
      : Number(b.degreeInRashi);

  if (Number.isNaN(degreeA) || Number.isNaN(degreeB)) return null;

  let diff = Math.abs(degreeA - degreeB);

  if (diff > 180) diff = 360 - diff;

  return diff;
}

// ============================================================
// PLANET DIGNITY
// ============================================================

function getPlanetDignity(chartData, planetName) {
  const planet = getPlanet(chartData, planetName);

  if (!planet) {
    return {
      status: "unknown",
      strength: 0
    };
  }

  const sign = planet.rashi;

  if (EXALTATION_SIGNS[planetName] === sign) {
    return {
      status: "exalted",
      strength: 3
    };
  }

  if (DEBILITATION_SIGNS[planetName] === sign) {
    return {
      status: "debilitated",
      strength: -2
    };
  }

  if (OWN_SIGNS[planetName]?.includes(sign)) {
    return {
      status: "own-sign",
      strength: 2
    };
  }

  return {
    status: "normal",
    strength: 0
  };
}

// ============================================================
// VEDIC ASPECT ENGINE
// ============================================================

function getAspectDistance(fromHouse, toHouse) {
  if (!fromHouse || !toHouse) return null;

  return ((toHouse - fromHouse + 12) % 12) + 1;
}

function planetAspectsHouse(planetName, fromHouse, targetHouse) {
  const distance = getAspectDistance(fromHouse, targetHouse);

  if (!distance) return false;

  // Standard 7th aspect
  if (distance === 7) return true;

  // Mars special aspects
  if (planetName === "Mars" && [4, 8].includes(distance)) {
    return true;
  }

  // Jupiter special aspects
  if (planetName === "Jupiter" && [5, 9].includes(distance)) {
    return true;
  }

  // Saturn special aspects
  if (planetName === "Saturn" && [3, 10].includes(distance)) {
    return true;
  }

  // Rahu/Ketu special aspects intentionally not added.
  // Only 7th aspect is used above.

  return false;
}

function getAspectType(planetName, fromHouse, targetHouse) {
  const distance = getAspectDistance(fromHouse, targetHouse);

  if (!distance) return null;

  if (distance === 7) return "7th";

  if (planetName === "Mars") {
    if (distance === 4) return "4th";
    if (distance === 8) return "8th";
  }

  if (planetName === "Jupiter") {
    if (distance === 5) return "5th";
    if (distance === 9) return "9th";
  }

  if (planetName === "Saturn") {
    if (distance === 3) return "3rd";
    if (distance === 10) return "10th";
  }

  return null;
}

function getAspectsOnHouse(chartData, targetHouse) {
  const aspects = [];

  if (!chartData?.planets) return aspects;

  for (const [planetName, planet] of Object.entries(chartData.planets)) {
    const fromHouse = Number(planet?.house);

    if (!fromHouse) continue;

    if (planetAspectsHouse(planetName, fromHouse, targetHouse)) {
      aspects.push({
        planet: planetName,
        fromHouse,
        targetHouse,
        aspectType: getAspectType(
          planetName,
          fromHouse,
          targetHouse
        )
      });
    }
  }

  return aspects;
}

function calculateAspectsOn10th(planets) {
  const fakeChart = {
    planets
  };

  const list = getAspectsOnHouse(fakeChart, 10);

  const aspects = {
    marsAspect: false,
    saturnAspect: false,
    jupiterAspect: false,
    sunAspect: false,
    mercuryAspect: false,
    venusAspect: false,
    moonAspect: false,
    rahuAspect: false,
    ketuAspect: false,
    details: list
  };

  for (const item of list) {
    switch (item.planet) {
      case "Mars":
        aspects.marsAspect = true;
        break;

      case "Saturn":
        aspects.saturnAspect = true;
        break;

      case "Jupiter":
        aspects.jupiterAspect = true;
        break;

      case "Sun":
        aspects.sunAspect = true;
        break;

      case "Mercury":
        aspects.mercuryAspect = true;
        break;

      case "Venus":
        aspects.venusAspect = true;
        break;

      case "Moon":
        aspects.moonAspect = true;
        break;

      case "Rahu":
        aspects.rahuAspect = true;
        break;

      case "Ketu":
        aspects.ketuAspect = true;
        break;
    }
  }

  return aspects;
}

// ============================================================
// SCORE ENGINE
// ============================================================

function createCareerScore(name, domain) {
  return {
    name,
    domain,
    score: 0,
    reasons: [],
    planets: new Set()
  };
}

function addScore(
  career,
  points,
  reason,
  planet = null
) {
  career.score += points;

  if (reason && !career.reasons.includes(reason)) {
    career.reasons.push(reason);
  }

  if (planet) {
    career.planets.add(planet);
  }
}

// ============================================================
// CAREER CATEGORIES
// ============================================================

function initializeCareers() {
  return {
    acting: createCareerScore(
      "Film / Acting / Entertainment",
      "Cinema, Television & Entertainment"
    ),

    media: createCareerScore(
      "Media / Public Personality",
      "Media, Communication & Public Visibility"
    ),

    music: createCareerScore(
      "Music / Performing Arts",
      "Music & Performing Arts"
    ),

    sports: createCareerScore(
      "Sports / Athletics",
      "Professional Sports & Physical Performance"
    ),

    politics: createCareerScore(
      "Politics / Government / Administration",
      "Government, Administration & Public Leadership"
    ),

    business: createCareerScore(
      "Business / Entrepreneurship",
      "Business, Entrepreneurship & Commerce"
    ),

    technology: createCareerScore(
      "IT / Software / Technology",
      "Software, Technology & Digital Systems"
    ),

    engineering: createCareerScore(
      "Engineering / Technical Operations",
      "Engineering, Infrastructure & Operations"
    ),

    finance: createCareerScore(
      "Finance / Banking / Investment",
      "Finance, Banking & Wealth Management"
    ),

    law: createCareerScore(
      "Law / Legal / Judiciary",
      "Legal Services & Judiciary"
    ),

    medicine: createCareerScore(
      "Medical / Healthcare",
      "Medicine, Healthcare & Healing"
    ),

    defense: createCareerScore(
      "Defense / Police / Security",
      "Defense, Police & Security"
    ),

    education: createCareerScore(
      "Teaching / Education / Academia",
      "Education, Teaching & Academia"
    ),

    research: createCareerScore(
      "Research / Investigation",
      "Research, Investigation & Deep Analysis"
    ),

    writing: createCareerScore(
      "Writing / Journalism / Communication",
      "Writing, Journalism & Communication"
    ),

    design: createCareerScore(
      "Design / Fashion / Creative Industry",
      "Design, Fashion & Creative Arts"
    ),

    realEstate: createCareerScore(
      "Real Estate / Property",
      "Property, Construction & Real Estate"
    ),

    consulting: createCareerScore(
      "Management / Consulting",
      "Management, Strategy & Consulting"
    ),

    occult: createCareerScore(
      "Astrology / Spirituality / Occult",
      "Spirituality, Astrology & Occult Research"
    )
  };
}

// ============================================================
// GENERIC PLANET SCORING
// ============================================================

function scorePlanetPlacement(chartData, careers) {
  const planets = chartData?.planets || {};

  // --------------------------------------------------------
  // VENUS
  // --------------------------------------------------------

  if (planets.Venus) {
    const house = Number(planets.Venus.house);
    const dignity = getPlanetDignity(chartData, "Venus");

    addScore(
      careers.acting,
      8,
      `Venus supports arts, glamour and entertainment`,
      "Venus"
    );

    addScore(
      careers.music,
      8,
      `Venus supports music and performing arts`,
      "Venus"
    );

    addScore(
      careers.design,
      8,
      `Venus supports beauty, design and creative industries`,
      "Venus"
    );

    if ([3, 5, 7, 10, 11].includes(house)) {
      addScore(
        careers.acting,
        10,
        `Venus is placed in career-relevant creative/public house ${house}`,
        "Venus"
      );
    }

    if ([5, 7, 10, 11].includes(house)) {
      addScore(
        careers.media,
        6,
        `Venus is connected with public or creative expression`,
        "Venus"
      );
    }

    if (house === 8) {
      addScore(
        careers.acting,
        5,
        `Venus in 8th house supports transformative and dramatic artistic expression`,
        "Venus"
      );

      addScore(
        careers.research,
        3,
        `Venus in 8th house adds depth and transformative themes`,
        "Venus"
      );
    }

    if (dignity.status === "exalted") {
      addScore(
        careers.acting,
        8,
        `Venus is exalted`,
        "Venus"
      );

      addScore(
        careers.music,
        8,
        `Venus is exalted`,
        "Venus"
      );

      addScore(
        careers.design,
        8,
        `Venus is exalted`,
        "Venus"
      );
    }

    if (dignity.status === "debilitated") {
      addScore(
        careers.acting,
        -3,
        `Venus is debilitated, reducing pure artistic strength`,
        "Venus"
      );

      addScore(
        careers.design,
        -3,
        `Venus is debilitated`,
        "Venus"
      );
    }
  }

  // --------------------------------------------------------
  // MERCURY
  // --------------------------------------------------------

  if (planets.Mercury) {
    const house = Number(planets.Mercury.house);
    const dignity = getPlanetDignity(chartData, "Mercury");

    addScore(
      careers.technology,
      8,
      `Mercury supports analysis, logic and technology`,
      "Mercury"
    );

    addScore(
      careers.business,
      6,
      `Mercury supports commerce and negotiation`,
      "Mercury"
    );

    addScore(
      careers.writing,
      8,
      `Mercury supports speech, writing and communication`,
      "Mercury"
    );

    addScore(
      careers.media,
      6,
      `Mercury supports communication and media`,
      "Mercury"
    );

    if ([3, 5, 7, 10, 11].includes(house)) {
      addScore(
        careers.media,
        6,
        `Mercury is placed in communication/public house ${house}`,
        "Mercury"
      );
    }

    if (house === 8) {
      addScore(
        careers.research,
        10,
        `Mercury in 8th house supports deep analysis and research`,
        "Mercury"
      );

      addScore(
        careers.acting,
        4,
        `Mercury in 8th house supports layered expression and character interpretation`,
        "Mercury"
      );
    }

    if (
      dignity.status === "exalted" ||
      dignity.status === "own-sign"
    ) {
      addScore(
        careers.technology,
        7,
        `Mercury has strong dignity`,
        "Mercury"
      );

      addScore(
        careers.writing,
        7,
        `Mercury has strong dignity`,
        "Mercury"
      );

      addScore(
        careers.media,
        5,
        `Strong Mercury enhances communication`,
        "Mercury"
      );
    }
  }

  // --------------------------------------------------------
  // SUN
  // --------------------------------------------------------

  if (planets.Sun) {
    const house = Number(planets.Sun.house);
    const dignity = getPlanetDignity(chartData, "Sun");

    addScore(
      careers.politics,
      8,
      `Sun supports authority, leadership and government`,
      "Sun"
    );

    addScore(
      careers.media,
      5,
      `Sun supports visibility and public recognition`,
      "Sun"
    );

    addScore(
      careers.acting,
      5,
      `Sun supports stage presence and visibility`,
      "Sun"
    );

    if ([1, 5, 7, 9, 10, 11].includes(house)) {
      addScore(
        careers.politics,
        7,
        `Sun is placed in a visibility/leadership house`,
        "Sun"
      );
    }

    if ([5, 7, 10, 11].includes(house)) {
      addScore(
        careers.media,
        6,
        `Sun is connected with public visibility`,
        "Sun"
      );
    }

    if (house === 8) {
      addScore(
        careers.research,
        4,
        `Sun in 8th supports investigation and transformative roles`,
        "Sun"
      );

      addScore(
        careers.acting,
        3,
        `Sun in 8th may support powerful transformative expression`,
        "Sun"
      );
    }

    if (dignity.status === "exalted") {
      addScore(
        careers.politics,
        8,
        `Sun is exalted`,
        "Sun"
      );
    }
  }

  // --------------------------------------------------------
  // MARS
  // --------------------------------------------------------

  if (planets.Mars) {
    const house = Number(planets.Mars.house);
    const dignity = getPlanetDignity(chartData, "Mars");

    addScore(
      careers.sports,
      10,
      `Mars supports competition, stamina and physical performance`,
      "Mars"
    );

    addScore(
      careers.defense,
      10,
      `Mars supports defense, police and tactical work`,
      "Mars"
    );

    addScore(
      careers.engineering,
      8,
      `Mars supports engineering and technical operations`,
      "Mars"
    );

    if ([3, 6, 10, 11].includes(house)) {
      addScore(
        careers.sports,
        7,
        `Mars is placed in an action-oriented house`,
        "Mars"
      );
    }

    if ([6, 10].includes(house)) {
      addScore(
        careers.defense,
        7,
        `Mars supports competition and operational service`,
        "Mars"
      );
    }

    if (house === 8) {
      addScore(
        careers.research,
        7,
        `Mars in 8th supports investigation and crisis management`,
        "Mars"
      );
    }

    if (dignity.status === "exalted") {
      addScore(
        careers.sports,
        8,
        `Mars is exalted`,
        "Mars"
      );

      addScore(
        careers.defense,
        8,
        `Mars is exalted`,
        "Mars"
      );

      addScore(
        careers.engineering,
        6,
        `Mars is exalted`,
        "Mars"
      );
    }
  }

  // --------------------------------------------------------
  // JUPITER
  // --------------------------------------------------------

  if (planets.Jupiter) {
    const house = Number(planets.Jupiter.house);
    const dignity = getPlanetDignity(chartData, "Jupiter");

    addScore(
      careers.education,
      9,
      `Jupiter supports education and teaching`,
      "Jupiter"
    );

    addScore(
      careers.finance,
      8,
      `Jupiter supports finance and wealth advisory`,
      "Jupiter"
    );

    addScore(
      careers.law,
      7,
      `Jupiter supports law, ethics and judgement`,
      "Jupiter"
    );

    addScore(
      careers.consulting,
      8,
      `Jupiter supports advisory and consulting`,
      "Jupiter"
    );

    if ([2, 5, 9, 10, 11].includes(house)) {
      addScore(
        careers.finance,
        5,
        `Jupiter occupies a wealth/career-supportive house`,
        "Jupiter"
      );
    }

    if ([5, 9, 10].includes(house)) {
      addScore(
        careers.education,
        6,
        `Jupiter occupies a knowledge/career house`,
        "Jupiter"
      );
    }

    if (house === 6) {
      addScore(
        careers.law,
        5,
        `Jupiter in 6th supports disputes, service and advisory`,
        "Jupiter"
      );

      addScore(
        careers.consulting,
        5,
        `Jupiter in 6th supports problem solving and service`,
        "Jupiter"
      );
    }

    if (dignity.status === "exalted") {
      addScore(
        careers.education,
        8,
        `Jupiter is exalted`,
        "Jupiter"
      );

      addScore(
        careers.finance,
        7,
        `Jupiter is exalted`,
        "Jupiter"
      );

      addScore(
        careers.consulting,
        7,
        `Jupiter is exalted`,
        "Jupiter"
      );

      addScore(
        careers.law,
        6,
        `Jupiter is exalted`,
        "Jupiter"
      );
    }
  }

  // --------------------------------------------------------
  // SATURN
  // --------------------------------------------------------

  if (planets.Saturn) {
    const house = Number(planets.Saturn.house);
    const dignity = getPlanetDignity(chartData, "Saturn");

    addScore(
      careers.engineering,
      8,
      `Saturn supports systems, engineering and structured work`,
      "Saturn"
    );

    addScore(
      careers.consulting,
      5,
      `Saturn supports administration and long-term management`,
      "Saturn"
    );

    addScore(
      careers.realEstate,
      6,
      `Saturn supports land, construction and infrastructure`,
      "Saturn"
    );

    if ([3, 6, 10, 11].includes(house)) {
      addScore(
        careers.engineering,
        6,
        `Saturn is placed in a work-oriented house`,
        "Saturn"
      );
    }

    if (house === 4) {
      addScore(
        careers.realEstate,
        8,
        `Saturn in 4th connects with property and infrastructure`,
        "Saturn"
      );
    }

    if (dignity.status === "exalted") {
      addScore(
        careers.engineering,
        7,
        `Saturn is exalted`,
        "Saturn"
      );

      addScore(
        careers.consulting,
        6,
        `Strong Saturn supports administration`,
        "Saturn"
      );
    }
  }

  // --------------------------------------------------------
  // MOON
  // --------------------------------------------------------

  if (planets.Moon) {
    const house = Number(planets.Moon.house);

    addScore(
      careers.media,
      7,
      `Moon supports public connection and popularity`,
      "Moon"
    );

    addScore(
      careers.medicine,
      6,
      `Moon supports care and healing professions`,
      "Moon"
    );

    addScore(
      careers.acting,
      5,
      `Moon supports emotional expression`,
      "Moon"
    );

    if ([5, 7, 10, 11].includes(house)) {
      addScore(
        careers.media,
        7,
        `Moon occupies a public or expressive house`,
        "Moon"
      );

      addScore(
        careers.acting,
        5,
        `Moon supports emotional public expression`,
        "Moon"
      );
    }
  }

  // --------------------------------------------------------
  // RAHU
  // --------------------------------------------------------

  if (planets.Rahu) {
    const house = Number(planets.Rahu.house);

    addScore(
      careers.media,
      7,
      `Rahu supports mass visibility and unconventional public reach`,
      "Rahu"
    );

    addScore(
      careers.technology,
      6,
      `Rahu supports modern technology and unconventional systems`,
      "Rahu"
    );

    addScore(
      careers.acting,
      6,
      `Rahu supports glamour, cinema and mass appeal`,
      "Rahu"
    );

    if (house === 7) {
      addScore(
        careers.media,
        12,
        `Rahu in 7th strongly activates public visibility`,
        "Rahu"
      );

      addScore(
        careers.acting,
        10,
        `Rahu in 7th supports mass audience and public image`,
        "Rahu"
      );
    }

    if ([5, 10, 11].includes(house)) {
      addScore(
        careers.media,
        8,
        `Rahu occupies a career/fame related house`,
        "Rahu"
      );
    }
  }

  // --------------------------------------------------------
  // KETU
  // --------------------------------------------------------

  if (planets.Ketu) {
    const house = Number(planets.Ketu.house);

    addScore(
      careers.research,
      6,
      `Ketu supports investigation and subtle analysis`,
      "Ketu"
    );

    addScore(
      careers.occult,
      10,
      `Ketu supports spirituality and occult subjects`,
      "Ketu"
    );

    if ([1, 5, 8, 9, 12].includes(house)) {
      addScore(
        careers.occult,
        5,
        `Ketu occupies a spiritual/research-oriented house`,
        "Ketu"
      );
    }
  }
}

// ============================================================
// HOUSE LORD SCORING
// ============================================================

function scoreHouseLords(chartData, careers) {
  const secondLord = getHouseLord(chartData, 2);
  const thirdLord = getHouseLord(chartData, 3);
  const fourthLord = getHouseLord(chartData, 4);
  const fifthLord = getHouseLord(chartData, 5);
  const sixthLord = getHouseLord(chartData, 6);
  const seventhLord = getHouseLord(chartData, 7);
  const ninthLord = getHouseLord(chartData, 9);
  const tenthLord = getHouseLord(chartData, 10);
  const eleventhLord = getHouseLord(chartData, 11);

  const secondLordHouse = getPlanetHouse(chartData, secondLord);
  const thirdLordHouse = getPlanetHouse(chartData, thirdLord);
  const fifthLordHouse = getPlanetHouse(chartData, fifthLord);
  const seventhLordHouse = getPlanetHouse(chartData, seventhLord);
  const ninthLordHouse = getPlanetHouse(chartData, ninthLord);
  const tenthLordHouse = getPlanetHouse(chartData, tenthLord);
  const eleventhLordHouse = getPlanetHouse(chartData, eleventhLord);

  // --------------------------------------------------------
  // 10TH LORD
  // --------------------------------------------------------

  if (tenthLord) {
    if (tenthLord === "Venus") {
      addScore(
        careers.acting,
        12,
        `10th lord Venus strongly supports entertainment and arts`,
        "Venus"
      );

      addScore(
        careers.design,
        10,
        `10th lord Venus supports creative industries`,
        "Venus"
      );
    }

    if (tenthLord === "Mercury") {
      addScore(
        careers.technology,
        10,
        `10th lord Mercury supports technology and analysis`,
        "Mercury"
      );

      addScore(
        careers.business,
        9,
        `10th lord Mercury supports business and commerce`,
        "Mercury"
      );

      addScore(
        careers.writing,
        8,
        `10th lord Mercury supports communication`,
        "Mercury"
      );
    }

    if (tenthLord === "Mars") {
      addScore(
        careers.sports,
        9,
        `10th lord Mars supports competition and physical performance`,
        "Mars"
      );

      addScore(
        careers.engineering,
        9,
        `10th lord Mars supports engineering and operations`,
        "Mars"
      );

      addScore(
        careers.defense,
        8,
        `10th lord Mars supports defense and tactical professions`,
        "Mars"
      );
    }

    if (tenthLord === "Sun") {
      addScore(
        careers.politics,
        12,
        `10th lord Sun supports government and authority`,
        "Sun"
      );
    }

    if (tenthLord === "Jupiter") {
      addScore(
        careers.education,
        10,
        `10th lord Jupiter supports teaching and knowledge`,
        "Jupiter"
      );

      addScore(
        careers.finance,
        9,
        `10th lord Jupiter supports finance`,
        "Jupiter"
      );

      addScore(
        careers.consulting,
        9,
        `10th lord Jupiter supports advisory work`,
        "Jupiter"
      );
    }

    if (tenthLord === "Saturn") {
      addScore(
        careers.engineering,
        10,
        `10th lord Saturn supports systems and engineering`,
        "Saturn"
      );

      addScore(
        careers.consulting,
        7,
        `10th lord Saturn supports administration`,
        "Saturn"
      );
    }

    if (tenthLord === "Moon") {
      addScore(
        careers.media,
        9,
        `10th lord Moon supports public-facing professions`,
        "Moon"
      );

      addScore(
        careers.medicine,
        7,
        `10th lord Moon supports care-oriented professions`,
        "Moon"
      );
    }
  }

  // --------------------------------------------------------
  // 10TH LORD HOUSE
  // --------------------------------------------------------

  if (tenthLordHouse === 1) {
    addScore(
      careers.business,
      5,
      `10th lord in 1st connects profession strongly with identity`,
      tenthLord
    );

    addScore(
      careers.politics,
      4,
      `10th lord in 1st can increase public professional visibility`,
      tenthLord
    );
  }

  if (tenthLordHouse === 3) {
    addScore(
      careers.media,
      7,
      `10th lord in 3rd supports communication and performance`,
      tenthLord
    );

    addScore(
      careers.writing,
      7,
      `10th lord in 3rd supports writing and communication`,
      tenthLord
    );
  }

  if (tenthLordHouse === 5) {
    addScore(
      careers.acting,
      10,
      `10th lord in 5th strongly connects career with creativity and performance`,
      tenthLord
    );

    addScore(
      careers.media,
      6,
      `10th lord in 5th supports creative public expression`,
      tenthLord
    );

    addScore(
      careers.education,
      5,
      `10th lord in 5th supports education`,
      tenthLord
    );
  }

  if (tenthLordHouse === 6) {
    addScore(
      careers.medicine,
      7,
      `10th lord in 6th supports service and healthcare`,
      tenthLord
    );

    addScore(
      careers.law,
      6,
      `10th lord in 6th supports disputes and legal service`,
      tenthLord
    );

    addScore(
      careers.defense,
      5,
      `10th lord in 6th supports competitive service`,
      tenthLord
    );
  }

  if (tenthLordHouse === 7) {
    addScore(
      careers.business,
      8,
      `10th lord in 7th supports business and partnerships`,
      tenthLord
    );

    addScore(
      careers.media,
      8,
      `10th lord in 7th supports public-facing career`,
      tenthLord
    );
  }

  if (tenthLordHouse === 8) {
    addScore(
      careers.research,
      12,
      `10th lord in 8th strongly supports research, transformation and investigation`,
      tenthLord
    );

    addScore(
      careers.acting,
      6,
      `10th lord in 8th supports transformational and dramatic professional expression`,
      tenthLord
    );

    addScore(
      careers.occult,
      6,
      `10th lord in 8th connects profession with hidden or deep subjects`,
      tenthLord
    );
  }

  if (tenthLordHouse === 9) {
    addScore(
      careers.education,
      8,
      `10th lord in 9th supports teaching and higher knowledge`,
      tenthLord
    );

    addScore(
      careers.law,
      6,
      `10th lord in 9th supports law and ethics`,
      tenthLord
    );

    addScore(
      careers.consulting,
      7,
      `10th lord in 9th supports advisory professions`,
      tenthLord
    );
  }

  if (tenthLordHouse === 10) {
    addScore(
      careers.politics,
      7,
      `10th lord in 10th strengthens professional authority`,
      tenthLord
    );

    addScore(
      careers.business,
      6,
      `10th lord in own career house strengthens profession`,
      tenthLord
    );

    addScore(
      careers.consulting,
      6,
      `10th lord in 10th supports professional status`,
      tenthLord
    );
  }

  if (tenthLordHouse === 11) {
    addScore(
      careers.business,
      8,
      `10th lord in 11th supports income, networks and expansion`,
      tenthLord
    );

    addScore(
      careers.media,
      6,
      `10th lord in 11th supports large networks and audience`,
      tenthLord
    );
  }

  // --------------------------------------------------------
  // 5TH LORD = CREATIVE INTELLIGENCE
  // --------------------------------------------------------

  if (fifthLord) {
    if ([3, 5, 7, 10, 11].includes(fifthLordHouse)) {
      addScore(
        careers.acting,
        8,
        `5th lord ${fifthLord} is connected with expressive/public houses`,
        fifthLord
      );

      addScore(
        careers.media,
        6,
        `5th lord supports creative public expression`,
        fifthLord
      );
    }

    if (fifthLordHouse === 8) {
      addScore(
        careers.acting,
        8,
        `5th lord ${fifthLord} in 8th supports deep creative and transformative expression`,
        fifthLord
      );

      addScore(
        careers.research,
        8,
        `5th lord in 8th supports research-oriented intelligence`,
        fifthLord
      );
    }
  }

  // --------------------------------------------------------
  // 3RD LORD = PERFORMANCE / COMMUNICATION
  // --------------------------------------------------------

  if (thirdLord) {
    if ([3, 5, 7, 10, 11].includes(thirdLordHouse)) {
      addScore(
        careers.media,
        6,
        `3rd lord ${thirdLord} supports communication and public expression`,
        thirdLord
      );

      addScore(
        careers.writing,
        6,
        `3rd lord supports writing and communication`,
        thirdLord
      );
    }

    if (thirdLordHouse === 8) {
      addScore(
        careers.acting,
        4,
        `3rd lord in 8th supports intense and transformative expression`,
        thirdLord
      );

      addScore(
        careers.research,
        5,
        `3rd lord in 8th supports investigation`,
        thirdLord
      );
    }
  }

  // --------------------------------------------------------
  // 7TH LORD = PUBLIC / AUDIENCE
  // --------------------------------------------------------

  if (seventhLord) {
    if ([1, 5, 7, 10, 11].includes(seventhLordHouse)) {
      addScore(
        careers.media,
        5,
        `7th lord ${seventhLord} supports public interaction`,
        seventhLord
      );

      addScore(
        careers.business,
        4,
        `7th lord supports partnerships and business`,
        seventhLord
      );
    }

    if (seventhLordHouse === 8) {
      addScore(
        careers.acting,
        4,
        `7th lord in 8th supports unconventional public image`,
        seventhLord
      );
    }
  }

  // --------------------------------------------------------
  // 9TH LORD = FORTUNE / STATUS
  // --------------------------------------------------------

  if (ninthLord && tenthLord) {
    if (areConjunct(chartData, ninthLord, tenthLord)) {
      addScore(
        careers.politics,
        7,
        `9th lord ${ninthLord} is conjunct 10th lord ${tenthLord}`,
        ninthLord
      );

      addScore(
        careers.business,
        6,
        `9th lord and 10th lord connection supports professional rise`,
        tenthLord
      );

      addScore(
        careers.consulting,
        6,
        `9th-10th lord connection supports status and professional success`,
        ninthLord
      );
    }
  }

  // --------------------------------------------------------
  // 5TH + 10TH = CREATIVE PROFESSION
  // --------------------------------------------------------

  if (
    fifthLord &&
    tenthLord &&
    areConjunct(chartData, fifthLord, tenthLord)
  ) {
    addScore(
      careers.acting,
      12,
      `5th lord ${fifthLord} is conjunct 10th lord ${tenthLord}: creativity directly connects with profession`,
      fifthLord
    );

    addScore(
      careers.media,
      8,
      `5th lord and 10th lord are connected`,
      tenthLord
    );
  }

  // --------------------------------------------------------
  // 5TH + 9TH
  // --------------------------------------------------------

  if (
    fifthLord &&
    ninthLord &&
    areConjunct(chartData, fifthLord, ninthLord)
  ) {
    addScore(
      careers.acting,
      8,
      `5th lord ${fifthLord} and 9th lord ${ninthLord} are connected`,
      fifthLord
    );

    addScore(
      careers.education,
      5,
      `5th and 9th lord connection strengthens intellectual potential`,
      ninthLord
    );
  }

  // --------------------------------------------------------
  // 2ND + 11TH = FINANCE
  // --------------------------------------------------------

  if (secondLord && eleventhLord) {
    if (secondLord === eleventhLord) {
      addScore(
        careers.finance,
        8,
        `${secondLord} rules both wealth and gain houses`,
        secondLord
      );

      addScore(
        careers.business,
        5,
        `2nd and 11th houses share lord ${secondLord}`,
        secondLord
      );
    }

    if (
      secondLord !== eleventhLord &&
      areConjunct(chartData, secondLord, eleventhLord)
    ) {
      addScore(
        careers.finance,
        8,
        `2nd and 11th lords are conjunct`,
        secondLord
      );
    }
  }

  return {
    secondLord,
    thirdLord,
    fourthLord,
    fifthLord,
    sixthLord,
    seventhLord,
    ninthLord,
    tenthLord,
    eleventhLord
  };
}

// ============================================================
// 10TH HOUSE SCORING
// ============================================================

function scoreTenthHouse(chartData, careers) {
  const planetsIn10th = getPlanetsInHouse(chartData, 10);
  const aspects = getAspectsOnHouse(chartData, 10);

  for (const planet of planetsIn10th) {
    switch (planet) {
      case "Sun":
        addScore(
          careers.politics,
          15,
          `Sun is placed directly in the 10th house`,
          "Sun"
        );

        addScore(
          careers.media,
          7,
          `Sun in 10th gives public visibility`,
          "Sun"
        );
        break;

      case "Moon":
        addScore(
          careers.media,
          12,
          `Moon in 10th gives public interaction and popularity`,
          "Moon"
        );

        addScore(
          careers.medicine,
          5,
          `Moon in 10th supports care-oriented professions`,
          "Moon"
        );
        break;

      case "Mars":
        addScore(
          careers.sports,
          12,
          `Mars is placed directly in the 10th house`,
          "Mars"
        );

        addScore(
          careers.engineering,
          12,
          `Mars in 10th supports technical operations`,
          "Mars"
        );

        addScore(
          careers.defense,
          12,
          `Mars in 10th supports defense and command`,
          "Mars"
        );
        break;

      case "Mercury":
        addScore(
          careers.technology,
          12,
          `Mercury is placed directly in the 10th house`,
          "Mercury"
        );

        addScore(
          careers.business,
          10,
          `Mercury in 10th supports commerce`,
          "Mercury"
        );

        addScore(
          careers.media,
          8,
          `Mercury in 10th supports communication`,
          "Mercury"
        );
        break;

      case "Jupiter":
        addScore(
          careers.education,
          12,
          `Jupiter is placed directly in the 10th house`,
          "Jupiter"
        );

        addScore(
          careers.finance,
          10,
          `Jupiter in 10th supports finance and advisory`,
          "Jupiter"
        );

        addScore(
          careers.consulting,
          10,
          `Jupiter in 10th supports advisory leadership`,
          "Jupiter"
        );
        break;

      case "Venus":
        addScore(
          careers.acting,
          15,
          `Venus is placed directly in the 10th house`,
          "Venus"
        );

        addScore(
          careers.music,
          12,
          `Venus in 10th supports performing arts`,
          "Venus"
        );

        addScore(
          careers.design,
          12,
          `Venus in 10th supports design and creative industries`,
          "Venus"
        );
        break;

      case "Saturn":
        addScore(
          careers.engineering,
          12,
          `Saturn is placed directly in the 10th house`,
          "Saturn"
        );

        addScore(
          careers.consulting,
          9,
          `Saturn in 10th supports structured administration`,
          "Saturn"
        );
        break;

      case "Rahu":
        addScore(
          careers.media,
          14,
          `Rahu in 10th strongly supports mass visibility`,
          "Rahu"
        );

        addScore(
          careers.acting,
          12,
          `Rahu in 10th supports cinema and unconventional fame`,
          "Rahu"
        );

        addScore(
          careers.technology,
          8,
          `Rahu in 10th supports modern technology`,
          "Rahu"
        );
        break;

      case "Ketu":
        addScore(
          careers.research,
          10,
          `Ketu in 10th supports specialized research`,
          "Ketu"
        );

        addScore(
          careers.occult,
          10,
          `Ketu in 10th can support spiritual or occult professions`,
          "Ketu"
        );
        break;
    }
  }

  for (const aspect of aspects) {
    switch (aspect.planet) {
      case "Sun":
        addScore(
          careers.politics,
          5,
          `Sun aspects the 10th house`,
          "Sun"
        );
        break;

      case "Moon":
        addScore(
          careers.media,
          4,
          `Moon aspects the 10th house`,
          "Moon"
        );
        break;

      case "Mars":
        addScore(
          careers.sports,
          7,
          `Mars aspects the 10th house`,
          "Mars"
        );

        addScore(
          careers.engineering,
          7,
          `Mars aspects the 10th house`,
          "Mars"
        );

        addScore(
          careers.defense,
          6,
          `Mars aspects the 10th house`,
          "Mars"
        );
        break;

      case "Mercury":
        addScore(
          careers.technology,
          5,
          `Mercury aspects the 10th house`,
          "Mercury"
        );

        addScore(
          careers.media,
          4,
          `Mercury aspects the 10th house`,
          "Mercury"
        );
        break;

      case "Jupiter":
        addScore(
          careers.education,
          6,
          `Jupiter aspects the 10th house`,
          "Jupiter"
        );

        addScore(
          careers.finance,
          5,
          `Jupiter aspects the 10th house`,
          "Jupiter"
        );

        addScore(
          careers.consulting,
          6,
          `Jupiter aspects the 10th house`,
          "Jupiter"
        );

        addScore(
          careers.politics,
          4,
          `Jupiter supports professional status through aspect on 10th`,
          "Jupiter"
        );
        break;

      case "Venus":
        addScore(
          careers.acting,
          6,
          `Venus aspects the 10th house`,
          "Venus"
        );

        addScore(
          careers.design,
          5,
          `Venus influences the 10th house`,
          "Venus"
        );
        break;

      case "Saturn":
        addScore(
          careers.engineering,
          6,
          `Saturn aspects the 10th house`,
          "Saturn"
        );

        addScore(
          careers.consulting,
          6,
          `Saturn aspects 10th and supports long-term career structure`,
          "Saturn"
        );

        addScore(
          careers.politics,
          4,
          `Saturn aspect on 10th supports authority through responsibility`,
          "Saturn"
        );
        break;

      case "Rahu":
        addScore(
          careers.media,
          5,
          `Rahu aspects the 10th house`,
          "Rahu"
        );
        break;
    }
  }

  return {
    planetsIn10th,
    aspects
  };
}

// ============================================================
// IMPORTANT CONJUNCTIONS
// ============================================================

function scoreConjunctions(chartData, careers) {
  // Sun + Mercury = Budhaditya-type communication/intellect influence
  if (areConjunct(chartData, "Sun", "Mercury")) {
    addScore(
      careers.media,
      8,
      `Sun-Mercury conjunction supports expression, communication and public intelligence`,
      "Mercury"
    );

    addScore(
      careers.writing,
      8,
      `Sun-Mercury conjunction supports communication`,
      "Mercury"
    );

    addScore(
      careers.politics,
      5,
      `Sun-Mercury conjunction supports administration`,
      "Sun"
    );

    addScore(
      careers.acting,
      5,
      `Sun-Mercury conjunction supports expressive ability`,
      "Mercury"
    );
  }

  // Venus + Moon
  if (areConjunct(chartData, "Venus", "Moon")) {
    addScore(
      careers.acting,
      12,
      `Venus-Moon conjunction strongly supports artistic and emotional expression`,
      "Venus"
    );

    addScore(
      careers.music,
      12,
      `Venus-Moon conjunction supports music and performing arts`,
      "Moon"
    );

    addScore(
      careers.design,
      9,
      `Venus-Moon supports beauty and aesthetics`,
      "Venus"
    );
  }

  // Venus + Mercury
  if (areConjunct(chartData, "Venus", "Mercury")) {
    addScore(
      careers.acting,
      10,
      `Venus-Mercury conjunction combines creativity with expression`,
      "Venus"
    );

    addScore(
      careers.media,
      9,
      `Venus-Mercury conjunction supports media and creative communication`,
      "Mercury"
    );

    addScore(
      careers.music,
      7,
      `Venus-Mercury supports artistic expression`,
      "Venus"
    );

    addScore(
      careers.design,
      8,
      `Venus-Mercury supports creative design`,
      "Mercury"
    );
  }

  // Sun + Venus
  if (areConjunct(chartData, "Sun", "Venus")) {
    addScore(
      careers.acting,
      10,
      `Sun-Venus conjunction combines visibility with artistic expression`,
      "Venus"
    );

    addScore(
      careers.media,
      7,
      `Sun-Venus conjunction supports public glamour`,
      "Sun"
    );
  }

  // Mars + Saturn
  if (areConjunct(chartData, "Mars", "Saturn")) {
    addScore(
      careers.engineering,
      10,
      `Mars-Saturn conjunction supports technical discipline`,
      "Mars"
    );

    addScore(
      careers.defense,
      9,
      `Mars-Saturn supports disciplined physical operations`,
      "Saturn"
    );

    addScore(
      careers.sports,
      6,
      `Mars-Saturn supports endurance`,
      "Mars"
    );
  }

  // Mars + Rahu
  if (areConjunct(chartData, "Mars", "Rahu")) {
    addScore(
      careers.sports,
      8,
      `Mars-Rahu supports extreme competitiveness`,
      "Mars"
    );

    addScore(
      careers.defense,
      7,
      `Mars-Rahu supports aggressive tactical ability`,
      "Rahu"
    );

    addScore(
      careers.technology,
      5,
      `Mars-Rahu can support technical and unconventional systems`,
      "Rahu"
    );
  }

  // Mercury + Rahu
  if (areConjunct(chartData, "Mercury", "Rahu")) {
    addScore(
      careers.technology,
      12,
      `Mercury-Rahu strongly supports technology and unconventional intelligence`,
      "Mercury"
    );

    addScore(
      careers.media,
      8,
      `Mercury-Rahu supports digital communication and mass media`,
      "Rahu"
    );
  }

  // Jupiter + Mercury
  if (areConjunct(chartData, "Jupiter", "Mercury")) {
    addScore(
      careers.education,
      8,
      `Jupiter-Mercury supports teaching and intellectual professions`,
      "Jupiter"
    );

    addScore(
      careers.finance,
      8,
      `Jupiter-Mercury supports finance and analytical advisory`,
      "Mercury"
    );

    addScore(
      careers.consulting,
      8,
      `Jupiter-Mercury supports consulting`,
      "Jupiter"
    );
  }
}

// ============================================================
// PUBLIC VISIBILITY SCORING
// ============================================================

function scorePublicVisibility(chartData, careers) {
  const seventhPlanets = getPlanetsInHouse(chartData, 7);
  const tenthPlanets = getPlanetsInHouse(chartData, 10);
  const eleventhPlanets = getPlanetsInHouse(chartData, 11);
  const fifthPlanets = getPlanetsInHouse(chartData, 5);

  if (seventhPlanets.includes("Rahu")) {
    addScore(
      careers.media,
      10,
      `Rahu in 7th increases mass/public visibility`,
      "Rahu"
    );

    addScore(
      careers.acting,
      8,
      `Rahu in 7th supports large audience exposure`,
      "Rahu"
    );
  }

  if (tenthPlanets.includes("Sun")) {
    addScore(
      careers.politics,
      8,
      `Sun in 10th supports public authority`,
      "Sun"
    );
  }

  if (eleventhPlanets.includes("Rahu")) {
    addScore(
      careers.media,
      8,
      `Rahu in 11th supports large networks and mass audience`,
      "Rahu"
    );
  }

  if (fifthPlanets.includes("Venus")) {
    addScore(
      careers.acting,
      10,
      `Venus in 5th strongly supports entertainment and creativity`,
      "Venus"
    );
  }

  if (fifthPlanets.includes("Moon")) {
    addScore(
      careers.acting,
      7,
      `Moon in 5th supports emotional performance`,
      "Moon"
    );
  }

  if (fifthPlanets.includes("Mercury")) {
    addScore(
      careers.media,
      6,
      `Mercury in 5th supports creative communication`,
      "Mercury"
    );
  }
}

// ============================================================
// 8TH HOUSE SPECIAL ANALYSIS
// ============================================================

function scoreEighthHouse(chartData, careers) {
  const planetsIn8th = getPlanetsInHouse(chartData, 8);

  if (!planetsIn8th.length) return;

  if (planetsIn8th.length >= 3) {
    addScore(
      careers.research,
      10,
      `Multiple planets in 8th create strong transformation/research emphasis`
    );
  }

  const creativeCount = [
    "Sun",
    "Mercury",
    "Venus",
    "Moon"
  ].filter(p => planetsIn8th.includes(p)).length;

  if (creativeCount >= 3) {
    addScore(
      careers.acting,
      10,
      `Multiple expressive/creative planets in 8th support transformational performance`
    );

    addScore(
      careers.media,
      5,
      `Strong expressive planetary cluster supports impactful communication`
    );
  }

  if (
    planetsIn8th.includes("Sun") &&
    planetsIn8th.includes("Mercury") &&
    planetsIn8th.includes("Venus")
  ) {
    addScore(
      careers.acting,
      12,
      `Sun-Mercury-Venus combination supports visibility, expression and artistic ability`
    );

    addScore(
      careers.media,
      8,
      `Sun-Mercury-Venus combination supports creative public communication`
    );
  }

  if (
    planetsIn8th.includes("Mars") &&
    planetsIn8th.includes("Mercury")
  ) {
    addScore(
      careers.research,
      8,
      `Mars-Mercury in 8th supports sharp investigative intelligence`
    );

    addScore(
      careers.technology,
      4,
      `Mars-Mercury combination supports technical analysis`
    );
  }
}

// ============================================================
// CAREER NORMALIZATION
// ============================================================

function normalizeScores(careers) {
  const raw = Object.values(careers);

  const maxScore = Math.max(
    ...raw.map(item => item.score),
    1
  );

  return raw
    .map(item => {
      let normalized = Math.round(
        (Math.max(item.score, 0) / maxScore) * 100
      );

      if (normalized > 100) normalized = 100;
      if (normalized < 0) normalized = 0;

      return {
        name: item.name,
        domain: item.domain,
        rawScore: item.score,
        score: normalized,
        reasons: item.reasons.slice(0, 10),
        influencingPlanets: Array.from(item.planets)
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);
}

// ============================================================
// OPTIONAL AMATYAKARAKA
// ============================================================

function calculateSimpleAmatyakaraka(chartData) {
  /**
   * Simple 7-charakaraka approximation.
   *
   * Rahu/Ketu excluded.
   * Highest degree = Atmakaraka
   * Second highest = Amatyakaraka
   *
   * NOTE:
   * Different Jaimini traditions may calculate Rahu differently.
   */

  const planets = chartData?.planets || {};

  const eligible = Object.entries(planets)
    .filter(([name, data]) => {
      return (
        !["Rahu", "Ketu", "Ascendant"].includes(name) &&
        data?.degreeInRashi !== undefined
      );
    })
    .map(([name, data]) => ({
      name,
      degree: Number(data.degreeInRashi)
    }))
    .filter(item => !Number.isNaN(item.degree))
    .sort((a, b) => b.degree - a.degree);

  return {
    atmakaraka:
      eligible.length >= 1
        ? eligible[0].name
        : null,

    amatyakaraka:
      eligible.length >= 2
        ? eligible[1].name
        : null,

    method: "simple-7-karaka"
  };
}

// ============================================================
// AMATYAKARAKA SCORE
// ============================================================

function scoreAmatyakaraka(
  amatyakaraka,
  careers
) {
  if (!amatyakaraka) return;

  switch (amatyakaraka) {
    case "Sun":
      addScore(
        careers.politics,
        6,
        `Sun as Amatyakaraka supports administration`,
        "Sun"
      );
      break;

    case "Moon":
      addScore(
        careers.media,
        5,
        `Moon as Amatyakaraka supports public professions`,
        "Moon"
      );
      break;

    case "Mars":
      addScore(
        careers.sports,
        6,
        `Mars as Amatyakaraka supports competition`,
        "Mars"
      );

      addScore(
        careers.engineering,
        5,
        `Mars as Amatyakaraka supports technical work`,
        "Mars"
      );

      addScore(
        careers.defense,
        5,
        `Mars as Amatyakaraka supports defense`,
        "Mars"
      );
      break;

    case "Mercury":
      addScore(
        careers.technology,
        6,
        `Mercury as Amatyakaraka supports technology`,
        "Mercury"
      );

      addScore(
        careers.business,
        5,
        `Mercury as Amatyakaraka supports business`,
        "Mercury"
      );

      addScore(
        careers.media,
        5,
        `Mercury as Amatyakaraka supports communication`,
        "Mercury"
      );
      break;

    case "Jupiter":
      addScore(
        careers.education,
        6,
        `Jupiter as Amatyakaraka supports teaching`,
        "Jupiter"
      );

      addScore(
        careers.finance,
        5,
        `Jupiter as Amatyakaraka supports finance`,
        "Jupiter"
      );

      addScore(
        careers.consulting,
        5,
        `Jupiter as Amatyakaraka supports consulting`,
        "Jupiter"
      );
      break;

    case "Venus":
      addScore(
        careers.acting,
        7,
        `Venus as Amatyakaraka supports entertainment`,
        "Venus"
      );

      addScore(
        careers.music,
        7,
        `Venus as Amatyakaraka supports performing arts`,
        "Venus"
      );

      addScore(
        careers.design,
        6,
        `Venus as Amatyakaraka supports creative industries`,
        "Venus"
      );
      break;

    case "Saturn":
      addScore(
        careers.engineering,
        6,
        `Saturn as Amatyakaraka supports systems and structured work`,
        "Saturn"
      );

      addScore(
        careers.consulting,
        5,
        `Saturn as Amatyakaraka supports management`,
        "Saturn"
      );
      break;
  }
}

// ============================================================
// SUMMARY GENERATOR
// ============================================================

function generateCareerSummary(
  chartData,
  primaryCareer,
  tenthLord,
  tenthLordHouse,
  topCareers
) {
  const reasons = primaryCareer?.reasons || [];

  let text =
    `दशम भाव के स्वामी ${tenthLord || "अज्ञात"} हैं`;

  if (tenthLordHouse) {
    text += ` और वे ${tenthLordHouse}वें भाव में स्थित हैं। `;
  } else {
    text += "। ";
  }

  if (primaryCareer) {
    text +=
      `समग्र ग्रह-संबंध, भावेश, दृष्टि और रचनात्मक/व्यावसायिक संकेतों के आधार पर ` +
      `${primaryCareer.name} सबसे प्रमुख करियर क्षेत्र के रूप में उभरता है। `;
  }

  if (reasons.length) {
    text += `मुख्य कारण: ${reasons
      .slice(0, 4)
      .join("; ")}। `;
  }

  if (topCareers?.length > 1) {
    text +=
      `अन्य मजबूत संभावनाएँ: ${topCareers
        .slice(1, 4)
        .map(item => `${item.name} (${item.score})`)
        .join(", ")}।`;
  }

  return text;
}

// ============================================================
// BACKWARD-COMPATIBLE DOMAIN EVALUATOR
// ============================================================

function evaluateCareerDomain(
  tenthHouseSign,
  tenthLord,
  planetsIn10th = [],
  aspects = {},
  saturnLagna = false,
  amatyakaraka = null
) {
  /**
   * Kept only for backward compatibility.
   * Main career analysis should use analyzeCareer(chartData).
   */

  const influence = [];

  if (planetsIn10th.includes("Sun") || aspects.sunAspect) {
    influence.push("Sun");
  }

  if (planetsIn10th.includes("Moon") || aspects.moonAspect) {
    influence.push("Moon");
  }

  if (planetsIn10th.includes("Mars") || aspects.marsAspect) {
    influence.push("Mars");
  }

  if (
    planetsIn10th.includes("Mercury") ||
    aspects.mercuryAspect ||
    tenthLord === "Mercury"
  ) {
    influence.push("Mercury");
  }

  if (
    planetsIn10th.includes("Jupiter") ||
    aspects.jupiterAspect ||
    tenthLord === "Jupiter"
  ) {
    influence.push("Jupiter");
  }

  if (
    planetsIn10th.includes("Venus") ||
    aspects.venusAspect ||
    tenthLord === "Venus"
  ) {
    influence.push("Venus");
  }

  if (
    planetsIn10th.includes("Saturn") ||
    aspects.saturnAspect ||
    saturnLagna ||
    tenthLord === "Saturn"
  ) {
    influence.push("Saturn");
  }

  return {
    suggestedCareerType: "Multi-Domain Career",
    primaryDomain: "Requires Full Chart Scoring",
    recommendedFields: influence.flatMap(
      planet => PLANET_CAREER_TRAITS[planet] || []
    ),
    primaryInfluencingPlanet:
      amatyakaraka ||
      tenthLord ||
      influence[0] ||
      null
  };
}

// ============================================================
// MAIN ANALYZER
// ============================================================

function analyzeCareer(chartData) {
  if (!chartData?.ascendant || !chartData?.planets) {
    throw new Error(
      "Invalid chartData: ascendant and planets are required."
    );
  }

  const careers = initializeCareers();

  // --------------------------------------------------------
  // Main calculations
  // --------------------------------------------------------

  const tenthHouseSignIndex =
    getHouseSignIndex(chartData, 10);

  const tenthHouseSign =
    tenthHouseSignIndex !== null
      ? SIGN_NAMES[tenthHouseSignIndex]
      : null;

  const tenthLord =
    getHouseLord(chartData, 10);

  const tenthLordHouse =
    tenthLord
      ? getPlanetHouse(chartData, tenthLord)
      : null;

  // --------------------------------------------------------
  // Apply scoring modules
  // --------------------------------------------------------

  scorePlanetPlacement(
    chartData,
    careers
  );

  const houseLords = scoreHouseLords(
    chartData,
    careers
  );

  const tenthHouseAnalysis = scoreTenthHouse(
    chartData,
    careers
  );

  scoreConjunctions(
    chartData,
    careers
  );

  scorePublicVisibility(
    chartData,
    careers
  );

  scoreEighthHouse(
    chartData,
    careers
  );

  // --------------------------------------------------------
  // Amatyakaraka
  // --------------------------------------------------------

  const charaKaraka =
    calculateSimpleAmatyakaraka(chartData);

  scoreAmatyakaraka(
    charaKaraka.amatyakaraka,
    careers
  );

  // --------------------------------------------------------
  // Normalize
  // --------------------------------------------------------

  const rankedCareers =
    normalizeScores(careers);

  const topCareers =
    rankedCareers.slice(0, 5);

  const primaryCareer =
    topCareers[0] || null;

  // --------------------------------------------------------
  // Dignities
  // --------------------------------------------------------

  const dignity = {};

  for (const planetName of Object.keys(
    chartData.planets
  )) {
    if (
      ["Rahu", "Ketu"].includes(planetName)
    ) {
      continue;
    }

    dignity[planetName] =
      getPlanetDignity(
        chartData,
        planetName
      );
  }

  // --------------------------------------------------------
  // Summary
  // --------------------------------------------------------

  const summaryAnalysis =
    generateCareerSummary(
      chartData,
      primaryCareer,
      tenthLord,
      tenthLordHouse,
      topCareers
    );

  return {
    tenthHouse: {
      houseNumber: 10,

      signIndex: tenthHouseSignIndex,

      sign: tenthHouseSign,

      lord: tenthLord,

      lordHouse: tenthLordHouse,

      planets:
        tenthHouseAnalysis.planetsIn10th,

      aspects:
        tenthHouseAnalysis.aspects
    },

    houseLords,

    charaKaraka,

    primaryCareer: primaryCareer
      ? {
          name: primaryCareer.name,
          domain: primaryCareer.domain,
          score: primaryCareer.score,
          rawScore: primaryCareer.rawScore,
          influencingPlanets:
            primaryCareer.influencingPlanets,
          reasons:
            primaryCareer.reasons
        }
      : null,

    topCareers,

    allCareerScores:
      rankedCareers,

    dignity,

    indicators: primaryCareer
      ? primaryCareer.reasons
      : [],

    suggestedCareerType:
      primaryCareer?.name || null,

    primaryDomain:
      primaryCareer?.domain || null,

    recommendedFields:
      topCareers.map(item => item.name),

    primaryInfluencingPlanet:
      primaryCareer?.influencingPlanets?.[0] ||
      tenthLord ||
      null,

    summaryAnalysis
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  analyzeCareer,

  calculateAspectsOn10th,

  evaluateCareerDomain,

  getAspectsOnHouse,

  planetAspectsHouse,

  getAspectDistance,

  getAspectType,

  getPlanetDignity,

  calculateSimpleAmatyakaraka,

  getHouseLord,

  getPlanetsInHouse
};