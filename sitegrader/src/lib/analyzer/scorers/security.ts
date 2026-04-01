import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreSecurity(page: ParsedPage): CategoryScore {
  const issues: Issue[] = []
  let passed = 0
  let total = 0

  function check(
    id: string,
    title: string,
    desc: string,
    severity: Issue['severity'],
    test: boolean,
  ) {
    total++
    if (test) {
      passed++
    } else {
      issues.push({ id, title, description: desc, severity, category: 'security' })
    }
  }

  const isHttps = page.url.startsWith('https://')

  // HTTPS check
  check(
    'sec-no-https',
    'Page not served over HTTPS',
    'Serve your site over HTTPS to protect users and improve SEO rankings.',
    'critical',
    isHttps,
  )

  // HSTS
  const hasHsts =
    'strict-transport-security' in page.headers &&
    page.headers['strict-transport-security'].length > 0
  check(
    'sec-no-hsts',
    'Missing Strict-Transport-Security header',
    'Add the Strict-Transport-Security (HSTS) header to enforce HTTPS connections.',
    'warning',
    hasHsts,
  )

  // CSP
  const hasCsp =
    'content-security-policy' in page.headers &&
    page.headers['content-security-policy'].length > 0
  check(
    'sec-no-csp',
    'Missing Content-Security-Policy header',
    'Add a Content-Security-Policy header to prevent XSS and data injection attacks.',
    'warning',
    hasCsp,
  )

  // X-Frame-Options
  const hasXfo =
    'x-frame-options' in page.headers && page.headers['x-frame-options'].length > 0
  check(
    'sec-no-x-frame-options',
    'Missing X-Frame-Options header',
    'Add an X-Frame-Options header to protect against clickjacking attacks.',
    'warning',
    hasXfo,
  )

  // X-Content-Type-Options
  const hasXcto =
    'x-content-type-options' in page.headers &&
    page.headers['x-content-type-options'].length > 0
  check(
    'sec-no-x-content-type-options',
    'Missing X-Content-Type-Options header',
    'Add X-Content-Type-Options: nosniff to prevent MIME type sniffing attacks.',
    'warning',
    hasXcto,
  )

  // Server version exposed
  const serverHeader = page.headers['server'] ?? ''
  const serverVersionExposed = /[\d.]+/.test(serverHeader)
  check(
    'sec-server-version-exposed',
    'Server version exposed in headers',
    'Remove version information from the Server header to reduce information leakage.',
    'info',
    !serverVersionExposed,
  )

  // Mixed content (http:// in src/href on an HTTPS page)
  let hasMixedContent = false
  if (isHttps) {
    // Look for http:// in src= or href= attributes (not https://)
    hasMixedContent = /(?:src|href)=["']http:\/\//i.test(page.html)
  }
  check(
    'sec-mixed-content',
    'Mixed content detected',
    'Replace all http:// resource URLs with https:// to avoid mixed content warnings.',
    'critical',
    !hasMixedContent,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'security', label: 'Security', score, maxWeight: 20, issues, passed, total }
}
