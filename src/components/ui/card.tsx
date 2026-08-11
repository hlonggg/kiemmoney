import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-obsidian-700 bg-obsidian-800/60 shadow-panel backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
