import { NextResponse } from "next/server"
import type { SreCheckerResponse, SreCheckerItem } from "@/types/factory"

const checkerData: SreCheckerItem[] = [
  {
    id: "slo-compliance",
    name: "SLO 达标",
    description: "支付回调 5xx 率 ≤ 0.1%",
    status: "pass",
    detail: "当前 5xx 率: 0.03%（窗口 1h），阈值 0.1%，达标",
  },
  {
    id: "alert-coverage",
    name: "告警覆盖",
    description: "所有关键路径有告警规则",
    status: "pass",
    detail: "6/6 关键路径已配置告警：支付、订单、认证、库存、通知、网关",
  },
  {
    id: "rollback-ready",
    name: "回滚就绪",
    description: "回滚预案已配置并验证",
    status: "pass",
    detail: "回滚方案已验证（2026-05-09 10:30），预计回滚耗时 < 3min",
    supplementLabel: "查看回滚手册",
  },
  {
    id: "data-migration",
    name: "数据迁移",
    description: "数据库迁移脚本已验证",
    status: "fail",
    detail: "迁移脚本 v2.1.0 (orders 表添加 payment_channel 列) 未通过验证 — 缺少回滚脚本",
    supplementLabel: "补充回滚脚本",
  },
  {
    id: "timeout-config",
    name: "超时声明",
    description: "所有外部接口有 timeout 配置",
    status: "warning",
    detail: "4/5 外部接口已配置：支付网关 (5s), 通知服务 (3s), 库存服务 (3s), 认证服务 (2s)。缺少: 网关路由",
    supplementLabel: "补充 timeout 配置",
  },
]

export async function GET() {
  const allPass = checkerData.every((item) => item.status === "pass")
  const response: SreCheckerResponse = {
    items: checkerData,
    allPass,
    canRelease: allPass,
  }
  return NextResponse.json(response)
}
