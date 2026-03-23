import React, { useMemo, useState } from 'react';
import { useData } from '../App';
import { Card, SuiteBadge, EmptyState } from '../components/ui';
import { Users, Building, User, Star } from 'lucide-react';

const ALIGNMENT_COLORS = {
  champion: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  supporter: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  skeptic: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  blocker: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const INFLUENCE_SIZE = {
  high: 'ring-2 ring-zinc-400 dark:ring-zinc-500',
  medium: 'ring-1 ring-zinc-300 dark:ring-zinc-600',
  low: '',
};

export default function Stakeholders() {
  const { stakeholders, filterBySuite } = useData();
  const [orgFilter, setOrgFilter] = useState('all');

  const orgs = useMemo(() => {
    const set = new Set(stakeholders.map(s => s.organization));
    return ['all', ...Array.from(set)];
  }, [stakeholders]);

  const filtered = useMemo(() => {
    let list = filterBySuite(stakeholders);
    if (orgFilter !== 'all') list = list.filter(s => s.organization === orgFilter);
    return list.sort((a, b) => {
      const i = { high: 0, medium: 1, low: 2 };
      return (i[a.influence] ?? 9) - (i[b.influence] ?? 9);
    });
  }, [stakeholders, filterBySuite, orgFilter]);

  return (
    <div className="space-y-4 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Stakeholder Map</h1>
        <span className="text-xs text-zinc-400">{filtered.length} stakeholders</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {orgs.map(o => (
          <button key={o} onClick={() => setOrgFilter(o)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
              orgFilter === o
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
            {o}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <Card className="md:col-span-3"><EmptyState icon={Users} title="No stakeholders found" subtitle="Run a scan to populate stakeholder data" /></Card>
        ) : (
          filtered.map(s => (
            <Card key={s.id} className={`p-4 ${INFLUENCE_SIZE[s.influence]}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {s.organization === 'Mainetti' ? <Building size={14} className="text-zinc-500" /> : <User size={14} className="text-zinc-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{s.role}</p>
                  <p className="text-[10px] text-zinc-400">{s.organization}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${ALIGNMENT_COLORS[s.alignment] || ALIGNMENT_COLORS.neutral}`}>
                      {s.alignment}
                    </span>
                    <span className="text-[10px] text-zinc-400 capitalize">{s.influence} influence</span>
                    <SuiteBadge suite={s.suite} />
                  </div>
                  {s.notes && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{s.notes}</p>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
