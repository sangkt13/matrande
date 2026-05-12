import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUser, publicUser } from "./users-store.js";

const JWT_SECRET = process.env.JWT_SECRET || "matrix_secret_2026";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Chỉ hỗ trợ phương thức POST" });
  }

  try {
    const { username, password } = req.body || {};
    const user = await findUser(username);

    if (!user) {
      return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const ok = await bcrypt.compare(String(password || ""), user.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const safeUser = publicUser(user);

    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Login failed" });
  }
}
