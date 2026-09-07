/**
 * D7 Compact Public Response
 * Keeps deep analysis internal and exposes only key conclusions.
 */
function compactD7Analysis(analysis) {
  const a = analysis || {};
  const get = (o, keys) => {
    if (!o || typeof o !== 'object') return {};
    return Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));
  };
  return {
    summary: get(a.summary, [
      'overallScore','progenyPromise','delayLevel',
      'obstructionLevel','expansionSupport','confidence'
    ]),
    progeny: {
      fifthHouse: get(a.fifthHouseAndLord, ['score','strength','confidence','summary']),
      fifthLord: get(a.fifthHouseAndLord, ['lord','lordScore','lordStrength','lordConfidence']),
      jupiter: get(a.jupiterPutraKaraka, ['score','strength','confidence','summary']),
      expansion: get(a.santaanExpansion, ['indication','support','score','confidence','summary']),
      nature: get(a.santaanNature, ['indication','score','confidence','summary'])
    },
    delayAndObstruction: get(a.delayAndObstruction, [
      'delayLevel','delayScore','severeObstruction','obstructionScore','confidence','summary'
    ]),
    timing: {
      strongWindows: Array.isArray(a.timingWindows) ? a.timingWindows.slice(0,8) : []
    },
    evidence: {
      positive: Array.isArray(a.evidence?.positive) ? a.evidence.positive.slice(0,8) : [],
      challenging: Array.isArray(a.evidence?.challenging) ? a.evidence.challenging.slice(0,8) : []
    },
    synthesis: a.synthesisText || null
  };
}
module.exports = { compactD7Analysis };
