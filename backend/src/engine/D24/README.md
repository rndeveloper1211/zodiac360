# D24 (Chaturvimshamsha) Module

Vidya (education), gyaan (knowledge) aur learning-capacity check ke liye D24
module — same layered architecture jo D9 (Navamsha) aur D10 (Dashamsha) me
use hui thi.

## Chaturvimshamsha calculation rule

Har sign 24 barabar bhaagon (1°15' each) me divide hota hai. Starting sign
planet ke D1 sign ki **odd/even** nature pe depend karta hai:

- **Odd sign** (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius) → counting
  **Leo (Simha)** se start
- **Even sign** (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces) →
  counting **Cancer (Kark)** se start

## D24-specific feature: sign-repeat strength marker

Agar planet ka D1 sign aur D24 sign same ho, toh yeh chart me ek general
strength-repetition marker maana jaata hai (`isSignRepeat`). Note: classically
"Vargottama" term specifically D9 ke liye reserved hai, isliye D24 me isi
concept ko neutral naam diya gaya hai — lekin scoring me D9-jaisa hi mild
bonus milta hai. `calculateD24Sign()` har planet/lagna ke liye yeh flag
return karta hai, aur `analyzeDivisionalStrength()` isko overall strength
score me factor karta hai.

## Layers (D9/D10 pattern follow karte hue)

1. `D24chartengine.js` — pure calculation: D1 longitude -> D24 sign/house/sign-repeat
2. `d24Rules.js` — constants: signs, lords, exaltation/debilitation, house significance, field indicators
3. `D24advancedrules.js` — deep interpretation: dignity, 4th house/lord (vidya core),
   Mercury (learning karaka), Jupiter (wisdom karaka), education-field indications,
   supporting houses, education-stream leaning, higher/foreign-education likelihood,
   obstacle/delay, promise synthesis, Vimshottari dasha timeline
4. `d24Interpreter.js` — thin orchestration wrapper around advancedrules
5. `D24dashaengine.js` / `D24extendedrules.js` — backward-compat facades
6. `D24compactresponse.js` — public-facing compact response (internal analysis hide karta hai)
7. `d24Engine.js` — top-level orchestrator: D1 raw -> chart -> interpretation -> compact response
8. `D24.controller.js` / `D24.routes.js` / `D24.service.js` — Express API layer
9. `D24_test.js` — sanity test (same sample planetary data jo D7/D9/D10 test me use hui, cross-checkable)

## What this analyzes (vs D10's career focus)

- **4th house & lord** — vidya ka core indication (D10 me yeh 10th house/lord tha)
- **Mercury** — learning/communication/formal-study ka primary karaka (D10 me Saturn career-karaka tha)
- **Jupiter** — wisdom, higher-knowledge, teaching-capacity, guru-kripa; kendra/trikona (1/4/5/9) placement check
- **Education-field indications** — 4th sign element + occupant planets se qualitative subject-tendency
  (`analyzeEducationFieldIndications`) — Sun→administration/govt-studies, Mars→engineering/defense-studies,
  Mercury→commerce/IT/analytics, Jupiter→law/philosophy/teaching, Venus→arts/design/literature,
  Saturn→vocational/long-duration technical, Ketu→spiritual/occult-study, etc.
- **D24 lagna lord orientation** — padhai ke prati approach aur self-driven learning-capacity (`analyzeLagnaLordOrientation`)
- **D1 vs D24 comparison** — "D1 = promise, D24 = refinement/manifestation": har planet ki D1 dignity D24
  dignity se compare hoti hai (`compareD1D24Strength`)
- **Sign-repeat marker** — D24-only strength marker (D9's Vargottama-equivalent, differently named)
- **Supporting houses** (2, 5, 9, 11) — foundational knowledge/speech, buddhi/intelligence, higher education/guru, degree-completion/gains
- **Learning stability** — "vidya kitni achhi hai" se alag metric; long-term sustainability ka indicator
  (`assessLearningStability`)
- **Education stream leaning** — Science/Technical vs Commerce/Trade vs Humanities/Arts vs Vocational/Research
  scores (`analyzeEducationStream`), derived from 4th-lord house placement, Mars/Sun (science), Mercury (commerce),
  Venus/Jupiter (humanities), and Saturn/Ketu (vocational/research)
- **Higher/foreign education likelihood** — 9th (higher education/guru) and 12th (foreign settlement/spiritual
  study) house occupants, 9th-lord placement, Jupiter strength (`analyzeHigherAndForeignEducation`)
- **Obstacle/delay synthesis** — malefic aspects on 4th, lord dignity, sign-repeat stability bonus
- **Dasha + Antardasha timeline** — 4th-lord aur Mercury/Jupiter Mahadasha windows, har Mahadasha ke andar
  relevant Antardashas bhi break hoti hain (`buildAntardashaSequence`); MD=AD same-planet window sabse
  strong activation flag hoti hai
- **Timing caveat** — response me explicitly bataya jaata hai ki D24 akela exact date nahi deta; D1+D24+Dasha+Gochar
  combine karna zaroori hai (`TIMING_CAVEAT`)

## Additional pieces (parallel to D10's v1.1 additions)

- **`analyzeEducationStream`** — Science/Commerce/Humanities/Vocational-Research
  leaning, scored from 4th-lord house placement (kendra/trikona vs dusthana),
  Mars/Sun (science), Mercury (commerce/analytics), Venus/Jupiter (humanities),
  and Saturn/Ketu in 4th/8th/12th (vocational/research). Returns four 0-100
  scores plus a `leaning` verdict — never a hard "you will study X" claim.
- **`analyzeHigherAndForeignEducation`** — likelihood of higher-studies/foreign
  education from 9th (higher education/guru/foreign fortune) and 12th (foreign
  settlement/isolated study) house occupants, 9th-lord placement, and
  Jupiter's dignity/house.
- **`buildLearningGrowthTimeline`** — extends the Vimshottari sequence across
  the *entire* 120-year cycle (not just vidya-karaka-filtered Mahadashas) and
  tags each Mahadasha `growth` / `stable-plateau` / `challenging-dip` from
  that planet's own D24 dignity+house strength, with a small upachaya-house
  (3/6/10/11) bump for "improves-with-effort" phases.
- **`extractGraduationWindows`** — a clean, pre-filtered list pulled from the
  existing dasha-education timeline, separating `strongest` (4th-lord MD=AD)
  from `supportive` (4th-lord Antardasha only) exam-success/graduation-probable
  windows.

All four are surfaced in the compact response under `analysis.educationStream`,
`analysis.higherForeignEducation`, `analysis.timing.growthTimeline`, and
`analysis.timing.graduationWindows` respectively.

## Honest limits (what this does NOT do)

- Koi bhi score classical Shadbala/Vimshopaka Bala nahi hai — sab qualitative proxies hain, app-consumption ke liye.
- Antardasha durations ek approximation hain jab starting Mahadasha birth-partial (truncated) ho —
  `antardashaApproximate: true` flag se pata chal jaata hai.
- Gochar (transit) analysis is module me include nahi hai — timing-windows sirf dasha-based hain,
  transit se cross-check manual rehta hai.
- Education-field indications broad classical tendencies hain, exact course/college-name prediction nahi.
- Education-stream (Science/Commerce/Humanities/Vocational) sirf 4th-lord + karaka placement se derive hoti hai;
  poori tarah confirm karne ke liye D1 ke 4th/5th/9th houses, student ki apni ruchi aur dasha bhi dekhne chahiye.
- Higher/foreign-education aur growth-timeline dono qualitative proxies hain — gochar (transit)
  is module me include nahi hai, jo exact timing ke liye zaroori hota hai.
- Mantra-siddhi/spiritual-knowledge dimension yahan explicitly ek alag score ke roop me nahi diya gaya hai;
  Jupiter/Ketu/12th-house notes indirectly is taraf point karte hain, lekin dedicated analysis nahi hai.

## Run test

From the D24 directory:

    node D24_test.js

Expected:

    D24 calculation sanity test: PASS
