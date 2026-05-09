import { NextResponse } from "next/server";

import type { DeliveryGateItem, DeliveryGateResponse } from "@/types/factory";

const gateItems: DeliveryGateItem[] = [
  // 需求产线
  {
    id: "dg-req-1",
    line: "requirement",
    lineLabel: "需求产线",
    name: "Spec 自洽性",
    description: "术语无冲突，逻辑无矛盾",
    status: "pass",
    detail: "14 个术语（3 份 Spec），0 冲突项",
  },
  {
    id: "dg-req-2",
    line: "requirement",
    lineLabel: "需求产线",
    name: "验收标准可测",
    description: "AC 覆盖率 ≥ 80%",
    status: "fail",
    detail: "「退款」Spec 缺少 2 个边界用例 AC，覆盖率 78%",
  },
  {
    id: "dg-req-3",
    line: "requirement",
    lineLabel: "需求产线",
    name: "歧义检测",
    description: "无模糊词汇和未量化指标",
    status: "fail",
    detail: "3 处歧义：「快速响应」「可靠」「立即」未量化",
  },

  // 编码产线
  {
    id: "dg-code-1",
    line: "coding",
    lineLabel: "编码产线",
    name: "Lint",
    description: "ESLint + Prettier 零告警",
    status: "pass",
    detail: "0 errors, 0 warnings",
  },
  {
    id: "dg-code-2",
    line: "coding",
    lineLabel: "编码产线",
    name: "Coverage ≥ 80%",
    description: "行覆盖率达标",
    status: "fail",
    detail: "行覆盖率 76%（阈值 80%），缺 payment.ts, refund.ts",
  },
  {
    id: "dg-code-3",
    line: "coding",
    lineLabel: "编码产线",
    name: "Pattern Check",
    description: "架构约定一致性",
    status: "pass",
    detail: "目录结构、命名规范、数据流模式均符合规范",
  },
  {
    id: "dg-code-4",
    line: "coding",
    lineLabel: "编码产线",
    name: "Spec-Code Drift",
    description: "代码与 Spec 无偏离",
    status: "warning",
    detail: "refund/handler.ts 函数签名与 Spec 不一致",
  },

  // 测试产线
  {
    id: "dg-test-1",
    line: "testing",
    lineLabel: "测试产线",
    name: "AC 覆盖率",
    description: "所有 AC 有对应用例",
    status: "waiting",
    detail: "等待测试流水线完成",
  },
  {
    id: "dg-test-2",
    line: "testing",
    lineLabel: "测试产线",
    name: "Flaky 检测",
    description: "无 Flaky 用例",
    status: "running",
    detail: "扫描中… 已检测 86/240 用例",
  },
  {
    id: "dg-test-3",
    line: "testing",
    lineLabel: "测试产线",
    name: "性能回归",
    description: "P95 延迟 ≤ 基线",
    status: "pass",
    detail: "P95 延迟 42ms（基线 50ms），达标",
  },

  // SRE 产线
  {
    id: "dg-sre-1",
    line: "sre",
    lineLabel: "SRE 产线",
    name: "SLO 达标",
    description: "5xx 率 ≤ 0.1%",
    status: "pass",
    detail: "当前 5xx 率: 0.03%",
  },
  {
    id: "dg-sre-2",
    line: "sre",
    lineLabel: "SRE 产线",
    name: "告警覆盖",
    description: "关键路径有告警规则",
    status: "pass",
    detail: "6/6 关键路径已配置告警",
  },
  {
    id: "dg-sre-3",
    line: "sre",
    lineLabel: "SRE 产线",
    name: "回滚就绪",
    description: "回滚预案已配置验证",
    status: "pass",
    detail: "回滚方案已验证，预计耗时 < 3min",
  },
  {
    id: "dg-sre-4",
    line: "sre",
    lineLabel: "SRE 产线",
    name: "Runbook 齐全",
    description: "所有服务有运维手册",
    status: "pass",
    detail: "4/4 服务均有 Runbook",
  },
];

export async function GET() {
  const passCount = gateItems.filter((i) => i.status === "pass").length;
  const allPass = gateItems.every((i) => i.status === "pass");
  const response: DeliveryGateResponse = {
    items: gateItems,
    allPass,
    canDeliver: allPass,
    passRate: passCount / gateItems.length,
  };
  return NextResponse.json(response);
}
