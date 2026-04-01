import { describe, it, expect } from 'vitest'
import { parsePage } from '@/lib/analyzer/parser'
import { scoreSecurity } from '@/lib/analyzer/scorers/security'

const HTTPS_URL = 'https://example.com/'
const HTTP_URL = 'http://example.com/'

const SECURE_HEADERS = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'",
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
}

const MINIMAL_HTML = `<html><head></head><body></body></html>`

describe('scoreSecurity', () => {
  it('returns high score for secure HTTPS page with all headers', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, SECURE_HEADERS, 200)
    const result = scoreSecurity(page)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('security')
    expect(result.label).toBe('Security')
    expect(result.maxWeight).toBe(20)
  })

  it('returns low score for HTTP page with no security headers', () => {
    const page = parsePage(MINIMAL_HTML, HTTP_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.score).toBeLessThan(40)
  })

  it('detects no HTTPS', () => {
    const page = parsePage(MINIMAL_HTML, HTTP_URL, {}, 200)
    const result = scoreSecurity(page)
    const issue = result.issues.find((i) => i.id === 'sec-no-https')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('critical')
  })

  it('passes HTTPS check for https URL', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-https')).toBeUndefined()
  })

  it('detects missing HSTS', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-hsts')).toBeDefined()
  })

  it('passes HSTS check when header present', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'strict-transport-security': 'max-age=31536000' }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-hsts')).toBeUndefined()
  })

  it('detects missing CSP', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-csp')).toBeDefined()
  })

  it('passes CSP check when header present', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'content-security-policy': "default-src 'self'" }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-csp')).toBeUndefined()
  })

  it('detects missing X-Frame-Options', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-x-frame-options')).toBeDefined()
  })

  it('passes X-Frame-Options check when header present', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'x-frame-options': 'DENY' }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-x-frame-options')).toBeUndefined()
  })

  it('detects missing X-Content-Type-Options', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-x-content-type-options')).toBeDefined()
  })

  it('passes X-Content-Type-Options check when header present', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'x-content-type-options': 'nosniff' }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-no-x-content-type-options')).toBeUndefined()
  })

  it('detects server version exposed', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'server': 'Apache/2.4.51' }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-server-version-exposed')).toBeDefined()
  })

  it('passes server version check when no version numbers', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, { 'server': 'nginx' }, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-server-version-exposed')).toBeUndefined()
  })

  it('passes server version check when no server header', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-server-version-exposed')).toBeUndefined()
  })

  it('detects mixed content on HTTPS page', () => {
    const html = `<html><head></head><body><img src="http://cdn.example.com/img.jpg" alt="img"></body></html>`
    const page = parsePage(html, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-mixed-content')).toBeDefined()
  })

  it('does not flag mixed content for HTTP page', () => {
    const html = `<html><head></head><body><img src="http://cdn.example.com/img.jpg" alt="img"></body></html>`
    const page = parsePage(html, HTTP_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-mixed-content')).toBeUndefined()
  })

  it('does not flag mixed content when all resources are HTTPS', () => {
    const html = `<html><head></head><body><img src="https://cdn.example.com/img.jpg" alt="img"></body></html>`
    const page = parsePage(html, HTTPS_URL, {}, 200)
    const result = scoreSecurity(page)
    expect(result.issues.find((i) => i.id === 'sec-mixed-content')).toBeUndefined()
  })

  it('returns correct passed/total counts', () => {
    const page = parsePage(MINIMAL_HTML, HTTPS_URL, SECURE_HEADERS, 200)
    const result = scoreSecurity(page)
    expect(result.passed + result.issues.length).toBe(result.total)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
