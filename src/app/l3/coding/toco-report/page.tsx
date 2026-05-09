import { TocoReport } from "@/components/coding/TocoReport"

export default function TocoReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">编码产线 · TocoAgent 检查报告</h1>
        <p className="text-sm text-muted-foreground mt-1">
          TocoAgent 自动检查代码质量，决定下一步回路：Checker / Developer / Designer
        </p>
      </div>
      <div className="max-w-2xl">
        <TocoReport />
      </div>
    </div>
  )
}
