// src/app/[code]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req, { params }) {
  const { code } = params;
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  // Find link
  const res = await query('SELECT url FROM links WHERE code = $1', [code]);
  if (res.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const url = res.rows[0].url;

  // Increment click count and update last_clicked (use single query is nice but do two to keep simple)
  try {
    await query('UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code = $1', [code]);
  } catch (e) {
    console.error('Failed to update clicks', e);
  }

  // Redirect with 302
  return NextResponse.redirect(url, 302);
}
