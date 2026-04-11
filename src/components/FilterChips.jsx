export default function FilterChips({ chips, onRemove }) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="filter-chips-row">
      {chips.map(chip => (
        <div key={chip.key} className="filter-chip">
          {chip.label}
          {chip.removable !== false && (
            <span className="filter-chip-x" onClick={() => onRemove(chip)}>✕</span>
          )}
        </div>
      ))}
    </div>
  );
}
