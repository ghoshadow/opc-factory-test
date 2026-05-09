import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Shield,
  Activity,
  ListOrdered,
  FileEdit,
  Award,
  Zap,
  Play,
  TestTubeDiagonal,
  Columns3,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "L1 总览",
    icon: LayoutDashboard,
    path: "/l1",
    children: [
      { label: "WIP 统计", icon: LayoutDashboard, path: "/l1/wip" },
    ],
  },
  {
    label: "L2 需求管理",
    icon: FileText,
    path: "/l2",
    children: [
      { label: "本体管理", icon: FileText, path: "/l2/ontology" },
      { label: "需求队列", icon: ListOrdered, path: "/l2/queue" },
      { label: "Spec 编辑器", icon: FileEdit, path: "/l2/spec-editor" },
      { label: "成熟度评审", icon: Award, path: "/l2/maturity" },
    ],
  },
  {
    label: "L3 产线操作",
    icon: GitBranch,
    path: "/l3",
    children: [
      { label: "编码产线", icon: GitBranch, path: "/l3/coding" },
      { label: "Toco 报告", icon: Zap, path: "/l3/coding/toco-report" },
      { label: "Plan Review", icon: FileText, path: "/l3/coding/plan-review" },
      { label: "Design Review", icon: Shield, path: "/l3/coding/design-review" },
      { label: "安全重构", icon: Shield, path: "/l3/coding/refactor" },
      { label: "Pipeline 流程图", icon: GitBranch, path: "/l3/coding/pipeline-demo" },
      { label: "测试产线", icon: GitBranch, path: "/l3/testing" },
      { label: "测试流水线", icon: Play, path: "/l3/testing/pipeline" },
      { label: "测试用例", icon: TestTubeDiagonal, path: "/l3/testing/cases" },
      { label: "Bug 分诊", icon: GitBranch, path: "/l3/testing/bugs" },
      { label: "Kanban 看板", icon: Columns3, path: "/l3/kanban" },
    ],
  },
  {
    label: "L4 质量门禁",
    icon: Shield,
    path: "/l4",
    children: [
      { label: "Checker 面板", icon: Shield, path: "/l4/checker" },
      { label: "交付门禁", icon: Shield, path: "/l4/delivery-gate" },
      { label: "分解图谱", icon: Shield, path: "/l4/pipeline" },
      { label: "Reviewer 看板", icon: Shield, path: "/l4/reviewer" },
    ],
  },
  {
    label: "L5 运维监控",
    icon: Activity,
    path: "/l5",
    children: [
      { label: "Checker 门禁", icon: Shield, path: "/l5/checker" },
      { label: "可观测仪表盘", icon: BarChart3, path: "/l5/observability" },
      { label: "Runbooks", icon: Activity, path: "/l5/runbooks" },
    ],
  },
];

export function findNavItem(
  items: NavItem[],
  path: string
): NavItem | null {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findNavItem(item.children, path);
      if (found) return found;
    }
  }
  return null;
}
