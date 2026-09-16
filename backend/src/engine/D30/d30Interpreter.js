const { D30_RULES } = require('./d30Rules');
const { computePlanetSeverity, detectDoshas, buildHealthProfile, severityLabel } = require('./d30DoshaEngine');

function interpretD30Chart(d30) {
  if (!d30?.lagna || !d30?.planets) {
    throw new Error('Valid D30 lagna and planets are required.');
  }

  const planetInsights = {};
  for (const [name, p] of Object.entries(d30.planets)) {
    const rule = D30_RULES[p.segmentLord] || null;
    const { score, severity, reasons } = computePlanetSeverity(name, p);

    planetInsights[name] = {
      planet: name,
      d30Sign: p.d30Sign,
      d30SignHindi: p.d30SignHindi,
      house: p.house,
      segmentLord: p.segmentLord,
      lordNature: rule?.nature || null,
      themes: rule?.themes || [],
      positive: rule?.positive || null,
      retrograde: Boolean(p.isRetrograde),
      severity,
      severityScore: score,
      severityReasons: reasons
    };
  }

  const doshas = detectDoshas(d30);
  const healthProfile = buildHealthProfile(d30.planets);

  // Overall chart-level severity = average of all planet scores, re-labeled
  const scores = Object.values(planetInsights).map(p => p.severityScore);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    chart: 'D30',
    chartName: 'Trimshamsha Chart',
    purpose: 'Difficulties, vulnerabilities, misfortunes, resilience and recovery patterns.',
    lagna: d30.lagna,
    planets: planetInsights,
    doshas,
    healthProfile,
    overallSeverity: {
      averageScore: Number(avgScore.toFixed(2)),
      label: severityLabel(Math.round(avgScore)),
      doshaCount: doshas.length,
      highSeverityDoshaCount: doshas.filter(d => d.severity === 'High').length
    }
  };
}

module.exports = { interpretD30Chart };