# Issue 7 — Play with Friends: Host

**Type:** AFK
**Blocked by:** Issues 2 (Session Identity), 5 (Single Player Game Flow)
**User stories covered:** 7, 26

---

## What to Build

The host creates a challenge by playing 5 rounds client-side. After finishing, the 5 target colors (and the host's scores) are saved to the server. A 6-character share code is returned and shown to the host with a copy button.

### Database Layer — Challenge Model

Create `server/src/models/Challenge.js`:

```js
shareCode:       String (unique, indexed, 6 chars alphanumeric)
hostSession:     String (sessionToken of host)
difficulty:      Enum ["easy", "medium", "hard"]
targets:         [{ h: Number, s: Number, l: Number }] (length 5)
playerScores:    [{
                   sessionToken: String,
                   displayName: String,
                   roundScores: [Number],   // length 5
                   totalScore: Number,
                   finishedAt: Date
                 }]
createdAt:       Date (default: Date.now)
```

### API Layer

**`POST /api/challenges`** — Save a new challenge.

- **Request body:** `{ sessionToken: string, difficulty: string, targets: [{h,s,l}], hostScore: { roundScores: [number], totalScore: number, displayName: string } }`
- **Response:** `{ shareCode: string }`
- **Logic:**
  1. Verify `sessionToken` exists in the `players` collection (return 401 if not).
  2. Generate a 6-character share code (alphanumeric, uppercase). If by some collision the code already exists, regenerate (max 3 attempts).
  3. Save the challenge with the host as the first entry in `playerScores`.
  4. Return the share code.

**Share code generation:**
```js
function generateShareCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/1/0 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```
Example codes: `"A3X9K2"`, `"M7P4QR"`, `"B2X8V5"`

### Client Layer — Host Flow

After the host completes 5 rounds in Single Player style (same game loop from Issue 5), instead of just showing the score:

1. Show the final score summary.
2. Show a "Save Challenge" button (or auto-save on round 5 completion).
3. On save:
   - Show a loading state ("Saving your challenge...").
   - Call `POST /api/challenges`.
   - On success: show the share code prominently (large text) with a "Copy Code" button.
4. On failure (network error):
   - Show a "Retry" button.
   - The 5 target colors are stored in localStorage under key `pendingChallengeTargets` so the host can retry later.
   - If the host returns to the home page and has `pendingChallengeTargets`, show a banner: "You have an unsaved challenge — complete it?"

### Challenge Screen

After successful save, the host sees:

```
┌─────────────────────────────────┐
│                                 │
│   Challenge Created!            │
│                                 │
│   Share this code:              │
│   ┌─────────────────────────┐   │
│   │     A3X9K2    [Copy]    │   │
│   └─────────────────────────┘   │
│                                 │
│   Your score: 43/50             │
│                                 │
│   [Back to Home]                │
│                                 │
└─────────────────────────────────┘
```

"Copy" uses `navigator.clipboard.writeText()` with a brief "Copied!" confirmation.

### Edge Cases

- **Duplicate share code collision:** Server regenerates (unlikely with 6-char from 32-char alphabet = ~1B combinations).
- **Host refreshes before saving:** `pendingChallengeTargets` in localStorage contains `{ difficulty, targets, roundScores, totalScore, displayName }`. Home page detects this and offers to retry.
- **Host plays again:** New challenge, new code. Host's previous challenge is still valid for friends who already have the code.

---

## Acceptance Criteria

- [ ] `POST /api/challenges` creates a new Challenge document and returns a 6-char share code.
- [ ] Share code uses unambiguous characters (no I/O/1/0).
- [ ] Host's round scores are saved as the first `playerScores` entry.
- [ ] Host sees the share code prominently after saving with a working copy button.
- [ ] If server save fails, targets are saved to localStorage and a retry banner appears on home.
- [ ] Test: `POST /api/challenges` with valid data returns 200 + shareCode.
- [ ] Test: `POST /api/challenges` with invalid sessionToken returns 401.
- [ ] Test: duplicate share code collision is handled (server retries).

---

## Blocked by

Issue 2 — Session Identity (for `sessionToken` validation against `players` collection).
Issue 5 — Single Player Game Flow (for the 5-round game loop the host plays).
