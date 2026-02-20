// PSEUDO: thay kvGet bằng SDK của KV bạn dùng (Upstash/Neon/etc.)
async function kvGet(key) {
  throw new Error("TODO: wire KV provider SDK here");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const url = new URL(req.url, `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId") || "default";

    const key = `matrix:${projectId}`;
    const raw = await kvGet(key);

    if (!raw) return res.status(200).json({ found: false });

    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return res.status(200).json({ found: true, ...parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
