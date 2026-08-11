import { LayoutDashboard, ListChecks, Users, Wallet, LifeBuoy, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Nhãn ngắn dùng cho bottom nav mobile (không đủ chỗ cho nhãn dài)
  shortLabel?: string;
}

// NGUỒN DUY NHẤT cho điều hướng — Sidebar (desktop/tablet) và BottomNav
// (mobile) đều đọc từ đây. Thêm/sửa mục nào chỉ cần sửa ở 1 chỗ này,
// tránh tình trạng 2 phiên bản giao diện bị lệch nhau theo thời gian.
export const NAV_ITEMS: NavItem[] = [
  { href: "/home/dashboard", label: "Tổng quan", shortLabel: "Tổng quan", icon: LayoutDashboard },
  { href: "/home/tasks", label: "Nhiệm vụ", shortLabel: "Nhiệm vụ", icon: ListChecks },
  { href: "/home/referral", label: "Mời bạn bè", shortLabel: "Mời bạn", icon: Users },
  { href: "/home/withdraw", label: "Rút tiền", shortLabel: "Rút tiền", icon: Wallet },
  { href: "/home/support", label: "Hỗ trợ", shortLabel: "Hỗ trợ", icon: LifeBuoy },
];
