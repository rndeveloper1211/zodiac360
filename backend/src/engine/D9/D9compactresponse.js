/**
 * D9 Compact Public Response
 * Keeps deep analysis internal and exposes only key conclusions.
 * (Thin re-export — the actual builder lives in D9advancedrules.js so
 *  analyzeD9Deep's internal shape and the compactor stay in sync.)
 */
const { buildCompactD9Response } = require('./D9advancedrules');

function compactD9Analysis(analysis) {
  return buildCompactD9Response(analysis);
}

module.exports = { compactD9Analysis };
