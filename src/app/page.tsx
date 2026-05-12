import type { LineStatusData } from "@/types/factory";
import { productionLines } from "@/lib/mock-data";
import { LineStatusGrid } from "@/components/factory/LineStatusGrid";

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

export default function FactoryOverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">工厂总览</h1>
        <p className="text-muted-foreground">OPC Factory · 生产线状态一览</p>
      </div>
      <LineStatusGrid lines={lines} />
    </div>
  )
}
