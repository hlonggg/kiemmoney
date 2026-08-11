import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { withdrawSchema } from "@/lib/withdraw-validators";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: payload.sub },
    orderBy: { requestedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ withdrawals });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ message: "Dữ liệu không hợp lệ", fieldErrors }, { status: 400 });
  }

  const { amount, method, destination, destinationName } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ message: "Tài khoản không khả dụng" }, { status: 403 });
  }

  // Chặn spam: không cho tạo yêu cầu rút mới nếu đang có yêu cầu PENDING/PROCESSING chưa xử lý xong
  const pendingExisting = await prisma.withdrawal.findFirst({
    where: { userId: user.id, status: { in: ["PENDING", "PROCESSING"] } },
  });
  if (pendingExisting) {
    return NextResponse.json(
      { message: "Bạn đang có một yêu cầu rút tiền chưa xử lý xong. Vui lòng đợi hoàn tất." },
      { status: 409 }
    );
  }

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      // Cùng nguyên tắc khoá nguyên tử như task/verify: trừ tiền và kiểm
      // tra số dư đủ trong CÙNG một điều kiện where của updateMany, để hai
      // yêu cầu rút tiền gọi đồng thời không thể cùng đọc được số dư cũ và
      // cùng trừ tiền, dẫn tới số dư bị âm.
      const deduction = await tx.user.updateMany({
        where: { id: user.id, balance: { gte: amount } },
        data: {
          balance: { decrement: amount },
          pendingBalance: { increment: amount },
        },
      });
      if (deduction.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const updatedUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          method,
          destination,
          destinationName,
          status: "PENDING",
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "WITHDRAWAL",
          amount: -amount,
          balanceAfter: updatedUser.balance,
          refType: "withdrawal",
          refId: withdrawal.id,
          note: `Yêu cầu rút tiền qua ${method}`,
        },
      });

      return withdrawal;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ message: "Số dư không đủ để thực hiện yêu cầu này" }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json({ message: "Đã gửi yêu cầu rút tiền", withdrawal: result });
}
