import { NextResponse } from "next/server"
import type { LogsData } from "@/types/factory"

const mockLogs: LogsData = {
  logs: [
    { id: "l1", timestamp: "2026-05-10T14:30:01Z", level: "INFO", service: "payment-gateway", message: "Payment processed successfully — order_id=ORD-8821, amount=¥299.00, channel=wechat", traceId: "trace-abc001" },
    { id: "l2", timestamp: "2026-05-10T14:30:00Z", level: "WARN", service: "order-service", message: "Order fulfillment delayed — order_id=ORD-8820, reason=inventory_check_timeout, retry=2/3", traceId: "trace-abc000" },
    { id: "l3", timestamp: "2026-05-10T14:29:58Z", level: "ERROR", service: "inventory-service", message: "Redis connection pool exhausted — active=50/50, waiting=12, timeout_count=3", traceId: "trace-abc000" },
    { id: "l4", timestamp: "2026-05-10T14:29:55Z", level: "INFO", service: "auth-service", message: "Token refreshed for user_id=U-5621, session_valid=24h", traceId: "trace-abz999" },
    { id: "l5", timestamp: "2026-05-10T14:29:50Z", level: "DEBUG", service: "notification-service", message: "SMS template compiled — template_id=sms_order_shipped, params={name, orderId, trackingNo}" },
    { id: "l6", timestamp: "2026-05-10T14:29:45Z", level: "FATAL", service: "payment-gateway", message: "SSL certificate verification failed for upstream bank endpoint — endpoint=banks/abc/charge, cert_expiry=2026-05-09", traceId: "trace-fatal01" },
    { id: "l7", timestamp: "2026-05-10T14:29:40Z", level: "INFO", service: "gateway", message: "Request routed — path=/api/v1/orders, upstream=order-service:8080, latency=12ms" },
    { id: "l8", timestamp: "2026-05-10T14:29:35Z", level: "WARN", service: "payment-gateway", message: "Retry on upstream timeout — attempt=2/3, bank=abc, timeout=5000ms", traceId: "trace-retry01" },
    { id: "l9", timestamp: "2026-05-10T14:29:30Z", level: "INFO", service: "order-service", message: "Order created — order_id=ORD-8822, user_id=U-7812, items=3, total=¥1,299.00" },
    { id: "l10", timestamp: "2026-05-10T14:29:25Z", level: "ERROR", service: "gateway", message: "Upstream connection refused — target=inventory-service:8080, error=ECONNREFUSED, retries_exhausted=true", traceId: "trace-err02" },
    { id: "l11", timestamp: "2026-05-10T14:29:20Z", level: "INFO", service: "inventory-service", message: "Stock reserved — sku=SKU-4532, quantity=2, remaining=198, order_id=ORD-8822" },
    { id: "l12", timestamp: "2026-05-10T14:29:15Z", level: "DEBUG", service: "auth-service", message: "JWT claims decoded — sub=U-7812, roles=[user], exp=1746894555" },
  ],
  total: 12,
}

export async function GET() {
  return NextResponse.json({ type: "logs", data: mockLogs })
}
