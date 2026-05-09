import { ArchaeologyReport } from "@/components/coding/ArchaeologyReport"

export default function ArchaeologyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">代码考古 & 反向 Spec</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Brownfield 模式下的代码结构分析、依赖关系、技术债务评估与逆向 Spec 生成
        </p>
      </div>
      <ArchaeologyReport />
    </div>
  )
}
