/**
 * Converts local date, time, and timezone offset to UTC Date object.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} timeStr - 'HH:MM'
 * @param {number} tzOffsetHours - e.g. 5.5 for IST
 */
function getUtcDate(dateStr, timeStr, tzOffsetHours = 5.5) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const localMs = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMs = tzOffsetHours * 60 * 60 * 1000;
  return new Date(localMs - offsetMs);
}

/**
 * Calculates Julian Day Number for a UTC Date
 */
function getJulianDay(utcDate) {
  return (utcDate.getTime() / 86400000) + 2440587.5;
}

module.exports = {
  getUtcDate,
  getJulianDay
};