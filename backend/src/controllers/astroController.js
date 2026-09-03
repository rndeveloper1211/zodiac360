// src/controllers/astroController.js
const { calculatePlanetaryData } = require('../engine/kundliEngine');

const getPlanetaryPositions = (req, res) => {
  try {
    const { date, time, latitude, longitude, timezoneOffset } = req.body;

    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'date (YYYY-MM-DD), time (HH:MM), latitude, और longitude अनिवार्य हैं।'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'latitude और longitude मान्य संख्याएँ होनी चाहिए।'
      });
    }

    const data = calculatePlanetaryData({
      date,
      time,
      latitude: lat,
      longitude: lon,
      timezoneOffset: timezoneOffset || '+05:30'
    });

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Astro Engine Error:', error);
    return res.status(500).json({
      success: false,
      message: 'ग्रहों की गणना में त्रुटि आई।',
      error: error.message
    });
  }
};

module.exports = { getPlanetaryPositions };