# Issue 6 — Distractions (Medium & Hard)

**Type:** AFK
**Blocked by:** Issue 5 (Single Player Game Flow)
**User stories covered:** 13

---

## What to Build

A distraction system that makes Medium and Hard difficulties harder by interfering with the player's visual memory during the memorization phase. Medium uses Stroop-effect text popups. Hard uses the same popups more frequently plus background color changes.

### Component: `DistractionOverlay`

Located at `client/src/components/DistractionOverlay.jsx`.

**Props:** `{ difficulty: "easy" | "medium" | "hard", duration: number, onComplete: () => void }`

- Easy: renders nothing (empty fragment).
- Medium: renders color-name popups every ~1.5s.
- Hard: renders color-name popups every ~0.5s + background pulse.

### Stroop Text Popups

Each popup is a color-name word rendered on screen at a random position inside the swatch area.

**Color name pool:**
```js
["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "CYAN", "PINK", "TEAL", "BROWN"]
```

**Display color (the ink color):**
Randomly pick from the same pool. Sometimes the ink matches the word (congruent), sometimes it doesn't (Stroop conflict). Roughly 50/50 split to keep the player guessing.

**Visual:**
- Position: random x, y within the swatch container.
- Font size: 24-36px (randomized).
- Font weight: bold.
- GSAP: fade in over 200ms, hold for 800ms, fade out over 200ms.
- No two popups should overlap (basic collision check — discard positions too close to existing popups).

### Background Color Changes (Hard only)

During the memorization phase, the background behind the color swatch shifts to a random color for 300ms:

- Pick a random hue (0-360), moderate saturation (40-60%), moderate lightness (40-60%).
- GSAP: shift background color over 100ms, hold 100ms, shift back over 100ms.
- This happens 1-2 times during the 2s Hard memorization window.

### Integration into Game

In `Game.jsx`, during the memorization phase, render:

```jsx
<div className="memorize-phase" style={{ position: 'relative' }}>
  <ColorSwatch h={target.h} s={target.s} l={target.l} />
  
  {/* The outer wrapper background shifts on Hard */}
  <DistractionBackgroundShifter
    difficulty={difficulty}
    duration={memorizeDuration}
  />

  {/* Popups overlay on top of the swatch */}
  <DistractionOverlay
    difficulty={difficulty}
    duration={memorizeDuration}
  />
</div>
```

### Example: Medium Distraction Sequence (4 seconds)

```
t=0.0s: Swatch appears
t=0.5s: "PURPLE" appears in yellow ink at (120, 80) → fades out by t=1.5s
t=2.0s: "GREEN" appears in green ink at (60, 140) → fades out by t=3.0s
t=3.5s: "BLUE" appears in orange ink at (180, 60) → begins fading out at t=4.0s
t=4.0s: Timer ends, fade-out begins
```

### Example: Hard Distraction Sequence (2 seconds)

```
t=0.0s: Swatch appears
t=0.3s: "RED" appears in blue ink at (100, 100)
t=0.5s: Background shifts briefly to hsl(300, 50%, 50%) for 300ms
t=0.8s: "YELLOW" appears in cyan ink at (50, 50)
t=1.0s: "CYAN" appears in red ink at (150, 120)
t=1.2s: Background shifts again for 300ms
t=1.5s: "PINK" appears in green ink at (80, 80)
t=2.0s: Timer ends, fade-out begins
```

---

## Acceptance Criteria

- [ ] Easy difficulty shows no distractions.
- [ ] Medium difficulty shows ~2-3 Stroop popups during the memorization phase (one every ~1.5s).
- [ ] Hard difficulty shows ~4 popups (one every ~0.5s) plus 1-2 background flashes.
- [ ] Popup texts use color names from the pool, displayed in random ink colors.
- [ ] GSAP handles all popup transitions (fade in/out).
- [ ] Hard mode background shifts are visible but brief (300ms).
- [ ] The target color swatch itself is not affected by distractions.
- [ ] Test: distractions render in Medium/Hard but not Easy.
- [ ] Test: no visual regression — sliders and other UI remain intact.

---

## Blocked by

Issue 5 — Single Player Game Flow (need the memorization phase to hook distractions into).
