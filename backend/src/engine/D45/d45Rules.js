/**
 * D45 (Akshavedamsha) interpretation rules.
 * Calculation stays in D45.engine.js — this file is pure interpretation data.
 *
 * Classical Parashari usage: Parashara assigns Akshavedamsha to "sarva" —
 * the whole of a person's character and conduct (sheela / achara). Several
 * living traditions — including this app's convention — extend its reading
 * to samskaras inherited through the paternal lineage, sitting opposite
 * D30/D40's maternal emphasis. Both framings are given below.
 */

// Functional nature of each sign-lord. Like D40, D45 has no fixed segment-lord
// scheme — all 45 parts map to regular signs, so shubha/ashubha is judged via
// the resulting sign's ruling planet. Kept identical to d40Rules for
// cross-varga consistency.
const LORD_NATURE = {
  Sun: 'ashubha',
  Moon: 'shubha',
  Mars: 'ashubha',
  Mercury: 'shubha',
  Jupiter: 'shubha',
  Venus: 'shubha',
  Saturn: 'ashubha'
};

const NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

const KENDRA_TRIKONA_HOUSES = [1, 4, 5, 7, 9, 10]; // auspicious houses
const DUSTHANA_HOUSES = [6, 8, 12]; // inauspicious houses

// Dharma houses carry extra weight in a character/conduct varga.
const DHARMA_HOUSES = [1, 5, 9];

const LORD_THEMES = {
  Sun: {
    themes: ['pride and self-assertion in conduct', 'authority-driven ethics', 'father-line expectations'],
    positive: 'सिद्धांतों पर टिके रहने की क्षमता और नेतृत्व — अगर अहंकार से मुक्त हो।',
    caution: 'सही होने की ज़िद कभी-कभी रिश्तों से बड़ी हो जाती है।'
  },
  Moon: {
    themes: ['empathy in conduct', 'mood-led decisions', 'emotionally soft character'],
    positive: 'सहानुभूति और लोगों को समझने की स्वाभाविक क्षमता।',
    caution: 'मन की स्थिति के साथ आचरण बदल सकता है — निरंतरता कम।'
  },
  Mars: {
    themes: ['direct and combative conduct', 'courage under pressure', 'impulsive ethics'],
    positive: 'अन्याय के सामने खड़े होने का साहस, और निर्णय लेने की तेज़ी।',
    caution: 'जल्दबाज़ी और टकराव — क्रोध में आचरण गिर सकता है।'
  },
  Mercury: {
    themes: ['adaptable conduct', 'intellect-led ethics', 'skill in negotiation'],
    positive: 'व्यावहारिक बुद्धि, संवाद कुशलता और परिस्थिति के अनुसार ढलना।',
    caution: 'लचीलापन कभी-कभी सुविधा-अनुसार सिद्धांत बदलने में बदल जाता है।'
  },
  Jupiter: {
    themes: ['dharmic conduct', 'inherited wisdom', 'teaching and guiding instinct'],
    positive: 'नैतिक स्पष्टता, उदारता और पितृ-पक्ष से मिले संस्कारों की मज़बूती।',
    caution: 'उपदेश देने की प्रवृत्ति और अपने मानकों को दूसरों पर थोपना।'
  },
  Venus: {
    themes: ['refined conduct', 'harmony-seeking ethics', 'aesthetic and relational values'],
    positive: 'शालीनता, सौम्य व्यवहार और रिश्तों में संतुलन बनाए रखना।',
    caution: 'टकराव से बचने के चक्कर में कठिन सच टाल देना।'
  },
  Saturn: {
    themes: ['disciplined conduct', 'duty over desire', 'slow-maturing character'],
    positive: 'धैर्य, ज़िम्मेदारी और कठिन समय में भी वचन निभाने की क्षमता।',
    caution: 'कठोरता, भावनात्मक दूरी और ज़रूरत से ज़्यादा आत्म-आलोचना।'
  }
};

/**
 * Deity themes for the Brahma / Vishnu / Maheshwara scheme used in
 * D45.engine.js. This is a documented house convention — other traditions
 * group the 45 deities differently. Used as a qualitative flavour on top of
 * the sign-lord reading, never as a scoring input.
 */
const DEITY_THEMES = {
  Brahma: {
    orientation: 'creation / srijan',
    themes: ['initiative', 'ambition', 'building something new'],
    note: 'आचरण में सृजन और महत्वाकांक्षा का रंग — नई शुरुआत करने की प्रवृत्ति।'
  },
  Vishnu: {
    orientation: 'preservation / paalan',
    themes: ['balance', 'responsibility', 'sustaining what exists'],
    note: 'आचरण में संतुलन और निर्वाह — बनाए रखने और संभालने की प्रवृत्ति।'
  },
  Maheshwara: {
    orientation: 'dissolution / parivartan',
    themes: ['detachment', 'transformation', 'letting go'],
    note: 'आचरण में वैराग्य और परिवर्तन — पुराना छोड़कर बदलने की प्रवृत्ति।'
  }
};

module.exports = {
  LORD_NATURE,
  NATURAL_MALEFICS,
  KENDRA_TRIKONA_HOUSES,
  DUSTHANA_HOUSES,
  DHARMA_HOUSES,
  LORD_THEMES,
  DEITY_THEMES
};
