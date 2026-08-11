import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const taskId = body?.taskId as string | undefined;
  if (!taskId) return NextResponse.json({ message: "Thiếu taskId" }, { status: 400 });

  const [user, task] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.sub } }),
    prisma.task.findUnique({ where: { id: taskId } }),
  ]);

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ message: "Tài khoản không khả dụng" }, { status: 403 });
  }
  if (!task || task.status !== "ACTIVE") {
    return NextResponse.json({ message: "Nhiệm vụ không tồn tại hoặc đã kết thúc" }, { status: 404 });
  }
  if (task.endAt && task.endAt < new Date()) {
    return NextResponse.json({ message: "Nhiệm vụ đã hết hạn" }, { status: 410 });
  }
  if (task.totalSlots !== null && task.completedSlots >= task.totalSlots) {
    return NextResponse.json({ message: "Nhiệm vụ đã hết lượt" }, { status: 410 });
  }

  // Điều kiện chống bot: tài khoản phải đủ "tuổi" tối thiểu
  const accountAgeHours = (Date.now() - user.createdAt.getTime()) / 3_600_000;
  if (accountAgeHours < task.minAccountAgeHours) {
    return NextResponse.json(
      { message: "Tài khoản của bạn chưa đủ điều kiện để làm nhiệm vụ này" },
      { status: 403 }
    );
  }

  // Kiểm tra giới hạn lượt/ngày cho user này với nhiệm vụ này
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const doneToday = await prisma.taskCompletion.count({
    where: {
      userId: user.id,
      taskId: task.id,
      status: { in: ["VERIFIED", "STARTED"] },
      startedAt: { gte: startOfDay },
    },
  });
  if (doneToday >= task.dailyLimitPerUser) {
    return NextResponse.json(
      { message: "Bạn đã đạt giới hạn lượt làm nhiệm vụ này hôm nay" },
      { status: 429 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const completion = await prisma.taskCompletion.create({
    data: {
      taskId: task.id,
      userId: user.id,
      sessionToken: nanoid(32),
      rewardAmount: task.rewardAmount,
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
      status: "STARTED",
    },
  });

  return NextResponse.json({
    sessionToken: completion.sessionToken,
    destinationUrl: task.destinationUrl,
    // Thời gian tối thiểu (giây) trước khi cho phép xác nhận hoàn thành —
    // chặn trường hợp bot gọi verify ngay lập tức mà chưa thực sự vượt link.
    minWaitSeconds: 20,
  });
}
