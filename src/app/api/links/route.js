// src/app/api/links/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function GET(req) {
  // Return list of all links (used by dashboard)
  const res = await query('SELECT code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC', []);
  return NextResponse.json(res.rows);
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { url, code } = body;

  // Basic validation
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  // URL validation: simple but effective
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Invalid protocol');
  } catch (err) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  let finalCode;
  if (code) {
    if (typeof code !== 'string' || !CODE_REGEX.test(code)) {
      return NextResponse.json({ error: 'Invalid code format: must be [A-Za-z0-9]{6,8}' }, { status: 400 });
    }
    finalCode = code;
    // Check exists
    const existing = await query('SELECT code FROM links WHERE code = $1', [finalCode]);
    if (existing.rowCount > 0) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
    }
  } else {
    // Generate random code of length 6
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const makeCode = (len = 6) => {
      let s = '';
      for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };
    // Try generate unique a few times
    for (let len of [6,7,8]) {
      let attempts = 0;
      while (attempts < 6) {
        const candidate = makeCode(len);
        const r = await query('SELECT code FROM links WHERE code = $1', [candidate]);
        if (r.rowCount === 0) { finalCode = candidate; break; }
        attempts++;
      }
      if (finalCode) break;
    }
    if (!finalCode) return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
  }

  // Insert
  await query('INSERT INTO links(code, url) VALUES ($1, $2)', [finalCode, url]);

  return NextResponse.json({ code: finalCode, url }, { status: 201 });
}
