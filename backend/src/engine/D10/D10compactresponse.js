/**
 * D10 Compact Public Response
 * Keeps deep analysis internal and exposes only key conclusions.
 * (Thin re-export — the actual builder lives in D10advancedrules.js so
 *  analyzeD10Deep's internal shape and the compactor stay in sync.)
 */
const { buildCompactD10Response } = require('./D10advancedrules');

function compactD10Analysis(analysis) {
  return buildCompactD10Response(analysis);
}

module.exports = { compactD10Analysis };
