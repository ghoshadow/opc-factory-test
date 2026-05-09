import { NextResponse } from "next/server"
import type { TocoReportResponse, TocoCheckItem } from "@/types/factory"

const tocoData: TocoCheckItem[] = [
  {
    id: "todo-scan",
    name: "Todo 扫描",
    description: "扫描代码中遗留的 TODO/FIXME/HACK 注释",
    status: "warning",
    detail: "发现 3 个 TODO, 1 个 FIXME, 0 个 HACK · 分布: src/components 2个, src/lib 1个, src/app 1个",
  },
  {
    id: "design-gap",
    name: "设计缺口检测",
    description: "检测是否存在未实现的设计项",
    status: "fail",
    detail: "2 个设计项未实现: 用户权限模块 (auth-rbac), 批量导出功能 (batch-export)",
  },
  {
    id: "coverage",
    name: "覆盖率回溯",
    description: "单元测试覆盖率是否 ≥ 80%（目标 83%）",
    status: "fail",
    detail: "当前覆盖率 78%，目标 83%，差距 -5%。未覆盖模块: src/lib/validation (62%), src/utils/format (71%)",
  },
  {
    id: "loop-status",
    name: "回路状态",
    description: "判断是否需要回退到 Designer 或 Developer",
    status: "fail",
    detail: "存在设计缺口，建议回退到 Designer 补齐设计后再进入编码",
  },
]

function determineLoopAction(items: TocoCheckItem[]): {
  loopAction: "designer" | "developer" | "checker"
  loopLabel: string
  loopDescription: string
} {
  const hasDesignGap = items.find((i) => i.id === "design-gap")?.status === "fail"
  const hasTodos = items.find((i) => i.id === "todo-scan")?.status !== "pass"

  if (hasDesignGap) {
    return {
      loopAction: "designer",
      loopLabel: "回退 Designer",
      loopDescription: "存在未实现的设计项，需先补齐设计文档再重新进入编码流程",
    }
  }

  if (hasTodos) {
    return {
      loopAction: "developer",
      loopLabel: "回退 Developer",
      loopDescription: "代码中存在遗留的 TODO/FIXME/HACK，需清理后再提交检查",
    }
  }

  return {
    loopAction: "checker",
    loopLabel: "进入 Checker",
    loopDescription: "所有检查项通过，可以进入 Checker 质量门禁",
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const loop = determineLoopAction(tocoData)

  const response: TocoReportResponse = {
    items: tocoData,
    loopAction: loop.loopAction,
    loopLabel: loop.loopLabel,
    loopDescription: loop.loopDescription,
  }

  return NextResponse.json(response)
}
