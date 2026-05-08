"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";

export function HeaderAlertBadge() {
  const { data: alerts } = useAlerts();

  const urgentCount = alerts?.filter((a) => a.severity === "urgent").length ?? 0;

  if (urgentCount === 0) return null;

  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="size-3" />
      {urgentCount} 紧急
    </Badge>
  );
}
