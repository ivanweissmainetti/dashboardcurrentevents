import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { Card, SuiteBadge, EmptyState } from '../components/ui';
import { Swords, ChevronDown, ChevronUp, ShieldAlert, Shield, ShieldCheck } from 'lucide-react';

const THREAT_CONFIG = {
  high: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', label: 'High threat' },
  medium: { icon: Shield, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', label: 'Medium threat' },
  low: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', label: 'Low threat' },
};

export default function Competitors() {
  const { competitors, filterBySuite } = useData();
  const [expanded, setExpanded] = useState(null);
  const [threatFilter, setThreatFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = filterBySuite(competitors);
    if (threatFilter !== 'all') list = list.filter(c => c.threat === threatFilter);
    return list.sort((a, b) => {
      const t = { high: 0, medium: 1, low: 2 };
      return (t[a.threat] ?? 9) - (t[b.threat] ?? 9);
    });
  }, [competitors, filterBySuite, threatFilter]);

  return (
    <div className="space-y-4 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Competitor Watch</h1>
        <span className="text-xs text-zinc-400">{filtered.length} competitors</span>
      </div>

      <div className="flex gap-1">
        {['all', 'high', 'medium', 'low'].map(t => (
          <button key={t} onClick={() => setThreatFilter(t)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
              threatFilter === t
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
            {t === 'all' ? 'All threats' : `${t} threat`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><EmptyState icon={Swords} title="No competitors found" subtitle="Run a scan to populate competitor intelligence" /></Card>
        ) : (
          filtered.map(c => {
            const cfg = THREAT_CONFIG[c.threat] || THREAT_CONFIG.medium;
            const ThreatIcon = cfg.icon;
            const isExpanded = expanded === c.id;
            return (
              <Card key={c.id} className={`border ${cfg.bg}`}>
                <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                  className="w-full text-left p-4 flex items-start gap-3">
                  <ThreatIcon size={18} className={`${cfg.color} mt-0.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</h3>
                      <SuiteBadge suite={c.suite} />
                      <span className="text-[10px] text-zinc-400 capitalize">{cfg.label}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">{c.recentMoves}</p>
                    {c.marketShare && (
                      <p className="text-[10px] text-zinc-400 mt-1">Market position: {c.marketShare}</p>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-zinc-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pl-11 animate-fade-in space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Strengths</p>
                        <ul className="space-y-1">
                          {(c.strengths || []).map((s, i) => (
                            <li key={i} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Weaknesses</p>
                        <ul className="space-y-1">
                          {(c.weaknesses || []).map((w, i) => (
                            <li key={i} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                              <span className="text-red-500 mt-0.5">−</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {c.watchItems && c.watchItems.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Watch items</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {c.watchItems.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{w}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
