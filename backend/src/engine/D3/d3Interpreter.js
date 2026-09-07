/**
 * D3 (Drekkana) Chart Interpreter
 */

const {
  D3_HOUSE_SIGNIFICANCE,
  D3_KARAKAS,
  SIGN_LORDS,
  FEMALE_SIGNS
} = require('./d3Rules');
const { DREKKANA_DEITIES, getDrekkanaClassification, calculate22ndDrekkana } = require('./d3AdvancedRules');
function interpretD3Lagna(lagnaData) {
  const { d3SignName, d3SignHindi, lord } = lagnaData;

  const lagnaStyles = {
    Aries: "अत्यधिक साहसी, ऊर्जावान, स्वतंत्र विचार और तत्काल कदम उठाने की प्रवृत्ति।",
    Taurus: "धैर्यवान, स्थिर पराक्रम, सोच-समझकर जोखिम लेने वाला और दीर्घकालिक योजनाकार।",
    Gemini: "बौद्धिक संवाद, बहुआयामी प्रतिभा, त्वरित निर्णय और नेटवर्किंग में कुशल।",
    Cancer: "भावनात्मक साहस, परिवार की सुरक्षा के लिए समर्पित और सुरक्षात्मक दृष्टिकोण।",
    Leo: "नेतृत्व क्षमता, स्वाभिमानी, साहसिक कार्यों में आगे रहने वाला और प्रेरणादायक।",
    Virgo: "रणनीतिक, विश्लेषणात्मक कार्यशैली, बारीकियों पर ध्यान और सतर्क कदम।",
    Libra: "संतुलित प्रयास, साझेदारी में भरोसा, कूटनीतिक संवाद और सहयोगात्मक पहल।",
    Scorpio: "गूढ़ इच्छाशक्ति, असीम आंतरिक सहनशीलता और विपरीत परिस्थितियों में अडिग।",
    Sagittarius: "आशावादी दृष्टिकोण, सत्य व धर्म के लिए खड़ा होने वाला और उच्च आदर्श।",
    Capricorn: "अनुशासित पराक्रम, व्यावहारिक दृष्टिकोण, निरंतर श्रम और लक्ष्य-उन्मुख।",
    Aquarius: "नवीन सोच, सामूहिक प्रगति में विश्वास, लीक से हटकर निर्णय लेने की क्षमता।",
    Pisces: "सहज ज्ञान, लचीलापन, परोपकारी भावना और शांत पराक्रम।"
  };

  return {
    d3Lagna: `${d3SignHindi} (${d3SignName})`,
    lagnaLord: lord,
    courageStyle: lagnaStyles[d3SignName] || "संतुलित ऊर्जा और सामान्य पराक्रम।"
  };
}

