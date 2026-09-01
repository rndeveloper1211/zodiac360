require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'वैदिक ज्योतिष पर एक संक्षिप्त विचार लिखें।',
      config: {
        temperature: 0.3 // <--- यहाँ सेट होता है (0.0 से 2.0 तक)
      }
    });
    console.log(response.text);
  } catch (err) {
    console.error(err.message);
  }
}

test();