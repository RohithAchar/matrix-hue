# Issue 10 — Global Mode: Setup & Play

**Type:** AFK
**Blocked by:** Issues 2 (Session Identity), 3 (Home Page UI)
**User stories covered:** 10, 11

---

## What to Build

The Global mode creates a daily set of 5 target colors (per difficulty) on the server when the first player plays that day. All subsequent players that day use the same targets. Scoring is server-verified. Unlimited attempts per player — best score per difficulty counts.

### Database Layer — GlobalSession Model

Create `server/src/models/GlobalSession.js`:

```js
date:         String ("YYYY-MM-DD")
difficulty:   Enum ["easy", "medium", "hard"]
targets:      [{ h: Number, s: Number, l: Number }] (length 5)
playerScores: [{
               sessionToken: String,
               displayName: String,
               roundScores: [Number],   // length 5
               totalScore: Number,
               finishedAt: Date
             }]
createdAt:    Date (default: Date.now)
```

**Index:** Compound unique index on `(date, difficulty)` — one document per date per difficulty.

### API Layer

**`GET /api/global/init?difficulty=easy&sessionToken=abc...`**

Fetches today's targets for a given difficulty. If no session exists for today+difficulty, generates new targets server-side.

- **Query params:** `difficulty` (required), `sessionToken` (required for tracking who started it)
- **Response:**
```json
{
  "targets": [{ "h": 220, "s": 50, "l": 40 }, ...],  // 5 colors
  "date": "2026-06-06"
}
```
- **Logic:**
  1. Determine today's date as `YYYY-MM-DD` in UTC.
  2. Look for a `GlobalSession` with `date = today` and `difficulty`.
  3. If found: return the existing targets.
  4. If not found: generate 5 targets using the same color generation constraints from the PRD (using `server/src/utils/colorGen.js` — same logic as client-side, but server generates them). Create the `GlobalSession` document with `startedBy` = `sessionToken`. Return the new targets.
  5. Validate the session token exists in `players` (return 401 if not).

**`POST /api/global/round`** — Submit a guess in Global mode.

- **Request body:**
```json
{
  "sessionToken": "uuid",
  "difficulty": "easy",
  "roundIndex": 0,
  "guessHsl": { "h": 210, "s": 55, "l": 42 }
}
```
- **Response:**
```json
{
  "score": 7.3,
  "targetColor": { "h": 220, "s": 50, "l": 40 }
}
```
- **Logic:**
  1. Determine today's date in UTC. Find the `GlobalSession` for today + difficulty.
  2. If no session found, return 404 ("No global challenge active for today").
  3. Validate sessionToken against `players`. Return 401 if invalid.
  4. Get the target color from `targets[roundIndex]`.
  5. Compute CIEDE2000 delta, map to score /10.
  6. Check if this player already has a `playerScores` entry:
     - If yes: update their round score at `roundIndex` if it's higher than the existing one (best score tracking).
     - If no: create a new `playerScores` entry.
  7. Recalculate `totalScore` (sum of all round scores).
  8. If all 5 rounds have scores, set `finishedAt`.
  9. Return `{ score, targetColor }`.

### Server-Side Color Generation

Copy `colorGen.js` logic to `server/src/utils/colorGen.js`. Same constraints per difficulty.

### Client Layer — Global Game

Reuse the `Game.jsx` page with these differences:

1. On mount, call `GET /api/global/init?difficulty=...&sessionToken=...` to get targets.
2. Store `date` from the response.
3. Play 5 rounds. On each submit, call `POST /api/global/round`.
4. After all 5 rounds, navigate to the Global leaderboard (`/leaderboard/global/:difficulty/:date`).

### Unlimited Attempts Flow

1. Player completes 5 rounds → sees their score → "Play Again" button.
2. "Play Again" re-fetches `GET /api/global/init` (same targets, since same day) and starts a fresh 5-round game.
3. Each round submission calls `POST /api/global/round` — the server updates the best score for that round if the new score is higher.
4. The leaderboard reflects the player's best total score.

### Example: First Player of the Day

```
GET /api/global/init?difficulty=medium&sessionToken=a1b2c3d4

→ 200 (new targets generated)
{
  "targets": [
    { "h": 45,  "s": 65, "l": 52 },
    { "h": 190, "s": 42, "l": 38 },
    { "h": 300, "s": 70, "l": 45 },
    { "h": 120, "s": 55, "l": 60 },
    { "h": 10,  "s": 80, "l": 30 }
  ],
  "date": "2026-06-06"
}
```

### Example: Subsequent Player (Same Day)

```
GET /api/global/init?difficulty=medium&sessionToken=e5f6g7h8

→ 200 (same targets returned)
{
  "targets": [ ...identical 5 targets... ],
  "date": "2026-06-06"
}
```

### Example: Best Score Update

```
Player has roundScores: [7.5, 0, 0, 0, 0] (only round 0 played, got 7.5)

POST /api/global/round
{ "sessionToken": "a1b2c3d4", "difficulty": "medium", "roundIndex": 0, "guessHsl": { "h": 48, "s": 62, "l": 50 } }

→ 200 { "score": 8.2, "targetColor": { "h": 45, "s": 65, "l": 52 } }

Player's entry now has roundScores: [8.2, 0, 0, 0, 0] (8.2 > 7.5, so updated)
```

---

## Acceptance Criteria

- [ ] `GET /api/global/init` creates a new GlobalSession if none exists for today+difficulty.
- [ ] `GET /api/global/init` returns existing targets for subsequent calls same day+difficulty.
- [ ] `POST /api/global/round` computes score server-side and stores/updates best scores.
- [ ] Unfinished rounds (score = 0) don't count toward totalScore.
- [ ] Player can play again and improve their score.
- [ ] Test: first init creates targets, second init returns same targets.
- [ ] Test: re-submitting a round with a better score updates the entry.
- [ ] Test: `POST /api/global/round` returns 404 if no GlobalSession exists for today.

---

## Blocked by

Issue 2 — Session Identity (for session token validation).
Issue 3 — Home Page UI (for Global mode selection).
