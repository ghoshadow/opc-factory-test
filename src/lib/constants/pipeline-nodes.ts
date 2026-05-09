import type { CodingPipelineNode } from "@/types/factory";

export const CODING_PIPELINE_NODES: CodingPipelineNode[] = [
  {
    id: "toco-router",
    label: "TocoAgent·分流",
    description: "接收 Spec 并路由至下游 Agent",
    status: "done",
    details: {
      plan: "根据 Spec 类型和领域边界，将需求文档自动路由到对应的 Domain Architect Agent。支持 5 种路由策略：CRUD 型、工作流型、计算型、集成型、迁移型。",
      code: "TocoAgent.Router.dispatch(spec) → targetAgent",
      report: "分流完成：识别为 CRUD 型需求，路由至 DomainArchitect · 订单领域",
    },
  },
  {
    id: "domain-architect",
    label: "DomainArchitect",
    description: "DDD 建模：ER 生成 / 聚合边界 / 领域事件",
    status: "done",
    details: {
      plan: "基于 Spec 执行领域驱动设计分析，输出实体关系图、聚合根与边界、领域事件定义。遵循聚合设计原则：一次事务只修改一个聚合实例。",
      design:
        "聚合根: Order, Product, Customer · 领域事件: OrderPlaced, OrderPaid, OrderShipped · 边界上下文: 订单、支付、物流",
      code: "DomainArchitect.analyze(spec) → DomainModel",
      report: "领域建模完成：识别 3 个聚合根、5 个领域事件、3 个边界上下文",
    },
  },
  {
    id: "planner",
    label: "Planner",
    description: "执行规划：任务拆分 / API 设计 / 依赖排序 / 工作量预估",
    status: "done",
    details: {
      plan: "将领域模型转化为可执行的开发计划。包含：任务拆分粒度 ≤4h/任务、API 契约定义、任务依赖拓扑排序、基于历史数据的工作量预估。",
      design:
        "拆分 12 个任务 · API 接口 4 个 · 预估总工时 24h · 关键路径: Order Creation → Payment Integration → Shipping Flow",
      code: "Planner.plan(domainModel) → ExecutionPlan",
      report: "执行规划完成：12 个任务、4 个 API、24h 预估工时，已生成甘特图",
    },
  },
  {
    id: "designer",
    label: "Designer",
    description: "详细设计：类/接口设计 / 模式应用 / 签名稳定性 / 测试点规划",
    status: "running",
    details: {
      plan: "基于执行计划进行详细设计。包含：类图与接口契约、设计模式选择与适配、方法签名稳定性检查、测试用例清单。",
      design:
        "OrderService (Facade) · IOrderRepository (Repository Pattern) · OrderPaidHandler (Observer) · IPaymentGateway (Strategy)",
      code: "Designer.design(plan) → DetailedDesign",
      report: "",
    },
  },
  {
    id: "developer",
    label: "Developer",
    description: "编码实现：代码生成 / 单测生成 / 设计模式遵循 / 文档同步",
    status: "waiting",
    details: {
      plan: "按照详细设计进行编码实现。遵循：先写测试、遵循设计模式、保持代码风格一致、自动同步 API 文档。",
      code: "",
      report: "",
    },
  },
  {
    id: "toco-checker",
    label: "TocoAgent·检查",
    description: "回路判断：Todo 扫描 / 设计缺口检测 / 覆盖率回溯",
    status: "waiting",
    details: {
      plan: "验收回路：扫描未完成 TODO、检测设计与实现偏差、回溯测试覆盖率是否达标、判断是否需要回路到 Designer/Developer。",
      code: "TocoAgent.Checker.audit(codebase) → AuditReport",
      report: "",
    },
  },
  {
    id: "internal-checker",
    label: "内部 Checker",
    description: "自检：Lint / Coverage ≥80% / Pattern Check / Spec-Code Drift",
    status: "waiting",
    details: {
      plan: "自动化质量门禁：ESLint 零告警、测试覆盖率 ≥80%、设计模式一致性检查、Spec 与代码偏差度 <5%。",
      code: "InternalChecker.validate(commit) → CheckerReport",
      report: "",
    },
  },
  {
    id: "external-reviewer",
    label: "外部 Reviewer",
    description: "测试 OPC 接收审",
    status: "waiting",
    details: {
      plan: "外部测试产线 OPC 接收审查：验收标准完成度检查、集成测试通过率、性能基准回归、安全扫描通过。",
      code: "ExternalReviewer.review(build) → ReviewReport",
      report: "",
    },
  },
];
