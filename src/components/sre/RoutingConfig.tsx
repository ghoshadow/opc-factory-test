"use client"

import { X, Phone, Users, Bot, ArrowRight, Bell } from "lucide-react"
import type { AlertRule, AlertRouting } from "@/types/factory"

interface RoutingConfigProps {
  rule: AlertRule
  onClose: () => void
}

const routingDetails: Record<
  AlertRouting,
  { icon: typeof Phone; label: string; desc: string; color: string }
> = {
  oncall: {
    icon: Phone,
    label: "SRE 值班",
    desc: "告警触发后立即通知 SRE 值班人员，值班人员在 5min 内响应",
    color: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
  },
  opc: {
    icon: Users,
    label: "对应产线 OPC",
    desc: "告警触发后通知对应产线 OPC，由 OPC 评估后在 30min 内分发处理",
    color: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
  },
  auto: {
    icon: Bot,
    label: "自动处置",
    desc: "告警触发后自动执行预定义的自愈脚本，无需人工介入",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400",
  },
}

export function RoutingConfig({ rule, onClose }: RoutingConfigProps) {
  const activeRoute = routingDetails[rule.routing]
  const RouteIcon = activeRoute.icon

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">
            路由配置 — {rule.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 hover:bg-muted transition-colors"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Rule Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">指标</p>
          <p className="font-medium">{rule.metric}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">阈值</p>
          <p className="font-medium font-mono">{rule.threshold}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">条件</p>
          <p className="font-medium font-mono text-xs">{rule.condition}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">通知目标</p>
          <p className="font-medium">{rule.notifyTarget}</p>
        </div>
      </div>

      {/* Routing Flow */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          分级路由链
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Stage 1: Oncall */}
          <div
            className={`rounded-lg border px-4 py-3 ${
              rule.routing === "oncall"
                ? routingDetails.oncall.color
                : "opacity-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="size-4" />
              <span className="text-sm font-medium">值班</span>
            </div>
            <p className="text-xs mt-0.5">5min 响应</p>
          </div>

          <ArrowRight className="size-4 text-muted-foreground shrink-0" />

          {/* Stage 2: OPC */}
          <div
            className={`rounded-lg border px-4 py-3 ${
              rule.routing === "opc"
                ? routingDetails.opc.color
                : "opacity-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span className="text-sm font-medium">OPC</span>
            </div>
            <p className="text-xs mt-0.5">30min 分发</p>
          </div>

          <ArrowRight className="size-4 text-muted-foreground shrink-0" />

          {/* Stage 3: Auto */}
          <div
            className={`rounded-lg border px-4 py-3 ${
              rule.routing === "auto"
                ? routingDetails.auto.color
                : "opacity-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="size-4" />
              <span className="text-sm font-medium">自动处置</span>
            </div>
            <p className="text-xs mt-0.5">即时触发</p>
          </div>
        </div>
      </div>

      {/* Current active route */}
      <div className={`rounded-lg border p-4 ${activeRoute.color}`}>
        <div className="flex items-start gap-3">
          <RouteIcon className="size-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              当前路由: {activeRoute.label}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {activeRoute.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
