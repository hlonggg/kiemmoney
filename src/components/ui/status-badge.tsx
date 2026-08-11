import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  // Rút tiền
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  PROCESSING: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald border-emerald-500/20",
  REJECTED: "bg-ruby/10 text-ruby border-ruby/20",
  // Ticket hỗ trợ
  OPEN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_PROGRESS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald border-emerald-500/20",
  CLOSED: "bg-obsidian-600 text-mist-400 border-obsidian-500",
};

const LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  OPEN: "Đang mở",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "border-obsidian-500 bg-obsidian-700 text-mist-400"
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
