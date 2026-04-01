/** Severity of a single issue found during analysis */
export type IssueSeverity = 'critical' | 'warning' | 'info'

/** A single issue found during analysis */
export interface Issue {
  /** Machine-readable check ID, e.g. "seo-missing-title" */
  id: string
  /** Human-readable title */
  title: string
  /** Human-readable description with fix suggestion */
  description: string
  severity: IssueSeverity
  /** Which category this issue belongs to */
  category: CategoryName
}

/** The five scoring categories */
export type CategoryName = 'seo' | 'performance' | 'security' | 'accessibility' | 'mobile'

/** Result of a single category scorer */
export interface CategoryScore {
  name: CategoryName
  /** Display label, e.g. "SEO" */
  label: string
  /** Score 0-100 */
  score: number
  /** Max possible weight for overall calculation */
  maxWeight: number
  /** Issues found in this category */
  issues: Issue[]
  /** Number of checks that passed */
  passed: number
  /** Total number of checks run */
  total: number
}

/** Letter grade derived from overall score */
export type LetterGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'

/** Full analysis report */
export interface Report {
  /** Unique short ID for shareable URL */
  id: string
  /** The URL that was analyzed */
  url: string
  /** Overall score 0-100 */
  overallScore: number
  /** Letter grade */
  grade: LetterGrade
  /** Color hex for the grade */
  gradeColor: string
  /** Per-category scores */
  categories: CategoryScore[]
  /** All issues sorted by severity */
  issues: Issue[]
  /** ISO timestamp of analysis */
  analyzedAt: string
  /** Time taken to analyze in ms */
  durationMs: number
}

/** Structured data extracted from HTML by the parser */
export interface ParsedPage {
  /** Full HTML string */
  html: string
  /** URL that was fetched */
  url: string
  /** HTTP response headers */
  headers: Record<string, string>
  /** HTTP status code */
  statusCode: number
  /** <title> tag content */
  title: string | null
  /** <meta name="description"> content */
  metaDescription: string | null
  /** All <meta> tags as key-value pairs */
  metaTags: Record<string, string>
  /** Open Graph tags */
  ogTags: Record<string, string>
  /** Twitter Card tags */
  twitterTags: Record<string, string>
  /** Heading elements in order */
  headings: { level: number; text: string }[]
  /** All images with src and alt */
  images: { src: string; alt: string | null; hasSrcset: boolean }[]
  /** All links with href and text */
  links: { href: string; text: string; isExternal: boolean }[]
  /** <html lang="..."> value */
  htmlLang: string | null
  /** Whether viewport meta tag exists */
  hasViewport: boolean
  /** Viewport content attribute */
  viewportContent: string | null
  /** <link rel="canonical"> href */
  canonicalUrl: string | null
  /** Total byte size of HTML response */
  htmlSize: number
  /** Semantic elements found */
  semanticElements: string[]
  /** All <form> elements and whether their inputs have labels */
  forms: { inputCount: number; labeledInputCount: number }[]
}
