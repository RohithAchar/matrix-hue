/*
 * DifficultySelector.jsx — Easy / Medium / Hard pill buttons
 *
 * TODO:
 * - Three pill-shaped buttons: Easy, Medium, Hard
 * - One selected at a time. Click selects, deselects others.
 * - Selected pill has subtle glow/active state
 * - Calls onSelect(difficulty) from GameContext
 * - GSAP background color shift on difficulty change:
 *   Easy → #000, Medium → #1a0a0a, Hard → #2a0505
 * - Sound: playClick on selection
 */

export default function DifficultySelector({ selected, onSelect }) {
  const difficulties = ["easy", "medium", "hard"];

  return (
    <div className="difficulty-selector">
      {difficulties.map((d) => (
        <button key={d} className={selected === d ? "active" : ""}>
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}
