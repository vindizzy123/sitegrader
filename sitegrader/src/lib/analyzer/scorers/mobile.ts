import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreMobile(page: ParsedPage): CategoryScore {
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
      issues.push({ id, title, description: desc, severity, category: 'mobile' })
    }
  }

  // Viewport existence
  check(
    'mobile-no-viewport',
    'Missing viewport meta tag',
    'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.',
    'critical',
    page.hasViewport,
  )

  // Viewport content check
  const goodViewport =
    !page.hasViewport ||
    (page.viewportContent !== null &&
      page.viewportContent.toLowerCase().includes('width=device-width'))
  check(
    'mobile-bad-viewport',
    'Viewport does not include width=device-width',
    'Set width=device-width in your viewport meta tag so the page scales correctly on mobile devices.',
    'critical',
    goodViewport,
  )

  // Responsive images via srcset (30% threshold)
  const imgCount = page.images.length
  const imgsWithSrcset = page.images.filter((img) => img.hasSrcset).length
  const srcsetRatio = imgCount === 0 ? 1 : imgsWithSrcset / imgCount
  check(
    'mobile-no-srcset',
    'Images lack responsive srcset',
    'Add srcset attributes to at least 30% of images to serve appropriate sizes on different screen densities.',
    'info',
    srcsetRatio >= 0.3,
  )

  // Large page for mobile (>2MB)
  const MB = 1024 * 1024
  check(
    'mobile-large-page',
    'Page is too large for mobile',
    'Keep your page under 2 MB to ensure fast loading on mobile networks.',
    'warning',
    page.htmlSize <= 2 * MB,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'mobile', label: 'Mobile', score, maxWeight: 15, issues, passed, total }
}
