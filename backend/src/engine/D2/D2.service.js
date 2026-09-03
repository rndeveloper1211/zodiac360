// E:/zodiac360/backend/src/engine/D2/D2.service.js

const { analyzeD2Chart } = require('./d2Engine');

class D2Service {
  /**
   * D1 raw payload से D2 चार्ट का पूरा विश्लेषण निकालता है
   */
  static getD2Analysis(d1Payload) {
    try {
      return analyzeD2Chart(d1Payload);
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: error.message
      };
    }
  }
}

module.exports = D2Service;