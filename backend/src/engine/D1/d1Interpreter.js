// backend/src/engine/d1Interpreter.js
//
// D1 (Rashi) चार्ट का पूर्ण व्याख्या इंजन।
// यह फाइल d1Rules.js में मौजूद डेटा (राशि, ग्रह, भाव, करियर योग) का उपयोग करके
// हर जीवन-क्षेत्र (व्यक्तित्व, धन, करियर, विवाह, संतान, परिवार, संपत्ति, वाहन,
// माता, पिता, भाई-बहन, शिक्षा, स्वास्थ्य, मन, विदेश यात्रा, सफलता, बाधाएं,
// जीवन की घटनाओं का समय) के लिए chart-specific विश्लेषण तैयार करती है।

const {
  SIGN_DATA,
  PLANET_DATA,
  HOUSE_THEMES,
  PLANET_IN_LAGNA,
  CAREER_PLANET_ROLES,
  CAREER_IN_10TH,
  CAREER_COMBINATIONS
} = require('./d1Rules');

const { calculateVimshottariDasha, getCurrentDasha } = require('./d1Dasha');
const { analyzeCareer } = require('../careerAnalyzer');
// ------------------------------------------------------------
// स्थिर संदर्भ डेटा (Static reference data)
// ------------------------------------------------------------

const RASHI_NAMES = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];

// DIGNITY / OWN_SIGNS indices 0-based (Aries = 0 ... Pisces = 11)
const DIGNITY = {
  Sun: { exalt: 0, debilitated: 6 },
  Moon: { exalt: 1, debilitated: 7 },
  Mars: { exalt: 9, debilitated: 3 },
  Mercury: { exalt: 5, debilitated: 11 },
  Jupiter: { exalt: 3, debilitated: 9 },
  Venus: { exalt: 11, debilitated: 5 },
  Saturn: { exalt: 6, debilitated: 0 }
};

const OWN_SIGNS = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5],
  Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10]
};

const KENDRAS = [1, 4, 7, 10];
const TRIKONAS = [1, 5, 9];

const ASPECT_RULES = {
  Sun: [7], Moon: [7], Mercury: [7], Venus: [7],
  Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10]
};

// ------------------------------------------------------------
// सामान्य सहायक फंक्शन (Generic helpers)
// ------------------------------------------------------------

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getHousePlanets(houses, houseNumber) {
  return safeArray(houses?.[houseNumber]?.planets);
}

function getHouseOccupantNames(houses, houseNumber) {
  return getHousePlanets(houses, houseNumber).map(p => (typeof p === 'string' ? p : p.name)).filter(Boolean);
}

function houseDistance(fromHouse, toHouse) {
  if (!fromHouse || !toHouse) return null;
  return ((toHouse - fromHouse + 12) % 12) + 1;
}

function getAspectType(planetName, distance) {
  if (!distance) return null;
  if (planetName === "Rahu" || planetName === "Ketu") {
    return distance === 7 ? "7वीं दृष्टि" : null;
  }
  const rules = ASPECT_RULES[planetName];
  if (!rules || !rules.includes(distance)) return null;
  return `${distance}वीं दृष्टि`;
}

function getAspectsOnHouse(targetHouse, planets) {
  const aspects = [];
  if (!planets || !targetHouse) return aspects;

  Object.entries(planets).forEach(([planetName, planetData]) => {
    const sourceHouse = planetData?.house;
    if (!sourceHouse) return;
    const distance = houseDistance(sourceHouse, targetHouse);
    const type = getAspectType(planetName, distance);
    if (type) {
      aspects.push({ name: planetName, type, fromHouse: sourceHouse, toHouse: targetHouse, distance });
    }
  });
  return aspects;
}

function getPlanetInfo(d1Data, planetName) {
  const planets = d1Data.planets || d1Data.grahas || {};
  const p = planets[planetName];
  if (!p) return null;
  return {
    name: planetName,
    signId: p.signId !== undefined ? Number(p.signId) : null,
    house: p.house !== undefined ? Number(p.house) : null,
    degreeInSign: p.degreeInSign !== undefined ? Number(p.degreeInSign) : null,
    isRetrograde: Boolean(p.isRetrograde)
  };
}

function getDignity(planetName, signId) {
  if (!signId) return null;
  const idx = signId - 1; // convert 1-based -> 0-based
  const dign = DIGNITY[planetName];
  if (dign) {
    if (idx === dign.exalt) return 'Exalted';
    if (idx === dign.debilitated) return 'Debilitated';
  }
  const own = OWN_SIGNS[planetName];
  if (own && own.includes(idx)) return 'Own';
  return null;
}

function getHouseSignId(lagnaSignId, houseNumber) {
  if (!lagnaSignId) return null;
  return ((lagnaSignId - 1 + (houseNumber - 1)) % 12) + 1;
}

