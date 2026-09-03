// src/routes/astroRoutes.js
const express = require('express');
const router = express.Router();
const { getPlanetaryPositions } = require('../controllers/astroController');

// POST /api/v1/astro/planets
router.post('/planets', getPlanetaryPositions);

module.exports = router;