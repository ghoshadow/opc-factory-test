"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { diffLines } from "diff";
import { AlertTriangle, ArrowLeft, Minus, Plus } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SpecVersionsResponse } from "@/types/factory";

const fetcher = (url: string): Promise<SpecVersionsResponse> =>
  fetch(url).then((res) => res.json());

function SpecDiffContent() {
  const searchParams = useSearchParams();
  const specId = searchParams.get("specId") ?? "";
  const v1 = Number(searchParams.get("v1"));
  const v2 = Number(searchParams.get("v2"));

  const { data, error, isLoading } = useSWR<SpecVersionsResponse>(
    specId ? `/api/v1/specs/${specId}/versions` : null,
    fetcher,
  );

  const version1 = data?.versions.find((v) => v.version === v1);
  const version2 = data?.versions.find((v) => v.version === v2);

  const diffResult = useMemo(() => {
    const oldContent = version1?.content ?? "";
    const newContent = version2?.content ?? "";
    if (!oldContent && !newContent) return null;
    return diffLines(oldContent, newContent);
  }, [version1?.content, version2?.content]);

  if (!specId || isNaN(v1) || isNaN(v2)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/l2/spec-editor?specId=${specId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回 Spec 编辑器
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <AlertTriangle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">参数无效</p>
          <p className="text-xs text-muted-foreground mt-1">请指定有效的 specId 和版本号</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !version1 || !version2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/l2/spec-editor?specId=${specId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回 Spec 编辑器
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <AlertTriangle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">无法加载版本数据</p>
          <p className="text-xs text-muted-foreground mt-1">请检查版本号是否正确</p>
        </div>
      </div>
    );
  }

  const oldContent = version1.content;
  const newContent = version2.content;

  // Neither has content — empty state
  if (!oldContent && !newContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/l2/spec-editor?specId=${specId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回 Spec 编辑器
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">版本对比</h1>
          <p className="text-sm text-muted-foreground mt-1">
            对比 v{version1.version} 与 v{version2.version} 的差异
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <AlertTriangle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">两个版本均无内容快照，无法展示差异</p>
        </div>
      </div>
    );
  }

  // Stats
  let addedLines = 0;
  let removedLines = 0;
  if (diffResult) {
    for (const change of diffResult) {
      if (change.added) addedLines += change.count ?? 0;
      if (change.removed) removedLines += change.count ?? 0;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/l2/spec-editor?specId=${specId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回 Spec 编辑器
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">版本对比</h1>
        <p className="text-sm text-muted-foreground mt-1">
          对比 v{version1.version} 与 v{version2.version} 的差异
        </p>
      </div>

      {/* Diff stats bar */}
      {diffResult && (
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400">
            <Plus className="size-3.5" />+{addedLines} 行新增
          </span>
          <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
            <Minus className="size-3.5" />-{removedLines} 行删除
          </span>
        </div>
      )}

      {/* Version labels */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono font-semibold text-muted-foreground">
            v{version1.version}
          </span>
          {version1.summary}
        </div>
        <ArrowLeft className="size-3 rotate-180" />
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 font-mono font-semibold">
            v{version2.version}
          </span>
          {version2.summary}
        </div>
      </div>

      {/* Unified diff view */}
      {diffResult ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="divide-y divide-border/50 font-mono text-sm leading-relaxed">
            {diffResult.map((change, i) => {
              const lines = change.value.split("\n");
              // Remove trailing empty string from split
              if (lines[lines.length - 1] === "") lines.pop();

              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={cn(
                    "flex px-4 py-0.5 min-h-[1.75rem] items-start",
                    change.added
                      ? "bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-200"
                      : change.removed
                        ? "bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200"
                        : "text-foreground/80",
                  )}
                >
                  <span className="w-6 shrink-0 select-none text-muted-foreground/60">
                    {change.added ? "+" : change.removed ? "-" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line}</span>
                </div>
              ));
            })}
          </div>
        </div>
      ) : (
        // Fallback: single version content when other has no content
        <div className="rounded-lg border bg-card">
          <div className="p-4">
            {oldContent ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  v{version1.version} 内容 (v{version2.version} 无内容快照)
                </p>
                <pre className="text-sm whitespace-pre-wrap font-sans text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-950/20 rounded-md p-4">
                  {oldContent}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  v{version2.version} 内容 (v{version1.version} 无内容快照)
                </p>
                <pre className="text-sm whitespace-pre-wrap font-sans text-green-900 dark:text-green-200 bg-green-50 dark:bg-green-950/20 rounded-md p-4">
                  {newContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpecDiffPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      }
    >
      <SpecDiffContent />
    </Suspense>
  );
}
