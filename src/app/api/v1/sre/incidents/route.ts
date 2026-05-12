import { NextResponse } from "next/server";

import type { Incident, IncidentListResponse } from "@/types/factory";

const sampleIncidents: Incident[] = [
  {
    id: "inc-001",
    description: "支付回调接口 5xx 错误率突增至 2.3%，超过 SLO 阈值 0.1%",
    severity: "P0",
    status: "已诊断",
    service: "payment-gateway",
    discoveredAt: "2026-05-10T08:23:00Z",
    alertSource: "Prometheus 告警规则: HighErrorRate",
    diagnosis: {
      rootCause: "数据库连接池耗尽 — orders 表缺少 payment_channel 索引，慢查询堆积导致连接池溢出",
      impactScope: "影响所有支付回调，约 12% 用户支付后状态未更新",
      priority: "P0",
      confidence: 92,
      relatedServices: ["order-service", "payment-gateway", "postgresql"],
      suggestion:
        "1) 紧急添加 payment_channel 索引 2) 扩大连接池上限至 200 3) 回滚数据库迁移脚本 v2.1.0",
    },
    bugPreview: {
      title: "[紧急] 支付回调 orders 表缺少 payment_channel 列索引导致慢查询",
      module: "order-service",
      severity: "P0",
      description:
        "orders 表在 v2.1.0 迁移中添加了 payment_channel 列，但未创建对应索引。高并发下慢查询堆积导致数据库连接池耗尽，支付回调 5xx 率升至 2.3%。需紧急补充索引并回归测试。",
    },
  },
  {
    id: "inc-002",
    description: "通知推送延迟超过 5 分钟，大量用户未收到订单确认通知",
    severity: "P1",
    status: "待诊断",
    service: "notification-service",
    discoveredAt: "2026-05-10T09:15:00Z",
    alertSource: "Grafana 面板: PushLatencyHigh",
    diagnosis: null,
    bugPreview: null,
  },
  {
    id: "inc-003",
    description: "库存服务响应时间 P99 升至 8s，触发超时告警",
    severity: "P1",
    status: "已诊断",
    service: "inventory-service",
    discoveredAt: "2026-05-09T22:40:00Z",
    alertSource: "PagerDuty: InventoryServiceHighLatency",
    diagnosis: {
      rootCause: "Redis 缓存未命中率突增 — 缓存预热脚本在部署后未执行，导致所有请求穿透至数据库",
      impactScope: "库存查询延迟影响下单和购物车，约 20% 用户感知明显卡顿",
      priority: "P1",
      confidence: 88,
      relatedServices: ["inventory-service", "redis", "postgresql"],
      suggestion: "1) 立即执行缓存预热脚本 2) 增加缓存 TTL 兜底 3) 添加快照恢复机制",
    },
    bugPreview: {
      title: "[高优] 库存服务部署后缓存预热未自动执行导致缓存穿透",
      module: "inventory-service",
      severity: "P1",
      description:
        "部署流水线中缺少 post-deploy hook 执行缓存预热，导致 Redis 冷启动后所有请求透传至 DB。需要将缓存预热步骤显式加入部署流程并添加部署后健康检查。",
    },
  },
  {
    id: "inc-004",
    description: "网关路由健康检查间歇性失败，部分节点被摘除",
    severity: "P2",
    status: "已回流",
    service: "api-gateway",
    discoveredAt: "2026-05-09T16:10:00Z",
    alertSource: "Nginx 错误日志: upstream_timeout",
    diagnosis: {
      rootCause: "健康检查超时阈值配置过低 (2s)，下游服务 GC 停顿偶发超过阈值",
      impactScope: "间歇性路由摘除导致 0.5% 请求重试，对用户无明显影响",
      priority: "P2",
      confidence: 95,
      relatedServices: ["api-gateway", "payment-gateway"],
      suggestion: "1) 将健康检查超时调至 5s 2) 配置重试策略 3) 优化下游 GC 参数",
    },
    bugPreview: {
      title: "[普通] 网关健康检查超时阈值过短导致节点误摘除",
      module: "api-gateway",
      severity: "P2",
      description:
        "健康检查超时 2s 未能覆盖下游服务 GC 停顿的正常波动。调整为 5s 后可消除误摘除现象。建议同步审查其他服务健康检查阈值配置。",
    },
  },
  {
    id: "inc-005",
    description: "Kafka 消费延迟持续增长，订单处理积压 3000+",
    severity: "P0",
    status: "待诊断",
    service: "order-service",
    discoveredAt: "2026-05-10T07:50:00Z",
    alertSource: "Prometheus: KafkaConsumerLag",
    diagnosis: null,
    bugPreview: null,
  },
];

export async function GET() {
  const response: IncidentListResponse = {
    incidents: sampleIncidents,
    total: sampleIncidents.length,
  };
  return NextResponse.json(response);
}
