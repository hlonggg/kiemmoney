import { cn } from "@/lib/utils";

/**
 * Signature mark: một dấu ngoặc kim cương lệch tâm — gợi liên tưởng tới
 * một liên kết (link) được "bẻ góc", đồng thời gợi hình viên đá quý.
 * Đây là yếu tố thị giác riêng biệt của thương hiệu, lặp lại nhất quán
 * ở mọi màn hình thay vì dùng icon generic.
 */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M14 1L26 14L14 27L2 14L14 1Z"
          stroke="url(#lg)"
          strokeWidth="1.5"
        />
        <path d="M14 8L19 14L14 20L9 14L14 8Z" fill="url(#lg)" />
        <defs>
          <linearGradient id="lg" x1="2" y1="1" x2="26" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E4C989" />
            <stop offset="1" stopColor="#8F7136" />
          </linearGradient>
        </defs>
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-mist-100">
          Link<span className="text-champagne-500">Earn</span>
        </span>
      )}
    </div>
  );
}
