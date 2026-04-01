# SiteGrader MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free website grading tool — user enters a URL, gets a visual score report across 5 categories (SEO, Performance, Security, Accessibility, Mobile) with a shareable link.

**Architecture:** Next.js 15 App Router with TypeScript. Server-side API route fetches target URL HTML + headers, runs 5 scoring modules, stores results in Supabase, returns a report ID. Results page renders animated score gauges and issue lists. Deployed on Vercel.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL), Vitest, Vercel

---

## File Structure

```
sitegrader/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout: fonts, metadata, GA4 script, header/footer
│   │   ├── page.tsx                    # Landing page: hero + URL input + marketing sections
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Results page: scores, issues, share button, re-scan input
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts            # POST handler: validate URL, run analysis, store, return ID
│   ├── lib/
│   │   ├── analyzer/
│   │   │   ├── types.ts                # All shared types (scores, issues, report, check results)
│   │   │   ├── fetcher.ts              # Fetch URL HTML + response headers
│   │   │   ├── parser.ts               # Parse HTML string into structured data (meta, headings, links, images)
│   │   │   ├── scorers/
│   │   │   │   ├── seo.ts              # SEO scoring: meta tags, headings, alt text, OG, sitemap, robots
│   │   │   │   ├── performance.ts      # Performance scoring: page size, images, compression, caching
│   │   │   │   ├── security.ts         # Security scoring: HTTPS, headers (HSTS, CSP, X-Frame, etc.)
│   │   │   │   ├── accessibility.ts    # Accessibility scoring: alt text, labels, lang, semantic HTML
│   │   │   │   ├── mobile.ts           # Mobile scoring: viewport, font size, tap targets, srcset
│   │   │   │   └── index.ts            # runAllScorers(): runs all 5, computes overall grade
│   │   │   └── grade.ts                # computeGrade(): 0-100 score → letter grade + color
│   │   ├── supabase.ts                 # Supabase client singleton
│   │   └── utils.ts                    # URL validation, ID generation, formatting helpers
│   └── components/
│       ├── url-input.tsx               # URL input form with validation + loading state
│       ├── score-gauge.tsx             # Animated circular score gauge (SVG)
│       ├── category-card.tsx           # Category score card with mini gauge + issue count
│       ├── issue-list.tsx              # Expandable issue list with severity icons
│       ├── header.tsx                  # Site header with logo + nav
│       └── footer.tsx                  # Site footer with links
├── tests/
│   ├── lib/
│   │   ├── analyzer/
│   │   │   ├── fetcher.test.ts
│   │   │   ├── parser.test.ts
│   │   │   ├── scorers/
│   │   │   │   ├── seo.test.ts
│   │   │   │   ├── performance.test.ts
│   │   │   │   ├── security.test.ts
│   │   │   │   ├── accessibility.test.ts
│   │   │   │   ├── mobile.test.ts
│   │   │   │   └── index.test.ts
│   │   │   └── grade.test.ts
│   │   └── utils.test.ts
│   └── setup.ts                        # Vitest setup (DOM mocks if needed)
├── supabase/
│   └── migrations/
│       └── 001_create_reports.sql      # Reports table schema
├── .env.local.example                  # Template for env vars
├── vitest.config.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `sitegrader/` (entire project skeleton)
- Create: `sitegrader/package.json`
- Create: `sitegrader/vitest.config.ts`
- Create: `sitegrader/next.config.ts`
- Create: `sitegrader/.env.local.example`
- Create: `sitegrader/tests/setup.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc"
npx create-next-app@latest sitegrader --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project created at `sitegrader/` with Next.js 15, TypeScript, Tailwind CSS.

- [ ] **Step 2: Install dev dependencies**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Install runtime dependencies**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npm install @supabase/supabase-js cheerio nanoid
```

- `cheerio`: HTML parsing (lightweight, no browser needed)
- `nanoid`: Short unique IDs for report URLs

- [ ] **Step 4: Create vitest.config.ts**

```typescript
// sitegrader/vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 5: Create test setup file**

```typescript
// sitegrader/tests/setup.ts
// Vitest setup — extend as needed
import { expect } from 'vitest'
```

- [ ] **Step 6: Create .env.local.example**

```bash
# sitegrader/.env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 7: Add test script to package.json**

In `sitegrader/package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 8: Verify setup**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc"
git add sitegrader/
git commit -m "feat: scaffold Next.js 15 project with Tailwind, Vitest, Supabase, Cheerio"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/lib/analyzer/types.ts`

- [ ] **Step 1: Write type definitions**

```typescript
// src/lib/analyzer/types.ts

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
```

- [ ] **Step 2: Verify types compile**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npx tsc --noEmit src/lib/analyzer/types.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/analyzer/types.ts
git commit -m "feat: add core type definitions for analyzer"
```

---

## Task 3: Utility Functions + Grade Calculator

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/analyzer/grade.ts`
- Create: `tests/lib/utils.test.ts`
- Create: `tests/lib/analyzer/grade.test.ts`

- [ ] **Step 1: Write failing tests for utils**

```typescript
// tests/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { isValidUrl, normalizeUrl } from '@/lib/utils'

