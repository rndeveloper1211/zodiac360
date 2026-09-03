// backend/src/routes/chartRoutes.js
const express = require('express');
const router = express.Router();
const { getD1Chart } = require('../controllers/chartController');
const { analyzeD1Chart } = require('../engine/D1/d1Engine');

// 1. Raw D1 Chart Data Calculation API
// POST /api/v1/chart/d1
router.post('/d1', getD1Chart);

// 2. D1 Interpretation & Analysis API
// POST /api/v1/chart/analyze-d1
router.post('/analyze-d1', (req, res) => {
  try {
    const result = analyzeD1Chart(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "D1 Analysis Engine Error", 
      error: error.message 
    });
  }
});

module.exports = router;