"use client"

import { useState, useEffect } from "react"
import { X, Save, Loader2 } from "lucide-react"
import type { AlertRule, AlertRouting } from "@/types/factory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AlertRuleFormProps {
  open: boolean
  rule?: AlertRule
  onClose: () => void
}

const routingOptions: { value: AlertRouting; label: string; desc: string }[] = [
  { value: "oncall", label: "SRE 值班", desc: "通知 SRE 值班人员" },
  { value: "opc", label: "对应产线 OPC", desc: "通知对应产线 OPC" },
  { value: "auto", label: "自动处置", desc: "触发自愈脚本" },
]

export function AlertRuleForm({ open, rule, onClose }: AlertRuleFormProps) {
  const [name, setName] = useState("")
  const [metric, setMetric] = useState("")
  const [condition, setCondition] = useState("")
  const [threshold, setThreshold] = useState("")
  const [notifyTarget, setNotifyTarget] = useState("")
  const [routing, setRouting] = useState<AlertRouting>("oncall")
  const [enabled, setEnabled] = useState(true)
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!rule

  useEffect(() => {
    if (open) {
      setName(rule?.name ?? "")
      setMetric(rule?.metric ?? "")
      setCondition(rule?.condition ?? "")
      setThreshold(rule?.threshold ?? "")
      setNotifyTarget(rule?.notifyTarget ?? "")
      setRouting(rule?.routing ?? "oncall")
      setEnabled(rule?.enabled ?? true)
      setDescription(rule?.description ?? "")
      setError("")
    }
  }, [open, rule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !metric || !condition || !threshold || !notifyTarget) {
      setError("请填写所有必填字段")
      return
    }

    setSubmitting(true)
    try {
      const method = isEditing ? "PUT" : "POST"
      const body = isEditing
        ? { id: rule!.id, name, metric, condition, threshold, notifyTarget, routing, enabled, description }
        : { name, metric, condition, threshold, notifyTarget, routing, enabled, description }

      const res = await fetch("/api/v1/sre/alerts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "保存失败")
        setSubmitting(false)
        return
      }

      onClose()
    } catch {
      setError("网络错误，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-xl border shadow-xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEditing ? "编辑告警规则" : "新增告警规则"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">规则名称 *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: Silent Gap"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">指标 *</label>
            <Input
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              placeholder="例: 需求产线 Spec 沉默缺口"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">条件 *</label>
              <Input
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="例: > 72h"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">阈值 *</label>
              <Input
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="例: 72h"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">通知目标 *</label>
            <Input
              value={notifyTarget}
              onChange={(e) => setNotifyTarget(e.target.value)}
              placeholder="例: SRE 值班人员"
            />
          </div>

          {/* Routing */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">分级路由 *</label>
            <div className="space-y-2">
              {routingOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    routing === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="routing"
                    value={opt.value}
                    checked={routing === opt.value}
                    onChange={() => setRouting(opt.value)}
                    className="size-4 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="告警规则描述（可选）"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">启用</label>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                backgroundColor: enabled ? "var(--color-emerald-500, #10b981)" : "var(--color-border, #d4d4d8)",
              }}
              role="switch"
              aria-checked={enabled}
            >
              <span
                className="pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform"
                style={{
                  transform: enabled ? "translateX(18px)" : "translateX(2px)",
                }}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {enabled ? "已启用" : "已禁用"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {isEditing ? "保存" : "创建"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
