import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function verifyToken(request) {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function GET(request) {
  if (!(await verifyToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!UNSPLASH_KEY) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY 미설정' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json({ results: [] });

  const res = await fetch(
    `https://api.unsplash.com/search/photos?per_page=12&query=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
  );
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }
  const data = await res.json();
  const results = (data.results || []).map((p) => ({
    id: p.id,
    thumb: p.urls.small,
    full: p.urls.regular,
    alt: p.alt_description || q,
    author: p.user?.name,
    authorUrl: p.user?.links?.html,
  }));
  return NextResponse.json({ results });
}
