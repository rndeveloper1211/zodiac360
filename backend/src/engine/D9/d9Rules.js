/**
 * D9 (Navamsha) Chart Rules and Astrological Constants
 * Parashari System — Vivah (Marriage), Dharma & Overall Strength (Vargottama) check
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

// Exaltation / Debilitation / Own-sign map (used for dignity + Vargottama strength scoring)
const EXALTATION_SIGN = Object.freeze({ Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7 });
const DEBILITATION_SIGN = Object.freeze({ Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1 });
const OWN_SIGNS = Object.freeze({
  Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6],
  Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11]
});

// D9 House Significance (Vivah / Dharma / Overall strength check)
const D9_HOUSE_SIGNIFICANCE = Object.freeze({
  1: 'स्वयं की धार्मिक प्रवृत्ति एवं समग्र विवाह-दृष्टिकोण (D9 lagna strength)',
  2: 'जीवनसाथी के परिवार के संसाधन, वैवाहिक जीवन के बाद संचित स्थिति',
  3: 'साथी के लिए प्रयास, रिश्ते में साहस एवं पहल',
  4: 'गृहस्थ सुख, वैवाहिक जीवन की भावनात्मक नींव',
  5: 'पूर्व-पुण्य, प्रेम, साथी के साथ रोमांस (संतान-संकेत गौण)',
  6: 'वैवाहिक जीवन में बाधाएं, विवाद, स्वास्थ्य-संबंधी चुनौतियां',
  7: 'CORE — जीवनसाथी, विवाह की गुणवत्ता, वैवाहिक धर्म',
  8: 'वैवाहिक जीवन में रूपांतरण, साथी का दीर्घायु/स्वास्थ्य, अचानक परिवर्तन',
  9: 'धर्म, भाग्य, ससुर पक्ष, विवाह का आध्यात्मिक प्रयोजन',
  10: 'साथी का करियर/सामाजिक प्रतिष्ठा, विवाह से प्राप्त स्थिति',
  11: 'विवाह से लाभ, इच्छापूर्ति, साथी के माध्यम से सामाजिक नेटवर्क',
  12: 'शय्या सुख, विदेश-संबंध, या वियोग/हानि का संकेत'
});

// Each Navamsha part spans 30/9 degrees (3°20')
const D9_PART_SPAN = 30 / 9;

// Marriage/dharma karakas
const KARAKAS = Object.freeze({
  spouse: 'Venus',      // primary significator of marriage/partner in most classical use
  dharma: 'Jupiter',    // dharma, husband-in-female-chart, wisdom
  lagna7Lord: null      // resolved at runtime from D9 7th house lord
});

module.exports = {
  SIGNS,
  SIGN_LORDS,
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
  OWN_SIGNS,
  D9_HOUSE_SIGNIFICANCE,
  D9_PART_SPAN,
  KARAKAS
};
