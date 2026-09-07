/**
 * D4 (Chaturthamsha) Chart Rules and Astrological Constants
 * Parashari System
 */

const { SIGNS, SIGN_LORDS } = require('../D3/d3Rules'); // आप चाहें तो d3Rules से SIGNS शेयर कर सकते हैं

// D4 Specific House Significance (Property, Ghar, Sukh)
const D4_HOUSE_SIGNIFICANCE = Object.freeze({
  1: "स्वयं, निवास स्थान और overall property experience",
  2: "पारिवारिक धन, family assets और accumulated property resources",
  3: "प्रयास, property transactions, documentation और movement",
  4: "भूमि, भवन, घर, वाहन और domestic comfort",
  5: "property planning, investment और decision making",
  6: "loan, debt, disputes, legal matters और property obstacles",
  7: "partnership, agreements, property dealing और transactions",
  8: "inheritance, shared assets, ancestral transfer और sudden property changes",
  9: "fortune, blessings, ancestral support और distant property connection",
  10: "career, business और property-related professional activity",
  11: "property gains, realization, rental/income और acquisition benefits",
  12: "property expenditure, loss, relocation, separation और foreign residence"
});
const D4_PARTS = Object.freeze({
  PART_1: { min: 0, max: 7.5, offset: 0 },       // Same sign (1st)
  PART_2: { min: 7.5, max: 15, offset: 3 },     // 4th sign from self
  PART_3: { min: 15, max: 22.5, offset: 6 },    // 7th sign from self
  PART_4: { min: 22.5, max: 30, offset: 9 }     // 10th sign from self
});

module.exports = {
  SIGNS,
  SIGN_LORDS,
  D4_HOUSE_SIGNIFICANCE,
  D4_PARTS
};