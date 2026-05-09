"use client";

import { useCallback, useState } from "react";

import {
  BugPlay,
  ChevronDown,
  ChevronRight,
  GitCommitHorizontal,
  GripVertical,
  Network,
} from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import type { Bug, BugPriority, BugTriageResponse } from "@/types/factory";

const fetcher = (url: string): Promise<BugTriageResponse> => fetch(url).then((res) => res.json());

const priorityConfig: Record<BugPriority, { label: string; className: string }> = {
  P0: {
    label: "P0 阻塞",
    className:
      "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  P1: {
    label: "P1 严重",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  },
  P2: {
    label: "P2 一般",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  P3: {
    label: "P3 轻微",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "待处理",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  in_progress: {
    label: "处理中",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  },
  resolved: {
    label: "已解决",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  closed: {
    label: "已关闭",
    className: "bg-gray-50 text-gray-500 dark:bg-gray-900/40 dark:text-gray-500",
  },
};

function PriorityBadge({ priority }: { priority: BugPriority }) {
  const cfg = priorityConfig[priority];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.open;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

interface ExpandedRowProps {
  bug: Bug;
}

function ExpandedRow({ bug }: ExpandedRowProps) {
  return (
    <div className="px-8 py-4 bg-muted/30 border-t border-b">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trace chain */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Network className="size-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              回溯链
            </h4>
          </div>
          <div className="space-y-0">
            {bug.traceChain.map((node, i) => (
              <div key={node.id} className="flex items-start gap-2 py-1.5">
                <div className="flex flex-col items-center">
                  <div className="size-2 rounded-full bg-primary/60" />
                  {i < bug.traceChain.length - 1 && <div className="w-px h-4 bg-border" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground bg-muted rounded px-1 py-0.5">
                    {node.label}
                  </span>
                  <p className="text-sm font-medium mt-0.5 truncate">{node.title}</p>
                  <p className="text-[10px] text-muted-foreground">{node.id}</p>
                </div>
              </div>
            ))}
            {bug.traceChain.length === 0 && (
              <p className="text-sm text-muted-foreground/60 italic">暂无回溯链数据</p>
            )}
          </div>
        </div>

        {/* Similar bugs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GitCommitHorizontal className="size-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              相似 Bug 聚类
            </h4>
          </div>
          <div className="space-y-2">
            {bug.similarBugs.map((sb) => (
              <div
                key={sb.id}
                className="flex items-center gap-3 p-2 rounded-md bg-background border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sb.title}</p>
                  <p className="text-[10px] text-muted-foreground">{sb.id}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${Math.round(sb.similarity * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium tabular-nums w-7 text-right">
                    {Math.round(sb.similarity * 100)}%
                  </span>
                </div>
              </div>
            ))}
            {bug.similarBugs.length === 0 && (
              <p className="text-sm text-muted-foreground/60 italic">暂无相似 Bug</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BugTriagePanel() {
  const { data, error, isLoading, mutate } = useSWR<BugTriageResponse>(
    "/api/v1/testing/bugs",
    fetcher,
    { refreshInterval: 30000 },
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOverPriority, setDragOverPriority] = useState<BugPriority | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRowClick = useCallback((bug: Bug) => {
    setExpandedId((prev) => (prev === bug.id ? null : bug.id));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, bugId: string) => {
    e.dataTransfer.setData("text/plain", bugId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, priority: BugPriority) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPriority(priority);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverPriority(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newPriority: BugPriority) => {
      e.preventDefault();
      setDragOverPriority(null);
      const bugId = e.dataTransfer.getData("text/plain");
      if (!bugId) return;

      setUpdating(bugId);
      try {
        const res = await fetch("/api/v1/testing/bugs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bugId, priority: newPriority }),
        });
        if (res.ok) {
          mutate();
        }
      } finally {
        setUpdating(null);
      }
    },
    [mutate],
  );

  // Group bugs by priority for drag-and-drop sections
  const grouped: Partial<Record<BugPriority, Bug[]>> = {};
  if (data?.bugs) {
    for (const bug of data.bugs) {
      (grouped[bug.priority] ??= []).push(bug);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <BugPlay className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Bug 数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const priorityList: BugPriority[] = ["P0", "P1", "P2", "P3"];

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BugPlay className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Bug 分诊面板</h2>
            <p className="text-xs text-muted-foreground">按优先级分组 · 拖拽调整优先级</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm tabular-nums">
          <span className="text-2xl font-bold">{data.total}</span>
          <span className="text-muted-foreground">个缺陷</span>
        </div>
      </div>

      {/* Priority sections */}
      <div className="space-y-1">
        {priorityList.map((priority) => {
          const groupBugs = grouped[priority] ?? [];
          const cfg = priorityConfig[priority];

          return (
            <div
              key={priority}
              onDragOver={(e) => handleDragOver(e, priority)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, priority)}
              className={`rounded-lg border transition-colors ${
                dragOverPriority === priority
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  : "border-transparent"
              }`}
            >
              {/* Priority header */}
              <div className="flex items-center gap-3 px-4 py-2">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
                >
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {groupBugs.length} 个
                </span>
              </div>

              {groupBugs.length === 0 ? (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground/50 italic py-2">
                    拖拽 Bug 到此处调整优先级
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {groupBugs.map((bug) => (
                    <div
                      key={bug.id}
                      className={updating === bug.id ? "opacity-50 pointer-events-none" : ""}
                    >
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => handleRowClick(bug)}
                      >
                        {/* Drag handle */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, bug.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          title="拖拽调整优先级"
                        >
                          <GripVertical className="size-4" />
                        </div>

                        {/* ID */}
                        <span className="text-xs font-mono text-muted-foreground shrink-0 w-18">
                          {bug.id}
                        </span>

                        {/* Title */}
                        <span className="text-sm font-medium flex-1 min-w-0 truncate">
                          {bug.title}
                        </span>

                        {/* Module */}
                        <span className="text-xs text-muted-foreground shrink-0 w-20 truncate hidden md:inline">
                          {bug.module}
                        </span>

                        {/* Status */}
                        <div className="shrink-0">
                          <StatusBadge status={bug.status} />
                        </div>

                        {/* Owner */}
                        <span className="text-xs font-medium shrink-0 w-8 text-right">
                          {bug.owner}
                        </span>

                        {/* Expand chevron */}
                        <ChevronRight
                          className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                            expandedId === bug.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* Expanded row */}
                      {expandedId === bug.id && <ExpandedRow bug={bug} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
