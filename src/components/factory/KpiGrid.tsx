"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { useFactoryMetrics } from "@/lib/api/factory";

export function KpiGrid() {
  const { metrics, isLoading, isError } = useFactoryMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
        Failed to load metrics. Please try again.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Row 1 */}
      <MetricCard
        label="在跑产线"
        value={metrics.activeLines.count}
        subtitle={metrics.activeLines.names.join(" / ")}
      />

      <MetricCard
        label="吞吐量"
        value={metrics.throughput.value}
        unit={metrics.throughput.unit}
        trend={metrics.throughput.trend}
        trendValue={metrics.throughput.trendValue}
        subtitle="环比上周"
      />

      <MetricCard
        label="本周交付"
        value={metrics.weeklyDelivery.value}
        unit="feat"
        trend={metrics.weeklyDelivery.trend}
        trendValue={metrics.weeklyDelivery.trendValue}
        subtitle="环比上周"
      />

      {/* Row 2 */}
      <MetricCard
        label="平均交付周期"
        value={metrics.avgCycleTime.value}
        unit={metrics.avgCycleTime.unit}
        trend={metrics.avgCycleTime.trend}
        subtitle="环比趋势"
      />

      <MetricCard
        label="自动通过率"
        value={metrics.autoPassRate.value}
        unit={metrics.autoPassRate.unit}
        trend={metrics.autoPassRate.trend}
        subtitle="环比趋势"
      />

      <MetricCard
        label="OPC 人工介入"
        value={metrics.opcInterventions.value}
        unit="次"
        subtitle="本周累计"
      />

      {/* Row 3 */}
      <MetricCard
        label="产能利用率"
        value={metrics.capacityUtilization.value}
        unit={metrics.capacityUtilization.unit}
        trend={metrics.capacityUtilization.trend}
        subtitle="环比趋势"
      />

      <MetricCard
        label="Token 能耗"
        value={metrics.tokenConsumption.value}
        unit={metrics.tokenConsumption.unit}
        costUSD={metrics.tokenConsumption.costUSD}
      />

      <MetricCard
        label="仓库库存"
        value={metrics.repoInventory.count}
        trend={metrics.repoInventory.trend}
        subtitle="环比趋势"
      />
    </div>
  );
}
