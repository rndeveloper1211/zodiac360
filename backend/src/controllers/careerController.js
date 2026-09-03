// backend/src/controllers/careerController.js
const { calculatePlanets } = require('../engine/planets');
const { calculateAscendant } = require('../engine/ascendant');
const { analyzeCareer } = require('../engine/careerAnalyzer');

/**
 * birthDate और birthTime को सही Date ऑब्जेक्ट में बदलता है।
 * यदि समय न दिया हो तो डिफ़ॉल्ट 12:00 PM IST (+05:30) सेट करता है।
 */
function parseDateTime(birthDateStr, birthTimeStr) {
  if (!birthDateStr) return null;

  // यदि पहले से पूरी ISO स्ट्रिंग है (उदा. "1988-11-05T10:28:00+05:30" या "Z")
  if (birthDateStr.includes("T")) {
    return {
      dateObj: new Date(birthDateStr),
      isTimeDefaulted: false
    };
  }

  const cleanDate = birthDateStr.trim();

  // यदि समय दिया गया है
  if (birthTimeStr && birthTimeStr.trim() !== "") {
    let cleanTime = birthTimeStr.trim();
    if (cleanTime.length === 5) {
      cleanTime += ":00"; // HH:MM -> HH:MM:00
    }
    return {
      dateObj: new Date(`${cleanDate}T${cleanTime}+05:30`),
      isTimeDefaulted: false
    };
  }

  // समय नहीं दिया तो डिफ़ॉल्ट दोपहर 12:00 PM IST (Noon Chart)
  return {
    dateObj: new Date(`${cleanDate}T12:00:00+05:30`),
    isTimeDefaulted: true
  };
}

const getCareerReport = (req, res) => {
  try {
    const { birthDate, birthTime, latitude, longitude } = req.body;

    // इनपुट वैलिडेशन
    if (!birthDate || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "birthDate, latitude, और longitude अनिवार्य हैं।"
      });
    }

    const parsed = parseDateTime(birthDate, birthTime);
    if (!parsed || isNaN(parsed.dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "अमान्य जन्म तिथि या समय प्रारूप।"
      });
    }

    const date = parsed.dateObj;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. लग्न और ग्रह निकालना
    const ascendant = calculateAscendant(date, lat, lng);
    const planets = calculatePlanets(date);

    // 2. 12 भावों में ग्रहों की मैपिंग (Equal House System)
    const lagnaRashiIndex = ascendant.rashiIndex;
    const planetsWithHouses = {};
    Object.keys(planets).forEach((key) => {
      const p = planets[key];
      const planetRashi = p.rashiIndex !== undefined ? p.rashiIndex : Math.floor(p.totalDegree / 30);
      const houseNumber = ((planetRashi - lagnaRashiIndex + 12) % 12) + 1;
      planetsWithHouses[key] = { ...p, house: houseNumber };
    });

    // 3. करियर विश्लेषण चलाना
    const careerData = analyzeCareer({ ascendant, planets: planetsWithHouses });

    // यदि टाइम डिफ़ॉल्ट हुआ है तो डेटा में फ्लैग और नोट जोड़ें
    if (parsed.isTimeDefaulted) {
      careerData.isTimeDefaulted = true;
      careerData.timeNote = "जन्म समय उपलब्ध न होने के कारण दोपहर 12:00 PM IST (Noon Chart) के आधार पर गणना की गई है।";
    } else {
      careerData.isTimeDefaulted = false;
    }

    return res.status(200).json({
      success: true,
      data: careerData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { getCareerReport };