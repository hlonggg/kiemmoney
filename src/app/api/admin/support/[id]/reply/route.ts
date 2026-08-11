import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const replySchema = z.object({
  body: z.string().min(1, "Vui lòng nhập nội dung").max(2000),
  // Admin có thể vừa trả lời vừa đổi trạng thái ticket luôn trong 1 lần
  // gửi (vd trả lời xong đánh dấu RESOLVED) — tiện cho thao tác thực tế,
  // tránh phải bấm 2 lần.
  resolveAfterReply: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu hỗ trợ" }, { status: 404 });
  }

  const nextStatus = parsed.data.resolveAfterReply ? "RESOLVED" : "IN_PROGRESS";

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: { ticketId: ticket.id, authorId: admin.sub, isStaff: true, body: parsed.data.body },
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: nextStatus },
    }),
  ]);

  return NextResponse.json({ message: "Đã gửi phản hồi", ticketMessage: message });
}
