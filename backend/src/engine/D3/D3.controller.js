// E:/zodiac360/backend/src/engine/D3/D3.controller.js

const { generateD1Report } = require('../D1/D1.service');
const { processD3Chart } = require('./d3Engine');

function getD3(req, res) {
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

    console.log('\n================== [1. GENERATED RAW DATA FOR D3] ==================');
    console.log(JSON.stringify(rawReport, null, 2));

    // 2. D3 द्रेष्काण चार्ट विश्लेषण इंजन को कॉल करना
    const rawData = rawReport.data ? (rawReport.data.raw || rawReport.data) : rawReport;
    const d3AnalysisReport = processD3Chart(rawData);

    // console.log('\n================== [2. GENERATED D3 ANALYSIS REPORT] ==================');
    // console.log(JSON.stringify(d3AnalysisReport, null, 2));
    // console.log('=======================================================================\n');

    return res.status(200).json({
      success: true,
      data: {
        // raw: rawReport,
        analysis: d3AnalysisReport
      }
    });
  } catch (error) {
    console.error('Error in D3 Controller (getD3):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function analyzeExistingD3(req, res) {
  try {
    const payload = req.body;

    console.log('\n================== [INCOMING RAW D1 PAYLOAD FOR D3] ==================');
    console.log(JSON.stringify(payload, null, 2));

    const rawData = payload.data ? (payload.data.raw || payload.data) : payload;
    const interpretation = processD3Chart(rawData);

    console.log('\n================== [PROCESSED D3 OUTPUT REPORT] ==================');
    console.log(JSON.stringify(interpretation, null, 2));
    console.log('===================================================================\n');

    return res.status(200).json({
      success: true,
      data: interpretation
    });
  } catch (error) {
    console.error('Error in D3 Controller (analyzeExistingD3):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getD3,
  analyzeExistingD3
};