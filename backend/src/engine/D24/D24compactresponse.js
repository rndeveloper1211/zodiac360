/**
 * D24 Compact Public Response
 * Keeps deep analysis internal and exposes only key conclusions.
 * (Thin re-export — the actual builder lives in D24advancedrules.js so
 *  analyzeD24Deep's internal shape and the compactor stay in sync.)
 */
const { buildCompactD24Response } = require('./D24advancedrules');

function compactD24Analysis(analysis) {
  return buildCompactD24Response(analysis);
}

module.exports = { compactD24Analysis };
