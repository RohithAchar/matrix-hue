# Issue 3 — Home Page UI

**Type:** AFK
**Blocked by:** Issue 1 (Project Scaffold)
**User stories covered:** 1, 2, 3

---

## What to Build

The home screen is the landing page of the game. It presents the difficulty picker first (top row), then the mode cards below. The background color shifts based on the selected difficulty. All transitions use GSAP.

No game logic yet — just the UI and state for selecting a mode + difficulty.

### Layout (top to bottom)

**1. Difficulty Row**

- Three pill-shaped buttons arranged horizontally: **Easy**, **Medium**, **Hard**.
- One is selected at a time. Clicking a pill selects it and deselects the others.
- The selected pill has a subtle glow/active state. Unselected pills are dimmer.
- GSAP: when difficulty changes, the background color animates smoothly:

| Difficulty | Background color |
|---|---|
| Easy | `#000000` (black) |
| Medium | `#1a0a0a` (very subtle red tint) |
| Hard | `#2a0505` (dark red) |

- Transition duration: ~0.6s with an ease-in-out curve.

**2. Mode Cards**

- Three cards below the difficulty row, arranged horizontally: **Single Player**, **Play with Friends**, **Global**.
- Each card has an icon/emote + title + short description:

| Card | Icon | Description |
|---|---|---|
| Single Player | 🎯 | "Practice alone. No limits." |
| Play with Friends | 👥 | "Challenge friends with a code." |
| Global | 🌍 | "Compete worldwide, daily." |

- Cards have hover animation (GSAP scale to 1.05, slight lift).
- Clicking a card sets the selected mode.
- If no difficulty is selected when a mode is clicked, the first difficulty (Easy) is auto-selected.

**3. Action Trigger**

- When both a mode and difficulty are selected, dispatch an event or navigate (the actual navigation/game-start happens in later slices — for now, just console.log the selection).

### State Management

Create or extend `client/src/context/GameContext.jsx`:

```js
{
  difficulty: "easy" | "medium" | "hard" | null,
  mode: "single" | "friends" | "global" | null,
  selectDifficulty(d),
  selectMode(m),
  resetSelection()
}
```

### Visual Style

- Full viewport, centered layout.
- Dark background (shifts per difficulty).
- All text in a clean sans-serif font (system font stack).
- Minimal — no clutter, no headers, no footers.

### Example: User Interaction

```
1. User opens the app at /
2. Background is black (default / Easy)
3. User clicks "Medium" → background animates to #1a0a0a over 0.6s
4. User hovers over "Single Player" card → card scales up to 1.05
5. User clicks "Single Player" → { mode: "single", difficulty: "medium" }
6. (Navigation to game page will be wired in Issue 5)
```

---

## Acceptance Criteria

- [ ] Three difficulty pills render, clickable, with one selected at a time.
- [ ] Background color changes with GSAP animation when difficulty changes.
- [ ] Three mode cards render with hover GSAP animation (scale).
- [ ] Clicking a card dispatches mode + difficulty selection.
- [ ] If no difficulty selected when mode is clicked, Easy is auto-selected.
- [ ] `GameContext` holds the selected mode and difficulty.
- [ ] (Bonus) Test: clicking through different difficulties changes the background color value.

---

## Blocked by

Issue 1 — Project Scaffold (need the Vite + React app running).
