import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const VALID_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"] as const;
type WithdrawStatusFilter = (typeof VALID_STATUSES)[number];

function isValidStatus(v: string | null): v is WithdrawStatusFilter {
  return v !== null && (VALID_STATUSES as readonly string[]).includes(v);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");

  const withdrawals = await prisma.withdrawal.findMany({
    where: isValidStatus(statusParam) ? { status: statusParam } : undefined,
    include: { user: { select: { username: true, email: true } } },
    orderBy: { requestedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ withdrawals });
}
