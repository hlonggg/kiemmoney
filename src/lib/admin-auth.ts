import { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth";

/**
 * Dùng ở ĐẦU mỗi route handler trong /api/admin/*. Trả về null nếu chưa
 * đăng nhập hoặc không có quyền ADMIN/MODERATOR — route gọi hàm này phải
 * tự trả về 403 khi nhận null, KHÔNG được tiếp tục xử lý.
 */
export async function requireAdmin(req: NextRequest): Promise<AccessTokenPayload | null> {
  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) return null;
  if (payload.role !== "ADMIN" && payload.role !== "MODERATOR") return null;
  return payload;
}
