"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

type SortState = { key: string; direction: "asc" | "desc" } | null

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)

  const sortedData = useMemo(() => {
    if (!sort) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort.key]
      const bVal = (b as Record<string, unknown>)[sort.key]
      if (aVal == null || bVal == null) return 0
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sort.direction === "asc" ? cmp : -cmp
    })
  }, [data, sort])

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return null
    })
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sort?.key !== columnKey) return <ArrowUpDown className="ml-1 size-3 text-muted-foreground/50" />
    return sort.direction === "asc"
      ? <ArrowUp className="ml-1 size-3" />
      : <ArrowDown className="ml-1 size-3" />
  }

  if (isLoading) {
    return (
      <div className={cn("w-full rounded-lg border", className)}>
        <div className="animate-pulse">
          <div className="flex border-b bg-muted/50 px-4 py-3">
            {columns.map((col) => (
              <div key={col.key} className="flex-1">
                <div className="h-4 w-20 rounded bg-muted-foreground/20" />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex border-b px-4 py-3 last:border-0">
              {columns.map((col) => (
                <div key={col.key} className="flex-1">
                  <div className="h-4 w-24 rounded bg-muted-foreground/10" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center rounded-lg border py-12 text-center", className)}>
        <Loader2 className="mb-2 size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-auto rounded-lg border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                  col.sortable && "cursor-pointer select-none hover:text-foreground",
                  col.className,
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  {col.sortable && <SortIcon columnKey={col.key} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={index}
              className={cn(
                "border-b last:border-0 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50",
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-sm", col.className)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
