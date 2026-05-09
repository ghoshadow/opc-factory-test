import { NextResponse } from "next/server";

import type { PlanData, PlanReviewResponse, PlanStatus } from "@/types/coding";

const plans: PlanData[] = [
  {
    id: "plan-001",
    title: "订单模块重构 Plan",
    status: "pending",
    createdAt: "2026-05-08T10:30:00Z",
    tasks: [
      {
        id: "t1",
        title: "数据层",
        description:
          "Order 表结构变更，新增 payment_channel、refund_reason 列，编写迁移脚本与回滚脚本",
        estimatedHours: 8,
        children: [
          {
            id: "t1.1",
            title: "迁移脚本",
            description: "编写 up/down migration SQL",
            estimatedHours: 3,
          },
          {
            id: "t1.2",
            title: "Model 层适配",
            description: "更新 Order model 字段映射与类型定义",
            estimatedHours: 3,
          },
          {
            id: "t1.3",
            title: "数据校验",
            description: "添加字段级校验逻辑与单元测试",
            estimatedHours: 2,
          },
        ],
      },
      {
        id: "t2",
        title: "API 层",
        description: "新增 POST /api/orders/:id/refund 端点，扩展 GET /api/orders 筛选参数",
        estimatedHours: 10,
        children: [
          {
            id: "t2.1",
            title: "Refund 端点",
            description: "实现退款接口，含幂等键与状态机校验",
            estimatedHours: 5,
          },
          {
            id: "t2.2",
            title: "筛选扩展",
            description: "GET /api/orders 增加 channel、status 筛选",
            estimatedHours: 3,
          },
          {
            id: "t2.3",
            title: "错误处理",
            description: "统一错误码与国际化错误消息",
            estimatedHours: 2,
          },
        ],
      },
      {
        id: "t3",
        title: "前端页面",
        description: "订单详情页新增退款操作入口，订单列表增加渠道列与筛选器",
        estimatedHours: 12,
        children: [
          {
            id: "t3.1",
            title: "退款 UI",
            description: "退款按钮、金额输入、二次确认弹窗",
            estimatedHours: 5,
          },
          {
            id: "t3.2",
            title: "列表增强",
            description: "渠道列、筛选下拉、批量操作",
            estimatedHours: 4,
          },
          {
            id: "t3.3",
            title: "状态同步",
            description: "WebSocket 实时更新订单状态",
            estimatedHours: 3,
          },
        ],
      },
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/orders/:id/refund",
        description: "对指定订单发起退款，需要幂等键，返回退款单号与状态",
        request:
          '{\n  "idempotency_key": "string",\n  "amount": "number",\n  "reason": "string"\n}',
        response:
          '{\n  "refund_id": "RF-001",\n  "status": "processing",\n  "created_at": "ISO8601"\n}',
      },
      {
        method: "GET",
        path: "/api/v1/orders",
        description: "订单列表查询，扩展 channel、status 筛选参数",
        request:
          '{\n  "channel": "wechat | alipay | card",\n  "status": "paid | refunding | refunded",\n  "page": 1,\n  "page_size": 20\n}',
        response: '{\n  "items": [...],\n  "total": 150,\n  "page": 1\n}',
      },
      {
        method: "PATCH",
        path: "/api/v1/orders/:id",
        description: "更新订单支付渠道信息",
        request: '{\n  "payment_channel": "string"\n}',
        response: '{\n  "id": "ORD-001",\n  "payment_channel": "wechat"\n}',
      },
    ],
    dependencies: [
      { from: "t1", to: "t2", label: "API 依赖数据层" },
      { from: "t2", to: "t3", label: "前端依赖 API" },
      { from: "t1.2", to: "t1.3", label: "校验依赖 Model" },
      { from: "t2.1", to: "t3.1", label: "退款 UI 依赖 Refund API" },
    ],
    workload: {
      totalPersonHours: 30,
      storyPoints: 8,
      breakdown: [
        { task: "数据层", hours: 8 },
        { task: "API 层", hours: 10 },
        { task: "前端页面", hours: 12 },
      ],
    },
  },
  {
    id: "plan-002",
    title: "用户认证 JWT 升级 Plan",
    status: "approved",
    createdAt: "2026-05-07T14:00:00Z",
    tasks: [
      {
        id: "t1",
        title: "Token 签发改造",
        description: "从对称密钥升级为非对称密钥，添加 refresh token 机制",
        estimatedHours: 6,
        children: [
          {
            id: "t1.1",
            title: "密钥管理",
            description: "RSA 密钥对生成与安全存储",
            estimatedHours: 2,
          },
          {
            id: "t1.2",
            title: "签发逻辑",
            description: "access + refresh token 签发实现",
            estimatedHours: 4,
          },
        ],
      },
      {
        id: "t2",
        title: "中间件更新",
        description: "Auth middleware 验证 JWT 签名，处理过期与刷新",
        estimatedHours: 8,
        children: [
          {
            id: "t2.1",
            title: "验证中间件",
            description: "JWT 签名验证 + 黑名单检查",
            estimatedHours: 4,
          },
          {
            id: "t2.2",
            title: "刷新端点",
            description: "POST /auth/refresh 端点实现",
            estimatedHours: 4,
          },
        ],
      },
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        description: "用户登录，返回 access_token + refresh_token",
        request: '{\n  "username": "string",\n  "password": "string"\n}',
        response: '{\n  "access_token": "JWT",\n  "refresh_token": "JWT",\n  "expires_in": 3600\n}',
      },
      {
        method: "POST",
        path: "/api/v1/auth/refresh",
        description: "使用 refresh_token 换取新的 access_token",
        request: '{\n  "refresh_token": "JWT"\n}',
        response: '{\n  "access_token": "JWT",\n  "expires_in": 3600\n}',
      },
    ],
    dependencies: [
      { from: "t1.2", to: "t2.1", label: "验证依赖签发格式" },
      { from: "t2.1", to: "t2.2", label: "刷新端点依赖验证" },
    ],
    workload: {
      totalPersonHours: 14,
      storyPoints: 5,
      breakdown: [
        { task: "Token 签发改造", hours: 6 },
        { task: "中间件更新", hours: 8 },
      ],
    },
  },
  {
    id: "plan-003",
    title: "数据导出优化 Plan",
    status: "rejected",
    createdAt: "2026-05-06T09:15:00Z",
    rejectionReason: "工作量预估偏低，数据层任务缺少索引优化，建议补充性能测试计划后重新提交",
    tasks: [
      {
        id: "t1",
        title: "异步导出",
        description: "导出请求改为消息队列异步处理，大文件走对象存储",
        estimatedHours: 6,
        children: [
          {
            id: "t1.1",
            title: "MQ 集成",
            description: "接入 RabbitMQ 投递导出任务",
            estimatedHours: 3,
          },
          {
            id: "t1.2",
            title: "Worker 实现",
            description: "消费任务，生成文件存 MinIO",
            estimatedHours: 3,
          },
        ],
      },
    ],
    apis: [
      {
        method: "POST",
        path: "/api/v1/export/orders",
        description: "提交订单导出任务，返回 task_id 用于轮询进度",
        request: '{\n  "filters": {...},\n  "format": "xlsx | csv"\n}',
        response: '{\n  "task_id": "EXP-001",\n  "status": "queued"\n}',
      },
    ],
    dependencies: [{ from: "t1.1", to: "t1.2", label: "Worker 消费 MQ" }],
    workload: {
      totalPersonHours: 6,
      storyPoints: 3,
      breakdown: [{ task: "异步导出", hours: 6 }],
    },
  },
];

export async function GET() {
  const response: PlanReviewResponse = {
    plans,
    total: plans.length,
  };
  return NextResponse.json(response);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, reason } = body as {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    };

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action, must be "approve" or "reject"' },
        { status: 400 },
      );
    }

    if (action === "reject" && (!reason || reason.trim() === "")) {
      return NextResponse.json({ error: "Rejection requires a reason" }, { status: 400 });
    }

    const plan = plans.find((p) => p.id === id);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const newStatus: PlanStatus = action === "approve" ? "approved" : "rejected";
    plan.status = newStatus;
    if (action === "reject") {
      plan.rejectionReason = reason;
    }

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
