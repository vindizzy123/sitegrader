import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { scoreSeo } from '@/lib/analyzer/scorers/seo'

const BASE_URL = 'https://example.com/'
const HEADERS = { 'content-type': 'text/html' }

const WELL_OPTIMIZED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Great Page Title For SEO</title>
  <meta name="description" content="This is a well-written meta description that is between 120 and 160 characters long for optimal SEO results displayed in search.">
  <meta property="og:title" content="Great Page">
  <meta property="og:description" content="OG Description">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://example.com/">
</head>
<body>
  <h1>Main Topic Heading</h1>
  <h2>Sub Topic One</h2>
  <p>Some paragraph content here.</p>
  <img src="/a.jpg" alt="Image A">
  <img src="/b.jpg" alt="Image B">
  <a href="/about">About Us</a>
  <a href="/contact">Contact</a>
</body>
</html>`

const MINIMAL_HTML = `<html><head></head><body></body></html>`

describe('scoreSeo', () => {
  it('returns high score for well-optimized page', () => {
    const page = parsePage(WELL_OPTIMIZED_HTML, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('seo')
    expect(result.label).toBe('SEO')
    expect(result.maxWeight).toBe(25)
  })

  it('returns low score for minimal/empty page', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.score).toBeLessThan(55)
  })

  it('detects missing title issue', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    const issue = result.issues.find((i) => i.id === 'seo-missing-title')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('critical')
    expect(issue!.category).toBe('seo')
  })

  it('detects title too long', () => {
    const html = `<html><head><title>${'A'.repeat(61)}</title></head><body><h1>H</h1></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-title-too-long')).toBeDefined()
  })

  it('detects title too short', () => {
    const html = `<html><head><title>Short</title></head><body><h1>H</h1></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-title-too-short')).toBeDefined()
  })

  it('does not flag title issues for title between 20-60 chars', () => {
    const html = `<html><head><title>A Perfect Length Title Here</title></head><body><h1>H</h1></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-title-too-long')).toBeUndefined()
    expect(result.issues.find((i) => i.id === 'seo-title-too-short')).toBeUndefined()
  })

  it('detects missing meta description', () => {
    const html = `<html><head><title>Good Title For Test Page</title></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-missing-meta-description')).toBeDefined()
  })

  it('detects missing H1', () => {
    const html = `<html><head><title>Good Title For Test Page</title></head><body><h2>Sub</h2></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-missing-h1')).toBeDefined()
  })

  it('detects multiple H1 headings', () => {
    const html = `<html><head></head><body><h1>First</h1><h1>Second</h1></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-multiple-h1')).toBeDefined()
  })

  it('detects heading hierarchy skipping levels', () => {
    const html = `<html><head></head><body><h1>First</h1><h3>Third</h3></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-heading-hierarchy')).toBeDefined()
  })

  it('detects images missing alt text below 90% threshold', () => {
    const html = `<html><head></head><body><img src="a.jpg"><img src="b.jpg"><img src="c.jpg"><img src="d.jpg" alt="ok"></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-images-missing-alt')).toBeDefined()
  })

  it('passes alt text check when 90%+ images have alt', () => {
    const html = `<html><head></head><body><img src="a.jpg" alt="a"><img src="b.jpg" alt="b"><img src="c.jpg" alt="c"><img src="d.jpg" alt="d"><img src="e.jpg" alt="e"><img src="f.jpg" alt="f"><img src="g.jpg" alt="g"><img src="h.jpg" alt="h"><img src="i.jpg" alt="i"><img src="j.jpg"></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-images-missing-alt')).toBeUndefined()
  })

  it('detects missing canonical URL', () => {
    const html = `<html><head></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-missing-canonical')).toBeDefined()
  })

  it('detects missing OG tags', () => {
    const html = `<html><head></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-missing-og-tags')).toBeDefined()
  })

  it('detects missing Twitter tags', () => {
    const html = `<html><head></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-missing-twitter-tags')).toBeDefined()
  })

  it('detects no internal links', () => {
    const html = `<html><head></head><body><a href="https://other.com">External</a></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.issues.find((i) => i.id === 'seo-no-internal-links')).toBeDefined()
  })

  it('returns correct passed/total counts', () => {
    const page = parsePage(WELL_OPTIMIZED_HTML, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.total).toBeGreaterThan(0)
    expect(result.passed).toBeLessThanOrEqual(result.total)
    expect(result.passed + result.issues.length).toBe(result.total)
  })

  it('score is 0-100', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreSeo(page)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
