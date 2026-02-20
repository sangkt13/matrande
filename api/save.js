// PSEUDO: thay kvSet bằng SDK của KV bạn dùng (Upstash/Neon/etc.)
async function kvSet(key, value) {
  throw new Error("TODO: wire KV provider SDK here");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { projectId = "default", data } = req.body || {};
    if (!data) return res.status(400).json({ error: "Missing data" });

    const key = `matrix:${projectId}`;
    await kvSet(key, JSON.stringify({ savedAt: new Date().toISOString(), data }));

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
