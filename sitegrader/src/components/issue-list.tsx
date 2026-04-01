'use client'

import { useState } from 'react'
import type { Issue, IssueSeverity } from '@/lib/analyzer/types'

interface IssueListProps {
  issues: Issue[]
}

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { color: string; bg: string; label: string }
> = {
  critical: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', label: 'Critical' },
  warning: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500', label: 'Warning' },
  info: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', label: 'Info' },
}

function SeverityDot({ severity }: { severity: IssueSeverity }) {
  return (
    <span
      className={`mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SEVERITY_CONFIG[severity].bg}`}
      aria-label={SEVERITY_CONFIG[severity].label}
    />
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function IssueRow({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="border-b border-gray-100 last:border-0 dark:border-gray-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700/50"
        aria-expanded={open}
      >
        <SeverityDot severity={issue.severity} />
        <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {issue.title}
        </span>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {issue.category}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-4 pb-3 pl-10 text-sm text-gray-600 dark:text-gray-400">
          {issue.description}
        </div>
      )}
    </li>
  )
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        No issues found
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <ul>
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </ul>
    </div>
  )
}
