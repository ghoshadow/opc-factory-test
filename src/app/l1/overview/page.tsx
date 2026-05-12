import type { LineStatusData } from "@/types/factory"
import { productionLines, dashboardAlerts } from "@/lib/mock-data"
import { LineStatusGrid } from "@/components/factory/LineStatusGrid"
import { KpiGrid } from "@/components/factory/KpiGrid"
import { WipStats } from "@/components/factory/WipStats"
import { AlertList } from "@/components/dashboard/alert-list"

const lines: LineStatusData[] = productionLines.map((l) => ({
  id: l.id as LineStatusData["id"],
  name: l.name,
  opc: l.opc,
  function: l.function,
  wip: l.wip,
  completed: l.completed,
  anomaly: l.anomaly === "—" ? null : l.anomaly,
  status: l.status,
}))

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">工厂总览</h1>
        <p className="text-sm text-muted-foreground mt-1">
          OPC Factory · 生产线状态一览
        </p>
      </div>

      {/* Row 1: 9-KPI Grid */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">KPI 指标</h2>
        <KpiGrid />
      </section>

      {/* Row 2: WIP + Alerts side-by-side */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <WipStats />
        </div>
        <div className="xl:col-span-2">
          <AlertList alerts={dashboardAlerts} />
        </div>
      </section>

      {/* Row 3: 4 Pipeline Status Cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">产线状态</h2>
        <LineStatusGrid lines={lines} />
      </section>
    </div>
  )
}
