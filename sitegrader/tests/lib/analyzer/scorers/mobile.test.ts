import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { scoreMobile } from '@/lib/analyzer/scorers/mobile'

const BASE_URL = 'https://example.com/'
const HEADERS = { 'content-type': 'text/html' }

const MOBILE_OPTIMIZED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mobile Optimized</title>
</head>
<body>
  <img src="/hero.webp" alt="Hero" srcset="/hero-2x.webp 2x, /hero-3x.webp 3x">
  <img src="/logo.png" alt="Logo" srcset="/logo-2x.png 2x">
  <img src="/photo.jpg" alt="Photo" srcset="/photo-2x.jpg 2x">
</body>
</html>`

const MINIMAL_HTML = `<html><head></head><body></body></html>`

describe('scoreMobile', () => {
  it('returns high score for mobile-optimized page', () => {
    const page = parsePage(MOBILE_OPTIMIZED_HTML, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('mobile')
    expect(result.label).toBe('Mobile')
    expect(result.maxWeight).toBe(15)
  })

  it('returns low score for minimal page', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    // Minimal page: missing viewport → bad viewport check also fails = 2 failures out of 4 checks
    expect(result.score).toBeLessThan(80)
  })

  it('detects missing viewport meta tag', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    const issue = result.issues.find((i) => i.id === 'mobile-no-viewport')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('critical')
  })

  it('passes viewport check when viewport meta present', () => {
    const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-no-viewport')).toBeUndefined()
  })

  it('detects bad viewport without width=device-width', () => {
    const html = `<html><head><meta name="viewport" content="initial-scale=1"></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-bad-viewport')).toBeDefined()
  })

  it('passes viewport content check with width=device-width', () => {
    const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-bad-viewport')).toBeUndefined()
  })

  it('detects no srcset images below 30% threshold', () => {
    // 0 out of 4 images have srcset
    const html = `<html><head></head><body>
      <img src="a.jpg" alt="a">
      <img src="b.jpg" alt="b">
      <img src="c.jpg" alt="c">
      <img src="d.jpg" alt="d">
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-no-srcset')).toBeDefined()
  })

  it('passes srcset check when 30%+ images have srcset', () => {
    // 2 out of 4 images have srcset = 50%
    const html = `<html><head></head><body>
      <img src="a.jpg" alt="a" srcset="a-2x.jpg 2x">
      <img src="b.jpg" alt="b" srcset="b-2x.jpg 2x">
      <img src="c.jpg" alt="c">
      <img src="d.jpg" alt="d">
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-no-srcset')).toBeUndefined()
  })

  it('passes srcset check when no images exist', () => {
    const html = `<html><head></head><body><p>No images</p></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-no-srcset')).toBeUndefined()
  })

  it('detects large page for mobile (>2MB)', () => {
    const bigHtml = 'A'.repeat(2 * 1024 * 1024 + 1)
    const page = parsePage(bigHtml, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-large-page')).toBeDefined()
  })

  it('passes large page check for page under 2MB', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.issues.find((i) => i.id === 'mobile-large-page')).toBeUndefined()
  })

  it('returns correct passed/total counts', () => {
    const page = parsePage(MOBILE_OPTIMIZED_HTML, BASE_URL, HEADERS, 200)
    const result = scoreMobile(page)
    expect(result.passed + result.issues.length).toBe(result.total)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