// दिया गया ग्रह लग्न के सापेक्ष किन-किन भावों का स्वामी है (कुछ ग्रह 2 भावों के स्वामी होते हैं)
function getLordedHouses(d1Data, planetName) {
  const lagnaSignId = d1Data.lagna?.signId;
  if (!lagnaSignId) return [];
  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const signId = getHouseSignId(lagnaSignId, h);
    if (SIGN_DATA[signId]?.ruler === planetName) houses.push(h);
  }
  return houses;
}

// यदि d1Data में पहले से dasha मौजूद नहीं है, तो चंद्रमा की sidereal longitude व
// जन्म-समय (meta.utcTimestamp) से इसे स्वतः calculate करना (Vimshottari Dasha)
function ensureDasha(d1Data) {
  if (d1Data.dasha?.current?.lord) return d1Data.dasha;

  const birthDateStr = d1Data.meta?.utcTimestamp;
  const planets = d1Data.planets || d1Data.grahas || {};
  const moonLongitude = planets.Moon?.totalDegree;

  if (!birthDateStr || moonLongitude === undefined || moonLongitude === null) {
    return d1Data.dasha || null;
  }

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return d1Data.dasha || null;

  const full = calculateVimshottariDasha(birthDate, moonLongitude);
  if (!full.available) return d1Data.dasha || null;

  const current = getCurrentDasha(full);
  return { full, ...(current || {}) };
}

// एक भाव की सम्पूर्ण जानकारी: राशि, स्वामी, स्वामी की स्थिति/बल, भाव में बैठे ग्रह, भाव पर दृष्टियां
function getHouseInfo(d1Data, houseNumber) {
  const lagnaSignId = d1Data.lagna?.signId;
  const signId = getHouseSignId(lagnaSignId, houseNumber);
  const signData = signId ? SIGN_DATA[signId] : null;
  const lord = signData?.ruler || null;
  const lordInfo = lord ? getPlanetInfo(d1Data, lord) : null;
  const lordDignity = lordInfo?.signId ? getDignity(lord, lordInfo.signId) : null;
  const occupants = getHouseOccupantNames(d1Data.houses, houseNumber);
  const planets = d1Data.planets || d1Data.grahas || {};
  const aspects = getAspectsOnHouse(houseNumber, planets);

  return {
    houseNumber,
    signId,
    sign: signData?.name || null,
    signHindi: signData?.hindi || RASHI_NAMES[(signId || 1) - 1],
    lord,
    lordInfo,
    lordDignity,
    occupants,
    aspects
  };
}

// भाव-स्वामी की स्थिति का वर्णन
function describeHouseLord(info) {
  if (!info.lord) return '';
  const lordHindi = PLANET_DATA[info.lord]?.hindi || info.lord;
  let text = `इस भाव के स्वामी ${lordHindi} हैं`;
  if (info.lordInfo?.house) {
    text += ` जो भाव ${info.lordInfo.house} में स्थित हैं`;
  }
  if (info.lordDignity === 'Exalted') {
    text += `, और उच्च राशि में होने से बेहद बलवान होकर शुभ फल देने में सक्षम हैं।`;
  } else if (info.lordDignity === 'Debilitated') {
    text += `, और नीच राशि में होने से इस क्षेत्र से जुड़े विषयों में अतिरिक्त सजगता व प्रयास की आवश्यकता होगी।`;
  } else if (info.lordDignity === 'Own') {
    text += `, और स्वराशि में होने से यह स्थिर व मजबूत परिणाम देंगे।`;
  } else {
    text += `।`;
  }
  return text;
}

// भाव में बैठे ग्रहों का वर्णन
function describeOccupants(info) {
  if (!info.occupants.length) {
    return `इस भाव में कोई ग्रह स्थित नहीं है, अतः फल मुख्यतः भाव स्वामी और उस पर पड़ने वाली दृष्टियों के आधार पर मिलेगा।`;
  }
  const parts = info.occupants.map(name => {
    const pd = PLANET_DATA[name];
    return pd ? `${pd.hindi} (${pd.trait})` : name;
  });
  return `इस भाव में ${parts.join(', ')} स्थित है/हैं, जिससे संबंधित गुण इस क्षेत्र में स्पष्ट रूप से दिखाई देंगे।`;
}

// भाव पर पड़ने वाली दृष्टियों का वर्णन
function describeAspects(info) {
  if (!info.aspects || !info.aspects.length) return '';
  const names = info.aspects.map(a => PLANET_DATA[a.name]?.hindi || a.name);
  return `साथ ही इस भाव पर ${names.join(', ')} की दृष्टि होने से इनका प्रभाव भी परिणामों में जुड़ता है।`;
}

// ------------------------------------------------------------
// योग पहचान (Yoga detection)
// ------------------------------------------------------------

