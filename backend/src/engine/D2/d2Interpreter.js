// E:/zodiac360/backend/src/engine/D2/d2Interpreter.js

/**
 * ============================================================
 * D2 / HORA CHART INTERPRETER
 * ============================================================
 *
 * Works with d2ChartEngine.js
 *
 * Engine output:
 *   lagnaHora
 *   horaPlacements
 *   horaCounts
 *   planetCalculations
 *   d2Chart
 *
 * Hora:
 *   Sun  -> Leo
 *   Moon -> Cancer
 * ============================================================
 */

const {
  HORA_DETAILS
} = require("./d2ChartEngine");

const {
  PLANET_IN_HORA
} = require("./d2Rules");


/**
 * ------------------------------------------------------------
 * Get Hindi Hora Name
 * ------------------------------------------------------------
 */
function getHoraHindi(hora) {
  const hindiNames = {
    Sun: "सूर्य होरा",
    Moon: "चंद्र होरा"
  };

  return hindiNames[hora] || hora;
}


/**
 * ------------------------------------------------------------
 * Get Hora Nature
 * ------------------------------------------------------------
 */
function getHoraNature(hora) {
  const nature = {
    Sun: "सूर्य प्रधान",
    Moon: "चंद्र प्रधान"
  };

  return nature[hora] || "";
}


/**
 * ------------------------------------------------------------
 * Get Wealth Style
 * ------------------------------------------------------------
 */
function getWealthStyle(hora) {
  const wealthStyle = {
    Sun:
      "धन कमाने में व्यक्तिगत प्रयास, नेतृत्व, आत्मनिर्भरता, निर्णय क्षमता और सक्रिय कार्यशैली महत्वपूर्ण रहती है।",

    Moon:
      "धन के मामले में बचत, संचय, सुरक्षा, पारिवारिक सहयोग और धीरे-धीरे पूंजी बनाने की प्रवृत्ति महत्वपूर्ण रहती है।"
  };

  return wealthStyle[hora] || "";
}


/**
 * ------------------------------------------------------------
 * Get Planet Hora Impact
 * ------------------------------------------------------------
 *
 * Supports both:
 *
 * PLANET_IN_HORA = {
 *   Sun: {
 *     SunHora: "...",
 *     MoonHora: "..."
 *   }
 * }
 *
 * and:
 *
 * PLANET_IN_HORA = {
 *   Sun: {
 *     Sun: "...",
 *     Moon: "..."
 *   }
 * }
 * ------------------------------------------------------------
 */
function getPlanetHoraImpact(planet, hora) {
  const planetRule = PLANET_IN_HORA?.[planet];

  if (!planetRule) {
    return "";
  }

  // Preferred naming
  if (hora === "Sun" && planetRule.SunHora) {
    return planetRule.SunHora;
  }

  if (hora === "Moon" && planetRule.MoonHora) {
    return planetRule.MoonHora;
  }

  // Fallback naming
  if (planetRule[hora]) {
    return planetRule[hora];
  }

  return "";
}


/**
 * ------------------------------------------------------------
 * Build D1 Placement
 * ------------------------------------------------------------
 */
function getD1Placement(planet, data, rawData) {
  const rawPlanet = rawData?.grahas?.[planet];

  const signName =
    data.d1SignName ||
    rawPlanet?.signHindi ||
    rawPlanet?.signName ||
    "";

  const degree =
    data.d1DegreeInSign ??
    rawPlanet?.degreeInSign ??
    null;

  if (degree === null) {
    return signName;
  }

  return `${signName} (${degree}°)`;
}


/**
 * ============================================================
 * MAIN INTERPRETER
 * ============================================================
 */
