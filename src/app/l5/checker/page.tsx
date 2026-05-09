import { SreCheckerPanel } from "@/components/sre/SreCheckerPanel"

export default function SreCheckerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SRE Checker 门禁</h1>
        <p className="text-sm text-muted-foreground mt-1">
          SRE 发布前五项质量检查
        </p>
      </div>
      <div className="max-w-2xl">
        <SreCheckerPanel />
      </div>
    </div>
  )
}
