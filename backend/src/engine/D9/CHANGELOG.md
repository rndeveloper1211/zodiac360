# D9 Module Changelog

## v1.1 — Realistic-explanation + Antardasha pass

1. Added `buildAntardashaSequence` — classical MD-lord-first antardasha
   order, duration formula (MD years × AD years / 120), attached to every
   relevant Mahadasha in the timeline. MD=AD same-planet window flagged as
   the strongest possible activation sub-period.
2. Added `analyzeSpouseNature` — 7th-sign element + occupant-planet based
   qualitative temperament read (previously completely missing).
3. Added `analyzeLagnaLordOrientation` — D9 lagna lord's house/dignity,
   describing post-marriage relationship-orientation and self-development
   capacity (previously only the Vargottama flag existed at lagna level).
4. Added `compareD1D9Strength` — the "D1 = promise, D9 = refinement"
   principle is now actually computed per-planet (dignity-rank diff +
   verdict), not just stated in prose. Requires `d1RawData` in context.
5. Added `assessMaritalStability` — a distinct metric from marriagePromise;
   answers "will it last" rather than "how good is the match".
6. Added `TIMING_CAVEAT` constant, now surfaced in every compact response
   under `timing.caveat` — makes explicit that D9 alone cannot fix an exact
   marriage date and must be combined with D1 + Dasha + transit.
7. Reworded every user-facing `summary`/`synthesisText` string to hedge
   appropriately (no over-claiming, no deterministic "this will happen"
   language) — matches how a careful human astrologer would phrase it.
8. `D9dashaengine.js` facade updated to also re-export
   `buildAntardashaSequence` and `TIMING_CAVEAT`.

## v1.0 — Initial build (mirrors D7 module architecture)

1. Navamsha calculation uses the correct movable/fixed/dual starting-sign
   rule (distinct from D7's odd/even rule) — verified against a 9-planet
   sanity test with hand-derived expected signs.
2. `isVargottama` flag added at both planet and lagna level — a D9-only
   strength marker with no D7 equivalent.
3. 7th house/lord treated as the core marriage indicator (parallel to D7's
   5th house/lord for progeny).
4. Venus modeled as primary spouse/marriage karaka; Jupiter modeled as
   dharma karaka with trikona (1/5/9) placement bonus.
5. Dignity scoring explicitly labeled as a proxy, not Vimshopaka Bala
   (same caution as D7's dignity module).
6. Vimshottari Mahadasha sequence capped exactly at 120 years.
7. Dasha-marriage timeline filters only 7th-lord and Venus/Jupiter
   Mahadashas, avoiding noise from unrelated planet periods.
8. Controller/service/routes follow the same request shape as the D7
   module so both can share the same D1-generation upstream call.
9. Sanity test re-uses the exact same sample planetary data as D7's test
   for direct cross-verification between the two divisional modules.
