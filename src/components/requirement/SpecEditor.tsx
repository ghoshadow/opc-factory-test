"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import useSWR from "swr"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { MetaSpec, ACItem, DataContract, DataContractField, ChangeRecord } from "@/types/spec"
import { Eye, Edit3, Save, Loader2, GitBranch, BookOpen, CheckSquare, Database, Palette, History } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type TabKey = "userStory" | "acceptanceCriteria" | "dataContract" | "uxDraft"

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "userStory", label: "User Story", icon: BookOpen },
  { key: "acceptanceCriteria", label: "验收标准 (AC)", icon: CheckSquare },
  { key: "dataContract", label: "数据契约", icon: Database },
  { key: "uxDraft", label: "UX 雏形", icon: Palette },
]

function debounce(fn: (...args: any[]) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

function markdownPreview(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-5 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/gm, (match: string) => {
      if (match.startsWith("<")) return match
      return match
    })
}

function acToMarkdown(items: ACItem[]): string {
  return items
    .map(
      (ac) =>
        `### ${ac.id}\n\n- **Given** ${ac.given}\n- **When** ${ac.when}\n- **Then** ${ac.then}`
    )
    .join("\n\n---\n\n")
}

function contractToMarkdown(contract: DataContract): string {
  const inputs = contract.inputs
    .map((f) => `| ${f.name} | ${f.type} | ${f.required ? "是" : "否"} | ${f.constraint || "—"} |`)
    .join("\n")
  const outputs = contract.outputs
    .map((f) => `| ${f.name} | ${f.type} | ${f.required ? "是" : "否"} | ${f.constraint || "—"} |`)
    .join("\n")

  return [
    "## 输入字段",
    "",
    "| 字段 | 类型 | 必填 | 约束 |",
    "|------|------|------|------|",
    inputs || "| — | — | — | — |",
    "",
    "## 输出字段",
    "",
    "| 字段 | 类型 | 必填 | 约束 |",
    "|------|------|------|------|",
    outputs || "| — | — | — | — |",
  ].join("\n")
}

interface SpecEditorProps {
  specId: string
}

