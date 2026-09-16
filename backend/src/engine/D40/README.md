# D40 — Khavedamsha Engine

This module calculates the Parashari D40 (Khavedamsha) chart from the existing
sidereal D1 planetary longitudes.

## Calculation rule

Each sign (30°) is divided into 40 equal parts of 0°45' (0.75°) each.
- **Odd sign** (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius): the 40
  parts are counted starting from **Aries**.
- **Even sign** (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces): the 40
  parts are counted starting from **Libra**.

The part a planet's degree falls into decides its D40 sign.

## Purpose

Classical texts describe Khavedamsha as showing general auspicious/
inauspicious (shubha/ashubha) effects. This app also reads it for
maternal-lineage blessings and obstacles, per its own convention — the
`analysis` block frames both.

## Integration

```js
const d40Routes = require('./engine/D40/D40.routes');
app.use('/api/chart/d40', d40Routes);
```

Example:

```text
GET /api/chart/d40?date=2000-11-06&time=16:30&lat=19.6975&lon=75.0105&timezone=5.5
```

The service reuses `../D1/D1.engine` so D40 does not duplicate ephemeris
calculations — same pattern as the D30 module.
