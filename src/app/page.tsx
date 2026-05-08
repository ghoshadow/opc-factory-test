import { KpiGrid } from "@/components/factory/KpiGrid"
import { LineStatusGrid } from "@/components/factory/LineStatusGrid"

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">OPC Factory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          工厂总览 — 4 条 AI Agent 产线实时监控
        </p>
      </div>
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold">KPI 指标</h2>
        <KpiGrid />
      </section>
      <section>
        <h2 className="mb-3 text-base font-semibold">产线状态</h2>
        <LineStatusGrid />
      </section>
    </div>
  )
}
