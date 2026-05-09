import { z } from "zod"

export const intakeTypeEnum = z.enum(["初步需求", "Bug单", "改动单"])
export const intakePriorityEnum = z.enum(["urgent", "high", "medium", "low"])

export const intakeSchema = z.object({
  type: intakeTypeEnum,
  title: z.string().min(1, "标题不能为空").max(200, "标题最长 200 字符"),
  description: z.string().min(1, "描述不能为空").max(5000, "描述最长 5000 字符"),
  priority: intakePriorityEnum,
})

export type IntakeInput = z.infer<typeof intakeSchema>
