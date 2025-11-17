'use client';

import { useEffect, useState, useMemo } from 'react';

type CountEntry = { key: string; count: number };
type StatsResponse = {
  total: number;
  bySource: CountEntry[];
  byLocation: CountEntry[];
  recent: Array<{ id: number; name: string; email: string; source: string | null; school: string | null; created_at?: string | null }>;
};

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 3);
  return `${visible}${user.length > 3 ? '***' : ''}@${domain}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'nameAsc' | 'nameDesc'>('newest');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError('');
      }
      
      // Force fresh data by adding timestamp to URL
      const timestamp = Date.now();
      const res = await fetch(`/api/waitlist/stats?_t=${timestamp}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
      const json = await res.json();
      setStats(json);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topSources = useMemo(() => (stats?.bySource ?? []).slice(0, 12), [stats]);
  const topLocations = useMemo(() => (stats?.byLocation ?? []).slice(0, 12), [stats]);
  const allSources = useMemo(() => ['all', ...(stats?.bySource ?? []).map(s => s.key)], [stats]);

  const filteredRecent = useMemo(() => {
    const items = (stats?.recent ?? []).slice();
    const query = search.trim().toLowerCase();
    const sourceSel = sourceFilter;
    const matches = items.filter(r => {
      const matchesSource = sourceSel === 'all' ? true : (r.source ?? 'direct') === sourceSel;
      if (!query) return matchesSource;
      const hay = [
        r.name ?? '',
        r.email ?? '',
        r.source ?? 'direct',
        r.school ?? 'unspecified',
      ].join(' ').toLowerCase();
      return matchesSource && hay.includes(query);
    });
    switch (sortBy) {
      case 'newest':
        return matches.sort((a, b) => {
          const at = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bt - at || (b.id - a.id);
        });
      case 'oldest':
        return matches.sort((a, b) => {
          const at = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
          return at - bt || (a.id - b.id);
        });
      case 'nameAsc':
        return matches.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '') || (b.id - a.id));
      case 'nameDesc':
        return matches.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? '') || (b.id - a.id));
      default:
        return matches;
    }
  }, [stats, search, sourceFilter, sortBy]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-brand">Waitlist Dashboard</h1>
            <p className="text-gray-400 mt-2">Overview of signups, paths and locations.</p>
            {lastRefresh && (
              <p className="text-gray-500 text-sm mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={() => loadStats(true)}
            disabled={loading || refreshing}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center sm:self-start"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {loading && (
          <div className="text-gray-300">Loading stats…</div>
        )}
        {error && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-600 text-red-200">
            {error}
          </div>
        )}

        {stats && !loading && !error && (
          <div className="space-y-10">
            {/* Summary */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Total signups</div>
                  <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Unique paths</div>
                  <div className="text-3xl font-bold">{stats.bySource.filter(s => s.key).length.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Unique locations</div>
                  <div className="text-3xl font-bold">{stats.byLocation.filter(l => l.key).length.toLocaleString()}</div>
                </div>
              </div>
            </section>

            {/* Paths */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Top Paths</h2>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-300">Path</th>
                      <th className="px-4 py-3 font-medium text-gray-300 text-right">Signups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSources.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-gray-400" colSpan={2}>No data</td>
                      </tr>
                    )}
                    {topSources.map((s) => (
                      <tr key={s.key} className="border-t border-white/10">
                        <td className="px-4 py-3">{s.key}</td>
                        <td className="px-4 py-3 text-right">{s.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Locations */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Top Locations</h2>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-300">Location</th>
                      <th className="px-4 py-3 font-medium text-gray-300 text-right">Signups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLocations.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-gray-400" colSpan={2}>No data</td>
                      </tr>
                    )}
                    {topLocations.map((l) => (
                      <tr key={l.key} className="border-t border-white/10">
                        <td className="px-4 py-3">{l.key}</td>
                        <td className="px-4 py-3 text-right">{l.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent */}
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Signups</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, path, location"
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/20"
                    title="Filter by path"
                  >
                    {allSources.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-white/20"
                    title="Sort"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="nameAsc">Name A–Z</option>
                    <option value="nameDesc">Name Z–A</option>
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-300">Name</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Email</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Path</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Location</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecent.map((r) => (
                      <tr key={r.id} className="border-t border-white/10">
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 text-gray-300">{maskEmail(r.email)}</td>
                        <td className="px-4 py-3">{r.source ?? 'direct'}</td>
                        <td className="px-4 py-3">{r.school ?? 'unspecified'}</td>
                        <td className="px-4 py-3">{formatDateTime(r.created_at)}</td>
                      </tr>
                    ))}
                    {(filteredRecent.length === 0) && (
                      <tr>
                        <td className="px-4 py-3 text-gray-400" colSpan={5}>No matching signups</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}


