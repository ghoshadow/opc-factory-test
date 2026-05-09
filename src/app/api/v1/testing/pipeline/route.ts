import { NextResponse } from "next/server"
import type { PipelineResponse, PipelineStageNode, PipelineNodeStatus } from "@/types/factory"

const pipelineNodes: PipelineStageNode[] = [
  {
    id: "subtask-decomp",
    label: "子任务拆解",
    status: "done" as PipelineNodeStatus,
    description: "AC 映射 → 场景分层 → 边界发现 → 回归包选取",
    details: ["AC 映射: 验收标准 → 测试场景映射", "场景分层: 正常/异常/边界/并发分层", "边界发现: 输入边界、状态边界、时序边界", "回归包选取: 基于变更影响的回归用例集"],
  },
  {
    id: "location-agent",
    label: "Location Agent",
    status: "done" as PipelineNodeStatus,
    description: "选择器生成 / 视觉定位 / API 路径匹配 / 数据锚点",
    details: ["选择器生成: CSS/XPath/文本/角色选择器", "视觉定位: 截图比对、坐标定位", "API 路径匹配: REST/GraphQL 端点识别", "数据锚点: 数据库记录、缓存键定位"],
  },
  {
    id: "action-agent",
    label: "Action Agent",
    status: "running" as PipelineNodeStatus,
    description: "点击 / 输入 / 手势 / HTTP 调用 / 数据 seed",
    details: ["点击: 左键/右键/双击/长按", "输入: 文本输入/文件上传/富文本编辑", "手势: 拖拽/滑动/缩放", "HTTP 调用: GET/POST/PUT/DELETE + headers", "数据 seed: 测试数据准备与注入"],
  },
  {
    id: "workflow-agent",
    label: "Workflow Agent",
    status: "running" as PipelineNodeStatus,
    description: "流程图编排 / 数据流传递 / 分支循环 / 清理钩子",
    details: ["流程图编排: DAG 依赖图、串并行编排", "数据流传递: 前置输出 → 后置输入映射", "分支循环: 条件分支、重试循环、超时控制", "清理钩子: 测试前/后置清理、资源回收"],
  },
  {
    id: "execution-engine",
    label: "Execution Engine",
    status: "waiting" as PipelineNodeStatus,
    description: "驱动 / 回放 / 断言 / 产物采集",
    details: ["驱动: Playwright/Selenium/API Client", "回放: 录屏、截图、日志回放", "断言: HTTP 状态码、页面元素、数据库状态", "产物采集: 截图、视频、HAR、trace 文件"],
  },
  {
    id: "bug-triage",
    label: "Bug Triage",
    status: "waiting" as PipelineNodeStatus,
    description: "P0-P3 优先级分诊 / 回溯链 / 相似聚类 / Owner 路由",
    details: ["P0-P3 分诊: 阻塞/严重/一般/轻微", "回溯链: Bug → 测试用例 → AC → Spec", "相似聚类: 文本相似度 + 堆栈聚类", "Owner 路由: 模块 → 负责人自动分配"],
  },
  {
    id: "internal-checker",
    label: "内部 Checker",
    status: "waiting" as PipelineNodeStatus,
    description: "AC 覆盖率 / Flaky 检测 / 证据完整性 / 性能基线",
    details: ["AC 覆盖率: 每个 AC 至少对应一条用例", "Flaky 检测: 重复执行 3 次确认稳定性", "证据完整性: 截图/视频/日志齐全", "性能基线: 响应时间/吞吐量在基线 ±20% 内"],
  },
  {
    id: "external-reviewer",
    label: "外部 Reviewer",
    status: "waiting" as PipelineNodeStatus,
    description: "需求 OPC 验收",
    details: ["需求 OPC: 需求方确认测试产出", "测试报告审核: 覆盖率、通过率、缺陷统计", "质量门禁: Checker 全绿 + Reviewer 通过", "交付签署: 测试产物归档与版本标记"],
  },
]

export async function GET() {
  const response: PipelineResponse = {
    nodes: pipelineNodes,
    totalNodes: pipelineNodes.length,
  }
  return NextResponse.json(response)
}
