/**
 * D4 Dasha Timing Engine
 * ----------------------
 * IMPORTANT: No D1 Dasha/Vimshottari module was available in the project,
 * so this module computes Vimshottari Mahadasha independently from the
 * Moon's sidereal longitude (totalDegree) supplied by the D1 raw report.
 *
 * Scope & assumptions (please review):
 * - Only MAHADASHA (main period) is computed. Antardasha (sub-period) is
 *   NOT computed in this version — can be added later if needed.
 * - 1 dasha "year" = 365.25 days (standard approximation used by most
 *   Vimshottari calculators). Some software uses 365.2425 (solar year);
 *   difference is a few hours per year, immaterial for mahadasha-level view.
 * - Sequence projected 120 years forward from birth (the full Vimshottari
 *   cycle), starting from the balance of the dasha running at birth.
 */

const NAKSHATRA_SPAN = 360 / 27; // 13.3333...

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const DASHA_YEARS = Object.freeze({
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
});

const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

function addYears(date, years) {
  return new Date(date.getTime() + years * YEAR_IN_MS);
}

/**
 * Computes the full Vimshottari Mahadasha sequence for ~120 years from birth.
 * @param {number} moonTotalDegree - Moon's sidereal longitude (0-360)
 * @param {string} birthDateISO - birth timestamp (UTC ISO string) or date
 * @returns {Array<{planet, years, startDate, endDate}>}
 */
function computeMahadashaSequence(moonTotalDegree, birthDateISO) {
  if (moonTotalDegree === undefined || moonTotalDegree === null) {
    throw new Error('moonTotalDegree is required to compute Vimshottari Dasha.');
  }
  if (!birthDateISO) {
    throw new Error('birthDateISO is required to compute Vimshottari Dasha.');
  }

  const birthDate = new Date(birthDateISO);
  if (isNaN(birthDate.getTime())) {
    throw new Error(`Invalid birthDateISO: ${birthDateISO}`);
  }

  const normalizedDegree = ((moonTotalDegree % 360) + 360) % 360;

  const nakshatraIndex = Math.floor(normalizedDegree / NAKSHATRA_SPAN); // 0-26
  const lordIndex = nakshatraIndex % 9;
  const degreeIntoNakshatra = normalizedDegree - nakshatraIndex * NAKSHATRA_SPAN;
  const fractionElapsed = degreeIntoNakshatra / NAKSHATRA_SPAN;

  const firstLord = DASHA_ORDER[lordIndex];
  const firstLordFullYears = DASHA_YEARS[firstLord];
  const balanceYears = firstLordFullYears * (1 - fractionElapsed);

  const sequence = [];
  let cursorDate = birthDate;
  let totalYears = 0;

  // First (running-at-birth) period — only the balance portion
  const firstEnd = addYears(cursorDate, balanceYears);
  sequence.push({
    planet: firstLord,
    years: Number(balanceYears.toFixed(2)),
    isBalanceOfBirthDasha: true,
    startDate: cursorDate.toISOString().slice(0, 10),
    endDate: firstEnd.toISOString().slice(0, 10)
  });
  cursorDate = firstEnd;
  totalYears += balanceYears;

  let idx = (lordIndex + 1) % 9;
  while (totalYears < 120) {
    const planet = DASHA_ORDER[idx];
    const years = DASHA_YEARS[planet];
    const end = addYears(cursorDate, years);
    sequence.push({
      planet,
      years,
      isBalanceOfBirthDasha: false,
      startDate: cursorDate.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    });
    cursorDate = end;
    totalYears += years;
    idx = (idx + 1) % 9;
  }

  return sequence;
}

/**
 * Tags each Mahadasha period with its relevance to D4 property matters and
 * produces a human-readable timeline for property/vehicle/home acquisition.
 *
 * Relevance rules (heuristic, Parashari-inspired, not a deterministic prediction):
 * - Planet is the D4 4th Lord → strong relevance
 * - Planet occupies D4 4th house → strong relevance
 * - Planet is a natural property karaka (Mars=land, Saturn=permanent assets,
 *   Venus=vehicle/comfort, Mercury=documentation/transaction) → moderate relevance
 * - Otherwise → low/background relevance
 */
