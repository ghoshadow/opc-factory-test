import { AlertList } from "@/components/factory/AlertList"

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">告警与阻塞通知</h1>
        <p className="text-sm text-muted-foreground mt-1">
          按紧急程度展示工厂告警，支持分级路由
        </p>
      </div>

      <AlertList />
    </div>
  )
}