function detectYogas(d1Data) {
  const yogas = [];
  const lagnaSignId = d1Data.lagna?.signId;

  const moon = getPlanetInfo(d1Data, 'Moon');
  const jupiter = getPlanetInfo(d1Data, 'Jupiter');
  const sun = getPlanetInfo(d1Data, 'Sun');
  const mercury = getPlanetInfo(d1Data, 'Mercury');
  const mars = getPlanetInfo(d1Data, 'Mars');

  // गजकेसरी योग: चंद्र-गुरु केंद्र संबंध में
  if (moon?.house && jupiter?.house) {
    const dist = houseDistance(moon.house, jupiter.house);
    if (dist && KENDRAS.includes(dist)) {
      yogas.push({
        name: 'गजकेसरी योग',
        description: 'चंद्रमा और गुरु के परस्पर केंद्र संबंध से बना यह योग बुद्धि, यश, सम्मान और समृद्धि प्रदान करता है।'
      });
    }
  }

  // बुधादित्य योग: सूर्य-बुध युति
  if (sun?.house && mercury?.house && sun.house === mercury.house) {
    yogas.push({
      name: 'बुधादित्य योग',
      description: 'सूर्य-बुध की युति से बुद्धि, प्रशासनिक क्षमता, वाक्पटुता और वित्तीय सूझबूझ में वृद्धि होती है।'
    });
  }

  // चंद्र-मंगल योग
  if (moon?.house && mars?.house && moon.house === mars.house) {
    yogas.push({
      name: 'चंद्र-मंगल योग',
      description: 'यह योग व्यापारिक बुद्धि, अचल संपत्ति से जुड़े लाभ और आर्थिक साहस को दर्शाता है।'
    });
  }

  if (lagnaSignId) {
    const h2Lord = SIGN_DATA[getHouseSignId(lagnaSignId, 2)]?.ruler;
    const h11Lord = SIGN_DATA[getHouseSignId(lagnaSignId, 11)]?.ruler;
    const l2 = h2Lord ? getPlanetInfo(d1Data, h2Lord) : null;
    const l11 = h11Lord ? getPlanetInfo(d1Data, h11Lord) : null;

    // धन योग: द्वितीयेश-एकादशेश युति
    if (l2?.house && l11?.house && l2.house === l11.house && h2Lord !== h11Lord) {
      yogas.push({
        name: 'धन योग',
        description: 'द्वितीयेश और एकादशेश की युति आर्थिक संपन्नता, संचय और आय के स्थायी स्रोत बनाती है।'
      });
    }

    // राजयोग: किसी केंद्रेश और त्रिकोणेश की युति
    const kendraLords = new Set(KENDRAS.map(h => SIGN_DATA[getHouseSignId(lagnaSignId, h)]?.ruler).filter(Boolean));
    const trikonaLords = new Set(TRIKONAS.map(h => SIGN_DATA[getHouseSignId(lagnaSignId, h)]?.ruler).filter(Boolean));
    const seenPairs = new Set();

    kendraLords.forEach(kl => {
      trikonaLords.forEach(tl => {
        if (kl && tl && kl !== tl) {
          const pairKey = [kl, tl].sort().join('_');
          if (seenPairs.has(pairKey)) return;
          const pk = getPlanetInfo(d1Data, kl);
          const pt = getPlanetInfo(d1Data, tl);
          if (pk?.house && pt?.house && pk.house === pt.house) {
            seenPairs.add(pairKey);
            yogas.push({
              name: 'राजयोग',
              description: `केंद्र व त्रिकोण के स्वामियों (${PLANET_DATA[kl]?.hindi || kl} व ${PLANET_DATA[tl]?.hindi || tl}) की युति से राजयोग बनता है, जो सम्मान, अधिकार और सफलता प्रदान करता है।`
            });
          }
        }
      });
    });
  }

  return yogas;
}

// ------------------------------------------------------------
// करियर स्कोर (Career score)
// ------------------------------------------------------------

