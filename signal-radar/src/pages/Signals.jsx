import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { Card, SignalRow, EmptyState } from '../components/ui';
import { Radio, Search, Filter } from 'lucide-react';

const CATEGORIES = ['all', 'regulatory', 'competitor', 'market', 'customer', 'sustainability', 'pricing', 'innovation', 'supply'];
const URGENCIES = ['all', 'critical', 'high', 'medium', 'low'];

export default function Signals() {
  const { signals, filterBySuite } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [urgency, setUrgency] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let list = filterBySuite(signals);
    if (category !== 'all') list = list.filter(s => s.category === category);
    if (urgency !== 'all') list = list.filter(s => s.urgency === urgency);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.summary?.toLowerCase().includes(q) ||
        s.source?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      const u = { critical: 0, high: 1, medium: 2, low: 3 };
      return (u[a.urgency] ?? 9) - (u[b.urgency] ?? 9);
    });
  }, [signals, filterBySuite, search, category, urgency]);

  return (
    <div className="space-y-4 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Signals Feed</h1>
        <span className="text-xs text-zinc-400">{filtered.length} signals</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search" placeholder="Search signals..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 w-52 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                category === c
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {URGENCIES.map(u => (
            <button key={u} onClick={() => setUrgency(u)}
              className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                urgency === u
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <Card>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filtered.length === 0 ? (
            <EmptyState icon={Radio} title="No signals match your filters" subtitle="Try adjusting your search or category filters" />
          ) : (
            filtered.map(s => (
              <SignalRow key={s.id} signal={s} expanded={expanded === s.id}
                onToggle={() => setExpanded(expanded === s.id ? null : s.id)} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
