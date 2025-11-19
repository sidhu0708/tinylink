// src/app/api/links/[code]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req, { params }) {
  const { code } = params;
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  const res = await query('SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code = $1', [code]);
  if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(res.rows[0]);
}

export async function DELETE(req, { params }) {
  const { code } = params;
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  const res = await query('DELETE FROM links WHERE code = $1 RETURNING code', [code]);
  if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
