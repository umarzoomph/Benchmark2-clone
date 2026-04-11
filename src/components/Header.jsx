import { DATA_SOURCES } from '../config';

export default function Header({ sourceIdx, setSourceIdx }) {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-mark">Z</div>
        <span className="header-logo-text">zoomph</span>
      </div>

      <span className="header-product-label">Benchmark 2.0</span>

      <div className="header-right">
        {DATA_SOURCES.length > 1 && (
          <select
            className="source-select"
            value={sourceIdx}
            onChange={e => setSourceIdx(Number(e.target.value))}
          >
            {DATA_SOURCES.map((s, i) => (
              <option key={s.id} value={i}>{s.label}</option>
            ))}
          </select>
        )}
        <div className="user-pill">
          <div className="user-avatar">AM</div>
          <span className="user-name">Austin FC Manager</span>
          <span className="user-caret">▾</span>
        </div>
      </div>
    </header>
  );
}
