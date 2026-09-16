# D45 — Akshavedamsha Engine

This module calculates the Parashari D45 (Akshavedamsha) chart from the existing
sidereal D1 planetary longitudes.

## Calculation rule

Each sign (30°) is divided into 45 equal parts of 0°40' (0.6666..°) each.
- **Movable / chara sign** (Aries, Cancer, Libra, Capricorn): the 45 parts are
  counted starting from **Aries**.
- **Fixed / sthira sign** (Taurus, Leo, Scorpio, Aquarius): the 45 parts are
  counted starting from **Leo**.
- **Dual / dvisvabhava sign** (Gemini, Virgo, Sagittarius, Pisces): the 45 parts
  are counted starting from **Sagittarius**.

The part a planet's degree falls into decides its D45 sign.

> **Do not port the D40 branch here.** D40 reckons by sign *parity*
> (odd → Aries, even → Libra). D45 reckons by sign *modality*
> (chara/sthira/dvisvabhava → Aries/Leo/Sagittarius). They are different rules
> and produce different charts. `getSignModality()` in the engine implements
> the D45 rule via `signId % 3`.

## Purpose

Parashara lists Akshavedamsha under *sarva* — the whole of a person's character
and conduct (*sheela* / *achara*): the moral baseline that shows up under
pressure, as distinct from the surface personality read from D1. This app also
reads it for samskaras inherited through the **paternal** lineage, sitting
opposite D30/D40's maternal emphasis. The `analysis` block frames both.

## Birth-time sensitivity — read this before trusting output

One D45 part is **40 arc-minutes**. The ascendant advances roughly 1° every 4
minutes of clock time, so the **D45 Lagna changes about every 2 min 40 s**. A
birth time that is rounded to the nearest five minutes, or recalled from memory,
can land the chart in an entirely different D45 Lagna.

Every response therefore carries a `timeSensitivity` block:

```json
{
  "segmentArcMinutes": 40,
  "approxLagnaChangeMinutes": 2.67,
  "lagnaArcMinutesFromBoundary": 18,
  "lagnaApproxClockMinutesFromBoundary": 1.2,
  "lagnaIsNearBoundary": true,
  "note": "..."
}
```

When `lagnaIsNearBoundary` is `true`, the Lagna sits less than ~2 clock-minutes
from a segment edge. Surface this in the UI rather than hiding it — a D45
reading presented with false confidence on an unrectified birth time is the main
way this chart misleads people. Treat D45 as confirmation for what D1/D9/D10
already showed, not as a standalone verdict.

## Deity scheme (house convention)

Each of the 45 parts is tagged Brahma / Vishnu / Maheshwara, cycling from part 1
(45 = 3 × 15, so each deity rules exactly 15 parts). Orientations used:
Brahma = *srijan* (creation), Vishnu = *paalan* (preservation),
Maheshwara = *parivartan* (dissolution).

Other traditions group these deities differently. This is a documented house
convention — it is carried as **qualitative flavour only** and is deliberately
kept out of the numeric `qualityScore`, so swapping the scheme cannot silently
change scores. The constant to edit is `DEITIES` in `D45.engine.js`.

## Scoring

`d45QualityEngine.js` keeps the same weights as `d40QualityEngine.js` so the two
vargas stay comparable within this app, with **one addition** specific to a
character varga: a `+1` for planets in the dharma trine (1/5/9). Labels are
conduct-flavoured (`Strong Conduct` / `Strained Conduct`) rather than D40's
`Auspicious` / `Inauspicious`.

As in D40, these are this application's house rules, not the only valid method.

## Integration

```js
const d45Routes = require('./engine/D45/D45.routes');
app.use('/api/chart/d45', d45Routes);
```

Example:

```text
GET /api/chart/d45?date=2000-11-06&time=16:30&lat=19.6975&lon=75.0105&timezone=5.5
```

`POST /api/chart/d45/analyze` accepts an already-calculated D1 chart
(`{ lagna, planets }`) and returns the D45 without recomputing the ephemeris.

The service reuses `../D1/D1.engine` so D45 does not duplicate ephemeris
calculations — same pattern as the D30 and D40 modules.

## Files

| File | Role |
| --- | --- |
| `D45.engine.js` | Pure calculation — segments, modality reckoning, houses, boundary proximity |
| `d45Rules.js` | Interpretation data only (lord nature, themes, deity themes) |
| `d45QualityEngine.js` | Scoring + labels + deity distribution |
| `d45Interpreter.js` | Assembles the interpretation object |
| `D45.service.js` | D1 → D45 orchestration, report shape, meta block |
| `D45.controller.js` | Request validation, HTTP responses |
| `D45.routes.js` | Express router |
