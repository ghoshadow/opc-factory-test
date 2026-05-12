"use client";

import { AlertTriangle, CheckCircle2, Clock, RotateCcw, User, XCircle } from "lucide-react";
import useSWR from "swr";

import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RollbackRecord, RollbackResponse, RollbackResult } from "@/types/factory";

const fetcher = (url: string): Promise<RollbackResponse> => fetch(url).then((res) => res.json());

const resultConfig: Record<
  RollbackResult,
  { icon: typeof CheckCircle2; label: string; badge: string }
> = {
  success: {
    icon: CheckCircle2,
    label: "成功",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  failed: {
    icon: XCircle,
    label: "失败",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
};

export function RollbackPanel() {
  const { data, error, isLoading } = useSWR<RollbackResponse>("/api/v1/sre/rollbacks", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <RotateCcw className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取回滚记录，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const columns = [
    {
      key: "result",
      header: "状态",
      className: "w-16",
      render: (r: RollbackRecord) => {
        const cfg = resultConfig[r.result];
        const Icon = cfg.icon;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              cfg.badge,
            )}
          >
            <Icon className="size-3" />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "service",
      header: "服务",
      className: "w-40",
    },
    {
      key: "version",
      header: "版本",
      className: "w-40",
      render: (r: RollbackRecord) => (
        <span className="text-xs tabular-nums">
          <span className="text-red-600 line-through">{r.versionFrom}</span>
          {" → "}
          <span className="text-emerald-600">{r.versionTo}</span>
        </span>
      ),
    },
    {
      key: "reason",
      header: "原因",
      render: (r: RollbackRecord) => <span className="text-xs line-clamp-1">{r.reason}</span>,
    },
    {
      key: "trigger",
      header: "触发",
      className: "w-16",
      render: (r: RollbackRecord) => (
        <span
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
            r.trigger === "auto"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
              : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
          )}
        >
          {r.trigger === "auto" ? "自动" : "手动"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "耗时",
      className: "w-20",
      render: (r: RollbackRecord) => (
        <span className="text-xs tabular-nums text-muted-foreground">{r.duration}s</span>
      ),
    },
    {
      key: "createdAt",
      header: "时间",
      className: "w-36",
      render: (r: RollbackRecord) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.createdAt).toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RotateCcw className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">回滚记录</h2>
            <p className="text-xs text-muted-foreground">{data.total} 条记录</p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={data.records} emptyMessage="暂无回滚记录" />
    </div>
  );
}
