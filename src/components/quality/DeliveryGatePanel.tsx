"use client";

import { AlertTriangle, Check, Clock, Play, Shield, X } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DeliveryGateItem, DeliveryGateResponse, GateItemStatus } from "@/types/factory";

const fetcher = (url: string): Promise<DeliveryGateResponse> =>
  fetch(url).then((res) => res.json());

const statusConfig: Record<
  GateItemStatus,
  { icon: typeof Check; label: string; dotColor: string; badgeClass: string }
> = {
  pass: {
    icon: Check,
    label: "通过",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  fail: {
    icon: X,
    label: "未通过",
    dotColor: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  waiting: {
    icon: Clock,
    label: "等待中",
    dotColor: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground",
  },
  running: {
    icon: Play,
    label: "执行中",
    dotColor: "bg-blue-500 animate-pulse",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    label: "警告",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
};

function GateRow({ item }: { item: DeliveryGateItem }) {
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
      <span className={cn("size-2 rounded-full shrink-0", cfg.dotColor)} />
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
        <span className="col-span-2 text-xs font-medium text-muted-foreground">
          {item.lineLabel}
        </span>
        <span className="col-span-3 text-sm font-medium truncate">{item.name}</span>
        <span className="col-span-3 text-xs text-muted-foreground truncate">
          {item.description}
        </span>
        <span className="col-span-3 text-xs text-muted-foreground truncate">{item.detail}</span>
        <span
          className={cn(
            "col-span-1 inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium",
            cfg.badgeClass,
          )}
        >
          <Icon className="size-3 mr-1" />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

export function DeliveryGatePanel() {
  const { data, error, isLoading } = useSWR<DeliveryGateResponse>(
    "/api/v1/quality/delivery-gate",
    fetcher,
    { refreshInterval: 30000 },
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取交付门禁数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Group by line
  const lines = [
    {
      id: "requirement",
      label: "需求产线",
      items: data.items.filter((i) => i.line === "requirement"),
    },
    { id: "coding", label: "编码产线", items: data.items.filter((i) => i.line === "coding") },
    { id: "testing", label: "测试产线", items: data.items.filter((i) => i.line === "testing") },
    { id: "sre", label: "SRE 产线", items: data.items.filter((i) => i.line === "sre") },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">交付门禁总览</h2>
            <p className="text-xs text-muted-foreground">四产线 · {data.items.length} 项检查</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">
            {Math.round(data.passRate * 100)}%
          </span>
          <span className="text-xs text-muted-foreground">通过率</span>
        </div>
      </div>

      {/* Line summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {lines.map((line) => {
          const linePassCount = line.items.filter((i) => i.status === "pass").length;
          const lineFailCount = line.items.filter((i) => i.status === "fail").length;
          const hasFailed = lineFailCount > 0;
          return (
            <div
              key={line.id}
              className={cn(
                "rounded-lg border p-3 text-center",
                hasFailed
                  ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10"
                  : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/10",
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">{line.label}</p>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums mt-0.5",
                  hasFailed ? "text-red-600" : "text-emerald-600",
                )}
              >
                {linePassCount}/{line.items.length}
              </p>
              {lineFailCount > 0 && (
                <p className="text-xs text-red-500 mt-0.5">{lineFailCount} 项未通过</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-4 text-xs font-medium text-muted-foreground">
        <span className="w-2 shrink-0" />
        <span className="w-[calc(16.66%-16px)]">产线</span>
        <span className="w-[calc(25%-16px)]">检查项</span>
        <span className="w-[calc(25%-16px)]">说明</span>
        <span className="w-[calc(25%-16px)]">详情</span>
        <span className="w-[calc(8.33%-16px)]">状态</span>
      </div>

      {/* Gate rows */}
      <div className="space-y-1.5">
        {data.items.map((item) => (
          <GateRow key={item.id} item={item} />
        ))}
      </div>

      {/* Overall result */}
      <div
        className={cn(
          "rounded-lg border p-4",
          data.canDeliver
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
        )}
      >
        {data.canDeliver ? (
          <div className="flex items-center gap-2">
            <Check className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                可以交付 — 所有门禁项通过
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                通过率 {Math.round(data.passRate * 100)}%，允许推向下一阶段
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-600" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                交付阻断 — 存在 {data.items.filter((i) => i.status === "fail").length} 项未通过
              </p>
            </div>
            <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-0.5 ml-7 list-disc">
              {data.items
                .filter((i) => i.status !== "pass")
                .map((i) => (
                  <li key={i.id}>
                    [{i.lineLabel}] {i.name}:{" "}
                    {i.status === "fail" ? "未通过" : i.status === "waiting" ? "等待中" : "执行中"}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
