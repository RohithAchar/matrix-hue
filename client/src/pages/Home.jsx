/*
 * Home.jsx — Landing page
 *
 * TODO:
 * - Import DifficultySelector from components/DifficultySelector
 * - Import three mode cards (Single, Friends, Global)
 * - Use GameContext for difficulty/mode selection
 * - GSAP transition on background color based on selected difficulty
 * - Auto-select Easy if no difficulty chosen when mode is clicked
 * - On mode+difficulty select:
 *   - No session → show NameModal → then navigate to game
 *   - Has session → navigate directly to game
 * - If pendingChallengeTargets in localStorage, show retry banner
 * - Sound: playClick on pill/card clicks
 */

export default function Home() {
  return (
    <div className="home">
      <h1>MatrixHue</h1>
    </div>
  );
}
