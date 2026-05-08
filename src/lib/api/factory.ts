import useSWR from "swr"
import type { FactoryMetrics } from "@/app/api/v1/factory/metrics/route"

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
