import { query } from "../lib/db";

export async function getServerSideProps({ params, res }) {
  const { code } = params;

  try {
    // find the URL
    const select = await query("SELECT url FROM links WHERE code=$1", [code]);
    if (select.rowCount === 0) return { notFound: true };

    const url = select.rows[0].url;

    // increment clicks atomically and return new clicks (log on server)
    try {
      const upd = await query(
        "UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1 RETURNING clicks",
        [code]
      );
      const newClicks = upd.rows?.[0]?.clicks ?? null;
      console.log(`[Redirect] code=${code} -> ${url} (clicks=${newClicks})`);
    } catch (uErr) {
      console.error("[Redirect] update failed for", code, uErr);
    }

    // perform 302 redirect
    res.writeHead(302, { Location: url });
    res.end();
    return { props: {} };
  } catch (err) {
    console.error("[Redirect] unexpected:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
    return { props: {} };
  }
}

export default function RedirectPage() {
  return null;
}
