/**
 * D24 Education Field Engine
 * --------------------------
 * Produces a ranked subject/field tendency instead of the old
 * "4th-sign element => field" shortcut.
 *
 * This is a heuristic Vedic-astrology layer, not a deterministic
 * course/degree predictor. D24 is weighted more heavily than D1 because
 * D24 is the education/vidya divisional chart.
 */

const { SIGNS, SIGN_LORDS, EXALTATION_SIGN, DEBILITATION_SIGN, OWN_SIGNS } = require('./d24Rules');

const FIELDS = Object.freeze({
  IT_SOFTWARE: 'IT / Software / Technology',
  ENGINEERING: 'Engineering / Technical',
  MEDICAL: 'Medical / Healthcare',
  FINANCE: 'Finance / Banking / Accounting',
  BUSINESS: 'Business / Entrepreneurship',
  MANAGEMENT: 'Management / Administration',
  GOVERNMENT: 'Government / Public Administration',
  DEFENCE: 'Defence / Police / Security',
  LAW: 'Law / Legal',
  EDUCATION: 'Education / Teaching',
  SCIENCE_RESEARCH: 'Science / Research',
  SALES_MARKETING: 'Sales / Marketing / Communication',
  DESIGN_MEDIA: 'Design / Media / Creative',
  SOCIAL_HUMANITIES: 'Psychology / Social Sciences / Humanities',
  REAL_ESTATE: 'Real Estate / Property / Architecture'
});

const FIELD_RULES = Object.freeze({
  [FIELDS.IT_SOFTWARE]: {
    planets: { Mercury: 24, Rahu: 18, Saturn: 12, Ketu: 8 },
    houses: { 3: 12, 5: 10, 6: 12, 8: 8, 10: 18, 11: 14 },
    signs: { 3: 8, 6: 10, 11: 10 }
  },
  [FIELDS.ENGINEERING]: {
    planets: { Mars: 24, Saturn: 16, Mercury: 14, Rahu: 12, Sun: 6 },
    houses: { 3: 12, 5: 8, 6: 14, 8: 8, 10: 18, 11: 10 },
    signs: { 1: 8, 8: 8, 10: 10, 11: 10 }
  },
  [FIELDS.MEDICAL]: {
    planets: { Sun: 12, Moon: 12, Mars: 18, Mercury: 10, Ketu: 14, Jupiter: 8 },
    houses: { 5: 10, 6: 18, 8: 16, 10: 12, 12: 14 },
    signs: { 4: 6, 6: 10, 8: 10, 12: 8 }
  },
  [FIELDS.FINANCE]: {
    planets: { Mercury: 22, Jupiter: 18, Venus: 14, Moon: 8, Saturn: 8 },
    houses: { 2: 18, 5: 12, 8: 12, 10: 12, 11: 18 },
    signs: { 2: 10, 6: 12, 7: 8, 10: 8 }
  },
  [FIELDS.BUSINESS]: {
    planets: { Mercury: 16, Mars: 14, Venus: 12, Rahu: 14, Jupiter: 8, Sun: 6 },
    houses: { 2: 10, 3: 14, 5: 8, 7: 18, 10: 14, 11: 18 },
    signs: { 1: 6, 3: 10, 7: 10, 11: 10 }
  },
  [FIELDS.MANAGEMENT]: {
    planets: { Sun: 18, Jupiter: 18, Saturn: 14, Mars: 10, Mercury: 8 },
    houses: { 1: 8, 5: 12, 9: 14, 10: 22, 11: 14 },
    signs: { 1: 8, 5: 10, 9: 10, 10: 10 }
  },
  [FIELDS.GOVERNMENT]: {
    planets: { Sun: 24, Saturn: 18, Jupiter: 14, Mars: 8 },
    houses: { 1: 6, 6: 14, 9: 16, 10: 22, 11: 14 },
    signs: { 5: 12, 9: 8, 10: 12 }
  },
  [FIELDS.DEFENCE]: {
    planets: { Mars: 24, Sun: 18, Saturn: 16, Rahu: 12, Ketu: 8 },
    houses: { 3: 16, 6: 22, 8: 8, 10: 18, 11: 10 },
    signs: { 1: 10, 5: 8, 8: 10, 10: 8 }
  },
  [FIELDS.LAW]: {
    planets: { Jupiter: 20, Venus: 14, Mercury: 14, Saturn: 12, Sun: 8 },
    houses: { 2: 10, 6: 18, 7: 16, 9: 20, 10: 14, 11: 8 },
    signs: { 7: 12, 9: 12, 10: 8 }
  },
  [FIELDS.EDUCATION]: {
    planets: { Jupiter: 24, Mercury: 18, Moon: 10, Venus: 8 },
    houses: { 2: 8, 4: 16, 5: 18, 9: 22, 10: 12, 11: 10 },
    signs: { 3: 8, 4: 6, 9: 12, 12: 10 }
  },
  [FIELDS.SCIENCE_RESEARCH]: {
    planets: { Mercury: 16, Jupiter: 14, Saturn: 14, Rahu: 14, Ketu: 16, Mars: 10 },
    houses: { 5: 18, 6: 10, 8: 22, 9: 12, 10: 10, 12: 16 },
    signs: { 6: 12, 8: 14, 11: 12 }
  },
  [FIELDS.SALES_MARKETING]: {
    planets: { Mercury: 22, Venus: 14, Mars: 10, Rahu: 12, Moon: 8 },
    houses: { 2: 10, 3: 20, 7: 14, 10: 16, 11: 18 },
    signs: { 3: 14, 7: 10, 11: 8 }
  },
  [FIELDS.DESIGN_MEDIA]: {
    planets: { Venus: 24, Mercury: 16, Moon: 14, Rahu: 12, Sun: 6 },
    houses: { 3: 16, 5: 20, 7: 12, 10: 18, 11: 10 },
    signs: { 2: 8, 5: 10, 7: 12, 12: 8 }
  },
  [FIELDS.SOCIAL_HUMANITIES]: {
    planets: { Moon: 18, Jupiter: 18, Mercury: 14, Venus: 10, Saturn: 8 },
    houses: { 2: 10, 4: 14, 5: 16, 9: 20, 10: 10, 12: 10 },
    signs: { 4: 10, 7: 8, 9: 12, 12: 8 }
  },
  [FIELDS.REAL_ESTATE]: {
    planets: { Mars: 18, Moon: 14, Venus: 12, Saturn: 14, Mercury: 6 },
    houses: { 2: 8, 4: 22, 10: 18, 11: 16 },
    signs: { 2: 8, 4: 10, 10: 10 }
  }
});

