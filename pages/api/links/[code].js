import { query } from "../../../lib/db";

export default async function handler(req, res) {
  const { code } = req.query;

  if (req.method === "GET") {
    const r = await query("SELECT * FROM links WHERE code=$1", [code]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(r.rows[0]);
  }

  if (req.method === "DELETE") {
    const r = await query("DELETE FROM links WHERE code=$1 RETURNING code", [code]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, DELETE");
  res.status(405).end();
}
