import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { runAllScorers } from '@/lib/analyzer/scorers'

const BASE_URL = 'https://example.com/'

const GOOD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A comprehensive test page that is well-optimized for search engines and performance metrics.">
  <meta property="og:title" content="Good Page">
  <meta property="og:description" content="OG Description">
  <meta name="twitter:card" content="summary_large_image">
  <title>Good Page Title For Testing</title>
  <link rel="canonical" href="https://example.com/">
</head>
<body>
  <header><nav><a href="/home">Home</a></nav></header>
  <main>
    <h1>Main Heading</h1>
    <h2>Sub Heading</h2>
    <p>Content here. <a href="/about">About us</a></p>
    <img src="/hero.webp" alt="Hero" srcset="/hero-2x.webp 2x">
  </main>
  <footer>Footer</footer>
</body>
</html>`

const MINIMAL_HTML = `<html><head></head><body></body></html>`

const GOOD_HEADERS = {
  'content-encoding': 'gzip',
  'cache-control': 'public, max-age=3600',
  'strict-transport-security': 'max-age=31536000',
  'content-security-policy': "default-src 'self'",
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
}

describe('runAllScorers', () => {
  it('returns 5 categories', () => {
    const page = parsePage(GOOD_HTML, BASE_URL, GOOD_HEADERS, 200)
    const result = runAllScorers(page)
    expect(result.categories).toHaveLength(5)
  })

  it('categories are in order: seo, performance, security, accessibility, mobile', () => {
    const page = parsePage(GOOD_HTML, BASE_URL, GOOD_HEADERS, 200)
    const result = runAllScorers(page)
    expect(result.categories[0].name).toBe('seo')
    expect(result.categories[1].name).toBe('performance')
    expect(result.categories[2].name).toBe('security')
    expect(result.categories[3].name).toBe('accessibility')
    expect(result.categories[4].name).toBe('mobile')
  })

  it('overall score is between 0 and 100', () => {
    const page = parsePage(GOOD_HTML, BASE_URL, GOOD_HEADERS, 200)
    const result = runAllScorers(page)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('overall score is between 0 and 100 for minimal page too', () => {
    const page = parsePage(MINIMAL_HTML, 'http://example.com/', {}, 200)
    const result = runAllScorers(page)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('good page scores higher than minimal page', () => {
    const goodPage = parsePage(GOOD_HTML, BASE_URL, GOOD_HEADERS, 200)
    const minimalPage = parsePage(MINIMAL_HTML, 'http://example.com/', {}, 200)
    const goodResult = runAllScorers(goodPage)
    const minimalResult = runAllScorers(minimalPage)
    expect(goodResult.overallScore).toBeGreaterThan(minimalResult.overallScore)
  })

  it('issues are sorted by severity: critical first, then warning, then info', () => {
    const page = parsePage(MINIMAL_HTML, 'http://example.com/', {}, 200)
    const result = runAllScorers(page)

    const severityOrder = { critical: 0, warning: 1, info: 2 }
    for (let i = 1; i < result.issues.length; i++) {
      const prev = severityOrder[result.issues[i - 1].severity]
      const curr = severityOrder[result.issues[i].severity]
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })

  it('issues list contains all issues from all categories', () => {
    const page = parsePage(MINIMAL_HTML, 'http://example.com/', {}, 200)
    const result = runAllScorers(page)
    const totalCategoryIssues = result.categories.reduce((sum, c) => sum + c.issues.length, 0)
    expect(result.issues).toHaveLength(totalCategoryIssues)
  })

  it('weighted average uses maxWeight correctly', () => {
    const page = parsePage(GOOD_HTML, BASE_URL, GOOD_HEADERS, 200)
    const result = runAllScorers(page)

    // Manually compute expected weighted average
    const totalWeight = result.categories.reduce((sum, c) => sum + c.maxWeight, 0)
    expect(totalWeight).toBe(100) // 25 + 25 + 20 + 15 + 15 = 100

    const weightedSum = result.categories.reduce((sum, c) => sum + (c.score * c.maxWeight) / 100, 0)
    const expected = Math.round((weightedSum / totalWeight) * 100)
    expect(result.overallScore).toBe(expected)
  })

  it('issues from each category have correct category name', () => {
    const page = parsePage(MINIMAL_HTML, 'http://example.com/', {}, 200)
    const result = runAllScorers(page)

    for (const category of result.categories) {
      for (const issue of category.issues) {
        expect(issue.category).toBe(category.name)
      }
    }
  })

  it('all category maxWeights sum to 100', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, {}, 200)
    const result = runAllScorers(page)
    const total = result.categories.reduce((sum, c) => sum + c.maxWeight, 0)
    expect(total).toBe(100)
  })
})
