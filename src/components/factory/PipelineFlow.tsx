"use client";

import { ArrowRight, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

import { PipelineNode } from "@/components/ui/PipelineNode";
import { cn } from "@/lib/utils";
import type { PipelineNodeStatus, PipelineStageNode } from "@/types/factory";

interface PipelineFlowProps {
  nodes: PipelineStageNode[];
  className?: string;
}

const statusIconMap: Record<PipelineNodeStatus, typeof CheckCircle2> = {
  done: CheckCircle2,
  running: Loader2,
  waiting: Circle,
  failed: XCircle,
};

const statusIconClass: Record<PipelineNodeStatus, string> = {
  done: "text-emerald-500",
  running: "text-blue-500 animate-spin",
  waiting: "text-muted-foreground/40",
  failed: "text-red-500",
};

const statusLabelMap: Record<PipelineNodeStatus, string> = {
  done: "已完成",
  running: "运行中",
  waiting: "等待中",
  failed: "失败",
};

function PipelineFlow({ nodes, className }: PipelineFlowProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 text-center">
        <p className="text-sm text-muted-foreground">暂无流水线节点数据</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card shadow-sm p-6", className)}>
      {/* Pipeline flow visualization */}
      <div className="flex flex-wrap items-center justify-center gap-0">
        {nodes.map((node, index) => {
          const StatusIcon = statusIconMap[node.status];
          const iconCls = statusIconClass[node.status];

          return (
            <div key={node.id} className="flex items-center">
              {/* Node card */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <StatusIcon className={cn("size-3.5", iconCls)} />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {statusLabelMap[node.status]}
                  </span>
                </div>
                <PipelineNode
                  label={node.label}
                  status={node.status}
                  isActive={node.status === "running"}
                />
              </div>

              {/* Connector arrow between nodes */}
              {index < nodes.length - 1 && (
                <div className="flex items-center mx-1">
                  <ArrowRight className="size-4 text-muted-foreground/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Node detail cards */}
      <div className="mt-8 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          节点详情
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {nodes.map((node) => {
            const StatusIcon = statusIconMap[node.status];
            const iconCls = statusIconClass[node.status];

            return (
              <div
                key={node.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  node.status === "running" &&
                    "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
                  node.status === "done" &&
                    "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
                  node.status === "failed" &&
                    "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
                  node.status === "waiting" && "bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className={cn("size-4 shrink-0", iconCls)} />
                  <span className="text-sm font-semibold">{node.label}</span>
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-medium rounded-full px-2 py-0.5",
                      node.status === "done" &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                      node.status === "running" &&
                        "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
                      node.status === "failed" &&
                        "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                      node.status === "waiting" &&
                        "bg-gray-100 text-gray-500 dark:bg-gray-900/40 dark:text-gray-500",
                    )}
                  >
                    {statusLabelMap[node.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                <ul className="space-y-1">
                  {node.details.map((detail, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="mt-0.5 size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { PipelineFlow };
