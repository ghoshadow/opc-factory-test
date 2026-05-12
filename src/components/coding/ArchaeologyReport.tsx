"use client"

import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import {
  FolderTree,
  GitBranch,
  AlertTriangle,
  FileSearch,
  Folder,
  FileCode,
  Package,
  ChevronRight,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Bug,
  Gauge,
  Building2,
  BookOpen,
  CheckSquare,
  Database,
  Palette,
} from "lucide-react"
import type {
  ArchaeologyResponse,
  CodeTreeNode,
  TechDebtItem,
  TechDebtSeverity,
  TechDebtType,
} from "@/types/factory"
import type { ACItem, DataContract, DataContractField } from "@/types/spec"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<ArchaeologyResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch archaeology report")
    return res.json()
  })

type TabKey = "structure" | "dependencies" | "techdebt" | "reverseSpec"

const TABS: { key: TabKey; label: string; icon: typeof FolderTree }[] = [
  { key: "structure", label: "代码结构", icon: FolderTree },
  { key: "dependencies", label: "依赖关系", icon: GitBranch },
  { key: "techdebt", label: "技术债务", icon: AlertTriangle },
  { key: "reverseSpec", label: "逆向 Spec", icon: FileSearch },
]

// ─── Severity configs ───

const debtSeverityConfig: Record<
  TechDebtSeverity,
  { icon: typeof Bug; label: string; badgeClass: string; rowClass: string }
> = {
  critical: {
    icon: Bug,
    label: "严重",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    rowClass: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10",
  },
  major: {
    icon: AlertTriangle,
    label: "重要",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    rowClass: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10",
  },
  minor: {
    icon: Zap,
    label: "建议",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    rowClass: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10",
  },
}

const debtTypeConfig: Record<TechDebtType, { icon: typeof Shield; label: string }> = {
  security: { icon: Shield, label: "安全漏洞" },
  deprecated_api: { icon: Clock, label: "过时 API" },
  code_quality: { icon: Bug, label: "代码质量" },
  performance: { icon: Gauge, label: "性能问题" },
  architecture: { icon: Building2, label: "架构问题" },
}

// ─── Sub-components ───

