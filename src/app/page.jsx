// src/app/page.jsx
'use client';
import React, { useEffect, useState } from 'react';

function truncate(s, n=60) {
  if (!s) return '';
  return s.length > n ? s.slice(0,n-1)+'…' : s;
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''));

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchLinks(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined })
      });
      const body = await res.json();
      if (!res.ok) throw body;
      setUrl(''); setCode('');
      await fetchLinks();
    } catch (err) {
      setError(err?.error || 'Failed to create');
    } finally { setCreating(false); }
  }

  async function onDelete(c) {
    if (!confirm(`Delete ${c}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/links/${c}`, { method: 'DELETE' });
      if (res.status === 404) { alert('Not found'); return; }
      await fetchLinks();
    } catch (e) { console.error(e); alert('Failed to delete'); }
  }

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text);
    alert('Copied to clipboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">TinyLink</h1>
          <a className="text-sm text-gray-500" href="/healthz">Health</a>
        </header>

        <section className="mb-6">
          <form onSubmit={onCreate} className="flex gap-2 flex-col sm:flex-row items-start">
            <input required value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com/very/long/url" className="flex-1 border rounded px-3 py-2" />
            <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Optional custom code (6-8 chars)" className="w-64 border rounded px-3 py-2" />
            <button disabled={creating} className="bg-blue-600 text-white px-4 py-2 rounded">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Links</h2>
          {loading ? <p>Loading…</p> : links.length === 0 ? <p>No links yet</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th>Short</th>
                    <th>Target</th>
                    <th>Clicks</th>
                    <th>Last clicked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.code} className="border-t">
                      <td className="py-2">
                        <a className="text-blue-600" href={`/${l.code}`} target="_blank" rel="noreferrer">{l.code}</a>
                      </td>
                      <td className="py-2 max-w-md"><span title={l.url}>{truncate(l.url, 80)}</span></td>
                      <td className="py-2">{l.clicks}</td>
                      <td className="py-2">{l.last_clicked ? new Date(l.last_clicked).toLocaleString() : '-'}</td>
                      <td className="py-2 flex gap-2">
                        <button onClick={()=>copyToClipboard(baseUrl + '/' + l.code)} className="px-2 py-1 border rounded">Copy</button>
                        <a href={`/code/${l.code}`} className="px-2 py-1 border rounded">Stats</a>
                        <button onClick={()=>onDelete(l.code)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
