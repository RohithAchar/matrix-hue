# Issue 2 — Session Identity

**Type:** AFK
**Blocked by:** Issue 1 (Project Scaffold)
**User stories covered:** 4, 5

---

## What to Build

Players can enter a display name and receive a session token. On return visits, they are recognized and skip the name prompt.

This is the full identity layer — no passwords, no auth. Just a name + UUID per browser.

### Database Layer

Create a Mongoose model `Player` in `server/src/models/Player.js`:

```
sessionToken: String (unique, indexed)
displayName:  String
createdAt:    Date (default: Date.now)
```

### API Layer

Create `POST /api/session` in `server/src/routes/session.js`:

- **Request body:** `{ displayName: string }`
- **Response:** `{ sessionToken: string, displayName: string }`
- **Logic:** Generate a UUID v4 for the session token. Save the player to MongoDB. Return the token and name.
- **Validation:** `displayName` must be 1–30 characters, trimmed, no empty strings. Return `400` with `{ error: "Display name is required (1-30 characters)" }` if invalid.

### Client Layer — Hook

Create `client/src/hooks/useSession.js`:

- Reads `sessionToken` and `displayName` from `localStorage` on mount.
- Provides `createSession(displayName)` that calls `POST /api/session` and stores the result.
- Provides `clearSession()` to wipe localStorage (for testing / name changes).
- Exports a React context + provider so any component can access session state.

### Client Layer — Component

Create `client/src/components/NameModal.jsx`:

- A centered overlay modal with a subtle dark backdrop.
- Input field for the display name (placeholder: "Enter your name").
- "Start" button that calls `createSession`.
- GSAP entrance animation: modal fades in and scales up slightly over 0.3s.
- If the input is empty, the button is disabled.
- On submit, show a brief loading state on the button.
- On error (network failure), show "Something went wrong — try again" inline.

### Client Layer — Integration

In `App.jsx`:

- On app mount, check if a session exists in localStorage.
- If no session, wrap the `NameModal` around mode+difficulty selection (the modal only fires when a player clicks a mode and no session exists — more on this in Issue 3).

### Example: First Visit API Call

```
POST /api/session
Content-Type: application/json

{ "displayName": "Neo" }

→ 200
{ "sessionToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "displayName": "Neo" }
```

### Example: localStorage Format

```js
localStorage.getItem("sessionToken") // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
localStorage.getItem("displayName")   // "Neo"
```

---

## Acceptance Criteria

- [x] `POST /api/session` creates a new `Player` document and returns `{ sessionToken, displayName }`.
- [x] `POST /api/session` returns `400` for invalid/missing display names.
- [x] `NameModal` renders with GSAP entrance animation.
- [x] On submit, `useSession` calls the API and stores token + name in localStorage.
- [x] On return visit, localStorage values are read and session is restored without showing the modal.
- [x] Test: `POST /api/session` returns correct session token format (UUID).

---

## Blocked by

Issue 1 — Project Scaffold (need Express server + MongoDB connection).
