/*
 * ScoreReveal.jsx — Post-guess reveal screen
 *
 * Shows target vs guessed swatch side-by-side, score out of 10,
 * and delta value
 *
 * TODO:
 * - Props: { target: {h,s,l}, guess: {h,s,l}, score: number, delta: number, onNext: () => void }
 * - Two ColorSwatch components side-by-side (target left, guess right)
 * - Score displayed large with GSAP count-up animation (0 → score)
 * - Small text: "Delta: 2.3"
 * - "Next Round" button (or "See Results" on round 5)
 * - Sound: playScore(score) on mount
 */

export default function ScoreReveal({ target, guess, score, delta, onNext }) {
  return (
    <div className="score-reveal">
      <h2>Score: {score}/10</h2>
      <button onClick={onNext}>Next Round</button>
    </div>
  );
}
