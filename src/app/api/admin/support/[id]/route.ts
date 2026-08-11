import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { username: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true } } },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu hỗ trợ" }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) {
    return NextResponse.json({ message: "Không tìm thấy yêu cầu hỗ trợ" }, { status: 404 });
  }

  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ message: "Đã cập nhật trạng thái" });
}
