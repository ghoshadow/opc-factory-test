"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  FolderOpen,
  FileCode,
  ChevronRight,
  Package,
  AlertTriangle,
  Shield,
  Zap,
  Building2,
  Gauge,
  FileText,
  Archive,
  CircleCheck,
  ArrowRightLeft,
  Database,
  Layout,
} from "lucide-react"
import type {
  ArchaeologyResponse,
  FileNode,
  DebtSeverity,
  DebtType,
  DependencyNode,
  TechDebtItem,
} from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<ArchaeologyResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`请求失败: ${res.status}`)
    return res.json()
  })

// ─── Config maps ───────────────────────────────────────

const severityConfig: Record<DebtSeverity, { label: string; badgeClass: string; iconClass: string }> = {
  critical: {
    label: "严重",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
    iconClass: "text-red-500",
  },
  high: {
    label: "高",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    iconClass: "text-orange-500",
  },
  medium: {
    label: "中",
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    iconClass: "text-yellow-500",
  },
  low: {
    label: "低",
    badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-900/60 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    iconClass: "text-gray-400",
  },
}

const debtTypeConfig: Record<DebtType, { label: string; Icon: typeof AlertTriangle }> = {
  security: { label: "安全漏洞", Icon: Shield },
  code_quality: { label: "代码质量", Icon: FileCode },
  deprecated_api: { label: "过时 API", Icon: Zap },
  architecture: { label: "架构问题", Icon: Building2 },
  performance: { label: "性能问题", Icon: Gauge },
}

const severityOrder: Record<DebtSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

