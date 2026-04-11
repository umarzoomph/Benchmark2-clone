import { useMemo } from 'react';
import { generateInsights } from '../utils/insights';

export default function ScoutInsights({ derivedRows, groupBy, open, onToggle }) {
  const insights = useMemo(
    () => generateInsights(derivedRows.slice(0, 5000), groupBy),
    [derivedRows, groupBy]
  );

  return (
    <div className="scout-section">
      <div className="scout-header" onClick={onToggle}>
        <span className="scout-header-icon">⊙</span>
        <span className="scout-header-label">Scout Top-Level Insights</span>
        <span className="scout-toggle">{open ? '∧' : '∨'}</span>
      </div>

      {open && insights.length > 0 && (
        <div className="scout-cards">
          {insights.map((text, i) => (
            <div key={i} className="scout-card" dangerouslySetInnerHTML={{ __html: text }} />
          ))}
        </div>
      )}
    </div>
  );
}
