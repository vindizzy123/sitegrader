'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  color: string
  size?: number
  label?: string
}

/** Returns a stop-color hex that blends from red → yellow → green based on score 0-100 */
function scoreToGradientColors(score: number): { start: string; end: string } {
  if (score >= 80) return { start: '#10b981', end: '#34d399' }   // green
  if (score >= 60) return { start: '#f59e0b', end: '#fcd34d' }   // amber
  if (score >= 40) return { start: '#f97316', end: '#fb923c' }   // orange
  return { start: '#ef4444', end: '#f87171' }                    // red
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

  const gradientId = `gauge-gradient-${size}-${clampedScore}`
  const glowId = `gauge-glow-${size}-${clampedScore}`
  const { start: gradStart, end: gradEnd } = scoreToGradientColors(clampedScore)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 1200

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // ease-out quart for a snappier feel
      const eased = 1 - Math.pow(1 - t, 4)
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
  const strokeWidth = size < 120 ? 8 : 12
  const fontSize = size < 120 ? size * 0.22 : size * 0.2
  const subFontSize = size < 120 ? size * 0.1 : size * 0.085

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <defs>
          {/* Gradient along the arc */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradStart} />
            <stop offset="100%" stopColor={gradEnd} />
          </linearGradient>
          {/* Glow filter */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={size < 120 ? 2 : 3} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />

        {/* Progress arc with gradient + glow */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter={`url(#${glowId})`}
          style={{ transition: 'none' }}
        />

        {/* Score number */}
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fill={color}
          style={{ fontFamily: 'inherit' }}
        >
          {displayed}
        </text>

        {/* "/100" sub-label only on larger gauges */}
        {size >= 160 && (
          <text
            x={cx}
            y={cy + fontSize * 0.35 + subFontSize * 1.4}
            textAnchor="middle"
            fontSize={subFontSize}
            fontWeight="500"
            fill="#9ca3af"
          >
            / 100
          </text>
        )}
      </svg>

      {label && (
        <span
          className="font-semibold text-gray-600 dark:text-gray-400"
          style={{ fontSize: size < 120 ? size * 0.12 : size * 0.1 }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
