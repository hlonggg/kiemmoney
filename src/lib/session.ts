import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Dùng trong Server Components / Route Handlers để lấy user hiện tại.
 * Middleware đã đảm bảo request tới đây luôn có access_token hợp lệ
 * (route trong (dashboard) đều bị chặn nếu chưa đăng nhập), nhưng ta
 * vẫn kiểm tra lại ở đây — không bao giờ tin tưởng tuyệt đối 1 lớp duy nhất.
 */
export async function getCurrentUser() {
  const token = cookies().get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      balance: true,
      pendingBalance: true,
      totalEarned: true,
      referralCode: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Dùng riêng cho khu vực /admin. Trả về null nếu chưa đăng nhập HOẶC
 * không có quyền ADMIN/MODERATOR — layout admin sẽ redirect nếu null.
 * Đây là lớp phòng vệ thứ 2 sau middleware (defense-in-depth): nếu sau
 * này ai đó sửa middleware mà quên cập nhật, trang admin vẫn an toàn.
 */
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") return null;
  return user;
}
