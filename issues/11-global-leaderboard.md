# Issue 11 — Global Leaderboard

**Type:** AFK
**Blocked by:** Issue 10 (Global Mode: Setup & Play)
**User stories covered:** 23

---

## What to Build

A daily global leaderboard for each difficulty. Shows the top 100 players sorted by total score. The current player's entry is highlighted and always visible, even if they rank outside the top 100.

### API Layer

**`GET /api/global/leaderboard?difficulty=easy&sessionToken=a1b2c3d4`**

- **Query params:** `difficulty` (required), `sessionToken` (optional — for highlighting the current player)
- **Response:**
```json
{
  "date": "2026-06-06",
  "difficulty": "easy",
  "entries": [
    {
      "rank": 1,
      "displayName": "Neo",
      "roundScores": [9.5, 8.7, 9.2, 8.9, 9.8],
      "totalScore": 46.1,
      "finishedAt": "2026-06-06T08:15:00Z"
    },
    {
      "rank": 2,
      "displayName": "Trinity",
      "roundScores": [8.0, 9.1, 8.5, 9.0, 8.5],
      "totalScore": 43.1,
      "finishedAt": "2026-06-06T09:30:00Z"
    }
    // ... up to rank 100, sorted by totalScore descending
  ],
  "currentPlayerEntry": {
    "rank": 142,
    "displayName": "Morpheus",
    "roundScores": [5.5, 6.2, 4.8, 7.0, 6.5],
    "totalScore": 30.0,
    "finishedAt": "2026-06-06T14:00:00Z"
  }
}
```

- **Logic:**
  1. Determine today's date in UTC.
  2. Find the `GlobalSession` for today + difficulty.
  3. If no session exists (no one has played today in this difficulty), return `{ date, difficulty, entries: [], currentPlayerEntry: null }`.
  4. Sort `playerScores` by `totalScore` descending. Ties broken by earlier `finishedAt`.
  5. Return top 100 as `entries`.
  6. If `sessionToken` is provided, find that player's entry. If it's outside the top 100, include it as `currentPlayerEntry` with its actual rank.

### Client Layer — Leaderboard Page

Reuse the `Leaderboard.jsx` component (from Issue 9) but parameterized:

**Route:** `/leaderboard/global/:difficulty/:date`

**Visual differences from Friends leaderboard:**
- Title: "Today's Global Leaderboard — Easy" (or Medium/Hard)
- Shows the date.
- Top 100 entries listed.
- If the current player is outside top 100, a separator section shows "Your Rank" with their entry highlighted.
- Column: Rank | Player | R1 | R2 | R3 | R4 | R5 | Total | Finished
- Same GSAP stagger animation as Friends leaderboard.

**States:**
- **Loading:** Skeleton rows.
- **Empty:** "No one has played today yet. Be the first!" with a "Play Global" button.
- **Error:** "Could not load leaderboard." with retry button.
- **Loaded:** Table with entries.

### Auto-Navigation

After finishing 5 rounds in Global mode, auto-navigate to:
```
/leaderboard/global/:difficulty/:date
```

### Example: Player Outside Top 100

```
Rank | Player     | Total
─────┼────────────┼───────
 1   | Neo        | 46.1
 2   | Trinity    | 43.1
 ... | ...        | ...
 100 | AgentSmith | 35.2
─────┼────────────┼───────
 142 | Morpheus   | 30.0   ← highlighted row
```

### Example: No Games Played Yet

```
GET /api/global/leaderboard?difficulty=hard

→ 200
{
  "date": "2026-06-06",
  "difficulty": "hard",
  "entries": [],
  "currentPlayerEntry": null
}

→ Client shows: "No one has played Hard mode today. Be the first!"
    with a "Play Hard Global" button.
```

---

## Acceptance Criteria

- [ ] `GET /api/global/leaderboard` returns top 100 sorted by totalScore descending.
- [ ] Tiebreaker: same totalScore → earlier `finishedAt` wins.
- [ ] Current player's entry is highlighted in the results.
- [ ] If current player is outside top 100, `currentPlayerEntry` is included separately with their actual rank.
- [ ] If no GlobalSession exists for today+difficulty, returns empty entries with no error.
- [ ] Leaderboard page renders with correct columns, stagger animation, loading/empty/error states.
- [ ] Auto-navigates to leaderboard after completing 5 Global rounds.
- [ ] Test: leaderboard returns correct ordering for 5+ players with mixed scores.
- [ ] Test: requesting with a sessionToken returns `currentPlayerEntry` even if outside top 100.

---

## Blocked by

Issue 10 — Global Mode: Setup & Play (need a GlobalSession with player scores to populate the leaderboard).
