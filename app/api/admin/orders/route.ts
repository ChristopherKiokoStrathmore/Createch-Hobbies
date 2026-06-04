import { NextRequest, NextResponse } from 'next/server';

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const ADMIN_PIN = process.env.ADMIN_PIN ?? '';
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY ?? '';
  const entered   = req.headers.get('x-admin-key') ?? '';

  if (!ADMIN_PIN || entered !== ADMIN_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();
  ['status', 'search', 'page', 'page_size'].forEach(key => {
    const val = searchParams.get(key);
    if (val) params.set(key, val);
  });

  try {
    const res = await fetch(`${DJANGO_BASE}/api/orders/?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_KEY,
      },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}