function TreeNode({ node, depth = 0 }: { node: CodeTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isDir = node.type === "directory"

  return (
    <div className="select-none">
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        disabled={!hasChildren}
        className={cn(
          "flex items-center gap-1.5 w-full rounded px-2 py-1 text-left text-sm transition-colors hover:bg-muted/50",
          !hasChildren && "pl-6"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren && (
          <ChevronRight
            className={cn("size-3.5 text-muted-foreground transition-transform", expanded && "rotate-90")}
          />
        )}
        {isDir ? (
          <Folder className="size-3.5 text-amber-500 shrink-0" />
        ) : (
          <FileCode className="size-3.5 text-blue-500 shrink-0" />
        )}
        <span className={cn("truncate", isDir && "font-medium")}>{node.name}</span>
        {node.lines != null && (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums shrink-0">
            {node.lines} 行
          </span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function DebtRow({ item }: { item: TechDebtItem }) {
  const sev = debtSeverityConfig[item.severity]
  const typeCfg = debtTypeConfig[item.type]
  const SevIcon = sev.icon
  const TypeIcon = typeCfg.icon

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3", sev.rowClass)}>
      <div className={cn("mt-0.5 shrink-0 rounded-full p-1", sev.badgeClass)}>
        <SevIcon className="size-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium", sev.badgeClass)}>
            {sev.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <TypeIcon className="size-3" />
            {typeCfg.label}
          </span>
          <span className="text-xs font-mono text-muted-foreground/70">{item.location}</span>
        </div>
        <p className="text-xs text-foreground/80">{item.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">建议：</span>
          {item.suggestion}
        </p>
      </div>
    </div>
  )
}

function ReadOnlySpecPreview({
  userStory,
  acceptanceCriteria,
  dataContract,
  uxDraft,
}: {
  userStory: string
  acceptanceCriteria: ACItem[]
  dataContract: DataContract
  uxDraft: string
}) {
  const [tab, setTab] = useState<"userStory" | "acceptanceCriteria" | "dataContract" | "uxDraft">("userStory")

  const specTabs: { key: typeof tab; label: string; icon: typeof BookOpen }[] = [
    { key: "userStory", label: "User Story", icon: BookOpen },
    { key: "acceptanceCriteria", label: "验收标准 (AC)", icon: CheckSquare },
    { key: "dataContract", label: "数据契约", icon: Database },
    { key: "uxDraft", label: "UX 雏形", icon: Palette },
  ]

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex gap-1 rounded-t-lg bg-muted p-1 border-b">
        {specTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === "userStory" && (
          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
            {userStory}
          </pre>
        )}
        {tab === "acceptanceCriteria" && (
          <div className="space-y-3">
            {acceptanceCriteria.map((ac) => (
              <div key={ac.id} className="rounded-lg border bg-muted/30 p-3">
                <span className="text-xs font-medium text-muted-foreground">{ac.id}</span>
                <div className="mt-2 space-y-2 text-sm">
                  <p><span className="font-medium">Given</span> {ac.given}</p>
                  <p><span className="font-medium">When</span> {ac.when}</p>
                  <p><span className="font-medium">Then</span> {ac.then}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "dataContract" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold mb-2">输入字段</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium text-xs">字段名</th>
                    <th className="pb-2 pr-2 font-medium text-xs">类型</th>
                    <th className="pb-2 pr-2 font-medium text-xs">必填</th>
                    <th className="pb-2 font-medium text-xs">约束</th>
                  </tr>
                </thead>
                <tbody>
                  {dataContract.inputs.map((f: DataContractField, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 pr-2 text-xs">{f.name}</td>
                      <td className="py-1.5 pr-2 text-xs font-mono">{f.type}</td>
                      <td className="py-1.5 pr-2 text-xs">{f.required ? "是" : "否"}</td>
                      <td className="py-1.5 text-xs text-muted-foreground">{f.constraint || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-2">输出字段</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium text-xs">字段名</th>
                    <th className="pb-2 pr-2 font-medium text-xs">类型</th>
                    <th className="pb-2 pr-2 font-medium text-xs">必填</th>
                    <th className="pb-2 font-medium text-xs">约束</th>
                  </tr>
                </thead>
                <tbody>
                  {dataContract.outputs.map((f: DataContractField, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 pr-2 text-xs">{f.name}</td>
                      <td className="py-1.5 pr-2 text-xs font-mono">{f.type}</td>
                      <td className="py-1.5 pr-2 text-xs">{f.required ? "是" : "否"}</td>
                      <td className="py-1.5 text-xs text-muted-foreground">{f.constraint || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "uxDraft" && (
          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed bg-muted/30 rounded-lg p-4">
            {uxDraft}
          </pre>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───

interface ArchaeologyReportProps {
  projectId: string
}

export function ArchaeologyReport({ projectId }: ArchaeologyReportProps) {
  const { data, error, isLoading } = useSWR<ArchaeologyResponse>(
    `/api/v1/brownfield/${projectId}/archaeology`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const [activeTab, setActiveTab] = useState<TabKey>("structure")

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">考古分析加载失败</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {error ? error.message : "无法获取代码考古报告，请确认项目 ID 是否正确"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const report = data.report

  // Sort tech debt by severity
  const sortedDebt = [...report.techDebt].sort((a, b) => {
    const order: Record<TechDebtSeverity, number> = { critical: 0, major: 1, minor: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileSearch className="size-5 text-primary" />
              代码考古报告
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              项目 <span className="font-mono">{report.projectId}</span>
              {" · "}分析于 {new Date(report.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5" />
              逆向质量分:
              <span className={cn(
                "font-semibold tabular-nums",
                report.reverseSpec.qualityScore >= 0.7 ? "text-emerald-600" : "text-amber-600"
              )}>
                {(report.reverseSpec.qualityScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-none bg-muted/30 p-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* ── 1. Code Structure ── */}
        {activeTab === "structure" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderTree className="size-4" />
              <span>目录树结构</span>
              <span className="text-xs">
                ({countNodes(report.codeTree)} 个节点)
              </span>
            </div>
            <div className="rounded-lg border bg-muted/10 p-2 max-h-[500px] overflow-y-auto">
              <TreeNode node={report.codeTree} />
            </div>
          </div>
        )}

        {/* ── 2. Dependencies ── */}
        {activeTab === "dependencies" && (
          <div className="space-y-6">
            {/* Production deps */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package className="size-4 text-blue-500" />
                生产依赖 ({report.dependencies.production.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.dependencies.production.map((dep) => (
                  <div key={dep.name} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{dep.name}</span>
                      <span className="ml-2 text-xs font-mono text-muted-foreground">{dep.version}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{dep.usedBy.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev deps */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package className="size-4 text-purple-500" />
                开发依赖 ({report.dependencies.dev.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.dependencies.dev.map((dep) => (
                  <div key={dep.name} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{dep.name}</span>
                      <span className="ml-2 text-xs font-mono text-muted-foreground">{dep.version}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{dep.usedBy.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal module coupling */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="size-4 text-emerald-500" />
                内部模块耦合度
              </h3>
              <div className="space-y-1.5">
                {report.dependencies.internal.map((mod) => (
                  <div key={mod.name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                    <span className="text-sm font-medium w-24 shrink-0">{mod.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          mod.coupling > 0.8 ? "bg-red-400" : mod.coupling > 0.6 ? "bg-amber-400" : "bg-emerald-400"
                        )}
                        style={{ width: `${Math.round(mod.coupling * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground w-10 text-right">
                      {Math.round(mod.coupling * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependency graph description */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                依赖关系图 ({report.dependencies.graph.length} 条边)
              </h3>
              <div className="rounded-lg border bg-muted/20 p-3 max-h-[300px] overflow-y-auto">
                <div className="space-y-1">
                  {report.dependencies.graph.map((edge, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-foreground/80">{edge.source}</span>
                      <ChevronRight className="size-3 text-muted-foreground" />
                      <span className="font-mono text-foreground/80">{edge.target}</span>
                      {edge.label && (
                        <span className="text-muted-foreground">({edge.label})</span>
                      )}
                      <span className="ml-auto text-muted-foreground/60 tabular-nums">
                        耦合 {Math.round(edge.weight * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Technical Debt ── */}
        {activeTab === "techdebt" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="size-4" />
              <span>共 {sortedDebt.length} 条技术债务</span>
            </div>
            {sortedDebt.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border py-12 text-sm text-muted-foreground">
                未发现技术债务
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDebt.map((item) => (
                  <DebtRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4. Reverse Spec ── */}
        {activeTab === "reverseSpec" && (
          <div className="space-y-6">
            {/* Change history */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                历史变更模式
              </h3>
              <div className="space-y-2">
                {report.changeHistory.map((ch) => (
                  <div key={ch.period} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{ch.period}</span>
                      <span className="text-xs text-muted-foreground">
                        {ch.commits} commits · {ch.filesChanged} files
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ch.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-emerald-600">+{ch.insertions}</span>
                      <span className="text-red-600">-{ch.deletions}</span>
                      <span className="ml-auto">
                        主导者: {ch.topAuthors.join(", ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec preview */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileSearch className="size-4 text-primary" />
                逆向生成 Spec
              </h3>
              <ReadOnlySpecPreview
                userStory={report.reverseSpec.userStory}
                acceptanceCriteria={report.reverseSpec.acceptanceCriteria}
                dataContract={report.reverseSpec.dataContract}
                uxDraft={report.reverseSpec.uxDraft}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function countNodes(node: CodeTreeNode): number {
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child)
    }
  }
  return count
}
