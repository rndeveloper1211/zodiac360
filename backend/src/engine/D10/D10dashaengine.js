/**
 * D10 Dasha compatibility facade.
 *
 * IMPORTANT: Actual dasha/career-timing rules are owned by D10advancedrules.js.
 * This file exists only so older imports do not break.
 */

const {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaCareerTimeline,
  TIMING_CAVEAT
} = require('./D10advancedrules');

module.exports = {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaCareerTimeline,
  TIMING_CAVEAT
};
