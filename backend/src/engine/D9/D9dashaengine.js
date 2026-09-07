/**
 * D9 Dasha compatibility facade.
 *
 * IMPORTANT: Actual dasha/marriage-timing rules are owned by D9advancedrules.js.
 * This file exists only so older imports do not break.
 */

const {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaMarriageTimeline,
  TIMING_CAVEAT
} = require('./D9advancedrules');

module.exports = {
  DASHA_ORDER,
  DASHA_YEARS,
  computeMahadashaSequence,
  buildAntardashaSequence,
  buildDashaMarriageTimeline,
  TIMING_CAVEAT
};
