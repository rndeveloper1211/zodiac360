// backend/src/engine/D1/d1Dasha.js
//
// विंशोत्तरी महादशा (Vimshottari Mahadasha) एवं अंतर्दशा (Antardasha) कैलकुलेटर।
// यह चंद्रमा की sidereal longitude (0-360°, D1.engine.js से मिलने वाला totalDegree)
// और जन्म-तिथि (UTC) के आधार पर पूरी 120-वर्षीय दशा-तालिका बनाता है, और किसी भी
// तारीख (डिफ़ॉल्ट: आज) पर चल रही महादशा/अंतर्दशा निकालता है।
//
// यह मॉड्यूल किसी भी बाहरी फाइल (जैसे config/constants) पर निर्भर नहीं है,
// इसलिए इसे स्वतंत्र रूप से इस्तेमाल किया जा सकता है।

const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

// विंशोत्तरी क्रम - यह 9 ग्रहों का चक्र 3 बार दोहराकर 27 नक्षत्रों को कवर करता है
const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const NAKSHATRA_SPAN = 360 / 27; // 13.3333... डिग्री प्रति नक्षत्र
const YEAR_DAYS = 365.2425; // ज्योतिषीय वर्ष (सामान्य सौर वर्ष के करीब)
const TOTAL_CYCLE_YEARS = 99;

function normalizeDegree(deg) {
  return ((deg % 360) + 360) % 360;
}

function addYears(date, years) {
  return new Date(date.getTime() + years * YEAR_DAYS * 86400000);
}

// चंद्रमा की राशि-डिग्री से नक्षत्र इंडेक्स (0-26) व उसमें बीता हुआ प्रतिशत निकालना
function getNakshatraProgress(moonSiderealLongitude) {
  const norm = normalizeDegree(moonSiderealLongitude);
  const nakshatraIndex = Math.floor(norm / NAKSHATRA_SPAN);
  const elapsedInNakshatra = norm - nakshatraIndex * NAKSHATRA_SPAN;
  const elapsedFraction = elapsedInNakshatra / NAKSHATRA_SPAN;
  return { nakshatraIndex, elapsedFraction };
}

/**
 * जन्म-तिथि (UTC Date object) व चंद्रमा की sidereal longitude से
 * पूरी विंशोत्तरी महादशा-तालिका (99 वर्ष) तैयार करना।
 */
function calculateVimshottariDasha(birthDateUtc, moonSiderealLongitude, yearsToProject = TOTAL_CYCLE_YEARS) {
  if (!birthDateUtc || moonSiderealLongitude === undefined || moonSiderealLongitude === null) {
    return { available: false, reason: 'birthDateUtc और moonSiderealLongitude दोनों आवश्यक हैं।' };
  }
  if (isNaN(new Date(birthDateUtc).getTime())) {
    return { available: false, reason: 'birthDateUtc मान्य तारीख नहीं है।' };
  }

  const { nakshatraIndex, elapsedFraction } = getNakshatraProgress(moonSiderealLongitude);
  const startLordIndex = nakshatraIndex % 9;

  const sequence = [];
  let cursorDate = new Date(birthDateUtc);

  // जन्मकालीन (पहली) महादशा - नक्षत्र में शेष बचे अंश (balance) के अनुसार
  const firstLord = DASHA_ORDER[startLordIndex];
  const firstLordFullYears = DASHA_YEARS[firstLord];
  const remainingFraction = 1 - elapsedFraction;
  const firstLordBalanceYears = firstLordFullYears * remainingFraction;

  let endDate = addYears(cursorDate, firstLordBalanceYears);
  sequence.push({
    lord: firstLord,
    startDate: cursorDate.toISOString(),
    endDate: endDate.toISOString(),
    years: parseFloat(firstLordBalanceYears.toFixed(4)),
    isBalanceOfBirth: true
  });
  cursorDate = endDate;

  // शेष सभी पूर्ण महादशाएं क्रमानुसार जोड़ना
  let idx = (startLordIndex + 1) % 9;
  let totalYearsCovered = firstLordBalanceYears;

  while (totalYearsCovered < yearsToProject) {
    const lord = DASHA_ORDER[idx];
    const years = DASHA_YEARS[lord];
    endDate = addYears(cursorDate, years);
    sequence.push({
      lord,
      startDate: cursorDate.toISOString(),
      endDate: endDate.toISOString(),
      years,
      isBalanceOfBirth: false
    });
    cursorDate = endDate;
    totalYearsCovered += years;
    idx = (idx + 1) % 9;
  }

  return {
    available: true,
    nakshatraIndex,
    startingLord: firstLord,
    balanceYearsAtBirth: parseFloat(firstLordBalanceYears.toFixed(4)),
    mahadashaSequence: sequence
  };
}

/**
 * किसी दी गई तारीख (डिफ़ॉल्ट: अभी) पर चल रही महादशा व अंतर्दशा निकालना।
 */
function getCurrentDasha(dashaData, atDate = new Date()) {
  if (!dashaData?.available) return null;
  const target = new Date(atDate).getTime();

  const currentMahadasha = dashaData.mahadashaSequence.find(md => {
    const start = new Date(md.startDate).getTime();
    const end = new Date(md.endDate).getTime();
    return target >= start && target < end;
  });

  if (!currentMahadasha) return null;

  // अंतर्दशा: महादशा अवधि को उसी विंशोत्तरी क्रम में, ग्रहों के वर्ष के अनुपात में बांटना
  const mdStart = new Date(currentMahadasha.startDate).getTime();
  const mdEnd = new Date(currentMahadasha.endDate).getTime();
  const mdTotalDays = (mdEnd - mdStart) / 86400000;

  const startIdx = DASHA_ORDER.indexOf(currentMahadasha.lord);
  let cursor = mdStart;
  let currentAntardasha = null;

  for (let i = 0; i < 9; i++) {
    const adLord = DASHA_ORDER[(startIdx + i) % 9];
    const adYears = DASHA_YEARS[adLord];
    const adDays = mdTotalDays * (adYears / TOTAL_CYCLE_YEARS);
    const adEnd = cursor + adDays * 86400000;

    if (target >= cursor && target < adEnd) {
      currentAntardasha = {
        lord: adLord,
        startDate: new Date(cursor).toISOString(),
        endDate: new Date(adEnd).toISOString()
      };
      break;
    }
    cursor = adEnd;
  }

  return {
    current: {
      lord: currentMahadasha.lord,
      startDate: currentMahadasha.startDate,
      endDate: currentMahadasha.endDate
    },
    antardasha: currentAntardasha
  };
}

module.exports = {
  calculateVimshottariDasha,
  getCurrentDasha,
  DASHA_YEARS,
  DASHA_ORDER
};
