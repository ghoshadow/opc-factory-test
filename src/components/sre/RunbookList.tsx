"use client";

import { useState } from "react";

import { BookOpen, Clock, FileText, GitBranch, Plus, Search } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import type { Runbook, RunbookListResponse } from "@/types/factory";

const fetcher = (url: string): Promise<RunbookListResponse> => fetch(url).then((res) => res.json());

interface RunbookListProps {
  onSelect: (runbook: Runbook) => void;
  selectedId?: string;
  onCreateNew: () => void;
}

export function RunbookList({ onSelect, selectedId, onCreateNew }: RunbookListProps) {
  const [search, setSearch] = useState("");
  const { data, error, isLoading } = useSWR<RunbookListResponse>("/api/v1/sre/runbooks", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <BookOpen className="size-5 text-red-500" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Runbook 列表，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  const runbooks = data?.runbooks ?? [];
  const filtered = search
    ? runbooks.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.service.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : runbooks;

  return (
    <div className="flex flex-col h-full">
      {/* Search + Create */}
      <div className="p-4 space-y-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 Runbook..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="size-4" />
          新建 Runbook
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "无匹配结果" : "暂无 Runbook"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((rb) => (
              <button
                key={rb.id}
                type="button"
                onClick={() => onSelect(rb)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedId === rb.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-accent border border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <BookOpen
                    className={`size-4 mt-0.5 shrink-0 ${selectedId === rb.id ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{rb.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {rb.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="size-3" />
                        {rb.service}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />v{rb.version}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        共 {runbooks.length} 个 Runbook
      </div>
    </div>
  );
}
