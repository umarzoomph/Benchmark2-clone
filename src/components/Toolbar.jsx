import { downloadCSV } from '../utils/exporter';

export default function Toolbar({ view, setView, scoutOpen, setScoutOpen, derivedRows, totalCount }) {
  return (
    <div className="toolbar">
      <button
        className={`toolbar-btn scout-btn${scoutOpen ? ' active' : ''}`}
        onClick={() => setScoutOpen(o => !o)}
      >
        ⊙ Scout
      </button>

      <div className="toolbar-divider" />

      <button
        className={`toolbar-btn${view === 'table' ? ' active' : ''}`}
        onClick={() => setView('table')}
      >
        ▦ View as Table
      </button>
      <button
        className={`toolbar-btn${view === 'posts' ? ' active' : ''}`}
        onClick={() => setView('posts')}
      >
        ⊞ View as Posts
      </button>

      <div className="toolbar-right">
        <span className="toolbar-count">
          Showing {totalCount?.toLocaleString() ?? 0} Results
        </span>
        <button
          className="toolbar-btn"
          onClick={() => downloadCSV(derivedRows, 'benchmark-export.csv')}
        >
          ↑ Export
        </button>
        <button className="toolbar-icon-btn" title="Settings">⚙</button>
        <button className="toolbar-icon-btn" title="Next">›</button>
      </div>
    </div>
  );
}
