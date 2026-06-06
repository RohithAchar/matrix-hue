/*
 * Game.jsx — Main game page
 *
 * Handles all three modes: single, friends (host & guest), global
 *
 * TODO:
 * - Read mode + difficulty from GameContext (or URL params)
 * - For single player: use colorGen.js client-side, score client-side
 * - For friends host: play client-side, save challenge after round 5
 * - For friends guest: fetch targets from GET /api/challenges/:code
 *   Submit via POST /api/challenges/:code/round (server-verified)
 * - For global: fetch targets from GET /api/global/init
 *   Submit via POST /api/global/round (server-verified, best score)
 *
 * Round phases:
 *   memorize → fade → recreate → reveal → (loop 5x) → finished
 *
 * Components needed:
 *   ColorSwatch (target), Timer (countdown), DistractionOverlay,
 *   HSLSliderGroup, ColorPreviewSwatch (user guess),
 *   ScoreReveal, RetryBanner
 *
 * GSAP animations: swatch entrance, fade-out, slider entrance,
 * score count-up, next round transition
 */

export default function Game() {
  return (
    <div className="game">
      <h2>Game Page</h2>
    </div>
  );
}
