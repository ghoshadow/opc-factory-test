"use client"

import { useMemo, useState } from "react"
import type { MetricPoint } from "@/types/factory"

interface Props {
  metrics: MetricPoint[]
}

type MetricKey = "throughput" | "latency" | "errorRate"

const metricOptions: { key: MetricKey; label: string; color: string; unit: string }[] = [
  { key: "throughput", label: "吞吐量", color: "#3B82F6", unit: " req/s" },
  { key: "latency", label: "延迟", color: "#F59E0B", unit: " ms" },
  { key: "errorRate", label: "错误率", color: "#EF4444", unit: "%" },
]

export function MetricsChart({ metrics }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("throughput")

  const { path, area, maxVal, minVal, points } = useMemo(() => {
    const values = metrics.map((m) => m[selectedMetric])
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const w = 600
    const h = 200
    const pad = 20

    const pts = values.map((v, i) => ({
      x: pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2),
      y: h - pad - ((v - min) / range) * (h - pad * 2),
      v,
      ts: metrics[i].timestamp,
    }))

    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
    const area = `${d} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`

    return { path: d, area, maxVal: max, minVal: min, points: pts }
  }, [metrics, selectedMetric])

  const option = metricOptions.find((o) => o.key === selectedMetric)!

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {metricOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedMetric(opt.key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              selectedMetric === opt.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: opt.color }} />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <svg viewBox="0 0 600 220" className="w-full h-auto" role="img" aria-label={`${option.label} chart`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = 20 + frac * 180
            const val = maxVal - frac * (maxVal - minVal)
            return (
              <g key={frac}>
                <line x1={20} y1={y} x2={580} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                <text x={15} y={y + 4} textAnchor="end" className="text-[9px]" fill="#9ca3af">
                  {selectedMetric === "errorRate" ? val.toFixed(3) : Math.round(val)}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={area} fill={option.color} fillOpacity="0.08" />

          {/* Line */}
          <path d={path} fill="none" stroke={option.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke={option.color} strokeWidth="1.5" />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between px-5 mt-1">
          {points
            .filter((_, i) => i % 4 === 0 || i === points.length - 1)
            .map((p, i) => (
              <span key={i} className="text-[10px] text-muted-foreground font-mono">
                {p.ts.slice(11, 16)}
              </span>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
        <span>
          Max: <strong className="text-foreground">{selectedMetric === "errorRate" ? maxVal.toFixed(3) : Math.round(maxVal)}{option.unit}</strong>
        </span>
        <span>
          Min: <strong className="text-foreground">{selectedMetric === "errorRate" ? minVal.toFixed(3) : Math.round(minVal)}{option.unit}</strong>
        </span>
      </div>
    </div>
  )
}
