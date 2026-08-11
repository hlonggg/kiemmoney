import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// jose dùng Web Crypto API → chạy được cả trên Node.js (API routes) lẫn
// Edge Runtime (middleware.ts). Đây là lý do ta KHÔNG dùng "jsonwebtoken"
// (thư viện đó phụ thuộc Node crypto module, sẽ crash khi middleware chạy
// trên Edge Runtime — lỗi rất dễ gặp và khó nhận ra khi mới deploy).

const encoder = new TextEncoder();

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Thiếu biến môi trường JWT_ACCESS_SECRET");
  return encoder.encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("Thiếu biến môi trường JWT_REFRESH_SECRET");
  return encoder.encode(secret);
}

export interface AccessTokenPayload {
  sub: string; // userId
  role: "USER" | "MODERATOR" | "ADMIN";
}

// ---------- Mật khẩu (chỉ chạy trong API routes / Node runtime) ----------
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------- Token ----------
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: { sub: string }): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    if (!payload.sub) return null;
    return { sub: payload.sub, role: (payload.role as AccessTokenPayload["role"]) ?? "USER" };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    if (!payload.sub) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

// ---------- Mã giới thiệu ----------
export function generateReferralCode(username: string): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const base = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  return `${base || "USER"}${suffix}`;
}