function buildDashaPropertyTimeline(mahadashaSequence, d4ChartData) {
  const { houseOccupancy = {}, planetCalculations = {} } = d4ChartData || {};

  const fourthHouseOccupants = houseOccupancy[4] || [];
  const fourthLordEntry = Object.values(planetCalculations).find(
    p => Number(p.house) === 4 || p.d4Lord // fallback below
  );

  // Determine 4th lord planet name via sign lordship already computed elsewhere;
  // safer: derive it the same way d4AdvancedRules does, by checking which planet
  // RULES the D4 4th house sign. We reconstruct it from planetCalculations' d4Lord
  // field of whichever planet's d4SignId equals the 4th house sign — but since we
  // don't have direct signId->house mapping here, fall back to a simple search:
  // a planet counts as "4th lord" if any planetCalculations entry references it
  // via the fourthLordDetails computed upstream (passed in via d4ChartData if present).
  const fourthLordName = d4ChartData?.fourthLordName || null;

  const PROPERTY_KARAKAS = {
    Mars: 'भूमि/निर्माण (land & construction)',
    Saturn: 'स्थायी संपत्ति/विलंबित लाभ (permanent assets, delayed gains)',
    Venus: 'वाहन/सुख-सुविधा (vehicle & comforts)',
    Mercury: 'दस्तावेज़/लेन-देन (documentation & transactions)'
  };

  const timeline = mahadashaSequence.map(period => {
    const { planet } = period;
    let relevance = 'low';
    const reasons = [];

    if (fourthLordName && planet === fourthLordName) {
      relevance = 'high';
      reasons.push('यह ग्रह D4 चतुर्थेश है — property-related events की संभावना बढ़ जाती है।');
    }
    if (fourthHouseOccupants.includes(planet)) {
      relevance = 'high';
      reasons.push('यह ग्रह D4 चतुर्थ भाव में स्थित है।');
    }
    if (PROPERTY_KARAKAS[planet] && relevance !== 'high') {
      relevance = 'moderate';
      reasons.push(`यह ग्रह property का natural karaka है: ${PROPERTY_KARAKAS[planet]}.`);
    }

    return {
      ...period,
      relevance,
      reasons,
      note:
        reasons.length > 0
          ? reasons.join(' ')
          : 'इस दशा में property-matters सामान्यतः secondary/background रहते हैं।'
    };
  });

  const favorableWindows = timeline.filter(t => t.relevance === 'high');
  const moderateWindows = timeline.filter(t => t.relevance === 'moderate');

  return {
    disclaimer:
      'यह केवल Mahadasha (main period) स्तर की timing है, Antardasha (sub-period) शामिल नहीं है। ' +
      'Dasha timing हमेशा transit और अन्य dasha layers के साथ मिलाकर देखी जानी चाहिए।',
    fullTimeline: timeline,
    favorableWindows: favorableWindows.map(w => ({
      planet: w.planet, startDate: w.startDate, endDate: w.endDate, note: w.note
    })),
    moderateWindows: moderateWindows.map(w => ({
      planet: w.planet, startDate: w.startDate, endDate: w.endDate, note: w.note
    })),
    summary:
      favorableWindows.length > 0
        ? `Property-related matters के लिए सबसे अधिक सक्रिय दशा अवधि: ${favorableWindows
            .map(w => `${w.planet} (${w.startDate} से ${w.endDate})`)
            .join(', ')}.`
        : 'D4 चतुर्थेश या चतुर्थ भाव से सीधे जुड़ी कोई प्रमुख दशा अवधि नहीं मिली; natural karaka periods देखें।'
  };
}

module.exports = {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildDashaPropertyTimeline
};