"use client"

import { useState, useEffect } from "react"
import { Save, ArrowLeft, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import type { AlertRule, AlertRuleFormData, AlertCondition, AlertSeverity, AlertRoutingConfig } from "@/types/factory"
import { RoutingConfig } from "@/components/sre/RoutingConfig"
import { defaultRouting } from "@/lib/alert-constants"

interface AlertRuleFormProps {
  rule: AlertRule | null
  onBack: () => void
  onSaved: () => void
}

function newRuleTemplate(): AlertRuleFormData {
  return {
    name: "",
    metric: "",
    condition: "gt",
    threshold: 0,
    severity: "warning",
    enabled: true,
    routing: defaultRouting,
    description: "",
  }
}

export function AlertRuleForm({ rule, onBack, onSaved }: AlertRuleFormProps) {
  const isNew = !rule
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [metric, setMetric] = useState("")
  const [condition, setCondition] = useState<AlertCondition>("gt")
  const [threshold, setThreshold] = useState(0)
  const [severity, setSeverity] = useState<AlertSeverity>("warning")
  const [enabled, setEnabled] = useState(true)
  const [routing, setRouting] = useState<AlertRoutingConfig[]>(defaultRouting)
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (rule) {
      setName(rule.name)
      setMetric(rule.metric)
      setCondition(rule.condition)
      setThreshold(rule.threshold)
      setSeverity(rule.severity)
      setEnabled(rule.enabled)
      setRouting(rule.routing)
      setDescription(rule.description)
    } else {
      const tpl = newRuleTemplate()
      setName(tpl.name)
      setMetric(tpl.metric)
      setCondition(tpl.condition)
      setThreshold(tpl.threshold)
      setSeverity(tpl.severity)
      setEnabled(tpl.enabled)
      setRouting(tpl.routing)
      setDescription(tpl.description)
    }
  }, [rule])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        id: rule?.id,
        name,
        metric,
        condition,
        threshold,
        severity,
        enabled,
        routing,
        description,
      }
      const method = isNew ? "POST" : "PUT"
      const res = await fetch("/api/v1/sre/alerts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("保存失败")
      toast.success(isNew ? "告警规则已创建" : "告警规则已更新", {
        description: `「${name}」已成功保存`,
      })
      onSaved()
    } catch (e) {
      toast.error("保存失败", {
        description: e instanceof Error ? e.message : "请稍后重试",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleRouting = (target: string) => {
    setRouting((prev) =>
      prev.map((r) =>
        r.target === target ? { ...r, enabled: !r.enabled } : r
      )
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold">{isNew ? "新建告警规则" : `编辑: ${rule?.name}`}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              enabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {enabled ? <Power className="size-4" /> : <PowerOff className="size-4" />}
            {enabled ? "已启用" : "已禁用"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim() || !metric.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="size-4" />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Basic info */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">基本信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">规则名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如 F-2341: Silent Gap"
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">监控指标</label>
              <input
                type="text"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="如 payment_callback_5xx_rate"
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="告警规则描述"
              rows={2}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </section>

        {/* Condition */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">触发条件</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">条件</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AlertCondition)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="gt">大于 (&gt;)</option>
                <option value="lt">小于 (&lt;)</option>
                <option value="gte">大于等于 (≥)</option>
                <option value="lte">小于等于 (≤)</option>
                <option value="eq">等于 (=)</option>
                <option value="neq">不等于 (≠)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">阈值</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">严重级别</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="critical">严重 (Critical)</option>
                <option value="warning">警告 (Warning)</option>
                <option value="info">通知 (Info)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Routing config */}
        <RoutingConfig
          routing={routing}
          onToggle={handleToggleRouting}
        />
      </div>
    </div>
  )
}
