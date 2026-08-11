import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist-400">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accent ? "bg-gold-gradient" : "bg-obsidian-700"
          )}
        >
          <Icon className={cn("h-[18px] w-[18px]", accent ? "text-obsidian-950" : "text-mist-300")} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-mist-100">{value}</p>
    </Card>
  );
}
