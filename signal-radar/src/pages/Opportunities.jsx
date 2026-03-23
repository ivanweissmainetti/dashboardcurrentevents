import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { Card, SuiteBadge, EmptyState } from '../components/ui';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, Zap } from 'lucide-react';

const TYPE_CONFIG = {
  opportunity: { icon: ArrowUpRight, color: 'text-green-600 dark:text-green-400', bg: 'border-l-4 border-l-green-500' },
  risk: { icon: ArrowDownRight, color: 'text-red-600 dark:text-red-400', bg: 'border-l-4 border-l-red-500' },
};

const TIMEFRAME_ORDER = { immediate: 0, 'short-term': 1, 'medium-term': 2, 'long-term': 3 };

export default function Opportunities() {
  const { opportunities, filterBySuite } = useData();
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = filterBySuite(opportunities);
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    return list.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.impact] ?? 9) - (p[b.impact] ?? 9) || (TIMEFRAME_ORDER[a.timeframe] ?? 9) - (TIMEFRAME_ORDER[b.timeframe] ?? 9);
    });
  }, [opportunities, filterBySuite, typeFilter]);

  const oppCount = opportunities.filter(i => i.type === 'opportunity').length;
  const riskCount = opportunities.filter(i => i.type === 'risk').length;

  return (
    <div className="space-y-4 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Opportunities & Risks</h1>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1"><ArrowUpRight size={13} className="text-green-500" />{oppCount} opportunities</span>
          <span className="flex items-center gap-1"><ArrowDownRight size={13} className="text-red-500" />{riskCount} risks</span>
        </div>
      </div>

      <div className="flex gap-1">
        {['all', 'opportunity', 'risk'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
              typeFilter === t
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
            {t === 'all' ? 'All' : t === 'opportunity' ? 'Opportunities' : 'Risks'}
          </button>
        ))}
      </div>

      {/* Matrix header */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* High impact column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-orange-500" />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">High impact</span>
          </div>
          <div className="space-y-2">
            {filtered.filter(i => i.impact === 'high').length === 0 ? (
              <p className="text-xs text-zinc-400 py-4">No high-impact items</p>
            ) : (
              filtered.filter(i => i.impact === 'high').map(item => <OppCard key={item.id} item={item} />)
            )}
          </div>
        </div>

        {/* Medium/low column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Medium & low impact</span>
          </div>
          <div className="space-y-2">
            {filtered.filter(i => i.impact !== 'high').length === 0 ? (
              <p className="text-xs text-zinc-400 py-4">No items</p>
            ) : (
              filtered.filter(i => i.impact !== 'high').map(item => <OppCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OppCard({ item }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.opportunity;
  const TypeIcon = cfg.icon;

  return (
    <Card className={`p-4 ${cfg.bg}`}>
      <div className="flex items-start gap-2">
        <TypeIcon size={16} className={`${cfg.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.title}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
              item.type === 'opportunity' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {item.type}
            </span>
            <SuiteBadge suite={item.suite} />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{item.description}</p>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 flex-wrap">
            <span>Probability: <span className="capitalize font-medium">{item.probability}</span></span>
            <span>•</span>
            <span>Impact: <span className="capitalize font-medium">{item.impact}</span></span>
            <span>•</span>
            <span className="capitalize">{item.timeframe}</span>
          </div>

          {item.action && (
            <div className="mt-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded text-[11px] text-zinc-600 dark:text-zinc-300">
              <span className="font-medium">Action:</span> {item.action}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
