/**
 * parses birthDate and optional birthTime into an accurate Date object.
 * Defaults to 12:00 PM IST (+05:30) if time is not provided.
 * 
 * @param {string} birthDateStr - e.g. "2002-12-30" or ISO String "2002-12-30T10:28:00+05:30"
 * @param {string} [birthTimeStr] - e.g. "10:28" or "10:28:00" (Optional)
 * @returns {{ dateObj: Date, isTimeDefaulted: boolean }}
 */
function parseBirthDateTime(birthDateStr, birthTimeStr = null) {
  if (!birthDateStr) {
    throw new Error("जन्म तिथि (birthDate) अनिवार्य है!");
  }

  // 1. अगर यूज़र ने पहले से फुल ISO/Z/ऑफ़सेट स्ट्रिंग भेजी है (जैसे "1988-11-05T10:28:00+05:30")
  if (birthDateStr.includes("T")) {
    return {
      dateObj: new Date(birthDateStr),
      isTimeDefaulted: false
    };
  }

  // 2. डेट को साफ करें (YYYY-MM-DD फॉर्मेट सुनिश्चित करें)
  const cleanDate = birthDateStr.trim(); // e.g. "2002-12-30"

  // 3. यदि जन्म समय दिया गया है
  if (birthTimeStr && birthTimeStr.trim() !== "") {
    let cleanTime = birthTimeStr.trim();
    // यदि केवल HH:MM दिया है, तो :00 जोड़ें
    if (cleanTime.length === 5) {
      cleanTime += ":00";
    }
    
    // भारतीय समय के लिए +05:30 जोड़कर सटीक Date बनाएँ
    const fullIsoString = `${cleanDate}T${cleanTime}+05:30`;
    return {
      dateObj: new Date(fullIsoString),
      isTimeDefaulted: false
    };
  }

  // 4. यदि समय नहीं दिया है -> Default to 12:00 PM IST (Noon Chart)
  const defaultNoonString = `${cleanDate}T12:00:00+05:30`;
  return {
    dateObj: new Date(defaultNoonString),
    isTimeDefaulted: true
  };
}

module.exports = { parseBirthDateTime };