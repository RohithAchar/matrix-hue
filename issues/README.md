# How to Read & Tackle Issues

This project uses **vertical slices** (tracer bullets) to break the game into independently-buildable chunks. Each issue builds a working feature end-to-end through all layers of the stack.

## Understanding the Issue Format

Each issue has:

| Field | Meaning |
|---|---|
| **Title** | What this slice delivers |
| **What to build** | The end-to-end behavior, not layer-by-layer instructions |
| **Acceptance criteria** | Checklist to confirm the slice is done |
| **Blocked by** | Which issues must ship first (if any) |
| **User stories** | Links back to the PRD |

## Jargon Guide

| Term | Meaning |
|---|---|
| **Vertical slice / Tracer bullet** | A thin feature that cuts through every layer (database → API → UI → tests) in one go. Each slice is demoworthy on its own. |
| **AFK (Away From Keyboard)** | No human decision needed. An agent or developer can build and merge this without asking for approval. |
| **HITL (Human In The Loop)** | Requires a human to make a decision or review a design before merging. |
| **CIEDE2000** | A color difference formula from the International Commission on Illumination (CIE). It measures how perceptually different two colors are. Value of 0 = identical, higher = more different. |
| **Logarithmic scoring** | `score = max(0, 10 * (1 - log(1 + delta) / log(1 + maxDelta)))`. Maps CIEDE2000 delta to a 0–10 score. Small deltas still score well; large deltas fall off quickly. |
| **Stroop effect** | The delay in reaction time when the name of a color is printed in a different color (e.g., the word "Blue" written in red ink). We use this for Medium/Hard distractions. |
| **Session token** | A UUID issued by the server when a player first enters their display name. Stored in localStorage. No passwords or auth required. |
| **Share code** | A 6-character alphanumeric string that identifies a Play with Friends challenge. |
| **HSL** | Hue (0–360), Saturation (0–100%), Lightness (0–100%). The color model we use for all target generation and slider controls. |
| **GSAP** | GreenSock Animation Platform. Used for all transitions, fade-outs, score animations, background shifts. |

## How to Tackle an Issue

1. **Check the blocked-by chain.** Don't start an issue whose dependencies aren't shipped yet.
2. **Read the PRD** (`../prd.md`) for full context. Start with the user stories in the issue body, then read the relevant sections of the PRD.
3. **Read the AGENT.md** (`../AGENT.md`) for architectural decisions, schemas, API contracts, and code conventions.
4. **Build vertically.** Work across all layers for this one slice — don't leave a layer half-finished.
5. **Check the acceptance criteria** before marking done. Each must be verifiable.

## Dependency Order (build chain)

```
 1  Project Scaffold
 │
 ├── 2  Session Identity
 │
 ├── 3  Home Page UI
 │
 ├── 4  HSL Slider Component
 │
 ├── 5  Single Player Game Flow
 │   │
 │   ├── 6  Distractions
 │   │
 │   └── 7  Play with Friends — Host
 │           │
 │           └── 8  Play with Friends — Guest
 │                   │
 │                   └── 9  Friends Leaderboard
 │
 ├── 10  Global Mode — Setup & Play
 │       │
 │       └── 11  Global Leaderboard
 │
 ├── 12  Sound System
 │
 └── 13  Polish & Edge Cases
```

Build slices in this order. Slices without dependencies on each other can be built in parallel (e.g., slices 2, 3, and 4 can start as soon as slice 1 is done).
