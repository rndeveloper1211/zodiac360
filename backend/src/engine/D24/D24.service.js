/**
 * D24 (Chaturvimshamsha) Service Layer
 * Coordinates D1 calculation and D24 processing
 */

const { processD24Chart } = require('./d24Engine');
const d1Service = require('../D1/D1.service');

class D24Service {
  async getD24Chart(birthDetails) {
    try {
      let d1Data;
      if (d1Service && typeof d1Service.getD1Chart === 'function') {
        d1Data = await d1Service.getD1Chart(birthDetails);
      } else if (d1Service && typeof d1Service.calculateD1 === 'function') {
        d1Data = await d1Service.calculateD1(birthDetails);
      } else {
        throw new Error('D1 calculation service not available');
      }

      const container = d1Data?.data || d1Data;
      const rawD1 = container?.raw || container;
      const d1Analysis = container?.analysis || d1Data?.analysis || null;
      const d24Result = processD24Chart(rawD1, { d1Analysis });

      return {
        success: true,
        statusCode: 200,
        ...d24Result
      };
    } catch (error) {
      console.error('Error in D24Service.getD24Chart:', error);
      throw error;
    }
  }

  getD24FromD1Data(d1RawData) {
    try {
      const container = d1RawData?.data || d1RawData;
      const rawD1 = container?.raw || container;
      const d1Analysis = container?.analysis || d1RawData?.analysis || null;
      return processD24Chart(rawD1, { d1Analysis });
    } catch (error) {
      console.error('Error in D24Service.getD24FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D24Service();
