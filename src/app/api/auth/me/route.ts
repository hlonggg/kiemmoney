import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      balance: true,
      pendingBalance: true,
      totalEarned: true,
      referralCode: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
