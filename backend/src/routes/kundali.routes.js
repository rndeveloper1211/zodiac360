const express = require('express');
const router = express.Router();
const kundaliController = require('../controllers/kundali.controller');

router.get('/calculate', kundaliController.getKundali);

module.exports = router;