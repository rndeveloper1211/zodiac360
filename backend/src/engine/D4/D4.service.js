/**
 * D4 (Chaturthamsha) Service Layer
 * Coordinates D1 calculation and D4 processing
 */

const { processD4Chart } = require('./d4Engine');
const d1Service = require('../D1/D1.service'); 

class D4Service {
  /**
   * Generates D4 Chart from birth details
   * @param {Object} birthDetails - { date, time, lat, lon, timezone }
   */
  async getD4Chart(birthDetails) {
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
      const d4Result = processD4Chart(rawD1);

      return {
        success: true,
        statusCode: 200,
        ...d4Result
      };
    } catch (error) {
      console.error('Error in D4Service.getD4Chart:', error);
      throw error;
    }
  }

  /**
   * Process D4 directly from already generated D1 raw data
   * @param {Object} d1RawData
   */
  getD4FromD1Data(d1RawData) {
    try {
      return processD4Chart(d1RawData);
    } catch (error) {
      console.error('Error in D4Service.getD4FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D4Service();