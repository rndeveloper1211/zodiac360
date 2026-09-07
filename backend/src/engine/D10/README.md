# D10 (Dashamsha) Module

Career, profession aur samajik pratishtha (social status) check ke liye D10
module — same layered architecture jo D9 (Navamsha) me use hui thi.

## Dashamsha calculation rule

Har sign 10 barabar bhaagon (3°00' each) me divide hota hai. Starting sign
planet ke D1 sign ki **odd/even** nature pe depend karta hai — D9 ke
movable/fixed/dual rule se **alag** hai (D7 jaisa odd/even family hai, par
9th-sign offset D9-jaisa hai):

- **Odd sign** (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius) → counting
  **same sign** se start
- **Even sign** (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces) →
  counting **9th sign** se start

## D10-specific feature: sign-repeat strength marker

Agar planet ka D1 sign aur D10 sign same ho, toh yeh chart me ek general
strength-repetition marker maana jaata hai (`isSignRepeat`). Note: classically
"Vargottama" term specifically D9 ke liye reserved hai, isliye D10 me isi
concept ko neutral naam diya gaya hai — lekin scoring me D9-jaisa hi mild
bonus milta hai. `calculateD10Sign()` har planet/lagna ke liye yeh flag
return karta hai, aur `analyzeDivisionalStrength()` isko overall strength
score me factor karta hai.

## Layers (D9 pattern follow karte hue)

1. `D10chartengine.js` — pure calculation: D1 longitude -> D10 sign/house/sign-repeat
2. `d10Rules.js` — constants: signs, lords, exaltation/debilitation, house significance, field indicators
3. `D10advancedrules.js` — deep interpretation: dignity, 10th house/lord (career core),
   Saturn (karma karaka), Sun (authority karaka), career-field indications, supporting houses,
   obstacle/delay, promise synthesis, Vimshottari dasha timeline
4. `d10Interpreter.js` — thin orchestration wrapper around advancedrules
5. `D10dashaengine.js` / `D10extendedrules.js` — backward-compat facades
6. `D10compactresponse.js` — public-facing compact response (internal analysis hide karta hai)
7. `d10Engine.js` — top-level orchestrator: D1 raw -> chart -> interpretation -> compact response
8. `D10.controller.js` / `D10.routes.js` / `D10.service.js` — Express API layer
9. `D10_test.js` — sanity test (same sample planetary data jo D7/D9 test me use hui, cross-checkable)

## What this analyzes (vs D9's marriage focus)

- **10th house & lord** — career ka core indication (D9 me yeh 7th house/lord tha)
- **Saturn** — karma/career ka primary karaka (D9 me Venus spouse-karaka tha)
- **Sun** — authority, status, government/leadership; angular/upachaya (1/10/11) placement check
- **Career field indications** — 10th sign element + occupant planets se qualitative field-tendency
  (`analyzeCareerFieldIndications`) — Sun→govt/leadership, Mars→engineering/defense, Mercury→business/IT,
  Jupiter→teaching/law/consulting, Venus→arts/design, Saturn→labour-intensive/long-service roles, etc.
- **D10 lagna lord orientation** — career ke prati approach aur self-driven work-capacity (`analyzeLagnaLordOrientation`)
- **D1 vs D10 comparison** — "D1 = promise, D10 = refinement/manifestation": har planet ki D1 dignity D10
  dignity se compare hoti hai (`compareD1D10Strength`)
- **Sign-repeat marker** — D10-only strength marker (D9's Vargottama-equivalent, differently named)
- **Supporting houses** (2, 6, 9, 11) — business income, service/competition, fortune, gains
- **Career stability** — "career kitna achha hai" se alag metric; long-term sustainability ka indicator
  (`assessCareerStability`)
- **Obstacle/delay synthesis** — malefic aspects on 10th, lord dignity, sign-repeat stability bonus
- **Dasha + Antardasha timeline** — 10th-lord aur Saturn/Sun Mahadasha windows, har Mahadasha ke andar
  relevant Antardashas bhi break hoti hain (`buildAntardashaSequence`); MD=AD same-planet window sabse
  strong activation flag hoti hai
- **Timing caveat** — response me explicitly bataya jaata hai ki D10 akela exact date nahi deta; D1+D10+Dasha+Gochar
  combine karna zaroori hai (`TIMING_CAVEAT`)

## v1.1 additions: Career type, Growth trend, Transfer/Relocation, Promotion windows

- **`analyzeCareerType`** — Government vs Private-service vs Business leaning,
  scored from 10th-lord house placement (kendra/trikona vs dusthana), Sun's
  dignity/house (govt/authority), Saturn's dignity/house (structured service),
  Mercury/Venus strength connected to 7th/10th/11th (trade), 11th lord strength
  (gains), and Rahu in 10th/11th (modern/corporate/unconventional). Returns three
  0-100 scores plus a `leaning` verdict — never a hard "you will get X job" claim.
- **`analyzeTransferRelocation`** — likelihood of transfer/relocation from 3rd
  (short-distance), 9th (long-distance/foreign) and 12th (relocation/foreign-
  settlement) house occupants, lagna-lord placement, and Moon's placement/dignity
  (mental restlessness proxy).
- **`buildCareerGrowthTimeline`** — extends the Vimshottari sequence across the
  *entire* 120-year cycle (not just career-karaka-filtered Mahadashas) and tags
  each Mahadasha `growth` / `stable-plateau` / `challenging-dip` from that
  planet's own D10 dignity+house strength, with a small upachaya-house
  (3/6/10/11) bump for "improves-with-effort" phases.
- **`extractPromotionWindows`** — a clean, pre-filtered list pulled from the
  existing dasha-career timeline, separating `strongest` (10th-lord MD=AD) from
  `supportive` (10th-lord Antardasha only) promotion-probable windows.

All four are surfaced in the compact response under `analysis.careerType`,
`analysis.transferRelocation`, `analysis.timing.growthTimeline`, and
`analysis.timing.promotionWindows` respectively.

## Honest limits (what this does NOT do)

- Koi bhi score classical Shadbala/Vimshopaka Bala nahi hai — sab qualitative proxies hain, app-consumption ke liye.
- Antardasha durations ek approximation hain jab starting Mahadasha birth-partial (truncated) ho —
  `antardashaApproximate: true` flag se pata chal jaata hai.
- Gochar (transit) analysis is module me include nahi hai — timing-windows sirf dasha-based hain,
  transit se cross-check manual rehta hai.
- Career-field indications broad classical tendencies hain, exact job-title prediction nahi.
- Career-type (Govt/Private/Business) sirf 10th-lord + karaka placement se derive hoti hai;
  poori tarah confirm karne ke liye D1 ke 2nd/7th/11th houses aur dasha bhi dekhne chahiye.
- Transfer/relocation aur growth-timeline dono qualitative proxies hain — gochar (transit)
  is module me include nahi hai, jo exact timing ke liye zaroori hota hai.

## Run test

From the D10 directory:

    node D10_test.js

Expected:

    D10 calculation sanity test: PASS
