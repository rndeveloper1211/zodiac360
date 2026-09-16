'use strict';

const express = require('express');
const router = express.Router();

const {
  getD40,
  analyzeExistingD40
} = require('./D40.controller');

router.route('/').get(getD40).post(getD40);
router.post('/analyze', analyzeExistingD40);

module.exports = router;
