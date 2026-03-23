import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { Card, SuiteBadge, EmptyState } from '../components/ui';
import { Scale, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const STATUS_COLORS = {
  enacted: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  proposed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  consultation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

const IMPACT_ICON = {
  high: <AlertTriangle size={13} className="text-red-500" />,
  medium: <Clock size={13} className="text-yellow-500" />,
  low: <CheckCircle size={13} className="text-green-500" />,
};

export default function Policy() {
  const { regulations, filterBySuite } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = useMemo(() => {
    let list = filterBySuite(regulations);
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter);
    return list;
  }, [regulations, filterBySuite, statusFilter]);

  const statuses = ['all', 'enacted', 'proposed', 'consultation', 'pending'];

  return (
    <div className="space-y-4 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Policy Tracker</h1>
        <span className="text-xs text-zinc-400">{filtered.length} regulations</span>
      </div>

      <div className="flex gap-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><EmptyState icon={Scale} title="No regulations found" subtitle="Run a scan to populate policy data" /></Card>
        ) : (
          filtered.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{r.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-zinc-100 text-zinc-600'}`}>
                      {r.status}
                    </span>
                    <SuiteBadge suite={r.suite} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{r.jurisdiction}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{r.summary}</p>
                  {r.action && (
                    <div className="mt-2 px-3 py-2 bg-brand-cream dark:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300">
                      <span className="font-medium">Recommended action:</span> {r.action}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    {IMPACT_ICON[r.impact]}
                    <span className="text-[10px] text-zinc-400 capitalize">{r.impact} impact</span>
                  </div>
                  {r.deadline && (
                    <p className="text-[10px] text-zinc-400">
                      <Clock size={10} className="inline mr-0.5" />
                      {r.deadline}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
