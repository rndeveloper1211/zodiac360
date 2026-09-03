// E:/zodiac360/backend/src/engine/D2/d2ChartEngine.js

/**
 * ============================================================
 * D2 / HORA CHART ENGINE
 * ============================================================
 *
 * Parashari Hora Rules
 *
 * Odd Signs:
 *   0°00' - 14°59'  -> Sun Hora  -> Leo (5)
 *   15°00' - 29°59' -> Moon Hora -> Cancer (4)
 *
 * Even Signs:
 *   0°00' - 14°59'  -> Moon Hora -> Cancer (4)
 *   15°00' - 29°59' -> Sun Hora  -> Leo (5)
 *
 * Sign IDs:
 *   Aries      = 1
 *   Taurus     = 2
 *   Gemini     = 3
 *   Cancer     = 4
 *   Leo        = 5
 *   Virgo      = 6
 *   Libra      = 7
 *   Scorpio    = 8
 *   Sagittarius= 9
 *   Capricorn  = 10
 *   Aquarius   = 11
 *   Pisces     = 12
 *
 * D2 contains only:
 *   Sun Hora  -> Leo
 *   Moon Hora -> Cancer
 * ============================================================
 */

const SIGN_NAMES = {
  1: "Aries",
  2: "Taurus",
  3: "Gemini",
  4: "Cancer",
  5: "Leo",
  6: "Virgo",
  7: "Libra",
  8: "Scorpio",
  9: "Sagittarius",
  10: "Capricorn",
  11: "Aquarius",
  12: "Pisces"
};

const HORA_DETAILS = {
  Sun: {
    horaLord: "Sun",
    signId: 5,
    signName: "Leo",
    element: "Fire"
  },

  Moon: {
    horaLord: "Moon",
    signId: 4,
    signName: "Cancer",
    element: "Water"
  }
};


/**
 * ------------------------------------------------------------
 * Normalize degree
 * ------------------------------------------------------------
 *
 * Ensures degree is always within:
 *   0 <= degree < 30
 */
