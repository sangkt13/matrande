import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "matrix_secret_2026";

const USERS = [
  {
    username: "lanphuong",
    password: "1234",
    role: "admin",
    name: "Admin Lan Phuong"
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Chỉ hỗ trợ phương thức POST"
    });
  }

  const { username, password } = req.body || {};

  const user = USERS.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: "Sai tên đăng nhập hoặc mật khẩu"
    });
  }

  const token = jwt.sign(
    {
      username: user.username,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

  return res.status(200).json({
    token,
    user: {
      username: user.username,
      role: user.role,
      name: user.name
    }
  });
}
