import { productionLines } from "@/lib/mock-data";
import { LineStatusGrid } from "@/components/factory/LineStatusGrid";

export default function FactoryOverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">工厂总览</h1>
        <p className="text-muted-foreground">OPC Factory · 生产线状态一览</p>
      </div>
      <LineStatusGrid lines={productionLines} />
    </div>
  )
}
