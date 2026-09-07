/**
 * D10 (Dashamsha) Controller Layer
 */

const { generateD1Report } = require('../D1/D1.service');
const { processD10Chart } = require('./d10Engine');

function getD10(req, res) {
  try {
    const params = Object.keys(req.query).length > 0 ? req.query : req.body;
    const { date, time, lat, lon, tz, timezone } = params;

    if (!date || !time || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required params: 'date' (YYYY-MM-DD), 'time' (HH:MM), 'lat', 'lon'."
      });
    }

    const rawReport = generateD1Report({
      date,
      time,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      timezone: tz ? parseFloat(tz) : (timezone ? parseFloat(timezone) : 5.5)
    });
console.log('\n================== [1. GENERATED RAW DATA FOR D10] ==================');
    console.log(JSON.stringify(rawReport, null, 2));
    const rawData = rawReport.data ? (rawReport.data.raw || rawReport.data) : rawReport;
    const d10AnalysisReport = processD10Chart(rawData);

    return res.status(200).json({
      success: true,
      data: d10AnalysisReport.data
    });
  } catch (error) {
    console.error('Error in D10 Controller (getD10):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function analyzeExistingD10(req, res) {
  try {
    const payload = req.body;
    const rawData = payload.data ? (payload.data.raw || payload.data) : payload;
    const interpretation = processD10Chart(rawData);

    return res.status(200).json({
      success: true,
      data: interpretation.data
    });
  } catch (error) {
    console.error('Error in D10 Controller (analyzeExistingD10):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getD10,
  analyzeExistingD10
};
