"use client";

import { Share2 } from "lucide-react";
import useSWR from "swr";

import { DecomposeGraph } from "@/components/quality/DecomposeGraph";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecomposePipelineResponse } from "@/types/factory";

const fetcher = (url: string): Promise<DecomposePipelineResponse> =>
  fetch(url).then((res) => res.json());

export default function PipelinePage() {
  const { data, error, isLoading } = useSWR<DecomposePipelineResponse>(
    "/api/v1/quality/pipeline",
    fetcher,
    { refreshInterval: 30000 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">流水线分解图谱</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spec → Task → PR → Test/Check 全链路分解可视化
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex">
            <Skeleton className="flex-1 h-[600px] rounded-none" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex items-center gap-3">
            <Share2 className="size-5 text-destructive/60" />
            <div>
              <p className="text-sm font-medium text-destructive">加载失败</p>
              <p className="text-xs text-muted-foreground">无法获取流水线分解数据，请稍后重试</p>
            </div>
          </div>
        </div>
      ) : data ? (
        <DecomposeGraph data={data} />
      ) : null}
    </div>
  );
}
