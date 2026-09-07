const express = require('express');

const router = express.Router();

const D12Controller = require('./D12.controller');

// GET /api/chart/d12?lat=...&lon=...&time=HH:MM&date=YYYY-MM-DD
router.get('/', D12Controller.getD12Chart);

// POST /api/chart/d12
router.post('/', D12Controller.getD12Chart);

// POST /api/chart/d12/from-longitudes
router.post(
  '/from-longitudes',
  D12Controller.getD12FromPlanetLongitudes
);

module.exports = router;