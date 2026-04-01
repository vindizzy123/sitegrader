import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'

const TEST_HTML = `<!DOCTYPE html>
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

const BASE_URL = 'https://example.com/test'
const HEADERS = { 'content-type': 'text/html; charset=utf-8' }
const STATUS = 200

describe('parsePage', () => {
  const page = parsePage(TEST_HTML, BASE_URL, HEADERS, STATUS)

  it('passes through html, url, headers, and statusCode', () => {
    expect(page.html).toBe(TEST_HTML)
    expect(page.url).toBe(BASE_URL)
    expect(page.headers).toBe(HEADERS)
    expect(page.statusCode).toBe(STATUS)
  })

  it('extracts the title', () => {
    expect(page.title).toBe('Test Page Title')
  })

  it('extracts meta description', () => {
    expect(page.metaDescription).toBe('A test page for the parser')
  })

  it('extracts meta tags', () => {
    expect(page.metaTags['description']).toBe('A test page for the parser')
    expect(page.metaTags['viewport']).toBe('width=device-width, initial-scale=1')
  })

  it('extracts Open Graph tags', () => {
    expect(page.ogTags['og:title']).toBe('OG Title')
  })

  it('extracts Twitter Card tags', () => {
    expect(page.twitterTags['twitter:card']).toBe('summary')
  })

  it('extracts headings in order with correct levels', () => {
    expect(page.headings).toEqual([
      { level: 1, text: 'Main Heading' },
      { level: 2, text: 'Subheading' },
    ])
  })

  it('extracts images with alt and srcset detection', () => {
    expect(page.images).toHaveLength(3)

    const photo = page.images.find((i) => i.src === '/img/photo.jpg')
    expect(photo).toBeDefined()
    expect(photo!.alt).toBe('A photo')
    expect(photo!.hasSrcset).toBe(false)

    const icon = page.images.find((i) => i.src === '/img/icon.png')
    expect(icon).toBeDefined()
    expect(icon!.alt).toBeNull()
    expect(icon!.hasSrcset).toBe(false)

    const hero = page.images.find((i) => i.src === '/img/hero.webp')
    expect(hero).toBeDefined()
    expect(hero!.alt).toBe('Hero')
    expect(hero!.hasSrcset).toBe(true)
  })

  it('extracts links and correctly identifies external links', () => {
    expect(page.links).toHaveLength(2)

    const local = page.links.find((l) => l.href === '/about')
    expect(local).toBeDefined()
    expect(local!.text).toBe('local link')
    expect(local!.isExternal).toBe(false)

    const external = page.links.find((l) => l.href === 'https://other.com')
    expect(external).toBeDefined()
    expect(external!.text).toBe('external link')
    expect(external!.isExternal).toBe(true)
  })

  it('extracts htmlLang', () => {
    expect(page.htmlLang).toBe('en')
  })

  it('detects viewport meta tag', () => {
    expect(page.hasViewport).toBe(true)
    expect(page.viewportContent).toBe('width=device-width, initial-scale=1')
  })

  it('extracts canonical URL', () => {
    expect(page.canonicalUrl).toBe('https://example.com/test')
  })

  it('computes htmlSize as byte length of the html string', () => {
    expect(page.htmlSize).toBeGreaterThan(0)
    expect(page.htmlSize).toBe(Buffer.byteLength(TEST_HTML, 'utf8'))
  })

  it('detects semantic elements', () => {
    expect(page.semanticElements).toContain('nav')
    expect(page.semanticElements).toContain('main')
  })

  it('parses form input counts and labeled input counts', () => {
    expect(page.forms).toHaveLength(1)
    // 2 inputs total: one with id="name" (has label), one without id (no label)
    expect(page.forms[0].inputCount).toBe(2)
    expect(page.forms[0].labeledInputCount).toBe(1)
  })

  it('returns null title when no title element exists', () => {
    const result = parsePage('<html><head></head><body></body></html>', BASE_URL, {}, 200)
    expect(result.title).toBeNull()
  })

  it('returns false hasViewport when no viewport meta exists', () => {
    const result = parsePage('<html><head></head><body></body></html>', BASE_URL, {}, 200)
    expect(result.hasViewport).toBe(false)
    expect(result.viewportContent).toBeNull()
  })

  it('returns null htmlLang when html element has no lang attribute', () => {
    const result = parsePage('<html><head></head><body></body></html>', BASE_URL, {}, 200)
    expect(result.htmlLang).toBeNull()
  })
})
