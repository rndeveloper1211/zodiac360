/**
 * D7 Dasha compatibility facade.
 *
 * IMPORTANT: Actual dasha/progeny rules are owned by D7advancedrules.js.
 * This file exists only so older imports do not break.
 */

const {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildDashaSantaanTimeline
} = require('./D7advancedrules');

module.exports = {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildDashaSantaanTimeline
};
