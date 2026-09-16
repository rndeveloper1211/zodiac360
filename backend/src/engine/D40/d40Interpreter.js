const { buildPlanetInsights, buildOverallSummary } = require('./d40QualityEngine');

function interpretD40Chart(d40) {
  if (!d40?.lagna || !d40?.planets) {
    throw new Error('Valid D40 lagna and planets are required.');
  }

  const planetInsights = buildPlanetInsights(d40.planets);
  const overallSummary = buildOverallSummary(planetInsights, d40.lagna);

  return {
    chart: 'D40',
    chartName: 'Khavedamsha Chart',
    purpose: 'Maternal-side shubh-ashubh (auspicious/inauspicious) effects, general fortune and lineage-linked blessings/obstacles.',
    lagna: d40.lagna,
    planets: planetInsights,
    overallSummary
  };
}

module.exports = { interpretD40Chart };
