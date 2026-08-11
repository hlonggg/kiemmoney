"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar({ username, role }: { username: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "ADMIN" || role === "MODERATOR";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    // Ẩn hoàn toàn dưới breakpoint lg — trên mobile điều hướng chuyển
    // sang BottomNav, tránh việc 2 hệ thống điều hướng cùng hiển thị
    // (dư thừa giao diện) trên màn hình nhỏ.
    <aside className="hidden w-64 shrink-0 flex-col border-r border-obsidian-700 bg-obsidian-900 lg:flex">
      <div className="px-6 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-obsidian-700 text-champagne-500"
                  : "text-mist-400 hover:bg-obsidian-800 hover:text-mist-100"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-obsidian-700 p-3">
        {isAdmin && (
          <Link
            href="/admin"
            className="mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-champagne-500 hover:bg-obsidian-800"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Chuyển sang Admin
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-obsidian-950">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <span className="flex-1 truncate text-sm text-mist-300">{username}</span>
          <button
            onClick={handleLogout}
            aria-label="Đăng xuất"
            className="text-mist-500 hover:text-ruby"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
