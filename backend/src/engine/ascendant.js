// backend/src/engine/ascendant.js
const Astronomy = require('astronomy-engine');
const { getLahiriAyanamsha } = require('./ayanamsha');

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

function calculateAscendant(date, lat, lng) {
  const ayanamsha = getLahiriAyanamsha(date);

  // 1. Greenwich Sidereal Time (GST) to Local Sidereal Time (LST)
  // Astronomy.SiderealTime expects an AstroTime object or Date
  const gstHours = Astronomy.SiderealTime(new Astronomy.AstroTime(date));
  let lstDeg = ((gstHours * 15) + lng + 360) % 360;

  const lstRad = (lstDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const oblRad = (23.4392911 * Math.PI) / 180; // Obliquity of Ecliptic

  // 2. Exact Eastern Horizon (Ascendant) Formula
  // y = cos(RAMC)
  // x = - (sin(RAMC) * cos(eps) + tan(lat) * sin(eps))
  const y = Math.cos(lstRad);
  const x = - (Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));

  let sayanaAscRad = Math.atan2(y, x);
  let sayanaAscDeg = (sayanaAscRad * 180) / Math.PI;
  if (sayanaAscDeg < 0) sayanaAscDeg += 360;

  // 3. Nirayana (Sidereal) Ascendant using Lahiri Ayanamsha
  let siderealAscendant = (sayanaAscDeg - ayanamsha + 360) % 360;
  const rashiIndex = Math.floor(siderealAscendant / 30);
  const degInRashi = siderealAscendant % 30;

  return {
    name: "Ascendant (Lagna)",
    rashi: RASHIS[rashiIndex].name,
    rashiHindi: RASHIS[rashiIndex].hindi,
    rashiIndex: rashiIndex,
    degreeInRashi: Number(degInRashi.toFixed(2)),
    totalDegree: Number(siderealAscendant.toFixed(2))
  };
}

module.exports = { calculateAscendant };