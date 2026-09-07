/**
 * D24 (Chaturvimshamsha) Chart Rules and Astrological Constants
 * Parashari System — Vidya (Education), Gyaan (Knowledge) & Learning Capacity
 */

const SIGNS = [
  { id: 1, name: 'Aries', hindi: 'मेष', element: 'Fire', modality: 'movable' },
  { id: 2, name: 'Taurus', hindi: 'वृषभ', element: 'Earth', modality: 'fixed' },
  { id: 3, name: 'Gemini', hindi: 'मिथुन', element: 'Air', modality: 'dual' },
  { id: 4, name: 'Cancer', hindi: 'कर्क', element: 'Water', modality: 'movable' },
  { id: 5, name: 'Leo', hindi: 'सिंह', element: 'Fire', modality: 'fixed' },
  { id: 6, name: 'Virgo', hindi: 'कन्या', element: 'Earth', modality: 'dual' },
  { id: 7, name: 'Libra', hindi: 'तुला', element: 'Air', modality: 'movable' },
  { id: 8, name: 'Scorpio', hindi: 'वृश्चिक', element: 'Water', modality: 'fixed' },
  { id: 9, name: 'Sagittarius', hindi: 'धनु', element: 'Fire', modality: 'dual' },
  { id: 10, name: 'Capricorn', hindi: 'मकर', element: 'Earth', modality: 'movable' },
  { id: 11, name: 'Aquarius', hindi: 'कुंभ', element: 'Air', modality: 'fixed' },
  { id: 12, name: 'Pisces', hindi: 'मीन', element: 'Water', modality: 'dual' }
];

const SIGN_LORDS = Object.freeze({
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
});

// Exaltation / Debilitation / Own-sign map (used for dignity + strength scoring)
const EXALTATION_SIGN = Object.freeze({ Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7 });
const DEBILITATION_SIGN = Object.freeze({ Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1 });
const OWN_SIGNS = Object.freeze({
  Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6],
  Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11]
});

// D24 House Significance (Vidya / Gyaan / Learning Capacity)
const D24_HOUSE_SIGNIFICANCE = Object.freeze({
  1: 'स्वयं की सीखने की क्षमता एवं शिक्षा के प्रति समग्र दृष्टिकोण (D24 lagna strength)',
  2: 'परिवार से मिलने वाला शैक्षणिक संस्कार, वाणी/स्मरण-शक्ति, आधारभूत ज्ञान',
  3: 'स्वयं का प्रयास, कौशल-विकास, सहपाठियों/भाई-बहनों का सहयोग',
  4: 'CORE — औपचारिक शिक्षा, डिग्री, स्कूली/कॉलेज नींव, अकादमिक आधार',
  5: 'बुद्धि, पूर्व-पुण्य, सीखने की सहज क्षमता, परीक्षा में सफलता, मंत्र-सिद्धि',
  6: 'प्रतिस्पर्धा, परीक्षा से जुड़ी बाधाएं, पढ़ाई में रुकावट या स्वास्थ्य-संबंधी दिक्कत',
  7: 'सार्वजनिक परीक्षाएं, उच्च शिक्षा हेतु साझेदारी/टाई-अप, विदेशी विश्वविद्यालय संपर्क',
  8: 'शिक्षा में अचानक रुकावट/परिवर्तन, गूढ़/शोध-विषयक अध्ययन, अप्रत्याशित बाधाएं',
  9: 'उच्च शिक्षा, गुरु/मेंटर का मार्गदर्शन, विदेश में शिक्षा, धार्मिक/आध्यात्मिक ज्ञान',
  10: 'व्यावसायिक/करियर-उन्मुख पाठ्यक्रम, डिग्री की मान्यता एवं प्रतिष्ठा',
  11: 'डिग्री पूर्ण होना, शिक्षा से लाभ, विद्वानों का नेटवर्क, अकादमिक इच्छाओं की पूर्ति',
  12: 'विदेश में अध्ययन, आध्यात्मिक/मोक्ष-उन्मुख ज्ञान, एकांत में होने वाला शोध'
});

// Each Chaturvimshamsha part spans 30/24 degrees (1°15')
const D24_PART_SPAN = 30 / 24;

// Vidya/gyaan karakas
const KARAKAS = Object.freeze({
  learning: 'Mercury',  // primary significator of learning ability, communication, formal study
  wisdom: 'Jupiter',    // higher knowledge, wisdom, teaching, mantra/spiritual learning
  fourthLord: null      // resolved at runtime from D24 4th house lord
});

// Qualitative "which subject/field suits this planet" notes — used for
// education-field synthesis. Broad classical tendencies, not a definitive
// course/degree-title prediction.
const FIELD_INDICATORS = Object.freeze({
  Sun: 'प्रशासन, राजनीति शास्त्र, सरकारी/लोक-प्रशासन से जुड़ी पढ़ाई, नेतृत्व-उन्मुख कोर्स',
  Moon: 'मनोविज्ञान, नर्सिंग/केयरगिविंग, गृह-विज्ञान, फूड साइंस, पब्लिक-डीलिंग से जुड़ी पढ़ाई',
  Mars: 'इंजीनियरिंग, स्पोर्ट्स साइंस, डिफेंस स्टडीज़, सर्जरी/मेडिकल जैसा तकनीकी-शौर्य विषय',
  Mercury: 'कॉमर्स, गणित, कंप्यूटर साइंस, भाषा/संचार, अकाउंटिंग, एनालिटिक्स',
  Jupiter: 'लॉ, फिलॉसफी, टीचिंग, फाइनेंस, धर्मशास्त्र, सलाहकार-उन्मुख उच्च शिक्षा',
  Venus: 'आर्ट्स, डिज़ाइन, संगीत, साहित्य, फैशन, सौंदर्यशास्त्र से जुड़ी पढ़ाई',
  Saturn: 'माइनिंग, कंस्ट्रक्शन, दीर्घकालिक तकनीकी/वोकेशनल ट्रेड, इतिहास/पुरातत्व जैसा धैर्य-प्रधान विषय',
  Rahu: 'आधुनिक टेक्नोलॉजी, विदेश में शिक्षा, अपरंपरागत/नए विषय, मीडिया स्टडीज़',
  Ketu: 'आध्यात्मिक अध्ययन, शोध, गूढ़/occult विद्या, मंत्र-शास्त्र, पर्दे के पीछे का कार्य'
});

module.exports = {
  SIGNS,
  SIGN_LORDS,
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
  OWN_SIGNS,
  D24_HOUSE_SIGNIFICANCE,
  D24_PART_SPAN,
  KARAKAS,
  FIELD_INDICATORS
};
