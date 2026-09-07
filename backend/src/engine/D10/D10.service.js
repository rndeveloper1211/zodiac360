/**
 * D10 (Dashamsha) Service Layer
 * Coordinates D1 calculation and D10 processing
 */

const { processD10Chart } = require('./d10Engine');
const d1Service = require('../D1/D1.service');

class D10Service {
  async getD10Chart(birthDetails) {
    try {
      let d1Data;
      if (d1Service && typeof d1Service.getD1Chart === 'function') {
        d1Data = await d1Service.getD1Chart(birthDetails);
      } else if (d1Service && typeof d1Service.calculateD1 === 'function') {
        d1Data = await d1Service.calculateD1(birthDetails);
      } else {
        throw new Error('D1 calculation service not available');
      }

      const rawD1 = d1Data.data || d1Data;
      const d10Result = processD10Chart(rawD1);

      return {
        success: true,
        statusCode: 200,
        ...d10Result
      };
    } catch (error) {
      console.error('Error in D10Service.getD10Chart:', error);
      throw error;
    }
  }

  getD10FromD1Data(d1RawData) {
    try {
      return processD10Chart(d1RawData);
    } catch (error) {
      console.error('Error in D10Service.getD10FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D10Service();
