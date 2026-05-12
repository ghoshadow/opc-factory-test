"use client"

import { Phone, Factory, Zap, Power, PowerOff } from "lucide-react"
import type { AlertRoutingConfig, AlertRoutingTarget } from "@/types/factory"

interface RoutingConfigProps {
  routing: AlertRoutingConfig[]
  onToggle: (target: string) => void
}

const targetMeta: Record<AlertRoutingTarget, { icon: typeof Phone; title: string; description: string }> = {
  oncall: {
    icon: Phone,
    title: "SRE 值班人员",
    description: "告警触发时通知当前值班 SRE",
  },
  opc: {
    icon: Factory,
    title: "对应产线 OPC",
    description: "通知对应产线的 OPC (Operation Controller)",
  },
  auto_remediation: {
    icon: Zap,
    title: "自愈触发",
    description: "触发自动处置流程，无需人工介入",
  },
}

export function RoutingConfig({ routing, onToggle }: RoutingConfigProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">分级路由配置</h3>
      <p className="text-xs text-muted-foreground">
        配置告警触发时的通知和处置路由，可同时启用多个目标
      </p>
      <div className="space-y-2">
        {routing.map((route) => {
          const meta = targetMeta[route.target]
          const Icon = meta.icon
          return (
            <button
              key={route.target}
              type="button"
              onClick={() => onToggle(route.target)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                route.enabled
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                  : "border-border bg-card hover:bg-accent/30"
              }`}
            >
              <div className={`shrink-0 rounded-lg p-2.5 ${
                route.enabled
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{meta.title}</h4>
                  {route.enabled ? (
                    <Power className="size-3 text-emerald-500" />
                  ) : (
                    <PowerOff className="size-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
              </div>
              <div className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                route.enabled
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {route.enabled ? "已启用" : "已禁用"}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
