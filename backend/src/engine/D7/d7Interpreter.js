/**
 * D7 Interpreter
 * --------------
 * Thin orchestration layer only.
 * All D7 interpretation rules live in D7advancedrules.js.
 */

const { analyzeD7Deep } = require('./D7advancedrules');

function processD7Interpretation(d7ChartData, moonTotalDegree = null, birthDateISO = null, mahadashaSequence = null, context = {}) {
  return analyzeD7Deep(d7ChartData, {
    ...context,
    moonTotalDegree,
    birthDateISO,
    mahadashaSequence
  });
}

module.exports = {
  processD7Interpretation
};
