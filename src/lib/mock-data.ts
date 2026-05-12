import { ProductionLine } from "./types";

export interface DashboardAlert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  source: string
  timestamp: string
  routing: string[]
}

export const dashboardAlerts: DashboardAlert[] = [
  {
    id: "F-2341",
    type: "warning",
    message: "Silent Gap — 需求产线 Spec 存在静默缺口，成熟度评审未覆盖全部 AC",
    source: "编码产线",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    routing: ["oncall", "opc"],
  },
  {
    id: "F-2360",
    type: "error",
    message: "Spec-Code Drift — 编码产线已实现代码与上游 Spec 存在漂移，接口签名不一致",
    source: "编码产线",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    routing: ["oncall", "opc", "auto_remediation"],
  },
]

export const productionLines: ProductionLine[] = [
  {
    id: "requirement",
    name: "需求产线",
    opc: "陈",
    function: "Spec 产出与审核",
    wip: 12,
    completed: 47,
    anomaly: "—",
    status: "NOMINAL",
    throughput: 8,
    cycleTime: 2.1,
    pipeline: [
      { name: "需求提交", status: "done" },
      { name: "Spec 产出", status: "done" },
      { name: "成熟度评审", status: "running" },
      { name: "交付", status: "waiting" },
    ],
    deliverables: [
      { id: "req-d1", name: "Spec 文档", type: "文档", status: "done", updatedAt: "2026-05-09" },
      { id: "req-d2", name: "本体条目", type: "数据", status: "done", updatedAt: "2026-05-08" },
      { id: "req-d3", name: "需求规格书", type: "文档", status: "in_progress", updatedAt: "2026-05-10" },
      { id: "req-d4", name: "评审记录", type: "记录", status: "pending", updatedAt: "2026-05-10" },
    ],
  },
  {
    id: "coding",
    name: "编码产线",
    opc: "林",
    function: "代码实现与评审",
    wip: 8,
    completed: 35,
    anomaly: "F-2341 Silent Gap",
    status: "ATTENTION",
    throughput: 6,
    cycleTime: 3.5,
    pipeline: [
      { name: "方案评审", status: "done" },
      { name: "设计评审", status: "done" },
      { name: "编码实现", status: "running" },
      { name: "PR 审查", status: "waiting" },
      { name: "交付", status: "waiting" },
    ],
    deliverables: [
      { id: "cod-d1", name: "代码", type: "代码", status: "done", updatedAt: "2026-05-09" },
      { id: "cod-d2", name: "测试用例", type: "测试", status: "done", updatedAt: "2026-05-09" },
      { id: "cod-d3", name: "PR 记录", type: "记录", status: "in_progress", updatedAt: "2026-05-10" },
      { id: "cod-d4", name: "方案文档", type: "文档", status: "pending", updatedAt: "2026-05-10" },
    ],
  },
  {
    id: "testing",
    name: "测试产线",
    opc: "王",
    function: "测试执行与缺陷管理",
    wip: 5,
    completed: 28,
    anomaly: "—",
    status: "NOMINAL",
    throughput: 5,
    cycleTime: 1.8,
    pipeline: [
      { name: "测试计划", status: "done" },
      { name: "用例设计", status: "done" },
      { name: "执行测试", status: "running" },
      { name: "缺陷报告", status: "waiting" },
      { name: "交付", status: "waiting" },
    ],
    deliverables: [
      { id: "tst-d1", name: "测试用例", type: "测试", status: "done", updatedAt: "2026-05-09" },
      { id: "tst-d2", name: "缺陷报告", type: "报告", status: "done", updatedAt: "2026-05-08" },
      { id: "tst-d3", name: "覆盖报告", type: "报告", status: "in_progress", updatedAt: "2026-05-10" },
      { id: "tst-d4", name: "测试总结", type: "文档", status: "pending", updatedAt: "2026-05-10" },
    ],
  },
  {
    id: "sre",
    name: "SRE产线",
    opc: "张",
    function: "部署与监控运维",
    wip: 3,
    completed: 15,
    anomaly: "—",
    status: "NOMINAL",
    throughput: 4,
    cycleTime: 1.2,
    pipeline: [
      { name: "部署准备", status: "done" },
      { name: "灰度发布", status: "done" },
      { name: "监控观察", status: "running" },
      { name: "全量发布", status: "waiting" },
      { name: "运维", status: "waiting" },
    ],
    deliverables: [
      { id: "sre-d1", name: "部署配置", type: "配置", status: "done", updatedAt: "2026-05-09" },
      { id: "sre-d2", name: "Runbook", type: "文档", status: "done", updatedAt: "2026-05-08" },
      { id: "sre-d3", name: "告警规则", type: "配置", status: "in_progress", updatedAt: "2026-05-10" },
      { id: "sre-d4", name: "回滚方案", type: "文档", status: "pending", updatedAt: "2026-05-10" },
    ],
  },
];
