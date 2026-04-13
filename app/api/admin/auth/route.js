import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// POST /api/admin/auth — Supabase Auth 로그인
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }
    const { access_token } = await res.json();
    return NextResponse.json({ token: access_token });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// GET /api/admin/auth — 토큰 검증
export async function GET(request) {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true });
}
