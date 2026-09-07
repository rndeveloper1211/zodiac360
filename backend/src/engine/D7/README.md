# D7 Fixed Module

## Important correction

The original D7 Saptamsha calculation was already using the correct Parashari
odd/even starting-sign rule. The earlier claim that Sun/Venus/Mars were wrongly
mapped was incorrect.

For the supplied D1 data, the correct D7 mapping is:

Sun Aquarius 2.50° -> Aquarius
Moon Scorpio 0.85° -> Taurus
Mercury Capricorn 28.18° -> Capricorn
Venus Pisces 15.58° -> Sagittarius
Mars Scorpio 6.22° -> Gemini
Jupiter Taurus 8.04° -> Sagittarius
Saturn Taurus 0.61° -> Scorpio
Rahu Gemini 19.44° -> Libra
Ketu Sagittarius 19.44° -> Aries

So the original core D7 calculator was fundamentally correct.

## What this version fixes/improves

1. Strong input validation and normalized D1 input handling.
2. Explicit Saptamsha part/start-sign calculation.
3. Centralized Parashari aspect calculation.
4. Aspect records now explicitly contain fromHouse/toHouse/aspectOffset.
5. Fifth-house analysis does not double-count aspect logic.
6. Child-count analysis is qualitative; it does not use "2 planets = 2 children".
7. Dasha module explicitly labels itself as D1 Vimshottari applied to D7
   significators, not "D7 Mahadasha".
8. Dasha sequence is capped exactly at 120 years.
9. Overall score weights are explicit.
10. Dignity proxy remains clearly labeled as a proxy, not Vimshopaka Bala.
11. Controller/service input handling is more robust.
12. A sanity test is included for the exact supplied planetary data.

## Run test

From the D7 directory:

node D7_test.js

Expected:

D7 calculation sanity test: PASS
