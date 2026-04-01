export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { computeGrade } from '@/lib/analyzer/grade'
import type { Report } from '@/lib/analyzer/types'
import ScoreGauge from '@/components/score-gauge'
import CategoryCard from '@/components/category-card'
import IssueList from '@/components/issue-list'
import UrlInput from '@/components/url-input'

interface ReportRow {
  id: string
  url: string
  overall_score: number
  grade: string
  grade_color: string
  categories: Report['categories']
  issues: Report['issues']
  analyzed_at: string
  duration_ms: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchReport(id: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as ReportRow
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const row = await fetchReport(id)

  if (!row) {
    return { title: 'Report Not Found - SiteGrader' }
  }

  let hostname = row.url
  try {
    hostname = new URL(row.url).hostname
  } catch {}

  const { letter } = computeGrade(row.overall_score)

  return {
    title: `${hostname} scored ${row.overall_score}/100 (${letter}) - SiteGrader`,
    description: `SiteGrader report for ${hostname}: overall score ${row.overall_score}/100, grade ${letter}. See the full SEO, performance, security, accessibility, and mobile breakdown.`,
  }
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params
  const row = await fetchReport(id)

  if (!row) {
    notFound()
  }

  let hostname = row.url
  try {
    hostname = new URL(row.url).hostname
  } catch {}

  const { letter, color } = computeGrade(row.overall_score)
  const analyzedDate = new Date(row.analyzed_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      {/* Report header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {hostname}
        </h1>
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {row.url}
        </a>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Analyzed on {analyzedDate} &middot; {row.duration_ms}ms
        </p>
      </div>

      {/* Overall score */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <ScoreGauge score={row.overall_score} color={color} size={200} />
        <div className="text-center">
          <span
            className="text-5xl font-extrabold"
            style={{ color }}
          >
            {letter}
          </span>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overall Grade</p>
        </div>
      </div>

      {/* Category breakdown */}
      {row.categories && row.categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Category Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {row.categories.map((cat) => (
              <CategoryCard key={cat.name} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Issues */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Issues
          {row.issues && row.issues.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({row.issues.length})
            </span>
          )}
        </h2>
        <IssueList issues={row.issues ?? []} />
      </section>

      {/* Share placeholder */}
      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-1 font-semibold text-gray-900 dark:text-white">Share this report</h2>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Copy the link below to share these results.
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={typeof window !== 'undefined' ? window.location.href : `https://sitegrader.app/report/${id}`}
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </section>

      {/* Re-scan */}
      <section>
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Analyze another URL</h2>
        <UrlInput size="small" />
      </section>
    </div>
  )
}
