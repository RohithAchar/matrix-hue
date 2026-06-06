# Contributing to MatrixHue

Thanks for jumping in! MatrixHue is broken into small, independent vertical slices so you can pick up work without needing to understand the entire codebase at once.

## Getting Started

### 1. Set up the project

```bash
# Clone with SSH
git clone git@github.com:YOUR_USERNAME/matrix-hue.git
cd matrix-hue

# Install all dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

See the [README](./README.md) for configuration and running instructions.

### 2. Read the docs

| File | What it's for |
|------|---------------|
| [issues/README.md](./issues/README.md) | Explains the vertical slice format and jargon |
| [AGENT.md](./AGENT.md) | Full architecture docs, API contracts, schemas |
| [prd.md](./prd.md) | Product requirements — the "why" behind decisions |

### 3. Pick an issue

Issues are in `issues/` (and mirrored on GitHub Issues). Start with one that has **no blockers** (see the "Blocked by" section in each issue).

Recommended order for new contributors:
- **Beginner-friendly:** Issue 1 (Scaffold), Issue 4 (HSL Slider), Issue 6 (Distractions), Issue 12 (Sound)
- **Intermediate:** Issue 2 (Session), Issue 3 (Home Page), Issue 5 (Single Player), Issue 7 (Host)
- **Advanced:** Issue 8 (Guest), Issue 9 (Friends Leaderboard), Issue 10 (Global), Issue 11 (Global Leaderboard)

## Workflow

### Branch naming

```
<type>/<issue-number>-<short-description>
```

Examples:
- `feat/01-project-scaffold`
- `feat/05-single-player-game`
- `fix/13-retry-banner-crash`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`

### Making changes

1. **Read the issue file** thoroughly — it contains all acceptance criteria and what to build.
2. **Read the TODO comments** in the relevant files. Every file in `client/` and `server/` has comments explaining what needs to be implemented.
3. **Build vertically through all layers.** Even if the issue feels small, make sure it touches the database (if needed), API (if needed), UI, and tests.
4. **Keep files focused.** Each file has a single responsibility. Add new components/hooks/utils when a new concern emerges rather than bloating existing files.

### Commit messages

```
<type>: <short description>

<optional longer description>
```

Examples:
```
feat: add session creation endpoint and NameModal
fix: correct tiebreaker ordering in friends leaderboard
chore: add vitest config for server tests
```

### Before submitting

1. **Run the tests:**
   ```bash
   cd server && npm test
   cd client && npm test
   ```
2. **Manually verify** the acceptance criteria listed in the issue.
3. **Check for console errors** and network errors in the browser dev tools.
4. **Make sure sounds still work** (if you touched a component that has sound wiring).

## Code Conventions

### General

- **JavaScript** (not TypeScript) for both client and server.
- **ES modules** on the client (`import`/`export`), **CommonJS** on the server (`require`/`module.exports`).
- **2-space indentation.**
- **Semicolons** required.
- **Single quotes** for strings.

### React (Client)

- Use **functional components** with hooks — no class components.
- **One component per file**, named after the file.
- **Default exports** for page and component files.
- Props should be destructured in the function signature.
- Use `GameContext` and `SessionContext` for shared state — avoid prop drilling beyond 2 levels.

### Express (Server)

- Routes in `routes/` are thin — they parse the request and delegate to controllers.
- Controllers in `controllers/` contain the business logic.
- Models in `models/` define Mongoose schemas only.
- Utils in `utils/` are pure functions (CIEDE2000, scoring, color generation).

### CSS

- **No CSS-in-JS or Tailwind.** Use plain CSS files imported into components.
- Class names are lowercase with hyphens: `.difficulty-selector`, `.score-reveal`.
- Global styles live in `App.css`. Component-specific styles can be added there or in separate CSS files.

## Reviewing

When reviewing a PR:

1. Check that the **acceptance criteria** from the issue are all met.
2. Verify **edge cases** are handled (loading, empty, error states for every API call).
3. Check that **sounds** are wired if the feature has user interactions.
4. Look for **console logs** or commented-out code that should be removed.
5. Verify the **API contracts** match what's in `AGENT.md`.

## Need help?

- Read the issue file again — most questions are answered there.
- Check `AGENT.md` for architecture decisions and API contracts.
- Check the `issues/README.md` for jargon definitions.

If you're still stuck, open a discussion or ask in the team chat.
