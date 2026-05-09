"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { WipStats } from "@/components/dashboard/wip-stats";
import { AlertList } from "@/components/dashboard/alert-list";
import { LineStatusGrid } from "@/components/dashboard/line-status-grid";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { RefreshTimestamp } from "@/components/dashboard/refresh-timestamp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Factory } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, isError, refresh, lastUpdated } = useDashboard();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-foreground">OPC Factory</h1>
      <p className="text-muted-foreground text-lg">Automated Software Engineering System</p>
    </div>
  )
}
