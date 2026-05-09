import useSWR from "swr"
import type { ProductionLine } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useLineStatus() {
  const { data, error, isLoading } = useSWR<{ data: ProductionLine[]; updatedAt: string }>(
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

  const line = lines?.data.find((l) => l.id === lineId)

  return {
    line,
    isLoading,
    isError,
    isNotFound: !isLoading && !isError && !line,
  }
}
