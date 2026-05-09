import { NextResponse } from "next/server"
import type { CodingCheckerResponse, CodingCheckerItem } from "@/types/factory"

const checkerData: CodingCheckerItem[] = [
  {
    id: "lint",
    name: "Lint 检查",
    description: "ESLint + Prettier 零告警",
    status: "pass",
    detail: "0 errors, 0 warnings (ESLint 9 + eslint-config-next)",
  },
  {
    id: "coverage",
    name: "测试覆盖率",
    description: "行覆盖率 ≥ 80%，分支覆盖率 ≥ 70%",
    status: "fail",
    detail: "行覆盖率 76%（阈值 80%），分支覆盖率 65%（阈值 70%）。缺: payment.ts, refund.ts",
    supplementLabel: "补充测试用例",
  },
  {
    id: "pattern",
    name: "模式合规",
    description: "架构约定与设计模式一致性",
    status: "pass",
    detail: "组件目录结构、命名规范、数据流模式均符合 OPC Factory 规范",
  },
  {
    id: "drift",
    name: "漂移检测",
    description: "代码实现与 Spec/Plan 一致性",
    status: "warning",
    detail: "refund/handler.ts 函数签名与 Spec 定义不一致：参数 orderId 在 Spec 中为 order_id",
    supplementLabel: "查看差异 →",
  },
]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prId: string }> }
) {
  const { prId } = await params
  const allPass = checkerData.every((item) => item.status === "pass")
  const response: CodingCheckerResponse = {
    items: checkerData,
    prId,
    allPass,
    canMerge: allPass,
  }
  return NextResponse.json(response)
}
