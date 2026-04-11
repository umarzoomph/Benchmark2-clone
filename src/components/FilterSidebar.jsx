import { useState, useRef, useEffect } from 'react';
import { GROUP_BY_OPTIONS } from '../config';

function AndOrToggle({ value, onChange }) {
  return (
    <div className="and-or-toggle">
      <button
        className={`and-or-btn${value === 'AND' ? ' active' : ''}`}
        onClick={e => { e.stopPropagation(); onChange('AND'); }}
      >AND</button>
      <button
        className={`and-or-btn${value === 'OR' ? ' active' : ''}`}
        onClick={e => { e.stopPropagation(); onChange('OR'); }}
      >OR</button>
    </div>
  );
}

function TagInput({ selected, options, onAdd, onRemove, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = (options || []).filter(
    o => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="tag-input-wrap" ref={ref}>
      {selected.length > 0 && (
        <div className="tag-list">
          {selected.map(t => (
            <span key={t} className="tag-pill">
              {t}
              <button
                className="tag-pill-x"
                onClick={e => { e.stopPropagation(); onRemove(t); }}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <input
        className="tag-input"
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="tag-dropdown">
          {filtered.slice(0, 20).map(o => (
            <div
              key={o}
              className="tag-dropdown-item"
              onMouseDown={e => { e.preventDefault(); onAdd(o); setQuery(''); }}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, selected, options, logic, onLogic, onAdd, onRemove, placeholder }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header" onClick={() => setCollapsed(c => !c)}>
        <div className="sidebar-section-left">
          <span className="sidebar-section-label">{title}</span>
        </div>
        <div className="sidebar-section-right">
          {!collapsed && <AndOrToggle value={logic} onChange={onLogic} />}
          <span className="sidebar-collapse-arrow">{collapsed ? '›' : '∨'}</span>
        </div>
      </div>
      {!collapsed && (
        <TagInput
          selected={selected}
          options={options}
          onAdd={onAdd}
          onRemove={onRemove}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function FilterSidebar({
  filters,
  setGroupBy,
  setDateFrom,
  setDateTo,
  setLogic,
  toggleTag,
  clearAll,
  saveFilters,
  uniques,
  dataType,
  onDataType,
}) {
  const {
    groupBy, dateFrom, dateTo,
    networks, contentTypes, leagues, teams, brands, assets,
    logic,
  } = filters;

  return (
    <aside className="filter-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Filter</span>
        <div className="sidebar-header-actions">
          <button className="sidebar-clear" onClick={clearAll}>✕ Clear</button>
          <button className="sidebar-save-btn" onClick={saveFilters}>Save Filters</button>
        </div>
      </div>

      {/* Data Type toggle */}
      <div className="sidebar-section">
        <div className="sidebar-section-header" style={{ marginBottom: 8 }}>
          <span className="sidebar-section-label">Data Type</span>
        </div>
        <div className="datatype-toggle">
          <button
            className={`datatype-btn${dataType === 'social' ? ' active' : ''}`}
            onClick={() => onDataType('social')}
          >Social</button>
          <button
            className={`datatype-btn${dataType === 'broadcast' ? ' active' : ''}`}
            onClick={() => onDataType('broadcast')}
          >Broadcast</button>
        </div>
      </div>

      {/* Group By */}
      <div className="sidebar-section">
        <div className="sidebar-section-header" style={{ marginBottom: 8 }}>
          <span className="sidebar-section-label">Group By</span>
        </div>
        <select
          className="sidebar-group-select"
          value={groupBy}
          onChange={e => setGroupBy(e.target.value)}
        >
          {GROUP_BY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="sidebar-section">
        <div className="sidebar-section-header" style={{ marginBottom: 8 }}>
          <span className="sidebar-section-label">Date Range</span>
        </div>
        <div className="date-range-inputs">
          <div className="date-input-row">
            <span className="date-input-label">From</span>
            <input type="date" className="date-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="date-input-row">
            <span className="date-input-label">To</span>
            <input type="date" className="date-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {dataType === 'social' && (
        <>
          <FilterSection
            title="Social Network"
            selected={networks}
            options={uniques.networks}
            logic={logic.networks}
            onLogic={v => setLogic('networks', v)}
            onAdd={v => toggleTag('networks', v)}
            onRemove={v => toggleTag('networks', v)}
            placeholder="Select Social Networks…"
          />
          <FilterSection
            title="Content Type"
            selected={contentTypes}
            options={uniques.contentTypes}
            logic={logic.contentTypes}
            onLogic={v => setLogic('contentTypes', v)}
            onAdd={v => toggleTag('contentTypes', v)}
            onRemove={v => toggleTag('contentTypes', v)}
            placeholder="Select Types…"
          />
        </>
      )}

      {dataType === 'broadcast' && (
        <FilterSection
          title="Network"
          selected={networks}
          options={uniques.networks}
          logic={logic.networks}
          onLogic={v => setLogic('networks', v)}
          onAdd={v => toggleTag('networks', v)}
          onRemove={v => toggleTag('networks', v)}
          placeholder="Select Networks…"
        />
      )}

      <FilterSection
        title="Leagues"
        selected={leagues}
        options={uniques.leagues}
        logic={logic.leagues}
        onLogic={v => setLogic('leagues', v)}
        onAdd={v => toggleTag('leagues', v)}
        onRemove={v => toggleTag('leagues', v)}
        placeholder="Select Leagues…"
      />
      <FilterSection
        title="Teams"
        selected={teams}
        options={uniques.teams}
        logic={logic.teams}
        onLogic={v => setLogic('teams', v)}
        onAdd={v => toggleTag('teams', v)}
        onRemove={v => toggleTag('teams', v)}
        placeholder="Select Teams…"
      />
      <FilterSection
        title="Brands"
        selected={brands}
        options={uniques.brands}
        logic={logic.brands}
        onLogic={v => setLogic('brands', v)}
        onAdd={v => toggleTag('brands', v)}
        onRemove={v => toggleTag('brands', v)}
        placeholder="Select Brands…"
      />
      <FilterSection
        title="Assets"
        selected={assets}
        options={uniques.assets}
        logic={logic.assets}
        onLogic={v => setLogic('assets', v)}
        onAdd={v => toggleTag('assets', v)}
        onRemove={v => toggleTag('assets', v)}
        placeholder="Select Assets…"
      />
    </aside>
  );
}
