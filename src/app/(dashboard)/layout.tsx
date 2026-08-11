import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Phòng vệ thêm ở lớp Server Component, không chỉ dựa vào middleware —
  // nếu token hợp lệ nhưng user đã bị xoá khỏi DB, vẫn phải chặn lại.
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-obsidian-950">
      <Sidebar username={user.username} role={user.role} />

      {/* pb-20 chừa chỗ cho BottomNav trên mobile, lg:pb-0 vì desktop không có BottomNav */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <Topbar balance={Number(user.balance)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
