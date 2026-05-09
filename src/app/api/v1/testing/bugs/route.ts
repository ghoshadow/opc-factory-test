import { NextResponse } from "next/server"
import type { Bug, BugTriageResponse, BugPriority } from "@/types/factory"

const bugs: Bug[] = [
  {
    id: "BUG-101",
    title: "订单提交后状态未更新",
    priority: "P0",
    module: "订单模块",
    status: "open",
    owner: "林",
    traceChain: [
      { id: "TC-42", type: "test_case", label: "测试用例", title: "订单提交流程验证" },
      { id: "AC-08", type: "ac", label: "验收标准", title: "订单状态实时更新" },
      { id: "SPEC-15", type: "spec", label: "Spec", title: "订单生命周期管理" },
    ],
    similarBugs: [
      { id: "BUG-103", title: "支付回调延迟导致状态不同步", similarity: 0.87 },
      { id: "BUG-118", title: "订单详情页状态标签不刷新", similarity: 0.72 },
    ],
  },
  {
    id: "BUG-102",
    title: "用户认证 Token 过期未自动刷新",
    priority: "P1",
    module: "认证模块",
    status: "in_progress",
    owner: "陈",
    traceChain: [
      { id: "TC-35", type: "test_case", label: "测试用例", title: "Token 刷新机制测试" },
      { id: "AC-12", type: "ac", label: "验收标准", title: "会话有效期自动续期" },
      { id: "SPEC-07", type: "spec", label: "Spec", title: "统一认证与授权" },
    ],
    similarBugs: [
      { id: "BUG-110", title: "OAuth 回调 URL 校验失败", similarity: 0.65 },
    ],
  },
  {
    id: "BUG-103",
    title: "支付回调延迟导致状态不同步",
    priority: "P1",
    module: "支付模块",
    status: "open",
    owner: "林",
    traceChain: [
      { id: "TC-50", type: "test_case", label: "测试用例", title: "支付回调幂等性测试" },
      { id: "AC-19", type: "ac", label: "验收标准", title: "支付结果实时同步" },
      { id: "SPEC-15", type: "spec", label: "Spec", title: "订单生命周期管理" },
    ],
    similarBugs: [
      { id: "BUG-101", title: "订单提交后状态未更新", similarity: 0.87 },
      { id: "BUG-118", title: "订单详情页状态标签不刷新", similarity: 0.68 },
    ],
  },
  {
    id: "BUG-104",
    title: "列表页分页跳转后筛选条件丢失",
    priority: "P2",
    module: "UI 组件",
    status: "open",
    owner: "王",
    traceChain: [
      { id: "TC-28", type: "test_case", label: "测试用例", title: "分页与筛选联动测试" },
      { id: "AC-05", type: "ac", label: "验收标准", title: "筛选状态持久化" },
      { id: "SPEC-11", type: "spec", label: "Spec", title: "数据列表通用组件" },
    ],
    similarBugs: [
      { id: "BUG-115", title: "搜索关键词在翻页后清除", similarity: 0.91 },
    ],
  },
  {
    id: "BUG-105",
    title: "导出 Excel 时日期格式不一致",
    priority: "P2",
    module: "报表模块",
    status: "resolved",
    owner: "李",
    traceChain: [
      { id: "TC-60", type: "test_case", label: "测试用例", title: "导出格式一致性测试" },
      { id: "AC-22", type: "ac", label: "验收标准", title: "报表格式标准化" },
      { id: "SPEC-20", type: "spec", label: "Spec", title: "报表导出功能" },
    ],
    similarBugs: [],
  },
  {
    id: "BUG-106",
    title: "移动端导航菜单按钮间距异常",
    priority: "P3",
    module: "UI 组件",
    status: "open",
    owner: "陈",
    traceChain: [
      { id: "TC-15", type: "test_case", label: "测试用例", title: "移动端适配测试" },
      { id: "AC-03", type: "ac", label: "验收标准", title: "响应式布局规范" },
      { id: "SPEC-03", type: "spec", label: "Spec", title: "UI 组件库规范" },
    ],
    similarBugs: [
      { id: "BUG-112", title: "iOS Safari 底部安全区未适配", similarity: 0.55 },
    ],
  },
  {
    id: "BUG-107",
    title: "WebSocket 断线重连次数超限后不告警",
    priority: "P1",
    module: "基础设施",
    status: "in_progress",
    owner: "王",
    traceChain: [
      { id: "TC-71", type: "test_case", label: "测试用例", title: "WebSocket 重连与告警测试" },
      { id: "AC-30", type: "ac", label: "验收标准", title: "连接异常自动告警" },
      { id: "SPEC-25", type: "spec", label: "Spec", title: "实时通信基础设施" },
    ],
    similarBugs: [
      { id: "BUG-119", title: "WebSocket 心跳超时导致假死", similarity: 0.83 },
    ],
  },
  {
    id: "BUG-108",
    title: "权限变更后缓存未清除",
    priority: "P2",
    module: "认证模块",
    status: "closed",
    owner: "林",
    traceChain: [
      { id: "TC-38", type: "test_case", label: "测试用例", title: "权限缓存失效测试" },
      { id: "AC-12", type: "ac", label: "验收标准", title: "权限变更实时生效" },
      { id: "SPEC-07", type: "spec", label: "Spec", title: "统一认证与授权" },
    ],
    similarBugs: [
      { id: "BUG-102", title: "用户认证 Token 过期未自动刷新", similarity: 0.61 },
    ],
  },
  {
    id: "BUG-109",
    title: "首页加载时偶发白屏",
    priority: "P0",
    module: "基础设施",
    status: "open",
    owner: "李",
    traceChain: [
      { id: "TC-01", type: "test_case", label: "测试用例", title: "首页渲染成功率测试" },
      { id: "AC-01", type: "ac", label: "验收标准", title: "首页可用性 99.9%" },
      { id: "SPEC-01", type: "spec", label: "Spec", title: "应用入口与路由" },
    ],
    similarBugs: [],
  },
]

// Sort by priority: P0 first, then P1, P2, P3
const priorityOrder: Record<BugPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 }

function sortByPriority(bugList: Bug[]): Bug[] {
  return [...bugList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export async function GET() {
  const sorted = sortByPriority(bugs)
  const response: BugTriageResponse = {
    bugs: sorted,
    total: sorted.length,
  }
  return NextResponse.json(response)
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, priority } = body as { id: string; priority: BugPriority }

    if (!id || !priority) {
      return NextResponse.json({ error: "Missing id or priority" }, { status: 400 })
    }

    if (!["P0", "P1", "P2", "P3"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    const bug = bugs.find((b) => b.id === id)
    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 })
    }

    bug.priority = priority as BugPriority
    const sorted = sortByPriority(bugs)
    return NextResponse.json({ bugs: sorted, total: sorted.length } as BugTriageResponse)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
