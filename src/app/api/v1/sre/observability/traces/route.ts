import { NextResponse } from "next/server"
import type { TraceData } from "@/types/factory"

const mockTrace: TraceData = {
  traceId: "trace-abc001",
  totalSpans: 8,
  duration: 847,
  rootSpan: {
    id: "span-root",
    operation: "POST /api/v1/orders",
    service: "gateway",
    startTime: "2026-05-10T14:29:58.000Z",
    duration: 847,
    status: "ok",
    children: [
      {
        id: "span-auth",
        operation: "verify_token",
        service: "auth-service",
        startTime: "2026-05-10T14:29:58.100Z",
        duration: 12,
        status: "ok",
      },
      {
        id: "span-inventory",
        operation: "reserve_stock",
        service: "inventory-service",
        startTime: "2026-05-10T14:29:58.120Z",
        duration: 94,
        status: "ok",
        children: [
          {
            id: "span-redis-check",
            operation: "GET stock:SKU-4532",
            service: "redis",
            startTime: "2026-05-10T14:29:58.130Z",
            duration: 3,
            status: "ok",
          },
          {
            id: "span-redis-decr",
            operation: "DECR stock:SKU-4532",
            service: "redis",
            startTime: "2026-05-10T14:29:58.200Z",
            duration: 2,
            status: "ok",
          },
        ],
      },
      {
        id: "span-payment",
        operation: "charge",
        service: "payment-gateway",
        startTime: "2026-05-10T14:29:58.220Z",
        duration: 610,
        status: "ok",
        children: [
          {
            id: "span-bank",
            operation: "POST /banks/abc/charge",
            service: "bank-gateway",
            startTime: "2026-05-10T14:29:58.230Z",
            duration: 580,
            status: "error",
          },
        ],
      },
      {
        id: "span-notify",
        operation: "send_order_confirmation",
        service: "notification-service",
        startTime: "2026-05-10T14:29:58.840Z",
        duration: 5,
        status: "ok",
      },
    ],
  },
}

export async function GET() {
  return NextResponse.json({ type: "traces", data: mockTrace })
}