function interpretD2Chart(calcResult, rawData = {}) {

  if (!calcResult || typeof calcResult !== "object") {
    throw new Error(
      "D2 Interpretation Failed: calcResult is required."
    );
  }


  const {
    lagnaHora,
    horaPlacements = {
      Sun: [],
      Moon: []
    },
    horaCounts = {
      Sun: 0,
      Moon: 0
    },
    planetCalculations = {},
    d2Chart = {}
  } = calcResult;


  // ==========================================================
  // 1. LAGNA ANALYSIS
  // ==========================================================

  const lagnaDetails =
    HORA_DETAILS[lagnaHora] || null;


  const lagnaAnalysis = {

    lagnaHora: getHoraHindi(lagnaHora),

    horaLord:
      lagnaDetails?.horaLord ||
      lagnaHora ||
      "",

    d2SignId:
      lagnaDetails?.signId ??
      null,

    d2SignName:
      lagnaDetails?.signName ||
      "",

    nature:
      getHoraNature(lagnaHora),

    wealthStyle:
      getWealthStyle(lagnaHora)
  };


  // ==========================================================
  // 2. EACH PLANET ANALYSIS
  // ==========================================================

  const detailedPlanetaryAnalysis = {};


  for (const [planet, data] of Object.entries(planetCalculations)) {

    if (!data) {
      continue;
    }


    // IMPORTANT:
    // d2ChartEngine.js uses `hora`, NOT `assignedHora`
    const hora = data.hora;


    const impactText =
      getPlanetHoraImpact(
        planet,
        hora
      );


    detailedPlanetaryAnalysis[planet] = {

      planet,

      // -------------------------
      // D1
      // -------------------------

      d1Placement:
        getD1Placement(
          planet,
          data,
          rawData
        ),

      d1SignId:
        data.d1SignId ?? null,

      d1SignName:
        data.d1SignName || "",

      d1DegreeInSign:
        data.d1DegreeInSign ?? null,


      // -------------------------
      // Hora
      // -------------------------

      hora,

      assignedHora:
        hora,

      horaHindi:
        getHoraHindi(hora),

      horaLord:
        data.horaLord || hora,

      horaHalf:
        data.horaHalf || "",

      horaStartDegree:
        data.horaStartDegree ?? null,

      horaEndDegree:
        data.horaEndDegree ?? null,


      // -------------------------
      // D2
      // -------------------------

      d2SignId:
        data.d2SignId ?? null,

      d2SignName:
        data.d2SignName || "",


      // -------------------------
      // Interpretation
      // -------------------------

      financialImpact:
        impactText
    };
  }


  // ==========================================================
  // 3. HORA COUNTS
  // ==========================================================

  const sunCount =
    Number.isFinite(horaCounts.Sun)
      ? horaCounts.Sun
      : horaPlacements.Sun.length;


  const moonCount =
    Number.isFinite(horaCounts.Moon)
      ? horaCounts.Moon
      : horaPlacements.Moon.length;


  // ==========================================================
  // 4. WEALTH SYNTHESIS
  // ==========================================================

  let wealthDominance;
  let wealthDominanceKey;


  if (sunCount > moonCount) {

    wealthDominanceKey = "Sun";

    wealthDominance =
      "आपकी D2 कुंडली में सूर्य होरा अधिक सक्रिय है। धन निर्माण में व्यक्तिगत प्रयास, आत्मनिर्भरता, नेतृत्व, निर्णय क्षमता और सक्रिय कार्यशैली की भूमिका अधिक दिखाई देती है।";

  } else if (moonCount > sunCount) {

    wealthDominanceKey = "Moon";

    wealthDominance =
      "आपकी D2 कुंडली में चंद्र होरा अधिक सक्रिय है। धन के मामले में बचत, संचय, सुरक्षा, पारिवारिक सहयोग और धीरे-धीरे पूंजी बनाने की प्रवृत्ति अधिक महत्वपूर्ण दिखाई देती है।";

  } else {

    wealthDominanceKey = "Balanced";

    wealthDominance =
      "आपकी D2 कुंडली में सूर्य और चंद्र होरा का संतुलन है। इससे धन कमाने और धन को सुरक्षित रखने एवं संचय करने, दोनों पक्षों पर संतुलित दृष्टिकोण दिखाई देता है।";
  }


  // ==========================================================
  // 5. D2 SIGN SYNTHESIS
  // ==========================================================

  const cancerPlanets =
    d2Chart?.[4]?.planets ||
    horaPlacements.Moon ||
    [];


  const leoPlanets =
    d2Chart?.[5]?.planets ||
    horaPlacements.Sun ||
    [];


  // ==========================================================
  // 6. FINAL RESULT
  // ==========================================================

  return {

    chartType:
      calcResult.chartType || "D2",

    chartName:
      calcResult.chartName || "Hora",


    // --------------------------------------------------------
    // Lagna
    // --------------------------------------------------------

    lagnaAnalysis,


    // --------------------------------------------------------
    // Wealth
    // --------------------------------------------------------

    wealthSynthesis: {

      overallOrientation:
        wealthDominance,

      dominance:
        wealthDominanceKey,

      sunHoraCount:
        sunCount,

      moonHoraCount:
        moonCount,

      totalPlanets:
        sunCount + moonCount,

      sunHoraPlanets:
        [...horaPlacements.Sun],

      moonHoraPlanets:
        [...horaPlacements.Moon]
    },


    // --------------------------------------------------------
    // D2 Houses / Signs
    // --------------------------------------------------------

    d2SignAnalysis: {

      cancer: {
        signId: 4,
        signName: "Cancer",
        horaLord: "Moon",
        planets: [...cancerPlanets]
      },

      leo: {
        signId: 5,
        signName: "Leo",
        horaLord: "Sun",
        planets: [...leoPlanets]
      }
    },


    // --------------------------------------------------------
    // Planet-wise
    // --------------------------------------------------------

    detailedPlanetaryAnalysis,


    // --------------------------------------------------------
    // Raw calculation data
    // Useful for frontend
    // --------------------------------------------------------

    horaPlacements: {
      Sun: [...horaPlacements.Sun],
      Moon: [...horaPlacements.Moon]
    },

    horaCounts: {
      Sun: sunCount,
      Moon: moonCount
    }
  };
}


module.exports = {
  interpretD2Chart
};