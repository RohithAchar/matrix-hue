# Issue 12 — Sound System

**Type:** AFK
**Blocked by:** Issues 3 (Home Page UI), 5 (Single Player Game Flow)
**User stories covered:** 3

---

## What to Build

Integrate sound effects using Howler.js. Sounds are triggered by key game events: button clicks, round start, timer ticking, fade-out, score reveal, and leaderboard reveal. The sound palette is minimal and tasteful — subtle feedback, not arcade explosions.

### Installation

Add Howler.js to the client:
```
npm install howler
```

### Audio Files

Place ~5-6 free SFX files in `client/src/assets/sounds/`:

| File | Purpose | Sound style |
|---|---|---|
| `click.mp3` | Button click (mode/difficulty select, submit) | Short, soft pop (~80ms) |
| `round-start.mp3` | Color swatch appears | Brief rising chime (~300ms) |
| `tick.mp3` | Memorization timer tick (subtle) | Gentle click/tap (~50ms) |
| `fade.mp3` | Color fades out | Descending whoosh/woosh (~500ms) |
| `score.mp3` | Score reveal | Pleasant chord — pitch varies based on score quality |
| `leaderboard.mp3` | Leaderboard appears | Soft fanfare (~1s) |

**Source recommendations (free, CC0):**
- [ZapSplat](https://www.zapsplat.com/) — free account required
- [Mixkit](https://mixkit.co/free-sound-effects/) — no attribution needed
- [Freesound](https://freesound.org/) — filter by CC0 license

### Hook: `useSound`

Create `client/src/hooks/useSound.js`:

```js
function useSound() {
  return {
    playClick: () => { /* ... */ },
    playRoundStart: () => { /* ... */ },
    playTick: () => { /* ... */ },
    playFade: () => { /* ... */ },
    playScore: (score) => { /* play sound with pitch variation */ },
    playLeaderboard: () => { /* ... */ },
  };
}
```

**Implementation details:**
- Pre-load all sounds on first call using `Howl` instances.
- `playScore(score)` should vary the playback rate based on score quality:
  - Score >= 9: higher pitch (happy).
  - Score 5-8.9: normal pitch.
  - Score < 5: slightly lower pitch (encouraging, not punishing).
- All sounds should be at a comfortable volume (0.3-0.5 range, adjustable).
- Mute toggle: `useSound` should expose a `muted` state and `toggleMute()` function, persisted in localStorage.
- Sounds should never overlap in a jarring way — if the same sound is triggered rapidly (e.g., multiple button clicks), allow the last one to preempt.

### Integration Points

Wire sounds into existing components:

| Component | Event | Sound |
|---|---|---|
| `Home.jsx` — difficulty pill click | `onClick` | `playClick()` |
| `Home.jsx` — mode card click | `onClick` | `playClick()` |
| `NameModal.jsx` — submit button | `onClick` | `playClick()` |
| `Game.jsx` — round start (swatch appears) | `phase → "memorize"` | `playRoundStart()` |
| `Game.jsx` — each timer second | per timer tick | `playTick()` (only if remaining <= 3s for tension) |
| `Game.jsx` — fade-out begins | `phase → "fade"` | `playFade()` |
| `Game.jsx` — score reveal | `phase → "reveal"` | `playScore(score)` |
| `Leaderboard.jsx` — leaderboard appears | `onMount` | `playLeaderboard()` |
| All buttons (submit, next round, back) | `onClick` | `playClick()` |

### Mute Toggle

Add a small speaker icon in the corner of the home page (and persisted across routes):
- 🔊 when unmuted
- 🔇 when muted
- Clicking toggles. State stored in localStorage key `soundMuted`.

### Example: Score Reveal Pitch Variation

```js
function playScore(score) {
  const rate = score >= 9 ? 1.4 : score >= 5 ? 1.0 : 0.8;
  scoreSound.rate(rate);
  scoreSound.play();
}
```

### Example: Timer Tick (Last 3 Seconds Only)

```js
// In the memorization timer
const remainingSeconds = memorizeDuration - elapsedSeconds;
if (remainingSeconds <= 3 && remainingSeconds > 0) {
  playTick();
}
```

---

## Acceptance Criteria

- [ ] Howler.js is installed and configured in the client.
- [ ] 6 sound files exist in `client/src/assets/sounds/`.
- [ ] `useSound` hook provides named play functions for all sound events.
- [ ] `playScore(score)` varies pitch based on score.
- [ ] Timer tick only plays in last 3 seconds of memorization.
- [ ] Mute toggle works and persists across page reloads (localStorage).
- [ ] Sounds are not jarring or overlapping (volume ~0.3-0.5).
- [ ] All wired events correctly trigger sounds.
- [ ] Test: mute toggle persists in localStorage.
- [ ] Test: sound hook can be called without errors when audio files are missing (graceful degradation).

---

## Blocked by

Issue 3 — Home Page UI (need the home page to wire click sounds).
Issue 5 — Single Player Game Flow (need the game flow to wire memorization/fade/score sounds).
