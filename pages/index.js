// pages/index.js
import { useEffect, useMemo, useState } from "react";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function Dashboard() {
  // data & UI state
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // form state
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // filter & sort
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at"); // or code, clicks, last_clicked
  const [sortDir, setSortDir] = useState("desc");

  // load links
  async function loadLinks() {
    setLoadingLinks(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setLinks(data);
    } catch (e) {
      setFetchError("Unable to load links. Is the database configured?");
    } finally {
      setLoadingLinks(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  // client-side validation helpers
  function validateUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateForm() {
    if (!url) return "Please enter a URL.";
    if (!validateUrl(url)) return "Invalid URL. Include https:// or http://";
    if (code && !CODE_REGEX.test(code)) return "Custom code must be 6-8 alphanumeric characters.";
    return "";
  }

  // create link
  async function handleCreate(e) {
    e?.preventDefault();
    setFormError("");
    setSuccessMsg("");
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), code: code.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setUrl("");
        setCode("");
        setSuccessMsg(`Short link created: ${body.code}`);
        // refresh list
        await loadLinks();
        // hide success after 3s
        setTimeout(() => setSuccessMsg(""), 3000);
      } else if (res.status === 409) {
        setFormError("That code already exists. Choose another one.");
      } else {
        setFormError(body?.error || "Failed to create link.");
      }
    } catch (e) {
      setFormError("Network error while creating link.");
    } finally {
      setSubmitting(false);
    }
  }

  // delete
  async function handleDelete(codeToDelete) {
    if (!confirm(`Delete link ${codeToDelete}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadLinks();
    } catch {
      alert("Failed to delete. Try again.");
    }
  }

  // copy
  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      // small user feedback
      setSuccessMsg("Copied to clipboard");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch {
      alert("Copy failed — your browser may block clipboard access.");
    }
  }

  // filtered + sorted list (memoized)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = links.filter((l) => {
      if (!q) return true;
      return l.code.toLowerCase().includes(q) || (l.url || "").toLowerCase().includes(q);
    });

    out.sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (sortBy === "clicks") {
        av = Number(av || 0);
        bv = Number(bv || 0);
      } else {
        av = av || "";
        bv = bv || "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [links, query, sortBy, sortDir]);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">TinyLink</h1>
            <p className="text-sm text-slate-500">Shorten links — simple & clean</p>
          </div>
          <nav className="space-x-3 text-sm">
            <a href="/" className="text-slate-700 hover:text-slate-900">Dashboard</a>
            <a href="/healthz" className="text-slate-500 hover:text-slate-700">Health</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Top area: Create form + Search */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Create short link</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Target URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/path"
                  className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500"
                />
                {!url ? (
                  <p className="text-xs text-slate-400 mt-1">Include http:// or https://</p>
                ) : !validateUrl(url) ? (
                  <p className="text-xs text-rose-600 mt-1">Invalid URL format</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Custom code (optional)</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-8 alphanumeric"
                  maxLength={8}
                  className="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-blue-500"
                />
                {code && !CODE_REGEX.test(code) && (
                  <p className="text-xs text-rose-600 mt-1">Must be 6–8 alphanumeric characters.</p>
                )}
              </div>

              {formError && <div className="text-sm text-rose-600">{formError}</div>}
              {successMsg && <div className="text-sm text-green-600">{successMsg}</div>}

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded text-white ${submitting ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {submitting ? "Creating..." : "Create"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    setCode("");
                    setFormError("");
                    setSuccessMsg("");
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-slate-500">
              Codes must match <code className="font-mono">[A-Za-z0-9]{6,8}</code>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium">Links</h2>
                <p className="text-sm text-slate-500">Manage and inspect your short links</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  placeholder="Search by code or URL"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border px-3 py-2 rounded w-72"
                />
                <button onClick={loadLinks} className="px-3 py-2 border rounded text-sm">Refresh</button>
              </div>
            </div>

            {/* table area */}
            <div className="mt-4">
              {loadingLinks ? (
                // loading skeleton
                <div className="space-y-2">
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : fetchError ? (
                <div className="text-rose-600">{fetchError}</div>
              ) : filtered.length === 0 ? (
                <div className="text-slate-500 py-6 text-center">No links yet — create your first short link.</div>
              ) : (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead className="text-slate-600 text-left">
                      <tr>
                        <th className="px-3 py-2 cursor-pointer" onClick={() => toggleSort("code")}>
                          Code {sortBy === "code" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th className="px-3 py-2">Target URL</th>
                        <th className="px-3 py-2 cursor-pointer" onClick={() => toggleSort("clicks")}>
                          Clicks {sortBy === "clicks" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th className="px-3 py-2 cursor-pointer" onClick={() => toggleSort("last_clicked")}>
                          Last clicked {sortBy === "last_clicked" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((l) => (
                        <tr key={l.code} className="border-t">
                          <td className="px-3 py-2 align-top">
                            <div className="font-medium">{l.code}</div>
                            <div className="text-xs text-slate-400">/{l.code}</div>
                          </td>

                          <td className="px-3 py-2 max-w-[500px]">
                            {/* truncated URL with ellipsis */}
                            <div className="truncate max-w-[48ch]">
                              <a href={l.url} className="text-blue-600" target="_blank" rel="noreferrer">
                                {l.url}
                              </a>
                            </div>
                          </td>

                          <td className="px-3 py-2">{l.clicks ?? 0}</td>
                          <td className="px-3 py-2">{l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "—"}</td>

                          <td className="px-3 py-2 space-x-2">
                            <button
                              onClick={() => handleCopy(`${window.location.origin}/${l.code}`)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              Copy
                            </button>

                            <a
                              href={`/code/${l.code}`}
                              className="px-2 py-1 border rounded text-sm text-blue-600"
                            >
                              Stats
                            </a>

                            <a
                              href={`/${l.code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 border rounded text-sm"
                              title="Open redirect (new tab)"
                            >
                              Open
                            </a>

                            <button
                              onClick={() => handleDelete(l.code)}
                              className="px-2 py-1 border rounded text-sm text-rose-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 mt-6">
          Built with care • Ensure DATABASE_URL is configured for full functionality
        </footer>
      </main>
    </div>
  );
}
