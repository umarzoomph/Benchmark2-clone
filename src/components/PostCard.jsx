import { fmtNum, fmtCurrencyFull, fmtPct } from '../utils/formatters';

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

export default function PostCard({ row }) {
  return (
    <div className="post-card">
      <div className="post-card-top">
        <span className="post-card-team">{row.rightsHolder || row.groupKey}</span>
        <PlatformBadge platform={row.platform} />
      </div>

      <p className="post-card-msg">{row.message || 'No message'}</p>

      <div className="post-card-meta">
        <div className="post-card-stat">
          <span className="post-card-stat-label">Impressions</span>
          <span className="post-card-stat-val blue">{fmtNum(row.impressions)}</span>
        </div>
        <div className="post-card-stat">
          <span className="post-card-stat-label">Engagements</span>
          <span className="post-card-stat-val">{fmtNum(row.engagement)}</span>
        </div>
        <div className="post-card-stat">
          <span className="post-card-stat-label">Brand Value</span>
          <span className="post-card-stat-val green">{fmtCurrencyFull(row.brandValue)}</span>
        </div>
        <div className="post-card-stat">
          <span className="post-card-stat-label">Eng. Rate</span>
          <span className="post-card-stat-val">{fmtPct(row.engagementRate)}</span>
        </div>
      </div>

      {row.url && (
        <a className="post-card-link" href={row.url} target="_blank" rel="noreferrer">
          View post →
        </a>
      )}
    </div>
  );
}
