import { SreCheckerPanel } from "@/components/sre/SreCheckerPanel"
import { BugReflow } from "@/components/sre/BugReflow"

export default function SreCheckerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SRE 运维中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          SRE 发布门禁 与 Bug 回流管理
        </p>
      </div>
      <div className="max-w-2xl space-y-6">
        <BugReflow />
        <SreCheckerPanel />
      </div>
    </div>
  )
}
