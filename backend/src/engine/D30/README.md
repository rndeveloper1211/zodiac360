# D30 — Trimshamsha Engine

This module calculates the Parashari D30 (Trimshamsha) chart from the existing sidereal D1 planetary longitudes.

## Accuracy rules

### Odd signs
- 0°00'00" <= degree < 5°00'00" → Mars / Aries
- 5°00'00" <= degree < 10°00'00" → Saturn / Aquarius
- 10°00'00" <= degree < 18°00'00" → Jupiter / Sagittarius
- 18°00'00" <= degree < 25°00'00" → Mercury / Gemini
- 25°00'00" <= degree < 30°00'00" → Venus / Libra

### Even signs
- 0°00'00" <= degree < 5°00'00" → Venus / Taurus
- 5°00'00" <= degree < 10°00'00" → Mercury / Virgo
- 10°00'00" <= degree < 18°00'00" → Jupiter / Pisces
- 18°00'00" <= degree < 25°00'00" → Saturn / Capricorn
- 25°00'00" <= degree < 30°00'00" → Mars / Scorpio

Boundaries use `[start, end)`. Therefore exactly 5°, 10°, 18°, and 25° enter the next segment.

## Integration

Register in the main app similarly to D1:

```js
const d30Routes = require('./engine/D30/D30.routes');
app.use('/api/chart/d30', d30Routes);
```

Example:

```text
GET /api/chart/d30?date=2000-11-06&time=16:30&lat=19.6975&lon=75.0105&timezone=5.5
```

The service reuses `../D1/D1.engine` so D30 does not duplicate ephemeris calculations.
