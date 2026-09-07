const { SIGNS } = require('./d3Rules');

const DREKKANA_DEITIES = {
  1: { deity: "नारद (Narada)", significance: "सद्भाव, संवाद, और वैचारिक स्पष्टता" },
  2: { deity: "अगस्त्य (Agastya)", significance: "आंतरिक सहनशक्ति, तप, और ऊर्जा का संचय" },
  3: { deity: "दुर्वासा (Durvasa)", significance: "उग्र ऊर्जा, अनुशासन, और तीव्र प्रतिक्रिया" }
};

function getDrekkanaClassification(signId, part) {
  const sarpaSigns = [4, 8, 12];
  if ((signId === 1 && part === 3) || (signId === 3 && part === 2) || 
      (signId === 5 && part === 1) || (signId === 7 && part === 2) || 
      (signId === 9 && part === 3) || (signId === 11 && part === 1)) {
    return { type: "आयुध द्रेष्काण (Ayudha)", desc: "तकनीकी दक्षता, तेज धार, ऑपरेशन या आक्रामक पराक्रम।" };
  }
  if (sarpaSigns.includes(signId)) {
    return { type: "सर्प द्रेष्काण (Sarpa)", desc: "मानसिक गहराई, गुप्त रणनीतियाँ या जीवन में कुछ छिपी हुई बाधाएं।" };
  }
  return { type: "सामान्य / संतुलित द्रेष्काण", desc: "संतुलित ऊर्जा और सामान्य कार्यशैली।" };
}

function calculate22ndDrekkana(d1LagnaSignId, d1LagnaDegree) {
  const eighthHouseSignId = ((d1LagnaSignId - 1 + 7) % 12) + 1;
  let part = 1;
  let offset = 0;
  if (d1LagnaDegree >= 10 && d1LagnaDegree < 20) {
    part = 2; offset = 4;
  } else if (d1LagnaDegree >= 20) {
    part = 3; offset = 8;
  }
  const khareshSignId = ((eighthHouseSignId - 1 + offset) % 12) + 1;
  const signData = SIGNS.find(s => s.id === khareshSignId);

  return {
    khareshSignId,
    khareshSignName: signData?.name || "",
    khareshSignHindi: signData?.hindi || "",
    khareshLord: signData?.lord || "",
    note: "यह बिंदु स्वास्थ्य और जीवन के संवेदनशील उतार-चढ़ाव को दर्शाता है।"
  };
}

module.exports = {
  DREKKANA_DEITIES,
  getDrekkanaClassification,
  calculate22ndDrekkana
};