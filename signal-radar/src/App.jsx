import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import { LayoutDashboard, Radio, Scale, Users, Swords, TrendingUp, Sun, Moon, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { SUITES, NAV_ITEMS, apiFetch, apiPost } from './lib/utils';
import Overview from './pages/Overview';
import Signals from './pages/Signals';
import Policy from './pages/Policy';
import Stakeholders from './pages/Stakeholders';
import Competitors from './pages/Competitors';
import Opportunities from './pages/Opportunities';

// Theme context
const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

// Data context — shared across pages
const DataCtx = createContext();
export const useData = () => useContext(DataCtx);

const ICON_MAP = { LayoutDashboard, Radio, Scale, Users, Swords, TrendingUp };

export default function App() {
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [collapsed, setCollapsed] = useState(false);
  const [suite, setSuite] = useState('all');
  const [location] = useLocation();

  // Data state
  const [signals, setSignals] = useState([]);
  const [kpis, setKpis] = useState({});
  const [competitors, setCompetitors] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initial data load
  useEffect(() => {
    async function load() {
      try {
        const [sig, kpi, comp, reg, stak, opp] = await Promise.all([
          apiFetch('/api/signals').catch(() => []),
          apiFetch('/api/kpis').catch(() => ({})),
          apiFetch('/api/competitors').catch(() => []),
          apiFetch('/api/regulations').catch(() => []),
          apiFetch('/api/stakeholders').catch(() => []),
          apiFetch('/api/opportunities-risks').catch(() => []),
        ]);
        setSignals(sig); setKpis(kpi); setCompetitors(comp);
        setRegulations(reg); setStakeholders(stak); setOpportunities(opp);
        setLoaded(true);
      } catch (e) {
        setError(e.message);
        setLoaded(true);
      }
    }
    load();
  }, []);

  const triggerScan = useCallback(async () => {
    setScanning(true);
    try {
      await apiPost('/api/scan/trigger');
      // Reload all data
      const [sig, kpi, comp, reg, stak, opp] = await Promise.all([
        apiFetch('/api/signals').catch(() => []),
        apiFetch('/api/kpis').catch(() => ({})),
        apiFetch('/api/competitors').catch(() => []),
        apiFetch('/api/regulations').catch(() => []),
        apiFetch('/api/stakeholders').catch(() => []),
        apiFetch('/api/opportunities-risks').catch(() => []),
      ]);
      setSignals(sig); setKpis(kpi); setCompetitors(comp);
      setRegulations(reg); setStakeholders(stak); setOpportunities(opp);
    } catch (e) {
      setError(e.message);
    }
    setScanning(false);
  }, []);

  // Filter by suite
  const filterBySuite = useCallback((items) => {
    if (suite === 'all') return items;
    return items.filter(i => i.suite === suite || i.suite === 'All');
  }, [suite]);

  const lastScan = kpis.lastScanAt
    ? new Date(kpis.lastScanAt).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' })
    : 'Never';

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      <DataCtx.Provider value={{ signals, kpis, competitors, regulations, stakeholders, opportunities, filterBySuite, loaded, error }}>
        <div className="h-screen flex overflow-hidden bg-white dark:bg-zinc-950">
          {/* Sidebar */}
          <aside
            className={`flex flex-col border-r transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}
            style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 h-14 border-b shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="shrink-0">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
                <circle cx="16" cy="16" r="4" fill="currentColor" />
                <line x1="16" y1="16" x2="16" y2="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="16" y1="16" x2="27" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              </svg>
              {!collapsed && (
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-semibold tracking-tight">Signal Radar</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Mainetti</span>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(item => {
                const Icon = ICON_MAP[item.icon];
                const active = item.path === '/' ? location === '/' : location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                      active
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                    }`}>
                      {Icon && <Icon size={17} className="shrink-0" />}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom controls */}
            <div className="border-t p-2 space-y-0.5 shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 w-full transition-colors">
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
              </button>
              <button onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 w-full transition-colors">
                {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
                {!collapsed && <span>Collapse</span>}
              </button>
            </div>
          </aside>

          {/* Main area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Suite</span>
                <div className="flex gap-1 ml-1">
                  {SUITES.map(s => (
                    <button key={s.value} onClick={() => setSuite(s.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        suite === s.value
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={triggerScan} disabled={scanning}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    scanning
                      ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 cursor-wait'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                  }`}>
                  {scanning ? <><Loader2 size={13} className="animate-spin" /> Scanning...</> : <><RefreshCw size={13} /> Update Now</>}
                </button>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">Updated: {lastScan}</span>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-5">
              {!loaded ? (
                <div className="flex items-center justify-center h-64 text-zinc-400">
                  <Loader2 className="animate-spin mr-2" size={20} /> Loading intelligence data...
                </div>
              ) : (
                <Switch>
                  <Route path="/" component={Overview} />
                  <Route path="/signals" component={Signals} />
                  <Route path="/policy" component={Policy} />
                  <Route path="/stakeholders" component={Stakeholders} />
                  <Route path="/competitors" component={Competitors} />
                  <Route path="/opportunities" component={Opportunities} />
                </Switch>
              )}
            </main>
          </div>
        </div>
      </DataCtx.Provider>
    </ThemeCtx.Provider>
  );
}
