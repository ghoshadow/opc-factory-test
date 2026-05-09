import {
  Layout,
  LayoutDashboard,
  FileText,
  GitBranch,
  Shield,
  Activity,
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
    label: "L0 基础",
    icon: Layout,
    path: "/l0",
    children: [
      { label: "脚手架", icon: Layout, path: "/l0/scaffold" },
      { label: "路由", icon: Layout, path: "/l0/routing" },
      { label: "主题", icon: Layout, path: "/l0/theme" },
      { label: "组件库", icon: Layout, path: "/l0/components" },
    ],
  },
  {
    label: "L1 总览",
    icon: LayoutDashboard,
    path: "/l1",
    children: [
      { label: "KPI 面板", icon: LayoutDashboard, path: "/l1/kpi" },
      { label: "WIP 统计", icon: LayoutDashboard, path: "/l1/wip" },
      { label: "产线状态", icon: LayoutDashboard, path: "/l1/status" },
      { label: "告警", icon: LayoutDashboard, path: "/l1/alerts" },
    ],
  },
  {
    label: "L2 需求管理",
    icon: FileText,
    path: "/l2",
    children: [
      { label: "需求队列", icon: FileText, path: "/l2/queue" },
      { label: "需求产线", icon: GitBranch, path: "/l2/pipeline" },
      { label: "Spec 编辑器", icon: FileText, path: "/l2/spec-editor" },
      { label: "成熟度评审", icon: FileText, path: "/l2/maturity" },
      { label: "本体管理", icon: FileText, path: "/l2/ontology" },
      { label: "Gap 追问", icon: FileText, path: "/l2/gap-questions" },
    ],
  },
  {
    label: "L3 产线操作",
    icon: GitBranch,
    path: "/l3",
    children: [
      { label: "需求产线", icon: GitBranch, path: "/l3/requirement" },
      { label: "编码产线", icon: GitBranch, path: "/l3/coding" },
      { label: "测试产线", icon: GitBranch, path: "/l3/testing", children: [
        { label: "操作台", icon: GitBranch, path: "/l3/testing" },
        { label: "Bug 分诊", icon: GitBranch, path: "/l3/testing/bugs" },
      ]},
      { label: "SRE 产线", icon: GitBranch, path: "/l3/sre" },
    ],
  },
  {
    label: "L4 质量门禁",
    icon: Shield,
    path: "/l4",
    children: [
      { label: "Checker 面板", icon: Shield, path: "/l4/checker" },
      { label: "Reviewer 看板", icon: Shield, path: "/l4/reviewer" },
      { label: "交付门禁", icon: Shield, path: "/l4/delivery-gate" },
    ],
  },
  {
    label: "L5 运维监控",
    icon: Activity,
    path: "/l5",
    children: [
      { label: "可观测性", icon: Activity, path: "/l5/observability" },
      { label: "部署编排", icon: Activity, path: "/l5/deploy" },
      { label: "事件分类", icon: Activity, path: "/l5/incidents" },
      { label: "Runbooks", icon: Activity, path: "/l5/runbooks" },
      { label: "Checker 门禁", icon: Shield, path: "/l5/checker" },
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
