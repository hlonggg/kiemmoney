"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-items";

export function Topbar({ balance }: { balance: number }) {
  const pathname = usePathname();
  // Suy ra tiêu đề trang từ NAV_ITEMS (nguồn duy nhất) thay vì mỗi page tự
  // truyền title riêng — đảm bảo Topbar luôn khớp với mục đang active ở
  // Sidebar/BottomNav, không thể bị lệch nhau.
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-obsidian-700 bg-obsidian-950/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <h1 className="font-display text-lg font-semibold text-mist-100">
        {current?.label ?? "LinkEarn"}
      </h1>

      <Link
        href="/home/withdraw"
        className="flex items-center gap-2 rounded-full border border-obsidian-600 bg-obsidian-800 px-3.5 py-1.5 transition-colors hover:border-champagne-600"
      >
        <Wallet className="h-4 w-4 text-champagne-500" />
        <span className="font-display text-sm font-semibold text-mist-100">
          {formatVND(balance)}
        </span>
      </Link>
    </header>
  );
}
