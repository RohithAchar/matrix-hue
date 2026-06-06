/*
 * Timer.jsx — Circular countdown timer
 *
 * Renders an SVG circle that shrinks over the memorization duration
 *
 * TODO:
 * - Props: { duration: number (seconds), onComplete: () => void }
 * - SVG circle with stroke-dashoffset animated via GSAP
 * - Display remaining seconds as text in the center
 * - Call onComplete when timer hits 0
 * - Sound: playTick in last 3 seconds
 * - Clean up GSAP animation on unmount
 */

export default function Timer({ duration, onComplete }) {
  return (
    <div className="timer">
      <span>{duration}s</span>
    </div>
  );
}