export function SpecEditor({ specId }: SpecEditorProps) {
  const { data: spec, error, isLoading, mutate } = useSWR<MetaSpec>(
    `/api/v1/specs/${specId}`,
    fetcher
  )

  const [activeTab, setActiveTab] = useState<TabKey>("userStory")
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedVersion, setSavedVersion] = useState<number | null>(null)

  // Local editable state
  const [localStory, setLocalStory] = useState("")
  const [localAC, setLocalAC] = useState<ACItem[]>([])
  const [localInputs, setLocalInputs] = useState<DataContractField[]>([])
  const [localOutputs, setLocalOutputs] = useState<DataContractField[]>([])
  const [localUX, setLocalUX] = useState("")
  const [dirty, setDirty] = useState(false)

  // Initialize local state from fetched data
  useEffect(() => {
    if (spec) {
      setLocalStory(spec.userStory)
      setLocalAC(spec.acceptanceCriteria)
      setLocalInputs(spec.dataContract.inputs)
      setLocalOutputs(spec.dataContract.outputs)
      setLocalUX(spec.uxDraft)
      setSavedVersion(spec.version)
      setDirty(false)
    }
  }, [spec])

  const doSave = useCallback(
    async (payload: Partial<MetaSpec>) => {
      setSaving(true)
      try {
        const res = await fetch(`/api/v1/specs/${specId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Save failed")
        const updated = await res.json()
        setSavedVersion(updated.version)
        setDirty(false)
        mutate(updated, false)
      } catch (e) {
        console.error("Auto-save failed:", e)
      } finally {
        setSaving(false)
      }
    },
    [specId, mutate]
  )

  const debouncedSave = useRef(
    debounce((payload: Partial<MetaSpec>) => doSave(payload), 2000)
  ).current

  const save = useCallback(
    (payload: Partial<MetaSpec>) => {
      setDirty(true)
      debouncedSave(payload)
    },
    [debouncedSave]
  )

  const handleStoryChange = useCallback(
    (value: string) => {
      setLocalStory(value)
      save({ userStory: value })
    },
    [save]
  )

  const handleACChange = useCallback(
    (index: number, field: keyof ACItem, value: string) => {
      setLocalAC((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        save({ acceptanceCriteria: next })
        return next
      })
    },
    [save]
  )

  const addACItem = useCallback(() => {
    const newItem: ACItem = {
      id: `ac-${Date.now()}`,
      given: "",
      when: "",
      then: "",
    }
    setLocalAC((prev) => {
      const next = [...prev, newItem]
      save({ acceptanceCriteria: next })
      return next
    })
  }, [save])

  const removeACItem = useCallback(
    (index: number) => {
      setLocalAC((prev) => {
        const next = prev.filter((_, i) => i !== index)
        save({ acceptanceCriteria: next })
        return next
      })
    },
    [save]
  )

  const handleInputFieldChange = useCallback(
    (index: number, field: keyof DataContractField, value: string | boolean) => {
      setLocalInputs((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        save({ dataContract: { inputs: next, outputs: localOutputs } })
        return next
      })
    },
    [save, localOutputs]
  )

  const handleOutputFieldChange = useCallback(
    (index: number, field: keyof DataContractField, value: string | boolean) => {
      setLocalOutputs((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        save({ dataContract: { inputs: localInputs, outputs: next } })
        return next
      })
    },
    [save, localInputs]
  )

  const addField = useCallback(
    (target: "inputs" | "outputs") => {
      const newField: DataContractField = {
        name: "",
        type: "",
        required: false,
        constraint: "",
      }
      if (target === "inputs") {
        setLocalInputs((prev) => {
          const next = [...prev, newField]
          save({ dataContract: { inputs: next, outputs: localOutputs } })
          return next
        })
      } else {
        setLocalOutputs((prev) => {
          const next = [...prev, newField]
          save({ dataContract: { inputs: localInputs, outputs: next } })
          return next
        })
      }
    },
    [save, localInputs, localOutputs]
  )

  const removeField = useCallback(
    (target: "inputs" | "outputs", index: number) => {
      if (target === "inputs") {
        setLocalInputs((prev) => {
          const next = prev.filter((_, i) => i !== index)
          save({ dataContract: { inputs: next, outputs: localOutputs } })
          return next
        })
      } else {
        setLocalOutputs((prev) => {
          const next = prev.filter((_, i) => i !== index)
          save({ dataContract: { inputs: localInputs, outputs: next } })
          return next
        })
      }
    },
    [save, localInputs, localOutputs]
  )

  const handleUXChange = useCallback(
    (value: string) => {
      setLocalUX(value)
      save({ uxDraft: value })
    },
    [save]
  )

  const renderPreviewContent = () => {
    switch (activeTab) {
      case "userStory":
        return markdownPreview(localStory)
      case "acceptanceCriteria":
        return markdownPreview(acToMarkdown(localAC))
      case "dataContract":
        return markdownPreview(
          contractToMarkdown({ inputs: localInputs, outputs: localOutputs })
        )
      case "uxDraft":
        return markdownPreview(localUX)
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载 Spec...</span>
      </div>
    )
  }

  if (error || !spec) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">
          {error ? "加载 Spec 失败，请稍后重试" : "Spec 未找到"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header: version + save indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{spec.id}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <GitBranch className="size-3" />
            v{savedVersion ?? spec.version}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              spec.status === "draft" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
              spec.status === "ready_for_review" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              spec.status === "in_review" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              spec.status === "signed_off" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            )}
          >
            {spec.status === "draft" && "草稿"}
            {spec.status === "ready_for_review" && "待评审"}
            {spec.status === "in_review" && "评审中"}
            {spec.status === "signed_off" && "已签批"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/l2/spec-editor/versions?specId=${specId}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
          >
            <History className="size-3.5" />
            版本历史
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                保存中...
              </>
            ) : dirty ? (
              <>
                <Edit3 className="size-3.5" />
                未保存
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                已保存
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setPreview(false)
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="rounded-xl border bg-card">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            {TABS.find((t) => t.key === activeTab)?.label}
          </span>
          <button
            onClick={() => setPreview(!preview)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              preview
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {preview ? (
              <>
                <Edit3 className="size-3.5" />
                编辑
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                预览
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {preview ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderPreviewContent() }}
            />
          ) : (
            <>
              {/* User Story Tab */}
              {activeTab === "userStory" && (
                <textarea
                  value={localStory}
                  onChange={(e) => handleStoryChange(e.target.value)}
                  placeholder="作为...我想要...以便..."
                  className="w-full min-h-[300px] rounded-md border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              {/* Acceptance Criteria Tab */}
              {activeTab === "acceptanceCriteria" && (
                <div className="space-y-4">
                  {localAC.map((ac, i) => (
                    <div
                      key={ac.id}
                      className="rounded-lg border bg-muted/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {ac.id}
                        </span>
                        {localAC.length > 1 && (
                          <button
                            onClick={() => removeACItem(i)}
                            className="text-xs text-destructive hover:underline"
                          >
                            删除
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Given
                        </label>
                        <textarea
                          value={ac.given}
                          onChange={(e) =>
                            handleACChange(i, "given", e.target.value)
                          }
                          placeholder="给定前置条件..."
                          className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          When
                        </label>
                        <textarea
                          value={ac.when}
                          onChange={(e) =>
                            handleACChange(i, "when", e.target.value)
                          }
                          placeholder="当用户执行操作..."
                          className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Then
                        </label>
                        <textarea
                          value={ac.then}
                          onChange={(e) =>
                            handleACChange(i, "then", e.target.value)
                          }
                          placeholder="预期的结果..."
                          className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addACItem}
                    className="w-full rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    + 添加验收标准
                  </button>
                </div>
              )}

              {/* Data Contract Tab */}
              {activeTab === "dataContract" && (
                <div className="space-y-6">
                  {/* Inputs */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">输入字段</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 pr-2 font-medium">字段名</th>
                            <th className="pb-2 pr-2 font-medium">类型</th>
                            <th className="pb-2 pr-2 font-medium">必填</th>
                            <th className="pb-2 pr-2 font-medium">约束</th>
                            <th className="pb-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {localInputs.map((f, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.name}
                                  onChange={(e) =>
                                    handleInputFieldChange(i, "name", e.target.value)
                                  }
                                  placeholder="字段名"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.type}
                                  onChange={(e) =>
                                    handleInputFieldChange(i, "type", e.target.value)
                                  }
                                  placeholder="string"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  type="checkbox"
                                  checked={f.required}
                                  onChange={(e) =>
                                    handleInputFieldChange(i, "required", e.target.checked)
                                  }
                                  className="rounded"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.constraint || ""}
                                  onChange={(e) =>
                                    handleInputFieldChange(i, "constraint", e.target.value)
                                  }
                                  placeholder="可选"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5">
                                {localInputs.length > 1 && (
                                  <button
                                    onClick={() => removeField("inputs", i)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    删除
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={() => addField("inputs")}
                      className="mt-2 w-full rounded-lg border border-dashed border-muted-foreground/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      + 添加输入字段
                    </button>
                  </div>

                  {/* Outputs */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">输出字段</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 pr-2 font-medium">字段名</th>
                            <th className="pb-2 pr-2 font-medium">类型</th>
                            <th className="pb-2 pr-2 font-medium">必填</th>
                            <th className="pb-2 pr-2 font-medium">约束</th>
                            <th className="pb-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {localOutputs.map((f, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.name}
                                  onChange={(e) =>
                                    handleOutputFieldChange(i, "name", e.target.value)
                                  }
                                  placeholder="字段名"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.type}
                                  onChange={(e) =>
                                    handleOutputFieldChange(i, "type", e.target.value)
                                  }
                                  placeholder="string"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  type="checkbox"
                                  checked={f.required}
                                  onChange={(e) =>
                                    handleOutputFieldChange(i, "required", e.target.checked)
                                  }
                                  className="rounded"
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <input
                                  value={f.constraint || ""}
                                  onChange={(e) =>
                                    handleOutputFieldChange(i, "constraint", e.target.value)
                                  }
                                  placeholder="可选"
                                  className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </td>
                              <td className="py-1.5">
                                {localOutputs.length > 1 && (
                                  <button
                                    onClick={() => removeField("outputs", i)}
                                    className="text-xs text-destructive hover:underline"
                                  >
                                    删除
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={() => addField("outputs")}
                      className="mt-2 w-full rounded-lg border border-dashed border-muted-foreground/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      + 添加输出字段
                    </button>
                  </div>
                </div>
              )}

              {/* UX Draft Tab */}
              {activeTab === "uxDraft" && (
                <textarea
                  value={localUX}
                  onChange={(e) => handleUXChange(e.target.value)}
                  placeholder="## UI 草图描述&#10;&#10;描述交互流程..."
                  className="w-full min-h-[300px] rounded-md border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Change Trace */}
      {spec.changeTrace.length > 0 && (
        <div className="rounded-xl border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <GitBranch className="size-3.5" />
            变更集追溯链
          </h3>
          <div className="space-y-2">
            {spec.changeTrace.map((ct: ChangeRecord, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border bg-card p-3"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    ct.source === "review_board" &&
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    ct.source === "gap_agent" &&
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    ct.source === "revision_engine" &&
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  )}
                >
                  {ct.source === "review_board" && "Review Board"}
                  {ct.source === "gap_agent" && "Gap Agent"}
                  {ct.source === "revision_engine" && "Revision Engine"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{ct.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    v{ct.versionFrom} → v{ct.versionTo} ·{" "}
                    {new Date(ct.timestamp).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
