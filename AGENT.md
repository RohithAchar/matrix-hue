# MatrixHue — Agent Guide

## Project Overview

MatrixHue is a color memory game. Players memorize a target color, then recreate it using HSL sliders. Three modes: Single Player (client-side only), Play with Friends (async multiplayer via share codes), and Global (daily competition). No authentication — identity is a server-issued session token stored in localStorage.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React (JavaScript), React Router v6 |
| Animations | GSAP |
| Sound | Howler.js |
| Backend | Express.js |
| Database | MongoDB via Mongoose |
| Monorepo tool | `concurrently` for dev mode |

## Project Structure

```
matrix-hue/
├── client/                 # React app (Vite)
│   ├── src/
│   │   ├── pages/          # Route-level components
│   │   │   ├── Home.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── JoinChallenge.jsx
│   │   ├── components/     # Shared UI components
│   │   │   ├── HSLSlider.jsx
│   │   │   ├── ColorSwatch.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── ScoreReveal.jsx
│   │   │   ├── NameModal.jsx
│   │   │   └── DifficultySelector.jsx
│   │   ├── context/        # React Context for state
│   │   │   └── GameContext.jsx
│   │   ├── hooks/          # Custom hooks
│   │   │   ├── useSession.js
│   │   │   ├── useSound.js
│   │   │   └── useTimer.js
│   │   ├── utils/          # Client-side utilities
│   │   │   ├── colorGen.js # Color generation per difficulty
│   │   │   ├── cieDe2000.js # CIEDE2000 client-side calc
│   │   │   └── scoring.js  # Score mapping function
│   │   ├── assets/         # SFX files, fonts, etc.
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # Express routers
│   │   │   ├── session.js
│   │   │   ├── challenges.js
│   │   │   └── global.js
│   │   ├── models/         # Mongoose schemas
│   │   │   ├── Player.js
│   │   │   ├── Challenge.js
│   │   │   └── GlobalSession.js
│   │   ├── controllers/    # Route handlers
│   │   │   ├── sessionController.js
│   │   │   ├── challengeController.js
│   │   │   └── globalController.js
│   │   ├── utils/          # Server utilities
│   │   │   ├── cieDe2000.js
│   │   │   ├── colorGen.js
│   │   │   └── scoring.js
│   │   └── app.js          # Express app setup
│   ├── .env                # MONGO_URI, PORT
│   ├── package.json
│   └── tests/              # Vitest + Supertest
└── package.json            # Root scripts (dev, build)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Development

```bash
# From root (starts both client and server via concurrently)
npm run dev

# Or individually
cd server && npm run dev
cd client && npm run dev
```

## Core Architecture Decisions

### Identity (No Auth)
- `POST /api/session` with a display name returns a UUID session token.
- Token + display name stored in `localStorage` under keys `sessionToken` and `displayName`.
- First visit: user picks mode+difficulty → name modal appears → session created → game starts.
- Return visit: localStorage checked → skip modal.
- Implemented in `hooks/useSession.js`.

### Mode-Specific Logic

| Mode | Color source | Scoring | Attempts |
|---|---|---|---|
| Single Player | Client-side random | Client-side | Unlimited |
| Play with Friends | Host plays → server saves 5 colors → friends fetch via code | Server-side | 1 per room |
| Global | Server generates daily set on first play | Server-side | Unlimited (best score kept) |

### Game Flow Per Round
1. **Memorize** — Color swatch shown for N seconds (Easy: 6s, Medium: 4s, Hard: 2s). Medium has Stroop popups; Hard adds background color changes.
2. **Fade** — Color fades out over 1 second (GSAP).
3. **Recreate** — Three HSL sliders appear (randomized initial position). No time limit. Live preview swatch.
4. **Submit** — Click "Submit Guess". Sends guess HSL to server (or calculates client-side for Single).
5. **Reveal** — Target vs guess swatches side-by-side. Score /10 with animation. "Next Round" button.
6. After 5 rounds → leaderboard.

### Scoring
- CIEDE2000 delta computed server-side (Friends/Global) or client-side (Single).
- Logarithmic mapping: `score = max(0, 10 * (1 - Math.log(1 + delta) / Math.log(1 + maxDelta)))` where `maxDelta` is ~100 (cap).
- Per-round: /10. Total: /50.

### Color Generation Constraints

| Difficulty | Hue | Saturation | Lightness |
|---|---|---|---|
| Easy | One of 4 quadrants (reds/blues/greens/purples) | 50–75% | 40–60% |
| Medium | Full 0–360 | 30–85% | 25–75% |
| Hard | Full 0–360 | 5–100% | 5–95% |

### Distractions (Medium & Hard)
- Color-name text elements rendered in conflicting colors (Stroop effect).
- Medium: popups every ~1.5s. Hard: popups every ~0.5s + background color changes.
- Implemented as a React component that spawns positioned text nodes with GSAP fade-in/out.

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/session` | None | Create session `{ displayName }` → `{ sessionToken, displayName }` |
| POST | `/api/challenges` | sessionToken in body | Host saves challenge `{ sessionToken, difficulty, targets: [5 HSL] }` → `{ shareCode }` |
| GET | `/api/challenges/:code` | None | Fetch challenge targets → `{ difficulty, targets }` |
| POST | `/api/challenges/:code/round` | sessionToken in body | Submit guess `{ sessionToken, roundIndex, guessHsl }` → `{ score, targetColor }` |
| GET | `/api/challenges/:code/leaderboard` | None | Friends leaderboard → `{ entries: [...] }` |
| GET | `/api/global/init?difficulty=easy&sessionToken=...` | query param | Get/create today's global targets → `{ targets, date }` |
| POST | `/api/global/round` | sessionToken in body | Submit global guess `{ sessionToken, difficulty, roundIndex, guessHsl }` → `{ score, targetColor }` |
| GET | `/api/global/leaderboard?difficulty=easy` | None | Global leaderboard → `{ entries: [...] }` |

