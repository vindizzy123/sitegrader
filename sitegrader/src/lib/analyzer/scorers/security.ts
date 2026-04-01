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
    'HTTP pages transmit all data — including passwords and form submissions — in plain text, making them trivially easy for attackers to intercept. Google also penalises non-HTTPS sites in rankings. Install a free TLS certificate via Let\'s Encrypt and configure your server to redirect all HTTP traffic to HTTPS.',
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
    'Without HSTS, attackers can downgrade HTTPS connections to HTTP through a man-in-the-middle attack, bypassing your TLS certificate entirely. Add this header on your server: `Strict-Transport-Security: max-age=31536000; includeSubDomains`. This tells browsers to always use HTTPS for your domain for the next year.',
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
    'Without a CSP, attackers who inject malicious scripts into your page (XSS) can steal user data, hijack sessions, or redirect visitors to phishing sites. Start with a restrictive policy: `Content-Security-Policy: default-src \'self\'; script-src \'self\'` and gradually whitelist trusted external sources.',
    'warning',
    hasCsp,
  )

  // X-Frame-Options
  const hasXfo =
    'x-frame-options' in page.headers && page.headers['x-frame-options'].length > 0
  check(
    'sec-no-x-frame-options',
    'Missing X-Frame-Options header',
    'Without this header, attackers can embed your page inside an invisible iframe on a malicious site, tricking users into clicking buttons they can\'t see (clickjacking). Add `X-Frame-Options: DENY` to block all framing, or `SAMEORIGIN` to allow only your own domain to frame the page.',
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
    'Without this header, browsers may "sniff" a file\'s content type and execute a text file as JavaScript, creating a vector for script injection attacks. Add `X-Content-Type-Options: nosniff` — it\'s a one-line server config change that prevents this class of attack entirely.',
    'warning',
    hasXcto,
  )

  // Server version exposed
  const serverHeader = page.headers['server'] ?? ''
  const serverVersionExposed = /[\d.]+/.test(serverHeader)
  check(
    'sec-server-version-exposed',
    'Server version exposed in headers',
    'Exposing your server software version (e.g. "nginx/1.18.0") tells attackers exactly which known vulnerabilities to target, reducing the effort required for an attack. Configure your server to suppress version details: on Nginx set `server_tokens off;`, on Apache set `ServerTokens Prod`.',
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
    'Loading HTTP resources on an HTTPS page breaks the security guarantee of encryption — browsers block or warn about mixed content, which can cause images, scripts, or stylesheets to silently fail. Search through your HTML for any `src="http://` or `href="http://` attributes and change them all to `https://`.',
    'critical',
    !hasMixedContent,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'security', label: 'Security', score, maxWeight: 20, issues, passed, total }
}
