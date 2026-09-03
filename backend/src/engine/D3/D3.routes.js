// E:/zodiac360/backend/src/engine/D3/D3.routes.js

const express = require('express');
const router = express.Router();
const { getD3, analyzeExistingD3 } = require('./D3.controller');

// GET & POST dono support karega (query params ya JSON body)
router.get('/', getD3);
router.post('/', getD3);

// Direct existing D1 payload bhejne par
router.post('/from-d1', analyzeExistingD3);

module.exports = router;