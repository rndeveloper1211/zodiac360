const kundaliService = require('../services/kundali.service');

function getKundali(req, res) {
  try {
    const { date, time, lat, lon, tz } = req.query;

    if (!date || !time || !lat || !lon) {
      return res.status(400).json({
        success: false,
        error: "Missing required query params: 'date' (YYYY-MM-DD), 'time' (HH:MM), 'lat', 'lon'."
      });
    }

    const report = kundaliService.generateKundaliReport({
      date,
      time,
      lat,
      lon,
      timezone: tz ? parseFloat(tz) : 5.5
    });

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getKundali
};