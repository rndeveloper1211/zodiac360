/**
 * D40 shubha/ashubha quality engine.
 * Reads an already-calculated D40 chart and derives a per-planet
 * auspiciousness score + label, plus an overall chart-level summary.
 *
 * NOTE: This is one consistent, documented rule-set for this application.
 * Different traditions weigh Khavedamsha shubha/ashubha differently;
 * treat this as this app's house rules, not the only valid method.
 */

const { LORD_NATURE, NATURAL_MALEFICS, KENDRA_TRIKONA_HOUSES, DUSTHANA_HOUSES, LORD_THEMES } = require('./d40Rules');

function qualityLabel(score) {
  if (score >= 3) return 'Very Auspicious';
  if (score >= 1) return 'Auspicious';
  if (score === 0) return 'Mixed';
  if (score >= -2) return 'Inauspicious';
  return 'Very Inauspicious';
}

function computePlanetQuality(planetName, planetData) {
  let score = 0;
  const reasons = [];

  const lordNature = LORD_NATURE[planetData.d40SignLord] || null;
  if (lordNature === 'shubha') {
    score += 2;
    reasons.push(`${planetData.d40SignLord} (shubha lord) की rashi mein sthith`);
  } else if (lordNature === 'ashubha') {
    score -= 2;
    reasons.push(`${planetData.d40SignLord} (ashubha lord) की rashi mein sthith`);
  }

  if (KENDRA_TRIKONA_HOUSES.includes(planetData.house)) {
    score += 1;
    reasons.push(`D40 ke ${planetData.house}वें (kendra/trikona) ghar mein — supportive placement`);
  } else if (DUSTHANA_HOUSES.includes(planetData.house)) {
    score -= 1;
    reasons.push(`D40 ke ${planetData.house}वें (dusthana) ghar mein — challenging placement`);
  }

  if (NATURAL_MALEFICS.includes(planetName) && lordNature === 'ashubha') {
    score -= 1;
    reasons.push(`${planetName} khud natural malefic hai aur ashubha rashi mein bhi — double weight`);
  }

  if (planetData.isRetrograde) {
    score -= 1;
    reasons.push('Retrograde — theme delayed ya unresolved roop mein prakat hoti hai');
  }

  return { score, quality: qualityLabel(score), reasons };
}

function buildPlanetInsights(planets) {
  const insights = {};
  for (const [name, p] of Object.entries(planets)) {
    const rule = LORD_THEMES[p.d40SignLord] || null;
    const { score, quality, reasons } = computePlanetQuality(name, p);

    insights[name] = {
      planet: name,
      d40Sign: p.d40Sign,
      d40SignHindi: p.d40SignHindi,
      d40SignLord: p.d40SignLord,
      house: p.house,
      retrograde: Boolean(p.isRetrograde),
      themes: rule?.themes || [],
      positive: rule?.positive || null,
      quality,
      qualityScore: score,
      qualityReasons: reasons
    };
  }
  return insights;
}

function buildOverallSummary(planetInsights, lagna) {
  const lagnaLordNature = LORD_NATURE[lagna.d40SignLord] || null;
  const scores = Object.values(planetInsights).map(p => p.qualityScore);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    lagnaLordNature,
    lagnaNote: lagnaLordNature === 'shubha'
      ? 'D40 Lagna ek shubha-lord ki rashi mein hai — maternal side se overall support/blessing ka aadhar strong hai.'
      : lagnaLordNature === 'ashubha'
        ? 'D40 Lagna ek ashubha-lord ki rashi mein hai — maternal side se juda koi structural challenge ya distance ho sakta hai.'
        : 'D40 Lagna ka lord neutral hai.',
    averageScore: Number(avgScore.toFixed(2)),
    label: qualityLabel(Math.round(avgScore)),
    auspiciousCount: scores.filter(s => s > 0).length,
    inauspiciousCount: scores.filter(s => s < 0).length,
    mixedCount: scores.filter(s => s === 0).length
  };
}

module.exports = {
  computePlanetQuality,
  buildPlanetInsights,
  buildOverallSummary,
  qualityLabel
};
