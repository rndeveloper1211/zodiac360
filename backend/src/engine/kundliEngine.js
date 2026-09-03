// src/engine/kundliEngine.js
const Astronomy = require('astronomy-engine');
const { RASHIS } = require('../config/astroConstants');
const { getLahiriAyanamsha, getMeanRahuSayanaLongitude } = require('../utils/astroMath');

/**
 * लग्न (Ascendant) की गणना
 */
function calculateAscendant(date, latitude, longitude, ayanamsha) {
  const astroTime = new Astronomy.AstroTime(date);
  const siderealHours = Astronomy.SiderealTime(astroTime);
  let ramc = (siderealHours * 15 + longitude) % 360;
  if (ramc < 0) ramc += 360;

  const T = (astroTime.tt - 2451545.0) / 36525;
  const eps = 23.4392911 - (0.0130042 * T);

  const ramcRad = (ramc * Math.PI) / 180;
  const epsRad = (eps * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);

  let ascSayana = (Math.atan2(y, x) * 180) / Math.PI;
  ascSayana = (ascSayana + 360) % 360;

  let ascSidereal = (ascSayana - ayanamsha + 360) % 360;
  const rashiIndex = Math.floor(ascSidereal / 30);

  return {
    name: "Ascendant (Lagna)",
    totalDegree: Number(ascSidereal.toFixed(2)),
    degreeInRashi: Number((ascSidereal % 30).toFixed(2)),
    rashiIndex,
    rashi: RASHIS[rashiIndex].name,
    rashiHindi: RASHIS[rashiIndex].hindi
  };
}

/**
 * सभी ग्रहों और लग्न का डेटा निकालना
 */
function calculatePlanetaryData({ date, time, latitude, longitude, timezoneOffset = "+05:30" }) {
  const dateObj = new Date(`${date}T${time}:00${timezoneOffset}`);
  const ayanamsha = getLahiriAyanamsha(dateObj);
  const astroTime = new Astronomy.AstroTime(dateObj);

  // 1. लग्न
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

    let siderealDeg = (ecliptic.elon - ayanamsha) % 360;
    if (siderealDeg < 0) siderealDeg += 360;

    const rashiIndex = Math.floor(siderealDeg / 30);
    const degInRashi = siderealDeg % 30;
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

  // 3. राहु
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

  // 4. केतु (राहु से 180° विपरीत)
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

module.exports = { calculatePlanetaryData };