'use client'

import { useState } from 'react'
import type { Issue, IssueSeverity } from '@/lib/analyzer/types'

interface IssueListProps {
  issues: Issue[]
}

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { color: string; bg: string; badge: string; label: string }
> = {
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    label: 'Critical',
  },
  warning: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Warning',
  },
  info: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    label: 'Info',
  },
}

/**
 * Renders a description string, turning backtick-wrapped segments into
 * styled inline code blocks.
 */
function RichDescription({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/)
  return (
    <p className="leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
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
  const cfg = SEVERITY_CONFIG[issue.severity]

  return (
    <li className="border-b border-gray-100 last:border-0 dark:border-gray-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700/50"
        aria-expanded={open}
      >
        {/* Severity dot */}
        <span
          className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${cfg.bg}`}
          aria-label={cfg.label}
        />
        {/* Title */}
        <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {issue.title}
        </span>
        {/* Badges */}
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {issue.category}
          </span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="border-l-2 border-indigo-200 bg-gray-50 px-4 pb-4 pl-10 pt-2 text-sm text-gray-600 dark:border-indigo-800 dark:bg-gray-800/50 dark:text-gray-400">
          <RichDescription text={issue.description} />
        </div>
      )}
    </li>
  )
}

export default function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        No issues found — this site is in excellent shape!
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
