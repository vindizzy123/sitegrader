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
    'Without a viewport meta tag, mobile browsers render your page at desktop width (~980px) and then shrink it down, making text tiny and unreadable without pinching and zooming. Add this exact tag inside your <head>: `<meta name="viewport" content="width=device-width, initial-scale=1">`. This is the foundation of any mobile-responsive page.',
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
    'A viewport tag without `width=device-width` means the browser doesn\'t know to match the page width to the device screen, causing horizontal scrolling or incorrectly scaled layouts on phones. Update your viewport tag to: `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
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
    'Serving a single large desktop image to mobile users wastes their data and slows load times — a 2000px image downloaded on a 375px phone screen transfers 5× more data than needed. Add `srcset` to serve appropriately sized images: `<img src="hero.jpg" srcset="hero-400.jpg 400w, hero-800.jpg 800w" sizes="(max-width: 600px) 400px, 800px">`.',
    'info',
    srcsetRatio >= 0.3,
  )

  // Large page for mobile (>2MB)
  const MB = 1024 * 1024
  check(
    'mobile-large-page',
    'Page is too large for mobile',
    'A page over 2 MB can take 10+ seconds to load on a 4G mobile connection, and even longer on 3G — studies show 53% of users abandon a page that takes more than 3 seconds to load. Identify and eliminate large inline resources, compress images, and consider lazy-loading content that\'s not immediately visible.',
    'warning',
    page.htmlSize <= 2 * MB,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'mobile', label: 'Mobile', score, maxWeight: 15, issues, passed, total }
}
