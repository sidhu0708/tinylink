import { query } from "../../../lib/db";
import validator from "validator";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req, res) {
  const method = req.method;

  // GET: List links
  if (method === "GET") {
    const r = await query("SELECT code, url, clicks, last_clicked FROM links ORDER BY code ASC");
    return res.status(200).json(r.rows);
  }

  // POST: Create link
  if (method === "POST") {
    const { url, code } = req.body || {};

    if (!url || !validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ error: "Invalid URL. Include https://" });
    }

    let finalCode;

    if (code) {
      if (!CODE_REGEX.test(code)) {
        return res.status(400).json({ error: "Custom code must be 6-8 alphanumeric" });
      }
      finalCode = code;
    } else {
      finalCode = await generateCode();
    }

    try {
      await query("INSERT INTO links(code, url) VALUES($1,$2)", [finalCode, url]);
      return res.status(201).json({ code: finalCode });
    } catch (e) {
      if (e.code === "23505") return res.status(409).json({ error: "Code exists" });
      return res.status(500).json({ error: "Server error" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
}

async function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (true) {
    let c = "";
    for (let i = 0; i < 6; i++) {
      c += chars[Math.floor(Math.random() * chars.length)];
    }
    const r = await query("SELECT 1 FROM links WHERE code=$1", [c]);
    if (r.rowCount === 0) return c;
  }
}
