// backend/test-astronomy.js
const Astronomy = require('astronomy-engine');

// ==========================================
// 1. CONSTANTS (12 Rashis & 27 Nakshatras)
// ==========================================
const RASHIS = [
  { id: 0, name: "Aries", hindi: "मेष", lord: "Mars" },
  { id: 1, name: "Taurus", hindi: "वृषभ", lord: "Venus" },
  { id: 2, name: "Gemini", hindi: "मिथुन", lord: "Mercury" },
  { id: 3, name: "Cancer", hindi: "कर्क", lord: "Moon" },
  { id: 4, name: "Leo", hindi: "सिंह", lord: "Sun" },
  { id: 5, name: "Virgo", hindi: "कन्या", lord: "Mercury" },
  { id: 6, name: "Libra", hindi: "तुला", lord: "Venus" },
  { id: 7, name: "Scorpio", hindi: "वृश्चिक", lord: "Mars" },
  { id: 8, name: "Sagittarius", hindi: "धनु", lord: "Jupiter" },
  { id: 9, name: "Capricorn", hindi: "मकर", lord: "Saturn" },
  { id: 10, name: "Aquarius", hindi: "कुम्भ", lord: "Saturn" },
  { id: 11, name: "Pisces", hindi: "मीन", lord: "Jupiter" }
];

const NAKSHATRAS = [
  { id: 0, name: "Ashwini", lord: "Ketu" },
  { id: 1, name: "Bharani", lord: "Venus" },
  { id: 2, name: "Krittika", lord: "Sun" },
  { id: 3, name: "Rohini", lord: "Moon" },
  { id: 4, name: "Mrigashira", lord: "Mars" },
  { id: 5, name: "Ardra", lord: "Rahu" },
  { id: 6, name: "Punarvasu", lord: "Jupiter" },
  { id: 7, name: "Pushya", lord: "Saturn" },
  { id: 8, name: "Ashlesha", lord: "Mercury" },
  { id: 9, name: "Magha", lord: "Ketu" },
  { id: 10, name: "Purva Phalguni", lord: "Venus" },
  { id: 11, name: "Uttara Phalguni", lord: "Sun" },
  { id: 12, name: "Hasta", lord: "Moon" },
  { id: 13, name: "Chitra", lord: "Mars" },
  { id: 14, name: "Swati", lord: "Rahu" },
  { id: 15, name: "Vishakha", lord: "Jupiter" },
  { id: 16, name: "Anuradha", lord: "Saturn" },
  { id: 17, name: "Jyeshtha", lord: "Mercury" },
  { id: 18, name: "Mula", lord: "Ketu" },
  { id: 19, name: "Purva Ashadha", lord: "Venus" },
  { id: 20, name: "Uttara Ashadha", lord: "Sun" },
  { id: 21, name: "Shravana", lord: "Moon" },
  { id: 22, name: "Dhanishta", lord: "Mars" },
  { id: 23, name: "Shatabhisha", lord: "Rahu" },
  { id: 24, name: "Purva Bhadrapada", lord: "Jupiter" },
  { id: 25, name: "Uttara Bhadrapada", lord: "Saturn" },
  { id: 26, name: "Revati", lord: "Mercury" }
];

// ==========================================
// 2. LAHIRI AYANAMSHA CALCULATION
// ==========================================
function getLahiriAyanamsha(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219878;
  return 23.8566 + (diffYears * (50.29 / 3600));
}

// ==========================================
// 3. PLANETARY CALCULATION ENGINE
// ==========================================
function calculatePlanetaryPositions(date) {
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

  // 7 Planets
  bodies.forEach(({ name, body }) => {
    // 1. GeoVector निकालें
    const vec = Astronomy.GeoVector(body, astroTime, true);
    // 2. Ecliptic Longitude निकालें
    const ecliptic = Astronomy.Ecliptic(vec);
    
    let siderealDeg = (ecliptic.elon - ayanamsha) % 360;
    if (siderealDeg < 0) siderealDeg += 360;

    const rashiIndex = Math.floor(siderealDeg / 30);
    const degInRashi = siderealDeg % 30;
    const nakshatraIndex = Math.floor(siderealDeg / (360 / 27));

    results[name] = {
      Planet: name,
      Rashi: `${RASHIS[rashiIndex].name} (${RASHIS[rashiIndex].hindi})`,
      "Degree in Rashi": `${degInRashi.toFixed(2)}°`,
      Nakshatra: NAKSHATRAS[nakshatraIndex].name,
      "Nakshatra Lord": NAKSHATRAS[nakshatraIndex].lord,
      "Total Sidereal Deg": `${siderealDeg.toFixed(2)}°`
    };
  });

  // Rahu & Ketu (Mean Node Approximation)
  const T = (astroTime.tt) / 36525.0;
  // Mean longitude of the ascending node of Moon's orbit
  let nodeLon = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  nodeLon = ((nodeLon % 360) + 360) % 360;

  let rahuDeg = (nodeLon - ayanamsha + 360) % 360;
  let ketuDeg = (rahuDeg + 180) % 360;

  const rahuRashi = Math.floor(rahuDeg / 30);
  const ketuRashi = Math.floor(ketuDeg / 30);

  const rahuNakIdx = Math.floor(rahuDeg / (360 / 27));
  const ketuNakIdx = Math.floor(ketuDeg / (360 / 27));

  results['Rahu'] = {
    Planet: 'Rahu',
    Rashi: `${RASHIS[rahuRashi].name} (${RASHIS[rahuRashi].hindi})`,
    "Degree in Rashi": `${(rahuDeg % 30).toFixed(2)}°`,
    Nakshatra: NAKSHATRAS[rahuNakIdx].name,
    "Nakshatra Lord": NAKSHATRAS[rahuNakIdx].lord,
    "Total Sidereal Deg": `${rahuDeg.toFixed(2)}°`
  };

  results['Ketu'] = {
    Planet: 'Ketu',
    Rashi: `${RASHIS[ketuRashi].name} (${RASHIS[ketuRashi].hindi})`,
    "Degree in Rashi": `${(ketuDeg % 30).toFixed(2)}°`,
    Nakshatra: NAKSHATRAS[ketuNakIdx].name,
    "Nakshatra Lord": NAKSHATRAS[ketuNakIdx].lord,
    "Total Sidereal Deg": `${ketuDeg.toFixed(2)}°`
  };

  return { ayanamsha, results };
}

// ==========================================
// 4. TEST EXECUTION
// ==========================================
const birthDate = new Date("1999-06-05T01:00:00.000Z");

console.log("==================================================");
console.log("       ZODIAC360 - ASTRONOMY ENGINE TEST         ");
console.log("==================================================");
console.log(`Birth Date (UTC): ${birthDate.toISOString()}`);

const { ayanamsha, results } = calculatePlanetaryPositions(birthDate);

console.log(`Calculated Lahiri Ayanamsha: ${ayanamsha.toFixed(4)}°\n`);
console.table(Object.values(results));