// E:/zodiac360/backend/src/engine/D2/D2.controller.js

const { generateD1Report } = require('../D1/D1.service');
const { analyzeD2Chart } = require('./d2Engine');

function getD2(req, res) {
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

    console.log('\n================== [1. GENERATED RAW DATA FOR D2] ==================');
    console.log(JSON.stringify(rawReport, null, 2));

    // 2. D2 होरा चार्ट विश्लेषण इंजन को कॉल करना
    const d2AnalysisReport = analyzeD2Chart({ data: { raw: rawReport } });

    console.log('\n================== [2. GENERATED D2 ANALYSIS REPORT] ==================');
    console.log(JSON.stringify(d2AnalysisReport, null, 2));
    console.log('=======================================================================\n');

    return res.status(200).json({
      success: true,
      data: {
      //  raw: rawReport,
        analysis: d2AnalysisReport
      }
    });
  } catch (error) {
    console.error('Error in D2 Controller (getD2):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function analyzeExistingD2(req, res) {
  try {
    const payload = req.body;

    console.log('\n================== [INCOMING RAW D1 PAYLOAD FOR D2] ==================');
    console.log(JSON.stringify(payload, null, 2));

    const interpretation = analyzeD2Chart(payload);

    console.log('\n================== [PROCESSED D2 OUTPUT REPORT] ==================');
    console.log(JSON.stringify(interpretation, null, 2));
    console.log('===================================================================\n');

    return res.status(200).json({
      success: true,
      data: interpretation
    });
  } catch (error) {
    console.error('Error in D2 Controller (analyzeExistingD2):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getD2,
  analyzeExistingD2
};