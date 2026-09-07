const express = require('express');

const router = express.Router();

const D16Controller = require('./D16.controller');

// GET /api/chart/d16?lat=...&lon=...&time=HH:MM&date=YYYY-MM-DD
router.get('/', D16Controller.getD16Chart);

// POST /api/chart/d16
router.post('/', D16Controller.getD16Chart);

// POST /api/chart/d16/from-longitudes
router.post('/from-longitudes', D16Controller.getD16FromPlanetLongitudes);

module.exports = router;
