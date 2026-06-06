# Issue 9 — Friends Leaderboard

**Type:** AFK
**Blocked by:** Issues 7 (Host), 8 (Guest)
**User stories covered:** 9, 21, 22

---

## What to Build

After a player (host or guest) completes all 5 rounds in a Play with Friends challenge, they see the challenge leaderboard. The leaderboard shows all players who have finished, ranked by total score. It updates as new players finish (re-fetch on mount).

### API Layer

**`GET /api/challenges/:code/leaderboard`** — Get the leaderboard for a challenge.

- **Response:**
```json
{
  "shareCode": "A3X9K2",
  "difficulty": "medium",
  "entries": [
    {
      "rank": 1,
      "displayName": "Neo",
      "roundScores": [7.5, 9.2, 6.8, 8.1, 9.5],
      "totalScore": 41.1,
      "finishedAt": "2026-06-06T12:30:00Z"
    },
    {
      "rank": 2,
      "displayName": "Trinity",
      "roundScores": [8.0, 7.1, 7.5, 6.9, 8.2],
      "totalScore": 37.7,
      "finishedAt": "2026-06-06T14:15:00Z"
    }
  ]
}
```

- **Logic:**
  1. Find challenge by share code. If not found, return 404.
  2. Sort `playerScores` by `totalScore` descending.
  3. Assign ranks (1-indexed). Handle ties: if two players have the same totalScore, the one with the earlier `finishedAt` gets the higher rank.
  4. Return only players who have `finishedAt` set (completed all 5 rounds).

### Client Layer — Leaderboard Page

Create `client/src/pages/Leaderboard.jsx`.

**Route:** `/leaderboard/friends/:shareCode`

**Visual design:**
- Clean table layout with minimal styling.
- Columns: Rank | Player | Round scores (5 small cells) | Total | Finished at
- Row colors: alternating subtle transparent rows.
- Current player's row highlighted (slightly brighter background).
- Top 3 ranks get small trophies/icons (🥇🥈🥉).
- Share code displayed at the top with a copy button.

**States:**
- **Loading:** Skeleton rows with pulse animation.
- **Empty:** "No players have finished yet. Share the code and wait for friends!"
- **Error:** "Could not load leaderboard. Try again." with retry button.
- **Loaded:** Full leaderboard with rankings.

**GSAP animations:**
- Rows animate in from top to bottom with a stagger.
- Each row fades in and slides slightly to the right.

### Auto-Navigation After Game

After the 5th round reveal in the guest game (Issue 8), automatically navigate to:

```
/leaderboard/friends/:shareCode
```

The challenge's share code is available from the game context (passed when the game started).

### Example: Leaderboard with Tiebreaker

```
Challenge: A3X9K2

Rank | Player    | R1   | R2   | R3   | R4   | R5   | Total | Finished
─────┼───────────┼──────┼──────┼──────┼──────┼──────┼───────┼─────────────────
🥇   | Neo       | 7.5  | 9.2  | 6.8  | 8.1  | 9.5  | 41.1  | 12:30 PM
🥈   | Trinity   | 8.0  | 7.1  | 7.5  | 6.9  | 8.2  | 37.7  | 2:15 PM
🥉   | Morpheus  | 6.5  | 7.8  | 6.0  | 8.5  | 7.0  | 35.8  | 1:45 PM
```

Note: Trinity finished later but has a higher totalScore than Morpheus → Trinity is rank 2.

### Example: Stale/Empty Leaderboard

```
GET /api/challenges/ZZZZZZ/leaderboard

→ 404
{ "error": "Challenge not found" }

→ Client shows: "Could not load leaderboard. The code may be wrong."
```

---

## Acceptance Criteria

- [ ] `GET /api/challenges/:code/leaderboard` returns sorted entries with ranks.
- [ ] Tiebreaker: same totalScore → earlier `finishedAt` wins.
- [ ] Incomplete players (no `finishedAt`) are excluded from results.
- [ ] Leaderboard page renders with correct columns and alternating row styling.
- [ ] Current player's row is highlighted.
- [ ] Top 3 have trophy icons.
- [ ] GSAP stagger animation on row entrance.
- [ ] Loading, empty, and error states handled.
- [ ] After 5th round in guest game, auto-navigates to leaderboard.
- [ ] Share code copy button works on leaderboard page.
- [ ] Test: leaderboard returns correct ordering for 3+ players with and without ties.

---

## Blocked by

Issue 7 — Play with Friends: Host (for the Challenge model and `playerScores` data).
Issue 8 — Play with Friends: Guest (for players actually submitting scores to populate the leaderboard).
