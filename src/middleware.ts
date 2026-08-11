import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

// Các route công khai — không cần đăng nhập
const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const payload = accessToken ? await verifyAccessToken(accessToken) : null;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = pathname.startsWith("/admin");

  // Chưa đăng nhập mà vào trang cần bảo vệ → đá về /login
  if (!isPublicPath && !payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Khu vực /admin: bắt buộc phải có role ADMIN hoặc MODERATOR — user
  // thường đã đăng nhập nhưng cố vào /admin sẽ bị đá về dashboard của họ,
  // KHÔNG trả lỗi 403 chi tiết để tránh lộ thông tin cấu trúc hệ thống.
  if (isAdminPath && payload && payload.role !== "ADMIN" && payload.role !== "MODERATOR") {
    return NextResponse.redirect(new URL("/home/dashboard", req.url));
  }

  // Đã đăng nhập mà cố vào lại /login hoặc /register → đá thẳng vào dashboard
  if (isPublicPath && payload) {
    return NextResponse.redirect(new URL("/home/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Áp dụng middleware cho mọi route TRỪ:
     * - api routes tự xử lý auth riêng
     * - static files, images, favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
