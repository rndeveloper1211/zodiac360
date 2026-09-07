/**
 * D7 (Saptamsha) Chart Rules and Astrological Constants
 * Parashari System — Santaan (Children) & Progeny
 */

const { SIGNS, SIGN_LORDS } = require('../D3/d3Rules');

// D7 Specific House Significance (Santaan / Progeny)
const D7_HOUSE_SIGNIFICANCE = Object.freeze({
  1: "स्वयं का संतान-दृष्टिकोण एवं overall santaan experience",
  2: "वंश-संबंधी संसाधन, family lineage और संतान से जुड़ी accumulated स्थिति",
  3: "संतान-योजना से जुड़े प्रयास और initiatives",
  4: "संतान के साथ घरेलू सुख, emotional bonding और comfort",
  5: "संतान, गर्भधारण (conception), संतान-सुख — core house",
  6: "संतान से जुड़े obstacles, delay और legal/health-related challenges (symbolic)",
  7: "partner के माध्यम से संतान-योजना, joint family decisions",
  8: "संतान से जुड़े sudden/unexpected events, transformation",
  9: "भाग्य, आशीर्वाद और संतान का सौभाग्य",
  10: "संतान का करियर, achievements और सामाजिक प्रतिष्ठा",
  11: "संतान से gains, realization और वंश-वृद्धि (lineage growth)",
  12: "संतान से दूरी, विदेश में संतान, या हानि/separation का संकेत"
});

// Each Saptamsha part spans 30/7 degrees (~4°17'8.57")
const D7_PART_SPAN = 30 / 7;

module.exports = {
  SIGNS,
  SIGN_LORDS,
  D7_HOUSE_SIGNIFICANCE,
  D7_PART_SPAN
};