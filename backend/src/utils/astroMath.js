// src/utils/astroMath.js

/**
 * लाहिरी अयनांश (Lahiri Ayanamsha)
 */
function getLahiriAyanamsha(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219878;
  return 23.8566 + (diffYears * (50.29 / 3600));
}

/**
 * राहु की Sayana Longitude (Jean Meeus Astronomical Algorithms)
 */
function getMeanRahuSayanaLongitude(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const T = diffDays / 36525; // Julian Centuries

  let omega = 125.04452 - (1934.136261 * T) + (0.0020708 * T * T) + ((T * T * T) / 450000);
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}

module.exports = {
  getLahiriAyanamsha,
  getMeanRahuSayanaLongitude
};