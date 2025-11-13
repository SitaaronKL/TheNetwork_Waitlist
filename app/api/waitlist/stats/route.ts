import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type CountEntry = { key: string; count: number };

function toCounts(values: Array<string | null | undefined>, labelForNull = 'unknown'): CountEntry[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = (v ?? '').toString().trim();
    const normalized = key.length > 0 ? key : labelForNull;
    map.set(normalized, (map.get(normalized) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export async function GET(_req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Graceful fallback if not configured
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      total: 0,
      bySource: [],
      byLocation: [],
      recent: [],
      note: 'Supabase not configured; returning empty stats',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Total count (head request with count) - use minimal column for count
  const { count: totalCount, error: countError } = await supabase
    .from('waitlist')
    .select('id', { head: true, count: 'exact' });

  if (countError) {
    // Return empty stats rather than 500 so dashboard still loads
    return NextResponse.json({
      total: 0,
      bySource: [],
      byLocation: [],
      recent: [],
      note: `Count error: ${countError.message}`,
    });
  }

  // Fetch fields for aggregation
  const { data: allRows, error: listError } = await supabase
    .from('waitlist')
    .select('id, name, email, school, source')
    .limit(20000); // practical upper bound; adjust as needed

  if (listError) {
    return NextResponse.json({
      total: totalCount ?? 0,
      bySource: [],
      byLocation: [],
      recent: [],
      note: `List error: ${listError.message}`,
    });
  }

  const bySource = toCounts(allRows.map(r => r.source), 'direct');
  const byLocation = toCounts(allRows.map(r => r.school), 'unspecified');

  // Recent signups (small selection)
  const { data: recentRows, error: recentError } = await supabase
    .from('waitlist')
    .select('*')
    .order('id', { ascending: false })
    .limit(25);

  if (recentError) {
    return NextResponse.json({
      total: totalCount ?? 0,
      bySource,
      byLocation,
      recent: [],
      note: `Recent error: ${recentError.message}`,
    });
  }

  // Avoid leaking too much PII: return recent with minimal fields
  const recent = (recentRows ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    source: r.source ?? null,
    school: r.school ?? null,
  }));

  return NextResponse.json({
    total: totalCount ?? 0,
    bySource,
    byLocation,
    recent,
  });
}


