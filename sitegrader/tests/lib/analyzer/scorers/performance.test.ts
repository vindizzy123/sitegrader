import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { scorePerformance } from '@/lib/analyzer/scorers/performance'

const BASE_URL = 'https://example.com/'

const OPTIMIZED_HEADERS = {
  'content-type': 'text/html',
  'content-encoding': 'gzip',
  'cache-control': 'public, max-age=3600',
}

const OPTIMIZED_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Fast Page</title></head>
<body>
  <img src="/hero.webp" alt="Hero">
  <img src="/logo.png" alt="Logo">
  <script src="/app.js"></script>
  <script src="/vendor.js"></script>
</body>
</html>`

const MINIMAL_HTML = `<html><head></head><body></body></html>`

describe('scorePerformance', () => {
  it('returns high score for optimized page', () => {
    const page = parsePage(OPTIMIZED_HTML, BASE_URL, OPTIMIZED_HEADERS, 200)
    const result = scorePerformance(page)
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.name).toBe('performance')
    expect(result.label).toBe('Performance')
    expect(result.maxWeight).toBe(25)
  })

  it('returns low score when multiple performance issues exist', () => {
    const noCompressionHeaders = { 'content-type': 'text/html' }
    const page = parsePage(MINIMAL_HTML, BASE_URL, noCompressionHeaders, 200)
    const result = scorePerformance(page)
    // Should fail no-compression, no-cache, and page-size-ideal (under 0.5MB passes)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('detects page too large (>3MB)', () => {
    const bigHtml = 'A'.repeat(3 * 1024 * 1024 + 1)
    const page = parsePage(bigHtml, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-page-too-large')).toBeDefined()
  })

  it('passes page size check for small page', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-page-too-large')).toBeUndefined()
  })

  it('detects page size not ideal (>500KB)', () => {
    const mediumHtml = 'A'.repeat(600 * 1024)
    const page = parsePage(mediumHtml, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-page-size-ideal')).toBeDefined()
  })

  it('passes page size ideal for small page', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-page-size-ideal')).toBeUndefined()
  })

  it('detects too many images (>20)', () => {
    const imgs = Array.from({ length: 21 }, (_, i) => `<img src="/img${i}.jpg" alt="img">`).join('')
    const html = `<html><head></head><body>${imgs}</body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-too-many-images')).toBeDefined()
  })

  it('passes image count check for <=20 images', () => {
    const imgs = Array.from({ length: 20 }, (_, i) => `<img src="/img${i}.jpg" alt="img">`).join('')
    const html = `<html><head></head><body>${imgs}</body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-too-many-images')).toBeUndefined()
  })

  it('detects legacy image formats (bmp)', () => {
    const html = `<html><head></head><body><img src="/photo.bmp" alt="bmp"></body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-legacy-image-formats')).toBeDefined()
  })

  it('detects legacy image formats (tiff)', () => {
    const html = `<html><head></head><body><img src="/scan.tiff" alt="tiff"></body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-legacy-image-formats')).toBeDefined()
  })

  it('passes legacy format check for modern formats', () => {
    const html = `<html><head></head><body><img src="/hero.webp" alt="webp"><img src="/logo.avif" alt="avif"></body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-legacy-image-formats')).toBeUndefined()
  })

  it('detects no compression', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, { 'content-type': 'text/html' }, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-no-compression')).toBeDefined()
  })

  it('passes compression check with gzip', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, { 'content-encoding': 'gzip' }, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-no-compression')).toBeUndefined()
  })

  it('passes compression check with br', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, { 'content-encoding': 'br' }, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-no-compression')).toBeUndefined()
  })

  it('detects no cache headers', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, { 'content-type': 'text/html' }, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-no-cache-headers')).toBeDefined()
  })

  it('passes cache headers check with cache-control', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, { 'cache-control': 'max-age=86400' }, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-no-cache-headers')).toBeUndefined()
  })

  it('detects too many script tags (>10)', () => {
    const scripts = Array.from({ length: 11 }, (_, i) => `<script src="/s${i}.js"></script>`).join('')
    const html = `<html><head>${scripts}</head><body></body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-many-scripts')).toBeDefined()
  })

  it('passes script tag check for <=10 scripts', () => {
    const scripts = Array.from({ length: 5 }, (_, i) => `<script src="/s${i}.js"></script>`).join('')
    const html = `<html><head>${scripts}</head><body></body></html>`
    const page = parsePage(html, BASE_URL, {}, 200)
    const result = scorePerformance(page)
    expect(result.issues.find((i) => i.id === 'perf-many-scripts')).toBeUndefined()
  })

  it('returns correct passed/total counts', () => {
    const page = parsePage(OPTIMIZED_HTML, BASE_URL, OPTIMIZED_HEADERS, 200)
    const result = scorePerformance(page)
    expect(result.passed + result.issues.length).toBe(result.total)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
