'use client';

import { useEffect, useState, useMemo } from 'react';

type CountEntry = { key: string; count: number };
type StatsResponse = {
  total: number;
  bySource: CountEntry[];
  byLocation: CountEntry[];
  recent: Array<{ id: number; name: string; email: string; source: string | null; school: string | null }>;
};

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 3);
  return `${visible}${user.length > 3 ? '***' : ''}@${domain}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/waitlist/stats', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
        const json = await res.json();
        if (isMounted) setStats(json);
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? 'Failed to load stats');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const topSources = useMemo(() => (stats?.bySource ?? []).slice(0, 12), [stats]);
  const topLocations = useMemo(() => (stats?.byLocation ?? []).slice(0, 12), [stats]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 font-brand">Waitlist Dashboard</h1>
        <p className="text-gray-400 mb-10">Overview of signups, paths and locations.</p>

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
              <h2 className="text-xl font-semibold mb-4">Recent Signups</h2>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-300">Name</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Email</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Path</th>
                      <th className="px-4 py-3 font-medium text-gray-300">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recent ?? []).map((r) => (
                      <tr key={r.id} className="border-t border-white/10">
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 text-gray-300">{maskEmail(r.email)}</td>
                        <td className="px-4 py-3">{r.source ?? 'direct'}</td>
                        <td className="px-4 py-3">{r.school ?? 'unspecified'}</td>
                      </tr>
                    ))}
                    {(!stats.recent || stats.recent.length === 0) && (
                      <tr>
                        <td className="px-4 py-3 text-gray-400" colSpan={4}>No recent signups</td>
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


