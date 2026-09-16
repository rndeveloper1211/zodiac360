'use strict';

const {
  generateD30Report,
  processExistingD1ToD30
} = require('./D30.service');

function getD30(req, res) {
  try {
    const params = Object.keys(req.query || {}).length
      ? req.query
      : (req.body || {});

    const { date, time, lat, lon, tz, timezone } = params;

    if (!date || !time || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required params: 'date' (YYYY-MM-DD), 'time' (HH:MM), 'lat', 'lon'."
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);
    const timezoneValue = tz !== undefined
      ? Number(tz)
      : (timezone !== undefined ? Number(timezone) : 5.5);

    if (!Number.isFinite(latitude)) {
      return res.status(400).json({ success: false, error: 'Invalid latitude.' });
    }
    if (!Number.isFinite(longitude)) {
      return res.status(400).json({ success: false, error: 'Invalid longitude.' });
    }
    if (!Number.isFinite(timezoneValue)) {
      return res.status(400).json({ success: false, error: 'Invalid timezone.' });
    }

    const report = generateD30Report({
      date,
      time,
      lat: latitude,
      lon: longitude,
      timezone: timezoneValue
    });

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('[D30] Controller Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

function analyzeExistingD30(req, res) {
  try {
    const body = req.body || {};
    const d1Chart = body.chart && typeof body.chart === 'object'
      ? body.chart
      : body;

    if (!d1Chart?.lagna || !d1Chart?.planets) {
      return res.status(400).json({
        success: false,
        error: 'Valid D1 chart with lagna and planets is required.'
      });
    }

    const chart = processExistingD1ToD30(d1Chart);
    return res.status(200).json({ success: true, data: chart });
  } catch (error) {
    console.error('[D30] Analyze Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getD30, analyzeExistingD30 };