/**
 * D7 (Saptamsha) Service Layer
 * Coordinates D1 calculation and D7 processing
 */

const { processD7Chart } = require('./d7Engine');
const d1Service = require('../D1/D1.service'); 

class D7Service {
  async getD7Chart(birthDetails) {
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
      const d7Result = processD7Chart(rawD1);

      return {
        success: true,
        statusCode: 200,
        ...d7Result
      };
    } catch (error) {
      console.error('Error in D7Service.getD7Chart:', error);
      throw error;
    }
  }

  getD7FromD1Data(d1RawData) {
    try {
      return processD7Chart(d1RawData);
    } catch (error) {
      console.error('Error in D7Service.getD7FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D7Service();