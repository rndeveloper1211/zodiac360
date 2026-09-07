/**
 * Deprecated compatibility facade.
 * All D10 rules, including dignity/strength, are now in D10advancedrules.js.
 */

const {
  getPlanetDignity,
  analyzeDivisionalStrength
} = require('./D10advancedrules');

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength
};
