import { NextRequest, NextResponse } from "next/server"
import type { Runbook, RunbookListResponse, TroubleshootNode } from "@/types/factory"

const sampleTroubleshootTree: TroubleshootNode[] = [
  {
    id: "ts-1",
    question: "服务无法启动",
    steps: ["检查端口是否被占用: lsof -i :3000", "检查环境变量配置: cat .env", "查看启动日志: tail -f logs/app.log"],
    solution: "释放被占用端口或修改端口配置，确保环境变量完整",
    children: [
      {
        id: "ts-1-1",
        question: "端口被占用",
        steps: ["lsof -i :3000 查看占用进程", "kill -9 <PID> 终止进程"],
        solution: "终止占用进程后重启服务",
      },
      {
        id: "ts-1-2",
        question: "环境变量缺失",
        steps: ["对比 .env.example 与 .env", "补充缺失的环境变量"],
        solution: "参考 .env.example 补全所有必填变量",
      },
    ],
  },
  {
    id: "ts-2",
    question: "数据库连接失败",
    steps: ["检查数据库服务状态: systemctl status postgresql", "验证连接字符串: echo $DATABASE_URL", "测试网络连通性: telnet <db-host> 5432"],
    solution: "确认数据库服务运行正常，连接字符串正确，网络可达",
    children: [
      {
        id: "ts-2-1",
        question: "连接超时",
        steps: ["检查安全组/防火墙规则", "确认数据库允许来源 IP"],
        solution: "添加来源 IP 到数据库白名单",
      },
    ],
  },
  {
    id: "ts-3",
    question: "内存使用过高",
    steps: ["top -o MEM 查看内存占用进程", "检查是否有内存泄漏: 对比历史内存趋势", "检查 GC 日志"],
    solution: "重启服务释放内存，排查内存泄漏根因",
  },
]

const sampleRunbooks: Runbook[] = [
  {
    id: "rb-001",
    name: "支付服务运维手册",
    description: "支付网关服务的启动、停止、扩容及故障排查",
    service: "payment-gateway",
    version: 3,
    startStopSteps: [
      "1. 确认依赖服务就绪: Redis (6379), PostgreSQL (5432)",
      "2. 执行数据库迁移: npm run db:migrate",
      "3. 启动服务: pm2 start ecosystem.config.js --only payment-gateway",
      "4. 验证健康检查: curl http://localhost:3001/health",
      "5. 停止服务: pm2 stop payment-gateway",
    ],
    scaleSteps: [
      "1. 评估当前负载: 检查 CPU/Memory/QPS 指标",
      "2. 调整实例数: pm2 scale payment-gateway +2",
      "3. 更新负载均衡: 添加新实例到 upstream",
      "4. 验证流量分发: 检查 Nginx 日志确认负载均衡生效",
    ],
    troubleshootTree: sampleTroubleshootTree,
    emergencyPlan: "## 应急响应\n\n### 完全宕机\n1. 触发 PagerDuty 告警\n2. 回滚至上一个稳定版本\n3. 切换至备用支付通道\n\n### 部分降级\n1. 启用限流模式\n2. 关闭非核心功能\n3. 扩容实例数",
    topologyExport: "digraph { payment_gateway -> redis; payment_gateway -> postgresql; payment_gateway -> notification_service; }",
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-05-09T10:30:00Z",
  },
  {
    id: "rb-002",
    name: "订单服务运维手册",
    description: "订单核心服务的运维操作指南",
    service: "order-service",
    version: 2,
    startStopSteps: [
      "1. 确认 Kafka 集群正常",
      "2. 启动服务: pm2 start ecosystem.config.js --only order-service",
      "3. 验证健康检查: curl http://localhost:3002/health",
      "4. 停止服务: pm2 stop order-service",
    ],
    scaleSteps: [
      "1. 检查 Kafka 消费延迟",
      "2. 调整消费者实例数: pm2 scale order-service +3",
      "3. 观察消费延迟下降",
    ],
    troubleshootTree: [
      {
        id: "ts-4",
        question: "订单创建延迟高",
        steps: ["检查数据库慢查询", "检查 Kafka 生产延迟", "检查下游服务响应时间"],
        solution: "优化慢查询索引，扩容 Kafka 分区",
      },
    ],
    emergencyPlan: "## 应急响应\n\n### 订单积压\n1. 临时启用订单限流\n2. 扩容消费者实例\n3. 清理积压队列",
    topologyExport: "digraph { order_service -> kafka; order_service -> postgresql; order_service -> payment_gateway; }",
    createdAt: "2026-04-20T09:00:00Z",
    updatedAt: "2026-05-08T14:00:00Z",
  },
  {
    id: "rb-003",
    name: "通知服务运维手册",
    description: "消息推送与通知服务运维手册",
    service: "notification-service",
    version: 1,
    startStopSteps: [
      "1. 确认消息队列就绪: Redis",
      "2. 启动服务: pm2 start ecosystem.config.js --only notification-service",
      "3. 验证: curl http://localhost:3003/health",
      "4. 停止: pm2 stop notification-service",
    ],
    scaleSteps: [
      "1. 检查消息积压量",
      "2. 扩容 Worker: pm2 scale notification-service +2",
    ],
    troubleshootTree: [
      {
        id: "ts-5",
        question: "推送送达率下降",
        steps: ["检查第三方推送服务状态", "检查消息队列积压", "检查设备 Token 有效性"],
        solution: "切换备用推送通道，清理无效 Token",
      },
    ],
    emergencyPlan: "## 应急响应\n\n### 推送中断\n1. 切换备用推送通道 (APNs/FCM)\n2. 启用短信兜底方案",
    topologyExport: "digraph { notification_service -> redis; notification_service -> apns; notification_service -> fcm; }",
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-05T16:00:00Z",
  },
]

export async function GET() {
  const response: RunbookListResponse = {
    runbooks: sampleRunbooks,
    total: sampleRunbooks.length,
  }
  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newRunbook: Runbook = {
      id: `rb-${Date.now()}`,
      name: body.name || "未命名 Runbook",
      description: body.description || "",
      service: body.service || "",
      version: 1,
      startStopSteps: body.startStopSteps || [],
      scaleSteps: body.scaleSteps || [],
      troubleshootTree: body.troubleshootTree || [],
      emergencyPlan: body.emergencyPlan || "",
      topologyExport: body.topologyExport || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    sampleRunbooks.push(newRunbook)
    return NextResponse.json(newRunbook, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const idx = sampleRunbooks.findIndex((r) => r.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: "Runbook not found" }, { status: 404 })
    }
    sampleRunbooks[idx] = {
      ...sampleRunbooks[idx],
      ...updates,
      version: sampleRunbooks[idx].version + 1,
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json(sampleRunbooks[idx])
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
