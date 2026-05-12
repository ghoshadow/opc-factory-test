"use client"

import { useState } from "react"
import useSWR from "swr"
import { Check, X, Loader2, User, Clock, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MetaSpec } from "@/types/spec"

interface SignoffPanelProps {
  specId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SignoffPanel({ specId }: SignoffPanelProps) {
  const { data: spec, mutate } = useSWR<MetaSpec>(
    `/api/v1/specs/${specId}`,
    fetcher
  )

  const [panelState, setPanelState] = useState<"idle" | "confirming" | "rejecting" | "loading">("idle")
  const [rejectComment, setRejectComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reviewerName = "需求产线 OPC"

  if (!spec) return null

  const { status, changeTrace } = spec

  const handleApprove = async () => {
    setError(null)
    setPanelState("loading")
    try {
      const res = await fetch(`/api/v1/specs/${specId}/signoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reviewerName,
          timestamp: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Signoff failed")
      }
      const updated = await res.json()
      mutate(updated, false)
      setPanelState("idle")
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败")
      setPanelState("idle")
    }
  }

  const handleReject = async () => {
    if (rejectComment.trim().length === 0) return
    setError(null)
    setPanelState("loading")
    try {
      const res = await fetch(`/api/v1/specs/${specId}/signoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          comment: rejectComment.trim(),
          reviewerName,
          timestamp: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Reject failed")
      }
      const updated = await res.json()
      mutate(updated, false)
      setPanelState("idle")
      setRejectComment("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败")
      setPanelState("idle")
    }
  }

  // Find the latest signoff ChangeRecord for signature display
  const latestSignoff = [...changeTrace]
    .reverse()
    .find((ct) => ct.source === "signoff")

  // Only show panel for in_review, signed_off, or rework statuses
  if (status !== "in_review" && status !== "signed_off" && status !== "rework") {
    return null
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <Check className="size-4" />
        签收审核
      </h3>

      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* in_review: Action buttons */}
      {status === "in_review" && panelState !== "confirming" && panelState !== "rejecting" && (
        <div className="flex gap-3">
          <button
            onClick={() => setPanelState("confirming")}
            disabled={panelState === "loading"}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              "bg-emerald-600 text-white hover:bg-emerald-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {panelState === "loading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            签收
          </button>
          <button
            onClick={() => {
              setRejectComment("")
              setError(null)
              setPanelState("rejecting")
            }}
            disabled={panelState === "loading"}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              "bg-red-600 text-white hover:bg-red-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <X className="size-4" />
            打回
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {status === "in_review" && panelState === "confirming" && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm">
            确认签收 Spec <strong>{specId}</strong>？
          </p>
          <p className="text-xs text-muted-foreground">
            签收后将流转至编码产线，无法撤回。
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setPanelState("idle")
                setError(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <Check className="size-3.5" />
              确认签收
            </button>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {status === "in_review" && panelState === "rejecting" && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">
              打回原因 <span className="text-destructive">*</span>
            </label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="请说明打回原因..."
              className="mt-1.5 flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setPanelState("idle")
                setRejectComment("")
                setError(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReject}
              disabled={rejectComment.trim().length === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors",
                rejectComment.trim().length === 0
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              <X className="size-3.5" />
              确认打回
            </button>
          </div>
        </div>
      )}

      {/* Signed-off Signature Display */}
      {status === "signed_off" && latestSignoff && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="size-4" />
            已签收 → 流转至编码产线
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              审核人: {reviewerName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(latestSignoff.timestamp).toLocaleString("zh-CN")}
            </span>
          </div>
        </div>
      )}

      {/* Rework Signature Display */}
      {status === "rework" && latestSignoff && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4 space-y-2">
          <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <X className="size-4" />
            已打回 → 回流需求产线
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              审核人: {reviewerName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(latestSignoff.timestamp).toLocaleString("zh-CN")}
            </span>
          </div>
          <div className="mt-2 rounded border border-red-200 bg-background px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MessageSquare className="size-3" />
              打回原因:
            </span>
            <p className="mt-0.5 text-sm">{latestSignoff.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
