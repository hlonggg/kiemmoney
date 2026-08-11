import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn" }, { status: 401 });
  }

  // Đối chiếu với DB để đảm bảo token chưa bị thu hồi (logout / đổi mật khẩu)
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash: refreshToken, revokedAt: null },
  });
  if (!stored || stored.expiresAt < new Date()) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ message: "Tài khoản không khả dụng" }, { status: 403 });
  }

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });

  const res = NextResponse.json({ message: "OK" });
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  return res;
}
