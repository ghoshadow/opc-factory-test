import { AlertRuleList } from "@/components/sre/AlertRuleList"

export default function SreAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">告警规则管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理告警规则、配置分级路由与通知目标
        </p>
      </div>
      <div className="max-w-4xl">
        <AlertRuleList />
      </div>
    </div>
  )
}
