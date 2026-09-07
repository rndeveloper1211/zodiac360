const express = require('express');

const router = express.Router();

const D20Controller = require('./D20.controller');

// GET /api/chart/d20?lat=...&lon=...&time=HH:MM&date=YYYY-MM-DD
router.get('/', D20Controller.getD20Chart);

// POST /api/chart/d20
router.post('/', D20Controller.getD20Chart);

// POST /api/chart/d20/from-longitudes
router.post('/from-longitudes', D20Controller.getD20FromPlanetLongitudes);

module.exports = router;