function calculateCareerScore(d1Data) {
  const info = getHouseInfo(d1Data, 10);
  let score = 50;
  const factors = [];

  if (info.lordDignity === 'Exalted') {
    score += 20;
    factors.push('दशमेश उच्च राशि में होने से करियर में उच्च सफलता के प्रबल योग हैं।');
  } else if (info.lordDignity === 'Own') {
    score += 12;
    factors.push('दशमेश स्वराशि में होने से करियर स्थिर व मजबूत रहेगा।');
  } else if (info.lordDignity === 'Debilitated') {
    score -= 15;
    factors.push('दशमेश नीच राशि में होने से करियर में शुरुआती संघर्ष के बाद सफलता मिलेगी।');
  }

  if (info.lordInfo?.house && (KENDRAS.includes(info.lordInfo.house) || TRIKONAS.includes(info.lordInfo.house))) {
    score += 10;
    factors.push('दशमेश केंद्र/त्रिकोण भाव में स्थित होने से करियर को अतिरिक्त मजबूती मिलती है।');
  }

  info.occupants.forEach(name => {
    const role = CAREER_PLANET_ROLES[name];
    if (role) {
      score += 5;
      factors.push(`दशम भाव में स्थित ${PLANET_DATA[name]?.hindi || name}, ${role.sector} से जुड़े क्षेत्रों (जैसे ${role.roles}) की ओर इंगित करता है।`);
    }
  });

  if (info.occupants.length === 1 && CAREER_IN_10TH[info.occupants[0]]) {
    factors.push(CAREER_IN_10TH[info.occupants[0]]);
  }

  for (let i = 0; i < info.occupants.length; i++) {
    for (let j = i + 1; j < info.occupants.length; j++) {
      const key1 = `${info.occupants[i]}_${info.occupants[j]}`;
      const key2 = `${info.occupants[j]}_${info.occupants[i]}`;
      const combo = CAREER_COMBINATIONS[key1] || CAREER_COMBINATIONS[key2];
      if (combo) {
        score += 8;
        factors.push(combo);
      }
    }
  }

  info.aspects.forEach(a => {
    if (['Jupiter', 'Mercury', 'Venus'].includes(a.name)) {
      score += 5;
      factors.push(`${PLANET_DATA[a.name]?.hindi || a.name} की दृष्टि करियर में सहयोग और वृद्धि लाती है।`);
    }
    if (['Saturn', 'Mars'].includes(a.name)) {
      factors.push(`${PLANET_DATA[a.name]?.hindi || a.name} की दृष्टि मेहनत व अनुशासन के माध्यम से सफलता दिलाती है।`);
    }
  });

  score = Math.max(0, Math.min(100, score));
  if (!factors.length) factors.push('सामान्य करियर योग सक्रिय हैं; ग्रहों की दशा के अनुसार परिणाम भिन्न हो सकते हैं।');

  return { score, factors };
}

// ------------------------------------------------------------
// 18-क्षेत्रीय विश्लेषण बिल्डर फंक्शन्स
// ------------------------------------------------------------

// 1. व्यक्तित्व (Lagna, Lagna lord, ग्रह/दृष्टि)
function buildPersonality(d1Data) {
  const lagna = d1Data.lagna;
  if (!lagna?.signId) return 'लग्न विवरण उपलब्ध नहीं है।';
  const info = getHouseInfo(d1Data, 1);
  const sign = SIGN_DATA[lagna.signId];

  let text = `लग्न राशि ${info.signHindi} है। ${sign?.easyMeaning || 'व्यक्ति का स्वभाव संतुलित व विचारशील रहता है।'} `;

  if (info.occupants.length) {
    const traits = info.occupants.map(n => PLANET_IN_LAGNA[n]).filter(Boolean);
    if (traits.length) text += traits.join(' ') + ' ';
  }

  text += describeHouseLord(info) + ' ';
  text += describeAspects(info);
  return text.trim();
}

// 2. धन (2nd house/lord, 11th house/lord, धन योग)
function buildWealth(d1Data, yogas) {
  const h2 = getHouseInfo(d1Data, 2);
  const h11 = getHouseInfo(d1Data, 11);

  let text = `धन भाव (द्वितीय) की राशि ${h2.signHindi} है। ${describeHouseLord(h2)} ${describeOccupants(h2)} ${describeAspects(h2)} `;
  text += `लाभ भाव (एकादश) की राशि ${h11.signHindi} है। ${describeHouseLord(h11)} ${describeOccupants(h11)} `;

  const dhanaYoga = (yogas || []).find(y => y.name === 'धन योग');
  if (dhanaYoga) text += dhanaYoga.description;
  else text += 'धन संचय की गति द्वितीयेश व एकादशेश की दशा-अंतर्दशा में आने पर अपेक्षाकृत तेज होगी।';

  return text.trim();
}

// 3. करियर/प्रोफेशन (10th house/lord, 6th house, 2nd/11th)
function buildCareer(d1Data) {
  const h10 = getHouseInfo(d1Data, 10);
  const h6 = getHouseInfo(d1Data, 6);
  const careerScore = calculateCareerScore(d1Data);

  let text = `दशम भाव (करियर) की राशि ${h10.signHindi} है। ${describeHouseLord(h10)} ${describeOccupants(h10)} ${describeAspects(h10)} `;
  text += `षष्ठ भाव (सेवा/प्रतिस्पर्धा) की राशि ${h6.signHindi} है, जो नौकरी में प्रतिस्पर्धा व दैनिक कार्यशैली की प्रकृति दर्शाता है। ${describeHouseLord(h6)} `;
  text += careerScore.factors.join(' ');

  return text.trim();
}

// 4. विवाह (7th house/lord, Venus/Jupiter, विवाह योग)
function buildMarriage(d1Data) {
  const h7 = getHouseInfo(d1Data, 7);
  const venus = getPlanetInfo(d1Data, 'Venus');
  const jupiter = getPlanetInfo(d1Data, 'Jupiter');

  let text = `सप्तम भाव (विवाह/जीवनसाथी) की राशि ${h7.signHindi} है। ${describeHouseLord(h7)} ${describeOccupants(h7)} ${describeAspects(h7)} `;

  if (venus?.signId) {
    const vd = getDignity('Venus', venus.signId);
    if (vd === 'Exalted') text += 'शुक्र उच्च राशि में होने से जीवनसाथी आकर्षक, सहयोगी और वैवाहिक जीवन सुखद रहने के योग हैं। ';
    else if (vd === 'Debilitated') text += 'शुक्र नीच राशि में होने से वैवाहिक जीवन में समझदारी, धैर्य और तालमेल बनाए रखना आवश्यक रहेगा। ';
  }

  if (jupiter?.house) {
    const dist = houseDistance(jupiter.house, 7);
    if (dist === 1) text += 'गुरु की सप्तम भाव में उपस्थिति जीवनसाथी में गुणवत्ता, समझदारी व मार्गदर्शक स्वभाव लाती है।';
  }

  return text.trim();
}