describe('isValidUrl', () => {
  it('accepts valid HTTP URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://sub.example.com/path?q=1')).toBe(true)
  })

  it('rejects invalid URLs', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('normalizeUrl', () => {
  it('adds https:// if no protocol', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })

  it('preserves existing protocol', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com')
  })

  it('removes trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npx vitest run tests/lib/utils.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement utils**

```typescript
// src/lib/utils.ts

/** Check if a string is a valid HTTP(S) URL */
export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Normalize user input into a proper URL */
export function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  // Remove trailing slash
  url = url.replace(/\/+$/, '')
  return url
}
```

- [ ] **Step 4: Run utils tests**

```bash
npx vitest run tests/lib/utils.test.ts
```

Expected: All pass.

- [ ] **Step 5: Write failing tests for grade calculator**

```typescript
// tests/lib/analyzer/grade.test.ts
import { describe, it, expect } from 'vitest'
import { computeGrade } from '@/lib/analyzer/grade'

describe('computeGrade', () => {
  it('returns A+ for 95-100', () => {
    expect(computeGrade(100)).toEqual({ letter: 'A+', color: '#22c55e' })
    expect(computeGrade(95)).toEqual({ letter: 'A+', color: '#22c55e' })
  })

  it('returns A for 85-94', () => {
    expect(computeGrade(90)).toEqual({ letter: 'A', color: '#4ade80' })
    expect(computeGrade(85)).toEqual({ letter: 'A', color: '#4ade80' })
  })

  it('returns B for 70-84', () => {
    expect(computeGrade(75)).toEqual({ letter: 'B', color: '#facc15' })
  })

  it('returns C for 55-69', () => {
    expect(computeGrade(60)).toEqual({ letter: 'C', color: '#fb923c' })
  })

  it('returns D for 40-54', () => {
    expect(computeGrade(45)).toEqual({ letter: 'D', color: '#f87171' })
  })

  it('returns F for 0-39', () => {
    expect(computeGrade(20)).toEqual({ letter: 'F', color: '#ef4444' })
    expect(computeGrade(0)).toEqual({ letter: 'F', color: '#ef4444' })
  })
})
```

- [ ] **Step 6: Run grade tests to verify they fail**

```bash
npx vitest run tests/lib/analyzer/grade.test.ts
```

Expected: FAIL.

- [ ] **Step 7: Implement grade calculator**

```typescript
// src/lib/analyzer/grade.ts
import type { LetterGrade } from './types'

interface GradeResult {
  letter: LetterGrade
  color: string
}

const GRADE_THRESHOLDS: { min: number; letter: LetterGrade; color: string }[] = [
  { min: 95, letter: 'A+', color: '#22c55e' },
  { min: 85, letter: 'A', color: '#4ade80' },
  { min: 70, letter: 'B', color: '#facc15' },
  { min: 55, letter: 'C', color: '#fb923c' },
  { min: 40, letter: 'D', color: '#f87171' },
  { min: 0, letter: 'F', color: '#ef4444' },
]

export function computeGrade(score: number): GradeResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  for (const threshold of GRADE_THRESHOLDS) {
    if (clamped >= threshold.min) {
      return { letter: threshold.letter, color: threshold.color }
    }
  }
  return { letter: 'F', color: '#ef4444' }
}
```

- [ ] **Step 8: Run all tests**

```bash
npx vitest run
```

Expected: All pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/utils.ts src/lib/analyzer/grade.ts tests/
git commit -m "feat: add URL utils and grade calculator with tests"
```

---

## Task 4: HTML Fetcher

**Files:**
- Create: `src/lib/analyzer/fetcher.ts`
- Create: `tests/lib/analyzer/fetcher.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/analyzer/fetcher.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchPage, FetchError } from '@/lib/analyzer/fetcher'

describe('fetchPage', () => {
  it('returns html and headers for a valid URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html><head><title>Test</title></head><body></body></html>',
      headers: new Headers({
        'content-type': 'text/html',
        'x-frame-options': 'DENY',
      }),
    })

    const result = await fetchPage('https://example.com')

    expect(result.html).toContain('<title>Test</title>')
    expect(result.statusCode).toBe(200)
    expect(result.headers['content-type']).toBe('text/html')
    expect(result.url).toBe('https://example.com')
  })

  it('throws FetchError on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(fetchPage('https://example.com/404')).rejects.toThrow(FetchError)
  })

  it('throws FetchError on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(fetchPage('https://down.example.com')).rejects.toThrow(FetchError)
  })

  it('times out after 10 seconds', async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 15000))
    )

    await expect(fetchPage('https://slow.example.com')).rejects.toThrow(FetchError)
  }, 15000)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/analyzer/fetcher.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement fetcher**

```typescript
// src/lib/analyzer/fetcher.ts

export class FetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

interface FetchResult {
  html: string
  headers: Record<string, string>
  statusCode: number
  url: string
}

const TIMEOUT_MS = 10_000
const USER_AGENT = 'SiteGrader/1.0 (https://sitegrader.app)'

export async function fetchPage(url: string): Promise<FetchResult> {
  let response: Response

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new FetchError(`Timed out after ${TIMEOUT_MS}ms fetching ${url}`)
    }
    throw new FetchError(
      `Failed to fetch ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`,
    )
  }

  if (!response.ok) {
    throw new FetchError(
      `HTTP ${response.status} ${response.statusText} for ${url}`,
      response.status,
    )
  }

  const html = await response.text()
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  return { html, headers, statusCode: response.status, url }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/lib/analyzer/fetcher.test.ts
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analyzer/fetcher.ts tests/lib/analyzer/fetcher.test.ts
git commit -m "feat: add HTML fetcher with timeout and error handling"
```

---

## Task 5: HTML Parser

**Files:**
- Create: `src/lib/analyzer/parser.ts`
- Create: `tests/lib/analyzer/parser.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/analyzer/parser.test.ts
import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A test page for the parser">
  <meta property="og:title" content="OG Title">
  <meta name="twitter:card" content="summary">
  <title>Test Page Title</title>
  <link rel="canonical" href="https://example.com/test">
</head>
<body>
  <nav>Navigation</nav>
  <main>
    <h1>Main Heading</h1>
    <p>Some content with a <a href="/about">local link</a> and <a href="https://other.com">external link</a>.</p>
    <h2>Subheading</h2>
    <img src="/img/photo.jpg" alt="A photo">
    <img src="/img/icon.png">
    <img src="/img/hero.webp" alt="Hero" srcset="/img/hero-2x.webp 2x">
    <form>
      <label for="name">Name</label>
      <input id="name" type="text">
      <input type="email">
    </form>
  </main>
</body>
</html>`

