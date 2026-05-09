import { NextResponse } from "next/server";

import type { TestCasesResponse, TestScenario } from "@/types/factory";

const scenarios: TestScenario[] = [
  {
    id: "S-001",
    name: "用户登录流程",
    feature: "认证模块",
    acceptanceCriteria: [
      {
        id: "AC-001",
        title: "正确账号密码可成功登录",
        steps: [
          {
            id: "S-001-1",
            description: "打开登录页面",
            expectedResult: "显示登录表单，包含用户名和密码输入框",
            status: "pending",
          },
          {
            id: "S-001-2",
            description: "输入正确的用户名和密码",
            expectedResult: "输入框接受输入，无报错",
            status: "pending",
          },
          {
            id: "S-001-3",
            description: "点击登录按钮",
            expectedResult: "跳转到首页，显示用户信息",
            status: "pending",
          },
        ],
      },
      {
        id: "AC-002",
        title: "错误密码显示提示信息",
        steps: [
          {
            id: "S-001-4",
            description: "打开登录页面",
            expectedResult: "显示登录表单",
            status: "pending",
          },
          {
            id: "S-001-5",
            description: "输入正确用户名和错误密码",
            expectedResult: "输入框接受输入",
            status: "pending",
          },
          {
            id: "S-001-6",
            description: "点击登录按钮",
            expectedResult: "显示'用户名或密码错误'提示，停留在登录页",
            status: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "S-002",
    name: "订单列表分页与筛选",
    feature: "订单模块",
    acceptanceCriteria: [
      {
        id: "AC-003",
        title: "分页控件正确显示并可用",
        steps: [
          {
            id: "S-002-1",
            description: "访问订单列表页（数据超过20条）",
            expectedResult: "底部显示分页控件，页码正确",
            status: "pending",
          },
          {
            id: "S-002-2",
            description: "点击第2页",
            expectedResult: "列表刷新显示第2页数据，URL 包含 page=2",
            status: "pending",
          },
          {
            id: "S-002-3",
            description: "点击上一页",
            expectedResult: "回到第1页，数据正确",
            status: "pending",
          },
          {
            id: "S-002-4",
            description: "修改每页条数为50",
            expectedResult: "列表显示50条数据，分页控件更新",
            status: "pending",
          },
        ],
      },
      {
        id: "AC-004",
        title: "筛选条件与分页联动",
        steps: [
          {
            id: "S-002-5",
            description: "在订单列表页选择状态筛选'待付款'",
            expectedResult: "列表只显示待付款订单，分页重置为第1页",
            status: "pending",
          },
          {
            id: "S-002-6",
            description: "翻到第2页",
            expectedResult: "第2页仍保持'待付款'筛选条件",
            status: "pending",
          },
          {
            id: "S-002-7",
            description: "清除筛选条件",
            expectedResult: "显示全部订单，分页重置",
            status: "pending",
          },
        ],
      },
      {
        id: "AC-005",
        title: "搜索结果高亮显示",
        steps: [
          {
            id: "S-002-8",
            description: "在搜索框输入订单号",
            expectedResult: "匹配的订单号高亮显示",
            status: "pending",
          },
          {
            id: "S-002-9",
            description: "清空搜索框",
            expectedResult: "恢复默认列表，高亮消失",
            status: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "S-003",
    name: "支付回调幂等性验证",
    feature: "支付模块",
    acceptanceCriteria: [
      {
        id: "AC-006",
        title: "重复回调只处理一次",
        steps: [
          {
            id: "S-003-1",
            description: "模拟支付成功回调",
            expectedResult: "订单状态更新为'已支付'",
            status: "pending",
          },
          {
            id: "S-003-2",
            description: "再次发送相同回调",
            expectedResult: "返回成功但不重复处理，订单状态不变",
            status: "pending",
          },
          {
            id: "S-003-3",
            description: "检查支付记录表",
            expectedResult: "只有一条支付记录",
            status: "pending",
          },
        ],
      },
      {
        id: "AC-007",
        title: "回调超时自动重试机制",
        steps: [
          {
            id: "S-003-4",
            description: "模拟首次回调超时",
            expectedResult: "系统记录失败日志，触发重试队列",
            status: "pending",
          },
          {
            id: "S-003-5",
            description: "等待重试执行",
            expectedResult: "重试成功，订单状态正确更新",
            status: "pending",
          },
        ],
      },
    ],
  },
];

export async function GET() {
  const response: TestCasesResponse = {
    scenarios,
    total: scenarios.reduce(
      (sum, s) => sum + s.acceptanceCriteria.reduce((a, ac) => a + ac.steps.length, 0),
      0,
    ),
  };
  return NextResponse.json(response);
}
