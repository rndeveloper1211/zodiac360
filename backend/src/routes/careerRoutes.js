// backend/src/routes/careerRoutes.js
const express = require('express');
const router = express.Router();
const { getCareerReport } = require('../controllers/careerController');

// POST http://localhost:5000/api/v1/career/report
router.post('/report', getCareerReport);

module.exports = router;