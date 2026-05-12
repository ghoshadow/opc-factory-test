import { TestCaseList } from "@/components/testing/TestCaseList"

export default function TestCasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">测试用例</h1>
        <p className="text-sm text-muted-foreground mt-1">
          测试场景管理，支持按 AC 维度展开用例并逐步骤执行验证
        </p>
      </div>
      <TestCaseList />
    </div>
  )
}