// 5. संतान (5th house/lord, Jupiter, संतान योग)
function buildChildren(d1Data) {
  const h5 = getHouseInfo(d1Data, 5);
  const jupiter = getPlanetInfo(d1Data, 'Jupiter');

  let text = `पंचम भाव (संतान) की राशि ${h5.signHindi} है। ${describeHouseLord(h5)} ${describeOccupants(h5)} ${describeAspects(h5)} `;

  if (jupiter?.signId) {
    const jd = getDignity('Jupiter', jupiter.signId);
    if (jd === 'Exalted') text += 'गुरु (पुत्र कारक) उच्च राशि में होने से संतान सुख शुभ व गुणवान संतान की प्राप्ति के अच्छे योग हैं।';
    else if (jd === 'Debilitated') text += 'गुरु नीच राशि में होने से संतान संबंधी विषयों में धैर्य व उचित समय की प्रतीक्षा उचित रहेगी।';
    else text += 'गुरु की स्थिति सामान्यतः संतुलित संतान सुख का संकेत देती है।';
  }

  return text.trim();
}

// 6. परिवार (2nd, 4th, 9th houses)
function buildFamily(d1Data) {
  const h2 = getHouseInfo(d1Data, 2);
  const h4 = getHouseInfo(d1Data, 4);
  const h9 = getHouseInfo(d1Data, 9);

  return `पारिवारिक सुख द्वितीय (कुटुंब), चतुर्थ (गृहस्थी सुख) और नवम (बड़ों का आशीर्वाद/भाग्य) भावों से देखा जाता है। ${describeHouseLord(h2)} ${describeHouseLord(h4)} ${describeHouseLord(h9)} इन तीनों भावों की समग्र स्थिति परिवार में सामंजस्य, सहयोग व सुख-शांति को दर्शाती है।`.trim();
}

// 7. संपत्ति/घर (4th house/lord, Mars, Venus)
function buildProperty(d1Data) {
  const h4 = getHouseInfo(d1Data, 4);
  let text = `चतुर्थ भाव (संपत्ति/घर) की राशि ${h4.signHindi} है। ${describeHouseLord(h4)} ${describeOccupants(h4)} ${describeAspects(h4)} `;

  if (h4.occupants.includes('Mars')) {
    text += 'मंगल की उपस्थिति भूमि/भवन में निवेश व अचल संपत्ति के लाभ को दर्शाती है, परंतु संपत्ति विवादों से बचने हेतु सावधानी उचित रहेगी। ';
  }
  if (h4.occupants.includes('Venus')) {
    text += 'शुक्र की उपस्थिति सुंदर व आरामदायक घर, वाहन तथा भौतिक सुख-सुविधाओं के योग को दर्शाती है।';
  }

  return text.trim();
}

// 8. वाहन/आराम (4th house, Venus)
function buildVehicles(d1Data) {
  const h4 = getHouseInfo(d1Data, 4);
  const venus = getPlanetInfo(d1Data, 'Venus');

  let text = `वाहन व भौतिक सुख-सुविधाएं चतुर्थ भाव व शुक्र की स्थिति से देखी जाती हैं। ${describeHouseLord(h4)} `;

  if (venus?.signId) {
    const vd = getDignity('Venus', venus.signId);
    if (vd === 'Exalted' || vd === 'Own') text += 'शुक्र बलवान होने से वाहन सुख व आरामदायक जीवनशैली के अच्छे योग बनते हैं।';
    else if (vd === 'Debilitated') text += 'शुक्र नीच राशि में होने से भौतिक सुख-सुविधाएं प्रयास व समय के साथ ही सुदृढ़ होंगी।';
  }

  return text.trim();
}

// 9. माता (4th house/lord, Moon)
function buildMother(d1Data) {
  const h4 = getHouseInfo(d1Data, 4);
  const moon = getPlanetInfo(d1Data, 'Moon');

  let text = `माता का सुख चतुर्थ भाव व चंद्रमा की स्थिति से देखा जाता है। ${describeHouseLord(h4)} ${describeOccupants(h4)} `;

  if (moon?.signId) {
    const md = getDignity('Moon', moon.signId);
    if (md === 'Exalted') text += 'चंद्रमा उच्च राशि में होने से माता से गहरा स्नेह व उनका पूर्ण सुख प्राप्त होगा।';
    else if (md === 'Debilitated') text += 'चंद्रमा नीच राशि में होने से मातृ पक्ष से जुड़े विषयों में संवेदनशीलता व समझदारी आवश्यक रहेगी।';
  }

  return text.trim();
}

