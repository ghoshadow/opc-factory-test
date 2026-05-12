import { NextResponse } from "next/server"
import type { ReflowBug, ReflowTimelineEntry } from "@/types/factory"

const reflowBugs: ReflowBug[] = [
  {
    id: "BUG-201",
    title: "支付回调超时导致订单状态不一致",
    description: "## 现象\n支付回调接口偶发超时（>5s），导致订单状态停留在\"待支付\"，用户已扣款但订单未更新。\n\n## 影响\n日均影响约 15 单，用户投诉率 0.3%。\n\n## 来源\nIncident Agent 自动检测告警生成",
    priority: "P0",
    module: "支付模块",
    status: "open",
    source: "Incident Agent",
    createdAt: "2026-05-09T08:15:00Z",
    timeline: [
      {
        id: "t1",
        status: "open",
        label: "Bug 单生成",
        description: "Incident Agent 检测到支付回调超时告警，自动生成 Bug 单",
        timestamp: "2026-05-09T08:15:00Z",
      },
    ],
  },
  {
    id: "BUG-202",
    title: "数据库连接池耗尽导致服务降级",
    description: "## 现象\n高峰期数据库连接池耗尽（max=100），导致部分请求返回 503。\n\n## 影响\n持续约 8 分钟，影响约 200 个请求。\n\n## 来源\nSRE 监控告警触发",
    priority: "P1",
    module: "基础设施",
    status: "open",
    source: "SRE Monitor",
    createdAt: "2026-05-09T09:30:00Z",
    timeline: [
      {
        id: "t1",
        status: "open",
        label: "Bug 单生成",
        description: "SRE 监控系统检测到连接池耗尽告警，自动创建 Bug 单",
        timestamp: "2026-05-09T09:30:00Z",
      },
    ],
  },
  {
    id: "BUG-203",
    title: "缓存雪崩导致首页加载超时",
    description: "## 现象\n缓存集中过期导致数据库瞬时 QPS 飙升至 5000+，首页加载耗时 > 10s。\n\n## 影响\n持续约 15 分钟，影响全部用户。\n\n## 来源\nIncident Agent 自动检测",
    priority: "P0",
    module: "基础设施",
    status: "reflowed_to_intake",
    source: "Incident Agent",
    createdAt: "2026-05-08T14:00:00Z",
    timeline: [
      {
        id: "t1",
        status: "open",
        label: "Bug 单生成",
        description: "Incident Agent 检测到首页响应超时告警，自动生成 Bug 单",
        timestamp: "2026-05-08T14:00:00Z",
      },
      {
        id: "t2",
        status: "reflowed_to_intake",
        label: "已回流至 Intake",
        description: "SRE OPC 确认 Bug 内容并回流至需求产线 Intake",
        timestamp: "2026-05-08T14:30:00Z",
      },
      {
        id: "t3",
        status: "coding_in_progress",
        label: "编码产线处理中",
        description: "需求产线已接收，编码产线正在进行修复",
        timestamp: "2026-05-09T10:00:00Z",
      },
    ],
  },
  {
    id: "BUG-204",
    title: "消息队列积压导致通知延迟",
    description: "## 现象\nKafka consumer lag 超过 10000，用户通知延迟 > 30min。\n\n## 影响\nPush 通知和邮件通知大面积延迟。\n\n## 来源\nSRE 监控告警触发",
    priority: "P1",
    module: "通知服务",
    status: "fixed",
    source: "SRE Monitor",
    createdAt: "2026-05-07T11:00:00Z",
    timeline: [
      {
        id: "t1",
        status: "open",
        label: "Bug 单生成",
        description: "SRE 监控检测到 Kafka 消费延迟告警",
        timestamp: "2026-05-07T11:00:00Z",
      },
      {
        id: "t2",
        status: "reflowed_to_intake",
        label: "已回流至 Intake",
        description: "SRE OPC 确认 Bug 内容并回流至需求产线",
        timestamp: "2026-05-07T11:20:00Z",
      },
      {
        id: "t3",
        status: "coding_in_progress",
        label: "编码产线处理中",
        description: "编码产线已接收，进行 consumer 扩容和代码修复",
        timestamp: "2026-05-07T14:00:00Z",
      },
      {
        id: "t4",
        status: "fixed",
        label: "已修复",
        description: "consumer 扩容至 20 实例，添加积压监控告警规则",
        timestamp: "2026-05-08T09:00:00Z",
      },
    ],
  },
]

export async function GET() {
  const response = { bugs: reflowBugs, total: reflowBugs.length }
  return NextResponse.json(response)
}
