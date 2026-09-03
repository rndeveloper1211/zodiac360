const Astronomy = require('astronomy-engine');

// 12 राशियां
const RASHIS = [
  { id: 0, name: "Aries", hindi: "मेष" },
  { id: 1, name: "Taurus", hindi: "वृषभ" },
  { id: 2, name: "Gemini", hindi: "मिथुन" },
  { id: 3, name: "Cancer", hindi: "कर्क" },
  { id: 4, name: "Leo", hindi: "सिंह" },
  { id: 5, name: "Virgo", hindi: "कन्या" },
  { id: 6, name: "Libra", hindi: "तुला" },
  { id: 7, name: "Scorpio", hindi: "वृश्चिक" },
  { id: 8, name: "Sagittarius", hindi: "धनु" },
  { id: 9, name: "Capricorn", hindi: "मकर" },
  { id: 10, name: "Aquarius", hindi: "कुम्भ" },
  { id: 11, name: "Pisces", hindi: "मीन" }
];

/**
 * 1. लाहिरी अयनांश (Lahiri Ayanamsha) की गणना
 * J2000 युग (1 जनवरी 2000) के संदर्भ में
 */
function getLahiriAyanamsha(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219878;
  // मानक लाहिरी अयनांश दर: ~50.29 आर्कसेकंड प्रति वर्ष
  return 23.8566 + (diffYears * (50.29 / 3600));
}

/**
 * 2. चंद्रमा के मीन नोड (राहु) की गणना (Jean Meeus फॉर्मूला)
 */
function getMeanRahuSayanaLongitude(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const T = diffDays / 36525; // जूलियन सेंचुरी

  let omega = 125.04452 - (1934.136261 * T) + (0.0020708 * T * T) + ((T * T * T) / 450000);
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}

/**
 * 3. लग्न (Ascendant) की गणना
 */
function calculateAscendant(date, latitude, longitude, ayanamsha) {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const astroTime = new Astronomy.AstroTime(date);
  
  // स्थानीय नाक्षत्र समय (Local Sidereal Time / RAMC) डिग्री में
  const siderealHours = Astronomy.SiderealTime(astroTime);
  let ramc = (siderealHours * 15 + longitude) % 360;
  if (ramc < 0) ramc += 360;

  // क्रांतिवृत्त झुकाव (Obliquity of Ecliptic)
  const T = (astroTime.tt - 2451545.0) / 36525;
  const eps = 23.4392911 - (0.0130042 * T); // डिग्री में

  const ramcRad = (ramc * Math.PI) / 180;
  const epsRad = (eps * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  // लग्न गणना सूत्र
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);

  let ascSayana = (Math.atan2(y, x) * 180) / Math.PI;
  ascSayana = (ascSayana + 360) % 360;

  // निरयण लग्न = Sayana Ascendant - Ayanamsha
  let ascSidereal = (ascSayana - ayanamsha + 360) % 360;
  const rashiIndex = Math.floor(ascSidereal / 30);

  return {
    name: "Ascendant (Lagna)",
    totalDegree: Number(ascSidereal.toFixed(2)),
    degreeInRashi: Number((ascSidereal % 30).toFixed(2)),
    rashiIndex: rashiIndex,
    rashi: RASHIS[rashiIndex].name,
    rashiHindi: RASHIS[rashiIndex].hindi
  };
}

/**
 * 4. मुख्य गणना फ़ंक्शन (सभी 9 ग्रह + लग्न)
 */
