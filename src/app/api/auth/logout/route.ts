import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearAuthCookies } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    // Thu hồi token trong DB để nó không thể dùng lại được nữa,
    // kể cả khi cookie cũ vẫn còn sót lại đâu đó phía client.
    await prisma.refreshToken.updateMany({
      where: { tokenHash: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const res = NextResponse.json({ message: "Đã đăng xuất" });
  clearAuthCookies(res);
  return res;
}
