# MatrixHue — Product Requirements Document

## Problem Statement

Color-guessing games exist but are often either too simplistic (multiple choice) or lack competitive multiplayer mechanics. Existing color games don't provide a shared, asynchronous experience where a host's random challenge can be replayed by friends, nor do they offer a daily global competition with memory-based color replication. Players want a test of their color perception and memory that is fair, competitive, and replayable without requiring user accounts or real-time synchronization.

## Solution

MatrixHue is a web-based color memory game where players memorize a target color for a few seconds, then recreate it using HSL sliders. The game offers three modes:

- **Single Player** — Practice mode, fully client-side, unlimited plays.
- **Play with Friends** — A host plays 5 rounds, then shares a code. Friends play the same 5 colors asynchronously. The leaderboard updates as each player finishes.
- **Global** — A daily set of 5 colors is generated when the first player plays that day. Everyone competes on the same colors. Unlimited attempts with best score counting per player.

Scoring uses the CIEDE2000 color difference algorithm, mapped logarithmically to a score out of 10 per round (50 max). Three difficulty levels affect memorization time and distractions. No authentication required — identity is tracked via a server-issued session token stored in localStorage.

## User Stories

1. As a player, I want to see a minimal, atmospheric home screen with difficulty selection, so that I can choose my challenge level before entering a game mode.
2. As a player, I want the home screen background color to shift based on difficulty (black → subtle red → dark red), so that I feel the escalating intensity.
3. As a player, I want subtle animations and sound effects when interacting with buttons and transitioning between screens, so that the game feels polished and immersive.
4. As a first-time player, I want to enter a display name before my first game, so that the system can identify me on the leaderboard.
5. As a returning player, I want my session to be remembered, so that I can jump straight into a game without re-entering my name.
6. As a single player, I want to play unlimited practice rounds with client-side scoring, so that I can improve my color matching skills without server dependency.
7. As a host in Play with Friends mode, I want to play 5 rounds and receive a shareable code afterward, so that I can challenge my friends to beat my score.
8. As a friend in Play with Friends mode, I want to enter a share code to start a challenge, so that I can compete against the same colors my host played.
9. As a player in Play with Friends mode, I want the leaderboard to update as each friend finishes, so that I can see the standings grow in real time.
10. As a player in Global mode, I want to compete on a daily set of colors shared by everyone worldwide, so that the leaderboard is fair.
11. As a player in Global mode, I want unlimited attempts with my best score counting, so that I have incentive to keep improving.
12. As a player, I want three difficulty levels (Easy/Medium/Hard) to change memorization time, so that the game scales with my skill.
13. As a player, I want Medium and Hard difficulties to include visual distractions during memorization, so that the challenge goes beyond simple memory.
14. As a player, I want a color swatch shown for a limited time during the memorization phase, so that I can study the target.
15. As a player, I want the target color to fade out smoothly, so that the transition feels natural.
16. As a player, I want three vertical HSL sliders with numeric readouts and a live preview swatch, so that I can accurately recreate the color I remember.
17. As a player, I want to click "Submit Guess" explicitly, so that I control when my attempt is finalized.
18. As a player, I want to see my guessed color next to the target color after submission, so that I can compare and learn.
19. As a player, I want my per-round score displayed out of 10, so that I understand my performance on each color.
20. As a player, I want my total score shown out of 50 after 5 rounds, so that I have a clear final result.
21. As a player, I want to see a leaderboard after completing 5 rounds in Friends or Global mode, so that I can see where I rank.
22. As a player, I want the leaderboard to show round-by-round scores, total score, and submission time, so that I can analyze performance.
23. As a player, I want the global leaderboard to highlight my own entry, even if I'm outside the top 100, so that I can always find myself.
24. As a player entering an invalid share code, I want an inline error message, so that I know the code is wrong without a disruptive modal.
25. As a player experiencing a network failure on guess submission, I want a retry option, so that my attempt isn't lost.
26. As a host who accidentally refreshes before the challenge is saved, I want my 5 colors backed up in localStorage, so that I can retry the server save.

## Implementation Decisions

### Tech Stack

- **Frontend:** Vite + React (JavaScript), React Router v6, GSAP (animations), Howler.js (sound effects)
- **Backend:** Express.js + Mongoose + MongoDB
- **Project Structure:** Monorepo with `client/` and `server/` directories, root `package.json` with `concurrently` for dev mode
- **CIEDE2000 Calculation:** Server-side for Friends and Global modes; client-side for Single Player

