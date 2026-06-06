# Issue 8 — Play with Friends: Guest

**Type:** AFK
**Blocked by:** Issues 2 (Session Identity), 4 (HSL Slider), 5 (Single Player Game Flow), 7 (Host)
**User stories covered:** 8, 25

---

## What to Build

A friend can enter a share code, fetch the challenge's 5 target colors from the server, and play the 5 rounds with server-verified scoring. One attempt per room. On network failure, a retry banner preserves the guess.

### API Layer

**`GET /api/challenges/:code`** — Fetch challenge data.

- **Response:** `{ difficulty: "easy"|"medium"|"hard", targets: [{h,s,l}] }`
- **Logic:** Find challenge by share code. If not found, return `404 { error: "Challenge not found" }`. Only return the target colors and difficulty — not the existing scores (that's a separate leaderboard endpoint).

**`POST /api/challenges/:code/round`** — Submit a guess for one round.

- **Request body:** `{ sessionToken: string, roundIndex: number (0-4), guessHsl: { h, s, l } }`
- **Response:** `{ score: number, targetColor: { h, s, l } }`
- **Logic:**
  1. Find challenge by share code. If not found, return 404.
  2. Validate `sessionToken` exists in `players`. If not, return 401.
  3. Check if this player already has a complete entry in `playerScores` (all 5 rounds done). If so, return `409 { error: "You have already completed this challenge" }`.
  4. Get the target color from `targets[roundIndex]`.
  5. Compute CIEDE2000 between target and guess. Map to score /10 using the logarithmic formula.
  6. If this is the player's first round (no existing partial entry), create a new `playerScores` entry.
  7. Update the entry with this round's score.
  8. If roundIndex === 4 (last round), set `totalScore` and `finishedAt`.
  9. Return `{ score, targetColor }`.

### Server-Side CIEDE2000

Copy the same implementation from `client/src/utils/cieDe2000.js` to `server/src/utils/cieDe2000.js`. Both should be identical pure functions.

### Server-Side Scoring

Copy the same scoring function from `client/src/utils/scoring.js` to `server/src/utils/scoring.js`.

### Client Layer — Share Code Input

On the home page, when "Play with Friends" mode is selected:

- Show two options: **"Create Challenge"** (existing host flow) and **"Join Challenge"**.
- "Join Challenge" shows a text input for the 6-character share code with a "Join" button.
- The share code input auto-formats to uppercase.
- On submit:
  - Call `GET /api/challenges/:code`.
  - If 404: show inline error "No challenge found with that code. Check the code and try again."
  - If 200: navigate to game page with the challenge data.
- Loading state on the button while fetching.

### Client Layer — Guest Game

Reuse the `Game.jsx` page from Single Player, but with these differences:

1. **Targets are fixed** — fetched from the server at the start. The 5 colors are predetermined.
2. **No color generation** — skip `colorGen.js`, use the targets from the challenge.
3. **Server-verified scoring** — On submit:
   - Call `POST /api/challenges/:code/round` with `{ sessionToken, roundIndex, guessHsl }`.
   - The server returns `{ score, targetColor }`.
   - Display the returned score (same reveal UI as Single Player).
   - Do NOT calculate score client-side.
4. **One attempt only** — If the server returns 409 (already completed), show a "Challenge already completed" message and redirect to the leaderboard.
5. **Network failure** — If the API call fails, show a retry banner. Store the guess in memory (don't advance to the next round until it succeeds).

### State Handling for Guest

```js
{
  mode: "friends",
  isHost: false,
  shareCode: "A3X9K2",
  challengeTargets: [5 HSL objects],
  // ... rest of game state from Issue 5
}
```

### Example: Guest Round Submission

```
POST /api/challenges/A3X9K2/round
Content-Type: application/json
{
  "sessionToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "roundIndex": 2,
  "guessHsl": { "h": 210, "s": 55, "l": 42 }
}

→ 200
{
  "score": 7.3,
  "targetColor": { "h": 220, "s": 50, "l": 40 }
}
```

### Example: Duplicate Attempt

```
POST /api/challenges/A3X9K2/round
(same body as above, but this player already has all 5 scores)

→ 409
{ "error": "You have already completed this challenge" }
```

---

## Acceptance Criteria

- [ ] `GET /api/challenges/:code` returns difficulty + targets for valid codes, 404 for invalid.
- [ ] `POST /api/challenges/:code/round` calculates score server-side using CIEDE2000.
- [ ] Server rejects duplicate attempts with 409.
- [ ] Share code input on home page auto-formats uppercase and shows error on invalid code.
- [ ] Guest plays 5 rounds using server targets, submits via API, sees score after each round.
- [ ] Network failure shows retry banner, guess is preserved in memory.
- [ ] Test: `POST /api/challenges/:code/round` returns correct score for a known HSL pair.
- [ ] Test: completing all 5 rounds sets `totalScore` and `finishedAt` in the challenge document.

---

## Blocked by

Issue 2 — Session Identity (for session token validation).
Issue 4 — HSL Slider Component (for the slider input).
Issue 5 — Single Player Game Flow (for the round loop and reveal UI).
Issue 7 — Play with Friends: Host (for the Challenge model and share code).
