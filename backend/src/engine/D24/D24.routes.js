const express = require('express');
const router = express.Router();
const { processD24Chart } = require('./d24Engine');
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

    const container = rawReport?.data || rawReport;
    const rawData = container?.raw || container;
    const d1Analysis = container?.analysis || rawReport?.analysis || null;
    const d24Result = processD24Chart(rawData, { d1Analysis });

    return res.status(200).json({ success: true, data: d24Result.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
