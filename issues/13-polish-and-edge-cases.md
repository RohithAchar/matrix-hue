# Issue 13 — Polish & Edge Cases

**Type:** AFK
**Blocked by:** Issues 5 (Single Player), 8 (Guest), 11 (Global Leaderboard)
**User stories covered:** 24, 25, 26

---

## What to Build

Polish the experience and handle all edge cases that were deferred during earlier slices. This is the final layer — fixing rough edges, adding error states, and ensuring the game feels complete.

---

## 1. Network Failure Retry Banner

A reusable `RetryBanner` component that appears when an API call fails.

**Component props:**
```js
{
  message: string,     // "Failed to submit your guess."
  onRetry: () => void,
  onDismiss: () => void
}
```

**Visual:**
- Fixed at the bottom of the screen.
- Dark red/orange background with white text.
- "Retry" button and "✕" dismiss button.
- GSAP: slides up from below.

**Where it's used:**
- Guest game (Issue 8) — if `POST /api/challenges/:code/round` fails.
- Global game (Issue 10) — if `POST /api/global/round` fails.
- Host save (Issue 7) — if `POST /api/challenges` fails.

**Behavior:**
- The guess is held in memory (React state) until retry succeeds.
- The player cannot advance to the next round until the current guess is submitted successfully.
- Dismissing the banner does NOT discard the guess — the player can continue trying via a "Resubmit" button on the Submit button itself (styled differently to indicate it's pending).

---

## 2. Invalid Share Code Error

Wiring for the share code input from Issue 8:

```jsx
function ShareCodeInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${code}`);
      if (res.status === 404) {
        setError("No challenge found with that code. Check the code and try again.");
        return;
      }
      // ... navigate to game
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} />
      {error && <p className="error-text">{error}</p>}
      <button onClick={handleJoin} disabled={loading || code.length !== 6}>Join</button>
    </div>
  );
}
```

**Visual:** Error text appears below the input in a muted red color, no modal.

---

## 3. Home Screen Retry for Unsaved Host Challenge

When the home page loads, check localStorage for `pendingChallengeTargets`:

```js
const pending = JSON.parse(localStorage.getItem("pendingChallengeTargets"));
// { difficulty, targets, roundScores, totalScore, displayName }
```

If it exists, show a small banner below the mode cards:

```
┌──────────────────────────────────────────┐
│ 💾 You have an unsaved challenge.        │
│   [Complete It] [Discard]                │
└──────────────────────────────────────────┘
```

- **"Complete It":** Calls `POST /api/challenges` with the saved data.
- **"Discard":** Clears `pendingChallengeTargets` from localStorage and hides the banner.

---

## 4. MongoDB Connection Failure (503)

In the Express server middleware, add a check that MongoDB is connected before processing any `/api/*` request:

```js
const mongoose = require("mongoose");

app.use("/api/*", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Service unavailable",
      message: "Database connection unavailable. Please try again later."
    });
  }
  next();
});
```

On the client, create a `ServiceUnavailable` component that renders when the server returns 503:

- Centered message: "We're having trouble connecting to the server."
- A retry button that re-fetches the current page's data.
- Persistent on any API response with status 503.

---

## 5. GSAP Polish Pass

Go through every component that has animations and ensure consistency:

| Component | Animation | Duration | Easing |
|---|---|---|---|
| Home page — background shift | `background-color` tween | 0.6s | `power2.inOut` |
| Home page — mode card hover | `scale` to 1.05 | 0.2s | `back.out(1.7)` |
| Home page — mode card click | `scale` bounce (1.1 → 1.0) | 0.3s | `elastic.out(1, 0.5)` |
| NameModal — entrance | `opacity` 0→1 + `scale` 0.9→1.0 | 0.3s | `power2.out` |
| Memorize — swatch appears | `opacity` 0→1 + `scale` 0.95→1.0 | 0.4s | `power2.out` |
| Memorize — timer ring | `stroke-dashoffset` tween (GSAP) | matches timer duration | `linear` |
| Fade — color to gray | `background-color` tween | 1.0s | `power2.inOut` |
| Recreate — sliders enter | `y` 30→0 + `opacity` 0→1 (stagger 0.1s) | 0.4s | `power2.out` |
| Reveal — swatches appear | `x` -20→0 + `opacity` 0→1 | 0.3s | `power2.out` |
| Reveal — score count-up | animate number from 0 to score | 0.8s | `power2.out` |
| Leaderboard — rows appear | `x` 20→0 + `opacity` 0→1 (stagger 0.05s) | 0.4s | `power2.out` |
| RetryBanner — appears | `y` 100→0 | 0.3s | `power2.out` |

Where possible, use `gsap.timeline()` for sequenced animations.

---

## 6. General Error Boundaries

Add a top-level React error boundary:

```jsx
class GameErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap the entire app in `GameErrorBoundary` in `App.jsx`.

---

## 7. Loading States Audit

Every API call should have a loading state. Audit all async operations:

| Endpoint | Loading state |
|---|---|
| `POST /api/session` | Button shows "Creating..." spinner |
| `POST /api/challenges` | "Saving challenge..." text + spinner |
| `GET /api/challenges/:code` | "Loading challenge..." |
| `POST /api/challenges/:code/round` | Submit button shows spinner, disabled |
| `GET /api/challenges/:code/leaderboard` | Skeleton rows (pulsing) |
| `GET /api/global/init` | "Loading today's challenge..." |
| `POST /api/global/round` | Submit button shows spinner, disabled |
| `GET /api/global/leaderboard` | Skeleton rows (pulsing) |

---

## Acceptance Criteria

- [ ] `RetryBanner` component works for network failures in Guest and Global modes.
- [ ] Invalid share code shows inline error (no modal).
- [ ] Home screen shows retry banner for unsaved host challenge from localStorage.
- [ ] Server returns 503 with `{ error: "Service unavailable" }` when MongoDB is disconnected.
- [ ] Client shows "Service unavailable" message with retry button on 503.
- [ ] GSAP animations are consistent across all components (durations, easings per table above).
- [ ] GameErrorBoundary catches React rendering errors with a refresh prompt.
- [ ] All API calls have appropriate loading states (spinner, skeleton, or text).
- [ ] Test: home page detects `pendingChallengeTargets` in localStorage and shows banner.
- [ ] Test: `RetryBanner` renders and retry button re-invokes the failed action.

---

## Blocked by

Issue 5 — Single Player Game Flow (for GSAP polish on game phase transitions).
Issue 8 — Play with Friends: Guest (for retry banner and share code error).
Issue 11 — Global Leaderboard (for loading states and error handling).
