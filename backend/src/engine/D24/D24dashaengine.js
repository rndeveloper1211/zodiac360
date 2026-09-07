/**
 * D24 Dasha compatibility facade.
 *
 * IMPORTANT: Actual dasha/education-timing rules are owned by D24advancedrules.js.
 * This file exists only so older imports do not break.
 */

const {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaEducationTimeline,
  TIMING_CAVEAT
} = require('./D24advancedrules');

module.exports = {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaEducationTimeline,
  TIMING_CAVEAT
};
