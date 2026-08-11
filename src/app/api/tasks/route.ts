import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

  const tasks = await prisma.task.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ endAt: null }, { endAt: { gt: new Date() } }],
    },
    orderBy: { rewardAmount: "desc" },
  });

  const completions = await prisma.taskCompletion.findMany({
    where: {
      userId: payload.sub,
      startedAt: { gte: startOfDay },
      status: { in: ["VERIFIED", "STARTED"] },
    },
    select: { taskId: true },
  });
  const doneCountByTask = completions.reduce<Record<string, number>>((acc, c) => {
    acc[c.taskId] = (acc[c.taskId] ?? 0) + 1;
    return acc;
  }, {});

  const result = tasks
    .filter((t) => t.totalSlots === null || t.completedSlots < t.totalSlots)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      rewardAmount: t.rewardAmount,
      dailyLimitPerUser: t.dailyLimitPerUser,
      completedToday: doneCountByTask[t.id] ?? 0,
      exhausted: (doneCountByTask[t.id] ?? 0) >= t.dailyLimitPerUser,
    }));

  return NextResponse.json({ tasks: result });
}
