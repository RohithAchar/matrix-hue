# MatrixHue 🎨

A color memory game. Memorize a target color, then recreate it using HSL sliders. Three modes, three difficulties, global competition — no signup required.

## Modes

| Mode | How it works |
|------|-------------|
| **Single Player** | Practice alone. Random colors each round, client-side scoring. Unlimited plays. |
| **Play with Friends** | One host plays 5 rounds, then shares a 6-character code. Friends enter the code and play the same 5 colors asynchronously. Leaderboard updates as each player finishes. |
| **Global** | A fresh set of 5 colors is generated daily per difficulty when the first player plays. Everyone competes on the same colors. Unlimited attempts — your best score counts. |

## Difficulties

| Level | Memorization | Distractions |
|-------|-------------|--------------|
| Easy | 6 seconds | None — clean focus |
| Medium | 4 seconds | Color-name text popups (Stroop effect) |
| Hard | 2 seconds | Faster popups + background color shifts |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React (JavaScript), React Router v6 |
| Animations | GSAP |
| Sound | Howler.js |
| Backend | Express.js |
| Database | MongoDB via Mongoose |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd matrix-hue

# Install all dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Configuration

Copy the server's environment file and update if needed:

```bash
cd server
# Edit .env to set your MONGO_URI and PORT
```

Default `.env`:
```
MONGO_URI=mongodb://localhost:27017/matrixhue
PORT=3001
```

### Run in development

```bash
# From root — starts both client (port 5173) and server (port 3001)
npm run dev
```

Or run individually:
```bash
cd server && npm run dev   # Express on :3001
cd client && npm run dev   # Vite on :5173, proxies /api to server
```

## Project Structure

```
matrix-hue/
├── client/                 # Vite + React app
│   ├── src/
│   │   ├── pages/          # Route-level components
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Game state (React Context)
│   │   ├── hooks/          # useSession, useTimer, useSound
│   │   ├── utils/          # Color generation, CIEDE2000, scoring
│   │   └── assets/         # SFX files, fonts
│   ├── index.html
│   └── vite.config.js
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # Express routers
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Route handlers
│   │   └── utils/          # Server-side CIEDE2000, scoring, color gen
│   ├── .env
│   └── tests/
├── issues/                 # Implementation issues (vertical slices)
├── AGENT.md                # Agent guide with detailed architecture docs
├── prd.md                  # Product requirements document
└── package.json            # Root dev script (concurrently)
```

## How to Build

The project is broken into 13 independent vertical slices in `issues/`. Each slice cuts through all layers (database → API → UI → tests). Build order:

```
 1  Project Scaffold       → Monorepo, config, health check
 2  Session Identity       → Player model, /api/session, NameModal
 3  Home Page UI           → Difficulty pills, mode cards, background shift
 4  HSL Slider Component   → Draggable sliders, live preview swatch
 5  Single Player Game     → Full 5-round loop, CIEDE2000, scoring
 6  Distractions           → Stroop popups, background flashes
 7  Friends — Host         → Host plays 5 rounds, saves challenge
 8  Friends — Guest        → Enter code, server-verified rounds
 9  Friends Leaderboard    → Rankings, tiebreakers, trophy icons
10  Global — Setup & Play  → Daily targets, best score tracking
11  Global Leaderboard     → Top 100, current player highlight
12  Sound System           → Howler.js, 6 SFX, mute toggle
13  Polish & Edge Cases    → Retry banner, 503, error boundary, GSAP pass
```

See `issues/README.md` for a full explanation of the issue format and jargon.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Create player session |
| POST | `/api/challenges` | Save host's challenge |
| GET | `/api/challenges/:code` | Fetch challenge targets |
| POST | `/api/challenges/:code/round` | Submit guess (friends) |
| GET | `/api/challenges/:code/leaderboard` | Friends leaderboard |
| GET | `/api/global/init` | Get/create daily global targets |
| POST | `/api/global/round` | Submit guess (global) |
| GET | `/api/global/leaderboard` | Global leaderboard |

## Scoring

The CIEDE2000 color difference formula measures perceptual distance between two colors. Delta is mapped to a score out of 10 using a logarithmic curve:

```
score = max(0, 10 * (1 - log(1 + delta) / log(1 + 100)))
```

- Perfect match → **10/10**
- Close match → **~8/10**
- Moderate miss → **~5/10**
- Total miss → **0/10**

Per-round score out of 10, total out of 50.

## Testing

```bash
cd server && npm test    # Backend: Vitest + Supertest
cd client && npm test    # Frontend: Vitest + React Testing Library
```

## License

MIT
