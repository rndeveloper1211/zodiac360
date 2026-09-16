const { buildPlanetInsights, buildOverallSummary } = require('./d45QualityEngine');

function interpretD45Chart(d45) {
  if (!d45?.lagna || !d45?.planets) {
    throw new Error('Valid D45 lagna and planets are required.');
  }

  const planetInsights = buildPlanetInsights(d45.planets);
  const overallSummary = buildOverallSummary(planetInsights, d45.lagna);

  return {
    chart: 'D45',
    chartName: 'Akshavedamsha Chart',
    purpose: 'Overall character and conduct (sheela/achara), moral baseline under pressure, and inherited paternal-lineage samskaras.',
    lagna: d45.lagna,
    planets: planetInsights,
    overallSummary
  };
}

module.exports = { interpretD45Chart };
