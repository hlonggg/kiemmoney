import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  // Lớp phòng vệ thứ 2 (sau middleware) — cả user thường lẫn chưa đăng
  // nhập đều bị đá về trang phù hợp, không có thông báo "không đủ quyền"
  // chi tiết để tránh lộ cấu trúc hệ thống cho người dò URL /admin.
  if (!admin) redirect("/home/dashboard");

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <AdminSidebar username={admin.username} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-obsidian-700 bg-obsidian-950/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <h1 className="font-display text-lg font-semibold text-mist-100">Bảng điều khiển Admin</h1>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
