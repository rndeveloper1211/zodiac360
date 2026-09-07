/**
 * D9 Interpreter
 * --------------
 * Thin orchestration layer only.
 * All D9 interpretation rules live in D9advancedrules.js.
 */

const { analyzeD9Deep } = require('./D9advancedrules');

function processD9Interpretation(d9ChartData, moonTotalDegree = null, birthDateISO = null, mahadashaSequence = null, context = {}) {
  return analyzeD9Deep(d9ChartData, {
    ...context,
    moonTotalDegree,
    birthDateISO,
    mahadashaSequence
  });
}

module.exports = {
  processD9Interpretation
};