function normalizeDegree(degree) {
  const value = Number(degree);

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid degreeInSign: ${degree}`);
  }

  // Handle possible 30.000000 floating point values
  if (value >= 30) {
    return value % 30;
  }

  if (value < 0) {
    return ((value % 30) + 30) % 30;
  }

  return value;
}


/**
 * ------------------------------------------------------------
 * Validate Sign
 * ------------------------------------------------------------
 */
function validateSignId(signId) {
  const sign = Number(signId);

  if (!Number.isInteger(sign) || sign < 1 || sign > 12) {
    throw new Error(`Invalid signId: ${signId}. Expected 1-12.`);
  }

  return sign;
}


/**
 * ------------------------------------------------------------
 * Get Hora
 * ------------------------------------------------------------
 *
 * @param {number} signId
 * @param {number} degreeInSign
 *
 * @returns "Sun" | "Moon"
 */
function getHoraSign(signId, degreeInSign) {
  const sign = validateSignId(signId);
  const degree = normalizeDegree(degreeInSign);

  const isOddSign = sign % 2 !== 0;

  if (isOddSign) {
    // Odd sign
    return degree < 15 ? "Sun" : "Moon";
  }

  // Even sign
  return degree < 15 ? "Moon" : "Sun";
}


/**
 * ------------------------------------------------------------
 * Get complete Hora information
 * ------------------------------------------------------------
 */
function getHoraDetails(signId, degreeInSign) {
  const hora = getHoraSign(signId, degreeInSign);
  const degree = normalizeDegree(degreeInSign);

  const isOddSign = Number(signId) % 2 !== 0;

  let half;

  if (degree < 15) {
    half = "first";
  } else {
    half = "second";
  }

  return {
    hora,
    horaLord: HORA_DETAILS[hora].horaLord,

    sourceSignId: Number(signId),
    sourceSignName: SIGN_NAMES[Number(signId)],

    degreeInSign: degree,

    half,
    halfStartDegree: half === "first" ? 0 : 15,
    halfEndDegree: half === "first" ? 15 : 30,

    isOddSign,

    d2SignId: HORA_DETAILS[hora].signId,
    d2SignName: HORA_DETAILS[hora].signName,

    element: HORA_DETAILS[hora].element
  };
}


/**
 * ------------------------------------------------------------
 * Calculate D2 Positions
 * ------------------------------------------------------------
 */
function calculateD2Positions(rawData) {
  if (!rawData || typeof rawData !== "object") {
    throw new Error("D2 Calculation Failed: rawData is required.");
  }

  if (!rawData.lagna) {
    throw new Error("D2 Calculation Failed: Lagna data is missing.");
  }

  if (!rawData.grahas || typeof rawData.grahas !== "object") {
    throw new Error("D2 Calculation Failed: Grahas data is missing.");
  }


  // ==========================================================
  // LAGNA
  // ==========================================================

  const lagnaHoraDetails = getHoraDetails(
    rawData.lagna.signId,
    rawData.lagna.degreeInSign
  );


  // ==========================================================
  // HORA PLACEMENTS
  // ==========================================================

  const horaPlacements = {
    Sun: [],
    Moon: []
  };


  // ==========================================================
  // PLANET CALCULATIONS
  // ==========================================================

  const planetCalculations = {};


  for (const [planet, pData] of Object.entries(rawData.grahas)) {

    if (!pData) {
      continue;
    }

    if (
      pData.signId === undefined ||
      pData.degreeInSign === undefined
    ) {
      throw new Error(
        `D2 Calculation Failed: Invalid data for planet ${planet}.`
      );
    }


    const horaDetails = getHoraDetails(
      pData.signId,
      pData.degreeInSign
    );


    horaPlacements[horaDetails.hora].push(planet);


    planetCalculations[planet] = {
      planet,

      // D1 position
      d1SignId: horaDetails.sourceSignId,
      d1SignName: horaDetails.sourceSignName,
      d1DegreeInSign: horaDetails.degreeInSign,

      // Hora
      hora: horaDetails.hora,
      horaLord: horaDetails.horaLord,

      horaHalf: horaDetails.half,
      horaStartDegree: horaDetails.halfStartDegree,
      horaEndDegree: horaDetails.halfEndDegree,

      // D2 position
      d2SignId: horaDetails.d2SignId,
      d2SignName: horaDetails.d2SignName,

      element: horaDetails.element
    };
  }


  // ==========================================================
  // PLANET COUNTS
  // ==========================================================

  const horaCounts = {
    Sun: horaPlacements.Sun.length,
    Moon: horaPlacements.Moon.length
  };


  // ==========================================================
  // D2 CHART
  // ==========================================================

  const d2Chart = {
    4: {
      signId: 4,
      signName: "Cancer",
      lord: "Moon",
      planets: [...horaPlacements.Moon]
    },

    5: {
      signId: 5,
      signName: "Leo",
      lord: "Sun",
      planets: [...horaPlacements.Sun]
    }
  };


  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  return {
    chartType: "D2",
    chartName: "Hora",

    lagna: {
      d1SignId: Number(rawData.lagna.signId),
      d1SignName: SIGN_NAMES[Number(rawData.lagna.signId)],
      degreeInSign: normalizeDegree(rawData.lagna.degreeInSign),

      hora: lagnaHoraDetails.hora,
      horaLord: lagnaHoraDetails.horaLord,

      d2SignId: lagnaHoraDetails.d2SignId,
      d2SignName: lagnaHoraDetails.d2SignName
    },

    lagnaHora: lagnaHoraDetails.hora,

    horaPlacements,

    horaCounts,

    planetCalculations,

    d2Chart
  };
}


module.exports = {
  SIGN_NAMES,
  HORA_DETAILS,
  getHoraSign,
  getHoraDetails,
  calculateD2Positions
};
