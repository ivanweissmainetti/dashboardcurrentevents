import React from 'react';
import { suiteColor, urgencyBadge, urgencyColor, categoryIcon, timeAgo } from '../lib/utils';

// Card wrapper
export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

// KPI stat card
export function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${accent || 'text-zinc-900 dark:text-zinc-100'}`}>{value}</p>
          {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && <Icon size={18} className="text-zinc-300 dark:text-zinc-600 mt-0.5" />}
      </div>
    </Card>
  );
}

// Suite badge
export function SuiteBadge({ suite }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${suiteColor(suite)}`}>
      {suite}
    </span>
  );
}

// Urgency badge
export function UrgencyBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${urgencyBadge(level)}`}>
      {level}
    </span>
  );
}

// Urgency dot
export function UrgencyDot({ level }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${urgencyColor(level)}`} />;
}

// Signal row component
export function SignalRow({ signal, expanded, onToggle }) {
  return (
    <div className="animate-fade-in">
      <button onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <span className="mt-1 text-base">{categoryIcon(signal.category)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{signal.title}</h3>
            <UrgencyBadge level={signal.urgency} />
            <SuiteBadge suite={signal.suite} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{signal.summary}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>{signal.source}</span>
            <span>•</span>
            <span>{timeAgo(signal.date)}</span>
            {signal.impact && <><span>•</span><span>Impact: {signal.impact}</span></>}
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-12 animate-fade-in">
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{signal.body}</p>
          {signal.tags && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {signal.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={32} className="text-zinc-300 dark:text-zinc-600 mb-3" />}
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      {subtitle && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}