### Leaderboard Entry Shape
```js
{
  rank: Number,
  displayName: String,
  roundScores: [Number],  // length 5
  totalScore: Number,
  finishedAt: Date
}
```

## Database

### Mongoose Models

**Player**
```
sessionToken: String (unique, UUID)
displayName:  String
createdAt:    Date (default: now)
```

**Challenge**
```
shareCode:       String (unique, 6-char alphanumeric)
hostSession:     String (sessionToken of host)
difficulty:      Enum ["easy", "medium", "hard"]
targets:         [{ h: Number, s: Number, l: Number }] (length 5)
playerScores:    [{
                   sessionToken: String,
                   displayName: String,
                   roundScores: [Number],
                   totalScore: Number,
                   finishedAt: Date
                 }]
createdAt:       Date (default: now)
```

**GlobalSession**
```
date:         String ("YYYY-MM-DD")
difficulty:   Enum ["easy", "medium", "hard"]
targets:      [{ h: Number, s: Number, l: Number }] (length 5)
playerScores: [ same sub-doc as Challenge ]
createdAt:    Date (default: now)
```

Compound unique index on `(date, difficulty)`.

## Edge Cases & Resilience

| Scenario | Expected Behavior |
|---|---|
| Invalid share code | `GET /challenges/:code` returns 404. Client shows inline error. |
| Network failure on guess | Client shows retry banner. Guess held in memory. |
| Page refresh mid-game | Progress lost. Acceptable — casual game. |
| Host refresh before challenge save | 5 colors backed up in localStorage. Retry button on home screen. |
| Global day boundary | Score attributed to date the player *started* the game. |
| Duplicate share code | Server regenerates on collision (unlikely with 6-char). |
| MongoDB connection failure | Server returns 503. Client shows "Service unavailable" message. |

## Testing

- **Backend:** Vitest + Supertest for API route testing.
- **Frontend:** React Testing Library for component interaction tests.
- **CIEDE2000:** Test with known HSL pairs and expected delta values.
- Run with: `cd server && npm test` or `cd client && npm test`.

## UI / UX Conventions

- Minimal, dark atmospheric aesthetic.
- Background shifts based on difficulty: black (Easy) → subtle red (Medium) → dark red (Hard).
- GSAP for all transitions (page loads, color fade-outs, score animations, difficulty background shift).
- Howler.js for sounds: button clicks, round start, timer tick, fade-out, score reveal (pitch varies), leaderboard.
- No time limit on the recreation phase.
- HSL sliders are vertical, styled as thin tracks with a circular thumb.
- All buttons have hover/click GSAP micro-animations (scale bounce, opacity).

## Checklist for New Features

1. Does the feature fit the game's minimal vibe? Don't add fluff.
2. Does it affect scoring fairness? If yes, keep it server-side.
3. Does it need a session token? If yes, pass it in the request body.
4. Does it affect the leaderboard? If yes, test tiebreakers.
5. Is there a loading/error/empty state for every new API call?
