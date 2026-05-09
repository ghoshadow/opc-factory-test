import { cn } from "@/lib/utils";
import { LineStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: LineStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "NOMINAL"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "NOMINAL" ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      {status}
    </span>
  );
}
