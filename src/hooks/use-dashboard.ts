import useSWR from "swr";
import { DashboardData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
});

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    "/api/v1/factory/metrics",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    refresh: () => mutate(),
    lastUpdated: data?.lastUpdated ?? null,
  };
}
