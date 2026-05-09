"use client"

import { cn } from "@/lib/utils"
import type { PipelineNodeStatus } from "@/lib/constants/pipeline-nodes"
import { ChevronRight } from "lucide-react"

export interface PipelineFlowNode {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  status: PipelineNodeStatus
}

interface PipelineFlowProps {
  nodes: PipelineFlowNode[]
  activeNodeId?: string
  className?: string
}

const statusConfig: Record<
  PipelineNodeStatus,
  { dotColor: string; borderColor: string; bg: string }
> = {
  waiting: {
    dotColor: "bg-muted-foreground/40",
    borderColor: "border-muted-foreground/20",
    bg: "bg-muted/50",
  },
  running: {
    dotColor: "bg-blue-500 animate-pulse",
    borderColor: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  done: {
    dotColor: "bg-emerald-500",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  failed: {
    dotColor: "bg-red-500",
    borderColor: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
}

export function PipelineFlow({ nodes, activeNodeId, className }: PipelineFlowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-0", className)}>
      {nodes.map((node, idx) => {
        const cfg = statusConfig[node.status]
        const isActive = node.id === activeNodeId

        return (
          <div key={node.id} className="flex items-center">
            <div
              className={cn(
                "relative flex flex-col items-center rounded-lg border-2 px-3 py-3 text-center transition-all min-w-[100px]",
                cfg.borderColor,
                cfg.bg,
                isActive && "ring-2 ring-primary ring-offset-2 scale-105",
              )}
            >
              <node.icon
                className={cn(
                  "mb-1 h-4 w-4",
                  node.status === "done"
                    ? "text-emerald-500"
                    : node.status === "running"
                      ? "text-blue-500"
                      : node.status === "failed"
                        ? "text-red-500"
                        : "text-muted-foreground/50",
                )}
              />
              <span
                className={cn(
                  "mb-1 size-2 rounded-full",
                  cfg.dotColor,
                )}
              />
              <span className="text-[11px] font-medium leading-tight">{node.label}</span>
              {isActive && (
                <span className="absolute -bottom-2 rounded-full bg-primary px-2 py-px text-[10px] font-semibold text-primary-foreground">
                  Active
                </span>
              )}
            </div>
            {idx < nodes.length - 1 && (
              <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-muted-foreground/30" />
            )}
          </div>
        );
      })}
    </div>
  )
}
