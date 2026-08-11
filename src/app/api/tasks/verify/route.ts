import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GHI CHÚ QUAN TRỌNG VỀ BẢO MẬT / CHỐNG GIAN LẬN:
 *
 * Endpoint này hiện xác nhận hoàn thành theo kiểu "self-report" (client tự
 * báo đã xong sau khi đợi đủ thời gian) — đây là cách đơn giản để có hệ
 * thống chạy được ngay, NHƯNG không đủ an toàn cho production thật vì
 * client có thể giả lập gọi thẳng API này mà không thực sự vượt link.
 *
 * TRƯỚC KHI LÊN PRODUCTION, nên nâng cấp sang một trong hai hướng:
 *   1) Postback/webhook server-to-server: nhà cung cấp dịch vụ rút gọn link
 *      (vd: các dịch vụ kiểu Yeumoney, Link4m...) gọi ngược về một endpoint
 *      riêng (/api/tasks/webhook/[provider]) kèm chữ ký xác thực khi người
 *      dùng thực sự hoàn thành các bước trên trang rút gọn — đây là cách
 *      chuẩn và đáng tin cậy nhất.
 *   2) Nếu tự xây trang trung gian rút gọn của riêng mình, xác thực hoàn
 *      thành ngay tại server đó rồi mới gọi vào hệ thống chính.
 *
 * Endpoint dưới đây vẫn giữ nguyên các lớp phòng vệ cơ bản (thời gian tối
 * thiểu, đối chiếu IP/session, không cho verify 2 lần) để không bị bỏ trống
 * hoàn toàn trong lúc chưa tích hợp postback thật.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const sessionToken = body?.sessionToken as string | undefined;
  if (!sessionToken) return NextResponse.json({ message: "Thiếu sessionToken" }, { status: 400 });

  const completion = await prisma.taskCompletion.findUnique({
    where: { sessionToken },
    include: { task: true },
  });

  if (!completion || completion.userId !== payload.sub) {
    return NextResponse.json({ message: "Phiên nhiệm vụ không hợp lệ" }, { status: 404 });
  }
  if (completion.status !== "STARTED") {
    return NextResponse.json({ message: "Nhiệm vụ này đã được xử lý trước đó" }, { status: 409 });
  }

  const elapsedSeconds = (Date.now() - completion.startedAt.getTime()) / 1000;
  const MIN_WAIT_SECONDS = 20;
  if (elapsedSeconds < MIN_WAIT_SECONDS) {
    return NextResponse.json(
      { message: "Vui lòng hoàn thành đầy đủ các bước trước khi xác nhận" },
      { status: 400 }
    );
  }

  const currentIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (currentIp !== completion.ip) {
    // Không chặn cứng (mạng di động hay đổi IP giữa chừng), nhưng đánh dấu
    // để đội vận hành có thể rà soát nếu tỉ lệ lệch IP tăng bất thường.
    console.warn(`[fraud-watch] IP mismatch on completion ${completion.id}`);
  }

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      // updateMany với điều kiện status: "STARTED" ngay trong transaction —
      // đây là bước khoá nguyên tử (atomic) bắt buộc phải có. Nếu chỉ kiểm
      // tra status ở bước SELECT phía trên rồi mới UPDATE, hai request verify
      // gọi gần như đồng thời (double-click, replay request) đều có thể đọc
      // được status "STARTED" trước khi cái còn lại kịp commit, dẫn tới CỘNG
      // TIỀN THƯỞNG 2 LẦN cho cùng một nhiệm vụ. updateMany trả về count = 0
      // nếu đã có request khác xử lý trước, nhờ đó ta phát hiện và chặn lại.
      const lockResult = await tx.taskCompletion.updateMany({
        where: { id: completion.id, status: "STARTED" },
        data: { status: "VERIFIED", verifiedAt: new Date() },
      });
      if (lockResult.count === 0) {
        throw new Error("ALREADY_PROCESSED");
      }

      const updated = await tx.taskCompletion.findUniqueOrThrow({ where: { id: completion.id } });

      const user = await tx.user.update({
        where: { id: completion.userId },
        data: {
          balance: { increment: completion.rewardAmount },
          totalEarned: { increment: completion.rewardAmount },
        },
      });

      await tx.transaction.create({
        data: {
          userId: completion.userId,
          type: "TASK_REWARD",
          amount: completion.rewardAmount,
          balanceAfter: user.balance,
          refType: "task_completion",
          refId: completion.id,
          note: `Hoàn thành: ${completion.task.title}`,
        },
      });

      await tx.task.update({
        where: { id: completion.taskId },
        data: { completedSlots: { increment: 1 } },
      });

      // Hoa hồng giới thiệu cấp 1: người mời nhận % trên phần thưởng của
      // người được mời, cộng ngay khi nhiệm vụ được xác nhận hợp lệ.
      const REFERRAL_RATE = 0.1; // 10%
      if (user.referredById) {
        const commission = Number(completion.rewardAmount) * REFERRAL_RATE;
        if (commission > 0) {
          const referrer = await tx.user.update({
            where: { id: user.referredById },
            data: { balance: { increment: commission }, totalEarned: { increment: commission } },
          });
          await tx.referralEarning.create({
            data: {
              beneficiaryId: user.referredById,
              sourceUserId: user.id,
              level: 1,
              taskCompletionId: completion.id,
              amount: commission,
            },
          });
          await tx.transaction.create({
            data: {
              userId: user.referredById,
              type: "REFERRAL_BONUS",
              amount: commission,
              balanceAfter: referrer.balance,
              refType: "referral",
              refId: completion.id,
              note: `Hoa hồng giới thiệu từ ${user.username}`,
            },
          });
        }
      }

      return { updated, newBalance: user.balance };
    });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { message: "Nhiệm vụ này đã được xử lý trước đó" },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({
    message: "Xác nhận thành công",
    rewardAmount: result.updated.rewardAmount,
    newBalance: result.newBalance,
  });
}
