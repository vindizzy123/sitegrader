import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { scoreAccessibility } from '@/lib/analyzer/scorers/accessibility'

const BASE_URL = 'https://example.com/'
const HEADERS = { 'content-type': 'text/html' }

const ACCESSIBLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Accessible Page</title></head>
<body>
  <header><nav><a href="/home">Home</a></nav></header>
  <main>
    <h1>Main Content</h1>
    <img src="/photo.jpg" alt="A photo">
    <img src="/icon.png" alt="Icon">
    <form>
      <label for="name">Your Name</label>
      <input id="name" type="text">
      <label for="email">Your Email</label>
      <input id="email" type="email">
    </form>
    <a href="/about">About the company</a>
  </main>
  <footer>Footer</footer>
</body>
</html>`

const MINIMAL_HTML = `<html><head></head><body></body></html>`

describe('scoreAccessibility', () => {
  it('returns high score for accessible page', () => {
    const page = parsePage(ACCESSIBLE_HTML, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('accessibility')
    expect(result.label).toBe('Accessibility')
    expect(result.maxWeight).toBe(15)
  })

  it('returns low score for minimal page', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    // Minimal page: missing lang, no semantic, no main landmark = 3 issues out of 6 checks
    expect(result.score).toBeLessThan(60)
  })

  it('detects missing lang attribute', () => {
    const page = parsePage(MINIMAL_HTML, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    const issue = result.issues.find((i) => i.id === 'a11y-missing-lang')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('critical')
  })

  it('passes lang check when lang is set', () => {
    const html = `<html lang="en"><head></head><body></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-missing-lang')).toBeUndefined()
  })

  it('detects images missing alt text below 90% threshold', () => {
    const html = `<html lang="en"><head></head><body>
      <img src="a.jpg">
      <img src="b.jpg">
      <img src="c.jpg">
      <img src="d.jpg" alt="ok">
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-images-missing-alt')).toBeDefined()
  })

  it('passes alt check when 90%+ images have alt', () => {
    const html = `<html lang="en"><head></head><body>
      <img src="a.jpg" alt="a">
      <img src="b.jpg" alt="b">
      <img src="c.jpg" alt="c">
      <img src="d.jpg" alt="d">
      <img src="e.jpg" alt="e">
      <img src="f.jpg" alt="f">
      <img src="g.jpg" alt="g">
      <img src="h.jpg" alt="h">
      <img src="i.jpg" alt="i">
      <img src="j.jpg">
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-images-missing-alt')).toBeUndefined()
  })

  it('detects form inputs missing labels below 90% threshold', () => {
    const html = `<html lang="en"><head></head><body>
      <form>
        <input type="text">
        <input type="email">
        <input type="password">
        <label for="name">Name</label>
        <input id="name" type="text">
      </form>
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-form-labels')).toBeDefined()
  })

  it('passes form labels check when all inputs have labels', () => {
    const html = `<html lang="en"><head></head><body>
      <form>
        <label for="name">Name</label>
        <input id="name" type="text">
        <label for="email">Email</label>
        <input id="email" type="email">
      </form>
    </body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-form-labels')).toBeUndefined()
  })

  it('passes form labels when no forms exist', () => {
    const html = `<html lang="en"><head></head><body><p>No forms here</p></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-form-labels')).toBeUndefined()
  })

  it('detects no semantic elements', () => {
    const html = `<html lang="en"><head></head><body><div><p>Just divs</p></div></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-no-semantic-elements')).toBeDefined()
  })

  it('passes semantic elements check when elements present', () => {
    const html = `<html lang="en"><head></head><body><main><p>Content</p></main></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-no-semantic-elements')).toBeUndefined()
  })

  it('detects bad link text "click here"', () => {
    const html = `<html lang="en"><head></head><body><a href="/page">click here</a></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-bad-link-text')).toBeDefined()
  })

  it('detects bad link text "read more"', () => {
    const html = `<html lang="en"><head></head><body><a href="/page">read more</a></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-bad-link-text')).toBeDefined()
  })

  it('passes link text check for descriptive links', () => {
    const html = `<html lang="en"><head></head><body><a href="/about">About our company</a></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-bad-link-text')).toBeUndefined()
  })

  it('detects no main landmark', () => {
    const html = `<html lang="en"><head></head><body><div>No main</div></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-no-main-landmark')).toBeDefined()
  })

  it('passes main landmark check when <main> is present', () => {
    const html = `<html lang="en"><head></head><body><main>Content</main></body></html>`
    const page = parsePage(html, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.issues.find((i) => i.id === 'a11y-no-main-landmark')).toBeUndefined()
  })

  it('returns correct passed/total counts', () => {
    const page = parsePage(ACCESSIBLE_HTML, BASE_URL, HEADERS, 200)
    const result = scoreAccessibility(page)
    expect(result.passed + result.issues.length).toBe(result.total)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
