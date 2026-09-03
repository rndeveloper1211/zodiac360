// E:/zodiac360/backend/src/engine/D1/D1.controller.js

const { generateD1Report } = require('./D1.service');
const { analyzeD1Chart } = require('./d1Engine');

function getD1(req, res) {
  try {
    const params = Object.keys(req.query).length > 0 ? req.query : req.body;
    const { date, time, lat, lon, tz, timezone } = params;

    if (!date || !time || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required params: 'date' (YYYY-MM-DD), 'time' (HH:MM), 'lat', 'lon'."
      });
    }

    // 1. Astronomy Engine से Raw D1 डेटा जनरेट करना
    const rawReport = generateD1Report({
      date,
      time,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      timezone: tz ? parseFloat(tz) : (timezone ? parseFloat(timezone) : 5.5)
    });

    // ==========================================
    // 🔍 STEP 1: इनपुट D1 डेटा यहाँ प्रिंट होगा
    // ==========================================
    console.log('\n================== [1. INCOMING D1 RAW DATA] ==================');
    console.log(JSON.stringify(rawReport, null, 2));

    // 2. व्याख्या इंजन (6-Layer Interpretation)
    const analysisReport = analyzeD1Chart(rawReport);

    // ==========================================
    // 🎯 STEP 2: जनरेट हुआ पूरा आउटपुट यहाँ प्रिंट होगा
    // ==========================================
    console.log('\n================== [2. GENERATED D1 ANALYSIS REPORT] ==================');
    console.log(JSON.stringify(analysisReport, null, 2));
    console.log('========================================================================\n');

    return res.status(200).json({
      success: true,
      data: {
       // raw: rawReport,
        analysis: analysisReport
      }
    });
  } catch (error) {
    console.error('Error in D1 Controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function analyzeExistingD1(req, res) {
  try {
    const payload = req.body;

    console.log('\n================== [INCOMING RAW D1 PAYLOAD] ==================');
    console.log(JSON.stringify(payload, null, 2));

    const interpretation = analyzeD1Chart(payload);

    console.log('\n================== [PROCESSED OUTPUT REPORT] ==================');
    console.log(JSON.stringify(interpretation, null, 2));
    console.log('================================================================\n');

    return res.status(200).json({
      success: true,
      data: interpretation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getD1,
  analyzeExistingD1
};