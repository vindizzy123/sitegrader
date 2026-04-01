'use client'

import { useState } from 'react'
import type { CategoryScore } from '@/lib/analyzer/types'
import { computeGrade } from '@/lib/analyzer/grade'
import ScoreGauge from './score-gauge'

interface CategoryCardProps {
  category: CategoryScore
}

const CATEGORY_EMOJI: Record<string, string> = {
  seo: '🔍',
  performance: '⚡',
  security: '🔒',
  accessibility: '♿',
  mobile: '📱',
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [open, setOpen] = useState(false)
  const { color } = computeGrade(category.score)
  const criticalCount = category.issues.filter((i) => i.severity === 'critical').length
  const warningCount = category.issues.filter((i) => i.severity === 'warning').length
  const passedCount = category.passed
  const failedCount = category.total - category.passed
  const emoji = CATEGORY_EMOJI[category.name] ?? '📊'

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-200 dark:bg-gray-800 ${
        open
          ? 'border-indigo-300 shadow-md dark:border-indigo-700 col-span-2 sm:col-span-3 lg:col-span-5'
          : 'border-gray-200 hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:hover:border-indigo-800'
      }`}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-col items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-lg">{emoji}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <ScoreGauge score={category.score} color={color} size={100} />

        <div className="text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{category.label}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {category.passed} / {category.total} checks passed
          </p>
        </div>

        {(criticalCount > 0 || warningCount > 0) && (
          <div className="flex flex-wrap justify-center gap-1">
            {criticalCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {criticalCount === 0 && warningCount === 0 && category.total > 0 && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            All clear
          </span>
        )}
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Passed checks */}
            {passedCount > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                  Passed ({passedCount})
                </p>
                <ul className="space-y-1">
                  {Array.from({ length: passedCount }).map((_, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <svg className="h-3.5 w-3.5 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Check {i + 1} passed
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failed checks */}
            {failedCount > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Issues ({failedCount})
                </p>
                <ul className="space-y-1">
                  {category.issues.map((issue) => (
                    <li key={issue.id} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span
                        className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                          issue.severity === 'critical'
                            ? 'bg-red-500'
                            : issue.severity === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      {issue.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
