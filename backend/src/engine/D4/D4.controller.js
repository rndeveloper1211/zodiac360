/**
 * D4 (Chaturthamsha) Controller Layer
 */

const { generateD1Report } = require('../D1/D1.service');
const { processD4Chart } = require('./d4Engine');

function getD4(req, res) {
  try {
    const params = Object.keys(req.query).length > 0 ? req.query : req.body;
    const { date, time, lat, lon, tz, timezone } = params;

    if (!date || !time || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required params: 'date' (YYYY-MM-DD), 'time' (HH:MM), 'lat', 'lon'."
      });
    }

    // 1. Generate Raw D1 Data
    const rawReport = generateD1Report({
      date,
      time,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      timezone: tz ? parseFloat(tz) : (timezone ? parseFloat(timezone) : 5.5)
    });

    // --- यहाँ डीबग के लिए प्रिंट करें ---
    console.log('\n================== [RAW REPORT FROM D1 SERVICE] ==================');
    console.log(rawReport);
    console.log('===================================================================\n');

    // 2. Process D4 Chart Analysis
    const rawData = rawReport.data ? (rawReport.data.raw || rawReport.data) : rawReport;
    const d4AnalysisReport = processD4Chart(rawData);

    return res.status(200).json({
      success: true,
      data: {
        analysis: d4AnalysisReport
      }
    });
  } catch (error) {
    console.error('Error in D4 Controller (getD4):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
function analyzeExistingD4(req, res) {
  try {
    const payload = req.body;
    const rawData = payload.data ? (payload.data.raw || payload.data) : payload;
    const interpretation = processD4Chart(rawData);

    return res.status(200).json({
      success: true,
      data: interpretation
    });
  } catch (error) {
    console.error('Error in D4 Controller (analyzeExistingD4):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getD4,
  analyzeExistingD4
};