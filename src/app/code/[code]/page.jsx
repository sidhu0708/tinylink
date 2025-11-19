// src/app/code/[code]/page.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CodeStats({ params }) {
  const code = params.code;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/links/${code}`);
      if (res.status === 404) {
        setData({ notFound: true });
        setLoading(false);
        return;
      }
      const body = await res.json();
      setData(body);
      setLoading(false);
    }
    load();
  }, [code]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (data?.notFound) return <p className="p-6">Not found</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-2">Stats for {code}</h1>
        <p className="text-sm text-gray-600 mb-4">Target: <a href={data.url} className="text-blue-600" target="_blank" rel="noreferrer">{data.url}</a></p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Total Clicks</div>
            <div className="text-2xl">{data.clicks}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Last Clicked</div>
            <div>{data.last_clicked ? new Date(data.last_clicked).toLocaleString() : '-'}</div>
          </div>
        </div>
        <div className="mt-6">
          <a className="text-sm text-blue-600" href="/">← Back to dashboard</a>
        </div>
      </div>
    </div>
  );
}
