import { Wallet, LifeBuoy, type LucideIcon } from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Nguồn duy nhất cho điều hướng admin — dùng chung giữa AdminSidebar
// (desktop) và AdminBottomNav (mobile), cùng nguyên tắc với NAV_ITEMS
// của khu vực người dùng ở đợt 2.
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/withdrawals", label: "Duyệt rút tiền", icon: Wallet },
  { href: "/admin/support", label: "Yêu cầu hỗ trợ", icon: LifeBuoy },
];
