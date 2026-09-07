/**
 * Deprecated compatibility facade.
 * All D24 rules, including dignity/strength, are now in D24advancedrules.js.
 */

const {
  getPlanetDignity,
  analyzeDivisionalStrength
} = require('./D24advancedrules');

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength
};
