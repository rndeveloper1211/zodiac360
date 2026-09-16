const { calculateD30Position, SIGNS } = require('./D30.engine');

/** Build UI-ready D30 chart data from an existing D1 chart. */
function generateD30ChartData(d1Chart) {
  if (d1Chart?.lagna?.totalDegree === undefined || !d1Chart?.planets) {
    throw new Error('D1 chart with lagna.totalDegree and planets is required.');
  }

  const lagna = calculateD30Position(d1Chart.lagna.totalDegree);
  const houses = {};

  for (let h = 1; h <= 12; h++) {
    const signId = ((lagna.d30SignId - 1 + h - 1) % 12) + 1;
    const sign = SIGNS[signId - 1];
    houses[h] = {
      houseNumber: h,
      rashiIndex: signId - 1,
      rashi: sign.name,
      rashiHindi: sign.hindi,
      signLord: sign.lord,
      planets: []
    };
  }

  const planets = {};
  for (const [name, p] of Object.entries(d1Chart.planets)) {
    if (!Number.isFinite(Number(p.totalDegree))) {
      throw new Error(`D1 totalDegree missing for ${name}.`);
    }

    const d30 = calculateD30Position(p.totalDegree);
    const house = ((d30.d30SignId - lagna.d30SignId + 12) % 12) + 1;

    planets[name] = {
      name,
      rashi: d30.d30Sign,
      rashiHindi: d30.d30SignHindi,
      rashiIndex: d30.d30SignId - 1,
      totalDegree: d30.totalSiderealDegree,
      d1Sign: d30.d1Sign,
      d1SignHindi: d30.d1SignHindi,
      degreeInD1Sign: d30.degreeInD1Sign,
      segmentStartDegree: d30.segmentStartDegree,
      segmentEndDegree: d30.segmentEndDegree,
      segmentLord: d30.segmentLord,
      d30SignLord: d30.d30SignLord,
      house,
      isRetrograde: Boolean(p.isRetrograde)
    };

    houses[house].planets.push({
      name,
      degree: d30.degreeInD1Sign,
      segmentLord: d30.segmentLord
    });
  }

  return {
    chartType: 'D30 - Trimshamsha Chart',
    calculationSystem: 'Parashari Trimshamsha',
    ascendant: {
      ...lagna,
      rashiIndex: lagna.d30SignId - 1,
      rashi: lagna.d30Sign,
      rashiHindi: lagna.d30SignHindi,
      house: 1
    },
    houses,
    planets
  };
}

module.exports = { generateD30ChartData };
