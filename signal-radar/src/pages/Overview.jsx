import React from 'react';
import { useData } from '../App';
import { Card, KpiCard, UrgencyDot, SuiteBadge, UrgencyBadge, EmptyState } from '../components/ui';
import { Radio, ShieldAlert, Scale, Swords, TrendingUp, Eye, AlertTriangle } from 'lucide-react';
import { categoryIcon, timeAgo } from '../lib/utils';

export default function Overview() {
  const { signals, kpis, competitors, regulations, opportunities, filterBySuite } = useData();

  const filtered = filterBySuite(signals);
  const criticals = filtered.filter(s => s.urgency === 'critical' || s.urgency === 'high');
  const recentSignals = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  // Suite breakdown
  const suiteBreakdown = ['Product Branding', 'Retail Experience', 'Supply Chain'].map(suite => ({
    suite,
    count: signals.filter(s => s.suite === suite).length,
    critical: signals.filter(s => s.suite === suite && (s.urgency === 'critical' || s.urgency === 'high')).length,
  }));

  // Category breakdown
  const categories = {};
  filtered.forEach(s => { categories[s.category] = (categories[s.category] || 0) + 1; });
  const catList = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5 max-w-[1400px] animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={Radio} label="Total Signals" value={filtered.length} />
        <KpiCard icon={ShieldAlert} label="High Priority" value={criticals.length}
          accent={criticals.length > 0 ? 'text-red-600 dark:text-red-400' : undefined} />
        <KpiCard icon={Scale} label="Active Policies" value={regulations.length} />
        <KpiCard icon={Swords} label="Competitors Tracked" value={competitors.length} />
        <KpiCard icon={TrendingUp} label="Opps & Risks" value={opportunities.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* High priority alerts */}
        <Card className="lg:col-span-2">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-red-500" />
              <h2 className="text-sm font-semibold">High priority alerts</h2>
              {criticals.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {criticals.length}
                </span>
              )}
            </div>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {criticals.length === 0 ? (
              <EmptyState icon={Eye} title="No high priority alerts" subtitle="All clear for now" />
            ) : (
              criticals.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-sm mt-0.5">{categoryIcon(s.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{s.title}</span>
                      <UrgencyBadge level={s.urgency} />
                      <SuiteBadge suite={s.suite} />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{s.summary}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{s.source} • {timeAgo(s.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Suite breakdown */}
          <Card>
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold">Suite breakdown</h2>
            </div>
            <div className="p-4 space-y-3">
              {suiteBreakdown.map(s => (
                <div key={s.suite}>
                  <div className="flex items-center justify-between mb-1">
                    <SuiteBadge suite={s.suite} />
                    <span className="text-xs text-zinc-400">{s.count} signals</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 transition-all"
                      style={{ width: `${signals.length ? (s.count / signals.length) * 100 : 0}%` }}
                    />
                  </div>
                  {s.critical > 0 && (
                    <p className="text-[10px] text-red-500 mt-0.5">{s.critical} high/critical</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Category mix */}
          <Card>
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold">By category</h2>
            </div>
            <div className="p-4 space-y-2">
              {catList.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{categoryIcon(cat)}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{cat}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">{count}</span>
                </div>
              ))}
              {catList.length === 0 && <p className="text-xs text-zinc-400">No data yet</p>}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent signals feed */}
      <Card>
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Recent signals</h2>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recentSignals.length === 0 ? (
            <EmptyState icon={Radio} title="No signals yet" subtitle="Click 'Update Now' to run your first scan" />
          ) : (
            recentSignals.map(s => (
              <div key={s.id} className="flex items-start gap-3 px-4 py-2.5">
                <UrgencyDot level={s.urgency} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate block">{s.title}</span>
                  <span className="text-[10px] text-zinc-400">{s.source} • {timeAgo(s.date)}</span>
                </div>
                <SuiteBadge suite={s.suite} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
