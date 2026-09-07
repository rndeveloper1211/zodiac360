# D4 Module — Changes Added

## Naye Files
- **d4ExtendedRules.js** — 5 naye analyses:
  1. `analyzeMotherWellbeingIndication` — Moon dignity/house + 4th house occupants ke basis par mother-side wellbeing ka symbolic indication (medical advice nahi, disclaimer included)
  2. `analyzeSukhIndex` — overall ghar/mental comfort score (0-100)
  3. `analyzeWealthAndSavings` — 2nd + 11th house synthesis (fixed deposits/accumulated wealth)
  4. `analyzeMultiplePropertiesIndication` — kitni properties ka signal hai (Single/Moderate/Strong)
  5. `analyzeDivisionalStrength` — D4 lagna lord & 4th lord ki dignity (exalted/own/neutral/debilitated), simplified Vimshopaka-proxy

- **d4DashaEngine.js** — Vimshottari **Mahadasha** timing calculation
  - ⚠️ Project mein koi Dasha module (D1/Dasha.service.js) nahi tha, isliye ye poora naya banaya gaya hai
  - Moon ke `totalDegree` (jo D1 raw report mein already available hai) se nakshatra lord + balance dasha nikalta hai, phir 120 saal ka pura Vimshottari cycle project karta hai
  - Har mahadasha period ko D4 4th-lord / 4th-house occupant / natural karaka (Mars, Saturn, Venus, Mercury) ke against tag karta hai → "kaunsi dasha mein property-matters active rahenge"

## Updated Files
- **d4ChartEngine.js** — ab har house ka D4 sign & lord (`houseSigns`, `houseLords`, `fourthLordName`) bhi return karta hai (naye modules ko chahiye tha)
- **d4Engine.js** — dasha calculation wire kiya (Moon.totalDegree + meta.utcTimestamp/inputDate se), result ko interpreter ko pass karta hai
- **d4Interpreter.js** — 5 naye insights (`sukhIndex`, `wealthAndSavings`, `multiplePropertiesIndication`, `motherWellbeingIndication`, `divisionalStrength`) + `propertyTimingDasha` ab `advancedD4Insights` ke andar aate hain, aur integrated synthesis text mein bhi jud gaye hain

## Important Limitations (please review)
1. **Antardasha (sub-period) calculate nahi hota** — sirf Mahadasha (main period) level ki timing hai. Zyada precise timing chahiye to Antardasha add kiya ja sakta hai.
2. **Dasha ka 1 saal = 365.25 din** approximation use hui hai (standard practice hai, but kuch software 365.2425 din use karte hain — farak sirf few hours/year ka hai).
3. **Divisional Strength sirf ek simplified proxy hai** (exalted/own/neutral/debilitated) — ye classical **Vimshopaka Bala** nahi hai jisme sabhi divisional charts (D1-D60) ka weighted combination hota hai.
4. **Mother wellbeing indication purely symbolic/astrological hai**, medical diagnosis nahi — code mein explicit disclaimer diya gaya hai.
5. Ye sabhi naye modules `../D3/d3Rules` par depend karte hain (jaise purane files karte the) — is dependency ko change nahi kiya gaya.

## Test Verification
Aapke diye gaye real D1 data (DOB 2001-02-15, 05:30) se pura pipeline chalaya gaya:
- Moon nakshatra "Vishakha" → dasha lord "Jupiter" — ye standard classical nakshatra-lord assignment se match karta hai ✔️
- fourthLordName = "Mars" — pehle se computed `fourthLordDetails.fourthLord` se match karta hai ✔️
- Sab naye functions bina error ke chal rahe hain, output structurally valid hai ✔️

## Deep Master Rules Refactor - 2026-09-05
- `D7advancedrules.js` is now the single source of truth for D7 interpretation.
- Added D1↔D7 progeny promise confirmation.
- Added explicit delay vs severe-obstruction synthesis.
- Removed exact/multiple-child inference from raw planet counts.
- Added D7 supporting-house analysis for 2/7/9/11.
- Added D7 dignity proxy to the master rule file.
- Added Vimshottari Mahadasha + Antardasha + Pratyantar relevance scoring.
- Added optional Jupiter/Saturn transit trigger layer.
- Added ranked timing windows with evidence and confidence.
- `D7dashaengine.js` and `D7extendedrules.js` remain compatibility facades only.
