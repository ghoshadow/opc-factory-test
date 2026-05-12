"use client"

import useSWR from "swr"
import { TocoReport } from "@/components/coding/TocoReport"
import type { CodingOpsResponse } from "@/types/factory"

const fetcher = (url: string): Promise<CodingOpsResponse> =>
  fetch(url).then((res) => res.json())

export default function TocoReportPage() {
  const { data, isLoading } = useSWR<CodingOpsResponse>(
    "/api/v1/coding/ops",
    fetcher,
    { refreshInterval: 30000 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TocoAgent 报告</h1>
        <p className="text-sm text-muted-foreground mt-1">
          代码质量分析与变更影响评估
        </p>
      </div>
      <TocoReport data={data?.tocoReport} isLoading={isLoading} />
    </div>
  )
}
