/**
 * D10 Interpreter
 * ---------------
 * Thin orchestration layer only.
 * All D10 interpretation rules live in D10advancedrules.js.
 */

const { analyzeD10Deep } = require('./D10advancedrules');

function processD10Interpretation(d10ChartData, moonTotalDegree = null, birthDateISO = null, mahadashaSequence = null, context = {}) {
  return analyzeD10Deep(d10ChartData, {
    ...context,
    moonTotalDegree,
    birthDateISO,
    mahadashaSequence
  });
}

module.exports = {
  processD10Interpretation
};
