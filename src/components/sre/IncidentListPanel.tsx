"use client";

import { CheckCircle2, Eye, Flame, Search, Shield, Siren } from "lucide-react";
import useSWR from "swr";

import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  Incident,
  IncidentSeverity,
  IncidentsResponse,
  IncidentStatus,
} from "@/types/factory";

const fetcher = (url: string): Promise<IncidentsResponse> => fetch(url).then((res) => res.json());

const severityConfig: Record<IncidentSeverity, { label: string; badge: string }> = {
  SEV0: {
    label: "P0",
    badge: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400 font-bold",
  },
  SEV1: {
    label: "P1",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400",
  },
  SEV2: {
    label: "P2",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  },
  SEV3: {
    label: "P3",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
  },
};

const statusConfig: Record<IncidentStatus, { label: string; badge: string }> = {
  open: {
    label: "开启",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  investigating: {
    label: "调查中",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  mitigated: {
    label: "已缓解",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  resolved: {
    label: "已关闭",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
};

export function IncidentListPanel() {
  const { data, error, isLoading } = useSWR<IncidentsResponse>("/api/v1/sre/incidents", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Siren className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取工单数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const columns = [
    {
      key: "severity",
      header: "级别",
      className: "w-12",
      render: (i: Incident) => {
        const cfg = severityConfig[i.severity];
        return (
          <span
            className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs", cfg.badge)}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "状态",
      className: "w-20",
      render: (i: Incident) => {
        const cfg = statusConfig[i.status];
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
      key: "title",
      header: "标题",
      render: (i: Incident) => (
        <div>
          <p className="text-sm font-medium">{i.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{i.summary}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "服务",
      className: "w-36",
    },
    {
      key: "commander",
      header: "负责人",
      className: "w-20",
    },
    {
      key: "createdAt",
      header: "发生时间",
      className: "w-36",
      render: (i: Incident) => (
        <span className="text-xs text-muted-foreground">
          {new Date(i.createdAt).toLocaleString("zh-CN", {
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
          <Siren className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">故障工单</h2>
            <p className="text-xs text-muted-foreground">共 {data.total} 个工单</p>
          </div>
        </div>
        {data.openCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <Flame className="size-3" />
            {data.openCount} 个进行中
          </span>
        )}
      </div>

      <DataTable columns={columns} data={data.incidents} emptyMessage="暂无故障工单" />
    </div>
  );
}
