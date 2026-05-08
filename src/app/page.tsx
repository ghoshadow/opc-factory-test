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
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Factory className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OPC 工厂总览</h1>
            <p className="text-sm text-muted-foreground">
              自动化软件工程生产仪表盘
            </p>
          </div>
        </div>
        <RefreshTimestamp
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>无法加载仪表盘数据，请检查 API 是否可用。</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-4 shrink-0"
            >
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && <DashboardSkeleton />}

      {/* Data Display */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* KPI Cards (7 columns) */}
          <section>
            <KpiGrid data={data.kpis} />
          </section>

          {/* WIP Stats + Alert List */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WipStats data={data.wipStats} />
            </div>
            <AlertList alerts={data.alerts} />
          </section>

          <Separator />

          {/* Production Line Status Cards (4 columns) */}
          <section>
            <h2 className="text-lg font-semibold mb-4">产线状态</h2>
            <LineStatusGrid data={data.lineStatuses} />
          </section>
        </div>
      )}
    </div>
  );
}
