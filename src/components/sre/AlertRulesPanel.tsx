"use client";

import { AlertCircle, AlertTriangle, Bell, BellRing, Info } from "lucide-react";
import useSWR from "swr";

import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AlertRule, AlertSeverity, AlertsResponse } from "@/types/factory";

const fetcher = (url: string): Promise<AlertsResponse> => fetch(url).then((res) => res.json());

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof BellRing; label: string; badge: string }
> = {
  critical: {
    icon: AlertCircle,
    label: "严重",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    label: "警告",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  info: {
    icon: Info,
    label: "提示",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
};

export function AlertRulesPanel() {
  const { data, error, isLoading } = useSWR<AlertsResponse>("/api/v1/sre/alerts", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取告警规则，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const columns = [
    {
      key: "state",
      header: "状态",
      className: "w-20",
      render: (r: AlertRule) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
            r.state === "firing"
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
              : r.state === "pending"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
          )}
        >
          {r.state === "firing" && <BellRing className="size-3" />}
          {r.state === "firing" ? "触发" : r.state === "pending" ? "待定" : "正常"}
        </span>
      ),
    },
    {
      key: "severity",
      header: "级别",
      className: "w-16",
      render: (r: AlertRule) => {
        const cfg = severityConfig[r.severity];
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
              cfg.badge,
            )}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "name",
      header: "规则名称",
      render: (r: AlertRule) => (
        <div>
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "服务",
      className: "w-40",
      render: (r: AlertRule) => (
        <span className="text-xs text-muted-foreground">{r.labels.service}</span>
      ),
    },
    {
      key: "lastFired",
      header: "最后触发",
      className: "w-40",
      render: (r: AlertRule) => (
        <span className="text-xs text-muted-foreground">
          {r.lastFired
            ? new Date(r.lastFired).toLocaleString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "从未"}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">告警规则</h2>
            <p className="text-xs text-muted-foreground">{data.total} 条规则</p>
          </div>
        </div>
        {data.firingCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <BellRing className="size-3" />
            {data.firingCount} 条触发中
          </span>
        )}
      </div>

      <DataTable columns={columns} data={data.rules} emptyMessage="暂无告警规则" />
    </div>
  );
}