// 10. पिता (9th house/lord, Sun)
function buildFather(d1Data) {
  const h9 = getHouseInfo(d1Data, 9);
  const sun = getPlanetInfo(d1Data, 'Sun');

  let text = `पिता का सुख नवम भाव व सूर्य की स्थिति से देखा जाता है। ${describeHouseLord(h9)} ${describeOccupants(h9)} `;

  if (sun?.signId) {
    const sd = getDignity('Sun', sun.signId);
    if (sd === 'Exalted') text += 'सूर्य उच्च राशि में होने से पिता से सम्मान, मार्गदर्शन व अच्छे संबंध प्राप्त होंगे।';
    else if (sd === 'Debilitated') text += 'सूर्य नीच राशि में होने से पिता के साथ संबंधों में समय के साथ सामंजस्य बढ़ाना उचित रहेगा।';
  }

  return text.trim();
}

// 11. भाई-बहन (3rd/11th houses)
function buildSiblings(d1Data) {
  const h3 = getHouseInfo(d1Data, 3);
  const h11 = getHouseInfo(d1Data, 11);

  return `भाई-बहनों का सुख तृतीय (छोटे भाई-बहन/पराक्रम) और एकादश (बड़े भाई-बहन/लाभ) भावों से देखा जाता है। ${describeHouseLord(h3)} ${describeOccupants(h3)} ${describeHouseLord(h11)}`.trim();
}

// 12. शिक्षा (4th, 5th, Mercury/Jupiter)
function buildEducation(d1Data) {
  const h4 = getHouseInfo(d1Data, 4);
  const h5 = getHouseInfo(d1Data, 5);
  const mercury = getPlanetInfo(d1Data, 'Mercury');
  const jupiter = getPlanetInfo(d1Data, 'Jupiter');

  let text = `शिक्षा चतुर्थ (प्रारंभिक/मूल शिक्षा) व पंचम (उच्च बुद्धि/विशेषज्ञता) भावों से देखी जाती है। ${describeHouseLord(h4)} ${describeHouseLord(h5)} `;

  if (mercury?.signId) {
    const md = getDignity('Mercury', mercury.signId);
    if (md === 'Exalted' || md === 'Own') text += 'बुध बलवान होने से तार्किक क्षमता व शैक्षणिक प्रदर्शन उत्तम रहेगा। ';
  }
  if (jupiter?.signId) {
    const jd = getDignity('Jupiter', jupiter.signId);
    if (jd === 'Exalted' || jd === 'Own') text += 'गुरु बलवान होने से उच्च शिक्षा व गहन ज्ञान प्राप्ति के अच्छे योग हैं।';
  }

  return text.trim();
}

// 13. स्वास्थ्य (1st, 6th, 8th, 12th)
function buildHealth(d1Data) {
  const h1 = getHouseInfo(d1Data, 1);
  const h6 = getHouseInfo(d1Data, 6);
  const h8 = getHouseInfo(d1Data, 8);
  const h12 = getHouseInfo(d1Data, 12);

  let text = `स्वास्थ्य का विश्लेषण लग्न (शारीरिक बनावट/ऊर्जा), षष्ठ (रोग/प्रतिरोधक क्षमता), अष्टम (दीर्घायु/गंभीर समस्याएं) और द्वादश (अस्पताल भर्ती/एकांतवास) भावों से किया जाता है। `;

  const afflictedHouses = [];
  [h6, h8, h12].forEach(h => {
    if (['Saturn', 'Mars', 'Rahu', 'Ketu'].some(p => h.occupants.includes(p))) afflictedHouses.push(h.houseNumber);
  });

  if (afflictedHouses.length) {
    text += `भाव ${afflictedHouses.join(', ')} में पाप ग्रहों की उपस्थिति होने से संबंधित समय पर स्वास्थ्य के प्रति अतिरिक्त सजगता आवश्यक रहेगी। `;
  } else {
    text += 'वर्तमान ग्रह स्थिति सामान्यतः संतुलित स्वास्थ्य का संकेत देती है। ';
  }

  text += describeHouseLord(h1);
  return text.trim();
}

// 14. मन (Moon, 4th house)
function buildMind(d1Data) {
  const moon = getPlanetInfo(d1Data, 'Moon');
  const h4 = getHouseInfo(d1Data, 4);

  let text = `मानसिक स्वभाव चंद्रमा व चतुर्थ भाव की स्थिति से समझा जाता है। `;

  if (moon?.signId) {
    const sign = SIGN_DATA[moon.signId];
    text += `चंद्रमा ${sign?.hindi || ''} राशि में${moon.house ? ` (भाव ${moon.house})` : ''} स्थित है। ${sign?.easyMeaning || ''} `;
    const md = getDignity('Moon', moon.signId);
    if (md === 'Exalted') text += 'चंद्रमा उच्च राशि में होने से मन शांत, स्थिर और सकारात्मक रहता है। ';
    else if (md === 'Debilitated') text += 'चंद्रमा नीच राशि में होने से मानसिक उतार-चढ़ाव पर ध्यान देना व भावनात्मक संतुलन बनाए रखना लाभदायक रहेगा। ';
  }

  text += describeAspects(h4);
  return text.trim();
}