function analyzeSiblingsPrecision(d3Data) {
  const { lagna, houseOccupancy = {}, planetCalculations = {} } = d3Data;
  const lagnaSignId = lagna.d3SignId;

  // 1. Younger Siblings (3rd House)
  const thirdHouseSignId = ((lagnaSignId - 1 + 2) % 12) + 1;
  const thirdLord = SIGN_LORDS[thirdHouseSignId];
  const thirdLordInfo = planetCalculations[thirdLord];
  const thirdOccupants = houseOccupancy[3] || [];
  const isThirdFemaleSign = FEMALE_SIGNS.includes(thirdHouseSignId);
  const marsData = planetCalculations[D3_KARAKAS.YOUNGER_SIBLING || "Mars"];

  const lordHouse = thirdLordInfo ? thirdLordInfo.house : null;
  const lordSign = thirdLordInfo ? thirdLordInfo.d3SignName : "";
  const marsHouse = marsData ? marsData.house : null;
  const primaryYoungerGender = isThirdFemaleSign ? "Female (Sister)" : "Male (Brother)";

  let youngerSiblingsReport = "";
  if (thirdOccupants.length > 0) {
    youngerSiblingsReport = `तृतीय भाव में ${thirdOccupants.join(", ")} की स्थिति छोटे भाई-बहनों से सक्रिय संबंध दर्शाती है। भाव पर ${isThirdFemaleSign ? "स्त्री राशि" : "पुरुष राशि"} का प्रभाव होने से ${isThirdFemaleSign ? "छोटी बहन" : "छोटे भाई"} का प्रबल संकेत है।`;
  } else {
    youngerSiblingsReport = `तृतीय भाव रिक्त है। भावेश ${thirdLord} का स्थान ${lordHouse ? `${lordHouse}वें भाव (${lordSign})` : "शुभ स्थान"} में है। कारक मंगल ${marsHouse ? `${marsHouse}वें भाव में ` : ""}स्थित होकर भाई-बहनों से जुड़े अनुभवों और पराक्रम को प्रभावित करता है।`;
  }

  // 2. Elder Siblings (11th House)
  const eleventhHouseSignId = ((lagnaSignId - 1 + 10) % 12) + 1;
  const eleventhLord = SIGN_LORDS[eleventhHouseSignId];
  const eleventhLordInfo = planetCalculations[eleventhLord];
  const eleventhOccupants = houseOccupancy[11] || [];
  const jupiterData = planetCalculations[D3_KARAKAS.ELDER_SIBLING || "Jupiter"];

  let elderSiblingsReport = "";
  if (eleventhOccupants.length > 0) {
    elderSiblingsReport = `एकादश भाव में ${eleventhOccupants.join(", ")} की उपस्थिति बड़े भाई-बहनों और सामाजिक नेटवर्क से सहयोग तथा लाभ की स्थिति बनाती है।`;
  } else {
    elderSiblingsReport = `एकादश भाव रिक्त है; बड़े भाई-बहनों का फल एकादशेश (${eleventhLord}) तथा कारक गुरु की स्थिति पर निर्भर रहेगा।`;
  }

  return {
    youngerSiblingsIndication: youngerSiblingsReport,
    elderSiblingsIndication: elderSiblingsReport,
    technicalBreakdown: {
      thirdHouseSignId,
      thirdLord,
      thirdLordInHouse: lordHouse,
      karakaMarsInHouse: marsHouse,
      primaryYoungerGenderIndication: primaryYoungerGender,
      eleventhHouseSignId,
      eleventhLord,
      eleventhLordInHouse: eleventhLordInfo ? eleventhLordInfo.house : null,
      karakaJupiterInHouse: jupiterData ? jupiterData.house : null
    }
  };
}

