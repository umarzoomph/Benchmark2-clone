import { useState, useMemo } from 'react';
import { fmtNum, fmtCurrency, fmtCurrencyFull, fmtPct, fmtDuration, teamColor } from '../utils/formatters';
import AssetIcon from './AssetIcon';

function PlatformBadge({ platform }) {
  const cls = {
    Instagram: 'badge-instagram',
    Twitter:   'badge-twitter',
    Facebook:  'badge-facebook',
    TikTok:    'badge-tiktok',
    YouTube:   'badge-youtube',
  }[platform] || 'badge-photo';
  return <span className={`badge ${cls}`}>{platform}</span>;
}

function ContentBadge({ type }) {
  const cls = {
    Photo:    'badge-photo',
    Video:    'badge-video',
    Carousel: 'badge-carousel',
  }[type] || 'badge-photo';
  return <span className={`badge ${cls}`}>{type}</span>;
}

function SortTh({ label, field, sort, onSort, className = '' }) {
  const active = sort.field === field;
  return (
    <th className={`${className}${active ? ' sorted' : ''}`} onClick={() => onSort(field)}>
      {label}
      {active && <span className="sort-arrow">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
      {!active && <span className="sort-arrow" style={{ opacity: 0.25 }}>↕</span>}
    </th>
  );
}

function rankClass(i) {
  return i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
}

export default function DataTable({ derivedRows, totalRow, groupBy, dataType, page, perPage }) {
  const [sort, setSort] = useState({
    field: groupBy === 'rights_holders' ? 'socialValue' : 'brandValue',
    dir: 'desc',
  });

  function handleSort(field) {
    setSort(s => ({ field, dir: s.field === field && s.dir === 'desc' ? 'asc' : 'desc' }));
  }

  const sorted = useMemo(() => {
    return [...derivedRows].sort((a, b) => {
      const av = a[sort.field] ?? 0;
      const bv = b[sort.field] ?? 0;
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [derivedRows, sort]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  const isRH    = groupBy === 'rights_holders';
  const isAsset = groupBy === 'assets';
  const isBrand = groupBy === 'brands';
  const isExp   = groupBy === 'exposures';
  const isBcast = dataType === 'broadcast';

  if (!derivedRows.length) {
    return (
      <div className="empty-state">
        <h3>No data matches your filters</h3>
        <p>Try adjusting or clearing your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>

            {isRH && (
              <>
                <th>Rights Holder</th>
                <SortTh label="Organic Posts" field="organicPosts"    sort={sort} onSort={handleSort} className="col-posts" />
                <SortTh label="Follower Count" field="followerCount"  sort={sort} onSort={handleSort} />
                <SortTh label="Impressions"    field="impressions"    sort={sort} onSort={handleSort} />
                <SortTh label="Engagements"    field="engagement"     sort={sort} onSort={handleSort} />
                <SortTh label="Eng. Rate"      field="engagementRate" sort={sort} onSort={handleSort} />
                <SortTh label="Video Views"    field="videoViews"     sort={sort} onSort={handleSort} />
                <SortTh label="Social Value"   field="socialValue"    sort={sort} onSort={handleSort} />
              </>
            )}

            {isAsset && (
              <>
                <th>Asset</th>
                <SortTh label="Organic Posts" field="organicPosts"    sort={sort} onSort={handleSort} className="col-posts" />
                <SortTh label="Impressions"   field="impressions"     sort={sort} onSort={handleSort} />
                <SortTh label="Engagements"   field="engagement"      sort={sort} onSort={handleSort} />
                <SortTh label="Eng. Rate"     field="engagementRate"  sort={sort} onSort={handleSort} />
                <SortTh label="Video Views"   field="videoViews"      sort={sort} onSort={handleSort} />
                <SortTh label="Brand Value"   field="brandValue"      sort={sort} onSort={handleSort} />
              </>
            )}

            {isBrand && (
              <>
                <th>Brand</th>
                <SortTh label="Organic Posts" field="organicPosts"    sort={sort} onSort={handleSort} className="col-posts" />
                <SortTh label="Impressions"   field="impressions"     sort={sort} onSort={handleSort} />
                <SortTh label="Engagements"   field="engagement"      sort={sort} onSort={handleSort} />
                <SortTh label="Eng. Rate"     field="engagementRate"  sort={sort} onSort={handleSort} />
                <SortTh label="Video Views"   field="videoViews"      sort={sort} onSort={handleSort} />
                <SortTh label="Brand Value"   field="brandValue"      sort={sort} onSort={handleSort} />
              </>
            )}

            {isExp && !isBcast && (
              <>
                <th>Rights Holder</th>
                <th>Brand</th>
                <th>Message</th>
                <th>Platform</th>
                <SortTh label="Organic Posts" field="organicPosts"    sort={sort} onSort={handleSort} className="col-posts" />
                <SortTh label="Impressions"   field="impressions"     sort={sort} onSort={handleSort} />
                <SortTh label="Engagements"   field="engagement"      sort={sort} onSort={handleSort} />
                <SortTh label="Eng. Rate"     field="engagementRate"  sort={sort} onSort={handleSort} />
                <SortTh label="Video Views"   field="videoViews"      sort={sort} onSort={handleSort} />
                <SortTh label="Brand Value"   field="brandValue"      sort={sort} onSort={handleSort} />
              </>
            )}

            {isBcast && (
              <>
                <th>Rights Holder</th>
                <th>Brand</th>
                <th>Program</th>
                <th>Network</th>
                <SortTh label="Airings"      field="airings"          sort={sort} onSort={handleSort} className="col-posts" />
                <SortTh label="Duration"     field="durationSeconds"  sort={sort} onSort={handleSort} />
                <SortTh label="Viewers"      field="viewers"          sort={sort} onSort={handleSort} />
                <SortTh label="Brand Value"  field="brandValue"       sort={sort} onSort={handleSort} />
              </>
            )}

            <th style={{ width: 32 }} />
          </tr>
        </thead>

        <tbody>
          {pageRows.map((row, i) => {
            const absRank = (page - 1) * perPage + i;
            const rc = rankClass(absRank);
            const color = teamColor(row.rightsHolder || row.groupKey);

            return (
              <tr key={row.groupKey + i}>
                <td className={`col-rank ${rc}`}>{absRank + 1}</td>

                {isRH && (
                  <>
                    <td>
                      <div className="team-cell">
                        <div className="team-dot" style={{ background: color }} />
                        <span className="team-name">{row.rightsHolder || row.groupKey}</span>
                      </div>
                    </td>
                    <td className="col-posts">{row.organicPosts?.toLocaleString()}</td>
                    <td className="col-dim">{fmtNum(row.followerCount)}</td>
                    <td>{fmtNum(row.impressions)}</td>
                    <td>{fmtNum(row.engagement)}</td>
                    <td className="col-dim">{fmtPct(row.engagementRate)}</td>
                    <td className="col-dim">{fmtNum(row.videoViews)}</td>
                    <td className="col-value">{fmtCurrencyFull(row.socialValue)}</td>
                  </>
                )}

                {isAsset && (
                  <>
                    <td>
                      <div className="asset-cell">
                        <span className="asset-icon-wrap"><AssetIcon assetLabel={row.groupKey} /></span>
                        {row.groupKey}
                      </div>
                    </td>
                    <td className="col-posts">{row.organicPosts?.toLocaleString()}</td>
                    <td>{fmtNum(row.impressions)}</td>
                    <td>{fmtNum(row.engagement)}</td>
                    <td className="col-dim">{fmtPct(row.engagementRate)}</td>
                    <td className="col-dim">{fmtNum(row.videoViews)}</td>
                    <td className="col-value">{fmtCurrencyFull(row.brandValue)}</td>
                  </>
                )}

                {isBrand && (
                  <>
                    <td style={{ fontWeight: 600 }}>{row.groupKey}</td>
                    <td className="col-posts">{row.organicPosts?.toLocaleString()}</td>
                    <td>{fmtNum(row.impressions)}</td>
                    <td>{fmtNum(row.engagement)}</td>
                    <td className="col-dim">{fmtPct(row.engagementRate)}</td>
                    <td className="col-dim">{fmtNum(row.videoViews)}</td>
                    <td className="col-value">{fmtCurrencyFull(row.brandValue)}</td>
                  </>
                )}

                {isExp && !isBcast && (
                  <>
                    <td className="col-dim">{row.rightsHolder}</td>
                    <td style={{ fontWeight: 600 }}>{row.partner}</td>
                    <td className="col-msg">
                      <a href={row.url} target="_blank" rel="noreferrer" title={row.message}>
                        {(row.message || '').slice(0, 70)}{(row.message || '').length > 70 ? '…' : ''}
                      </a>
                    </td>
                    <td><PlatformBadge platform={row.platform} /></td>
                    <td className="col-posts">{row.organicPosts?.toLocaleString()}</td>
                    <td>{fmtNum(row.impressions)}</td>
                    <td>{fmtNum(row.engagement)}</td>
                    <td className="col-dim">{fmtPct(row.engagementRate)}</td>
                    <td className="col-dim">{fmtNum(row.videoViews)}</td>
                    <td className="col-value">{fmtCurrencyFull(row.brandValue)}</td>
                  </>
                )}

                {isBcast && (
                  <>
                    <td className="col-dim">{row.rightsHolder}</td>
                    <td style={{ fontWeight: 600 }}>{row.partner}</td>
                    <td className="col-dim">{row.program}</td>
                    <td className="col-dim">{row.network}</td>
                    <td className="col-posts">{row.airings?.toLocaleString()}</td>
                    <td className="col-dim">{fmtDuration(row.durationSeconds)}</td>
                    <td>{fmtNum(row.viewers)}</td>
                    <td className="col-value">{fmtCurrencyFull(row.brandValue)}</td>
                  </>
                )}

                <td className="col-arrow" onClick={() => row.url && window.open(row.url, '_blank')}>→</td>
              </tr>
            );
          })}

          {/* Total row */}
          {totalRow && (
            <tr className="total-row">
              <td />
              {isRH && (
                <>
                  <td>Total</td>
                  <td className="col-posts">{totalRow.organicPosts?.toLocaleString()}</td>
                  <td className="col-dim">{fmtNum(totalRow.followerCount)}</td>
                  <td>{fmtNum(totalRow.impressions)}</td>
                  <td>{fmtNum(totalRow.engagement)}</td>
                  <td className="col-dim">{fmtPct(totalRow.engagementRate)}</td>
                  <td className="col-dim">{fmtNum(totalRow.videoViews)}</td>
                  <td className="col-value">{fmtCurrencyFull(totalRow.socialValue)}</td>
                </>
              )}
              {(isAsset || isBrand) && (
                <>
                  <td>Total</td>
                  <td className="col-posts">{totalRow.organicPosts?.toLocaleString()}</td>
                  <td>{fmtNum(totalRow.impressions)}</td>
                  <td>{fmtNum(totalRow.engagement)}</td>
                  <td className="col-dim">{fmtPct(totalRow.engagementRate)}</td>
                  <td className="col-dim">{fmtNum(totalRow.videoViews)}</td>
                  <td className="col-value">{fmtCurrencyFull(totalRow.brandValue)}</td>
                </>
              )}
              {isExp && !isBcast && (
                <>
                  <td /><td /><td /><td />
                  <td className="col-posts">{totalRow.organicPosts?.toLocaleString()}</td>
                  <td>{fmtNum(totalRow.impressions)}</td>
                  <td>{fmtNum(totalRow.engagement)}</td>
                  <td className="col-dim">{fmtPct(totalRow.engagementRate)}</td>
                  <td className="col-dim">{fmtNum(totalRow.videoViews)}</td>
                  <td className="col-value">{fmtCurrencyFull(totalRow.brandValue)}</td>
                </>
              )}
              {isBcast && (
                <>
                  <td /><td /><td /><td />
                  <td className="col-posts">{totalRow.airings?.toLocaleString()}</td>
                  <td />
                  <td>{fmtNum(totalRow.viewers)}</td>
                  <td className="col-value">{fmtCurrencyFull(totalRow.brandValue)}</td>
                </>
              )}
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
