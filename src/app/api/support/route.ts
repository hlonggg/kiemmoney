import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(150),
  category: z.enum(["WITHDRAW_ISSUE", "TASK_ISSUE", "ACCOUNT_ISSUE", "OTHER"]),
  message: z.string().min(10, "Nội dung tối thiểu 10 ký tự").max(2000),
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: payload.sub },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ message: "Dữ liệu không hợp lệ", fieldErrors }, { status: 400 });
  }

  const { subject, category, message } = parsed.data;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: payload.sub,
      subject,
      category,
      status: "OPEN",
      messages: {
        create: { authorId: payload.sub, isStaff: false, body: message },
      },
    },
  });

  return NextResponse.json({ message: "Đã gửi yêu cầu hỗ trợ", ticket });
}
