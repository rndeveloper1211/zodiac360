// E:/zodiac360/backend/src/engine/D1/D1.routes.js

const express = require('express');
const router = express.Router();
const { getD1, analyzeExistingD1 } = require('./D1.controller');

// 1. जन्म विवरण देकर Raw + Analysis एक साथ पाना:
// GET  /api/chart/d1?date=2000-01-11&time=04:30&lat=19.6988&lon=75.0086
// POST /api/chart/d1 (Body में { date, time, lat, lon })
router.route('/')
  .get(getD1)
  .post(getD1);

// 2. बना-बनाया D1 JSON भेजकर सिर्फ 6-लेयर व्याख्या पाना:
// POST /api/chart/d1/analyze
router.post('/analyze', analyzeExistingD1);

module.exports = router;