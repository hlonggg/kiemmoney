import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const [referrals, totalCommission] = await Promise.all([
    prisma.user.findMany({
      where: { referredById: payload.sub },
      select: { id: true, username: true, createdAt: true, totalEarned: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.referralEarning.aggregate({
      where: { beneficiaryId: payload.sub },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    referrals,
    totalCommission: totalCommission._sum.amount ?? 0,
  });
}