describe('parsePage', () => {
  const result = parsePage(SAMPLE_HTML, 'https://example.com/test', {
    'content-type': 'text/html',
    'x-frame-options': 'DENY',
  }, 200)

  it('extracts title', () => {
    expect(result.title).toBe('Test Page Title')
  })

  it('extracts meta description', () => {
    expect(result.metaDescription).toBe('A test page for the parser')
  })

  it('extracts OG tags', () => {
    expect(result.ogTags['og:title']).toBe('OG Title')
  })

  it('extracts Twitter tags', () => {
    expect(result.twitterTags['twitter:card']).toBe('summary')
  })

  it('extracts headings in order', () => {
    expect(result.headings).toEqual([
      { level: 1, text: 'Main Heading' },
      { level: 2, text: 'Subheading' },
    ])
  })

  it('extracts images with alt and srcset', () => {
    expect(result.images).toHaveLength(3)
    expect(result.images[0]).toEqual({ src: '/img/photo.jpg', alt: 'A photo', hasSrcset: false })
    expect(result.images[1]).toEqual({ src: '/img/icon.png', alt: null, hasSrcset: false })
    expect(result.images[2]).toEqual({ src: '/img/hero.webp', alt: 'Hero', hasSrcset: true })
  })

  it('extracts links and marks external ones', () => {
    expect(result.links).toHaveLength(2)
    expect(result.links[0].isExternal).toBe(false)
    expect(result.links[1].isExternal).toBe(true)
  })

  it('extracts html lang', () => {
    expect(result.htmlLang).toBe('en')
  })

  it('detects viewport meta', () => {
    expect(result.hasViewport).toBe(true)
    expect(result.viewportContent).toBe('width=device-width, initial-scale=1')
  })

  it('extracts canonical URL', () => {
    expect(result.canonicalUrl).toBe('https://example.com/test')
  })

  it('extracts semantic elements', () => {
    expect(result.semanticElements).toContain('nav')
    expect(result.semanticElements).toContain('main')
  })

  it('extracts form label coverage', () => {
    expect(result.forms).toEqual([{ inputCount: 2, labeledInputCount: 1 }])
  })

  it('computes html size', () => {
    expect(result.htmlSize).toBe(Buffer.byteLength(SAMPLE_HTML, 'utf-8'))
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run tests/lib/analyzer/parser.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement parser**

```typescript
// src/lib/analyzer/parser.ts
import * as cheerio from 'cheerio'
import type { ParsedPage } from './types'

export function parsePage(
  html: string,
  url: string,
  headers: Record<string, string>,
  statusCode: number,
): ParsedPage {
  const $ = cheerio.load(html)
  const baseUrl = new URL(url)

  // Title
  const title = $('title').first().text().trim() || null

  // Meta description
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null

  // All meta tags
  const metaTags: Record<string, string> = {}
  $('meta[name]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content) metaTags[name] = content
  })

  // OG tags
  const ogTags: Record<string, string> = {}
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property')
    const content = $(el).attr('content')
    if (prop && content) ogTags[prop] = content
  })

  // Twitter tags
  const twitterTags: Record<string, string> = {}
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content) twitterTags[name] = content
  })

  // Headings
  const headings: { level: number; text: string }[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = (el as cheerio.TagElement).tagName
    headings.push({
      level: parseInt(tag.charAt(1), 10),
      text: $(el).text().trim(),
    })
  })

  // Images
  const images: { src: string; alt: string | null; hasSrcset: boolean }[] = []
  $('img').each((_, el) => {
    images.push({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') ?? null,
      hasSrcset: !!$(el).attr('srcset'),
    })
  })

  // Links
  const links: { href: string; text: string; isExternal: boolean }[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    let isExternal = false
    try {
      const linkUrl = new URL(href, url)
      isExternal = linkUrl.hostname !== baseUrl.hostname
    } catch {
      isExternal = false
    }
    links.push({ href, text: $(el).text().trim(), isExternal })
  })

  // HTML lang
  const htmlLang = $('html').attr('lang')?.trim() || null

  // Viewport
  const viewportEl = $('meta[name="viewport"]')
  const hasViewport = viewportEl.length > 0
  const viewportContent = viewportEl.attr('content')?.trim() || null

  // Canonical
  const canonicalUrl =
    $('link[rel="canonical"]').attr('href')?.trim() || null

  // Semantic elements
  const semanticTags = ['nav', 'main', 'article', 'section', 'aside', 'header', 'footer']
  const semanticElements = semanticTags.filter((tag) => $(tag).length > 0)

  // Forms
  const forms: { inputCount: number; labeledInputCount: number }[] = []
  $('form').each((_, formEl) => {
    const inputs = $(formEl).find('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')
    let labeledCount = 0
    inputs.each((_, inputEl) => {
      const id = $(inputEl).attr('id')
      if (id && $(formEl).find(`label[for="${id}"]`).length > 0) {
        labeledCount++
      }
    })
    forms.push({ inputCount: inputs.length, labeledInputCount: labeledCount })
  })

  return {
    html,
    url,
    headers,
    statusCode,
    title,
    metaDescription,
    metaTags,
    ogTags,
    twitterTags,
    headings,
    images,
    links,
    htmlLang,
    hasViewport,
    viewportContent,
    canonicalUrl,
    htmlSize: Buffer.byteLength(html, 'utf-8'),
    semanticElements,
    forms,
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/lib/analyzer/parser.test.ts
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analyzer/parser.ts tests/lib/analyzer/parser.test.ts
git commit -m "feat: add HTML parser using Cheerio"
```

---

## Task 6: SEO Scorer

**Files:**
- Create: `src/lib/analyzer/scorers/seo.ts`
- Create: `tests/lib/analyzer/scorers/seo.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/analyzer/scorers/seo.test.ts
import { describe, it, expect } from 'vitest'
import { scoreSeo } from '@/lib/analyzer/scorers/seo'
import { parsePage } from '@/lib/analyzer/parser'

function makePage(html: string) {
  return parsePage(html, 'https://example.com', { 'content-type': 'text/html' }, 200)
}

describe('scoreSeo', () => {
  it('gives high score for well-optimized page', () => {
    const page = makePage(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Great Page Title Here</title>
  <meta name="description" content="This is a well-crafted meta description that is between 150 and 160 characters long to be optimal for search engines and provide a good preview.">
  <meta property="og:title" content="Great Page">
  <meta name="twitter:card" content="summary">
  <link rel="canonical" href="https://example.com">
</head>
<body>
  <h1>Main Heading</h1>
  <h2>Sub Heading</h2>
  <img src="/photo.jpg" alt="Photo description">
  <a href="/about">About us</a>
  <a href="https://other.com">Partner</a>
</body>
</html>`)
    const result = scoreSeo(page)
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.name).toBe('seo')
    expect(result.issues.every((i) => i.category === 'seo')).toBe(true)
  })

  it('gives low score for empty page', () => {
    const page = makePage('<html><body></body></html>')
    const result = scoreSeo(page)
    expect(result.score).toBeLessThan(30)
    expect(result.issues.length).toBeGreaterThan(3)
  })

  it('flags missing title', () => {
    const page = makePage('<html><head></head><body><h1>Hi</h1></body></html>')
    const result = scoreSeo(page)
    expect(result.issues.some((i) => i.id === 'seo-missing-title')).toBe(true)
  })

  it('flags title too long', () => {
    const longTitle = 'A'.repeat(70)
    const page = makePage(`<html><head><title>${longTitle}</title></head><body><h1>Hi</h1></body></html>`)
    const result = scoreSeo(page)
    expect(result.issues.some((i) => i.id === 'seo-title-too-long')).toBe(true)
  })

  it('flags missing meta description', () => {
    const page = makePage('<html><head><title>Title</title></head><body><h1>Hi</h1></body></html>')
    const result = scoreSeo(page)
    expect(result.issues.some((i) => i.id === 'seo-missing-meta-description')).toBe(true)
  })

  it('flags missing h1', () => {
    const page = makePage('<html><head><title>Title</title></head><body><h2>Sub</h2></body></html>')
    const result = scoreSeo(page)
    expect(result.issues.some((i) => i.id === 'seo-missing-h1')).toBe(true)
  })

  it('flags images without alt text', () => {
    const page = makePage('<html><head><title>T</title></head><body><h1>H</h1><img src="/x.jpg"></body></html>')
    const result = scoreSeo(page)
    expect(result.issues.some((i) => i.id === 'seo-images-missing-alt')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run tests/lib/analyzer/scorers/seo.test.ts
```

- [ ] **Step 3: Implement SEO scorer**

```typescript
// src/lib/analyzer/scorers/seo.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreSeo(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  const checks: { run: () => boolean }[] = []

  function check(id: string, title: string, description: string, severity: Issue['severity'], test: () => boolean) {
    checks.push({
      run: () => {
        if (test()) {
          passed++
          return true
        }
        issues.push({ id, title, description, severity, category: 'seo' })
        return false
      },
    })
  }

  // 1. Title tag
  check('seo-missing-title', 'Missing title tag', 'Add a <title> tag to your page. It is the most important on-page SEO element.', 'critical',
    () => !!page.title && page.title.length > 0)

  // 2. Title length
  check('seo-title-too-long', 'Title tag too long', 'Keep your title under 60 characters so it displays fully in search results.', 'warning',
    () => !page.title || page.title.length <= 60)

  check('seo-title-too-short', 'Title tag too short', 'Your title should be at least 20 characters to be descriptive.', 'warning',
    () => !page.title || page.title.length === 0 || page.title.length >= 20)

  // 3. Meta description
  check('seo-missing-meta-description', 'Missing meta description', 'Add a <meta name="description"> tag. This shows as the snippet in search results.', 'critical',
    () => !!page.metaDescription && page.metaDescription.length > 0)

  check('seo-meta-description-length', 'Meta description length not optimal', 'Keep your meta description between 120-160 characters for best results.', 'warning',
    () => !page.metaDescription || page.metaDescription.length === 0 || (page.metaDescription.length >= 120 && page.metaDescription.length <= 160))

  // 4. H1 tag
  check('seo-missing-h1', 'Missing H1 tag', 'Add exactly one <h1> tag to your page as the main heading.', 'critical',
    () => page.headings.some((h) => h.level === 1))

  check('seo-multiple-h1', 'Multiple H1 tags', 'Use only one <h1> tag per page. Use <h2>-<h6> for subheadings.', 'warning',
    () => page.headings.filter((h) => h.level === 1).length <= 1)

  // 5. Heading hierarchy
  check('seo-heading-hierarchy', 'Broken heading hierarchy', 'Headings should follow a logical order (H1 → H2 → H3). Don\'t skip levels.', 'warning',
    () => {
      for (let i = 1; i < page.headings.length; i++) {
        if (page.headings[i].level > page.headings[i - 1].level + 1) return false
      }
      return true
    })

  // 6. Image alt text
  check('seo-images-missing-alt', 'Images missing alt text', 'Add descriptive alt text to all images for better SEO and accessibility.', 'warning',
    () => {
      if (page.images.length === 0) return true
      const withAlt = page.images.filter((img) => img.alt !== null && img.alt.length > 0)
      return withAlt.length / page.images.length >= 0.9
    })

  // 7. Canonical URL
  check('seo-missing-canonical', 'Missing canonical URL', 'Add <link rel="canonical"> to prevent duplicate content issues.', 'info',
    () => !!page.canonicalUrl)

  // 8. Open Graph tags
  check('seo-missing-og', 'Missing Open Graph tags', 'Add og:title, og:description, and og:image meta tags for better social sharing.', 'info',
    () => Object.keys(page.ogTags).length >= 1)

  // 9. Twitter Card tags
  check('seo-missing-twitter', 'Missing Twitter Card tags', 'Add twitter:card meta tag for better Twitter/X sharing previews.', 'info',
    () => Object.keys(page.twitterTags).length >= 1)

  // 10. Internal links
  check('seo-no-internal-links', 'No internal links found', 'Add internal links to help search engines discover your other pages.', 'warning',
    () => page.links.some((l) => !l.isExternal))

  // Run all checks
  checks.forEach((c) => c.run())

  const total = checks.length
  const score = Math.round((passed / total) * 100)

  return {
    name: 'seo',
    label: 'SEO',
    score,
    maxWeight: 25,
    issues,
    passed,
    total,
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/lib/analyzer/scorers/seo.test.ts
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analyzer/scorers/seo.ts tests/lib/analyzer/scorers/seo.test.ts
git commit -m "feat: add SEO scoring module with 10 checks"
```

---

## Task 7: Performance, Security, Accessibility, Mobile Scorers

**Files:**
- Create: `src/lib/analyzer/scorers/performance.ts`
- Create: `src/lib/analyzer/scorers/security.ts`
- Create: `src/lib/analyzer/scorers/accessibility.ts`
- Create: `src/lib/analyzer/scorers/mobile.ts`
- Create: `tests/lib/analyzer/scorers/performance.test.ts`
- Create: `tests/lib/analyzer/scorers/security.test.ts`
- Create: `tests/lib/analyzer/scorers/accessibility.test.ts`
- Create: `tests/lib/analyzer/scorers/mobile.test.ts`

> These four scorers follow the same pattern as the SEO scorer. Each gets a failing test, implementation, then passing test. The steps below batch them for efficiency since the pattern is established.

- [ ] **Step 1: Write all four test files**

```typescript
// tests/lib/analyzer/scorers/performance.test.ts
import { describe, it, expect } from 'vitest'
import { scorePerformance } from '@/lib/analyzer/scorers/performance'
import { parsePage } from '@/lib/analyzer/parser'

function makePage(html: string, headers: Record<string, string> = {}) {
  return parsePage(html, 'https://example.com', { 'content-type': 'text/html', ...headers }, 200)
}

describe('scorePerformance', () => {
  it('gives high score for small page with compression', () => {
    const html = '<html><head><title>T</title></head><body><h1>Small</h1></body></html>'
    const result = scorePerformance(makePage(html, {
      'content-encoding': 'gzip',
      'cache-control': 'max-age=3600',
    }))
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.name).toBe('performance')
  })

  it('flags large page size', () => {
    const bigHtml = '<html><body>' + 'x'.repeat(4_000_000) + '</body></html>'
    const result = scorePerformance(makePage(bigHtml))
    expect(result.issues.some((i) => i.id === 'perf-page-too-large')).toBe(true)
  })

  it('flags missing compression', () => {
    const result = scorePerformance(makePage('<html><body>Hello</body></html>'))
    expect(result.issues.some((i) => i.id === 'perf-no-compression')).toBe(true)
  })
})
```

```typescript
// tests/lib/analyzer/scorers/security.test.ts
import { describe, it, expect } from 'vitest'
import { scoreSecurity } from '@/lib/analyzer/scorers/security'
import { parsePage } from '@/lib/analyzer/parser'

function makePage(url: string, headers: Record<string, string> = {}) {
  return parsePage('<html><body></body></html>', url, headers, 200)
}

describe('scoreSecurity', () => {
  it('gives high score for HTTPS with all security headers', () => {
    const result = scoreSecurity(makePage('https://example.com', {
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
    }))
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('flags HTTP site', () => {
    const result = scoreSecurity(makePage('http://example.com'))
    expect(result.issues.some((i) => i.id === 'sec-no-https')).toBe(true)
    expect(result.issues.find((i) => i.id === 'sec-no-https')?.severity).toBe('critical')
  })

  it('flags missing HSTS', () => {
    const result = scoreSecurity(makePage('https://example.com'))
    expect(result.issues.some((i) => i.id === 'sec-no-hsts')).toBe(true)
  })
})
```

```typescript
// tests/lib/analyzer/scorers/accessibility.test.ts
import { describe, it, expect } from 'vitest'
import { scoreAccessibility } from '@/lib/analyzer/scorers/accessibility'
import { parsePage } from '@/lib/analyzer/parser'

function makePage(html: string) {
  return parsePage(html, 'https://example.com', {}, 200)
}

describe('scoreAccessibility', () => {
  it('gives high score for accessible page', () => {
    const result = scoreAccessibility(makePage(`
<html lang="en"><body>
  <nav><a href="/">Home</a></nav>
  <main>
    <h1>Page</h1>
    <img src="/x.jpg" alt="Description">
    <form><label for="e">Email</label><input id="e" type="email"></form>
  </main>
</body></html>`))
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('flags missing lang attribute', () => {
    const result = scoreAccessibility(makePage('<html><body>Hi</body></html>'))
    expect(result.issues.some((i) => i.id === 'a11y-missing-lang')).toBe(true)
  })

  it('flags images without alt', () => {
    const result = scoreAccessibility(makePage('<html lang="en"><body><img src="/x.jpg"></body></html>'))
    expect(result.issues.some((i) => i.id === 'a11y-images-missing-alt')).toBe(true)
  })
})
```

```typescript
// tests/lib/analyzer/scorers/mobile.test.ts
import { describe, it, expect } from 'vitest'
import { scoreMobile } from '@/lib/analyzer/scorers/mobile'
import { parsePage } from '@/lib/analyzer/parser'

function makePage(html: string) {
  return parsePage(html, 'https://example.com', {}, 200)
}

describe('scoreMobile', () => {
  it('gives high score for mobile-friendly page', () => {
    const result = scoreMobile(makePage(`
<html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head><body>
  <img src="/x.jpg" alt="X" srcset="/x-2x.jpg 2x">
</body></html>`))
    expect(result.score).toBeGreaterThanOrEqual(60)
  })

  it('flags missing viewport', () => {
    const result = scoreMobile(makePage('<html><body>Hi</body></html>'))
    expect(result.issues.some((i) => i.id === 'mobile-no-viewport')).toBe(true)
  })
})
```

- [ ] **Step 2: Run all four to verify failure**

```bash
npx vitest run tests/lib/analyzer/scorers/
```

Expected: All fail.

- [ ] **Step 3: Implement performance scorer**

```typescript
// src/lib/analyzer/scorers/performance.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scorePerformance(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  let total = 0

  function check(id: string, title: string, desc: string, severity: Issue['severity'], test: boolean) {
    total++
    if (test) { passed++ } else { issues.push({ id, title, description: desc, severity, category: 'performance' }) }
  }

  // 1. Page size
  const sizeMB = page.htmlSize / (1024 * 1024)
  check('perf-page-too-large', 'Page is too large', `Your HTML is ${sizeMB.toFixed(1)}MB. Keep it under 3MB for fast loading, under 1MB is ideal.`, 'warning', sizeMB < 3)

  check('perf-page-size-ideal', 'HTML could be smaller', `Your HTML is ${Math.round(page.htmlSize / 1024)}KB. Under 500KB loads faster on mobile.`, 'info', sizeMB < 0.5)

  // 2. Image count
  const imgCount = page.images.length
  check('perf-too-many-images', 'Many images on page', `Found ${imgCount} images. Consider lazy loading or reducing image count.`, 'info', imgCount <= 20)

  // 3. Modern image formats
  const nonModernImages = page.images.filter((img) => {
    const src = img.src.toLowerCase()
    return src.endsWith('.bmp') || src.endsWith('.tiff')
  })
  check('perf-legacy-image-formats', 'Using legacy image formats', 'Use modern formats like WebP or AVIF instead of BMP/TIFF for better compression.', 'warning', nonModernImages.length === 0)

  // 4. Compression
  const encoding = page.headers['content-encoding'] || ''
  check('perf-no-compression', 'No HTTP compression', 'Enable Gzip or Brotli compression on your server to reduce transfer size by 60-80%.', 'warning', encoding.includes('gzip') || encoding.includes('br'))

  // 5. Cache headers
  const cacheControl = page.headers['cache-control'] || ''
  check('perf-no-cache', 'No cache headers', 'Set Cache-Control headers to allow browsers to cache your page and reduce load times on repeat visits.', 'info', cacheControl.length > 0)

  // 6. Inline scripts/styles heuristic (count <script> and <style> tags in HTML)
  const inlineScripts = (page.html.match(/<script[\s>]/gi) || []).length
  check('perf-many-scripts', 'Many script tags found', `Found ${inlineScripts} script tags. Consolidate and defer scripts to speed up rendering.`, 'info', inlineScripts <= 10)

  const score = Math.round((passed / total) * 100)
  return { name: 'performance', label: 'Performance', score, maxWeight: 25, issues, passed, total }
}
```

- [ ] **Step 4: Implement security scorer**

```typescript
// src/lib/analyzer/scorers/security.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreSecurity(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  let total = 0

  function check(id: string, title: string, desc: string, severity: Issue['severity'], test: boolean) {
    total++
    if (test) { passed++ } else { issues.push({ id, title, description: desc, severity, category: 'security' }) }
  }

  const isHttps = page.url.startsWith('https://')

  // 1. HTTPS
  check('sec-no-https', 'Not using HTTPS', 'Your site is served over HTTP. Switch to HTTPS to encrypt data and improve SEO rankings.', 'critical', isHttps)

  // 2. HSTS
  check('sec-no-hsts', 'Missing HSTS header', 'Add Strict-Transport-Security header to prevent protocol downgrade attacks.', 'warning', !!page.headers['strict-transport-security'])

  // 3. CSP
  check('sec-no-csp', 'Missing Content-Security-Policy', 'Add a CSP header to prevent cross-site scripting (XSS) attacks.', 'warning', !!page.headers['content-security-policy'])

  // 4. X-Frame-Options
  check('sec-no-x-frame', 'Missing X-Frame-Options', 'Add X-Frame-Options header to prevent clickjacking attacks.', 'warning', !!page.headers['x-frame-options'])

  // 5. X-Content-Type-Options
  check('sec-no-content-type-options', 'Missing X-Content-Type-Options', 'Add X-Content-Type-Options: nosniff to prevent MIME type sniffing.', 'info', !!page.headers['x-content-type-options'])

  // 6. Server exposure
  const server = page.headers['server'] || ''
  const exposesVersion = /\d+\.\d+/.test(server)
  check('sec-server-version-exposed', 'Server version exposed', `Your server header exposes "${server}". Remove version numbers to reduce attack surface.`, 'info', !exposesVersion)

  // 7. Mixed content (basic check — look for http:// in src/href)
  const hasMixedContent = isHttps && /(?:src|href)=["']http:\/\//i.test(page.html)
  check('sec-mixed-content', 'Mixed content detected', 'Your HTTPS page loads resources over HTTP. Update all resource URLs to HTTPS.', 'critical', !hasMixedContent)

  const score = Math.round((passed / total) * 100)
  return { name: 'security', label: 'Security', score, maxWeight: 20, issues, passed, total }
}
```

- [ ] **Step 5: Implement accessibility scorer**

```typescript
// src/lib/analyzer/scorers/accessibility.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreAccessibility(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  let total = 0

  function check(id: string, title: string, desc: string, severity: Issue['severity'], test: boolean) {
    total++
    if (test) { passed++ } else { issues.push({ id, title, description: desc, severity, category: 'accessibility' }) }
  }

  // 1. HTML lang attribute
  check('a11y-missing-lang', 'Missing lang attribute', 'Add a lang attribute to your <html> tag (e.g., lang="en") so screen readers know which language to use.', 'critical', !!page.htmlLang)

  // 2. Image alt text
  const imagesWithoutAlt = page.images.filter((img) => img.alt === null || img.alt.length === 0)
  check('a11y-images-missing-alt', `${imagesWithoutAlt.length} image(s) missing alt text`, 'Add descriptive alt text to all images. Screen readers depend on this to describe images to visually impaired users.', 'warning', imagesWithoutAlt.length === 0)

  // 3. Form labels
  const totalInputs = page.forms.reduce((sum, f) => sum + f.inputCount, 0)
  const totalLabeled = page.forms.reduce((sum, f) => sum + f.labeledInputCount, 0)
  check('a11y-form-labels', 'Form inputs missing labels', 'Associate a <label> with every form input using the for attribute. This helps screen readers and improves usability.', 'warning',
    totalInputs === 0 || totalLabeled / totalInputs >= 0.9)

  // 4. Semantic HTML
  check('a11y-no-semantic', 'No semantic HTML elements', 'Use semantic elements like <nav>, <main>, <article> instead of generic <div> to improve navigation for assistive technologies.', 'warning', page.semanticElements.length >= 1)

  // 5. Link text quality
  const badLinkTexts = page.links.filter((l) => {
    const text = l.text.toLowerCase().trim()
    return text === 'click here' || text === 'here' || text === 'read more' || text === 'link'
  })
  check('a11y-bad-link-text', 'Non-descriptive link text found', 'Avoid generic link text like "click here" or "read more". Use descriptive text that makes sense out of context.', 'info', badLinkTexts.length === 0)

  // 6. Has <main> landmark
  check('a11y-no-main', 'Missing <main> landmark', 'Add a <main> element to help screen reader users skip directly to primary content.', 'info', page.semanticElements.includes('main'))

  const score = Math.round((passed / total) * 100)
  return { name: 'accessibility', label: 'Accessibility', score, maxWeight: 15, issues, passed, total }
}
```

- [ ] **Step 6: Implement mobile scorer**

```typescript
// src/lib/analyzer/scorers/mobile.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreMobile(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  let total = 0

  function check(id: string, title: string, desc: string, severity: Issue['severity'], test: boolean) {
    total++
    if (test) { passed++ } else { issues.push({ id, title, description: desc, severity, category: 'mobile' }) }
  }

  // 1. Viewport meta tag
  check('mobile-no-viewport', 'Missing viewport meta tag', 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to make your page responsive on mobile devices.', 'critical', page.hasViewport)

  // 2. Viewport content is proper
  check('mobile-bad-viewport', 'Viewport not configured for responsiveness', 'Your viewport tag should include width=device-width for proper mobile rendering.', 'warning',
    !page.hasViewport || (page.viewportContent?.includes('width=device-width') ?? false))

  // 3. Responsive images (srcset)
  const imagesWithSrcset = page.images.filter((img) => img.hasSrcset)
  check('mobile-no-srcset', 'No responsive images', 'Use srcset attribute on images to serve appropriately sized images for different screen sizes, saving mobile bandwidth.', 'info',
    page.images.length === 0 || imagesWithSrcset.length / page.images.length >= 0.3)

  // 4. Touch-friendly (heuristic: check for small inline widths)
  // Basic check — we just verify viewport exists and is proper for MVP
  check('mobile-page-size', 'Large page may be slow on mobile', 'Pages over 2MB can be slow on mobile connections. Optimize images and minimize code.', 'warning', page.htmlSize < 2 * 1024 * 1024)

  const score = Math.round((passed / total) * 100)
  return { name: 'mobile', label: 'Mobile', score, maxWeight: 15, issues, passed, total }
}
```

- [ ] **Step 7: Run all scorer tests**

```bash
npx vitest run tests/lib/analyzer/scorers/
```

Expected: All pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/analyzer/scorers/ tests/lib/analyzer/scorers/
git commit -m "feat: add performance, security, accessibility, and mobile scorers"
```

---

## Task 8: Aggregate Scorer

**Files:**
- Create: `src/lib/analyzer/scorers/index.ts`
- Create: `tests/lib/analyzer/scorers/index.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/lib/analyzer/scorers/index.test.ts
import { describe, it, expect } from 'vitest'
import { runAllScorers } from '@/lib/analyzer/scorers'
import { parsePage } from '@/lib/analyzer/parser'

describe('runAllScorers', () => {
  it('returns 5 category scores and an overall score', () => {
    const page = parsePage(
      `<html lang="en"><head>
        <title>Test Page</title>
        <meta name="description" content="A decent test page for scoring">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head><body><main><h1>Hello</h1></main></body></html>`,
      'https://example.com',
      { 'content-type': 'text/html', 'strict-transport-security': 'max-age=31536000', 'x-frame-options': 'DENY' },
      200,
    )

    const result = runAllScorers(page)

    expect(result.categories).toHaveLength(5)
    expect(result.categories.map((c) => c.name)).toEqual(['seo', 'performance', 'security', 'accessibility', 'mobile'])
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    expect(result.issues.length).toBeGreaterThanOrEqual(0)
    // Issues should be sorted by severity: critical > warning > info
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    for (let i = 1; i < result.issues.length; i++) {
      expect(severityOrder[result.issues[i].severity]).toBeGreaterThanOrEqual(
        severityOrder[result.issues[i - 1].severity],
      )
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run tests/lib/analyzer/scorers/index.test.ts
```

- [ ] **Step 3: Implement aggregate scorer**

```typescript
// src/lib/analyzer/scorers/index.ts
import type { CategoryScore, Issue, ParsedPage } from '../types'
import { scoreSeo } from './seo'
import { scorePerformance } from './performance'
import { scoreSecurity } from './security'
import { scoreAccessibility } from './accessibility'
import { scoreMobile } from './mobile'

interface AggregateResult {
  categories: CategoryScore[]
  overallScore: number
  issues: Issue[]
}

const SEVERITY_ORDER: Record<Issue['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function runAllScorers(page: ParsedPage): AggregateResult {
  const categories: CategoryScore[] = [
    scoreSeo(page),
    scorePerformance(page),
    scoreSecurity(page),
    scoreAccessibility(page),
    scoreMobile(page),
  ]

  // Weighted average: each category contributes proportionally to its maxWeight
  const totalWeight = categories.reduce((sum, c) => sum + c.maxWeight, 0)
  const weightedSum = categories.reduce((sum, c) => sum + (c.score * c.maxWeight) / 100, 0)
  const overallScore = Math.round((weightedSum / totalWeight) * 100)

  // Collect and sort all issues by severity
  const issues = categories
    .flatMap((c) => c.issues)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  return { categories, overallScore, issues }
}
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analyzer/scorers/index.ts tests/lib/analyzer/scorers/index.test.ts
git commit -m "feat: add aggregate scorer with weighted overall score"
```

---

## Task 9: Supabase Setup

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `supabase/migrations/001_create_reports.sql`

- [ ] **Step 1: Create migration SQL**

```sql
-- supabase/migrations/001_create_reports.sql
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  grade_color TEXT NOT NULL,
  categories JSONB NOT NULL,
  issues JSONB NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for URL lookups (cache check)
CREATE INDEX IF NOT EXISTS idx_reports_url_analyzed ON reports (url, analyzed_at DESC);

-- Auto-delete reports older than 30 days (cost control)
-- Run manually or via Supabase cron: DELETE FROM reports WHERE created_at < NOW() - INTERVAL '30 days';
```

- [ ] **Step 2: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts supabase/
git commit -m "feat: add Supabase client and reports table migration"
```

---

## Task 10: API Route

**Files:**
- Create: `src/app/api/analyze/route.ts`

- [ ] **Step 1: Implement API route**

```typescript
// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { isValidUrl, normalizeUrl } from '@/lib/utils'
import { fetchPage } from '@/lib/analyzer/fetcher'
import { parsePage } from '@/lib/analyzer/parser'
import { runAllScorers } from '@/lib/analyzer/scorers'
import { computeGrade } from '@/lib/analyzer/grade'
import { supabase } from '@/lib/supabase'
import type { Report } from '@/lib/analyzer/types'

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'Missing "url" field' }, { status: 400 })
  }

  const url = normalizeUrl(body.url)

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL. Please enter a valid HTTP or HTTPS URL.' }, { status: 400 })
  }

  // Check cache: if same URL was scanned in last 24h, return existing report
  const { data: cached } = await supabase
    .from('reports')
    .select('id')
    .eq('url', url)
    .gte('analyzed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    return NextResponse.json({ id: cached.id, cached: true })
  }

  // Run analysis
  const startTime = Date.now()

  let report: Report
  try {
    const fetchResult = await fetchPage(url)
    const parsed = parsePage(fetchResult.html, fetchResult.url, fetchResult.headers, fetchResult.statusCode)
    const { categories, overallScore, issues } = runAllScorers(parsed)
    const { letter, color } = computeGrade(overallScore)
    const durationMs = Date.now() - startTime

    report = {
      id: nanoid(10),
      url,
      overallScore,
      grade: letter,
      gradeColor: color,
      categories,
      issues,
      analyzedAt: new Date().toISOString(),
      durationMs,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze URL'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  // Store in Supabase
  const { error: dbError } = await supabase.from('reports').insert({
    id: report.id,
    url: report.url,
    overall_score: report.overallScore,
    grade: report.grade,
    grade_color: report.gradeColor,
    categories: report.categories,
    issues: report.issues,
    analyzed_at: report.analyzedAt,
    duration_ms: report.durationMs,
  })

  if (dbError) {
    console.error('Supabase insert error:', dbError)
    // Still return the report even if DB fails — user gets their results
  }

  return NextResponse.json({ id: report.id, cached: false })
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npx tsc --noEmit
```

Expected: No type errors (some env var warnings are OK).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/analyze/route.ts
git commit -m "feat: add /api/analyze POST route with caching"
```

---

## Task 11: UI Components

**Files:**
- Create: `src/components/url-input.tsx`
- Create: `src/components/score-gauge.tsx`
- Create: `src/components/category-card.tsx`
- Create: `src/components/issue-list.tsx`
- Create: `src/components/header.tsx`
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Create URL input component**

```tsx
// src/components/url-input.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function UrlInput({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      router.push(`/report/${data.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isLarge = size === 'large'

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className={`flex ${isLarge ? 'flex-col sm:flex-row gap-3' : 'flex-row gap-2'}`}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., example.com)"
          className={`flex-1 rounded-xl border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isLarge ? 'py-4 text-lg' : 'py-2 text-sm'}`}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isLarge ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm'}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Grade My Site'
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </form>
  )
}
```

- [ ] **Step 2: Create score gauge component**

```tsx
// src/components/score-gauge.tsx
'use client'

import { useEffect, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  color: string
  size?: number
  label?: string
}

export function ScoreGauge({ score, color, size = 180, label }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const duration = 1000
    const start = performance.now()
    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-4xl font-bold" style={{ color }}>{animatedScore}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
      </div>
      {label && <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>}
    </div>
  )
}
```

- [ ] **Step 3: Create category card component**

```tsx
// src/components/category-card.tsx
import type { CategoryScore } from '@/lib/analyzer/types'
import { ScoreGauge } from './score-gauge'
import { computeGrade } from '@/lib/analyzer/grade'

