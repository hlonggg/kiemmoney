import { NextResponse } from "next/server";

/**
 * LƯU Ý BẢO MẬT (đọc trước khi deploy production):
 * - access_token: sống ngắn (15 phút), dùng để middleware xác thực nhanh.
 * - refresh_token: sống dài (30 ngày), CHỈ gửi tới /api/auth/refresh.
 * - Cả hai đều httpOnly để JavaScript phía client không đọc được (chống XSS).
 * - Hiện refreshToken đang được lưu dạng raw string vào cột tokenHash trong DB
 *   để đơn giản hoá đợt 1. Trước khi lên production thật, đổi sang lưu
 *   SHA-256(refreshToken) thay vì raw token, để nếu DB bị lộ, kẻ tấn công
 *   không thể dùng thẳng token đó để đăng nhập.
 */

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 phút
  });
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth", // chỉ gửi kèm khi gọi tới các route auth
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/api/auth", maxAge: 0 });
}