// 15. विदेश/यात्रा (3rd, 9th, 12th)
function buildForeignTravel(d1Data) {
  const h3 = getHouseInfo(d1Data, 3);
  const h9 = getHouseInfo(d1Data, 9);
  const h12 = getHouseInfo(d1Data, 12);

  let text = `विदेश यात्रा व दूरगामी यात्राओं का विश्लेषण तृतीय (छोटी यात्राएं), नवम (लंबी/भाग्य यात्राएं) और द्वादश (विदेशवास) भावों से किया जाता है। `;

  const rahuHouse = [h3, h9, h12].find(h => h.occupants.includes('Rahu'));
  if (rahuHouse) {
    text += `राहु की भाव ${rahuHouse.houseNumber} में उपस्थिति विदेश यात्रा या विदेश में बसने के मजबूत योग को दर्शाती है। `;
  }

  text += describeHouseLord(h12);
  return text.trim();
}

// 16. सफलता/स्टेटस (9th, 10th, 11th, Lagna, राजयोग)
function buildSuccess(d1Data, yogas) {
  const h10 = getHouseInfo(d1Data, 10);

  let text = `सफलता व सामाजिक प्रतिष्ठा लग्न, नवम, दशम और एकादश भावों की सम्मिलित स्थिति से देखी जाती है। ${describeHouseLord(h10)} `;

  const rajYogas = (yogas || []).filter(y => y.name === 'राजयोग');
  if (rajYogas.length) {
    text += `चार्ट में ${rajYogas.length} राजयोग सक्रिय होने से जीवन में उच्च सफलता, सम्मान व अधिकार प्राप्ति की प्रबल संभावना है।`;
  } else {
    text += 'वर्तमान में कोई स्पष्ट राजयोग नहीं बन रहा, परंतु मेहनत व सही समय पर लिए गए निर्णयों से सफलता निश्चित रूप से मिलेगी।';
  }

  return text.trim();
}

// 17. बाधाएं (6th, 8th, 12th तथा afflicted planets)
function buildObstacles(d1Data) {
  const h6 = getHouseInfo(d1Data, 6);
  const h8 = getHouseInfo(d1Data, 8);
  const h12 = getHouseInfo(d1Data, 12);

  let text = `जीवन की बाधाएं व चुनौतियां षष्ठ (शत्रु/रोग/ऋण), अष्टम (अचानक परिवर्तन) और द्वादश (हानि/एकांतवास) भावों से देखी जाती हैं। `;

  [h6, h8, h12].forEach(h => {
    if (h.occupants.length) {
      text += `भाव ${h.houseNumber} में ${h.occupants.map(n => PLANET_DATA[n]?.hindi || n).join(', ')} की उपस्थिति इस क्षेत्र से जुड़ी चुनौतियों अथवा उन्हें संभालने की क्षमता को दर्शाती है। `;
    }
  });

  return text.trim();
}

// 18. जीवन की घटनाओं का समय (Dasha + Transit)
function buildTiming(d1Data) {
  const dashaInfo = d1Data.dasha;

  if (dashaInfo?.current?.lord) {
    const lord = dashaInfo.current.lord;
    const lordHindi = PLANET_DATA[lord]?.hindi || lord;
    const lordedHouses = getLordedHouses(d1Data, lord);
    const lordPlacement = getPlanetInfo(d1Data, lord);

    const startDate = new Date(dashaInfo.current.startDate).toISOString().split('T')[0];
    const endDate = new Date(dashaInfo.current.endDate).toISOString().split('T')[0];

    let text = `वर्तमान में ${lordHindi} की महादशा चल रही है (${startDate} से ${endDate} तक)`;
    if (dashaInfo.antardasha?.lord) {
      const adEnd = new Date(dashaInfo.antardasha.endDate).toISOString().split('T')[0];
      text += `, जिसके अंदर ${PLANET_DATA[dashaInfo.antardasha.lord]?.hindi || dashaInfo.antardasha.lord} की अंतर्दशा ${adEnd} तक चलेगी`;
    }
    text += `। `;

    if (lordedHouses.length) {
      text += `${lordHindi} भाव ${lordedHouses.join(' व ')} के स्वामी हैं`;
      if (lordPlacement?.house) text += ` और स्वयं भाव ${lordPlacement.house} में स्थित हैं`;
      const domains = lordedHouses.map(h => HOUSE_THEMES[h]?.domain).filter(Boolean).join('; ');
      if (domains) text += `, अतः इस दशा-काल में ${domains} से जुड़े विषयों में प्रमुख घटनाएं व परिणाम देखने को मिल सकते हैं`;
      text += '। ';
    }

    text += `सटीक समय व घटनाओं की पुष्टि हेतु वर्तमान गोचर (transit) ग्रहों का भी साथ में विश्लेषण आवश्यक है।`;
    return text.trim();
  }

  return `जीवन की घटनाओं का सटीक समय जानने के लिए विंशोत्तरी महादशा/अंतर्दशा और गोचर (transit) ग्रहों का विश्लेषण आवश्यक है। यह D1 चार्ट मुख्यतः स्वभाव व संभावनाओं को दर्शाता है — सटीक टाइमिंग के लिए दशा प्रणाली का अध्ययन ज़रूरी है (जन्म-तिथि व चंद्रमा की डिग्री उपलब्ध होने पर यह स्वतः calculate हो जाएगा)।`;
}