const STREAM_MAP = Object.freeze({
  [FIELDS.IT_SOFTWARE]: 'Science / Technical',
  [FIELDS.ENGINEERING]: 'Science / Technical',
  [FIELDS.MEDICAL]: 'Science / Technical',
  [FIELDS.FINANCE]: 'Commerce / Business',
  [FIELDS.BUSINESS]: 'Commerce / Business',
  [FIELDS.MANAGEMENT]: 'Commerce / Business',
  [FIELDS.GOVERNMENT]: 'Humanities / Social Science',
  [FIELDS.DEFENCE]: 'Science / Technical',
  [FIELDS.LAW]: 'Humanities / Social Science',
  [FIELDS.EDUCATION]: 'Humanities / Social Science',
  [FIELDS.SCIENCE_RESEARCH]: 'Science / Technical',
  [FIELDS.SALES_MARKETING]: 'Commerce / Business',
  [FIELDS.DESIGN_MEDIA]: 'Arts / Creative',
  [FIELDS.SOCIAL_HUMANITIES]: 'Humanities / Social Science',
  [FIELDS.REAL_ESTATE]: 'Vocational / Applied'
});

function dignity(planet, signId) {
  if (EXALTATION_SIGN[planet] === signId) return 1.25;
  if (DEBILITATION_SIGN[planet] === signId) return 0.55;
  if ((OWN_SIGNS[planet] || []).includes(signId)) return 1.15;
  return 1;
}

function normalizeSignId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;
}

