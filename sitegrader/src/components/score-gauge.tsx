'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  color: string
  size?: number
  label?: string
}

export default function ScoreGauge({
  score,
  color,
  size = 180,
  label,
}: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)))
  const progress = (displayed / 100) * circumference
  const offset = circumference - progress

  useEffect(() => {
    const start = performance.now()
    const duration = 1000

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(eased * clampedScore))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [clampedScore])

  const cx = size / 2
  const cy = size / 2
  const fontSize = size < 120 ? size * 0.22 : size * 0.2
  const labelFontSize = size < 120 ? size * 0.12 : size * 0.1

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size < 120 ? 8 : 12}
          className="dark:stroke-gray-700"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size < 120 ? 8 : 12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'none' }}
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="700"
          fill={color}
        >
          {displayed}
        </text>
      </svg>
      {label && (
        <span
          className="font-medium text-gray-600 dark:text-gray-400"
          style={{ fontSize: labelFontSize }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
