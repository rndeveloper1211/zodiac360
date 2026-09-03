// backend/src/engine/planets.js
const Astronomy = require('astronomy-engine');

const RASHIS = [
  { name: "Aries", hindi: "मेष" },
  { name: "Taurus", hindi: "वृषभ" },
  { name: "Gemini", hindi: "मिथुन" },
  { name: "Cancer", hindi: "कर्क" },
  { name: "Leo", hindi: "सिंह" },
  { name: "Virgo", hindi: "कन्या" },
  { name: "Libra", hindi: "तुला" },
  { name: "Scorpio", hindi: "वृश्चिक" },
  { name: "Sagittarius", hindi: "धनु" },
  { name: "Capricorn", hindi: "मकर" },
  { name: "Aquarius", hindi: "कुम्भ" },
  { name: "Pisces", hindi: "मीन" }
];

function getLahiriAyanamsha(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219878;
  return 23.8566 + (diffYears * (50.29 / 3600));
}

/**
 * चंद्रमा के आरोही पात (Mean Ascending Node / Rahu Sayana Longitude) की गणना
 * Jean Meeus - Astronomical Algorithms
 */
function getMeanRahuSayanaLongitude(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const T = diffDays / 36525; // Julian Centuries from J2000.0

  // Ω (Longitude of the ascending node)
  let omega = 125.04452 - (1934.136261 * T) + (0.0020708 * T * T) + ((T * T * T) / 450000);
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}

function calculatePlanets(date) {
  const ayanamsha = getLahiriAyanamsha(date);
  const astroTime = new Astronomy.AstroTime(date);

  const bodies = [
    { name: 'Sun', body: Astronomy.Body.Sun },
    { name: 'Moon', body: Astronomy.Body.Moon },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Saturn', body: Astronomy.Body.Saturn }
  ];

  const results = {};

  // 1. 7 मुख्य ग्रह निकालें
  bodies.forEach(({ name, body }) => {
    const vec = Astronomy.GeoVector(body, astroTime, true);
    const ecliptic = Astronomy.Ecliptic(vec);
    
    let siderealDeg = (ecliptic.elon - ayanamsha) % 360;
    if (siderealDeg < 0) siderealDeg += 360;

    const rashiIndex = Math.floor(siderealDeg / 30);
    const degInRashi = siderealDeg % 30;

    results[name] = {
      name,
      rashi: RASHIS[rashiIndex].name,
      rashiHindi: RASHIS[rashiIndex].hindi,
      rashiIndex,
      degreeInRashi: Number(degInRashi.toFixed(2)),
      totalDegree: Number(siderealDeg.toFixed(2))
    };
  });

  // 2. राहु (Rahu / North Node)
  const rahuSayana = getMeanRahuSayanaLongitude(date);
  let rahuSiderealDeg = (rahuSayana - ayanamsha) % 360;
  if (rahuSiderealDeg < 0) rahuSiderealDeg += 360;

  const rahuRashiIndex = Math.floor(rahuSiderealDeg / 30);
  const rahuDegInRashi = rahuSiderealDeg % 30;

  results['Rahu'] = {
    name: 'Rahu',
    rashi: RASHIS[rahuRashiIndex].name,
    rashiHindi: RASHIS[rahuRashiIndex].hindi,
    rashiIndex: rahuRashiIndex,
    degreeInRashi: Number(rahuDegInRashi.toFixed(2)),
    totalDegree: Number(rahuSiderealDeg.toFixed(2)),
    isRetrograde: true
  };

  // 3. केतु (Ketu / South Node) - ठीक 180° सामने
  let ketuSiderealDeg = (rahuSiderealDeg + 180) % 360;
  const ketuRashiIndex = Math.floor(ketuSiderealDeg / 30);
  const ketuDegInRashi = ketuSiderealDeg % 30;

  results['Ketu'] = {
    name: 'Ketu',
    rashi: RASHIS[ketuRashiIndex].name,
    rashiHindi: RASHIS[ketuRashiIndex].hindi,
    rashiIndex: ketuRashiIndex,
    degreeInRashi: Number(ketuDegInRashi.toFixed(2)),
    totalDegree: Number(ketuSiderealDeg.toFixed(2)),
    isRetrograde: true
  };

  return results;
}

module.exports = { calculatePlanets };