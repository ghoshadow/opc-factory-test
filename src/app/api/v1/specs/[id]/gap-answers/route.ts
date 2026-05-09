import { NextResponse } from "next/server";

import type {
  GapAnswer,
  GapAnswersResponse,
  GapQuestion,
  GapSubmitResponse,
} from "@/types/requirement";

const mockQuestions: GapQuestion[] = [
  {
    id: "gap-1",
    number: 1,
    description:
      "未明确用户权限模型：当前 Spec 未定义角色（如管理员/普通用户）的权限边界，请描述各角色能执行哪些操作。",
    severity: "critical",
    hint: "请列举至少 3 种角色及其权限范围",
  },
  {
    id: "gap-2",
    number: 2,
    description:
      "缺少错误处理策略：API 调用失败、网络超时等异常场景未覆盖，请说明如何处理这些错误并给用户反馈。",
    severity: "major",
    hint: "考虑网络错误、服务端错误、数据校验失败等场景",
  },
  {
    id: "gap-3",
    number: 3,
    description:
      "数据持久化方案未指定：Spec 中提到需要存储用户数据，但未说明使用哪种数据库或存储方案。",
    severity: "major",
    hint: "请说明数据库类型、核心表结构、索引策略",
  },
  {
    id: "gap-4",
    number: 4,
    description: "性能指标缺失：未定义页面加载时间、API 响应时间、并发用户数等非功能需求。",
    severity: "major",
    hint: "请给出各关键路径的 P95 延迟目标和并发量预估",
  },
  {
    id: "gap-5",
    number: 5,
    description: "国际化方案未覆盖：产品面向多语言用户，但 Spec 中未提及 i18n 实现方式。",
    severity: "minor",
    hint: "请说明支持的语言列表和翻译管理方案",
  },
  {
    id: "gap-6",
    number: 6,
    description:
      "安全认证机制模糊：仅提到「需要登录」，未说明认证协议（JWT/OAuth/Session）、Token 刷新策略等。",
    severity: "critical",
    hint: "请明确认证方式、Token 有效期、刷新机制",
  },
];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response: GapAnswersResponse = {
    questions: mockQuestions,
  };
  return NextResponse.json(response);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { answers?: GapAnswer[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json(
      { error: "answers array is required and must not be empty" },
      { status: 400 },
    );
  }

  // Validate each answer has both questionId and answer
  for (const a of body.answers) {
    if (!a.questionId || typeof a.answer !== "string") {
      return NextResponse.json(
        { error: "Each answer must have questionId (string) and answer (string)" },
        { status: 400 },
      );
    }
  }

  // Mock re-scoring: answers with length > 20 are considered "quality answers"
  const qualityCount = body.answers.filter((a) => a.answer.length > 20).length;
  const newScore = Math.min(100, Math.round((qualityCount / mockQuestions.length) * 100));
  const threshold = 80;
  const passed = newScore >= threshold;

  const response: GapSubmitResponse = {
    newScore,
    threshold,
    passed,
    message: passed
      ? `评分 ${newScore} 分 — 已达到成熟度阈值 ${threshold} 分，可进入下一阶段`
      : `评分 ${newScore} 分 — 仍未达到阈值 ${threshold} 分，建议补充更多细节后重新提交`,
  };

  return NextResponse.json(response);
}
