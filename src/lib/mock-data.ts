import { DashboardData } from "./types";

export function generateMockDashboardData(): DashboardData {
  const now = new Date().toISOString();

  return {
    kpis: {
      totalItems: 142,
      inProgress: 38,
      completed: 89,
      blocked: 15,
      passRate: 87.3,
      avgCycleTime: "2.3h",
      activeAgents: 12,
    },
    wipStats: {
      requirementLine: {
        total: 12,
        byPhase: { "Phase 1": 3, "Phase 2": 5, "Phase 3": 4 },
      },
      codingLine: {
        total: 18,
        byPhase: { "Phase 1": 6, "Phase 2": 7, "Phase 3": 5 },
      },
      testingLine: {
        total: 6,
        byPhase: { "Phase 1": 2, "Phase 2": 3, "Phase 3": 1 },
      },
      sreLine: {
        total: 2,
        byPhase: { "Phase 1": 1, "Phase 2": 1, "Phase 3": 0 },
      },
    },
    alerts: [
      {
        id: "alt-1",
        type: "warning",
        message: "编码产线 Phase 3 阻塞项超过阈值 (5/10)",
        source: "编码产线",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: "alt-2",
        type: "error",
        message: "测试产线 Checker 检测到 3 项未通过",
        source: "测试产线",
        timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      },
      {
        id: "alt-3",
        type: "info",
        message: "SRE 产线新部署版本 v2.1.4 已上线",
        source: "SRE产线",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: "alt-4",
        type: "warning",
        message: "需求产线待审核 Spec 数量: 7",
        source: "需求产线",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    lineStatuses: [
      {
        line: "requirement",
        name: "需求产线",
        status: "healthy",
        activeItems: 12,
        completedToday: 5,
        currentPhase: "Phase 2 · Spec 撰写",
        nextMilestone: "Maturity Review",
      },
      {
        line: "coding",
        name: "编码产线",
        status: "degraded",
        activeItems: 18,
        completedToday: 7,
        currentPhase: "Phase 3 · 实现",
        nextMilestone: "PR Review",
      },
      {
        line: "testing",
        name: "测试产线",
        status: "healthy",
        activeItems: 6,
        completedToday: 3,
        currentPhase: "Phase 2 · 执行",
        nextMilestone: "Bug Report",
      },
      {
        line: "sre",
        name: "SRE产线",
        status: "idle",
        activeItems: 2,
        completedToday: 1,
        currentPhase: "Phase 1 · 部署",
        nextMilestone: "监控上线",
      },
    ],
    lastUpdated: now,
  };
}
