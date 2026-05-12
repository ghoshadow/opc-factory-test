import { NextResponse } from "next/server"
import type {
  ArchaeologyResponse,
  ArchaeologyReportData,
  CodeTreeNode,
  DependencyNode,
  DependencyEdge,
  TechDebtItem,
  ChangePattern,
  ReverseSpecData,
} from "@/types/factory"

const mockCodeTree: CodeTreeNode = {
  name: "my-project",
  type: "directory",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "components",
          type: "directory",
          children: [
            { name: "Header.tsx", type: "file", size: 3200, lines: 120, language: "tsx" },
            { name: "Sidebar.tsx", type: "file", size: 2800, lines: 95, language: "tsx" },
            { name: "Footer.tsx", type: "file", size: 1100, lines: 45, language: "tsx" },
          ],
        },
        {
          name: "pages",
          type: "directory",
          children: [
            { name: "index.tsx", type: "file", size: 4200, lines: 150, language: "tsx" },
            { name: "dashboard.tsx", type: "file", size: 5600, lines: 210, language: "tsx" },
            { name: "settings.tsx", type: "file", size: 3800, lines: 140, language: "tsx" },
          ],
        },
        {
          name: "utils",
          type: "directory",
          children: [
            { name: "api.ts", type: "file", size: 2400, lines: 85, language: "ts" },
            { name: "helpers.ts", type: "file", size: 1800, lines: 60, language: "ts" },
          ],
        },
        { name: "App.tsx", type: "file", size: 1500, lines: 55, language: "tsx" },
        { name: "main.tsx", type: "file", size: 300, lines: 12, language: "tsx" },
      ],
    },
    {
      name: "public",
      type: "directory",
      children: [
        { name: "favicon.ico", type: "file", size: 15000, lines: 0 },
        { name: "logo.svg", type: "file", size: 800, lines: 5 },
      ],
    },
    { name: "package.json", type: "file", size: 2400, lines: 45 },
    { name: "tsconfig.json", type: "file", size: 600, lines: 25 },
    { name: "README.md", type: "file", size: 3400, lines: 80 },
  ],
}

const mockProductionDeps: DependencyNode[] = [
  { name: "react", version: "18.2.0", type: "production", usedBy: ["App.tsx", "components/*"] },
  { name: "react-dom", version: "18.2.0", type: "production", usedBy: ["main.tsx"] },
  { name: "axios", version: "1.6.0", type: "production", usedBy: ["utils/api.ts"] },
  { name: "lodash", version: "4.17.21", type: "production", usedBy: ["utils/helpers.ts"] },
]

const mockDevDeps: DependencyNode[] = [
  { name: "typescript", version: "5.3.0", type: "dev", usedBy: ["*.ts", "*.tsx"] },
  { name: "vite", version: "5.0.0", type: "dev", usedBy: ["vite.config.ts"] },
  { name: "eslint", version: "8.55.0", type: "dev", usedBy: [".eslintrc"] },
  { name: "vitest", version: "1.1.0", type: "dev", usedBy: ["*.test.*"] },
]

const mockGraph: DependencyEdge[] = [
  { source: "App.tsx", target: "Header.tsx", weight: 0.9 },
  { source: "App.tsx", target: "Sidebar.tsx", weight: 0.8 },
  { source: "App.tsx", target: "Footer.tsx", weight: 0.5 },
  { source: "Header.tsx", target: "utils/helpers.ts", weight: 0.3 },
  { source: "Sidebar.tsx", target: "utils/api.ts", weight: 0.6 },
  { source: "pages/dashboard.tsx", target: "utils/api.ts", weight: 0.8 },
  { source: "pages/settings.tsx", target: "utils/api.ts", weight: 0.7 },
  { source: "utils/api.ts", target: "axios", weight: 1.0, label: "外部依赖" },
  { source: "utils/helpers.ts", target: "lodash", weight: 0.4, label: "外部依赖" },
]

const mockTechDebt: TechDebtItem[] = [
  {
    id: "td-001",
    type: "deprecated_api",
    severity: "major",
    location: "utils/api.ts:42",
    description: "使用了已废弃的 React 生命周期方法 componentWillMount",
    suggestion: "迁移到 getDerivedStateFromProps 或 useEffect Hook",
  },
  {
    id: "td-002",
    type: "security",
    severity: "critical",
    location: "utils/api.ts:15",
    description: "API 请求中硬编码了 Access Token，存在泄露风险",
    suggestion: "使用环境变量或安全的凭证管理方案（如 Vault）存储敏感信息",
  },
  {
    id: "td-003",
    type: "code_quality",
    severity: "minor",
    location: "components/Header.tsx:35-60",
    description: "Header 组件过大（120 行），包含了过多业务逻辑",
    suggestion: "将搜索逻辑和用户菜单拆分为独立子组件",
  },
  {
    id: "td-004",
    type: "performance",
    severity: "major",
    location: "pages/dashboard.tsx:88",
    description: "Dashboard 页面未使用 React.memo 优化，子组件频繁重渲染",
    suggestion: "对 KPIGrid、ChartPanel 等子组件添加 React.memo 包装",
  },
  {
    id: "td-005",
    type: "architecture",
    severity: "major",
    location: "src/utils/helpers.ts",
    description: "工具函数耦合了 DOM 操作与业务逻辑，难以单独测试",
    suggestion: "分离纯函数与副作用，使用依赖注入解耦 DOM API",
  },
  {
    id: "td-006",
    type: "code_quality",
    severity: "minor",
    location: "pages/settings.tsx:120-145",
    description: "Settings 表单状态管理使用多个 useState，逻辑分散",
    suggestion: "考虑使用 useReducer 或 react-hook-form 统一管理表单状态",
  },
]

