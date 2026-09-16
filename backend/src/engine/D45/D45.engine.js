/**
 * D45 (Akshavedamsha) calculation engine.
 *
 * Source position: sidereal D1 longitude (0..360), reused from the
 * project's existing D1 engine — no new ephemeris is calculated here.
 *
 * Parashari Akshavedamsha (45th divisional chart) rule (BPHS):
 * Each sign (30°) is divided into 45 equal parts of 0°40' (0.6666..°) each.
 *   - Movable / chara sign (Aries, Cancer, Libra, Capricorn):
 *       reckoning of the 45 parts starts from Aries.
 *   - Fixed / sthira sign (Taurus, Leo, Scorpio, Aquarius):
 *       reckoning of the 45 parts starts from Leo.
 *   - Dual / dvisvabhava sign (Gemini, Virgo, Sagittarius, Pisces):
 *       reckoning of the 45 parts starts from Sagittarius.
 * The part the planet falls in decides the D45 sign.
 *
 * NOTE: this reckoning rule differs from D40's odd/even scheme. It is
 * modality-based (chara/sthira/dvisvabhava), not parity-based — do not
 * port the D40 branch here.
 *
 * Classical usage: Parashara lists Akshavedamsha under "sarva" — overall
 * character and conduct (sheela / achara). Several living traditions also
 * read it for inherited paternal-lineage samskaras; both framings are
 * carried in the interpretation layer.
 *
 * PRECISION WARNING: one D45 part is 40 arc-minutes wide. The ascendant
 * moves roughly 1° every 4 minutes of clock time, so the D45 Lagna can
 * change about every 2 min 40 s. Results are only as trustworthy as the
 * recorded birth time — see README for the `timeSensitivity` block.
 */

const SIGNS = [
  { id: 1, name: 'Aries', hindi: 'मेष', lord: 'Mars' },
  { id: 2, name: 'Taurus', hindi: 'वृषभ', lord: 'Venus' },
  { id: 3, name: 'Gemini', hindi: 'मिथुन', lord: 'Mercury' },
  { id: 4, name: 'Cancer', hindi: 'कर्क', lord: 'Moon' },
  { id: 5, name: 'Leo', hindi: 'सिंह', lord: 'Sun' },
  { id: 6, name: 'Virgo', hindi: 'कन्या', lord: 'Mercury' },
  { id: 7, name: 'Libra', hindi: 'तुला', lord: 'Venus' },
  { id: 8, name: 'Scorpio', hindi: 'वृश्चिक', lord: 'Mars' },
  { id: 9, name: 'Sagittarius', hindi: 'धनु', lord: 'Jupiter' },
  { id: 10, name: 'Capricorn', hindi: 'मकर', lord: 'Saturn' },
  { id: 11, name: 'Aquarius', hindi: 'कुंभ', lord: 'Saturn' },
  { id: 12, name: 'Pisces', hindi: 'मीन', lord: 'Jupiter' }
];

const SEGMENT_SIZE = 30 / 45; // 0.6666..° = 0°40' per Akshavedamsha part
const SEGMENT_COUNT = 45;

const MOVABLE_START_SIGN_ID = 1;   // Aries  — for chara signs
const FIXED_START_SIGN_ID = 5;     // Leo    — for sthira signs
const DUAL_START_SIGN_ID = 9;      // Sagittarius — for dvisvabhava signs

// Deity (Brahma / Vishnu / Maheshwara) cycling across the 45 parts.
// 45 divides evenly into 3 × 15, so each deity rules exactly 15 parts.
// This is one documented convention; other traditions group the deities
// differently. Treat as this app's house rule, not the only valid scheme.
const DEITIES = ['Brahma', 'Vishnu', 'Maheshwara'];

function normalize360(deg) {
  const n = Number(deg);
  if (!Number.isFinite(n)) throw new TypeError(`Invalid longitude: ${deg}`);
  return ((n % 360) + 360) % 360;
}

function signFromLongitude(longitude) {
  const totalDegree = normalize360(longitude);
  const signId = Math.floor(totalDegree / 30) + 1;
  const degreeInSign = totalDegree - (signId - 1) * 30;
  return {
    signId,
    degreeInSign,
    sign: SIGNS[signId - 1].name,
    signHindi: SIGNS[signId - 1].hindi
  };
}

/**
 * Modality of a sign: 1 = movable/chara, 2 = fixed/sthira, 0 = dual/dvisvabhava.
 * signId 1,4,7,10 -> movable; 2,5,8,11 -> fixed; 3,6,9,12 -> dual.
 */
function getSignModality(signId) {
  const m = signId % 3;
  if (m === 1) return { modality: 'movable', modalitySanskrit: 'chara', startSignId: MOVABLE_START_SIGN_ID };
  if (m === 2) return { modality: 'fixed', modalitySanskrit: 'sthira', startSignId: FIXED_START_SIGN_ID };
  return { modality: 'dual', modalitySanskrit: 'dvisvabhava', startSignId: DUAL_START_SIGN_ID };
}

function getD45Segment(degreeInSign, signId) {
  const d = Number(degreeInSign);
  // Decimal-safe boundary policy: [start, end), 30° itself belongs to next sign (handled by caller normalize).
  let index = Math.floor(d / SEGMENT_SIZE);
  if (index > SEGMENT_COUNT - 1) index = SEGMENT_COUNT - 1; // guard for floating point edge at exactly 30°
  if (index < 0) index = 0;

  const { modality, modalitySanskrit, startSignId } = getSignModality(signId);
  const d45SignId = ((startSignId - 1 + index) % 12) + 1;

  return {
    segmentIndex: index,
    segmentNumber: index + 1, // 1..45, human-facing
    segmentStartDegree: Number((index * SEGMENT_SIZE).toFixed(8)),
    segmentEndDegree: Number(((index + 1) * SEGMENT_SIZE).toFixed(8)),
    sourceModality: modality,
    sourceModalitySanskrit: modalitySanskrit,
    reckoningStartSignId: startSignId,
    reckoningStartSign: SIGNS[startSignId - 1].name,
    deity: DEITIES[index % 3],
    d45SignId
  };
}

