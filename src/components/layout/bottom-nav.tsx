"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    // Chỉ hiển thị dưới breakpoint lg — đối xứng với Sidebar (ẩn từ lg trở lên).
    // pb-[env(safe-area-inset-bottom)] để không bị tai thỏ/thanh gesture iOS che mất.
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-obsidian-700 bg-obsidian-900/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-champagne-500" : "text-mist-500"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
