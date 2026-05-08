"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { Alert } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function HeaderAlertBadge() {
  const { data: alerts } = useSWR<Alert[]>("/api/v1/factory/alerts", fetcher, {
    refreshInterval: 30_000,
  });

  const urgentCount = alerts?.filter((a) => a.severity === "urgent").length ?? 0;

  if (urgentCount === 0) return null;

  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="size-3" />
      {urgentCount} 紧急
    </Badge>
  );
}
