/*
 * App.jsx — Root component
 *
 * TODO:
 * - Wrap everything in GameProvider (from context/GameContext)
 * - Wrap everything in SessionProvider (from hooks/useSession)
 * - Wrap everything in GameErrorBoundary
 * - Set up React Router routes:
 *   /                          → Home.jsx
 *   /play/single               → Game.jsx (mode: single)
 *   /play/friends              → Game.jsx (mode: friends, host)
 *   /play/friends/:shareCode   → Game.jsx (mode: friends, guest)
 *   /play/global               → Game.jsx (mode: global)
 *   /leaderboard/friends/:code → Leaderboard.jsx (type: friends)
 *   /leaderboard/global/:diff  → Leaderboard.jsx (type: global)
 */

import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<h1>MatrixHue</h1>} />
      </Routes>
    </div>
  );
}
