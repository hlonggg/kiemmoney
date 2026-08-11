import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { verifyPassword, signAccessToken, signRefreshToken } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";

// Chống dò mật khẩu bằng brute force cơ bản (đợt sau sẽ nâng cấp lên
// rate-limit theo IP bằng Redis; hiện tại giới hạn theo tài khoản trong DB).
const MAX_FAILED_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ message: "Dữ liệu không hợp lệ", fieldErrors }, { status: 400 });
  }

  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  // Thông báo lỗi cố tình mơ hồ (không nói rõ "sai email" hay "sai mật khẩu")
  // để tránh lộ thông tin tài khoản nào tồn tại trong hệ thống.
  const genericError = { message: "Email/tên đăng nhập hoặc mật khẩu không đúng" };

  if (!user) {
    return NextResponse.json(genericError, { status: 401 });
  }

  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    return NextResponse.json(
      { message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ." },
      { status: 403 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(genericError, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await signRefreshToken({ sub: user.id });

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    }),
  ]);

  const res = NextResponse.json({
    message: "Đăng nhập thành công",
    user: { id: user.id, username: user.username, email: user.email },
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
