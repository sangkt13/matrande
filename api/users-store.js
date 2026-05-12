import { list, put } from "@vercel/blob";
import bcrypt from "bcryptjs";

const USERS_PATH = "auth/users.json";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "lanphuong";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function publicUser(user) {
  return {
    username: user.username,
    name: user.name,
    role: user.role,
    projects: user.projects || ["blueprint2026"]
  };
}

async function readRawUsers() {
  const result = await list({ prefix: USERS_PATH, limit: 1 });

  if (!result.blobs || result.blobs.length === 0) {
    return [];
  }

  const blob = result.blobs[0];
  const response = await fetch(blob.url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Không đọc được danh sách tài khoản");
  }

  const data = await response.json();
  return Array.isArray(data.users) ? data.users : [];
}

async function writeRawUsers(users) {
  await put(
    USERS_PATH,
    JSON.stringify({ users }, null, 2),
    {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true
    }
  );
}

function addDefaultAdminIfMissing(users) {
  const adminUsername = normalizeUsername(ADMIN_USERNAME);
  const exists = users.some(u => normalizeUsername(u.username) === adminUsername);

  if (!exists) {
    users.unshift({
      username: adminUsername,
      name: ADMIN_NAME,
      role: "admin",
      projects: ["blueprint2026", "all"],
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      createdAt: new Date().toISOString()
    });
  }

  return users;
}

export async function getUsers() {
  const users = await readRawUsers();
  return addDefaultAdminIfMissing(users);
}

export async function saveUsers(users) {
  await writeRawUsers(users);
}

export async function findUser(username) {
  const users = await getUsers();
  const key = normalizeUsername(username);
  return users.find(u => normalizeUsername(u.username) === key) || null;
}

export async function createUser({ username, password, name }) {
  const users = await getUsers();
  const key = normalizeUsername(username);

  if (!key) {
    throw new Error("Tên đăng nhập không hợp lệ");
  }

  if (users.some(u => normalizeUsername(u.username) === key)) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  const newUser = {
    username: key,
    name: String(name || key).trim(),
    role: "viewer",
    projects: ["blueprint2026"],
    passwordHash: bcrypt.hashSync(String(password), 10),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await saveUsers(users);

  return publicUser(newUser);
}

export { publicUser, normalizeUsername };
