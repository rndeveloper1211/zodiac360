const express = require('express');
const cors = require('cors');

const kundaliRoutes = require('./src/routes/kundali.routes');

const d1Routes = require('./src/engine/D1/D1.routes');
const d2Routes = require('./src/engine/D2/D2.routes');
const d3Routes = require('./src/engine/D3/D3.routes');
const d4Routes = require('./src/engine/D4/D4.routes');
const d7Routes = require('./src/engine/D7/d7.routes');
const d9Routes = require('./src/engine/D9/D9.routes');
const d10Routes = require('./src/engine/D10/D10.routes');
const d12Routes = require('./src/engine/D12/D12.routes');
const d16Routes = require('./src/engine/D16/D16.routes');
const d20Routes = require('./src/engine/D20/D20.routes');
const d24Routes = require('./src/engine/D24/D24.routes');
const app = express();


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// KUNDALI ROUTES
// ============================================================

app.use(
  '/api/kundali',
  kundaliRoutes
);


// ============================================================
// DIVISIONAL CHART ROUTES
// ============================================================

// D1 - Rashi Chart
// GET /api/chart/d1?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use(
  '/api/chart/d1',
  d1Routes
);


// D2 - Hora Chart
// GET /api/chart/d2?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use(
  '/api/chart/d2',
  d2Routes
);


// D3 - Drekkana Chart
// GET /api/chart/d3?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use(
  '/api/chart/d3',
  d3Routes
);


// D4 - Chaturthamsha Chart
app.use(
  '/api/chart/d4',
  d4Routes
);


// D7 - Saptamsha Chart
app.use(
  '/api/chart/d7',
  d7Routes
);


// D9 - Navamsha Chart
app.use(
  '/api/chart/d9',
  d9Routes
);


// D10 - Dashamsha Chart
app.use(
  '/api/chart/d10',
  d10Routes
);


// D12 - Dwadashamsha Chart
// GET /api/chart/d12?date=2000-11-06&time=16:30&lat=19.6988&lon=75.0086
app.use(
  '/api/chart/d12',
  d12Routes
);

// D16 - Shodashamsha Chart
app.use(
  '/api/chart/d16',
  d16Routes
);

// D20 - Vimsamsha Chart
app.use(
  '/api/chart/d20',
  d20Routes
);

// D24 - Chaturvimshamsha Chart
app.use(
  '/api/chart/d24',
  d24Routes
);
// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/health',
  (req, res) => {
    res.json({
      status: 'UP',
      service: 'Zodiac360 Astrology Engine'
    });
  }
);


// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `[Zodiac360] Backend server running on http://localhost:${PORT}`
    );
  }
);