"use client"

import { useRouter } from "next/navigation"
import { LineStatusCard } from "./LineStatusCard"
import type { LineStatusData } from "@/types/factory"

interface LineStatusGridProps {
  lines: LineStatusData[]
}

export function LineStatusGrid({ lines }: LineStatusGridProps) {
  const router = useRouter()

  const handleClick = (id: string) => {
    router.push(`/${id}`)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {lines.map((line) => (
        <LineStatusCard key={line.id} data={line} onClick={handleClick} />
      ))}
    </div>
  )
}
