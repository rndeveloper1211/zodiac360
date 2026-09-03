// E:/zodiac360/backend/src/engine/D2/D2.routes.js

const express = require('express');
const router = express.Router();
const { getD2, analyzeExistingD2 } = require('./D2.controller');

// 1. जन्म विवरण देकर D2 (होरा चार्ट) विश्लेषण पाना:
// GET  /api/chart/d2?date=2000-11-06&time=04:30&lat=19.6988&lon=75.0086
// POST /api/chart/d2 (Body में { date, time, lat, lon })
router.route('/')
  .get(getD2)
  .post(getD2);

// 2. पहले से बना हुआ D1 Raw JSON भेजकर D2 विश्लेषण पाना:
// POST /api/chart/d2/analyze
router.post('/analyze', analyzeExistingD2);

module.exports = router;