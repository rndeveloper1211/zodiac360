/**
 * D3 (Drekkana) Chart Rules and Astrological Constants
 * Parashari System
 */

const SIGNS = [
  { id: 1, name: "Aries", hindi: "मेष", element: "Fire", lord: "Mars", gender: "Male" },
  { id: 2, name: "Taurus", hindi: "वृषभ", element: "Earth", lord: "Venus", gender: "Female" },
  { id: 3, name: "Gemini", hindi: "मिथुन", element: "Air", lord: "Mercury", gender: "Male" },
  { id: 4, name: "Cancer", hindi: "कर्क", element: "Water", lord: "Moon", gender: "Female" },
  { id: 5, name: "Leo", hindi: "सिंह", element: "Fire", lord: "Sun", gender: "Male" },
  { id: 6, name: "Virgo", hindi: "कन्या", element: "Earth", lord: "Mercury", gender: "Female" },
  { id: 7, name: "Libra", hindi: "तुला", element: "Air", lord: "Venus", gender: "Male" },
  { id: 8, name: "Scorpio", hindi: "वृश्चिक", element: "Water", lord: "Mars", gender: "Female" },
  { id: 9, name: "Sagittarius", hindi: "धनु", element: "Fire", lord: "Jupiter", gender: "Male" },
  { id: 10, name: "Capricorn", hindi: "मकर", element: "Earth", lord: "Saturn", gender: "Female" },
  { id: 11, name: "Aquarius", hindi: "कुंभ", element: "Air", lord: "Saturn", gender: "Male" },
  { id: 12, name: "Pisces", hindi: "मीन", element: "Water", lord: "Jupiter", gender: "Female" }
];

// Direct Sign Lord Quick Lookup
const SIGN_LORDS = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
  5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
  9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// Gender Categorization of Signs
const FEMALE_SIGNS = [2, 4, 6, 8, 10, 12]; // वृषभ, कर्क, कन्या, वृश्चिक, मकर, मीन
const MALE_SIGNS = [1, 3, 5, 7, 9, 11];    // मेष, मिथुन, सिंह, तुला, धनु, कुंभ

// Drekkana Part Ranges (10 degrees each)
const DREKKANA_PARTS = {
  FIRST: { part: 1, minDeg: 0, maxDeg: 10, offset: 0 },   // Same sign (1st from self)
  SECOND: { part: 2, minDeg: 10, maxDeg: 20, offset: 4 }, // 5th sign from self
  THIRD: { part: 3, minDeg: 20, maxDeg: 30, offset: 8 }   // 9th sign from self
};

// D3 Specific Significators (Karaka)
const D3_KARAKAS = {
  SIBLINGS: "Mars",           // सहज कारक (पराक्रम व भाई-बहन)
  ELDER_SIBLING: "Jupiter",   // बड़े भाई-बहन का कारक
  YOUNGER_SIBLING: "Mars",    // छोटे भाई-बहन का कारक
  COURAGE_DRIVE: "Mars"       // आंतरिक साहस व जुझारूपन
};

// House Significance in D3
const D3_HOUSE_SIGNIFICANCE = {
  1: "व्यक्ति का स्वभाव, शारीरिक ऊर्जा, साहस और व्यक्तिगत प्रयास",
  2: "पारिवारिक संसाधन, वाणी और संयुक्त पारिवारिक मूल्य",
  3: "छोटे भाई-बहन, पहल करने की क्षमता, पराक्रम और शौर्य",
  4: "पारिवारिक सुख, भावनात्मक स्थिरता और आंतरिक शांति",
  5: "बुद्धि, रचनात्मकता और भाई-बहनों से प्राप्त होने वाली सलाह",
  6: "प्रतिस्पर्धा, चुनौतियां, विवाद और बाधाओं से लड़ने की क्षमता",
  7: "साझेदारी, सहयोग और बाहरी दुनिया के साथ तालमेल",
  8: "अचानक आने वाली बाधाएं, परिवर्तन और गुप्त ऊर्जा",
  9: "भाग्य, उच्च आदर्श, गुरु और धर्म का साथ",
  10: "कर्म, सामाजिक पहचान और प्रयास की दिशा",
  11: "बड़े भाई-बहन, मित्रों का सहयोग, लाभ और आकांक्षाएं",
  12: "त्याग, दूरी, विदेश और अज्ञात व्यय"
};

module.exports = {
  SIGNS,
  SIGN_LORDS,
  FEMALE_SIGNS,
  MALE_SIGNS,
  DREKKANA_PARTS,
  D3_KARAKAS,
  D3_HOUSE_SIGNIFICANCE
};