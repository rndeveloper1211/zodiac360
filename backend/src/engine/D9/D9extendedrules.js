/**
 * Deprecated compatibility facade.
 * All D9 rules, including dignity/strength/Vargottama, are now in D9advancedrules.js.
 */

const {
  getPlanetDignity,
  analyzeDivisionalStrength
} = require('./D9advancedrules');

module.exports = {
  getPlanetDignity,
  analyzeDivisionalStrength
};
