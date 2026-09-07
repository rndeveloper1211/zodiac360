/**
 * Deprecated compatibility facade.
 * All D7 rules, including dignity/strength, are now in D7advancedrules.js.
 */

const {
  getPlanetDignity,
  analyzeDivisionalStrength
} = require('./D7advancedrules');

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength
};