### Traffic Differentiation & Identity

| Scenario | Behavior |
|---|---|
| First visit | Player selects mode + difficulty → name modal appears → calls `POST /api/session` → session token + display name stored in localStorage → game starts |
| Return visit | Session token exists in localStorage → skip name modal → directly into game |
| Identity management | No authentication. Server issues a UUID session token. Name changes require clearing localStorage. |

### Home Page Layout

1. **Difficulty section** (top row): Easy / Medium / Hard pills. Background color shifts based on selection (Easy = black, Medium = subtle red, Hard = dark red). GSAP transitions.
2. **Mode section** (below): Single Player / Play with Friends / Global cards.
3. Selection of mode + difficulty triggers the game start (with name modal if new player).

### Memorization Phase

| Difficulty | Duration | Distractions |
|---|---|---|
| Easy | 6 seconds | None |
| Medium | 4 seconds | Color-name text popups (Stroop-style) every ~1.5s |
| Hard | 2 seconds | Color-name text popups every ~0.5s + background color changes |

- Target color is shown as a prominent swatch with a circular countdown timer.
- Color fades out over 1 second after the memorization timer ends.

### HSL Slider & Guess Submission

- Three vertical range sliders: Hue (0–360), Saturation (0–100%), Lightness (0–100%)
- Numeric readouts next to each slider
- Live color preview swatch updating on drag
- Initial slider positions randomized
- Explicit "Submit Guess" button
- No time limit on the recreation phase

### Score Calculation

- **CIEDE2000 delta** computed server-side for Friends/Global, client-side for Single Player
- **Logarithmic mapping:** `score = max(0, 10 * (1 - log(1 + delta) / log(1 + maxDelta)))`
- Per-round score out of 10, total out of 50
- Reveal after each guess: target swatch vs guessed swatch side-by-side + score + "Next Round" button

### Color Generation Constraints

| Difficulty | Hue | Saturation | Lightness |
|---|---|---|---|
| Easy | One of 4 warm/cool quadrants per game (reds/blues/greens/purples) | 50–75% | 40–60% |
| Medium | Full 0–360 | 30–85% | 25–75% |
| Hard | Full 0–360 | 5–100% | 5–95% |

### Play with Friends — Challenge Flow

1. Host selects Play with Friends + difficulty → plays 5 rounds client-side
2. After round 5, client sends `POST /api/challenges` with 5 target colors + host scores
3. Server stores challenge, returns a 6-character alphanumeric share code
4. Host sees code prominently with a copy button
5. Friends enter code on home screen → fetch challenge targets → play 5 rounds with server-verified scoring
6. One attempt per player per challenge
7. Leaderboard updates as each player finishes
8. Host's 5 colors saved to localStorage as fallback if page is refreshed before server save

### Global Mode — Daily Challenge Flow

1. First player on a given day selects Global + difficulty → server generates 5 colors → creates a `global_session` document with today's date
2. Subsequent players fetch today's existing targets (`GET /api/global/init`)
3. Unlimited attempts per player per day
4. Only the best score per player per day is kept on the leaderboard
5. Leaderboard resets daily
6. A player's score is attributed to the day they *started* the game (day boundary handled by server date at game start)

### Leaderboard Design

- **Friends leaderboard:** All players in the room, ranked by total score
- **Global leaderboard:** Top 100 players, current player's row highlighted even if outside top 100
- **Columns:** Rank | Player name | Round scores (1–5) | Total (out of 50) | Submission time
- **Tiebreaker:** Earlier submission wins
- Global leaderboard resets when new daily colors generate

### API Contracts

| Method | Endpoint | Request | Response | Notes |
|---|---|---|---|---|
| POST | `/api/session` | `{ displayName }` | `{ sessionToken, displayName }` | Creates player session |
| POST | `/api/challenges` | `{ sessionToken, difficulty, targets: [5 HSL] }` | `{ shareCode }` | Host saves challenge after 5 rounds |
| GET | `/api/challenges/:code` | — | `{ difficulty, targets: [5 HSL] }` | Friend fetches challenge targets |
| POST | `/api/challenges/:code/round` | `{ sessionToken, roundIndex, guessHsl }` | `{ score, targetColor }` | Submit guess in Friends mode |
| GET | `/api/challenges/:code/leaderboard` | — | `{ entries: [...] }` | Friends leaderboard |
| GET | `/api/global/init` | `?difficulty=easy&sessionToken=...` | `{ targets: [5 HSL], date }` | Get or create today's global targets |
| POST | `/api/global/round` | `{ sessionToken, difficulty, roundIndex, guessHsl }` | `{ score, targetColor }` | Submit guess in Global mode |
| GET | `/api/global/leaderboard` | `?difficulty=easy` | `{ entries: [...] }` | Global leaderboard |

