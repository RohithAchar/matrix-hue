# Issue 5 — Single Player Game Flow

**Type:** AFK
**Blocked by:** Issues 3 (Home Page UI), 4 (HSL Slider Component)
**User stories covered:** 6, 12, 14, 15, 17, 18, 19, 20

---

## What to Build

The complete Single Player game experience. Player selects Single Player + difficulty on the home page → enters the game page → plays 5 rounds → sees final score. Everything runs client-side: color generation, timing, scoring, and state management.

This is the core gameplay loop. Get this right and the other modes are variations on the same pattern.

### Game Page (`client/src/pages/Game.jsx`)

Route: `/play/single`. Receives difficulty from GameContext.

### Round Sequence (same for all 5 rounds)

**Step 1 — Memorize Phase**

- A target color is generated using `client/src/utils/colorGen.js` (see below).
- A large `ColorSwatch` (200x200) is displayed prominently in the center.
- A countdown timer runs for the duration:

| Difficulty | Timer |
|---|---|
| Easy | 6 seconds |
| Medium | 4 seconds |
| Hard | 2 seconds |

- The timer is a circular ring animation (GSAP) around the color swatch.
- The round number is displayed: "Round 1 of 5".

**Step 2 — Fade Phase**

- When the timer reaches 0, the color fades to a neutral gray over 1 second using GSAP.
- The timer ring dissolves.
- A brief "Now recreate it!" text fades in.

**Step 3 — Recreate Phase**

- `HSLSliderGroup` slides in from below (GSAP).
- `ColorPreviewSwatch` shows the user's current guess.
- Initial slider positions are randomized (not starting at 0/0/0 or 50/50/50 — pick random HSL values for the starting position).
- A "Submit Guess" button is visible but disabled until the user has touched at least one slider.

**Step 4 — Submit**

- User clicks "Submit Guess".
- The client calculates the CIEDE2000 delta between the target and guess.
- The logarithmic scoring function maps delta to score out of 10.

**Step 5 — Reveal Phase**

- Target color swatch + guessed color swatch shown side-by-side.
- Score out of 10 displayed with a GSAP count-up animation.
- Brief text: "Delta: 2.3" (small text below the score).
- "Next Round" button appears.

**After Round 5**

- Final score screen: "Your score: 43 / 50".
- Breakdown of all 5 round scores.
- "Play Again" button → navigates back to home.
- No leaderboard for Single Player (this is the differentiator from other modes).

### Color Generation (`client/src/utils/colorGen.js`)

```js
function generateTargetColor(difficulty) {
  // Returns { h: number, s: number, l: number }
  // Constraints per difficulty:
  //
  // Easy:
  //   Hue: one of 4 quadrants (randomly selected per game, not per round)
  //     0-60 (reds), 180-270 (blues), 90-180 (greens), 270-360 (purples)
  //     Pick the quadrant once, then all 5 rounds stay in that quadrant
  //   Saturation: 50-75%
  //   Lightness: 40-60%
  //
  // Medium:
  //   Hue: 0-360
  //   Saturation: 30-85%
  //   Lightness: 25-75%
  //
  // Hard:
  //   Hue: 0-360
  //   Saturation: 5-100%
  //   Lightness: 5-95%
}
```

Example output for Easy (reds quadrant):
```js
// Game 1, Round 1 — hueQuadrant = "reds" (0-60)
{ h: 22, s: 62, l: 48 }

// Game 1, Round 2 — same quadrant
{ h: 45, s: 71, l: 55 }

// Game 2 — might be "blues" quadrant
```

### CIEDE2000 (`client/src/utils/cieDe2000.js`)

A pure-JavaScript implementation of the CIEDE2000 color difference formula.

- Input: `(h1, s1, l1, h2, s2, l2)` in HSL.
- Output: delta (0 = perfect match, higher = worse).
- Implementation should convert HSL → LAB internally (standard formula) then compute CIEDE2000.
- Reuse the same algorithm that the server will use (copy to server/utils/cieDe2000.js in a later issue).
- Test with known HSL pairs:

```js
// Identical colors → delta 0
cieDe2000(0, 0, 50, 0, 0, 50) // ≈ 0

// Very different colors → large delta
cieDe2000(0, 100, 50, 240, 100, 50) // ≈ 50+

// Known pair from literature
cieDe2000(120, 60, 40, 120, 55, 35) // ≈ some known value
```

### Scoring (`client/src/utils/scoring.js`)

```js
function scoreFromDelta(delta) {
  const maxDelta = 100;
  const score = 10 * (1 - Math.log(1 + delta) / Math.log(1 + maxDelta));
  return Math.max(0, Math.round(score * 10) / 10); // Round to 1 decimal
}
```

Examples:
```js
scoreFromDelta(0)    // 10.0  (perfect)
scoreFromDelta(2.3)  // ≈ 8.2  (close)
scoreFromDelta(15)   // ≈ 5.1  (moderate)
scoreFromDelta(50)   // ≈ 2.3  (far off)
scoreFromDelta(100)  // 0.0   (max delta)
```

### Game State (`client/src/context/GameContext.jsx` extend)

```js
{
  // ... existing mode/difficulty state
  round: number,         // 0-4 (current round index)
  rounds: [              // results after each round
    {
      target: { h, s, l },
      guess: { h, s, l },
      delta: number,
      score: number      // out of 10
    }
  ],
  totalScore: number,    // sum of all round scores
  phase: "memorize" | "fade" | "recreate" | "reveal" | "finished"
}
```

---

## Acceptance Criteria

- [ ] Selecting Single Player + difficulty on home navigates to `/play/single`.
- [ ] A target color is shown for the correct duration per difficulty (6s/4s/2s).
- [ ] Color fades out over 1 second with GSAP.
- [ ] HSL sliders appear with randomized starting positions and live preview.
- [ ] "Submit Guess" submits the guess.
- [ ] Score reveal shows side-by-side swatches, score out of 10 with count-up animation.
- [ ] 5 rounds play sequentially.
- [ ] After round 5, final score out of 50 is shown with per-round breakdown.
- [ ] "Play Again" returns to home.
- [ ] Test: color generation produces HSL values within difficulty constraints.
- [ ] Test: `cieDe2000(identical)` returns 0.
- [ ] Test: `scoreFromDelta(0)` returns 10.

---

## Blocked by

Issue 3 — Home Page UI (for mode+difficulty selection and navigation).
Issue 4 — HSL Slider Component (for the slider input).
