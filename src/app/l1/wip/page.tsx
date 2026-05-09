import { WipStats } from "@/components/factory/WipStats"

export default function WipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WIP 在制品统计</h1>
        <p className="text-sm text-muted-foreground mt-1">
          按产线展示在制品 (WIP) 数量分布
        </p>
      </div>

      <div className="max-w-lg">
        <WipStats />
      </div>
    </div>
  )
}
