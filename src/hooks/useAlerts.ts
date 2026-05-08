import useSWR from "swr";
import type { Alert } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAlerts() {
  return useSWR<Alert[]>("/api/v1/factory/alerts", fetcher, {
    refreshInterval: 30_000,
  });
}
