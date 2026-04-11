import { ITEMS_PER_PAGE_OPTIONS } from '../config';

export default function Pagination({ page, perPage, total, onPage, onPerPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function pages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p = [];
    p.push(1);
    if (page > 3) p.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i);
    if (page < totalPages - 2) p.push('…');
    p.push(totalPages);
    return p;
  }

  return (
    <div className="pagination">
      <button className="pagination-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>←</button>

      {pages().map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="pagination-ellipsis">…</span>
          : <button
              key={p}
              className={`pagination-btn${page === p ? ' active' : ''}`}
              onClick={() => onPage(p)}
            >{p}</button>
      )}

      <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>→</button>

      <div className="pagination-right">
        <span className="pagination-info">Showing {total.toLocaleString()} Results</span>
        <span className="per-page-label">Items per page</span>
        <select className="per-page-select" value={perPage} onChange={e => { onPerPage(Number(e.target.value)); onPage(1); }}>
          {ITEMS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