export function CategoryCard({ category }: { category: CategoryScore }) {
  const { color } = computeGrade(category.score)
  const criticalCount = category.issues.filter((i) => i.severity === 'critical').length
  const warningCount = category.issues.filter((i) => i.severity === 'warning').length

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="relative">
        <ScoreGauge score={category.score} color={color} size={100} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.label}</h3>
      <div className="flex gap-3 text-sm">
        <span className="text-green-600">{category.passed} passed</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="text-gray-500">{category.total} checks</span>
      </div>
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">
              {warningCount} warning
            </span>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create issue list component**

```tsx
// src/components/issue-list.tsx
'use client'

import { useState } from 'react'
import type { Issue } from '@/lib/analyzer/types'

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: '!', iconBg: 'bg-red-500' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', icon: '!', iconBg: 'bg-yellow-500' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'i', iconBg: 'bg-blue-500' },
} as const

export function IssueList({ issues }: { issues: Issue[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-green-600 dark:text-green-400">
        <p className="text-lg font-semibold">No issues found!</p>
        <p className="text-sm text-gray-500">Your site is looking great.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => {
        const config = SEVERITY_CONFIG[issue.severity]
        const isOpen = expanded.has(issue.id)
        return (
          <div
            key={issue.id}
            className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
          >
            <button
              onClick={() => toggle(issue.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className={`w-6 h-6 rounded-full ${config.iconBg} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                {config.icon}
              </span>
              <span className="flex-1 font-medium text-gray-900 dark:text-white text-sm">
                {issue.title}
              </span>
              <span className="text-xs text-gray-400 uppercase">{issue.category}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pl-13 text-sm text-gray-600 dark:text-gray-300">
                {issue.description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Create header and footer**

```tsx
// src/components/header.tsx
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Site<span className="text-blue-600">Grader</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        </nav>
      </div>
    </header>
  )
}
```

```tsx
// src/components/footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} SiteGrader. Free website grading tool.</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add all UI components (url-input, score-gauge, category-card, issue-list, header, footer)"
```

---

## Task 12: Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SiteGrader - Free Website Grading Tool',
  description: 'Get an instant score for your website across SEO, performance, security, accessibility, and mobile. Free, fast, and actionable.',
  openGraph: {
    title: 'SiteGrader - Free Website Grading Tool',
    description: 'Grade your website in 30 seconds. Get actionable insights to improve SEO, performance, and more.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Build landing page**

```tsx
// src/app/page.tsx
import { UrlInput } from '@/components/url-input'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Grade your website
          <br />
          <span className="text-blue-600">in 30 seconds</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Get an instant score across SEO, performance, security, accessibility, and mobile.
          Free, fast, and actionable.
        </p>
        <UrlInput size="large" />
      </section>

      {/* How It Works */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Enter your URL', desc: 'Paste any website address — no signup required.' },
            { step: '2', title: 'We analyze it', desc: 'Our engine runs 30+ checks across 5 categories in seconds.' },
            { step: '3', title: 'Get your score', desc: 'See your grade, top issues, and exactly how to fix them.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Preview */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          What we check
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { emoji: '\u{1F50D}', name: 'SEO', desc: 'Meta tags, headings, links' },
            { emoji: '\u26A1', name: 'Performance', desc: 'Page size, compression' },
            { emoji: '\u{1F512}', name: 'Security', desc: 'HTTPS, headers, mixed content' },
            { emoji: '\u267F', name: 'Accessibility', desc: 'Alt text, labels, semantics' },
            { emoji: '\u{1F4F1}', name: 'Mobile', desc: 'Viewport, responsive images' },
          ].map((cat) => (
            <div key={cat.name} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">FAQ</h2>
        <div className="space-y-6">
          {[
            { q: 'Is SiteGrader free?', a: 'Yes! The basic website grade with top issues is completely free, no signup required.' },
            { q: 'How accurate is the score?', a: 'We run 30+ real checks on your actual HTML, headers, and metadata — not estimates. Your score reflects real, fixable issues.' },
            { q: 'What data do you store?', a: 'We cache results for 24 hours to serve repeat visitors quickly. We never store personal data or cookies.' },
            { q: 'Can I share my score?', a: 'Yes! Every report has a unique URL you can share with your team, clients, or on social media.' },
          ].map((item) => (
            <div key={item.q}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.q}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add landing page with hero, how-it-works, categories, FAQ"
```

---

## Task 13: Results Page

**Files:**
- Create: `src/app/report/[id]/page.tsx`

- [ ] **Step 1: Build results page**

```tsx
// src/app/report/[id]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Report, CategoryScore, Issue } from '@/lib/analyzer/types'
import { ScoreGauge } from '@/components/score-gauge'
import { CategoryCard } from '@/components/category-card'
import { IssueList } from '@/components/issue-list'
import { UrlInput } from '@/components/url-input'

interface ReportRow {
  id: string
  url: string
  overall_score: number
  grade: string
  grade_color: string
  categories: CategoryScore[]
  issues: Issue[]
  analyzed_at: string
  duration_ms: number
}

async function getReport(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single<ReportRow>()

  if (error || !data) return null

  return {
    id: data.id,
    url: data.url,
    overallScore: data.overall_score,
    grade: data.grade as Report['grade'],
    gradeColor: data.grade_color,
    categories: data.categories,
    issues: data.issues,
    analyzedAt: data.analyzed_at,
    durationMs: data.duration_ms,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const report = await getReport(id)
  if (!report) return { title: 'Report Not Found' }

  return {
    title: `${report.grade} Score for ${new URL(report.url).hostname} | SiteGrader`,
    description: `${new URL(report.url).hostname} scored ${report.overallScore}/100. See the full SEO, performance, security, accessibility, and mobile report.`,
    openGraph: {
      title: `${report.grade} — ${new URL(report.url).hostname} scored ${report.overallScore}/100`,
      description: `Website grade report for ${report.url}`,
    },
  }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReport(id)

  if (!report) notFound()

  const hostname = new URL(report.url).hostname

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Report for</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{hostname}</h1>
        <p className="text-sm text-gray-400">{report.url}</p>
        <p className="text-xs text-gray-400 mt-2">
          Analyzed {new Date(report.analyzedAt).toLocaleDateString()} in {report.durationMs}ms
        </p>
      </div>

      {/* Overall Score */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative">
          <ScoreGauge score={report.overallScore} color={report.gradeColor} size={200} />
        </div>
        <div className="mt-4 text-5xl font-bold" style={{ color: report.gradeColor }}>
          {report.grade}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        {report.categories.map((cat) => (
          <CategoryCard key={cat.name} category={cat} />
        ))}
      </div>

      {/* Issues */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Issues Found ({report.issues.length})
        </h2>
        <IssueList issues={report.issues} />
      </div>

      {/* Share + Re-scan */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-6">
        <div className="text-center">
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Share this report
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Check another site</p>
          <UrlInput size="small" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/report/
git commit -m "feat: add shareable results page with score gauge, category cards, issue list"
```

---

## Task 14: Google Analytics Integration

**Files:**
- Create: `src/components/analytics.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create GA4 component**

```tsx
// src/components/analytics.tsx
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function Analytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
```

- [ ] **Step 2: Add Analytics to layout**

In `src/app/layout.tsx`, add import and render `<Analytics />` inside `<body>` before `<Header />`:

```tsx
import { Analytics } from '@/components/analytics'
// ... inside <body>:
<Analytics />
<Header />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/analytics.tsx src/app/layout.tsx
git commit -m "feat: add Google Analytics 4 integration"
```

---

## Task 15: Final Build + Local Test

- [ ] **Step 1: Run all tests**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc/sitegrader"
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Build production**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Start dev server and manual test**

```bash
npm run dev
```

Open http://localhost:3000 in the browser. Verify:
- Landing page renders with URL input
- Entering a URL and clicking "Grade My Site" shows loading state
- (API will fail without Supabase credentials — this is expected; we verify UI renders)

- [ ] **Step 4: Final commit**

```bash
cd "/Users/zxc/Desktop/vibe coding macbook pro/claude_xc"
git add -A
git commit -m "feat: SiteGrader MVP complete — landing page, analysis engine, results page"
```

---

## Post-MVP: Operator Setup Tasks (for the non-technical partner)

These are done manually after the code is complete:

1. **Create Supabase project** at supabase.com → run the migration SQL
2. **Register domain** (e.g., sitegrader.app on Namecheap or Porkbun)
3. **Create Vercel account** → connect GitHub repo → deploy
4. **Set environment variables** in Vercel dashboard (Supabase URL/key, GA ID)
5. **Set up Google Analytics** property → get GA4 measurement ID
6. **Set up Google Search Console** → submit sitemap
7. **Create Stripe account** (for V1.1 monetization phase)