### MongoDB Schema

**`players` collection**
```
sessionToken: String (UUID)
displayName:  String
createdAt:    Date
```

**`challenges` collection**
```
shareCode:       String (6-char, unique indexed)
hostSession:     String (sessionToken)
difficulty:      String ("easy" | "medium" | "hard")
targets:         [{ h: Number, s: Number, l: Number }] (length 5)
playerScores:    [{ sessionToken, displayName, roundScores: [Number], totalScore: Number, finishedAt: Date }]
createdAt:       Date
```

**`global_sessions` collection**
```
date:         String ("YYYY-MM-DD")
difficulty:   String ("easy" | "medium" | "hard")
targets:      [{ h: Number, s: Number, l: Number }] (length 5)
playerScores: [{ sessionToken, displayName, roundScores: [Number], totalScore: Number, finishedAt: Date }]
createdAt:    Date
```

### Resilience & Edge Cases

| Scenario | Behavior |
|---|---|
| Invalid share code | Inline error below input: "No challenge found with that code" |
| Network failure on guess submission | Retry banner displayed; guess held in memory until successful |
| Page refresh mid-game | Progress lost (acceptable for casual play) |
| Host refresh before challenge saved | 5 target colors backed up in localStorage; retry server save on next visit |
| Global mode day boundary | Score attributed to the date the player *started* the game |

### Sound Effects (Howler.js)

- ~5–6 free SFX files
- Triggers: button clicks, round start chime, timer tick, fade-out whoosh, score reveal (pitch varies by quality), leaderboard reveal
- Soft, minimal, tasteful aesthetic — not arcade-style

## Testing Decisions

### What Makes a Good Test

- Tests should validate external behavior, not implementation details.
- For the backend: test API responses (status codes, shape of response bodies, correct score computation, leaderboard ordering).
- For the frontend: test component rendering, navigation flows, and user interactions at the integration level.
- CIEDE2000 calculation: test with known color pairs and expected delta values to confirm accuracy.

### Testable Modules

- **Server:** API route handlers, CIEDE2000 utility, score mapping function, challenge creation and retrieval, leaderboard sorting/tiebreaking
- **Client:** HSL slider component behavior, score display component, round transition flow, localStorage session handling, home page mode/difficulty selection
- **Integration:** Full round flow (fetch targets → show color → fade → sliders → submit → reveal), challenge share code flow (host plays → saves → friend joins → plays → leaderboard)

### Prior Art

- Standard Express.js route testing with Supertest + Jest/Vitest.
- React Testing Library for component-level tests focusing on user interactions.
- No existing tests in the project (greenfield), so this establishes the first patterns.

## Out of Scope

- User authentication / OAuth / social login
- Mobile native app (web-only, though responsive design is expected)
- Real-time WebSocket connections (async-only for multiplayer)
- Chat or messaging between players
- Spectator mode / watching other players' games live
- Custom color palette creation or sharing outside the challenge system
- Monetization, ads, or premium features
- Accessibility features beyond standard HTML semantics (not an initial focus)
- CI/CD pipeline, Docker containerization, or deployment configuration
- Internationalization / localization
- Dark mode toggle (the game is dark by design)
- Leaderboard pagination controls beyond top 100 slice
- Historical leaderboard archival (old daily challenges are not re-viewable)

## Further Notes

- The game's aesthetic targets a minimal, slightly dark atmospheric vibe (inspired by color-by-perception games). The home screen difficulty-to-background mapping (black → subtle red → dark red) reinforces this.
- Distractions on Medium and Hard are designed around the Stroop effect — showing color-name text rendered in conflicting colors to interfere with visual memory encoding.
- HSL sliders were chosen over other color models (RGB, LAB, hex input) because the cylindrical model maps most intuitively to human color perception: you pick a base hue, then tune saturation and lightness.
- The unlimited-attempt-with-best-score model for Global mode incentivizes daily engagement while keeping the leaderboard fair.
- No time limit on the recreation phase was a deliberate choice — the core challenge is visual memory, not speed. This keeps the game accessible to all ages.
