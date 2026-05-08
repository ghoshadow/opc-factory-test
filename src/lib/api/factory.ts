import useSWR from "swr"
import type { FactoryMetrics } from "@/app/api/v1/factory/metrics/route"
import type { LineStatusResponse } from "@/app/api/v1/factory/line-status/route"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useFactoryMetrics() {
  const { data, error, isLoading } = useSWR<FactoryMetrics>(
    "/api/v1/factory/metrics",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    metrics: data,
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
    lines: data,
    isLoading,
    isError: !!error,
  }
}

export function useLineDetail(lineId: string) {
  const { lines, isLoading, isError } = useLineStatus()

  const line = lines?.find((l) => l.id === lineId)

  return {
    line,
    isLoading,
    isError,
    isNotFound: !isLoading && !isError && !line,
  }
}
