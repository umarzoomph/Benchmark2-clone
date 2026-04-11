export function fmtNum(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return Math.round(n).toLocaleString();
}

export function fmtCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + Math.round(n).toLocaleString();
}

export function fmtCurrencyFull(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString();
}

export function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  return (n * 100).toFixed(2) + '%';
}

export function fmtDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function parseDateStr(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

// Deterministic color from a string (for team dots, etc.)
const TEAM_COLORS = [
  '#E04C55','#4D8FF5','#00C48C','#F5A623','#9B6EE8',
  '#E1306C','#1DA1F2','#FF6B35','#00B4D8','#06D6A0',
  '#FFD166','#EF476F','#118AB2','#073B4C','#8338EC',
  '#FB5607','#FFBE0B','#3A86FF','#FF006E','#8AC926',
];
export function teamColor(name) {
  if (!name) return '#6B8CA8';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length];
}
