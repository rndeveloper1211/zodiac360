/**
 * D24 Interpreter
 * ---------------
 * Thin orchestration layer only.
 * All D24 interpretation rules live in D24advancedrules.js.
 */

const { analyzeD24Deep } = require('./D24advancedrules');

function processD24Interpretation(d24ChartData, moonTotalDegree = null, birthDateISO = null, mahadashaSequence = null, context = {}) {
  return analyzeD24Deep(d24ChartData, {
    ...context,
    moonTotalDegree,
    birthDateISO,
    mahadashaSequence
  });
}

module.exports = {
  processD24Interpretation
};
