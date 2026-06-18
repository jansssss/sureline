import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  };
}

async function verifyToken(request) {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// GET /api/admin/guides — 전체 가이드 목록 (임시저장 포함)
export async function GET(request) {
  if (!(await verifyToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?select=slug,category,title,description,published,published_at,created_at&order=created_at.desc&limit=300`,
    { headers: getAdminHeaders(), cache: 'no-store' }
  );

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  const rows = await res.json();
  return NextResponse.json(rows);
}
