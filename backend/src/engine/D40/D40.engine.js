/**
 * D40 (Khavedamsha) calculation engine.
 *
 * Source position: sidereal D1 longitude (0..360), reused from the
 * project's existing D1 engine — no new ephemeris is calculated here.
 *
 * Parashari Khavedamsha (40th divisional chart) rule (BPHS):
 * Each sign (30°) is divided into 40 equal parts of 0°45' (0.75°) each.
 *   - Odd sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
 *       reckoning of the 40 parts starts from Aries.
 *   - Even sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
 *       reckoning of the 40 parts starts from Libra.
 * The part the planet falls in decides the D40 sign.
 *
 * Classical usage: general auspicious/inauspicious (shubha/ashubha) effects
 * in life — in several modern traditions (including this app's convention)
 * also read for maternal-lineage blessings/obstacles.
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

const SEGMENT_SIZE = 30 / 40; // 0.75 degrees per Khavedamsha part
const ODD_START_SIGN_ID = 1;  // Aries
const EVEN_START_SIGN_ID = 7; // Libra

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

function getD40Segment(degreeInSign, signId) {
  const d = Number(degreeInSign);
  // Decimal-safe boundary policy: [start, end), 30° itself belongs to next sign (handled by caller normalize).
  let index = Math.floor(d / SEGMENT_SIZE);
  if (index > 39) index = 39; // guard for floating point edge at exactly 30°
  if (index < 0) index = 0;

  const startSignId = signId % 2 === 1 ? ODD_START_SIGN_ID : EVEN_START_SIGN_ID;
  const d40SignId = ((startSignId - 1 + index) % 12) + 1;

  return {
    segmentIndex: index,
    segmentStartDegree: Number((index * SEGMENT_SIZE).toFixed(8)),
    segmentEndDegree: Number(((index + 1) * SEGMENT_SIZE).toFixed(8)),
    d40SignId
  };
}

function calculateD40Position(totalSiderealDegree) {
  const d1 = signFromLongitude(totalSiderealDegree);
  const segment = getD40Segment(d1.degreeInSign, d1.signId);
  const d40Sign = SIGNS[segment.d40SignId - 1];

  return {
    d1SignId: d1.signId,
    d1Sign: d1.sign,
    d1SignHindi: d1.signHindi,
    degreeInD1Sign: Number(d1.degreeInSign.toFixed(8)),
    totalSiderealDegree: Number(normalize360(totalSiderealDegree).toFixed(8)),
    segmentIndex: segment.segmentIndex,
    segmentStartDegree: segment.segmentStartDegree,
    segmentEndDegree: segment.segmentEndDegree,
    d40SignId: d40Sign.id,
    d40Sign: d40Sign.name,
    d40SignHindi: d40Sign.hindi,
    d40SignLord: d40Sign.lord
  };
}

function calculateD40Chart(d1Chart) {
  if (!d1Chart || !d1Chart.lagna || !d1Chart.planets) {
    throw new Error('Valid D1 chart with lagna and planets is required for D40.');
  }

  const lagnaLongitude = d1Chart.lagna.totalDegree;
  if (lagnaLongitude === undefined || !Number.isFinite(Number(lagnaLongitude))) {
    throw new Error('D1 Lagna totalDegree is required for D40 calculation.');
  }

  const lagna = calculateD40Position(lagnaLongitude);
  const planets = {};

  for (const [planetName, planet] of Object.entries(d1Chart.planets)) {
    const longitude = planet?.totalDegree;
    if (longitude === undefined || !Number.isFinite(Number(longitude))) {
      throw new Error(`D1 totalDegree missing for ${planetName}.`);
    }

    const d40 = calculateD40Position(longitude);
    const house = ((d40.d40SignId - lagna.d40SignId + 12) % 12) + 1;

    planets[planetName] = {
      planet: planetName,
      ...d40,
      house,
      isRetrograde: Boolean(planet.isRetrograde)
    };
  }

  const houses = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagna.d40SignId - 1 + house - 1) % 12) + 1;
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
      d40Sign: planet.d40Sign,
      d40SignLord: planet.d40SignLord
    });
  }

  return {
    chartType: 'D40',
    chartName: 'Khavedamsha Chart',
    calculationSystem: 'Parashari Khavedamsha',
    lagna: {
      ...lagna,
      house: 1
    },
    houses,
    planets
  };
}

function processD40Chart(d1Chart) {
  return calculateD40Chart(d1Chart);
}

module.exports = {
  SIGNS,
  SEGMENT_SIZE,
  ODD_START_SIGN_ID,
  EVEN_START_SIGN_ID,
  normalize360,
  signFromLongitude,
  getD40Segment,
  calculateD40Position,
  calculateD40Chart,
  processD40Chart
};
