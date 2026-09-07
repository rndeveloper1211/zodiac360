/**
 * D9 (Navamsha) Service Layer
 * Coordinates D1 calculation and D9 processing
 */

const { processD9Chart } = require('./d9Engine');
const d1Service = require('../D1/D1.service');

class D9Service {
  async getD9Chart(birthDetails) {
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
      const d9Result = processD9Chart(rawD1);

      return {
        success: true,
        statusCode: 200,
        ...d9Result
      };
    } catch (error) {
      console.error('Error in D9Service.getD9Chart:', error);
      throw error;
    }
  }

  getD9FromD1Data(d1RawData) {
    try {
      return processD9Chart(d1RawData);
    } catch (error) {
      console.error('Error in D9Service.getD9FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D9Service();
