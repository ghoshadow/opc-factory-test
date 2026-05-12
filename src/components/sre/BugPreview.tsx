"use client";

import { AlertTriangle, Bug, Target } from "lucide-react";

import type { BugPreview as BugPreviewType, IncidentSeverity } from "@/types/factory";

const severityColor: Record<IncidentSeverity, string> = {
  P0: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10",
  P1: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10",
  P2: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10",
  P3: "border-border bg-muted/30",
};

const severityBadge: Record<IncidentSeverity, string> = {
  P0: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
  P1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  P2: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  P3: "bg-muted text-muted-foreground border-border",
};

interface BugPreviewProps {
  bug: BugPreviewType;
}

export function BugPreview({ bug }: BugPreviewProps) {
  return (
    <div className={`rounded-xl border shadow-sm ${severityColor[bug.severity]}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-full p-1.5 bg-purple-50 dark:bg-purple-950/30">
            <Bug className="size-4 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold">{bug.title}</h4>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold border ${severityBadge[bug.severity]}`}
              >
                {bug.severity}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Target className="size-3" />
                {bug.module}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">{bug.description}</p>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20 rounded-b-xl">
        <p className="text-xs text-muted-foreground">
          回流后将自动在 Intake 创建此 Bug 工单，进入需求队列
        </p>
      </div>
    </div>
  );
}
