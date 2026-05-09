import { NextResponse } from "next/server"
import type { CodingOpsResponse, PipelineRun, PlanReviewItem, DesignReviewItem, TocoReportData, KanbanColumn } from "@/types/factory"

const pipeline: PipelineRun = {
  currentStageId: "code-stage-3",
  startedAt: new Date().toISOString(),
  stages: [
    { id: "code-stage-1", label: "分支创建", status: "done", subtext: "feature/refund-v2" },
    { id: "code-stage-2", label: "Lint 检查", status: "done", subtext: "0 errors" },
    { id: "code-stage-3", label: "单元测试", status: "running", subtext: "87% 通过…" },
    { id: "code-stage-4", label: "Code Review", status: "waiting", subtext: "待提交" },
    { id: "code-stage-5", label: "模式合规", status: "waiting", subtext: "待扫描" },
    { id: "code-stage-6", label: "漂移检测", status: "waiting", subtext: "待对比" },
    { id: "code-stage-7", label: "集成测试", status: "waiting", subtext: "待执行" },
    { id: "code-stage-8", label: "合并门禁", status: "waiting", subtext: "待审核" },
  ],
}

const planReview: PlanReviewItem[] = [
  { id: "pr-1", name: "函数签名一致性", description: "实现与 Spec 定义一致", status: "pass", detail: "12/12 函数签名匹配 Spec 定义" },
  { id: "pr-2", name: "错误处理覆盖", description: "所有异常路径有处理", status: "warning", detail: "refund/handler.ts 缺少 payment_timeout 异常处理" },
  { id: "pr-3", name: "数据模型对齐", description: "结构体字段与本体一致", status: "pass", detail: "8 个实体全部对齐本体定义" },
  { id: "pr-4", name: "接口契约检查", description: "API 入参/出参与 Spec 一致", status: "fail", detail: "POST /refund 返回体缺少 refund_id 字段" },
]

const designReview: DesignReviewItem[] = [
  { id: "dr-1", name: "目录结构规范", description: "遵循项目目录约定", status: "pass", detail: "handlers/, services/, models/ 结构符合规范" },
  { id: "dr-2", name: "依赖方向正确", description: "无反向依赖", status: "pass", detail: "依赖图无环，分层清晰" },
  { id: "dr-3", name: "抽象层级一致", description: "同层组件粒度匹配", status: "warning", detail: "payment/service.ts 粒度过细（3 个单行函数）" },
  { id: "dr-4", name: "命名规范", description: "遵循团队命名约定", status: "pass", detail: "所有导出符号符合 camelCase/PascalCase 约定" },
]

const tocoReport: TocoReportData = {
  metrics: { totalLines: 4320, changedLines: 187, filesChanged: 9, complexityDelta: -3 },
  findings: [
    { id: "TF-1", severity: "major", category: "安全", title: "未校验的输入参数", description: "refund/handler.ts:42 未对 amount 做非负校验", lineRef: "refund/handler.ts:42" },
    { id: "TF-2", severity: "minor", category: "性能", title: "N+1 查询风险", description: "order/services.ts:87 循环内执行数据库查询", lineRef: "order/services.ts:87" },
    { id: "TF-3", severity: "info", category: "风格", title: "Magic Number", description: "payment/calc.ts:15 使用裸数字 0.05 作为手续费率", lineRef: "payment/calc.ts:15" },
    { id: "TF-4", severity: "critical", category: "安全", title: "密钥硬编码", description: "config/provider.ts:8 包含疑似 API Key 的硬编码字符串", lineRef: "config/provider.ts:8" },
    { id: "TF-5", severity: "minor", category: "可维护性", title: "过长函数", description: "refund/handler.ts:processRefund 方法 87 行，建议拆分", lineRef: "refund/handler.ts:56-143" },
  ],
}

const kanbanColumns: KanbanColumn[] = [
  {
    id: "col-backlog",
    label: "待开发",
    items: [
      { id: "W-01", title: "退款单状态机实现", tags: ["核心", "P0"], owner: "林" },
      { id: "W-02", title: "支付渠道适配层", tags: ["基础设施", "P1"], owner: "陈" },
    ],
  },
  {
    id: "col-todo",
    label: "开发中",
    items: [
      { id: "W-03", title: "退款回调幂等处理", tags: ["核心", "P0"], owner: "林" },
      { id: "W-04", title: "手续费计算逻辑", tags: ["业务", "P1"], owner: "王" },
      { id: "W-05", title: "退款单列表查询", tags: ["查询", "P2"], owner: "李" },
    ],
  },
  {
    id: "col-review",
    label: "审查中",
    items: [
      { id: "W-06", title: "退款单创建 API", tags: ["API", "P0"], owner: "陈" },
      { id: "W-07", title: "通知服务集成", tags: ["集成", "P1"], owner: "王" },
    ],
  },
  {
    id: "col-done",
    label: "已完成",
    items: [
      { id: "W-08", title: "退款原因枚举定义", tags: ["数据模型", "P2"], owner: "李" },
      { id: "W-09", title: "错误码注册", tags: ["基础设施", "P1"], owner: "林" },
      { id: "W-10", title: "数据库迁移脚本", tags: ["数据", "P0"], owner: "陈" },
    ],
  },
]

export async function GET() {
  const response: CodingOpsResponse = {
    pipeline,
    planReview,
    designReview,
    tocoReport,
    kanban: { columns: kanbanColumns },
  }

  return NextResponse.json(response)
}
