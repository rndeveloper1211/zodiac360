/**
 * D30 Dosha / severity engine.
 * Pure interpretation logic — reads an already-calculated D30 chart
 * (from D30.engine.js) and derives:
 *   1. a severity score + label per planet
 *   2. named doshas (rule-based flags, not universal scripture citations)
 *   3. an overall chart-level dosha summary
 *
 * NOTE: This is one consistent, documented rule-set for this application.
 * Different classical texts/traditions weigh trimshamsha doshas differently;
 * treat these as this app's house rules, not the only valid method.
 */

const { D30_RULES, PLANET_HEALTH, DUSTHANA_HOUSES, NATURAL_MALEFICS } = require('./d30Rules');

function severityLabel(score) {
  if (score >= 5) return 'Severe';
  if (score >= 3) return 'High';
  if (score >= 1) return 'Moderate';
  return 'Mild';
}

function computePlanetSeverity(planetName, planetData) {
  const rule = D30_RULES[planetData.segmentLord] || null;
  let score = 0;
  const reasons = [];

  if (rule?.nature === 'ashubha') {
    score += 2;
    reasons.push(`${planetData.segmentLord} (ashubha lord) के segment में स्थित`);
  } else if (rule?.nature === 'shubha') {
    reasons.push(`${planetData.segmentLord} (shubha lord) के segment में स्थित — कुछ राहत`);
  }

  if (DUSTHANA_HOUSES.includes(planetData.house)) {
    score += 2;
    reasons.push(`D30 के ${planetData.house}वें (dusthana) घर में स्थित`);
  }

  if (NATURAL_MALEFICS.includes(planetName)) {
    score += 1;
    reasons.push(`${planetName} स्वभाव से natural malefic है`);
  }

  if (planetData.isRetrograde) {
    score += 1;
    reasons.push('Retrograde — theme internal/repetitive रूप में प्रकट होती है');
  }

  return {
    score,
    severity: severityLabel(score),
    reasons
  };
}

/**
 * Named dosha detection — rule-based flags built from classical dusthana +
 * malefic-conjunction + Trimshamsha lord logic.
 */
function detectDoshas(d30) {
  const doshas = [];
  const { lagna, planets, houses } = d30;

  // 1. Lagna itself in an ashubha (Mars/Saturn) segment
  const lagnaRule = D30_RULES[lagna.segmentLord];
  if (lagnaRule?.nature === 'ashubha') {
    doshas.push({
      name: 'D30 Lagna Ashubhamsha Dosha',
      severity: 'High',
      description: `D30 Lagna, ${lagna.segmentLord} के ashubha segment में gira hai — is se overall personality crisis ko face karne ki natural tendency milti hai, base-line vulnerability thodi zyada rehti hai.`
    });
  }

  // 2. Multiple malefics conjunct in the same D30 house
  for (const [houseNum, houseData] of Object.entries(houses)) {
    const maleficsHere = houseData.planets.filter(p => NATURAL_MALEFICS.includes(p.name));
    if (maleficsHere.length >= 2) {
      doshas.push({
        name: `Grah-Yuti Dosha (House ${houseNum})`,
        severity: maleficsHere.length >= 3 ? 'High' : 'Moderate',
        description: `${houseData.sign} rashi ke ${houseNum}वें D30 घर mein ${maleficsHere.map(p => p.name).join(', ')} ikatthe hain — is house se sambandhit jeevan-kshetra mein sudden ya combined pressure aa sakta hai.`,
        house: Number(houseNum),
        planetsInvolved: maleficsHere.map(p => p.name)
      });
    }
  }

  // 3. Any planet (esp. Saturn/Mars/Rahu/Ketu) in 6th, 8th or 12th D30 house
  for (const [name, p] of Object.entries(planets)) {
    if (DUSTHANA_HOUSES.includes(p.house) && NATURAL_MALEFICS.includes(name)) {
      doshas.push({
        name: `Dusthana Affliction — ${name} in House ${p.house}`,
        severity: p.house === 8 ? 'High' : 'Moderate',
        description: `${name}, D30 ke ${p.house}वें ghar mein hai — ${p.house === 6 ? 'health/enemies/debt' : p.house === 8 ? 'longevity/sudden crisis/hidden trouble' : 'loss/isolation/hospitalization'} se related vulnerability dikhata hai.`,
        house: p.house,
        planet: name
      });
    }
  }

  // 4. Saturn in 8th house — classical "chronic health / longevity concern" flag
  if (planets.Saturn && planets.Saturn.house === 8) {
    doshas.push({
      name: 'Saturn-in-8th Chronic Health Flag',
      severity: 'High',
      description: 'Saturn D30 ke 8th house mein hone se koi chronic/long-term health issue ya delayed-recovery pattern dikhta hai — turant nahi, dheere-dheere develop hone wali cheez.'
    });
  }

  // 5. Rahu-Ketu axis falling across dusthana houses
  if (planets.Rahu && planets.Ketu) {
    if (DUSTHANA_HOUSES.includes(planets.Rahu.house) || DUSTHANA_HOUSES.includes(planets.Ketu.house)) {
      doshas.push({
        name: 'Rahu-Ketu Dusthana Axis',
        severity: 'Moderate',
        description: `Rahu (house ${planets.Rahu.house}) - Ketu (house ${planets.Ketu.house}) axis dusthana houses ko touch kar raha hai — confusion, unexplained setbacks ya sudden reversals ka pattern.`
      });
    }
  }

  return doshas;
}

function buildHealthProfile(planets) {
  const profile = {};
  for (const [name, p] of Object.entries(planets)) {
    const health = PLANET_HEALTH[name];
    if (!health) continue;
    const { severity, score, reasons } = computePlanetSeverity(name, p);
    profile[name] = {
      bodyParts: health.bodyParts,
      note: health.note,
      house: p.house,
      severity,
      score,
      reasons
    };
  }
  return profile;
}

module.exports = {
  computePlanetSeverity,
  detectDoshas,
  buildHealthProfile,
  severityLabel
};