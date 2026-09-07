# D24 Module Changelog

## v1.0 — Initial build (mirrors D10 module architecture)

1. Chaturvimshamsha calculation uses the correct odd/even starting-sign rule
   (odd sign -> Leo, even sign -> Cancer; distinct from D10's odd/same-sign,
   even/9th-sign rule) — verified against a 9-planet sanity test with
   hand-derived (and programmatically cross-checked) expected signs.
2. `isSignRepeat` flag added at both planet and lagna level — a D24-level
   strength marker analogous to D9's Vargottama, but explicitly not called
   "Vargottama" since that term is classically D9-specific.
3. 4th house/lord treated as the core vidya indicator (parallel to D10's
   10th house/lord for career, D9's 7th house/lord for marriage).
4. Mercury modeled as primary learning/communication karaka; Jupiter modeled
   as wisdom/higher-knowledge karaka with kendra/trikona (1/4/5/9) placement
   bonus.
5. `analyzeEducationFieldIndications` added — 4th-sign element + occupant
   planet based qualitative subject-tendency read (parallel to D10's
   `analyzeCareerFieldIndications`), using `FIELD_INDICATORS` from
   `d24Rules.js`.
6. `analyzeLagnaLordOrientation`, `compareD1D24Strength`,
   `analyzeSupportingHouses` (houses 2/5/9/11), `synthesizeObstacleAndDelay`,
   and `assessLearningStability` all ported from the D10 pattern with
   vidya-appropriate house sets and wording.
7. Dignity scoring explicitly labeled as a proxy, not Vimshopaka Bala
   (same caution as D9/D10's dignity module).
8. Vimshottari Mahadasha sequence capped exactly at 120 years — shared
   logic with D9/D10, unchanged.
9. Dasha-education timeline filters only 4th-lord and Mercury/Jupiter
   Mahadashas, avoiding noise from unrelated planet periods.
10. Controller/service/routes follow the same request shape as the D10
    module so both can share the same D1-generation upstream call.
11. Sanity test re-uses the exact same sample planetary data as D7/D9/D10's
    test for direct cross-verification between the divisional modules.
12. `TIMING_CAVEAT` reworded for education context (exam-success/graduation),
    surfaced in every compact response under `timing.caveat`.
13. `analyzeEducationStream` added — Science/Commerce/Humanities/Vocational-
    Research leaning scores (0-100 each), parallel to D10's
    `analyzeCareerType`.
14. `analyzeHigherAndForeignEducation` added — likelihood proxy (0-100 + level)
    from 9th/12th house occupants, 9th-lord placement, and Jupiter's
    dignity/house, parallel to D10's `analyzeTransferRelocation`.
15. `buildLearningGrowthTimeline` and `extractGraduationWindows` added,
    parallel to D10's `buildCareerGrowthTimeline` and
    `extractPromotionWindows`.
16. `buildCompactD24Response` includes `analysis.educationStream`,
    `analysis.higherForeignEducation`, `analysis.timing.growthTimeline`,
    `analysis.timing.graduationWindows` as top-level compact fields.
