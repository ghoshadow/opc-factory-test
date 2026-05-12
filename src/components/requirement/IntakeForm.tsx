"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Label } from "@/components/ui/label"
import { intakeSchema, type IntakeInput } from "@/lib/validations/intake"

type IntakeFormData = IntakeInput

// ── Options ────────────────────────────────────────────────────────
const typeOptions = [
  { value: "初步需求" as const, label: "初步需求" },
  { value: "功能需求" as const, label: "功能需求" },
  { value: "技术需求" as const, label: "技术需求" },
  { value: "Bug 报告" as const, label: "Bug 报告" },
]

const priorityOptions = [
  { value: "P0" as const, label: "P0" },
  { value: "P1" as const, label: "P1" },
  { value: "P2" as const, label: "P2" },
  { value: "P3" as const, label: "P3" },
]

// ── Component ──────────────────────────────────────────────────────
export function IntakeForm() {
  const [descWarning, setDescWarning] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      type: "初步需求",
      title: "",
      description: "",
      priority: "P2",
    },
  })

  const onSubmit = async (data: IntakeFormData) => {
    const response = await fetch("/api/v1/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json()
      toast.error(err.error || "提交失败", {
        description: err.fields ? Object.values(err.fields).join("；") : undefined,
      })
      return
    }

    toast.success("需求已提交", {
      description: `「${data.title}」已成功进入需求队列`,
    })
    reset()
    setDescWarning(null)
  }

  const handleDescBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > 0 && val.length < 10) {
      setDescWarning("描述建议至少 10 字符")
    } else if (val.length > 5000) {
      setDescWarning("描述最多 5000 字符")
    } else {
      setDescWarning(null)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground"
      noValidate
    >
      {/* ── Type ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>需求类型</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              options={typeOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* ── Title ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="title">需求标题</Label>
        <Input
          id="title"
          placeholder="请输入需求标题"
          maxLength={200}
          {...register("title")}
          aria-invalid={errors.title ? "true" : undefined}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* ── Description ──────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="description">需求描述</Label>
        <Textarea
          id="description"
          placeholder="请输入需求描述（10 - 5000 字符）"
          rows={5}
          {...register("description", {
            onBlur: handleDescBlur,
          })}
          aria-invalid={errors.description ? "true" : undefined}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        {descWarning && !errors.description && (
          <p className="text-sm text-amber-600">{descWarning}</p>
        )}
      </div>

      {/* ── Priority ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>优先级</Label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              options={priorityOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      {/* ── Submit ───────────────────────────────────────────── */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "提交中..." : "提交需求"}
      </Button>
    </form>
  )
}
