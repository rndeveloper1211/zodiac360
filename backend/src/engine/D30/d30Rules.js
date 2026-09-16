/**
 * D30 (Trimshamsha) interpretation rules.
 * Calculation stays in D30.engine.js — this file is pure interpretation data.
 *
 * Parashari principle used here:
 * Trimshamsha segments belong to only 5 grahas — Mars, Saturn, Jupiter,
 * Mercury, Venus (Sun & Moon never own a trimshamsha segment).
 * Mars & Saturn segments are classed ASHUBHA (inauspicious / dosha-prone).
 * Jupiter, Mercury & Venus segments are classed SHUBHA (protective / relief).
 */

// ---- 1. Segment-lord themes (existing, kept as-is for backward compatibility) ----
const D30_RULES = {
  Mars: {
    nature: 'ashubha',
    themes: ['accidents', 'injury', 'conflict', 'acute events', 'sudden aggression'],
    positive: 'साहस, recovery और संकट में action लेने की क्षमता।'
  },
  Saturn: {
    nature: 'ashubha',
    themes: ['chronic difficulty', 'delay', 'loss through circumstances', 'persistent obstacles'],
    positive: 'धैर्य, सहनशीलता और कठिन समय को लंबे समय तक संभालने की क्षमता।'
  },
  Jupiter: {
    nature: 'shubha',
    themes: ['protection', 'wisdom', 'support', 'recovery'],
    positive: 'संकट में संरक्षण, सही सलाह और recovery support।'
  },
  Mercury: {
    nature: 'shubha',
    themes: ['nervous strain', 'calculation errors', 'stress through communication'],
    positive: 'समस्या को समझकर practical solution निकालने की क्षमता।'
  },
  Venus: {
    nature: 'shubha',
    themes: ['comfort', 'relationships', 'material ease', 'sensual vulnerabilities'],
    positive: 'सुख-सुविधा, संबंधों और सामाजिक support से राहत।'
  }
};

// ---- 2. Health / body-part significations (natural karakas of each graha) ----
const PLANET_HEALTH = {
  Sun: {
    bodyParts: ['heart', 'eyes', 'bones', 'vitality/immunity'],
    note: 'हृदय, आँखें, हड्डियाँ और overall vitality से जुड़े मुद्दे।'
  },
  Moon: {
    bodyParts: ['mind', 'emotional balance', 'fluids', 'digestion'],
    note: 'मानसिक संतुलन, भावनात्मक स्वास्थ्य और शरीर के fluids से जुड़े मुद्दे।'
  },
  Mars: {
    bodyParts: ['blood', 'muscles', 'injuries/surgery-prone areas'],
    note: 'चोट, रक्त-संबंधी और muscular issues की संभावना।'
  },
  Mercury: {
    bodyParts: ['nervous system', 'skin', 'speech organs'],
    note: 'नर्वस सिस्टम, त्वचा और speech-related nervous strain।'
  },
  Jupiter: {
    bodyParts: ['liver', 'fat/metabolism', 'arterial health'],
    note: 'लिवर, metabolism और blood-vessel health से जुड़े मुद्दे।'
  },
  Venus: {
    bodyParts: ['reproductive system', 'kidneys', 'throat', 'hormonal balance'],
    note: 'प्रजनन तंत्र, गुर्दे और hormonal balance से जुड़े मुद्दे।'
  },
  Saturn: {
    bodyParts: ['bones/joints', 'teeth', 'chronic/long-term ailments'],
    note: 'हड्डी-जोड़, दांत और लंबे समय तक चलने वाली bimariyan।'
  },
  Rahu: {
    bodyParts: ['sudden/unexplained ailments', 'poisoning-type issues', 'addictive patterns'],
    note: 'अचानक, अस्पष्ट कारण वाली बीमारियाँ और addiction-prone patterns।'
  },
  Ketu: {
    bodyParts: ['cuts/infections', 'psychosomatic issues', 'immunity dips'],
    note: 'चोट-संक्रमण और mind-body connection से उपजी समस्याएँ।'
  }
};

// ---- 3. Houses considered dusthana (evil/disease/loss-prone) in classical Parashari ----
const DUSTHANA_HOUSES = [6, 8, 12];

// Natural malefics get an inherent severity weight regardless of segment lord
const NATURAL_MALEFICS = ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'];

module.exports = {
  D30_RULES,
  PLANET_HEALTH,
  DUSTHANA_HOUSES,
  NATURAL_MALEFICS
};