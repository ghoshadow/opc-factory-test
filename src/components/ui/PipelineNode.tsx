"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type PipelineStatus = "waiting" | "running" | "done" | "failed"

interface PipelineNodeProps {
  label: string
  status?: PipelineStatus
  isActive?: boolean
  className?: string
}

const statusConfig: Record<PipelineStatus, { dotColor: string; borderColor: string; bg: string; icon: React.ReactNode }> = {
  waiting: {
    dotColor: "bg-muted-foreground/40",
    borderColor: "border-muted-foreground/20",
    bg: "bg-muted/50",
    icon: null,
  },
  running: {
    dotColor: "bg-blue-500",
    borderColor: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: null,
  },
  done: {
    dotColor: "bg-emerald-500",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: <Check className="size-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />,
  },
  failed: {
    dotColor: "bg-red-500",
    borderColor: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: <X className="size-3 text-red-600 dark:text-red-400" strokeWidth={3} />,
  },
}

export function PipelineNode({ label, status = "waiting", isActive, className }: PipelineNodeProps) {
  const cfg = statusConfig[status]

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-lg border-2 px-4 py-3 text-center transition-colors",
        cfg.borderColor,
        cfg.bg,
        isActive && "ring-2 ring-ring ring-offset-2",
        status === "running" && "animate-pulse",
        className,
      )}
    >
      <span className={cn("mb-1.5 size-2.5 rounded-full", cfg.dotColor)} />
      <span className="text-xs font-medium">{label}</span>
      {cfg.icon && (
        <span className="mt-1">{cfg.icon}</span>
      )}
      {isActive && (
        <span className="absolute -bottom-2 rounded-full bg-primary px-2 py-px text-[10px] font-semibold text-primary-foreground">
          Active
        </span>
      )}
    </div>
  )
}
