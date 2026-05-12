import { createUser } from "./users-store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Chỉ hỗ trợ phương thức POST" });
  }

  try {
    const { username, password, name } = req.body || {};

    if (!username || !password || !name) {
      return res.status(400).json({ error: "Vui lòng nhập đủ họ tên, tên đăng nhập và mật khẩu" });
    }

    if (String(password).length < 4) {
      return res.status(400).json({ error: "Mật khẩu cần ít nhất 4 ký tự" });
    }

    const user = await createUser({ username, password, name });

    return res.status(201).json({ ok: true, user });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Register failed" });
  }
}