function calculateD45Position(totalSiderealDegree) {
  const d1 = signFromLongitude(totalSiderealDegree);
  const segment = getD45Segment(d1.degreeInSign, d1.signId);
  const d45Sign = SIGNS[segment.d45SignId - 1];

  return {
    d1SignId: d1.signId,
    d1Sign: d1.sign,
    d1SignHindi: d1.signHindi,
    degreeInD1Sign: Number(d1.degreeInSign.toFixed(8)),
    totalSiderealDegree: Number(normalize360(totalSiderealDegree).toFixed(8)),
    segmentIndex: segment.segmentIndex,
    segmentNumber: segment.segmentNumber,
    segmentStartDegree: segment.segmentStartDegree,
    segmentEndDegree: segment.segmentEndDegree,
    sourceModality: segment.sourceModality,
    sourceModalitySanskrit: segment.sourceModalitySanskrit,
    reckoningStartSign: segment.reckoningStartSign,
    deity: segment.deity,
    d45SignId: d45Sign.id,
    d45Sign: d45Sign.name,
    d45SignHindi: d45Sign.hindi,
    d45SignLord: d45Sign.lord
  };
}

/**
 * How far (in arc-minutes) the position sits from the nearest D45 segment
 * boundary, and the equivalent clock-time margin for a moving ascendant.
 * Lets the caller flag a reading that a 2-minute birth-time error would flip.
 */
function getBoundaryProximity(degreeInSign) {
  const d = Number(degreeInSign);
  const within = d - Math.floor(d / SEGMENT_SIZE) * SEGMENT_SIZE;
  const toStart = within;
  const toEnd = SEGMENT_SIZE - within;
  const nearestDeg = Math.min(toStart, toEnd);

  return {
    arcMinutesFromBoundary: Number((nearestDeg * 60).toFixed(2)),
    // Ascendant moves ~1° per 4 clock-minutes on average.
    approxClockMinutesFromBoundary: Number((nearestDeg * 4).toFixed(2))
  };
}

function calculateD45Chart(d1Chart) {
  if (!d1Chart || !d1Chart.lagna || !d1Chart.planets) {
    throw new Error('Valid D1 chart with lagna and planets is required for D45.');
  }

  const lagnaLongitude = d1Chart.lagna.totalDegree;
  if (lagnaLongitude === undefined || !Number.isFinite(Number(lagnaLongitude))) {
    throw new Error('D1 Lagna totalDegree is required for D45 calculation.');
  }

  const lagna = calculateD45Position(lagnaLongitude);
  const lagnaProximity = getBoundaryProximity(lagna.degreeInD1Sign);
  const planets = {};

  for (const [planetName, planet] of Object.entries(d1Chart.planets)) {
    const longitude = planet?.totalDegree;
    if (longitude === undefined || !Number.isFinite(Number(longitude))) {
      throw new Error(`D1 totalDegree missing for ${planetName}.`);
    }

    const d45 = calculateD45Position(longitude);
    const house = ((d45.d45SignId - lagna.d45SignId + 12) % 12) + 1;

    planets[planetName] = {
      planet: planetName,
      ...d45,
      house,
      isRetrograde: Boolean(planet.isRetrograde)
    };
  }

  const houses = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagna.d45SignId - 1 + house - 1) % 12) + 1;
    const sign = SIGNS[signId - 1];
    houses[house] = {
      houseNumber: house,
      signId,
      sign: sign.name,
      signHindi: sign.hindi,
      signLord: sign.lord,
      planets: []
    };
  }

  for (const [planetName, planet] of Object.entries(planets)) {
    houses[planet.house].planets.push({
      name: planetName,
      degreeInD1Sign: planet.degreeInD1Sign,
      d45Sign: planet.d45Sign,
      d45SignLord: planet.d45SignLord,
      deity: planet.deity
    });
  }

  return {
    chartType: 'D45',
    chartName: 'Akshavedamsha Chart',
    calculationSystem: 'Parashari Akshavedamsha',
    lagna: {
      ...lagna,
      house: 1
    },
    timeSensitivity: {
      segmentArcMinutes: 40,
      approxLagnaChangeMinutes: 2.67,
      lagnaArcMinutesFromBoundary: lagnaProximity.arcMinutesFromBoundary,
      lagnaApproxClockMinutesFromBoundary: lagnaProximity.approxClockMinutesFromBoundary,
      lagnaIsNearBoundary: lagnaProximity.approxClockMinutesFromBoundary < 2,
      note: 'Ek D45 khand 40 arc-minute ka hai, yaani Lagna lagbhag har 2 min 40 s mein badalta hai. Agar lagnaIsNearBoundary true hai to darj janm samay mein 1-2 minute ka farak bhi poora D45 Lagna badal dega — birth-time rectification ke bina is chart par akele bharosa na karein.'
    },
    houses,
    planets
  };
}

function processD45Chart(d1Chart) {
  return calculateD45Chart(d1Chart);
}

module.exports = {
  SIGNS,
  SEGMENT_SIZE,
  SEGMENT_COUNT,
  DEITIES,
  MOVABLE_START_SIGN_ID,
  FIXED_START_SIGN_ID,
  DUAL_START_SIGN_ID,
  normalize360,
  signFromLongitude,
  getSignModality,
  getD45Segment,
  getBoundaryProximity,
  calculateD45Position,
  calculateD45Chart,
  processD45Chart
};
