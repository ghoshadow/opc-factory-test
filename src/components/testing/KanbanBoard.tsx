"use client";

import { useCallback, useState } from "react";

import { Columns3, GripVertical, MoreHorizontal } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { KanbanBoardData, KanbanItem, TestingOpsResponse } from "@/types/factory";

const fetcher = (url: string): Promise<KanbanBoardData> =>
  fetch(url)
    .then((res) => res.json())
    .then((d: TestingOpsResponse) => d.kanban);

export function KanbanBoard() {
  const { data, error, isLoading } = useSWR<KanbanBoardData>(
    "/api/v1/testing/ops",
    (url: string) => fetcher(url).then((d) => d),
    { refreshInterval: 25000 },
  );

  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{ itemId: string; fromCol: string } | null>(
    null,
  );

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, colId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ itemId, colId }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingItem({ itemId, fromCol: colId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragOverCol(null);
    setDraggingItem(null);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-16" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Columns3 className="size-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无法加载看板数据</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Columns3 className="size-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">测试看板</h2>
          <p className="text-xs text-muted-foreground">拖拽卡片切换状态</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            className={cn(
              "rounded-lg border bg-muted/20 p-3 transition-colors",
              dragOverCol === col.id && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.label}
              </span>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {col.items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[60px]">
              {col.items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, col.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all",
                    draggingItem?.itemId === item.id && "opacity-50 scale-95",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="size-3.5 text-muted-foreground/30 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">
                          {item.owner}
                        </span>
                      </div>
                    </div>
                    <MoreHorizontal className="size-3.5 text-muted-foreground/30 shrink-0" />
                  </div>
                </div>
              ))}

              {col.items.length === 0 && (
                <div className="flex items-center justify-center h-16 rounded-lg border border-dashed">
                  <p className="text-xs text-muted-foreground/50">暂无任务</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
