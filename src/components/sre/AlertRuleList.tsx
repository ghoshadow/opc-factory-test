"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Bell,
  Shield,
  Phone,
  Bot,
  Users,
} from "lucide-react"
import type { AlertRule, AlertRuleListResponse, AlertRouting } from "@/types/factory"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AlertRuleForm } from "./AlertRuleForm"
import { RoutingConfig } from "./RoutingConfig"

const fetcher = (url: string): Promise<AlertRuleListResponse> =>
  fetch(url).then((res) => res.json())

const routingLabels: Record<AlertRouting, string> = {
  oncall: "值班",
  opc: "OPC",
  auto: "自动处置",
}

const routingIcons: Record<AlertRouting, typeof Phone> = {
  oncall: Phone,
  opc: Users,
  auto: Bot,
}

export function AlertRuleList() {
  const { data, error, isLoading } = useSWR<AlertRuleListResponse>(
    "/api/v1/sre/alerts",
    fetcher,
    { refreshInterval: 15000 }
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | undefined>(undefined)
  const [selectedRule, setSelectedRule] = useState<AlertRule | undefined>(undefined)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleCreate = () => {
    setEditingRule(undefined)
    setFormOpen(true)
  }

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule)
    setFormOpen(true)
  }

  const handleDelete = async (rule: AlertRule) => {
    if (!confirm(`确认删除告警规则 "${rule.name}"?`)) return
    setDeleting(rule.id)
    try {
      await fetch("/api/v1/sre/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id }),
      })
      mutate("/api/v1/sre/alerts")
    } catch {
      // silent
    } finally {
      setDeleting(null)
    }
  }

  const handleToggle = async (rule: AlertRule) => {
    try {
      await fetch("/api/v1/sre/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      })
      mutate("/api/v1/sre/alerts")
    } catch {
      // silent
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingRule(undefined)
    mutate("/api/v1/sre/alerts")
  }

  const rules = data?.rules ?? []

  const columns = [
    { key: "name", header: "规则名称", sortable: true },
    { key: "metric", header: "指标", sortable: true },
    {
      key: "condition",
      header: "条件",
      sortable: true,
      render: (rule: AlertRule) => (
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {rule.condition}
        </span>
      ),
    },
    {
      key: "routing",
      header: "路由",
      sortable: true,
      render: (rule: AlertRule) => {
        const Icon = routingIcons[rule.routing]
        return (
          <span className="inline-flex items-center gap-1 text-xs">
            <Icon className="size-3 text-muted-foreground" />
            {routingLabels[rule.routing]}
          </span>
        )
      },
    },
    {
      key: "enabled",
      header: "状态",
      render: (rule: AlertRule) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggle(rule)
          }}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            backgroundColor: rule.enabled ? "var(--color-emerald-500, #10b981)" : "var(--color-border, #d4d4d8)",
          }}
          role="switch"
          aria-checked={rule.enabled}
        >
          <span
            className="pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform"
            style={{
              transform: rule.enabled ? "translateX(18px)" : "translateX(2px)",
            }}
          />
        </button>
      ),
      className: "w-20",
    },
    {
      key: "actions",
      header: "操作",
      render: (rule: AlertRule) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(rule)
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(rule)
            }}
            disabled={deleting === rule.id}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ]

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取告警规则数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">告警规则</h2>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.total} 条规则` : "加载中..."}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="size-4 mr-1" />
          新增规则
        </Button>
      </div>

      {/* Rules Table */}
      <DataTable
        columns={columns}
        data={rules}
        isLoading={isLoading}
        emptyMessage="暂无告警规则，点击「新增规则」创建"
        onRowClick={(rule) => setSelectedRule(rule)}
      />

      {/* Routing Config Panel */}
      {selectedRule && (
        <RoutingConfig
          rule={selectedRule}
          onClose={() => setSelectedRule(undefined)}
        />
      )}

      {/* Create/Edit Form */}
      <AlertRuleForm
        open={formOpen}
        rule={editingRule}
        onClose={handleFormClose}
      />
    </div>
  )
}
