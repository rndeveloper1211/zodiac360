/**
 * ============================================================
 * D1 PROGENY DATA EXTRACTOR
 * ============================================================
 *
 * Purpose:
 * D1 से केवल संतान / progeny analysis के लिए जरूरी
 * calculated data निकालना।
 *
 * यह function नया ग्रह calculation नहीं करता।
 * Existing D1 calculation को ही reuse करता है।
 *
 * Required:
 * - 5th house
 * - 5th lord
 * - 5th lord placement
 * - Jupiter / Putra Karaka
 * - 2nd house
 * - 7th house
 * - 9th house
 * - 11th house
 * - 5th house occupants
 * - 5th house aspects
 */

function extractD1ProgenyData(d1RawData) {
  if (!d1RawData?.lagna || !d1RawData?.grahas) {
    return {
      available: false,
      reason: 'Valid D1 lagna and grahas are required.'
    };
  }

  const lagnaSignId = Number(d1RawData.lagna.signId);

  if (!lagnaSignId) {
    return {
      available: false,
      reason: 'D1 Lagna signId is missing.'
    };
  }

  const grahas = d1RawData.grahas || {};
  const analysis = d1RawData.analysis || {};

  // ------------------------------------------------------------
  // SIGN LORDS
  // ------------------------------------------------------------

  const SIGN_LORDS = {
    1: 'Mars',
    2: 'Venus',
    3: 'Mercury',
    4: 'Moon',
    5: 'Sun',
    6: 'Mercury',
    7: 'Venus',
    8: 'Mars',
    9: 'Jupiter',
    10: 'Saturn',
    11: 'Saturn',
    12: 'Jupiter'
  };

  // ------------------------------------------------------------
  // HOUSE FROM SIGN
  // ------------------------------------------------------------

  function getHouseFromSign(signId) {
    if (signId === undefined || signId === null) return null;

    return (
      ((Number(signId) - lagnaSignId + 12) % 12) + 1
    );
  }

  // ------------------------------------------------------------
  // GET PLANET
  // ------------------------------------------------------------

  function getPlanet(planetName) {
    const planet = grahas[planetName];

    if (!planet) return null;

    const house =
      planet.house !== undefined
        ? Number(planet.house)
        : getHouseFromSign(planet.signId);

    return {
      planet: planetName,
      signId: Number(planet.signId),
      signName: planet.sign || planet.name || null,
      signHindi: planet.signHindi || null,
      degreeInSign:
        planet.degreeInSign !== undefined
          ? Number(planet.degreeInSign)
          : null,
      house,
      isRetrograde: Boolean(planet.isRetrograde)
    };
  }

  // ------------------------------------------------------------
  // HOUSE SIGNS
  // ------------------------------------------------------------

  function getHouseSign(houseNumber) {
    const signId =
      ((lagnaSignId - 1 + (houseNumber - 1)) % 12) + 1;

    return {
      house: houseNumber,
      signId,
      lord: SIGN_LORDS[signId]
    };
  }

  // ------------------------------------------------------------
  // HOUSE OCCUPANTS
  // ------------------------------------------------------------

  function getHouseOccupants(houseNumber) {
    if (analysis.houseOccupancy?.[String(houseNumber)]) {
      return [
        ...analysis.houseOccupancy[String(houseNumber)]
      ];
    }

    return Object.entries(grahas)
      .filter(([, planet]) => {
        const planetHouse =
          planet.house !== undefined
            ? Number(planet.house)
            : getHouseFromSign(planet.signId);

        return planetHouse === houseNumber;
      })
      .map(([planet]) => planet);
  }

  // ------------------------------------------------------------
  // PLANET HOUSE MAP
  // ------------------------------------------------------------

  function getPlanetHouseMap() {
    const result = {};

    for (const [planetName, planet] of Object.entries(grahas)) {
      result[planetName] =
        planet.house !== undefined
          ? Number(planet.house)
          : getHouseFromSign(planet.signId);
    }

    return result;
  }

  // ------------------------------------------------------------
  // PARASHARI ASPECTS
  // ------------------------------------------------------------

  function getAspectingPlanets(targetHouse) {
    const aspects = [];

    const planetHouseMap = getPlanetHouseMap();

    for (const [planet, fromHouse] of Object.entries(planetHouseMap)) {
      if (!fromHouse) continue;

      // सभी ग्रहों की 7th aspect
      const seventhHouse =
        ((fromHouse - 1 + 6) % 12) + 1;

      if (seventhHouse === targetHouse) {
        aspects.push({
          planet,
          aspectType: '7th'
        });
      }

      // Mars → 4th & 8th
      if (planet === 'Mars') {
        const fourthHouse =
          ((fromHouse - 1 + 3) % 12) + 1;

        const eighthHouse =
          ((fromHouse - 1 + 7) % 12) + 1;

        if (fourthHouse === targetHouse) {
          aspects.push({
            planet,
            aspectType: '4th'
          });
        }

        if (eighthHouse === targetHouse) {
          aspects.push({
            planet,
            aspectType: '8th'
          });
        }
      }

      // Jupiter → 5th & 9th
      if (planet === 'Jupiter') {
        const fifthAspect =
          ((fromHouse - 1 + 4) % 12) + 1;

        const ninthAspect =
          ((fromHouse - 1 + 8) % 12) + 1;

        if (fifthAspect === targetHouse) {
          aspects.push({
            planet,
            aspectType: '5th'
          });
        }

        if (ninthAspect === targetHouse) {
          aspects.push({
            planet,
            aspectType: '9th'
          });
        }
      }

      // Saturn → 3rd & 10th
      if (planet === 'Saturn') {
        const thirdHouse =
          ((fromHouse - 1 + 2) % 12) + 1;

        const tenthHouse =
          ((fromHouse - 1 + 9) % 12) + 1;

        if (thirdHouse === targetHouse) {
          aspects.push({
            planet,
            aspectType: '3rd'
          });
        }

        if (tenthHouse === targetHouse) {
          aspects.push({
            planet,
            aspectType: '10th'
          });
        }
      }
    }

    return aspects;
  }

  // ------------------------------------------------------------
  // IMPORTANT HOUSES
  // ------------------------------------------------------------

  const fifthHouse = getHouseSign(5);
  const secondHouse = getHouseSign(2);
  const seventhHouse = getHouseSign(7);
  const ninthHouse = getHouseSign(9);
  const eleventhHouse = getHouseSign(11);

  // ------------------------------------------------------------
  // FIFTH LORD
  // ------------------------------------------------------------

  const fifthLord = fifthHouse.lord;
  const fifthLordData = getPlanet(fifthLord);

  // ------------------------------------------------------------
  // JUPITER
  // ------------------------------------------------------------

  const jupiter = getPlanet('Jupiter');

  // ------------------------------------------------------------
  // FINAL SMALL PROGENY OBJECT
  // ------------------------------------------------------------

  return {
    available: true,

    lagna: {
      signId: lagnaSignId,
      sign: d1RawData.lagna.sign || null,
      signHindi: d1RawData.lagna.signHindi || null
    },

    fifthHouse: {
      house: 5,
      signId: fifthHouse.signId,
      lord: fifthLord,
      occupants: getHouseOccupants(5),
      aspects: getAspectingPlanets(5)
    },

    fifthLord: fifthLordData,

    jupiter: jupiter,

    supportingHouses: {
      second: {
        ...secondHouse,
        occupants: getHouseOccupants(2),
        aspects: getAspectingPlanets(2)
      },

      seventh: {
        ...seventhHouse,
        occupants: getHouseOccupants(7),
        aspects: getAspectingPlanets(7)
      },

      ninth: {
        ...ninthHouse,
        occupants: getHouseOccupants(9),
        aspects: getAspectingPlanets(9)
      },

      eleventh: {
        ...eleventhHouse,
        occupants: getHouseOccupants(11),
        aspects: getAspectingPlanets(11)
      }
    },

    source: {
      calculation: 'Existing D1 calculated data',
      houseSystem: 'Whole Sign',
      aspectSystem: 'Parashari'
    }
  };
}