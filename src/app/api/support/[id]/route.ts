import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true } } },
      },
    },
  });

  // Kiểm tra quyền sở hữu: user chỉ được xem ticket của chính mình,
  // KHÔNG được đoán ID ticket của người khác để xem trộm nội dung.
  if (!ticket || ticket.userId !== payload.sub) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu hỗ trợ" }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}