function getKundliData({ date, time, latitude, longitude, timezoneOffset = "+05:30" }) {
  // ISO स्ट्रिंग बनाकर Date ऑब्जेक्ट तैयार करें
  const dateObj = new Date(`${date}T${time}:00${timezoneOffset}`);
  const ayanamsha = getLahiriAyanamsha(dateObj);
  const astroTime = new Astronomy.AstroTime(dateObj);

  // 1. लग्न निकालें
  const ascendant = calculateAscendant(dateObj, latitude, longitude, ayanamsha);

  // 2. सात प्रत्यक्ष ग्रह
  const physicalBodies = [
    { name: 'Sun', body: Astronomy.Body.Sun },
    { name: 'Moon', body: Astronomy.Body.Moon },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Saturn', body: Astronomy.Body.Saturn }
  ];

  const planets = {};

  physicalBodies.forEach(({ name, body }) => {
    const vec = Astronomy.GeoVector(body, astroTime, true);
    const ecliptic = Astronomy.Ecliptic(vec);
    
    // सायन से अयनांश घटाकर निरयण (Sidereal) मान प्राप्त करें
    let siderealDeg = (ecliptic.elon - ayanamsha) % 360;
    if (siderealDeg < 0) siderealDeg += 360;

    const rashiIndex = Math.floor(siderealDeg / 30);
    const degInRashi = siderealDeg % 30;

    // Equal House System के तहत भाव (House) संख्या: 1 से 12
    const house = ((rashiIndex - ascendant.rashiIndex + 12) % 12) + 1;

    planets[name] = {
      name,
      totalDegree: Number(siderealDeg.toFixed(2)),
      degreeInRashi: Number(degInRashi.toFixed(2)),
      rashiIndex,
      rashi: RASHIS[rashiIndex].name,
      rashiHindi: RASHIS[rashiIndex].hindi,
      house
    };
  });

  // 3. राहु (Rahu / North Node)
  const rahuSayana = getMeanRahuSayanaLongitude(dateObj);
  let rahuSiderealDeg = (rahuSayana - ayanamsha + 360) % 360;
  const rahuRashiIndex = Math.floor(rahuSiderealDeg / 30);
  const rahuHouse = ((rahuRashiIndex - ascendant.rashiIndex + 12) % 12) + 1;

  planets['Rahu'] = {
    name: 'Rahu',
    totalDegree: Number(rahuSiderealDeg.toFixed(2)),
    degreeInRashi: Number((rahuSiderealDeg % 30).toFixed(2)),
    rashiIndex: rahuRashiIndex,
    rashi: RASHIS[rahuRashiIndex].name,
    rashiHindi: RASHIS[rahuRashiIndex].hindi,
    house: rahuHouse,
    isRetrograde: true
  };

  // 4. केतु (Ketu / South Node) - राहु के विपरीत 180° पर
  let ketuSiderealDeg = (rahuSiderealDeg + 180) % 360;
  const ketuRashiIndex = Math.floor(ketuSiderealDeg / 30);
  const ketuHouse = ((ketuRashiIndex - ascendant.rashiIndex + 12) % 12) + 1;

  planets['Ketu'] = {
    name: 'Ketu',
    totalDegree: Number(ketuSiderealDeg.toFixed(2)),
    degreeInRashi: Number((ketuSiderealDeg % 30).toFixed(2)),
    rashiIndex: ketuRashiIndex,
    rashi: RASHIS[ketuRashiIndex].name,
    rashiHindi: RASHIS[ketuRashiIndex].hindi,
    house: ketuHouse,
    isRetrograde: true
  };

  return {
    inputDetails: {
      date,
      time,
      latitude,
      longitude,
      calculatedAyanamsha: Number(ayanamsha.toFixed(4))
    },
    ascendant,
    planets
  };
}

// ==========================================
// टेस्ट रन (उदाहरण: नई दिल्ली, 5 नवंबर 1988, 10:28 AM)
// ==========================================
const testInput = {
  date: "2000-11-06",       // YYYY-MM-DD
  time: "04:28",            // HH:MM (24 घंटे का प्रारूप)
  latitude: 19.6975,        // नई दिल्ली अक्षांश
  longitude: 75.0105,       // नई दिल्ली देशांतर
  timezoneOffset: "+05:30"  // भारतीय मानक समय (IST)
};

const result = getKundliData(testInput);
console.log(JSON.stringify(result, null, 2));