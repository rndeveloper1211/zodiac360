/**
 * D10 (Dashamsha) Chart Rules and Astrological Constants
 * Parashari System — Career, Profession & Social Status
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

// D10 House Significance (Career / Profession / Social status)
const D10_HOUSE_SIGNIFICANCE = Object.freeze({
  1: 'स्वयं की कार्यशैली और करियर के प्रति समग्र दृष्टिकोण (D10 lagna strength)',
  2: 'व्यवसाय/नौकरी से अर्जित धन, पारिवारिक व्यवसाय, वाणी का व्यावसायिक प्रभाव',
  3: 'प्रयास, साहस, कौशल-विकास, सहकर्मियों एवं भाई-बहनों के सहयोग से जुड़ा करियर पक्ष',
  4: 'शिक्षा की नींव, स्थायी संपत्ति (वाहन/भवन), कार्यस्थल का सुख एवं वातावरण',
  5: 'बुद्धि, योजना-क्षमता, अधिकार-पद, सट्टा/निवेश से जुड़े व्यावसायिक निर्णय',
  6: 'प्रतिस्पर्धा, सेवा-भाव, दैनिक कार्य, अधीनस्थ कर्मचारी, कार्यस्थल की बाधाएं',
  7: 'व्यापारिक साझेदारी, ग्राहक व्यवहार, सार्वजनिक संपर्क, विदेश व्यापार',
  8: 'करियर में अचानक परिवर्तन/उतार-चढ़ाव, गुप्त या शोध-कार्य, विरासत में मिला व्यवसाय',
  9: 'भाग्य, उच्च अधिकारियों का आशीर्वाद, गुरु/मेंटर का मार्गदर्शन, विदेश से संबंध',
  10: 'CORE — करियर, पेशा, सामाजिक प्रतिष्ठा, कर्म, अधिकार एवं पद',
  11: 'लाभ, आय में वृद्धि, इच्छापूर्ति, प्रोफेशनल नेटवर्किंग, पदोन्नति',
  12: 'व्यय, हानि, विदेश में कार्य/स्थानांतरण, पर्दे के पीछे या एकांत में होने वाला कार्य'
});

// Each Dashamsha part spans 30/10 degrees (3°)
const D10_PART_SPAN = 30 / 10;

// Career/profession karakas
const KARAKAS = Object.freeze({
  karma: 'Saturn',      // primary significator of career, hard work, longevity of profession
  authority: 'Sun',     // status, government, power, position
  trade: 'Mercury',     // business, commerce, communication-based work
  tenthLord: null       // resolved at runtime from D10 10th house lord
});

// Qualitative "which field suits this planet" notes — used for career-field synthesis.
// These are broad classical tendencies, not a definitive job title.
const FIELD_INDICATORS = Object.freeze({
  Sun: 'सरकारी नौकरी, प्रशासन, नेतृत्व की भूमिका, राजनीति',
  Moon: 'जनसंपर्क, हॉस्पिटैलिटी, केयरगिविंग/नर्सिंग, फूड या तरल पदार्थ से जुड़ा व्यवसाय, पब्लिक डीलिंग',
  Mars: 'इंजीनियरिंग, डिफेंस/पुलिस, स्पोर्ट्स, रियल एस्टेट, सर्जरी जैसा तकनीकी/शौर्य-प्रधान कार्य',
  Mercury: 'बिज़नेस, ट्रेडिंग, कम्युनिकेशन, राइटिंग, अकाउंटिंग, IT/एनालिटिक्स',
  Jupiter: 'टीचिंग, लॉ, कंसल्टिंग, फाइनेंस, धार्मिक/सलाहकार कार्य',
  Venus: 'आर्ट्स, फैशन, एंटरटेनमेंट, लक्ज़री गुड्स, डिज़ाइन/सौंदर्य से जुड़ा कार्य',
  Saturn: 'लेबर-इंटेंसिव कार्य, माइनिंग, कंस्ट्रक्शन, दीर्घकालिक सेवा-कार्य, ऑयल/गैस/मेटल',
  Rahu: 'अपरंपरागत या विदेश-संबंधी करियर, टेक्नोलॉजी, मीडिया, स्पेकुलेटिव फील्ड',
  Ketu: 'रिसर्च, आध्यात्मिकता, बैकग्राउंड/बिहाइंड-द-सीन कार्य, हीलिंग'
});

module.exports = {
  SIGNS,
  SIGN_LORDS,
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
  OWN_SIGNS,
  D10_HOUSE_SIGNIFICANCE,
  D10_PART_SPAN,
  KARAKAS,
  FIELD_INDICATORS
};