function getPlanetRows(chartData) {
  return Object.entries(chartData?.planetCalculations || {}).map(([planet, p]) => ({
    planet,
    signId: normalizeSignId(p.d24SignId),
    house: Number(p.house),
    strength: dignity(planet, normalizeSignId(p.d24SignId)),
    repeat: Boolean(p.isSignRepeat)
  }));
}

function getD1Rows(d1RawData) {
  const grahas = d1RawData?.grahas || d1RawData?.planets || {};
  const lagnaSignId = normalizeSignId(d1RawData?.lagna?.signId);
  return Object.entries(grahas).map(([planet, p]) => {
    const signId = normalizeSignId(p.signId);
    const explicitHouse = Number(p.house || p.bhava || p.houseNumber || 0);
    const derivedHouse = lagnaSignId && signId
      ? ((signId - lagnaSignId + 12) % 12) + 1
      : 0;
    return { planet, signId, house: explicitHouse || derivedHouse };
  });
}

function scoreField(fieldName, d24ChartData, d1RawData = null) {
  const rule = FIELD_RULES[fieldName];
  let score = 0;
  const evidence = [];
  const rows = getPlanetRows(d24ChartData);

  for (const row of rows) {
    const planetWeight = rule.planets[row.planet] || 0;
    if (planetWeight) {
      const points = planetWeight * row.strength + (row.repeat ? 3 : 0);
      score += points;
      evidence.push({ source: 'D24 planet', planet: row.planet, points: Math.round(points) });
    }
    const houseWeight = rule.houses[row.house] || 0;
    if (houseWeight) {
      score += houseWeight;
      evidence.push({ source: 'D24 house', planet: row.planet, house: row.house, points: houseWeight });
    }
    const signWeight = rule.signs[row.signId] || 0;
    if (signWeight) {
      score += signWeight * row.strength;
      evidence.push({ source: 'D24 sign', planet: row.planet, signId: row.signId, points: Math.round(signWeight * row.strength) });
    }
  }

  // D1 is a confirmation layer, not the primary source.
  const d1Rows = getD1Rows(d1RawData);
  for (const row of d1Rows) {
    const pw = rule.planets[row.planet] || 0;
    if (pw) score += pw * 0.35;
    const hw = rule.houses[row.house] || 0;
    if (hw) score += hw * 0.25;
    const sw = rule.signs[row.signId] || 0;
    if (sw) score += sw * 0.20;
  }

  return { rawScore: score, evidence };
}

function confidenceFrom(scores) {
  if (!scores.length) return 'low';
  const top = scores[0]?.score || 0;
  const second = scores[1]?.score || 0;
  const margin = top - second;
  if (top >= 72 && margin >= 10) return 'high';
  if (top >= 58 && margin >= 6) return 'medium-high';
  if (top >= 45) return 'medium';
  return 'low';
}

function analyzeEducationField(d24ChartData, d1RawData = null) {
  const raw = Object.keys(FIELD_RULES).map(field => {
    const result = scoreField(field, d24ChartData, d1RawData);
    return { field, rawScore: result.rawScore, evidence: result.evidence };
  });

  const maxRaw = Math.max(...raw.map(x => x.rawScore), 1);
  const ranked = raw
    .map(x => ({
      field: x.field,
      score: Math.round(Math.min(100, (x.rawScore / maxRaw) * 100)),
      stream: STREAM_MAP[x.field],
      evidence: x.evidence.sort((a, b) => b.points - a.points).slice(0, 6)
    }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0] || null;
  const alternatives = ranked.slice(1, 4);
  const confidence = confidenceFrom(ranked);

  return {
    primary: primary?.field || null,
    primaryScore: primary?.score || 0,
    primaryStream: primary?.stream || null,
    confidence,
    alternatives,
    rankedFields: ranked,
    method: 'D24 weighted by planets + houses + signs, with D1 confirmation layer',
    caveat: 'Field scores are qualitative Vedic-astrology heuristics. They should not be treated as deterministic course, degree, college, or profession predictions.'
  };
}

module.exports = { FIELDS, FIELD_RULES, STREAM_MAP, analyzeEducationField, scoreField };
