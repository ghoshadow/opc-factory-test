import useSWR from "swr"
import type { MetricsResponse } from "@/app/api/v1/factory/metrics/route"
import type { LineStatusResponse } from "@/app/api/v1/factory/line-status/route"
import type { WipResponse } from "@/app/api/v1/factory/wip/route"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDashboardMetrics() {
  const { data, error, isLoading } = useSWR<MetricsResponse>(
    "/api/v1/factory/metrics",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
  }
}

export function useLineStatus() {
  const { data, error, isLoading } = useSWR<LineStatusResponse>(
    "/api/v1/factory/line-status",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    lines: data?.data,
    isLoading,
    isError: !!error,
  }
}

export function useLineDetail(lineId: string) {
  const { lines, isLoading, isError } = useLineStatus()

  const line = lines?.data.find((l) => l.id === lineId)

  return {
    line,
    isLoading,
    isError,
    isNotFound: !isLoading && !isError && !line,
  }
}

export function useWipStats() {
  const { data, error, isLoading } = useSWR<WipResponse>(
    "/api/v1/factory/wip",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    wip: data,
    isLoading,
    isError: !!error,
  }
}
