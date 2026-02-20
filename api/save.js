import { put } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body || {};
    const projectId = (body.projectId || "blueprint2026").toString();
    const data = body.data;

    if (!data) {
      return res.status(400).json({ error: "Missing data" });
    }

    const pathname = `matrix/${projectId}.json`;

    const blob = await put(
      pathname,
      JSON.stringify(
        {
          savedAt: new Date().toISOString(),
          data
        },
        null,
        2
      ),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true
      }
    );

    return res.status(200).json({
      ok: true,
      projectId,
      pathname,
      url: blob.url
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