function interpretPlanetInD3House(planet, house, isCombust = false) {
  const planetEffects = {
    Sun: {
      1: "मजबूत आत्मविश्वास, स्वतंत्र कार्यशैली और उच्च स्वाभिमान।",
      3: "पराक्रम में वृद्धि, छोटे भाई-बहनों पर प्रभाव और साहसी फैसले।",
      10: "कार्यक्षेत्र में अधिकार, सामाजिक पहचान और नेतृत्व की प्रवृत्ति।",
      default: "ऊर्जा और प्रभाव में वृद्धि, आत्म-सम्मान को प्राथमिकता।"
    },
    Moon: {
      1: "संवेदनशील स्वभाव, मानसिक चंचलता लेकिन जनसंपर्क में गतिशीलता।",
      3: "सहानुभूतिपूर्ण संबंध, भाई-बहनों से लगाव और रचनात्मक अभिव्यक्ति।",
      10: "सार्वजनिक कार्यों में सक्रियता, परिवर्तनशील पर प्रभावी पहल।",
      default: "भावनात्मक प्रेरणा और कल्पनाशीलता के माध्यम से कार्य सिद्धि।"
    },
    Mars: {
      1: "अदम्य पराक्रम, तेज गति से कार्य करने की क्षमता और त्वरित प्रतिक्रिया।",
      3: "विशेष साहसी स्वभाव, खेल या तकनीकी क्षेत्रों में रुझान, मजबूत पहल।",
      5: "रणनीतिक साहस, तीव्र बुद्धि और जोखिम लेने की मजबूत क्षमता।",
      default: "शारीरिक ऊर्जा, जुझारूपन और बाधाओं से सीधा मुकाबला।"
    },
    Mercury: {
      1: "चतुर योजनाकार, विश्लेषणात्मक दृष्टिकोण और कुशल संवाद।",
      6: "तार्किक क्षमता से विरोधियों पर विजय, विवादों का बुद्धिमानी से समाधान।",
      default: "व्यावहारिक समझ, चतुराई और संवाद के जरिए बाधाओं को हल करना।"
    },
    Jupiter: {
      1: "विवेकपूर्ण निर्णय, आदरणीय व्यक्तित्व और नैतिक दृष्टिकोण।",
      5: "उच्च ज्ञान, विवेकपूर्ण मार्गदर्शन और भाई-बहनों से वैचारिक सामंजस्य।",
      9: "भाग्य का पूरा साथ, उच्च शिक्षा और धर्म-परायणता।",
      default: "सकारात्मक मार्गदर्शन, ज्ञान और संतुलन की शक्ति।"
    },
    Venus: {
      3: "कलात्मक रुझान, मधुर संबंध, भाई-बहनों के साथ सहयोगपूर्ण व्यवहार।",
      default: "रचनात्मक कार्यशैली, सौम्य व्यवहार और संबंधों में मधुरता।"
    },
    Saturn: {
      1: "धीमी लेकिन अत्यंत ठोस प्रगति, अनुशासित जीवनशैली और सहनशीलता।",
      3: "देर से मिलने वाली सफलता लेकिन दीर्घकालिक स्थिरता, गंभीर संवाद।",
      default: "धैर्य, कठोर परिश्रम और कर्तव्यनिष्ठा के बल पर सिद्धि।"
    },
    Rahu: {
      10: "अपरंपरागत तरीकों से सफलता, महत्वाकांक्षी कार्य और सार्वजनिक पहचान।",
      default: "अप्रत्याशित परिणाम, तेज गति से बदलाव और असाधारण प्रयास।"
    },
    Ketu: {
      4: "आंतरिक एकांत, आध्यात्मिक झुकाव और सांसारिक सुखों से अनासक्ति।",
      default: "अध्यात्म की ओर झुकाव, सूक्ष्म दृष्टि और अलगाववादी प्रवृत्ति।"
    }
  };

  let effectText = (planetEffects[planet] && (planetEffects[planet][house] || planetEffects[planet].default)) || "सामान्य परिणाम।";
  if (isCombust) {
    effectText += " (ग्रह अस्त होने के कारण इसके नैसर्गिक प्रभाव में न्यूनता आ सकती है)";
  }

  return {
    houseImpact: D3_HOUSE_SIGNIFICANCE[house] || "",
    effect: effectText
  };
}
function getAdvancedInsights(d3Data, d1Data) {
  const lagna = d3Data.lagna;
  const classification = getDrekkanaClassification(lagna.d3SignId, lagna.drekkanaPart);
  const deityInfo = DREKKANA_DEITIES[lagna.drekkanaPart];
  
  let khareshInfo = null;
  if (d1Data && d1Data.lagna) {
    khareshInfo = calculate22ndDrekkana(d1Data.lagna.signId, d1Data.lagna.degreeInSign);
  }

  return {
    drekkanaType: classification,
    rulingDeity: deityInfo,
    khareshAnalysis: khareshInfo
  };
}
function synthesizeD3Analysis(d3Data, d1Data) {
  const { planetCalculations = {}, lagna } = d3Data;

  return {
    lagnaAnalysis: interpretD3Lagna(lagna),
    siblingsSummary: analyzeSiblingsPrecision(d3Data),
    advancedInsights: getAdvancedInsights(d3Data, d1Data), // <-- यहाँ जोड़ना है
    detailedPlanetaryEffects: Object.keys(planetCalculations).reduce((acc, pName) => {
      const p = planetCalculations[pName];
      acc[pName] = {
        ...p,
        interpretation: interpretPlanetInD3House(pName, p.house, p.isCombust)
      };
      return acc;
    }, {})
  };
}

module.exports = {
  interpretD3Lagna,
  interpretPlanetInD3House,
  synthesizeD3Analysis,
  getAdvancedInsights
};