// ------------------------------------------------------------
// मुख्य इंटरप्रेटर फंक्शन
// ------------------------------------------------------------

function interpretD1Chart(d1Data) {
  if (!d1Data) {
    throw new Error("d1Data is required");
  }

  const houses = d1Data.houses || {};
  const planets = d1Data.planets || d1Data.grahas || {};
  const normalizedData = { ...d1Data, houses, planets };

  // dasha पहले से न हो तो चंद्रमा की डिग्री व जन्म-समय से स्वतः calculate करना
  normalizedData.dasha = ensureDasha(normalizedData);

  // const yogas = detectYogas(normalizedData);
  // const careerScore = calculateCareerScore(normalizedData);
const yogas = detectYogas(normalizedData);
const careerScore = calculateCareerScore(normalizedData);

const advancedCareer = analyzeCareer(normalizedData);
  return {
    personality: {
      title: "व्यक्तित्व",
      houses: [1],
      analysis: buildPersonality(normalizedData)
    },
    wealth: {
      title: "धन",
      houses: [2, 11],
      analysis: buildWealth(normalizedData, yogas)
    },
   career: {
  title: "Career/Profession",
  houses: [10, 6, 2, 11],

  analysis: buildCareer(normalizedData),

  fieldPrediction: advancedCareer?.primaryCareer
    ? {
        name: advancedCareer.primaryCareer.name,
        domain: advancedCareer.primaryCareer.domain,
        score: advancedCareer.primaryCareer.score,
        rawScore: advancedCareer.primaryCareer.rawScore,
        influencingPlanets:
          advancedCareer.primaryCareer.influencingPlanets || [],
        reasons:
          advancedCareer.primaryCareer.reasons || []
      }
    : null,

  advancedAnalysis: advancedCareer || null
},
    marriage: {
      title: "Marriage",
      houses: [7],
      analysis: buildMarriage(normalizedData)
    },
    children: {
      title: "Children",
      houses: [5],
      analysis: buildChildren(normalizedData)
    },
    family: {
      title: "Family",
      houses: [2, 4, 9],
      analysis: buildFamily(normalizedData)
    },
    property: {
      title: "Property/Home",
      houses: [4],
      analysis: buildProperty(normalizedData)
    },
    vehicles: {
      title: "Vehicles/Comforts",
      houses: [4],
      analysis: buildVehicles(normalizedData)
    },
    mother: {
      title: "Mother",
      houses: [4],
      analysis: buildMother(normalizedData)
    },
    father: {
      title: "Father",
      houses: [9],
      analysis: buildFather(normalizedData)
    },
    siblings: {
      title: "Siblings",
      houses: [3, 11],
      analysis: buildSiblings(normalizedData)
    },
    education: {
      title: "Education",
      houses: [4, 5],
      analysis: buildEducation(normalizedData)
    },
    health: {
      title: "Health",
      houses: [1, 6, 8, 12],
      analysis: buildHealth(normalizedData)
    },
    mind: {
      title: "Mind",
      houses: [4],
      analysis: buildMind(normalizedData)
    },
    foreignTravel: {
      title: "Foreign/Travel",
      houses: [3, 9, 12],
      analysis: buildForeignTravel(normalizedData)
    },
    success: {
      title: "Success/Status",
      houses: [9, 10, 11, 1],
      analysis: buildSuccess(normalizedData, yogas)
    },
    obstacles: {
      title: "Obstacles",
      houses: [6, 8, 12],
      analysis: buildObstacles(normalizedData)
    },
    timing: {
      title: "Life events timing",
      houses: [],
      analysis: buildTiming(normalizedData)
    },
    _meta: {
      yogas,
      careerScore,
      dasha: normalizedData.dasha,
      aspects: {
        house1: getAspectsOnHouse(1, planets),
        house7: getAspectsOnHouse(7, planets),
        house10: getAspectsOnHouse(10, planets)
      }
    }
  };
}

module.exports = {
  interpretD1Chart,
  detectYogas,
  getAspectsOnHouse,
  calculateCareerScore,
  getHouseInfo,
  getDignity,
  ensureDasha
};
