const express = require('express');
const cors = require('cors');
const kundaliRoutes = require('./src/routes/kundali.routes');
const d1Routes = require('./src/engine/D1/D1.routes');
const d2Routes = require('./src/engine/D2/D2.routes');
const d3Routes = require('./src/engine/D3/D3.routes'); // 1. D3 Route Import kiya

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/kundali', kundaliRoutes);

// D1 Chart Endpoint
// http://localhost:5000/api/chart/d1?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use('/api/chart/d1', d1Routes);

// D2 Chart Endpoint
// http://localhost:5000/api/chart/d2?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use('/api/chart/d2', d2Routes);

// 2. D3 Chart Endpoint Mount kiya
// http://localhost:5000/api/chart/d3?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use('/api/chart/d3', d3Routes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Zodiac360 Astrology Engine' });
});

const PORT = process.env.PORT || 5000;

// 3. '0.0.0.0' par bind kiya taaki React Native / Local Network se access ho sake
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Zodiac360] Backend server running on http://localhost:${PORT}`);
});