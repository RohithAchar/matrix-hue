export default function DifficultySelector({ selected, onSelect }) {
  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div className="difficulty-selector">
      {difficulties.map((d) => (
        <button
          key={d}
          className={selected === d ? 'pill active' : 'pill'}
          onClick={() => onSelect(d)}
        >
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}
