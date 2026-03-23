// === API helpers ===
export async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

// === Suite definitions ===
export const SUITES = [
  { label: 'All Suites', value: 'all' },
  { label: 'Product Branding', value: 'Product Branding' },
  { label: 'Retail Experience', value: 'Retail Experience' },
  { label: 'Supply Chain', value: 'Supply Chain' },
];

export const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/signals', label: 'Signals Feed', icon: 'Radio' },
  { path: '/policy', label: 'Policy Tracker', icon: 'Scale' },
  { path: '/stakeholders', label: 'Stakeholder Map', icon: 'Users' },
  { path: '/competitors', label: 'Competitor Watch', icon: 'Swords' },
  { path: '/opportunities', label: 'Opportunities & Risks', icon: 'TrendingUp' },
];

// === Color/style helpers ===
export function suiteColor(suite) {
  switch (suite) {
    case 'Product Branding':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
    case 'Retail Experience':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Supply Chain':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300';
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  }
}

export function urgencyColor(level) {
  const map = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };
  return map[level] || 'bg-zinc-400';
}

export function urgencyBadge(level) {
  const map = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  };
  return map[level] || 'bg-zinc-100 text-zinc-600';
}

export function impactColor(level) {
  const map = {
    high: 'text-red-600 dark:text-red-400',
    'medium-high': 'text-orange-600 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    'low-medium': 'text-blue-600 dark:text-blue-400',
    low: 'text-green-600 dark:text-green-400',
  };
  return map[level] || 'text-zinc-500';
}

export function categoryIcon(cat) {
  const map = {
    regulatory: '⚖️',
    competitor: '⚔️',
    market: '📊',
    customer: '👥',
    sustainability: '♻️',
    pricing: '💰',
    innovation: '💡',
    supply: '🔗',
  };
  return map[cat] || '📡';
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}
