import { put } from "@vercel/blob";
import { requireAdmin, canAccessProject } from "./auth.js";

export default async function handler(req, res) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { projectId = "blueprint2026", data } = req.body || {};

    if (!canAccessProject(user, projectId)) {
      return res.status(403).json({ error: "Tài khoản này chưa được cấp quyền sửa ma trận này" });
    }

    if (!data) {
      return res.status(400).json({ error: "Thiếu dữ liệu cần lưu" });
    }

    const pathname = `matrix/${projectId}.json`;

    const blob = await put(pathname, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      savedBy: user.username,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return res.status(500).json({ error: error.message || "Save failed" });
  }
}
