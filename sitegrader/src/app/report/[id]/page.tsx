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

/** Grade → hero gradient classes */
function heroGradient(score: number): string {
  if (score >= 85) return 'from-emerald-900 via-slate-900 to-indigo-900'
  if (score >= 70) return 'from-amber-900 via-slate-900 to-indigo-900'
  if (score >= 55) return 'from-orange-900 via-slate-900 to-indigo-900'
  return 'from-red-900 via-slate-900 to-indigo-900'
}

/** Grade label with colour */
function GradePill({ letter, color }: { letter: string; color: string }) {
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 text-4xl font-black text-white shadow-2xl"
      style={{ backgroundColor: color + '33', borderColor: color + '66' }}
    >
      <span style={{ color }}>{letter}</span>
    </div>
  )
}

const PASSED_CHECK_LABELS: Record<string, string[]> = {
  seo: [
    'Title tag present',
    'Title length optimal',
    'Meta description present',
    'Meta description length optimal',
    'H1 heading present',
    'Single H1 heading',
    'Heading hierarchy correct',
    'Images have alt text',
    'Canonical URL set',
    'Open Graph tags present',
    'Twitter Card tags present',
    'Internal links found',
  ],
  performance: [
    'Page size under 3 MB',
    'Page size under 500 KB',
    'Image count reasonable',
    'Modern image formats',
    'Compression enabled',
    'Cache headers present',
    'Script count reasonable',
  ],
  security: [
    'HTTPS enabled',
    'HSTS header present',
    'Content-Security-Policy set',
    'X-Frame-Options set',
    'X-Content-Type-Options set',
    'Server version hidden',
    'No mixed content',
  ],
  accessibility: [
    'Language attribute set',
    'Images have alt text',
    'Form inputs have labels',
    'Semantic HTML used',
    'Descriptive link text',
    'Main landmark present',
  ],
  mobile: [
    'Viewport meta tag present',
    'Viewport correctly configured',
    'Responsive images used',
    'Page size mobile-friendly',
  ],
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

  // Collect all passed checks across all categories for the highlights section
  const allPassedChecks: { label: string; category: string }[] = []
  if (row.categories) {
    for (const cat of row.categories) {
      const labels = PASSED_CHECK_LABELS[cat.name] ?? []
      const catIssueIds = new Set(cat.issues.map((i) => i.id))
      // passed = total - issues.length checks. We use the label list as a proxy.
      // Show up to `cat.passed` labels from this category.
      let count = 0
      for (const label of labels) {
        if (count >= cat.passed) break
        // Only include if this isn't obviously one that failed (rough heuristic via issue titles)
        const conflictingIssue = cat.issues.find(
          (issue) => issue.title.toLowerCase().includes(label.toLowerCase().split(' ')[0]),
        )
        if (!conflictingIssue) {
          allPassedChecks.push({ label, category: cat.label })
          count++
        }
      }
    }
  }

  const totalIssues = row.issues?.length ?? 0
  const totalPassed = row.categories?.reduce((s, c) => s + c.passed, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Hero banner ── */}
      <div className={`bg-gradient-to-br ${heroGradient(row.overall_score)} px-4 pb-16 pt-10 sm:px-6`}>
        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Site info */}
          <div className="mb-8 text-center">
            <p className="mb-1 text-sm font-medium uppercase tracking-widest text-white/50">
              Website Report
            </p>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{hostname}</h1>
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-indigo-300 hover:text-indigo-100 hover:underline"
            >
              {row.url}
            </a>
            <p className="mt-2 text-xs text-white/40">
              Analyzed on {analyzedDate} &middot; {row.duration_ms}ms
            </p>
          </div>

          {/* Score + grade */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <ScoreGauge score={row.overall_score} color={color} size={200} />
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <GradePill letter={letter} color={color} />
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-white/60">Overall Grade</p>
                <p className="mt-1 text-white/80">
                  <span className="font-semibold" style={{ color }}>
                    {totalPassed} checks passed
                  </span>
                  {totalIssues > 0 && (
                    <span className="text-white/50">
                      {' '}
                      &middot; {totalIssues} issue{totalIssues !== 1 ? 's' : ''} to fix
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body content (raised card over hero) ── */}
      <div className="relative mx-auto -mt-6 max-w-5xl px-4 pb-16 sm:px-6">
        {/* ── What's working well ── */}
        {allPassedChecks.length > 0 && (
          <section className="mb-8 rounded-2xl border border-green-100 bg-white p-6 shadow-lg dark:border-green-900/30 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                What&rsquo;s working well
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allPassedChecks.slice(0, 12).map((check, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/10"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {check.label}
                    </p>
                    <p className="text-xs text-gray-400">{check.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Category breakdown ── */}
        {row.categories && row.categories.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Category Breakdown
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Click any card to see the full breakdown of passed and failed checks.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {row.categories.map((cat) => (
                <CategoryCard key={cat.name} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* ── Issues to fix ── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Issues to Fix</h2>
            {totalIssues > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {totalIssues}
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Click any issue to see why it matters and how to fix it.
          </p>
          <IssueList issues={row.issues ?? []} />
        </section>

        {/* ── Share ── */}
        <section className="mb-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-900/30 dark:bg-gray-800">
          <div className="mb-1 flex items-center gap-2">
            <span>🔗</span>
            <h2 className="font-bold text-gray-900 dark:text-white">Share this report</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Copy the link below to share these results with your team or clients.
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`https://sitegrader.app/report/${id}`}
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </section>

        {/* ── Analyze another URL ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-bold text-gray-900 dark:text-white">Analyze another URL</h2>
          <UrlInput size="small" />
        </section>
      </div>
    </div>
  )
}
