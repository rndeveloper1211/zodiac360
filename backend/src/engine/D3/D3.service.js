/**
 * D3 (Drekkana) Service Layer
 * Coordinates D1 calculation and D3 processing
 */

const { processD3Chart } = require('./d3Engine');
// Apne project ke D1 generator engine/service ka path confirm karein
// (agar aapka D1 generator D1.service ya astronomy.engine me hai toh wahi import karein)
const d1Service = require('../D1/D1.service'); 

class D3Service {
  /**
   * Generates D3 Chart from birth details
   * @param {Object} birthDetails - { date, time, lat, lon, timezone }
   */
  async getD3Chart(birthDetails) {
    try {
      // 1. Fetch/Calculate Base D1 Raw Data
      let d1Data;
      if (d1Service && typeof d1Service.getD1Chart === 'function') {
        d1Data = await d1Service.getD1Chart(birthDetails);
      } else if (d1Service && typeof d1Service.calculateD1 === 'function') {
        d1Data = await d1Service.calculateD1(birthDetails);
      } else {
        throw new Error('D1 calculation service not available');
      }

      // Agar D1 response me 'data' wrapper ho toh use extract karein
      const rawD1 = d1Data.data || d1Data;

      // 2. Process D3 chart calculation & interpretations
      const d3Result = processD3Chart(rawD1);

      return {
        success: true,
        statusCode: 200,
        ...d3Result
      };
    } catch (error) {
      console.error('Error in D3Service.getD3Chart:', error);
      throw error;
    }
  }

  /**
   * Process D3 directly from already generated D1 raw data
   * @param {Object} d1RawData
   */
  getD3FromD1Data(d1RawData) {
    try {
      return processD3Chart(d1RawData);
    } catch (error) {
      console.error('Error in D3Service.getD3FromD1Data:', error);
      throw error;
    }
  }
}

module.exports = new D3Service();