// ─── Sub-components ────────────────────────────────────

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1)

  const isDir = node.type === "directory"
  const hasChildren = isDir && node.children && node.children.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(!expanded)}
        disabled={!hasChildren}
        className={`flex items-center gap-1.5 w-full text-left py-1 px-1.5 rounded hover:bg-muted/50 transition-colors text-sm ${
          !hasChildren ? "cursor-default" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 6}px` }}
      >
        {isDir ? (
          <>
            <ChevronRight
              className={`size-3.5 text-muted-foreground shrink-0 transition-transform ${
                expanded ? "rotate-90" : ""
              } ${!hasChildren ? "invisible" : ""}`}
            />
            <FolderOpen className="size-4 text-amber-500 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <FileCode className="size-4 text-blue-400 shrink-0" />
          </>
        )}
        <span className="truncate font-medium">{node.name}</span>
        {!isDir && node.language && (
          <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
            {node.language}
          </span>
        )}
        {!isDir && node.size != null && (
          <span className="text-[10px] text-muted-foreground/50 shrink-0 tabular-nums w-10 text-right">
            {node.size > 1000 ? `${(node.size / 1000).toFixed(1)}k` : `${node.size}B`}
          </span>
        )}
      </button>

      {isDir && hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <FileTreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function DependencySection({ deps }: { deps: DependencyNode[] }) {
  const external = deps.filter((d) => d.type === "external")
  const internal = deps.filter((d) => d.type === "internal")

  return (
    <div className="space-y-4">
      {/* External deps */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          外部依赖 ({external.length})
        </h4>
        <div className="space-y-1.5">
          {external.map((dep) => (
            <div
              key={dep.name}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20"
            >
              <Package className="size-4 text-blue-500 shrink-0" />
              <span className="text-sm font-medium font-mono">{dep.name}</span>
              {dep.version && (
                <span className="text-xs text-muted-foreground font-mono">@{dep.version}</span>
              )}
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {dep.usageCount} 处使用
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Internal deps */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          内部模块 ({internal.length})
        </h4>
        <div className="space-y-1.5">
          {internal.map((dep) => (
            <div
              key={dep.name}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20"
            >
              <FolderOpen className="size-4 text-amber-500 shrink-0" />
              <span className="text-sm font-medium font-mono">{dep.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {dep.usageCount} 处引用
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Used-by map */}
      <div className="pt-2 border-t">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          模块耦合
        </h4>
        {deps.map((dep) => (
          <div key={dep.name} className="flex items-start gap-2 py-1 text-xs">
            <span className="font-mono text-primary font-medium shrink-0">{dep.name}</span>
            <ArrowRightLeft className="size-3 text-muted-foreground/40 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              {dep.dependentModules.join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TechDebtList({ items }: { items: TechDebtItem[] }) {
  const sorted = [...items].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )

  return (
    <div className="space-y-2">
      {sorted.map((item) => {
        const sev = severityConfig[item.severity]
        const typ = debtTypeConfig[item.type]
        const TypIcon = typ.Icon

        return (
          <div
            key={item.id}
            className="rounded-lg border p-4 space-y-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${sev.badgeClass}`}
              >
                {sev.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <TypIcon className="size-3" />
                {typ.label}
              </span>
              <span className="text-xs text-muted-foreground font-mono ml-auto">
                {item.location}
              </span>
            </div>
            <p className="text-sm">{item.description}</p>
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              {item.suggestion}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function ReverseSpecView({ spec }: { spec: ArchaeologyResponse["reverseSpec"] }) {
  return (
    <div className="space-y-5">
      {/* User Story */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          用户故事
        </h4>
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-sm leading-relaxed">{spec.userStory}</p>
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          验收标准 ({spec.acceptanceCriteria.length})
        </h4>
        <div className="space-y-1.5">
          {spec.acceptanceCriteria.map((ac, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/10">
              <CircleCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm">{ac}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Contract */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          数据契约
        </h4>
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          {/* Inputs */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Database className="size-3" />
              输入
            </h5>
            <div className="space-y-1">
              {spec.dataContract.inputs.map((inp) => (
                <div key={inp.name} className="flex items-center gap-2 text-sm pl-5">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-primary">
                    {inp.name}
                  </code>
                  <code className="text-xs text-muted-foreground">{inp.type}</code>
                  <span className="text-xs text-muted-foreground/70">{inp.description}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Outputs */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Database className="size-3" />
              输出
            </h5>
            <div className="space-y-1">
              {spec.dataContract.outputs.map((out) => (
                <div key={out.name} className="flex items-center gap-2 text-sm pl-5">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-primary">
                    {out.name}
                  </code>
                  <code className="text-xs text-muted-foreground">{out.type}</code>
                  <span className="text-xs text-muted-foreground/70">{out.description}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Side effects */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              副作用
            </h5>
            <ul className="space-y-0.5 pl-5">
              {spec.dataContract.sideEffects.map((se, i) => (
                <li key={i} className="text-xs text-muted-foreground">{se}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* UX Sketch */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          UX 雏形
        </h4>
        <div className="rounded-lg border bg-muted/20 p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre">
            {spec.uxSketch}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── Tab definitions ───────────────────────────────────

type TabId = "tree" | "deps" | "debt" | "spec"

const tabs: { id: TabId; label: string; Icon: typeof FolderOpen }[] = [
  { id: "tree", label: "代码结构树", Icon: FolderOpen },
  { id: "deps", label: "依赖关系", Icon: Package },
  { id: "debt", label: "技术债务", Icon: AlertTriangle },
  { id: "spec", label: "反向 Spec", Icon: FileText },
]

// ─── Main component ────────────────────────────────────

export function ArchaeologyReport({ repoId = "default" }: { repoId?: string }) {
  const { data, error, isLoading } = useSWR<ArchaeologyResponse>(
    `/api/v1/brownfield/${repoId}/archaeology`,
    fetcher,
    { refreshInterval: 0 }
  )

  const [activeTab, setActiveTab] = useState<TabId>("tree")

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Archive className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">考古分析加载失败</p>
            <p className="text-xs text-muted-foreground">
              {error.message || "无法获取代码考古数据，请检查仓库 ID 是否正确"}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3">
          <p className="text-xs text-red-700 dark:text-red-400">
            原因: API 返回了错误。请确认目标仓库存在且 brownfield 模块已正确配置。
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const debtSummary = {
    critical: data.techDebt.filter((d) => d.severity === "critical").length,
    high: data.techDebt.filter((d) => d.severity === "high").length,
    medium: data.techDebt.filter((d) => d.severity === "medium").length,
    low: data.techDebt.filter((d) => d.severity === "low").length,
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">代码考古分析报告</h2>
            <p className="text-xs text-muted-foreground">
              {data.repoName} · 分析于{" "}
              {new Date(data.analyzedAt).toLocaleString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-500" />
            {debtSummary.critical} 严重
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-orange-500" />
            {debtSummary.high} 高
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-yellow-500" />
            {debtSummary.medium} 中
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-gray-400" />
            {debtSummary.low} 低
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map((tab) => {
          const Icon = tab.Icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors -mb-[1px] ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === "tree" && (
          <div className="rounded-lg border bg-muted/10 p-3 max-h-[500px] overflow-auto">
            <FileTreeNode node={data.fileTree} />
          </div>
        )}

        {activeTab === "deps" && (
          <DependencySection deps={data.dependencyGraph} />
        )}

        {activeTab === "debt" && (
          <TechDebtList items={data.techDebt} />
        )}

        {activeTab === "spec" && (
          <ReverseSpecView spec={data.reverseSpec} />
        )}
      </div>
    </div>
  )
}
