"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bell, Search, Plus, Power, PowerOff, AlertTriangle, Info } from "lucide-react"
import type { AlertRuleListResponse, AlertRule } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"
import { conditionLabels } from "@/lib/alert-constants"

const fetcher = (url: string): Promise<AlertRuleListResponse> =>
  fetch(url).then((res) => res.json())

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    dot: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  info: {
    icon: Info,
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    dot: "bg-blue-500",
  },
} as const

interface AlertRuleListProps {
  onSelect: (rule: AlertRule) => void
  selectedId?: string
  onCreateNew: () => void
}

export function AlertRuleList({ onSelect, selectedId, onCreateNew }: AlertRuleListProps) {
  const [search, setSearch] = useState("")
  const { data, error, isLoading } = useSWR<AlertRuleListResponse>(
    "/api/v1/sre/alerts",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <Bell className="size-5 text-red-500" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取告警规则列表，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  const rules = data?.rules ?? []
  const filtered = search
    ? rules.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.metric.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
      )
    : rules

  return (
    <div className="flex flex-col h-full">
      {/* Search + Create */}
      <div className="p-4 space-y-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索告警规则..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="size-4" />
          新建告警规则
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "无匹配结果" : "暂无告警规则"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((rule) => {
              const sev = severityConfig[rule.severity]
              const SevIcon = sev.icon
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => onSelect(rule)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedId === rule.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-accent border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 rounded-full p-1 ${sev.badge}`}>
                      <SevIcon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold truncate">{rule.name}</h4>
                        {rule.enabled ? (
                          <Power className="size-3 text-emerald-500 shrink-0" />
                        ) : (
                          <PowerOff className="size-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{rule.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span className={`size-1.5 rounded-full ${sev.dot}`} />
                          {rule.metric}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conditionLabels[rule.condition]} {rule.threshold}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        共 {rules.length} 条规则
      </div>
    </div>
  )
}
