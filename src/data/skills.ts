import type { Skill } from "@/types/factory"

const skills: Skill[] = [
  { id: "interview-transcriber", name: "访谈转写", description: "将用户访谈录音自动转写为结构化笔录", line: "requirement", status: "installed" },
  { id: "concept-extractor", name: "概念抽取", description: "从原始需求文本中抽取领域概念与关系", line: "requirement", status: "available" },
  { id: "competitor-search", name: "竞品检索", description: "自动检索竞品信息并生成对比分析", line: "requirement", status: "available" },
  { id: "im-parser", name: "IM解析", description: "从即时消息中解析需求意图与上下文", line: "requirement", status: "installed" },

  { id: "ddd-modeler", name: "DDD建模", description: "基于DDD方法论生成领域模型与聚合设计", line: "coding", status: "installed" },
  { id: "code-generator", name: "代码生成", description: "根据设计规范自动生成业务代码骨架", line: "coding", status: "installed" },
  { id: "unit-test-gen", name: "单测生成", description: "自动生成单元测试用例与Mock数据", line: "coding", status: "available" },
  { id: "pattern-matcher", name: "设计模式", description: "推荐适用的设计模式并提供实现参考", line: "coding", status: "available" },

  { id: "selector-gen", name: "选择器生成", description: "智能生成UI元素选择器用于自动化测试", line: "testing", status: "installed" },
  { id: "visual-locator", name: "视觉定位", description: "基于视觉AI的页面元素定位与校验", line: "testing", status: "available" },
  { id: "http-caller", name: "HTTP调用", description: "自动化API接口调用与响应校验", line: "testing", status: "installed" },
  { id: "data-seeder", name: "数据Seed", description: "生成测试所需的种子数据集", line: "testing", status: "available" },

  { id: "build-trigger", name: "编译触发", description: "根据代码变更自动触发CI编译流水线", line: "sre", status: "installed" },
  { id: "sast-scanner", name: "SAST扫描", description: "静态应用安全测试扫描与漏洞报告", line: "sre", status: "available" },
  { id: "vuln-detector", name: "漏洞检测", description: "依赖库漏洞检测与升级建议", line: "sre", status: "available" },
  { id: "sbom-gen", name: "SBOM生成", description: "生成软件物料清单用于合规审计", line: "sre", status: "installed" },
]

export function getSkills() {
  return skills
}

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id)
}

export function updateSkillStatus(id: string, status: "installed" | "available"): Skill | undefined {
  const skill = skills.find((s) => s.id === id)
  if (skill) {
    skill.status = status
  }
  return skill
}
