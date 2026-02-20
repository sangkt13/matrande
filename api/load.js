import { head } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const projectId = (url.searchParams.get("projectId") || "blueprint2026").toString();

    const pathname = `matrix/${projectId}.json`;

    const meta = await head(pathname); // throws if not found

    const r = await fetch(meta.url, { cache: "no-store" });
    if (!r.ok) return res.status(404).json({ found: false });

    const json = await r.json();

    return res.status(200).json({
      found: true,
      projectId,
      pathname,
      meta,
      ...json
    });
  } catch (e) {
    return res.status(404).json({ found: false, error: e?.message || String(e) });
  }
}
