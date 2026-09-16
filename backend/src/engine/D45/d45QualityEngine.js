/**
 * D45 character/conduct quality engine.
 * Reads an already-calculated D45 chart and derives a per-planet
 * conduct score + label, plus an overall chart-level summary.
 *
 * NOTE: This is one consistent, documented rule-set for this application.
 * Different traditions weigh Akshavedamsha differently; treat this as this
 * app's house rules, not the only valid method. Scoring weights are kept
 * deliberately parallel to d40QualityEngine so the two vargas stay
 * comparable within this app — with one addition (dharma houses), which is
 * specific to a character varga.
 */

const {
  LORD_NATURE,
  NATURAL_MALEFICS,
  KENDRA_TRIKONA_HOUSES,
  DUSTHANA_HOUSES,
  DHARMA_HOUSES,
  LORD_THEMES,
  DEITY_THEMES
} = require('./d45Rules');

function qualityLabel(score) {
  if (score >= 3) return 'Very Strong Conduct';
  if (score >= 1) return 'Strong Conduct';
  if (score === 0) return 'Mixed';
  if (score >= -2) return 'Strained Conduct';
  return 'Very Strained Conduct';
}

function computePlanetQuality(planetName, planetData) {
  let score = 0;
  const reasons = [];

  const lordNature = LORD_NATURE[planetData.d45SignLord] || null;
  if (lordNature === 'shubha') {
    score += 2;
    reasons.push(`${planetData.d45SignLord} (shubha lord) की rashi mein sthith`);
  } else if (lordNature === 'ashubha') {
    score -= 2;
    reasons.push(`${planetData.d45SignLord} (ashubha lord) की rashi mein sthith`);
  }

  if (KENDRA_TRIKONA_HOUSES.includes(planetData.house)) {
    score += 1;
    reasons.push(`D45 ke ${planetData.house}वें (kendra/trikona) ghar mein — supportive placement`);
  } else if (DUSTHANA_HOUSES.includes(planetData.house)) {
    score -= 1;
    reasons.push(`D45 ke ${planetData.house}वें (dusthana) ghar mein — challenging placement`);
  }

  // Character-varga specific: dharma trine carries extra weight for conduct.
  if (DHARMA_HOUSES.includes(planetData.house)) {
    score += 1;
    reasons.push(`Dharma trikona (${planetData.house}वां ghar) mein — aachran par seedha shubh asar`);
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
    const rule = LORD_THEMES[p.d45SignLord] || null;
    const deity = DEITY_THEMES[p.deity] || null;
    const { score, quality, reasons } = computePlanetQuality(name, p);

    insights[name] = {
      planet: name,
      d45Sign: p.d45Sign,
      d45SignHindi: p.d45SignHindi,
      d45SignLord: p.d45SignLord,
      house: p.house,
      retrograde: Boolean(p.isRetrograde),
      segmentNumber: p.segmentNumber,
      deity: p.deity,
      deityOrientation: deity?.orientation || null,
      deityThemes: deity?.themes || [],
      deityNote: deity?.note || null,
      themes: rule?.themes || [],
      positive: rule?.positive || null,
      caution: rule?.caution || null,
      quality,
      qualityScore: score,
      qualityReasons: reasons
    };
  }
  return insights;
}

function buildDeityDistribution(planetInsights) {
  const counts = { Brahma: 0, Vishnu: 0, Maheshwara: 0 };
  for (const p of Object.values(planetInsights)) {
    if (counts[p.deity] !== undefined) counts[p.deity] += 1;
  }

  let dominant = null;
  let max = -1;
  for (const [deity, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = deity;
    }
  }

  const tied = Object.entries(counts).filter(([, c]) => c === max).map(([d]) => d);

  return {
    counts,
    dominantDeity: tied.length > 1 ? null : dominant,
    tiedDeities: tied.length > 1 ? tied : [],
    note: tied.length > 1
      ? 'Koi ek deity haavi nahi — aachran mein srijan, paalan aur parivartan teenon ka mila-jula rang.'
      : (DEITY_THEMES[dominant]?.note || null)
  };
}

function buildOverallSummary(planetInsights, lagna) {
  const lagnaLordNature = LORD_NATURE[lagna.d45SignLord] || null;
  const scores = Object.values(planetInsights).map(p => p.qualityScore);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    lagnaLordNature,
    lagnaDeity: lagna.deity || null,
    lagnaNote: lagnaLordNature === 'shubha'
      ? 'D45 Lagna ek shubha-lord ki rashi mein hai — charitra ka aadhar (moral baseline) strong hai, dabav mein bhi conduct tikne ki sambhavna zyada.'
      : lagnaLordNature === 'ashubha'
        ? 'D45 Lagna ek ashubha-lord ki rashi mein hai — aachran mein structural sakhti ya andaruni tanav; charitra parishram se banta hai, apne aap nahi.'
        : 'D45 Lagna ka lord neutral hai.',
    deityDistribution: buildDeityDistribution(planetInsights),
    averageScore: Number(avgScore.toFixed(2)),
    label: qualityLabel(Math.round(avgScore)),
    strongCount: scores.filter(s => s > 0).length,
    strainedCount: scores.filter(s => s < 0).length,
    mixedCount: scores.filter(s => s === 0).length
  };
}

module.exports = {
  computePlanetQuality,
  buildPlanetInsights,
  buildDeityDistribution,
  buildOverallSummary,
  qualityLabel
};
