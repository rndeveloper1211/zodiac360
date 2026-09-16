'use strict';

const express = require('express');
const router = express.Router();

const {
  getD45,
  analyzeExistingD45
} = require('./D45.controller');

router.route('/').get(getD45).post(getD45);
router.post('/analyze', analyzeExistingD45);

module.exports = router;
