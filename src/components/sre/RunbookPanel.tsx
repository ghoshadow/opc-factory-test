"use client";

import Link from "next/link";

import { BookOpen, Clock, ExternalLink, GitBranch } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import type { RunbookListResponse } from "@/types/factory";

const fetcher = (url: string): Promise<RunbookListResponse> => fetch(url).then((res) => res.json());

export function RunbookPanel() {
  const { data, error, isLoading } = useSWR<RunbookListResponse>("/api/v1/sre/runbooks", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Runbook 列表，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">运维手册</h2>
            <p className="text-xs text-muted-foreground">{data.total} 个手册</p>
          </div>
        </div>
        <Link
          href="/l5/runbooks"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          管理
          <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* Runbook cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.runbooks.map((rb) => (
          <a
            key={rb.id}
            href={`/l5/runbooks`}
            className="flex flex-col gap-2 rounded-lg border p-4 hover:border-primary/30 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{rb.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {rb.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <GitBranch className="size-3" />
                {rb.service}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />v{rb.version}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