const mockChangeHistory: ChangePattern[] = [
  {
    period: "2026-Q1",
    commits: 45,
    filesChanged: 28,
    insertions: 3400,
    deletions: 1200,
    topAuthors: ["Zhang Wei", "Li Ming"],
    description: "密集的功能开发期，新增 Dashboard 和 Settings 页面",
  },
  {
    period: "2025-Q4",
    commits: 22,
    filesChanged: 15,
    insertions: 1800,
    deletions: 600,
    topAuthors: ["Zhang Wei", "Wang Fang"],
    description: "重构阶段，统一了 API 请求层和错误处理逻辑",
  },
  {
    period: "2025-Q3",
    commits: 12,
    filesChanged: 8,
    insertions: 600,
    deletions: 300,
    topAuthors: ["Li Ming"],
    description: "维护阶段，修复了 3 个 P1 级别缺陷",
  },
]

const mockReverseSpec: ReverseSpecData = {
  id: "reverse-001",
  sourceRepo: "https://github.com/example/my-project",
  minedAt: "2026-05-10T08:00:00Z",
  qualityScore: 0.78,
  userStory: "## 用户故事\n\n作为系统用户，我想要通过一个集中式仪表盘查看关键业务指标，以便快速了解系统运行状态。\n\n## 功能描述\n\n系统提供了一个可定制的仪表盘页面，包含以下核心功能：\n- KPI 指标卡片展示\n- 实时数据刷新\n- 多维度数据筛选\n- 产线状态监控",
  acceptanceCriteria: [
    {
      id: "ac-001",
      given: "用户已登录系统",
      when: "访问首页仪表盘",
      then: "展示 KPI 指标卡片、产线状态网格和 WIP 统计",
    },
    {
      id: "ac-002",
      given: "用户在仪表盘页面",
      when: "点击刷新按钮或等待自动刷新间隔",
      then: "数据更新为最新状态，显示更新时间戳",
    },
    {
      id: "ac-003",
      given: "API 请求失败",
      when: "仪表盘加载数据",
      then: "展示友好的错误提示，允许用户手动重试",
    },
  ],
  dataContract: {
    inputs: [
      { name: "lineId", type: "string", required: false, constraint: "enum: requirements|coding|testing|sre" },
      { name: "timeRange", type: "string", required: false, constraint: "ISO 8601 区间格式" },
      { name: "refreshInterval", type: "number", required: false, constraint: ">= 5000ms" },
    ],
    outputs: [
      { name: "kpis", type: "KpiData[]", required: true, constraint: "至少包含 4 个 KPI 指标" },
      { name: "lineStatuses", type: "LineStatusData[]", required: true },
      { name: "wipStats", type: "WipStats", required: true },
      { name: "timestamp", type: "string", required: true, constraint: "ISO 8601" },
    ],
  },
  uxDraft: "## 仪表盘页面布局\n\n```\n+------------------------------------------+\n|  TopBar (用户信息、通知)                    |\n+-----------+------------------------------+\n| Sidebar   |  [刷新按钮] [时间戳]           |\n|           |                              |\n| - 首页    |  +---+ +---+ +---+ +---+     |\n| - 产线    |  |KPI| |KPI| |KPI| |KPI|     |\n| - 设置    |  +---+ +---+ +---+ +---+     |\n|           |                              |\n|           |  +--------------------------+ |\n|           |  | 产线状态网格              | |\n|           |  +--------------------------+ |\n|           |                              |\n|           |  +--------------------------+ |\n|           |  | WIP 统计                 | |\n|           |  +--------------------------+ |\n+-----------+------------------------------+\n```",
}

const MOCK_REPORT: ArchaeologyReportData = {
  id: "arch-001",
  projectId: "example-project",
  createdAt: "2026-05-10T08:00:00Z",
  codeTree: mockCodeTree,
  dependencies: {
    production: mockProductionDeps,
    dev: mockDevDeps,
    internal: [
      { name: "components", coupling: 0.85 },
      { name: "pages", coupling: 0.72 },
      { name: "utils", coupling: 0.65 },
    ],
    graph: mockGraph,
  },
  techDebt: mockTechDebt,
  changeHistory: mockChangeHistory,
  reverseSpec: mockReverseSpec,
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 })
  }

  // Simulate analysis latency
  await delay(300)

  const response: ArchaeologyResponse = {
    report: {
      ...MOCK_REPORT,
      id: `arch-${id}`,
      projectId: id,
    },
  }

  return NextResponse.json(response)
}
