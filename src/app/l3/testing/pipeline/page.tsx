"use client"

import useSWR from "swr"
import { GitBranch } from "lucide-react"
import { PipelineFlow } from "@/components/factory/PipelineFlow"
import type { PipelineResponse } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<PipelineResponse> =>
  fetch(url).then((res) => res.json())

export default function TestingPipelinePage() {
  const { data, error, isLoading } = useSWR<PipelineResponse>(
    "/api/v1/testing/pipeline",
    fetcher,
    { refreshInterval: 30000 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">测试产线 Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          8 Agent 节点流水线 · 从任务拆解到外部 Reviewer 验收
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <Skeleton className="h-20 w-28 rounded-lg" />
                {i < 7 && <Skeleton className="h-4 w-6" />}
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center gap-3">
            <GitBranch className="size-6 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">加载失败</p>
              <p className="text-xs text-muted-foreground">无法获取流水线数据，请稍后重试</p>
            </div>
          </div>
        </div>
      ) : data ? (
        <PipelineFlow nodes={data.nodes} />
      ) : null}
    </div>
  )
}
