const express = require('express');
const router = express.Router();
const { processD7Chart } = require('./d7Engine');
const { generateD1Report } = require('../D1/D1.service');

router.post('/', (req, res) => {
  try {
    const params = Object.keys(req.query).length > 0 ? req.query : req.body;
    const { date, time, lat, lon, tz } = params;

    if (!date || !time || lat === undefined || lon === undefined) {
      return res.status(400).json({ success: false, error: "Missing required params: date, time, lat, lon" });
    }

    const rawReport = generateD1Report({
      date, time, lat: parseFloat(lat), lon: parseFloat(lon), timezone: tz ? parseFloat(tz) : 5.5
    });
    
    const rawData = rawReport.data ? (rawReport.data.raw || rawReport.data) : rawReport;
    const d7Result = processD7Chart(rawData);

    return res.status(200).json({ success: true, data: d7Result.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;