import { NextResponse } from "next/server";
import type { Alert } from "@/lib/types";

const alerts: Alert[] = [
  {
    id: "F-2341",
    description: "Silent Gap — 需求产线 Spec 存在静默缺口",
    severity: "urgent",
    route: "OPC",
    productionLine: "需求产线",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "F-2360",
    description: "drift — 编码产线 Spec-Code 漂移",
    severity: "warning",
    route: "值班",
    productionLine: "编码产线",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "F-2375",
    description: "测试覆盖率下降 — 测试产线覆盖率低于 80% 阈值",
    severity: "warning",
    route: "自动处置",
    productionLine: "测试产线",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "F-2390",
    description: "部署失败 — SRE 产线 staging 环境部署失败",
    severity: "urgent",
    route: "值班",
    productionLine: "SRE产线",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "F-2401",
    description: "依赖过期 — 编码产线 3 个依赖存在安全漏洞",
    severity: "warning",
    route: "OPC",
    productionLine: "编码产线",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(alerts);
}
