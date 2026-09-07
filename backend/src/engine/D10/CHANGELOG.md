# D10 Module Changelog

## v1.1 — Career type, growth trend, transfer/relocation, promotion windows

1. Added `analyzeCareerType` — Government / Private-service / Business leaning
   scores (0-100 each) derived from 10th-lord house-type (kendra/trikona vs
   dusthana), Sun/Saturn dignity+placement, Mercury/Venus strength on
   7th/10th/11th, 11th-lord strength, and Rahu on 10th/11th. Returns a
   `leaning` verdict string plus per-factor `notes`, explicitly framed as a
   rule-of-thumb proxy, not a deterministic classification.
2. Added `analyzeTransferRelocation` — likelihood proxy (0-100 + level) from
   3rd/9th/12th house occupants, lagna-lord placement, and Moon's
   placement/dignity.
3. Added `buildCareerGrowthTimeline` — full 120-year Vimshottari Mahadasha
   sequence (not filtered to career karakas only) with a per-period
   `growth` / `stable-plateau` / `challenging-dip` tag from that planet's own
   D10 strength, with an upachaya-house (3/6/10/11) bump.
4. Added `extractPromotionWindows` — pulls `strongest` (10th-lord MD=AD) and
   `supportive` (10th-lord AD) windows out of the existing dasha-career
   timeline into one clean, pre-sorted-by-source list.
5. `buildCompactD10Response` extended: `analysis.careerType`,
   `analysis.transferRelocation`, `analysis.timing.growthTimeline`,
   `analysis.timing.promotionWindows` added as new top-level compact fields.
6. `analyzeD10Deep` wires all four new analyses into the main orchestration
   flow; both new dasha-derived pieces degrade gracefully (empty array) if
   `mahadashaSequence` is unavailable, same pattern as the existing
   `dashaTimeline`.

## v1.0 — Initial build (mirrors D9 module architecture)

1. Dashamsha calculation uses the correct odd/even starting-sign rule
   (distinct from D9's movable/fixed/dual rule, though it reuses D9's
   "9th sign offset" idea for the even-sign case) — verified against a
   9-planet sanity test with hand-derived expected signs.
2. `isSignRepeat` flag added at both planet and lagna level — a D10-level
   strength marker analogous to D9's Vargottama, but explicitly not called
   "Vargottama" since that term is classically D9-specific.
3. 10th house/lord treated as the core career indicator (parallel to D9's
   7th house/lord for marriage).
4. Saturn modeled as primary karma/career karaka; Sun modeled as
   authority/status karaka with angular+upachaya (1/10/11) placement bonus.
5. `analyzeCareerFieldIndications` added — 10th-sign element + occupant
   planet based qualitative field-tendency read (parallel to D9's
   `analyzeSpouseNature`), using `FIELD_INDICATORS` from `d10Rules.js`.
6. `analyzeLagnaLordOrientation`, `compareD1D10Strength`,
   `analyzeSupportingHouses` (houses 2/6/9/11), `synthesizeObstacleAndDelay`,
   and `assessCareerStability` all ported from the D9 pattern with
   career-appropriate house sets and wording.
7. Dignity scoring explicitly labeled as a proxy, not Vimshopaka Bala
   (same caution as D9's dignity module).
8. Vimshottari Mahadasha sequence capped exactly at 120 years — shared
   logic with D9, unchanged.
9. Dasha-career timeline filters only 10th-lord and Saturn/Sun
   Mahadashas, avoiding noise from unrelated planet periods.
10. Controller/service/routes follow the same request shape as the D9
    module so both can share the same D1-generation upstream call.
11. Sanity test re-uses the exact same sample planetary data as D7/D9's
    test for direct cross-verification between the divisional modules.
12. `TIMING_CAVEAT` reworded for career context (promotion/job-change/
    business-launch), surfaced in every compact response under
    `timing.caveat`.
