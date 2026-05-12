import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "matrix_secret_2026";

export function getToken(req) {
  const auth = req.headers.authorization || "";

  if (auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

export function requireUser(req, res) {
  const token = getToken(req);

  if (!token) {
    res.status(401).json({
      error: "Chưa đăng nhập"
    });
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    res.status(401).json({
      error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
    });
    return null;
  }
}

export function requireAdmin(req, res) {
  const user = requireUser(req, res);

  if (!user) return null;

  if (user.role !== "admin") {
    res.status(403).json({
      error: "Tài khoản không có quyền admin"
    });
    return null;
  }

  return user;
}
