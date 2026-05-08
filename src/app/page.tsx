"use client"

import { Activity, Users, Zap } from "lucide-react"
import {
  MetricCard,
  StatusBadge,
  DataTable,
  EmptyState,
  PipelineNode,
} from "@/components/ui"
import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Total Throughput", value: "184", unit: "items/day", trend: "up" as const, trendValue: "+12.5%", icon: Activity },
  { label: "Active Agents", value: "24", unit: "agents", trend: "stable" as const, trendValue: "No change", icon: Users },
  { label: "Avg Cycle Time", value: "3.2", unit: "hours", trend: "down" as const, trendValue: "-8.3%", icon: Zap },
]

const pipelineNodes = [
  { label: "Intake", status: "done" as const },
  { label: "Spec Authoring", status: "done" as const },
  { label: "Maturity Review", status: "running" as const, isActive: true },
  { label: "Implementation", status: "waiting" as const },
  { label: "Review", status: "waiting" as const },
]

const statuses: Array<"NOMINAL" | "ATTENTION" | "BLOCKED"> = ["NOMINAL", "ATTENTION", "BLOCKED"]

interface WorkItem {
  id: string
  title: string
  line: string
  status: "NOMINAL" | "ATTENTION" | "BLOCKED"
  priority: string
}

const tableColumns = [
  { key: "id", header: "ID", sortable: true, className: "font-mono text-xs" },
  { key: "title", header: "Title", sortable: true },
  { key: "line", header: "Line", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (item: WorkItem) => <StatusBadge status={item.status} />,
  },
  { key: "priority", header: "Priority", sortable: true },
]

const tableData: WorkItem[] = [
  { id: "SYM-42", title: "Setup observability monitoring", line: "SRE", status: "NOMINAL", priority: "P1" },
  { id: "SYM-41", title: "Build deployment pipeline", line: "SRE", status: "ATTENTION", priority: "P0" },
  { id: "SYM-40", title: "Design Checker panel UI", line: "Coding", status: "BLOCKED", priority: "P1" },
  { id: "SYM-39", title: "Implement Spec editor", line: "Coding", status: "NOMINAL", priority: "P0" },
  { id: "SYM-38", title: "Build KPI dashboard cards", line: "Coding", status: "ATTENTION", priority: "P1" },
]

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-6 py-12">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">UI Component Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L0 foundation components for the OPC Factory platform.
        </p>
      </section>

      {/* Metric Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">MetricCard</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">StatusBadge</h2>
        <div className="flex flex-wrap items-center gap-3">
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </section>

      {/* Data Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">DataTable</h2>
        <DataTable<WorkItem> columns={tableColumns} data={tableData} onRowClick={(item) => console.log(item)} />
      </section>

      {/* Empty State */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">EmptyState</h2>
        <EmptyState
          icon={Zap}
          title="No items found"
          description="There are no items to display at this time. Create one to get started."
          action={<Button size="sm">Create Item</Button>}
        />
      </section>

      {/* Pipeline Nodes */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">PipelineNode</h2>
        <div className="flex flex-wrap items-center gap-4">
          {pipelineNodes.map((n) => (
            <PipelineNode key={n.label} label={n.label} status={n.status} isActive={n.isActive} />
          ))}
        </div>
      </section>
    </div>
  )
}
