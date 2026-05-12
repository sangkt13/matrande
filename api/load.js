import { list } from "@vercel/blob";
import { requireUser } from "./auth.js";

export default async function handler(req, res) {
  const user = requireUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const projectId = req.query.projectId || "blueprint2026";
    const pathname = `matrix/${projectId}.json`;

    const result = await list({
      prefix: pathname,
      limit: 1
    });

    if (!result.blobs || result.blobs.length === 0) {
      return res.status(200).json({
        found: false
      });
    }

    const blob = result.blobs[0];

    const response = await fetch(blob.url, {
      cache: "no-store"
    });

    const data = await response.json();

    return res.status(200).json({
      found: true,
      data,
      meta: {
        url: blob.url,
        uploadedAt: blob.uploadedAt
      },
      loadedBy: user.username
    });
  } catch (error) {
    console.error("LOAD ERROR:", error);

    return res.status(500).json({
      error: error.message || "Load failed"
    });
  }
}
