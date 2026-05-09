import { NextResponse } from "next/server"
import type { DecomposePipelineResponse } from "@/types/factory"

const mock: DecomposePipelineResponse = {
  rootId: "spec-refund-v2",
  nodes: [
    // Layer 0 – Root Spec
    {
      id: "spec-refund-v2",
      label: "退款服务 V2",
      type: "spec",
      status: "done",
      detail: "支持部分退款、退款时效、多支付渠道的退款服务规范",
      children: ["task-state", "task-channel", "task-amount", "task-notify"],
    },

    // Layer 1 – Tasks decomposed from spec
    {
      id: "task-state",
      label: "状态机实现",
      type: "task",
      status: "done",
      detail: "退款单状态机：init→processing→success/failed",
      children: ["pr-state-core", "pr-state-edge"],
    },
    {
      id: "task-channel",
      label: "渠道适配层",
      type: "task",
      status: "running",
      detail: "支付宝/微信/银行卡渠道的退款适配",
      children: ["pr-channel-alipay", "pr-channel-wx"],
    },
    {
      id: "task-amount",
      label: "金额拆分逻辑",
      type: "task",
      status: "done",
      detail: "部分退款金额校验与分摊",
      children: ["pr-amount-calc", "pr-amount-validate"],
    },
    {
      id: "task-notify",
      label: "通知服务",
      type: "task",
      status: "waiting",
      detail: "退款结果多渠道通知（短信/推送/邮件）",
      children: ["pr-notify-dispatcher"],
    },

    // Layer 2 – PRs
    {
      id: "pr-state-core",
      label: "PR #201 状态机核心",
      type: "pr",
      status: "done",
      detail: "状态转换引擎 + 幂等处理 — merged by 林",
      children: ["test-state-unit", "check-state-review"],
    },
    {
      id: "pr-state-edge",
      label: "PR #204 异常路径",
      type: "pr",
      status: "done",
      detail: "超时/重复回调的异常处理 — merged by 陈",
      children: ["test-state-edge-int"],
    },
    {
      id: "pr-channel-alipay",
      label: "PR #207 支付宝适配",
      type: "pr",
      status: "running",
      detail: "支付宝退款 API 适配，签名验证复杂度高 — review by 林",
      children: ["test-channel-alipay"],
    },
    {
      id: "pr-channel-wx",
      label: "PR #210 微信适配",
      type: "pr",
      status: "waiting",
      detail: "微信退款 API 适配，依赖 支付宝适配通过后启动",
      children: [],
    },
    {
      id: "pr-amount-calc",
      label: "PR #196 金额计算",
      type: "pr",
      status: "done",
      detail: "手续费分摊 + 部分退款按比例计算 — merged by 王",
      children: ["test-amount-calc"],
    },
    {
      id: "pr-amount-validate",
      label: "PR #199 金额校验",
      type: "pr",
      status: "failed",
      detail: "TocoAgent 发现 2 个 critical — 王 正在修复",
      children: ["test-amount-val", "check-amount-val-toco"],
    },
    {
      id: "pr-notify-dispatcher",
      label: "PR #215 通知分发",
      type: "pr",
      status: "waiting",
      detail: "统一通知分发器，待渠道适配完成后启动",
      children: [],
    },

    // Layer 3 – Test Cases / Checks
    {
      id: "test-state-unit",
      label: "TC-301 状态机单测",
      type: "test",
      status: "done",
      detail: "42 用例全部通过，覆盖率 96%",
      children: [],
    },
    {
      id: "check-state-review",
      label: "Review #88 状态机",
      type: "check",
      status: "done",
      detail: "Code Review: 设计 + 命名均 PASS",
      children: [],
    },
    {
      id: "test-state-edge-int",
      label: "TC-305 异常路径集成",
      type: "test",
      status: "running",
      detail: "18/22 通过，4 个超时用例不稳定",
      children: [],
    },
    {
      id: "test-channel-alipay",
      label: "TC-310 支付宝联调",
      type: "test",
      status: "running",
      detail: "沙箱环境联调中，已通过 8/12",
      children: [],
    },
    {
      id: "test-amount-calc",
      label: "TC-295 金额计算",
      type: "test",
      status: "done",
      detail: "28 用例全部通过",
      children: [],
    },
    {
      id: "test-amount-val",
      label: "TC-298 金额校验",
      type: "test",
      status: "waiting",
      detail: "等待 PR #199 修复后触发",
      children: [],
    },
    {
      id: "check-amount-val-toco",
      label: "Toco #45 扫描",
      type: "check",
      status: "failed",
      detail: "安全: 1 critical | 风格: 1 major",
      children: [],
    },
  ],
  edges: [
    { source: "spec-refund-v2", target: "task-state", label: "分解" },
    { source: "spec-refund-v2", target: "task-channel", label: "分解" },
    { source: "spec-refund-v2", target: "task-amount", label: "分解" },
    { source: "spec-refund-v2", target: "task-notify", label: "分解" },
    { source: "task-state", target: "pr-state-core", label: "开发" },
    { source: "task-state", target: "pr-state-edge", label: "开发" },
    { source: "task-channel", target: "pr-channel-alipay", label: "开发" },
    { source: "task-channel", target: "pr-channel-wx", label: "开发" },
    { source: "task-amount", target: "pr-amount-calc", label: "开发" },
    { source: "task-amount", target: "pr-amount-validate", label: "开发" },
    { source: "task-notify", target: "pr-notify-dispatcher", label: "开发" },
    { source: "pr-state-core", target: "test-state-unit", label: "验证" },
    { source: "pr-state-core", target: "check-state-review", label: "审查" },
    { source: "pr-state-edge", target: "test-state-edge-int", label: "验证" },
    { source: "pr-channel-alipay", target: "test-channel-alipay", label: "验证" },
    { source: "pr-amount-calc", target: "test-amount-calc", label: "验证" },
    { source: "pr-amount-validate", target: "test-amount-val", label: "验证" },
    { source: "pr-amount-validate", target: "check-amount-val-toco", label: "审查" },
    // Cross-dependencies
    { source: "pr-channel-alipay", target: "pr-channel-wx", label: "依赖" },
    { source: "pr-state-core", target: "pr-state-edge", label: "依赖" },
  ],
}

export async function GET() {
  return NextResponse.json(mock)
}
