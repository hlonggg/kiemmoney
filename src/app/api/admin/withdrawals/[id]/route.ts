import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "COMPLETE", "REJECT"]),
  adminNote: z.string().max(500).optional(),
});

/**
 * Luồng trạng thái hợp lệ của một yêu cầu rút tiền:
 *   PENDING --APPROVE--> APPROVED --COMPLETE--> COMPLETED
 *   PENDING --REJECT--> REJECTED (hoàn tiền về balance)
 *   APPROVED --REJECT--> REJECTED (hoàn tiền về balance — trường hợp
 *     admin đã duyệt nhưng phát hiện vấn đề trước khi thực chuyển tiền)
 * Không cho phép REJECT sau khi đã COMPLETED — tiền đã thực sự rời hệ
 * thống, việc "từ chối" lúc này phải xử lý thủ công qua nghiệp vụ khác.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { action, adminNote } = parsed.data;

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: params.id } });
  if (!withdrawal) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu rút tiền" }, { status: 404 });
  }

  // Kiểm tra chuyển trạng thái hợp lệ TRƯỚC khi vào transaction — tránh
  // để lọt các bước nhảy trạng thái vô lý (vd COMPLETE một cái đã REJECTED).
  const validTransitions: Record<string, string[]> = {
    APPROVE: ["PENDING"],
    COMPLETE: ["APPROVED", "PROCESSING"],
    REJECT: ["PENDING", "APPROVED", "PROCESSING"],
  };
  if (!validTransitions[action].includes(withdrawal.status)) {
    return NextResponse.json(
      { message: `Không thể thực hiện hành động này khi yêu cầu đang ở trạng thái ${withdrawal.status}` },
      { status: 409 }
    );
  }

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      if (action === "APPROVE") {
        const updated = await tx.withdrawal.updateMany({
          where: { id: withdrawal.id, status: "PENDING" },
          data: { status: "APPROVED", adminNote, processedById: admin.sub },
        });
        if (updated.count === 0) throw new Error("STALE_STATUS");
        return { status: "APPROVED" };
      }

      if (action === "COMPLETE") {
        const updated = await tx.withdrawal.updateMany({
          where: { id: withdrawal.id, status: withdrawal.status },
          data: { status: "COMPLETED", adminNote, processedById: admin.sub, processedAt: new Date() },
        });
        if (updated.count === 0) throw new Error("STALE_STATUS");

        // Tiền đã thực sự rời khỏi hệ thống (admin xác nhận đã chuyển
        // khoản thủ công) — trừ khỏi pendingBalance, KHÔNG động vào
        // balance vì số đó đã được trừ ngay lúc user tạo yêu cầu.
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { pendingBalance: { decrement: withdrawal.amount } },
        });
        return { status: "COMPLETED" };
      }

      // action === "REJECT": hoàn tiền lại cho user
      const updated = await tx.withdrawal.updateMany({
        where: { id: withdrawal.id, status: withdrawal.status },
        data: { status: "REJECTED", adminNote, processedById: admin.sub, processedAt: new Date() },
      });
      if (updated.count === 0) throw new Error("STALE_STATUS");

      const user = await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amount },
          pendingBalance: { decrement: withdrawal.amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: "WITHDRAWAL_REFUND",
          amount: withdrawal.amount,
          balanceAfter: user.balance,
          refType: "withdrawal",
          refId: withdrawal.id,
          note: adminNote ? `Hoàn tiền: ${adminNote}` : "Yêu cầu rút tiền bị từ chối",
        },
      });

      return { status: "REJECTED" };
    });
  } catch (err) {
    if (err instanceof Error && err.message === "STALE_STATUS") {
      return NextResponse.json(
        { message: "Trạng thái yêu cầu đã thay đổi, vui lòng tải lại trang" },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({ message: "Đã cập nhật", status: result.status });
}
