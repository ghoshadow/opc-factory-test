import { z } from "zod"

const intakeTypes = ["初步需求", "功能需求", "技术需求", "Bug 报告"] as const
const intakePriorities = ["P0", "P1", "P2", "P3"] as const

export const intakeTypeEnum = z.enum(intakeTypes, {
  error: "请选择需求类型",
})
export const intakePriorityEnum = z.enum(intakePriorities, {
  error: "请选择优先级",
})

export const intakeSchema = z.object({
  type: intakeTypeEnum,
  title: z
    .string()
    .min(1, "请输入需求标题")
    .max(200, "标题最多 200 字符"),
  description: z
    .string()
    .min(1, "请输入需求描述")
    .max(5000, "描述最多 5000 字符"),
  priority: intakePriorityEnum,
})

export type IntakeInput = z.infer<typeof intakeSchema>
