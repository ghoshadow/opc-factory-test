"use client";

import {
  AlertTriangle,
  Check,
  Clock,
  FileText,
  GitPullRequest,
  Search,
  Shield,
  X,
} from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CodingOpsResponse, DesignReviewItem, PlanReviewItem } from "@/types/factory";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const reviewStatusConfig = {
  pass: { icon: Check, label: "通过", className: "text-emerald-500" },
  fail: { icon: X, label: "未通过", className: "text-red-500" },
  warning: { icon: AlertTriangle, label: "警告", className: "text-amber-500" },
  pending: { icon: Clock, label: "待评审", className: "text-muted-foreground" },
};

const severityConfig = {
  critical: {
    bg: "bg-red-100 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    label: "Critical",
  },
  major: {
    bg: "bg-orange-100 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-400",
    label: "Major",
  },
  minor: {
    bg: "bg-amber-100 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    label: "Minor",
  },
  info: { bg: "bg-muted", text: "text-muted-foreground", label: "Info" },
};

function ReviewItemRow({ item }: { item: PlanReviewItem | DesignReviewItem }) {
  const cfg = reviewStatusConfig[item.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <Icon className={cn("size-4 shrink-0", cfg.className)} />
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
        <span className="col-span-4 text-sm font-medium truncate">{item.name}</span>
        <span className="col-span-5 text-xs text-muted-foreground truncate">{item.detail}</span>
        <span className="col-span-3 text-xs text-muted-foreground truncate">
          {item.description}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium shrink-0",
          item.status === "pass"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : item.status === "fail"
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
              : item.status === "warning"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "bg-muted text-muted-foreground",
        )}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export function ReviewerPanel() {
  const { data, error, isLoading } = useSWR<CodingOpsResponse>("/api/v1/coding/ops", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Review 数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  const planPassCount = data.planReview.filter((i) => i.status === "pass").length;
  const designPassCount = data.designReview.filter((i) => i.status === "pass").length;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Reviewer 看板</h2>
            <p className="text-xs text-muted-foreground">计划评审 · 设计评审 · Toco 代码分析</p>
          </div>
        </div>
      </div>

      {/* Plan Review Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">计划评审</h3>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {planPassCount}/{data.planReview.length} 通过
          </span>
        </div>
        <div className="space-y-1.5">
          {data.planReview.map((item) => (
            <ReviewItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Design Review Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">设计评审</h3>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {designPassCount}/{data.designReview.length} 通过
          </span>
        </div>
        <div className="space-y-1.5">
          {data.designReview.map((item) => (
            <ReviewItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Toco Report Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Toco 代码分析</h3>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {data.tocoReport.metrics.filesChanged} 文件 · {data.tocoReport.metrics.changedLines}{" "}
            行变更
          </span>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">总行数</p>
            <p className="text-lg font-bold tabular-nums">{data.tocoReport.metrics.totalLines}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">变更行数</p>
            <p className="text-lg font-bold tabular-nums text-blue-600">
              {data.tocoReport.metrics.changedLines}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">文件数</p>
            <p className="text-lg font-bold tabular-nums">{data.tocoReport.metrics.filesChanged}</p>
          </div>
          <div
            className={cn(
              "rounded-lg border p-3 text-center",
              data.tocoReport.metrics.complexityDelta > 0
                ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10"
                : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/10",
            )}
          >
            <p className="text-xs text-muted-foreground">复杂度变化</p>
            <p
              className={cn(
                "text-lg font-bold tabular-nums",
                data.tocoReport.metrics.complexityDelta > 0 ? "text-red-600" : "text-emerald-600",
              )}
            >
              {data.tocoReport.metrics.complexityDelta > 0 ? "+" : ""}
              {data.tocoReport.metrics.complexityDelta}
            </p>
          </div>
        </div>

        {/* Findings */}
        {data.tocoReport.findings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              发现项 ({data.tocoReport.findings.length})
            </p>
            {data.tocoReport.findings.map((finding) => {
              const sev = severityConfig[finding.severity];
              return (
                <div
                  key={finding.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 mt-0.5",
                      sev.bg,
                      sev.text,
                    )}
                  >
                    {sev.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{finding.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{finding.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                      {finding.lineRef}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {finding.category}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
