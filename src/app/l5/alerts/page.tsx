"use client"

import { useState, useCallback } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Bell, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { AlertRule, AlertRuleListResponse } from "@/types/factory"
import { AlertRuleList } from "@/components/sre/AlertRuleList"
import { AlertRuleForm } from "@/components/sre/AlertRuleForm"
import { conditionLabels, severityLabels, targetLabels } from "@/lib/alert-constants"

const fetcher = (url: string): Promise<AlertRuleListResponse> =>
  fetch(url).then((res) => res.json())

type ViewMode = "list" | "editor" | "detail"

export default function AlertsPage() {
  const [selected, setSelected] = useState<AlertRule | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [deleting, setDeleting] = useState(false)
  const { mutate } = useSWRConfig()

  const handleSelect = useCallback((rule: AlertRule) => {
    setSelected(rule)
    setViewMode("detail")
  }, [])

  const handleCreateNew = useCallback(() => {
    setSelected(null)
    setViewMode("editor")
  }, [])

  const handleBack = useCallback(() => {
    setViewMode("list")
    setSelected(null)
  }, [])

  const handleSaved = useCallback(() => {
    mutate("/api/v1/sre/alerts")
    setViewMode("list")
    setSelected(null)
  }, [mutate])

  const handleEdit = useCallback(() => {
    if (selected) {
      setViewMode("editor")
    }
  }, [selected])

  const handleDelete = useCallback(async () => {
    if (!selected) return
    setDeleting(true)
    try {
      const res = await fetch("/api/v1/sre/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      })
      if (!res.ok) throw new Error("删除失败")
      toast.success("告警规则已删除", {
        description: `「${selected.name}」已成功移除`,
      })
      mutate("/api/v1/sre/alerts")
      setViewMode("list")
      setSelected(null)
    } catch (e) {
      toast.error("删除失败", {
        description: e instanceof Error ? e.message : "请稍后重试",
      })
    } finally {
      setDeleting(false)
    }
  }, [selected, mutate])

  // Refetch data for detail view
  const { data } = useSWR<AlertRuleListResponse>(
    viewMode === "detail" ? "/api/v1/sre/alerts" : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const latestRule = selected && data
    ? data.rules.find((r) => r.id === selected.id) ?? selected
    : selected

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Page header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">告警规则管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              告警规则 CRUD · 分级路由配置 · 启用/禁用开关
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
            {/* Left panel: Rule list */}
            <div className="border-r border-border overflow-hidden">
              <AlertRuleList
                onSelect={handleSelect}
                onCreateNew={handleCreateNew}
                selectedId={selected?.id}
              />
            </div>

            {/* Right panel: empty state */}
            <div className="hidden md:flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <Bell className="size-12 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground">选择一条告警规则查看详情</p>
                <p className="text-xs text-muted-foreground/60">
                  或点击"新建告警规则"创建规则
                </p>
              </div>
            </div>
          </div>
        )}

        {viewMode === "editor" && (
          <div className="h-full">
            <AlertRuleForm
              rule={latestRule}
              onBack={handleBack}
              onSaved={handleSaved}
            />
          </div>
        )}

        {viewMode === "detail" && latestRule && (
          <div className="h-full overflow-auto">
            {/* Detail header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 text-sm rounded-lg border border-input hover:bg-accent transition-colors"
                >
                  返回列表
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{latestRule.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {latestRule.metric} · {latestRule.enabled ? "已启用" : "已禁用"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="size-4" />
                  {deleting ? "删除中..." : "删除"}
                </button>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  编辑
                </button>
              </div>
            </div>

            {/* Detail body */}
            <div className="px-6 py-6 space-y-8 max-w-3xl">
              {/* Description */}
              <section>
                <p className="text-sm text-muted-foreground">{latestRule.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  创建于 {new Date(latestRule.createdAt).toLocaleDateString("zh-CN")} · 更新于 {new Date(latestRule.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </section>

              {/* Trigger condition */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  触发条件
                </h3>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">指标</p>
                      <p className="font-mono font-medium">{latestRule.metric}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">条件</p>
                      <p className="font-medium">
                        {conditionLabels[latestRule.condition]} {latestRule.threshold}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">严重级别</p>
                      <p className="font-medium">{severityLabels[latestRule.severity]}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Routing config */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500" />
                  分级路由配置
                </h3>
                <div className="space-y-2">
                  {latestRule.routing.map((route) => {
                    const enabled = route.enabled
                    return (
                      <div
                        key={route.target}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          enabled
                            ? "border-primary/20 bg-primary/5"
                            : "border-border bg-muted/20"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{route.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {targetLabels[route.target] || route.target}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          enabled
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {enabled ? "已启用" : "已禁用"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
