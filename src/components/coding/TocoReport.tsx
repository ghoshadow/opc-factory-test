"use client";

import { AlertTriangle, BarChart3, Bug, FileCode2, GitBranch, Hash, Info, Zap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { TocoFinding, TocoReportData, TocoSeverity } from "@/types/factory";

const severityConfig: Record<
  TocoSeverity,
  { icon: typeof AlertTriangle; label: string; rowClass: string; badgeClass: string }
> = {
  critical: {
    icon: Bug,
    label: "严重",
    rowClass: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  major: {
    icon: AlertTriangle,
    label: "重要",
    rowClass: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  minor: {
    icon: Info,
    label: "建议",
    rowClass: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  info: {
    icon: Info,
    label: "信息",
    rowClass: "border-border",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

function FindingRow({ finding }: { finding: TocoFinding }) {
  const cfg = severityConfig[finding.severity];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${cfg.rowClass}`}>
      <div className={`mt-0.5 shrink-0 rounded-full p-1 ${cfg.badgeClass}`}>
        <Icon className="size-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium">{finding.title}</span>
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
          >
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">{finding.category}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{finding.description}</p>
        <p className="text-xs font-mono text-muted-foreground/60 mt-1">{finding.lineRef}</p>
      </div>
    </div>
  );
}

export function TocoReport({ data, isLoading }: { data?: TocoReportData; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Zap className="size-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无 TocoAgent 分析报告</p>
        </div>
      </div>
    );
  }

  const { metrics, findings } = data;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">TocoAgent 报告</h3>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <FileCode2 className="size-3" />
            总行数
          </div>
          <p className="text-lg font-semibold tabular-nums">
            {metrics.totalLines.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <GitBranch className="size-3" />
            变更行数
          </div>
          <p className="text-lg font-semibold tabular-nums text-amber-600">
            +{metrics.changedLines}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <BarChart3 className="size-3" />
            文件变更
          </div>
          <p className="text-lg font-semibold tabular-nums">{metrics.filesChanged}</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Hash className="size-3" />
            复杂度Δ
          </div>
          <p
            className={`text-lg font-semibold tabular-nums ${metrics.complexityDelta <= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {metrics.complexityDelta > 0 ? "+" : ""}
            {metrics.complexityDelta}
          </p>
        </div>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">发现 {findings.length} 个问题</p>
          {findings.map((f) => (
            <FindingRow key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}
