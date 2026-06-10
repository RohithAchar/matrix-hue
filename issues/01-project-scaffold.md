# Issue 1 — Project Scaffold

**Type:** AFK
**Blocked by:** None — can start immediately.
**User stories covered:** None (infrastructure)

---

## What to Build

Set up the monorepo skeleton so that the client and server can be developed and run together. At the end of this slice, you should be able to run `npm run dev` from the project root and see both a Vite dev server and an Express API server start up.

This slice includes no game logic — just tooling, configuration, and a health check.

### Client (`client/`)

- Initialize a Vite + React project (JavaScript, not TypeScript).
- Install React Router v6.
- Create a minimal `App.jsx` with a single route (`/`) that renders "Hello MatrixHue".
- Configure Vite to proxy `/api` requests to the Express server in development (port 3001).
- Verify the client runs on `http://localhost:5173`.

### Server (`server/`)

- Initialize an Express project with a `src/app.js` entry point.
- Set up the following middleware:
  - `cors()` — allow cross-origin requests from the Vite dev server.
  - `express.json()` — parse JSON request bodies.
- Create a `GET /api/health` endpoint that returns `{ status: "ok", timestamp: <ISO string> }`.
- Configure the server to listen on `process.env.PORT` or `3001` by default.
- Set up MongoDB connection using Mongoose. In `src/app.js`, connect to `process.env.MONGO_URI || "mongodb://localhost:27017/matrixhue"`.
- Graceful error handling: if MongoDB connection fails, log the error but keep the server running (return 503 from a middleware on all `/api/*` routes).

### Root (`package.json`)

- Root `package.json` with a `dev` script that uses `concurrently` to run both `client` and `server` dev scripts.

### Example: Health Check Flow

```
Terminal 1:
  $ npm run dev
  [server] Server running on http://localhost:3001
  [server] MongoDB connected
  [client] Vite dev server running on http://localhost:5173

Terminal 2:
  $ curl http://localhost:3001/api/health
  {"status":"ok","timestamp":"2026-06-06T12:00:00.000Z"}
```

---

## Acceptance Criteria

- [x] `npm run dev` from root starts both client and server via `concurrently`.
- [x] Client renders "Hello MatrixHue" at `http://localhost:5173`.
- [x] Server responds `200 OK` with JSON at `GET /api/health`.
- [x] Vite proxies `/api/*` requests to the Express server.
- [x] MongoDB connection is established on server start (no crash if DB is unavailable — returns 503).
- [x] Server logs "MongoDB connected" on successful connection.

---

## Blocked by

None — can start immediately.
