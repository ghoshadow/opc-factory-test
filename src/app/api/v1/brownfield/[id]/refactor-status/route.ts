import { NextRequest, NextResponse } from "next/server"
import type {
  RefactorStatusResponse,
  RefactorPlan,
  RefactorPhase,
  CoverageData,
  DeliverableItem,
} from "@/types/factory"

const mockPlan: RefactorPlan = {
  id: "ref-plan-001",
  title: "退款模块安全重构",
  changes: [
    {
      id: "ch-1",
      file: "src/services/refund/handler.ts",
      description: "拆分 processRefund 方法，提取校验逻辑到独立函数",
      before: "单方法 87 行，包含校验/计算/持久化",
      after: "拆分为 validateRefund、calculateRefund、persistRefund 三个方法",
      linesChanged: 45,
    },
    {
      id: "ch-2",
      file: "src/services/refund/calculator.ts",
      description: "提取手续费计算为纯函数，移除对全局状态的依赖",
      before: "依赖全局 config 对象",
      after: "通过参数注入费率配置",
      linesChanged: 28,
    },
    {
      id: "ch-3",
      file: "src/models/refund.ts",
      description: "将 refund_status 从 string 改为 enum，提升类型安全",
      before: "type refund_status: string",
      after: "type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed'",
      linesChanged: 12,
    },
    {
      id: "ch-4",
      file: "src/api/refund/routes.ts",
      description: "统一错误响应格式，添加结构化错误码",
      before: "各处返回不同格式的错误消息",
      after: "统一 { error: { code, message, detail } } 格式",
      linesChanged: 34,
    },
  ],
  impacts: [
    {
      id: "imp-1",
      area: "退款处理流程",
      description: "方法拆分后调用链从 1 层变 3 层，需确认调用方无直接依赖内部实现",
      severity: "medium",
      affectedFiles: ["src/services/refund/handler.ts", "src/api/refund/routes.ts"],
    },
    {
      id: "imp-2",
      area: "费率计算",
      description: "移除全局状态依赖后，所有调用方需显式传入费率配置",
      severity: "low",
      affectedFiles: ["src/services/refund/calculator.ts", "src/services/payment/handler.ts"],
    },
    {
      id: "imp-3",
      area: "数据模型",
      description: "枚举类型变更影响所有消费 refund_status 的组件",
      severity: "medium",
      affectedFiles: ["src/models/refund.ts", "src/frontend/components/RefundStatus.tsx"],
    },
    {
      id: "imp-4",
      area: "API 契约",
      description: "错误格式变更影响前端错误处理逻辑",
      severity: "high",
      affectedFiles: ["src/api/refund/routes.ts", "src/frontend/hooks/useRefund.ts"],
    },
  ],
  risks: [
    {
      id: "risk-1",
      title: "行为回归风险",
      description: "拆分后方法调用时序可能与原有顺序不一致，导致副作用顺序改变",
      level: "medium",
      mitigation: "重构后执行完整回归测试套件，对比重构前后 API 响应快照",
    },
    {
      id: "risk-2",
      title: "类型兼容风险",
      description: "枚举类型变更在运行时仍为 string，但编译期类型收窄可能导致遗漏分支",
      level: "low",
      mitigation: "添加 exhaustive check 的 switch 语句，编译期强制覆盖所有分支",
    },
    {
      id: "risk-3",
      title: "API 兼容风险",
      description: "错误格式变更可能影响未迁移的前端页面或外部集成方",
      level: "high",
      mitigation: "保留旧格式兼容层 2 周，通过 Deprecation header 通知调用方迁移",
    },
  ],
  estimatedHours: 6,
}

const mockDeliverables: DeliverableItem[] = [
  { type: "code", label: "代码变更", description: "4 个文件，+87 / -53 行", status: "ready", detail: "refund/handler.ts (+22/-18), refund/calculator.ts (+28/-0), models/refund.ts (+12/-3), api/refund/routes.ts (+25/-32)" },
  { type: "spec", label: "Spec 文档", description: "退款模块行为规格 v2.3", status: "ready", detail: "更新 3 条 AC，新增 2 个边界条件场景" },
  { type: "doc", label: "技术文档", description: "重构决策记录 + API 变更日志", status: "ready", detail: "ADR-004: 退款模块拆分策略, CHANGELOG.md: 错误格式迁移指南" },
  { type: "test_report", label: "测试报告", description: "覆盖率 87.3% · 42 个测试用例", status: "ready", detail: "单元测试 31 通过, 集成测试 11 通过, 回归测试全绿" },
]

function buildCoverage(phase: RefactorPhase): CoverageData | null {
  if (phase === "analyzing") return null
  return {
    overall: phase === "refactoring" ? 62.5 : phase === "validating" ? 78.2 : 87.3,
    target: 80,
    byFile: [
      { file: "src/services/refund/handler.ts", coverage: phase === "complete" ? 92.1 : phase === "validating" ? 81.3 : 65.4 },
      { file: "src/services/refund/calculator.ts", coverage: phase === "complete" ? 95.0 : phase === "validating" ? 88.2 : 70.1 },
      { file: "src/models/refund.ts", coverage: phase === "complete" ? 100 : phase === "validating" ? 95.0 : 72.0 },
      { file: "src/api/refund/routes.ts", coverage: phase === "complete" ? 85.7 : phase === "validating" ? 76.5 : 58.3 },
    ],
    updatedAt: new Date().toISOString(),
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Simulate phase progression for demo
  const phases: RefactorPhase[] = ["analyzing", "refactoring", "validating", "complete"]
  const phaseIndex = Math.min(
    phases.length - 1,
    Math.floor(Date.now() / 1000 / 15 + id.charCodeAt(0)) % phases.length
  )
  const phase = phases[phaseIndex]
  const progress = { analyzing: 15, refactoring: 40, validating: 75, complete: 100 }[phase]

  const response: RefactorStatusResponse = {
    id,
    plan: mockPlan,
    phase,
    progress,
    coverage: buildCoverage(phase),
    deliverables: phase === "complete" ? mockDeliverables : [],
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: phase === "complete" ? new Date().toISOString() : null,
  }

  return NextResponse.json(response)
}
