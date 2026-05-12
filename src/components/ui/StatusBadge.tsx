"use client";

import { cn } from "@/lib/utils";

type Status = "NOMINAL" | "ATTENTION" | "BLOCKED" | "healthy" | "degraded" | "blocked" | "idle"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<
  Status,
  { label: string; dotColor: string; textColor: string; bg: string }
> = {
  NOMINAL: {
    label: "Nominal",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  ATTENTION: {
    label: "Attention",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  BLOCKED: {
    label: "Blocked",
    dotColor: "bg-red-500",
    textColor: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  healthy: {
    label: "正常",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  degraded: {
    label: "降级",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  blocked: {
    label: "阻塞",
    dotColor: "bg-red-500",
    textColor: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  idle: {
    label: "空闲",
    dotColor: "bg-gray-500",
    textColor: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/40",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.textColor,
        cfg.bg,
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className={cn("absolute inset-0 rounded-full", cfg.dotColor)} />
        <span
          className={cn("absolute inset-0 animate-ping rounded-full opacity-75", cfg.dotColor)}
        />
      </span>
      {cfg.label}
    </span>
  );
}
