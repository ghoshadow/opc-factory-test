import { NextResponse } from "next/server"
import type { ArchaeologyResponse, FileNode, DependencyNode, TechDebtItem, ReverseSpec } from "@/types/factory"

const fileTree: FileNode = {
  name: "opc-factory",
  type: "directory",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "app",
          type: "directory",
          children: [
            { name: "layout.tsx", type: "file", size: 1240, language: "tsx" },
            { name: "page.tsx", type: "file", size: 890, language: "tsx" },
            {
              name: "api",
              type: "directory",
              children: [
                { name: "v1", type: "directory", children: [
                  { name: "factory", type: "directory", children: [
                    { name: "line-status", type: "directory", children: [
                      { name: "route.ts", type: "file", size: 2100, language: "ts" },
                    ]},
                    { name: "wip", type: "directory", children: [
                      { name: "route.ts", type: "file", size: 1850, language: "ts" },
                    ]},
                  ]},
                  { name: "testing", type: "directory", children: [
                    { name: "bugs", type: "directory", children: [
                      { name: "route.ts", type: "file", size: 5200, language: "ts" },
                    ]},
                  ]},
                  { name: "sre", type: "directory", children: [
                    { name: "checker", type: "directory", children: [
                      { name: "route.ts", type: "file", size: 1800, language: "ts" },
                    ]},
                  ]},
                ]},
              ],
            },
            {
              name: "l1",
              type: "directory",
              children: [
                { name: "wip", type: "directory", children: [
                  { name: "page.tsx", type: "file", size: 2500, language: "tsx" },
                ]},
              ],
            },
            {
              name: "l3",
              type: "directory",
              children: [
                { name: "coding", type: "directory", children: [
                  { name: "archaeology", type: "directory", children: [
                    { name: "page.tsx", type: "file", size: 600, language: "tsx" },
                  ]},
                ]},
                { name: "testing", type: "directory", children: [
                  { name: "bugs", type: "directory", children: [
                    { name: "page.tsx", type: "file", size: 220, language: "tsx" },
                  ]},
                ]},
              ],
            },
            {
              name: "l5",
              type: "directory",
              children: [
                { name: "checker", type: "directory", children: [
                  { name: "page.tsx", type: "file", size: 420, language: "tsx" },
                ]},
              ],
            },
          ],
        },
        {
          name: "components",
          type: "directory",
          children: [
            {
              name: "ui",
              type: "directory",
              children: [
                { name: "button.tsx", type: "file", size: 2100, language: "tsx" },
                { name: "input.tsx", type: "file", size: 950, language: "tsx" },
                { name: "skeleton.tsx", type: "file", size: 380, language: "tsx" },
                { name: "DataTable.tsx", type: "file", size: 3400, language: "tsx" },
                { name: "MetricCard.tsx", type: "file", size: 1800, language: "tsx" },
                { name: "StatusBadge.tsx", type: "file", size: 1200, language: "tsx" },
                { name: "EmptyState.tsx", type: "file", size: 900, language: "tsx" },
                { name: "index.ts", type: "file", size: 450, language: "ts" },
              ],
            },
            {
              name: "layout",
              type: "directory",
              children: [
                { name: "AppShell.tsx", type: "file", size: 2800, language: "tsx" },
                { name: "Sidebar.tsx", type: "file", size: 3500, language: "tsx" },
                { name: "TopBar.tsx", type: "file", size: 1400, language: "tsx" },
              ],
            },
            {
              name: "factory",
              type: "directory",
              children: [
                { name: "LineStatusCard.tsx", type: "file", size: 2200, language: "tsx" },
                { name: "LineStatusGrid.tsx", type: "file", size: 1600, language: "tsx" },
                { name: "WipStats.tsx", type: "file", size: 3000, language: "tsx" },
              ],
            },
            {
              name: "testing",
              type: "directory",
              children: [
                { name: "BugTriagePanel.tsx", type: "file", size: 10200, language: "tsx" },
              ],
            },
            {
              name: "sre",
              type: "directory",
              children: [
                { name: "SreCheckerPanel.tsx", type: "file", size: 6400, language: "tsx" },
              ],
            },
            {
              name: "coding",
              type: "directory",
              children: [
                { name: "ArchaeologyReport.tsx", type: "file", size: 0, language: "tsx" },
              ],
            },
          ],
        },
        { name: "lib", type: "directory", children: [
          { name: "navigation.ts", type: "file", size: 3100, language: "ts" },
          { name: "utils.ts", type: "file", size: 600, language: "ts" },
        ]},
        { name: "types", type: "directory", children: [
          { name: "factory.ts", type: "file", size: 3100, language: "ts" },
        ]},
      ],
    },
    { name: "package.json", type: "file", size: 780, language: "json" },
    { name: "tsconfig.json", type: "file", size: 620, language: "json" },
    { name: "tailwind.config.ts", type: "file", size: 340, language: "ts" },
    { name: "next.config.ts", type: "file", size: 280, language: "ts" },
  ],
}

