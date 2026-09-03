// backend/src/controllers/chartController.js
const { generateD1ChartData } = require('../engine/d1ChartEngine');

const getD1Chart = (req, res) => {
  try {
    const { birthDate, birthTime, latitude, longitude } = req.body;

    // बेसिक वैलिडेशन
    if (!birthDate || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "birthDate, latitude, और longitude अनिवार्य हैं।"
      });
    }

    let dateObj;
    let isTimeDefaulted = false;

    // अगर पूरी ISO स्ट्रिंग दी हो
    if (birthDate.includes("T")) {
      dateObj = new Date(birthDate);
    } 
    // अगर डेट और टाइम अलग-अलग दिए हों
    else if (birthTime && birthTime.trim() !== "") {
      let cleanTime = birthTime.trim();
      if (cleanTime.length === 5) cleanTime += ":00"; // HH:MM -> HH:MM:00
      dateObj = new Date(`${birthDate.trim()}T${cleanTime}+05:30`);
    } 
    // अगर टाइम नहीं दिया है, तो दोपहर 12:00 PM IST लें
    else {
      dateObj = new Date(`${birthDate.trim()}T12:00:00+05:30`);
      isTimeDefaulted = true;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // इंजन से D1 चार्ट का डेटा जनरेट करवाएं
    const chartData = generateD1ChartData(dateObj, lat, lng);
    chartData.isTimeDefaulted = isTimeDefaulted;

    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { getD1Chart };