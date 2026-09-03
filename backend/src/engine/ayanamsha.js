// backend/src/engine/ayanamsha.js

function getLahiriAyanamsha(date) {
  const epoch2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffDays = (date.getTime() - epoch2000.getTime()) / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.24219878;
  return 23.8566 + (diffYears * (50.29 / 3600));
}

module.exports = { getLahiriAyanamsha };