"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import type { LogEntry, LogLevel } from "@/types/factory"

interface Props {
  logs: LogEntry[]
}

const levelConfig: Record<LogLevel, { bg: string; text: string; border: string }> = {
  DEBUG:   { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  INFO:    { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  WARN:    { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  ERROR:   { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  FATAL:   { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-800 dark:text-rose-300", border: "border-rose-300 dark:border-rose-800" },
}

const allLevels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]

export function LogViewer({ logs }: Props) {
  const [search, setSearch] = useState("")
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set(allLevels))
  const [serviceFilter, setServiceFilter] = useState<string>("")

  const services = useMemo(() => {
    const s = new Set(logs.map((l) => l.service))
    return Array.from(s).sort()
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (!activeLevels.has(l.level)) return false
      if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.service.toLowerCase().includes(search.toLowerCase())) return false
      if (serviceFilter && l.service !== serviceFilter) return false
      return true
    })
  }, [logs, search, activeLevels, serviceFilter])

  const toggleLevel = (level: LogLevel) => {
    const next = new Set(activeLevels)
    if (next.has(level)) next.delete(level)
    else next.add(level)
    setActiveLevels(next)
  }

  return (
    <div className="space-y-3">
      {/* Search & filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索日志..."
            className="w-full rounded-md border bg-background py-2 pl-8 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-md border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">全部服务</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Level toggles */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {allLevels.map((level) => {
          const active = activeLevels.has(level)
          const cfg = levelConfig[level]
          return (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                active ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "bg-muted text-muted-foreground border-transparent opacity-50"
              }`}
            >
              {level}
            </button>
          )
        })}
        <span className="text-xs text-muted-foreground ml-2">{filtered.length} 条日志</span>
      </div>

      {/* Log list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">无匹配日志</div>
          ) : (
            filtered.map((log) => {
              const cfg = levelConfig[log.level]
              return (
                <div key={log.id} className={`px-4 py-3 hover:bg-muted/30 transition-colors ${log.level === "FATAL" || log.level === "ERROR" ? `border-l-2 ${cfg.border}` : "border-l-2 border-transparent"}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{log.timestamp.slice(11, 19)}</span>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      {log.level}
                    </span>
                    <span className="text-xs font-medium">{log.service}</span>
                  </div>
                  <p className="mt-1 text-sm font-mono break-all">{log.message}</p>
                  {log.traceId && (
                    <span className="inline-block mt-1 text-[10px] text-muted-foreground font-mono">
                      trace: {log.traceId}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
