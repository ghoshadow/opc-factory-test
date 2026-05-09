import { NextResponse } from "next/server"
import type { ExecuteRequest, ExecuteResponse, TestStep, TestStepStatus } from "@/types/factory"

const scenarios = [
  {
    id: "S-001",
    acceptanceCriteria: [
      {
        id: "AC-001",
        steps: [
          { id: "S-001-1", description: "打开登录页面", expectedResult: "显示登录表单，包含用户名和密码输入框" },
          { id: "S-001-2", description: "输入正确的用户名和密码", expectedResult: "输入框接受输入，无报错" },
          { id: "S-001-3", description: "点击登录按钮", expectedResult: "跳转到首页，显示用户信息" },
        ],
      },
      {
        id: "AC-002",
        steps: [
          { id: "S-001-4", description: "打开登录页面", expectedResult: "显示登录表单" },
          { id: "S-001-5", description: "输入正确用户名和错误密码", expectedResult: "输入框接受输入" },
          { id: "S-001-6", description: "点击登录按钮", expectedResult: "显示'用户名或密码错误'提示，停留在登录页" },
        ],
      },
    ],
  },
  {
    id: "S-002",
    acceptanceCriteria: [
      {
        id: "AC-003",
        steps: [
          { id: "S-002-1", description: "访问订单列表页（数据超过20条）", expectedResult: "底部显示分页控件，页码正确" },
          { id: "S-002-2", description: "点击第2页", expectedResult: "列表刷新显示第2页数据，URL 包含 page=2" },
          { id: "S-002-3", description: "点击上一页", expectedResult: "回到第1页，数据正确" },
          { id: "S-002-4", description: "修改每页条数为50", expectedResult: "列表显示50条数据，分页控件更新" },
        ],
      },
      {
        id: "AC-004",
        steps: [
          { id: "S-002-5", description: "在订单列表页选择状态筛选'待付款'", expectedResult: "列表只显示待付款订单，分页重置为第1页" },
          { id: "S-002-6", description: "翻到第2页", expectedResult: "第2页仍保持'待付款'筛选条件" },
          { id: "S-002-7", description: "清除筛选条件", expectedResult: "显示全部订单，分页重置" },
        ],
      },
    ],
  },
]

function simulateStepResult(step: { id: string; description: string; expectedResult: string }): TestStep {
  // Deterministic "random" based on step id to keep results consistent
  const charSum = step.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0)
  const passed = charSum % 3 !== 0 // ~67% pass rate

  const status: TestStepStatus = passed ? "passed" : "failed"
  const duration = Math.floor(100 + (charSum % 900))

  const result: TestStep = {
    id: step.id,
    description: step.description,
    expectedResult: step.expectedResult,
    status,
    duration,
  }

  if (passed) {
    result.actualResult = step.expectedResult
  } else {
    result.actualResult = `实际结果与预期不符: ${step.expectedResult}`
    result.errorDetail = `断言失败 at step ${step.id}: 预期 "${step.expectedResult}" 但获取到了不同的结果。\nTrace: Error at line ${charSum % 200 + 10}\n  at TestRunner.execute (runner.ts:${charSum % 100 + 50})`
    result.screenshot = `/screenshots/failure-${step.id}.png`
    result.log = `[${new Date().toISOString()}] INFO  Starting step: ${step.description}\n[${new Date().toISOString()}] ERROR Assertion failed: expected result not matched\n[${new Date().toISOString()}] INFO  Screenshot saved`
  }

  return result
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ExecuteRequest
    const { scenarioId, acId } = body

    const results: TestStep[] = []

    for (const scenario of scenarios) {
      if (scenarioId && scenario.id !== scenarioId) continue

      for (const ac of scenario.acceptanceCriteria) {
        if (acId && ac.id !== acId) continue

        for (const step of ac.steps) {
          // Simulate execution delay per step
          results.push(simulateStepResult(step))
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No matching scenarios or ACs found" }, { status: 404 })
    }

    const passed = results.filter((r) => r.status === "passed").length
    const failed = results.filter((r) => r.status === "failed").length

    const response: ExecuteResponse = {
      scenarioId: scenarioId || "all",
      acId: acId || "all",
      results,
      passed,
      failed,
      total: results.length,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
