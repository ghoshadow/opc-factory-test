"use client"

import type { MaturityDimension } from "@/types/factory"

interface MaturityGaugeProps {
  dimension: MaturityDimension
  threshold: number
}

const RADIUS = 45
const STROKE_WIDTH = 8
const VIEWBOX = 120
const CENTER = VIEWBOX / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getScoreColor(score: number, threshold: number): string {
  if (score >= 80) return "#16a34a" // green
  if (score >= threshold) return "#ca8a04" // yellow
  return "#dc2626" // red
}

function getScoreLabel(score: number, threshold: number): string {
  if (score >= 80) return "优秀"
  if (score >= threshold) return "良好"
  return "不足"
}

export function MaturityGauge({ dimension, threshold }: MaturityGaugeProps) {
  const offset = CIRCUMFERENCE - (dimension.score / 100) * CIRCUMFERENCE
  const color = getScoreColor(dimension.score, threshold)
  const label = getScoreLabel(dimension.score, threshold)

  // Threshold marker position (at 70 on the arc)
  const thresholdAngle = (threshold / 100) * 360 - 90
  const thresholdRad = (thresholdAngle * Math.PI) / 180
  const markerInnerR = RADIUS + STROKE_WIDTH / 2 + 1
  const markerOuterR = markerInnerR + 6
  const markerX = CENTER + markerInnerR * Math.cos(thresholdRad)
  const markerY = CENTER + markerInnerR * Math.sin(thresholdRad)
  const markerX2 = CENTER + (markerOuterR - 1) * Math.cos(thresholdRad)
  const markerY2 = CENTER + (markerOuterR - 1) * Math.sin(thresholdRad)

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-32 h-32"
        role="img"
        aria-label={`${dimension.name}: ${dimension.score}分 - ${label}`}
      >
        {/* Background ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-muted-foreground/20"
        />
        {/* Progress ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Threshold marker */}
        <line
          x1={markerX}
          y1={markerY}
          x2={markerX2}
          y2={markerY2}
          stroke="currentColor"
          strokeWidth={2}
          className="text-muted-foreground/50"
        />
        {/* Score text */}
        <text
          x={CENTER}
          y={CENTER - 4}
          textAnchor="middle"
          className="fill-foreground text-lg font-bold"
          fontSize="22"
          fontWeight="700"
        >
          {dimension.score}
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          分
        </text>
      </svg>
      {/* Dimension label */}
      <div className="text-center">
        <p className="text-sm font-semibold">{dimension.name}</p>
        <p
          className="text-xs mt-0.5 font-medium"
          style={{ color }}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
          {dimension.description}
        </p>
      </div>
    </div>
  )
}
