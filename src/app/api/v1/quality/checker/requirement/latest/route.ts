import { NextResponse } from "next/server"
import type { ReqCheckerResponse, ReqCheckerItem } from "@/types/factory"

const checkerData: ReqCheckerItem[] = [
  {
    id: "terminology-consistency",
    name: "术语一致性",
    description: "跨 Spec 术语定义无冲突",
    status: "pass",
    detail: "已扫描 14 个术语（3 份 Spec），0 个冲突项",
    conflicts: [],
  },
  {
    id: "spec-completeness",
    name: "Spec 完整度",
    description: "必填字段齐全、AC 覆盖率 ≥ 80%",
    status: "warning",
    detail: "「退款」Spec 缺少 2 个边界用例 AC，当前覆盖率 78%",
    supplementLabel: "补充 AC 用例",
  },
  {
    id: "ambiguity-detection",
    name: "歧义检测",
    description: "模糊词汇和未量化指标识别",
    status: "fail",
    detail: "检测到 3 处歧义：「快速响应」未量化、「可靠」无 SLA、「立即」无时间定义",
    supplementLabel: "量化模糊指标",
  },
  {
    id: "cross-ref-validity",
    name: "交叉引用有效性",
    description: "所有 Spec 间引用链接有效",
    status: "pass",
    detail: "已校验 23 个交叉引用（本体 → Spec, Spec → Spec），0 个失效",
  },
]

export async function GET() {
  const allPass = checkerData.every((item) => item.status === "pass")
  const response: ReqCheckerResponse = {
    items: checkerData,
    specId: "latest",
    allPass,
    canRelease: allPass,
  }
  return NextResponse.json(response)
}
