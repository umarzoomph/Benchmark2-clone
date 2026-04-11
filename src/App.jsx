import { useState } from 'react';
import './App.css';
import { DATA_SOURCES } from './config';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { useFilters } from './hooks/useFilters';

import Header from './components/Header';
import FilterChips from './components/FilterChips';
import Toolbar from './components/Toolbar';
import ScoutInsights from './components/ScoutInsights';
import DataTable from './components/DataTable';
import FilterSidebar from './components/FilterSidebar';
import Pagination from './components/Pagination';
import PostCard from './components/PostCard';

export default function App() {
  const [sourceIdx, setSourceIdx]     = useState(0);
  const [dataType, setDataType]       = useState('social');
  const [contentView, setContentView] = useState('table');
  const [view, setView]               = useState('table');
  const [scoutOpen, setScoutOpen]     = useState(false);
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(25);

  const source = DATA_SOURCES[sourceIdx];
  const { social, broadcast, loading, error } = useGoogleSheets(source);
  const rawRows = dataType === 'broadcast' ? broadcast : social;

  const {
    filters,
    setGroupBy,
    setDateFrom,
    setDateTo,
    setLogic,
    toggleTag,
    removeChip,
    clearAll,
    saveFilters,
    uniques,
    derivedRows,
    totalRow,
    activeChips,
  } = useFilters(rawRows, dataType);

  function handleSetGroupBy(v) { setGroupBy(v); setPage(1); }
  function handleRemoveChip(c) { removeChip(c); setPage(1); }
  function handleClearAll()    { clearAll(); setPage(1); }

  function handleContentNav(tab) {
    setContentView(tab);
    if (tab === 'table' || tab === 'posts') setView(tab);
    if (tab === 'scout') setScoutOpen(o => !o);
  }

  const totalCount = derivedRows.length;

  return (
    <div className="app-shell">
      <Header sources={DATA_SOURCES} sourceIdx={sourceIdx} onSource={setSourceIdx} />

      <div className="app-body">
        <div className="app-main">

          {activeChips.length > 0 && (
            <FilterChips chips={activeChips} onRemove={handleRemoveChip} />
          )}

          <Toolbar
            view={view}
            setView={v => { setView(v); setContentView(v); }}
            scoutOpen={scoutOpen}
            setScoutOpen={setScoutOpen}
            derivedRows={derivedRows}
            totalCount={totalCount}
          />

          {scoutOpen && (
            <ScoutInsights
              derivedRows={derivedRows}
              groupBy={filters.groupBy}
              open={scoutOpen}
              onToggle={() => setScoutOpen(o => !o)}
            />
          )}

          {/* Scrollable content area */}
          <div className="app-scroll">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>Loading data…</p>
              </div>
            )}

            {!loading && error && (
              <div className="empty-state">
                <h3>Failed to load data</h3>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && view === 'table' && (
              <>
                <DataTable
                  derivedRows={derivedRows}
                  totalRow={totalRow}
                  groupBy={filters.groupBy}
                  dataType={dataType}
                  page={page}
                  perPage={perPage}
                />
                <Pagination
                  page={page}
                  perPage={perPage}
                  total={totalCount}
                  onPage={setPage}
                  onPerPage={p => { setPerPage(p); setPage(1); }}
                />
              </>
            )}

            {!loading && !error && view === 'posts' && (
              <>
                <div className="posts-grid">
                  {derivedRows
                    .slice((page - 1) * perPage, page * perPage)
                    .map((row, i) => (
                      <PostCard key={row.groupKey + i} row={row} />
                    ))}
                </div>
                <Pagination
                  page={page}
                  perPage={perPage}
                  total={totalCount}
                  onPage={setPage}
                  onPerPage={p => { setPerPage(p); setPage(1); }}
                />
              </>
            )}
          </div>
        </div>

        <FilterSidebar
          filters={filters}
          setGroupBy={handleSetGroupBy}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          setLogic={setLogic}
          toggleTag={toggleTag}
          clearAll={handleClearAll}
          saveFilters={saveFilters}
          uniques={uniques}
          dataType={dataType}
          onDataType={t => { setDataType(t); setPage(1); }}
        />
      </div>
    </div>
  );
}
