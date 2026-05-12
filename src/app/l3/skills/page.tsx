import { SkillsPanel } from "@/components/factory/SkillsPanel"

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">技能安装</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理和安装编码产线技能模块
        </p>
      </div>
      <SkillsPanel />
    </div>
  )
}
