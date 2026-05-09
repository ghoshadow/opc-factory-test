import { NextResponse } from "next/server";

import type { KanbanColumn, PipelineRun, TestCase, TestingOpsResponse } from "@/types/factory";

const pipeline: PipelineRun = {
  currentStageId: "stage-4",
  startedAt: new Date().toISOString(),
  stages: [
    { id: "stage-1", label: "单元测试", status: "done", subtext: "1,240 通过" },
    { id: "stage-2", label: "集成测试", status: "done", subtext: "86 通过" },
    { id: "stage-3", label: "端到端测试", status: "done", subtext: "42 通过" },
    { id: "stage-4", label: "性能测试", status: "running", subtext: "进行中…" },
    { id: "stage-5", label: "安全扫描", status: "waiting", subtext: "待执行" },
    { id: "stage-6", label: "回归测试", status: "waiting", subtext: "待执行" },
    { id: "stage-7", label: "Bug 分诊", status: "waiting", subtext: "9 个待处理" },
    { id: "stage-8", label: "质量门禁", status: "waiting", subtext: "待审核" },
  ],
};

const testCases: TestCase[] = [
  {
    id: "TC-001",
    title: "用户登录流程验证",
    status: "pass",
    priority: "high",
    stage: "端到端测试",
    owner: "林",
    duration: "2.3s",
    bugRef: null,
  },
  {
    id: "TC-002",
    title: "订单创建 API 幂等性",
    status: "pass",
    priority: "high",
    stage: "集成测试",
    owner: "陈",
    duration: "1.1s",
    bugRef: null,
  },
  {
    id: "TC-003",
    title: "支付回调状态同步",
    status: "fail",
    priority: "high",
    stage: "集成测试",
    owner: "林",
    duration: "3.8s",
    bugRef: "BUG-101",
  },
  {
    id: "TC-004",
    title: "列表分页筛选联动",
    status: "pass",
    priority: "medium",
    stage: "单元测试",
    owner: "王",
    duration: "0.4s",
    bugRef: null,
  },
  {
    id: "TC-005",
    title: "Token 过期自动刷新",
    status: "fail",
    priority: "high",
    stage: "集成测试",
    owner: "陈",
    duration: "5.2s",
    bugRef: "BUG-102",
  },
  {
    id: "TC-006",
    title: "WebSocket 断线重连",
    status: "running",
    priority: "medium",
    stage: "单元测试",
    owner: "王",
    duration: "—",
    bugRef: null,
  },
  {
    id: "TC-007",
    title: "移动端响应式布局检查",
    status: "pass",
    priority: "low",
    stage: "端到端测试",
    owner: "李",
    duration: "8.1s",
    bugRef: null,
  },
  {
    id: "TC-008",
    title: "权限变更缓存失效验证",
    status: "pass",
    priority: "medium",
    stage: "集成测试",
    owner: "林",
    duration: "1.7s",
    bugRef: null,
  },
  {
    id: "TC-009",
    title: "导出数据日期格式一致性",
    status: "pass",
    priority: "low",
    stage: "单元测试",
    owner: "李",
    duration: "0.6s",
    bugRef: null,
  },
  {
    id: "TC-010",
    title: "首页渲染可用性检查",
    status: "fail",
    priority: "high",
    stage: "端到端测试",
    owner: "李",
    duration: "12.4s",
    bugRef: "BUG-109",
  },
];

const passCount = testCases.filter((tc) => tc.status === "pass").length;

const kanbanColumns: KanbanColumn[] = [
  {
    id: "col-todo",
    label: "待测试",
    items: [
      { id: "K-01", title: "安全扫描 - SQL 注入检查", tags: ["安全", "P0"], owner: "王" },
      { id: "K-02", title: "性能基准 - 首页加载", tags: ["性能", "P1"], owner: "李" },
      { id: "K-03", title: "兼容性测试 - iOS Safari", tags: ["兼容性", "P2"], owner: "陈" },
    ],
  },
  {
    id: "col-in-progress",
    label: "测试中",
    items: [
      { id: "K-04", title: "WebSocket 心跳机制验证", tags: ["基础设施", "P1"], owner: "王" },
      { id: "K-05", title: "OAuth 回调 URL 校验", tags: ["认证", "P1"], owner: "林" },
    ],
  },
  {
    id: "col-done",
    label: "已完成",
    items: [
      { id: "K-06", title: "用户注册表单验证", tags: ["UI", "P2"], owner: "李" },
      { id: "K-07", title: "订单状态机流转", tags: ["核心", "P0"], owner: "陈" },
      { id: "K-08", title: "API 限流策略验证", tags: ["安全", "P1"], owner: "王" },
      { id: "K-09", title: "日志聚合检查", tags: ["可观测性", "P3"], owner: "李" },
    ],
  },
  {
    id: "col-blocked",
    label: "已阻塞",
    items: [{ id: "K-10", title: "第三方支付 Mock 环境", tags: ["外部依赖", "P0"], owner: "林" }],
  },
];

export async function GET() {
  const response: TestingOpsResponse = {
    pipeline,
    testCases: {
      cases: testCases,
      passRate: passCount / testCases.length,
      total: testCases.length,
    },
    kanban: { columns: kanbanColumns },
  };

  return NextResponse.json(response);
}