const dependencyGraph: DependencyNode[] = [
  { name: "next", type: "external", version: "16.2.6", usageCount: 12, dependentModules: ["app/", "api/", "components/"] },
  { name: "react", type: "external", version: "19.2.4", usageCount: 28, dependentModules: ["components/ui/", "components/layout/", "app/"] },
  { name: "react-dom", type: "external", version: "19.2.4", usageCount: 8, dependentModules: ["app/layout.tsx", "components/"] },
  { name: "swr", type: "external", version: "2.4.1", usageCount: 5, dependentModules: ["components/testing/", "components/sre/", "components/factory/"] },
  { name: "lucide-react", type: "external", version: "1.14.0", usageCount: 18, dependentModules: ["components/", "app/", "lib/navigation.ts"] },
  { name: "tailwind-merge", type: "external", version: "3.5.0", usageCount: 3, dependentModules: ["lib/utils.ts", "components/ui/"] },
  { name: "class-variance-authority", type: "external", version: "0.7.1", usageCount: 2, dependentModules: ["components/ui/button.tsx"] },
  { name: "clsx", type: "external", version: "2.1.1", usageCount: 4, dependentModules: ["lib/utils.ts", "components/"] },
  { name: "@/components/ui", type: "internal", usageCount: 14, dependentModules: ["components/layout/", "components/testing/", "components/sre/", "components/factory/"] },
  { name: "@/types/factory", type: "internal", usageCount: 6, dependentModules: ["api/v1/", "components/testing/", "components/sre/", "components/factory/"] },
  { name: "@/lib/navigation", type: "internal", usageCount: 2, dependentModules: ["components/layout/Sidebar.tsx"] },
  { name: "@/lib/utils", type: "internal", usageCount: 8, dependentModules: ["components/ui/", "components/layout/"] },
]

const techDebt: TechDebtItem[] = [
  {
    id: "TD-001",
    type: "security",
    severity: "critical",
    location: "src/app/api/v1/",
    description: "API 路由缺少请求频率限制，存在被恶意刷接口的风险",
    suggestion: "引入 rate limiting 中间件（如 @upstash/ratelimit），对 /api/v1 路径做 IP 级别限流",
  },
  {
    id: "TD-002",
    type: "deprecated_api",
    severity: "high",
    location: "src/components/ui/button.tsx",
    description: "button 组件使用了已废弃的 React.SyntheticEvent 类型参数，在 React 19 中已有更精确的替代类型",
    suggestion: "将 SyntheticEvent 替换为 React 19 推荐的 MouseEvent<HTMLButtonElement> 等具体事件类型",
  },
  {
    id: "TD-003",
    type: "code_quality",
    severity: "high",
    location: "src/components/testing/BugTriagePanel.tsx",
    description: "BugTriagePanel 组件文件超过 330 行，包含状态管理、拖拽逻辑、展开逻辑、分组渲染，职责过重",
    suggestion: "拆分为 BugRow.tsx、ExpandRow.tsx、PrioritySection.tsx 三个子组件，将拖拽逻辑抽为自定义 hook useBugDrag",
  },
  {
    id: "TD-004",
    type: "architecture",
    severity: "medium",
    location: "src/types/factory.ts",
    description: "所有类型定义集中在单个 factory.ts 文件中，随业务增长会成为单点修改热点",
    suggestion: "按生产线拆分类型文件：types/coding.ts、types/testing.ts、types/sre.ts，factory.ts 仅保留共享基础类型",
  },
  {
    id: "TD-005",
    type: "performance",
    severity: "medium",
    location: "src/components/ui/DataTable.tsx",
    description: "DataTable 组件未使用 React.memo 包裹，每次父组件渲染都会重新渲染所有行",
    suggestion: "用 React.memo 包裹 DataTable，并配合 useMemo 缓存排序/筛选后的数据",
  },
  {
    id: "TD-006",
    type: "code_quality",
    severity: "low",
    location: "src/lib/navigation.ts",
    description: "导航配置中多个路径缺少对应的页面文件，导致点击后显示 404",
    suggestion: "为所有已注册导航路径创建占位页面，或移除未实现的导航项，避免用户困惑",
  },
  {
    id: "TD-007",
    type: "deprecated_api",
    severity: "low",
    location: "src/hooks/use-mobile.ts",
    description: "自定义移动端判断 hook 可用 CSS media query 或 matchMedia 替代，减少 JS 运行时开销",
    suggestion: "优先使用 Tailwind 响应式类名（sm:/md:/lg:），仅在需要条件渲染时保留 JS 判断",
  },
]

