import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { z } from "zod";

const messageSchema = z.object({
  body: z.string().min(1, "Vui lòng nhập nội dung").max(2000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket || ticket.userId !== payload.sub) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu hỗ trợ" }, { status: 404 });
  }
  if (ticket.status === "CLOSED") {
    return NextResponse.json(
      { message: "Yêu cầu hỗ trợ này đã được đóng. Vui lòng tạo yêu cầu mới nếu cần hỗ trợ thêm." },
      { status: 409 }
    );
  }

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: { ticketId: ticket.id, authorId: payload.sub, isStaff: false, body: parsed.data.body },
    }),
    // Khi user tự trả lời thêm, đưa ticket từ RESOLVED quay lại OPEN để
    // đội hỗ trợ biết cần xem lại — tránh trường hợp câu hỏi tiếp theo
    // bị bỏ sót vì ticket tưởng đã xong.
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: ticket.status === "RESOLVED" ? "OPEN" : ticket.status },
    }),
  ]);

  return NextResponse.json({ message: "Đã gửi", ticketMessage: message });
}
