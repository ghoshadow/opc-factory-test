"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, CircleDot, ArrowRight, CheckCircle2 } from "lucide-react"
import type { TroubleshootNode } from "@/types/factory"

interface TroubleshootTreeProps {
  nodes: TroubleshootNode[]
}

function TreeNode({ node, depth = 0 }: { node: TroubleshootNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div
          className="absolute left-4 top-0 h-full w-px -translate-x-1/2"
          style={{
            background: "linear-gradient(to bottom, hsl(var(--muted-foreground)/0.3), transparent)",
          }}
        />
      )}

      {/* Node card */}
      <div className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
        <div className="w-full text-left rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors shadow-sm">
          {/* Question header */}
          <div className="flex items-start gap-3 p-4">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
              aria-label={expanded ? "收起" : "展开"}
            >
              {expanded ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 min-w-0 space-y-2">
              {/* Question */}
              <div className="flex items-center gap-2">
                <CircleDot className="size-3.5 text-amber-500 shrink-0" />
                <span className="text-sm font-semibold">{node.question || "未命名问题"}</span>
              </div>

              {expanded && (
                <div className="space-y-2 pl-0.5">
                  {/* Steps */}
                  {node.steps.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">排查步骤:</p>
                      <ol className="space-y-0.5">
                        {node.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-xs font-mono text-muted-foreground/60 mt-0.5 shrink-0">
                              {i + 1}.
                            </span>
                            <span>{step || "(空步骤)"}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Solution */}
                  {node.solution && (
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                      <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">解决方案</p>
                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">{node.solution}</p>
                      </div>
                    </div>
                  )}

                  {/* Children nodes */}
                  {node.children && node.children.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <ArrowRight className="size-3" />
                        子问题
                      </p>
                      {node.children.map((child) => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TroubleshootTree({ nodes }: TroubleshootTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/25 p-8 text-center">
        <CircleDot className="size-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">暂无排障节点</p>
        <p className="text-xs text-muted-foreground/70 mt-1">编辑 Runbook 添加排障树节点</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  )
}
