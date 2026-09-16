/**
 * D30 (Trimshamsha) calculation engine.
 *
 * Source position: sidereal D1 longitude (0..360), preferably from the
 * project's existing D1 engine. No new planetary ephemeris is calculated here.
 *
 * Parashari Trimshamsha (30th divisional chart):
 * Odd signs: 0-5 Mars/Aries, 5-10 Saturn/Aquarius, 10-18 Jupiter/Sagittarius,
 *            18-25 Mercury/Gemini, 25-30 Venus/Libra.
 * Even signs: 0-5 Venus/Taurus, 5-10 Mercury/Virgo, 10-18 Jupiter/Pisces,
 *             18-25 Saturn/Capricorn, 25-30 Mars/Scorpio.
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

const ODD_SEGMENTS = [
  { start: 0, end: 5, lord: 'Mars', signId: 1 },
  { start: 5, end: 10, lord: 'Saturn', signId: 11 },
  { start: 10, end: 18, lord: 'Jupiter', signId: 9 },
  { start: 18, end: 25, lord: 'Mercury', signId: 3 },
  { start: 25, end: 30, lord: 'Venus', signId: 7 }
];

const EVEN_SEGMENTS = [
  { start: 0, end: 5, lord: 'Venus', signId: 2 },
  { start: 5, end: 10, lord: 'Mercury', signId: 6 },
  { start: 10, end: 18, lord: 'Jupiter', signId: 12 },
  { start: 18, end: 25, lord: 'Saturn', signId: 10 },
  { start: 25, end: 30, lord: 'Mars', signId: 8 }
];

function normalize360(deg) {
  const n = Number(deg);
  if (!Number.isFinite(n)) throw new TypeError(`Invalid longitude: ${deg}`);
  return ((n % 360) + 360) % 360;
}

function signFromLongitude(longitude) {
  const totalDegree = normalize360(longitude);
  const signId = Math.floor(totalDegree / 30) + 1;
  const degreeInSign = totalDegree - ((signId - 1) * 30);
  return {
    signId,
    degreeInSign,
    sign: SIGNS[signId - 1].name,
    signHindi: SIGNS[signId - 1].hindi
  };
}

function getD30Segment(degreeInSign, signId) {
  // Decimal-safe boundary policy: [start, end), with 30° belonging to next sign.
  const d = Number(degreeInSign);
  const segments = signId % 2 === 1 ? ODD_SEGMENTS : EVEN_SEGMENTS;
  const segment = segments.find(s => d >= s.start && d < s.end);
  if (!segment) {
    throw new Error(`D30 segment not found: sign=${signId}, degree=${d}`);
  }
  return segment;
}

function calculateD30Position(totalSiderealDegree) {
  const d1 = signFromLongitude(totalSiderealDegree);
  const segment = getD30Segment(d1.degreeInSign, d1.signId);
  const d30Sign = SIGNS[segment.signId - 1];

  return {
    d1SignId: d1.signId,
    d1Sign: d1.sign,
    d1SignHindi: d1.signHindi,
    degreeInD1Sign: Number(d1.degreeInSign.toFixed(8)),
    totalSiderealDegree: Number(normalize360(totalSiderealDegree).toFixed(8)),
    segmentStartDegree: segment.start,
    segmentEndDegree: segment.end,
    segmentLord: segment.lord,
    d30SignId: d30Sign.id,
    d30Sign: d30Sign.name,
    d30SignHindi: d30Sign.hindi,
    d30SignLord: d30Sign.lord
  };
}

function calculateD30Chart(d1Chart) {
  if (!d1Chart || !d1Chart.lagna || !d1Chart.planets) {
    throw new Error('Valid D1 chart with lagna and planets is required for D30.');
  }

  const lagnaLongitude = d1Chart.lagna.totalDegree;
  if (lagnaLongitude === undefined || !Number.isFinite(Number(lagnaLongitude))) {
    throw new Error('D1 Lagna totalDegree is required for D30 calculation.');
  }

  const lagna = calculateD30Position(lagnaLongitude);
  const planets = {};

  for (const [planetName, planet] of Object.entries(d1Chart.planets)) {
    const longitude = planet?.totalDegree;
    if (longitude === undefined || !Number.isFinite(Number(longitude))) {
      throw new Error(`D1 totalDegree missing for ${planetName}.`);
    }

    const d30 = calculateD30Position(longitude);
    const house = ((d30.d30SignId - lagna.d30SignId + 12) % 12) + 1;

    planets[planetName] = {
      planet: planetName,
      ...d30,
      house,
      isRetrograde: Boolean(planet.isRetrograde)
    };
  }

  const houses = {};
  for (let house = 1; house <= 12; house++) {
    const signId = ((lagna.d30SignId - 1 + house - 1) % 12) + 1;
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
      d30Sign: planet.d30Sign,
      segmentLord: planet.segmentLord
    });
  }

  return {
    chartType: 'D30',
    chartName: 'Trimshamsha Chart',
    calculationSystem: 'Parashari Trimshamsha',
    lagna: {
      ...lagna,
      house: 1
    },
    houses,
    planets
  };
}

function processD30Chart(d1Chart) {
  return calculateD30Chart(d1Chart);
}

module.exports = {
  SIGNS,
  ODD_SEGMENTS,
  EVEN_SEGMENTS,
  normalize360,
  signFromLongitude,
  getD30Segment,
  calculateD30Position,
  calculateD30Chart,
  processD30Chart
};