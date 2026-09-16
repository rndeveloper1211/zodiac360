'use strict';

const express = require('express');
const router = express.Router();

const {
  getD30,
  analyzeExistingD30
} = require('./D30.controller');

router.route('/').get(getD30).post(getD30);
router.post('/analyze', analyzeExistingD30);

module.exports = router;