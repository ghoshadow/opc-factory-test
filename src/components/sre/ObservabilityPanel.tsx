"use client";

import { useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  FileText,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import useSWR from "swr";

import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LogEntry, ObservabilityResponse, TraceSpan } from "@/types/factory";

const fetcher = (url: string): Promise<ObservabilityResponse> =>
  fetch(url).then((res) => res.json());

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  Clock,
  Zap,
  Shield,
};

const levelConfig: Record<LogEntry["level"], { badge: string; icon: string }> = {
  ERROR: {
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    icon: "text-red-500",
  },
  WARN: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: "text-amber-500",
  },
  INFO: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    icon: "text-blue-500",
  },
};

type TabKey = "metrics" | "logs" | "traces";

export function ObservabilityPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("metrics");
  const { data, error, isLoading } = useSWR<ObservabilityResponse>(
    "/api/v1/sre/observability",
    fetcher,
    { refreshInterval: 30000 },
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取观测数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
    { key: "metrics", label: "指标", icon: Activity },
    { key: "logs", label: "日志", icon: FileText },
    { key: "traces", label: "链路", icon: Zap },
  ];

  const logColumns = [
    {
      key: "timestamp",
      header: "时间",
      className: "w-40",
      render: (l: LogEntry) => (
        <span className="text-xs font-mono text-muted-foreground">
          {new Date(l.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "level",
      header: "级别",
      className: "w-16",
      render: (l: LogEntry) => {
        const cfg = levelConfig[l.level];
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
              cfg.badge,
            )}
          >
            {l.level}
          </span>
        );
      },
    },
    { key: "service", header: "服务", className: "w-40" },
    {
      key: "message",
      header: "消息",
      render: (l: LogEntry) => <span className="text-xs line-clamp-1">{l.message}</span>,
    },
  ];

  const traceColumns = [
    {
      key: "traceId",
      header: "Trace ID",
      className: "w-36",
      render: (t: TraceSpan) => <span className="text-xs font-mono">{t.traceId}</span>,
    },
    { key: "service", header: "服务", className: "w-40" },
    {
      key: "operation",
      header: "操作",
      render: (t: TraceSpan) => <span className="text-xs font-mono">{t.operation}</span>,
    },
    {
      key: "duration",
      header: "耗时",
      className: "w-20",
      render: (t: TraceSpan) => (
        <span
          className={cn(
            "text-xs tabular-nums",
            t.duration > 1000 ? "text-red-600 font-medium" : "",
          )}
        >
          {t.duration}ms
        </span>
      ),
    },
    {
      key: "status",
      header: "状态",
      className: "w-16",
      render: (t: TraceSpan) => (
        <span
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
            t.status === "ok"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
          )}
        >
          {t.status === "ok" ? "OK" : "ERR"}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">可观测性</h2>
            <p className="text-xs text-muted-foreground">指标 · 日志 · 链路追踪</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          更新于 {new Date(data.updatedAt).toLocaleTimeString("zh-CN")}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Metrics tab */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.metrics.map((m) => {
            const IconComp = iconMap[m.icon] ?? Activity;
            return (
              <MetricCard
                key={m.id}
                label={m.label}
                value={m.value}
                unit={m.unit}
                trend={m.trend}
                trendValue={m.trendValue}
                subtitle={m.subtitle}
                icon={IconComp}
              />
            );
          })}
        </div>
      )}

      {/* Logs tab */}
      {activeTab === "logs" && (
        <DataTable columns={logColumns} data={data.logs} emptyMessage="暂无日志" />
      )}

      {/* Traces tab */}
      {activeTab === "traces" && (
        <DataTable columns={traceColumns} data={data.traces} emptyMessage="暂无链路数据" />
      )}
    </div>
  );
}
