"use client"

import { LineStatusCard } from "@/components/factory/LineStatusCard"
import { useLineStatus } from "@/lib/api/factory"

export function LineStatusGrid() {
  const { lines, isLoading, isError } = useLineStatus()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (isError || !lines) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
        Failed to load line status. Please try again.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {lines.map((line) => (
        <LineStatusCard key={line.id} line={line} />
      ))}
    </div>
  )
}
