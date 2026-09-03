const { PLANET_DIGNITIES } = require('../config/constants');

function analyzeKundali(lagna, planets) {
  const analysis = {
    planetaryDignities: {},
    houseOccupancy: {},
    yogasAndDoshas: []
  };

  // Initialize 12 Houses
  for (let i = 1; i <= 12; i++) {
    analysis.houseOccupancy[i] = [];
  }

  Object.entries(planets).forEach(([planet, data]) => {
    // 1. Assign to house
    analysis.houseOccupancy[data.house].push(planet);

    // 2. Determine Dignity
    const rule = PLANET_DIGNITIES[planet];
    let dignity = 'Neutral';

    if (rule) {
      if (data.signId === rule.exalted) dignity = 'Exalted (उच्च)';
      else if (data.signId === rule.debilitated) dignity = 'Debilitated (नीच)';
      else if (data.signId === rule.mooltrikona) dignity = 'Mooltrikona (मूलत्रिकोण)';
    }

    analysis.planetaryDignities[planet] = {
      dignity,
      house: data.house,
      isRetrograde: data.isRetrograde
    };
  });

  // 3. Manglik Dosha check (Mars in 1, 4, 7, 8, 12 from Lagna)
  const marsHouse = planets['Mars'].house;
  if ([1, 4, 7, 8, 12].includes(marsHouse)) {
    analysis.yogasAndDoshas.push({
      name: 'Manglik Dosha',
      type: 'Dosha',
      description: `Mars is placed in House ${marsHouse}. Indicates potential energetic/temperament dynamics in partnerships.`
    });
  }

  // 4. Budhaditya Yoga (Sun + Mercury in same house)
  if (planets['Sun'].house === planets['Mercury'].house) {
    analysis.yogasAndDoshas.push({
      name: 'Budhaditya Yoga',
      type: 'Auspicious Yoga',
      description: `Sun and Mercury are conjunct in House ${planets['Sun'].house}. Favors intellect and communication.`
    });
  }

  // 5. Gajakesari Yoga check (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  const moonHouse = planets['Moon'].house;
  const jupiterHouse = planets['Jupiter'].house;
  const distance = ((jupiterHouse - moonHouse + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(distance)) {
    analysis.yogasAndDoshas.push({
      name: 'Gajakesari Yoga',
      type: 'Auspicious Yoga',
      description: 'Jupiter is in a Kendra house relative to Moon. Indicates wisdom, reputation, and resilience.'
    });
  }

  return analysis;
}

module.exports = {
  analyzeKundali
};