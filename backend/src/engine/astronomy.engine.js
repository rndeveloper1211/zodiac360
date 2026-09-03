const Astronomy = require('astronomy-engine');
const { RASHIS, NAKSHATRAS } = require('../config/constants');

/**
 * Approximate Lahiri Ayanamsha based on Epoch 2000.0 (23° 51' 11")
 */
function getLahiriAyanamsha(utcDate) {
  const t = (utcDate.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / (36525 * 86400000);
  return 23.85 + (t * 1.396);
}

function normalizeDegree(deg) {
  return ((deg % 360) + 360) % 360;
}

function parseZodiacPosition(siderealDegree) {
  const norm = normalizeDegree(siderealDegree);
  const signIndex = Math.floor(norm / 30);
  const degreeInSign = norm % 30;
  
  const nakshatraIndex = Math.floor(norm / (360 / 27));
  const charan = Math.floor((norm % (360 / 27)) / (360 / 108)) + 1;

  return {
    sign: RASHIS[signIndex].name,
    signHindi: RASHIS[signIndex].hindi,
    signId: signIndex + 1,
    degreeInSign: parseFloat(degreeInSign.toFixed(2)),
    totalDegree: parseFloat(norm.toFixed(4)),
    nakshatra: NAKSHATRAS[nakshatraIndex],
    charan
  };
}

/**
 * Calculates Sidereal Ascendant (Lagna)
 */
function calculateLagna(utcDate, lat, lon, ayanamsha) {
  const observer = new Astronomy.Observer(lat, lon, 0);
  const siderealTimeHours = Astronomy.SiderealTime(utcDate);
  const ramc = normalizeDegree((siderealTimeHours * 15) + lon); // Right Ascension of Midheaven

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const eps = 23.4392911 * rad; // Obliquity of ecliptic
  const phi = lat * rad;
  const theta = ramc * rad;

  // Tropical Ascendant formula
  const y = Math.cos(theta);
  const x = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  let ascendantTropical = Math.atan2(y, x) * deg;
  ascendantTropical = normalizeDegree(ascendantTropical);

  const ascendantSidereal = normalizeDegree(ascendantTropical - ayanamsha);
  return parseZodiacPosition(ascendantSidereal);
}

/**
 * Calculates Nirayana planetary positions
 */
function getPlanetaryPositions(utcDate, lat, lon) {
  const ayanamsha = getLahiriAyanamsha(utcDate);
  const lagna = calculateLagna(utcDate, lat, lon, ayanamsha);

  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const results = {};

  planets.forEach(body => {
    // FIX: Astrology needs GEOCENTRIC positions (as seen from Earth), not
    // heliocentric (as seen from the Sun). HelioVector('Sun', ...) is
    // especially broken — it returns the origin vector (0,0,0), since the
    // Sun's position relative to itself is always zero, which silently
    // produced elon = 0 and a bogus sidereal longitude for the Sun.
    const pos = Astronomy.GeoVector(body, utcDate, true);

    const ecliptic = Astronomy.Ecliptic(pos);
    const siderealLon = normalizeDegree(ecliptic.elon - ayanamsha);
    const posDetails = parseZodiacPosition(siderealLon);

    // House calculation relative to Lagna (Whole sign / Vedic Bhav)
    const house = ((posDetails.signId - lagna.signId + 12) % 12) + 1;

    // Check retrograde status (comparing with +1 hour position)
    const nextHour = new Date(utcDate.getTime() + 3600000);
    const nextPos = Astronomy.GeoVector(body, nextHour, true);
    const nextEcliptic = Astronomy.Ecliptic(nextPos);
    const isRetrograde = body !== 'Sun' && body !== 'Moon' && (nextEcliptic.elon < ecliptic.elon);

    results[body] = {
      ...posDetails,
      house,
      isRetrograde
    };
  });

  // Calculate Mean Node for Rahu/Ketu
  // Approximation for Rahu longitude
  const t = (utcDate.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / (36525 * 86400000);
  const meanNodeTropical = normalizeDegree(125.04452 - 1934.136261 * t);
  const rahuSidereal = normalizeDegree(meanNodeTropical - ayanamsha);
  const ketuSidereal = normalizeDegree(rahuSidereal + 180);

  const rahuDetails = parseZodiacPosition(rahuSidereal);
  const ketuDetails = parseZodiacPosition(ketuSidereal);

  results['Rahu'] = {
    ...rahuDetails,
    house: ((rahuDetails.signId - lagna.signId + 12) % 12) + 1,
    isRetrograde: true
  };

  results['Ketu'] = {
    ...ketuDetails,
    house: ((ketuDetails.signId - lagna.signId + 12) % 12) + 1,
    isRetrograde: true
  };

  return {
    ayanamsha: parseFloat(ayanamsha.toFixed(4)),
    lagna: { ...lagna, house: 1 },
    planets: results
  };
}

module.exports = {
  getPlanetaryPositions
};