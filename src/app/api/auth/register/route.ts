import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  generateReferralCode,
} from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", fieldErrors },
      { status: 400 }
    );
  }

  const { username, email, password, referralCode } = parsed.data;

  // Kiểm tra trùng lặp username / email trước khi tạo
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  });
  if (existing) {
    const fieldErrors: Record<string, string> = {};
    if (existing.username === username) fieldErrors.username = "Tên đăng nhập đã tồn tại";
    if (existing.email === email) fieldErrors.email = "Email đã được sử dụng";
    return NextResponse.json(
      { message: "Tài khoản đã tồn tại", fieldErrors },
      { status: 409 }
    );
  }

  // Nếu có nhập mã giới thiệu, phải hợp lệ mới cho đăng ký (tránh mã rác)
  let referrer = null;
  if (referralCode) {
    referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (!referrer) {
      return NextResponse.json(
        { message: "Mã giới thiệu không tồn tại", fieldErrors: { referralCode: "Mã giới thiệu không hợp lệ" } },
        { status: 400 }
      );
    }
  }

  const passwordHash = await hashPassword(password);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Sinh mã giới thiệu duy nhất — thử lại tối đa 5 lần nếu trùng (xác suất cực thấp)
  let newReferralCode = generateReferralCode(username);
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.user.findUnique({ where: { referralCode: newReferralCode } });
    if (!clash) break;
    newReferralCode = generateReferralCode(username);
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      referralCode: newReferralCode,
      referredById: referrer?.id,
      registerIp: ip,
      lastLoginIp: ip,
      lastLoginAt: new Date(),
    },
  });

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshToken, // xem ghi chú trong lib/cookies.ts về nâng cấp hash token này
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const res = NextResponse.json({
    message: "Đăng ký thành công",
    user: { id: user.id, username: user.username, email: user.email },
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
