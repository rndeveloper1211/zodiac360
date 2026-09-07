# D9 (Navamsha) Module

Vivah (marriage), dharma, aur samagra strength (Vargottama) check ke liye
D9 module — same layered architecture jo D7 (Saptamsha) me use hui thi.

## Navamsha calculation rule

Har sign 9 barabar bhaagon (3°20' each) me divide hota hai. Starting sign
planet ke D1 sign ki **modality** (movable/fixed/dual) pe depend karta hai —
D7 ke odd/even rule se **alag** hai:

- **Movable** (Aries, Cancer, Libra, Capricorn) → counting **same sign** se start
- **Fixed** (Taurus, Leo, Scorpio, Aquarius) → counting **9th sign** se start
- **Dual** (Gemini, Virgo, Sagittarius, Pisces) → counting **5th sign** se start

## D9-specific feature: Vargottama

Agar planet ka D1 sign aur D9 sign same ho, toh woh planet **Vargottama**
kehlaata hai — D9 ka signature strength-marker jo D7 me exist nahi karta.
`calculateD9Sign()` har planet/lagna ke liye `isVargottama` flag return
karta hai, aur `analyzeDivisionalStrength()` isko overall strength score
me factor karta hai.

## Layers (D7 pattern follow karte hue)

1. `D9chartengine.js` — pure calculation: D1 longitude -> D9 sign/house/Vargottama
2. `d9Rules.js` — constants: signs, lords, exaltation/debilitation, house significance
3. `D9advancedrules.js` — deep interpretation: dignity, 7th house/lord (marriage core),
   Venus (spouse karaka), Jupiter (dharma karaka), supporting houses, delay/obstruction,
   promise synthesis, Vimshottari dasha timeline
4. `d9Interpreter.js` — thin orchestration wrapper around advancedrules
5. `D9dashaengine.js` / `D9extendedrules.js` — backward-compat facades
6. `D9compactresponse.js` — public-facing compact response (internal analysis hide karta hai)
7. `d9Engine.js` — top-level orchestrator: D1 raw -> chart -> interpretation -> compact response
8. `D9.controller.js` / `D9.routes.js` / `D9.service.js` — Express API layer
9. `D9_test.js` — sanity test (same sample planetary data jo D7 test me use hui, cross-checkable)

## What this analyzes (vs D7's progeny focus)

- **7th house & lord** — marriage ka core indication (D7 me yeh 5th house/lord tha)
- **Venus** — spouse/marriage karaka (D7 me Jupiter putra-karaka tha)
- **Jupiter** — dharma karaka, trikona (1/5/9) placement check
- **Spouse nature/temperament** — 7th sign element + occupant planets se qualitative tendency (`analyzeSpouseNature`)
- **D9 lagna lord orientation** — marriage ke baad relationship-orientation aur self-development capacity (`analyzeLagnaLordOrientation`)
- **D1 vs D9 comparison** — "D1 = promise, D9 = refinement/manifestation": har planet ki D1 dignity D9 dignity se compare hoti hai (`compareD1D9Strength`)
- **Vargottama** — D9-only strength marker, koi bhi divisional chart me nahi hota agar D1=D9 sign na ho
- **Supporting houses** (2, 4, 9, 11) — family resources, domestic sukh, bhagya, gains
- **Marital stability** — "kitna achha match" se alag metric; long-term sustainability ka indicator (`assessMaritalStability`)
- **Delay/obstruction synthesis** — malefic aspects on 7th, lord dignity, Vargottama-stability bonus
- **Dasha + Antardasha timeline** — 7th-lord aur Venus/Jupiter Mahadasha windows, har Mahadasha ke andar relevant Antardashas bhi break hoti hain (`buildAntardashaSequence`); MD=AD same-planet window sabse strong activation flag hoti hai
- **Timing caveat** — response me explicitly bataya jaata hai ki D9 akela exact date nahi deta; D1+D9+Dasha+Gochar combine karna zaroori hai (`TIMING_CAVEAT`)

## Honest limits (what this does NOT do)

- Koi bhi score classical Shadbala/Vimshopaka Bala nahi hai — sab qualitative proxies hain, app-consumption ke liye.
- Antardasha durations ek approximation hain jab starting Mahadasha birth-partial (truncated) ho — `antardashaApproximate: true` flag se pata chal jaata hai.
- Gochar (transit) analysis is module me include nahi hai — timing-windows sirf dasha-based hain, transit se cross-check manual rehta hai.

## Run test

From the D9 directory:

    node D9_test.js

Expected:

    D9 calculation sanity test: PASS
