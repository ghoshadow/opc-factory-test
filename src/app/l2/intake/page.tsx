"use client"

import { useState, useCallback } from "react"
import { useSWRConfig } from "swr"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { IntakeList } from "@/components/requirement/IntakeList"
import { IntakeForm } from "@/components/requirement/IntakeForm"

export default function IntakePage() {
  const [showForm, setShowForm] = useState(false)
  const { mutate } = useSWRConfig()

  const handleSuccess = useCallback(() => {
    setShowForm(false)
    mutate((key) => typeof key === "string" && key.startsWith("/api/v1/intake"))
  }, [mutate])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">入厂需求队列</h1>
          <p className="text-sm text-muted-foreground mt-1">
            展示所有入厂需求，按优先级排序，支持按类型、优先级和状态筛选
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          新建需求
        </Button>
      </div>

      <IntakeList />

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>新建需求</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <IntakeForm onSuccess={handleSuccess} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