const reverseSpec: ReverseSpec = {
  userStory: "作为编码产线的开发者，我希望能够对现有代码仓库进行考古分析，查看代码结构、依赖关系、技术债务和反向生成的 Spec，以便快速理解遗留代码的架构和现状。",
  acceptanceCriteria: [
    "页面展示四个考古分析结果：代码结构树、依赖关系图、技术债务列表、反向 Spec 预览",
    "代码结构树以可展开的目录树形式展示，文件标注语言和大小",
    "依赖关系图区分外部依赖（含版本号）和内部模块依赖（含使用次数）",
    "技术债务列表按严重程度排序（critical > high > medium > low），每项包含类型、位置、描述和建议",
    "反向 Spec 遵循 Meta-Spec 格式，包含用户故事、验收标准、数据契约和 UX 雏形",
    "加载失败时展示错误原因和重试建议",
  ],
  dataContract: {
    inputs: [
      { name: "repoId", type: "string", description: "目标仓库的唯一标识符" },
    ],
    outputs: [
      { name: "id", type: "string", description: "考古报告唯一 ID" },
      { name: "repoName", type: "string", description: "仓库名称" },
      { name: "analyzedAt", type: "string (ISO 8601)", description: "分析时间戳" },
      { name: "fileTree", type: "FileNode", description: "递归的文件/目录树结构" },
      { name: "dependencyGraph", type: "DependencyNode[]", description: "依赖模块列表" },
      { name: "techDebt", type: "TechDebtItem[]", description: "技术债务条目列表" },
      { name: "reverseSpec", type: "ReverseSpec", description: "反向生成的 Spec 文档" },
    ],
    sideEffects: ["无 — 只读分析接口，不修改仓库状态"],
  },
  uxSketch: "┌─────────────────────────────────────────────┐\n│  代码考古分析报告 — opc-factory              │\n│  分析时间: 2026-05-09 10:30                  │\n├──────────────┬──────────────────────────────┤\n│ 📂 代码结构树│ 📦 依赖关系图                 │\n│  ├─ src/     │  next@16.2.6    (12 处使用)   │\n│  │ ├─ app/   │  react@19.2.4   (28 处使用)   │\n│  │ │ ├─ ...  │  swr@2.4.1       (5 处使用)   │\n│  │ ├─ comp/  │  [内部] types     (6 处使用)   │\n│              │                              │\n├──────────────┼──────────────────────────────┤\n│ ⚠️ 技术债务  │ 📋 反向 Spec                  │\n│  Severity ↓  │  User Story: ...              │\n│  Type/Loc/   │  AC: [ ] ...                  │\n│  Desc/Sugg   │  Data Contract: {...}         │\n│              │  UX Sketch: [...]             │\n└──────────────┴──────────────────────────────┘",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const response: ArchaeologyResponse = {
    id,
    repoName: "opc-factory",
    analyzedAt: new Date().toISOString(),
    fileTree,
    dependencyGraph,
    techDebt,
    reverseSpec,
  }

  return NextResponse.json(response)
}
