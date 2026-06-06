/*
 * Leaderboard.jsx — Leaderboard display
 *
 * Used for both Friends leaderboard (/leaderboard/friends/:code)
 * and Global leaderboard (/leaderboard/global/:difficulty/:date)
 *
 * TODO:
 * - Read type (friends/global) from route params
 * - For friends: GET /api/challenges/:code/leaderboard
 * - For global: GET /api/global/leaderboard?difficulty=...&sessionToken=...
 * - Display table: Rank | Player | R1-R5 scores | Total | Finished At
 * - Top 3 get trophy icons (🥇🥈🥉)
 * - Current player's row highlighted
 * - For global: if current player outside top 100, show separator
 * - GSAP stagger animation on row entrance
 * - States: loading (skeleton), empty, error, loaded
 * - Share code copy button for friends leaderboard
 * - Sound: playLeaderboard on mount
 */

export default function Leaderboard() {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
    </div>
  );
}
