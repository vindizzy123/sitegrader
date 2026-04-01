import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scorePerformance(page: ParsedPage): CategoryScore {
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
      issues.push({ id, title, description: desc, severity, category: 'performance' })
    }
  }

  const MB = 1024 * 1024

  // Page size checks
  check(
    'perf-page-too-large',
    'Page size exceeds 3 MB',
    'A 3 MB+ HTML page takes 6–15 seconds to load on a typical mobile connection, causing most visitors to leave before it finishes. Audit your page for inline SVGs, base64-encoded images, or large JSON blobs embedded in the HTML, and move them to external files or a CDN.',
    'critical',
    page.htmlSize <= 3 * MB,
  )

  check(
    'perf-page-size-ideal',
    'Page size not ideal',
    'Pages over 500 KB load noticeably slower on mobile devices and negatively impact Google\'s Core Web Vitals scores, which directly affect your search rankings. Remove unused HTML, minify your markup, and defer or lazy-load non-critical resources to bring the page under 500 KB.',
    'warning',
    page.htmlSize < 0.5 * MB,
  )

  // Count <img> tags (from the parsed images array)
  check(
    'perf-too-many-images',
    'Too many images',
    'More than 20 images triggers too many simultaneous HTTP requests, blocking the browser and stalling the page load — each extra image adds latency. Use lazy loading (`loading="lazy"` attribute) for below-the-fold images, and consider pagination or carousels for galleries.',
    'warning',
    page.images.length <= 20,
  )

  // Legacy image formats (bmp/tiff)
  const legacyFormats = ['bmp', 'tiff', 'tif']
  const hasLegacyImages = page.images.some((img) => {
    const ext = img.src.split('.').pop()?.toLowerCase() ?? ''
    return legacyFormats.includes(ext)
  })
  check(
    'perf-legacy-image-formats',
    'Legacy image formats detected',
    'BMP and TIFF files are uncompressed and can be 5–10× larger than equivalent WebP or AVIF images, severely increasing load times. Convert all images to WebP (or AVIF for maximum compression) — most modern tools and CDNs can do this automatically.',
    'warning',
    !hasLegacyImages,
  )

  // Compression check via content-encoding header
  const contentEncoding = page.headers['content-encoding'] ?? ''
  const hasCompression =
    contentEncoding.includes('gzip') ||
    contentEncoding.includes('br') ||
    contentEncoding.includes('zstd') ||
    contentEncoding.includes('deflate')
  check(
    'perf-no-compression',
    'No compression detected',
    'Serving uncompressed HTML, CSS, and JS wastes bandwidth — Brotli compression alone typically reduces transfer sizes by 20–30%, directly improving load times for every visitor. Enable Brotli or gzip on your web server; on Nginx add `gzip on;`, on Apache enable `mod_deflate`, and most CDNs offer this as a one-click setting.',
    'warning',
    hasCompression,
  )

  // Cache headers check
  const cacheControl = page.headers['cache-control'] ?? ''
  const hasExpires = 'expires' in page.headers
  const hasCacheHeaders = cacheControl.length > 0 || hasExpires
  check(
    'perf-no-cache-headers',
    'No cache headers found',
    'Without cache headers, browsers re-download your page on every visit instead of serving it from cache, making repeat visits just as slow as the first. Set a Cache-Control header on your server: `Cache-Control: public, max-age=3600` for pages, and `max-age=31536000, immutable` for versioned assets.',
    'warning',
    hasCacheHeaders,
  )

  // Count script tags in HTML
  const scriptTagCount = (page.html.match(/<script/gi) ?? []).length
  check(
    'perf-many-scripts',
    'Too many script tags',
    'Each individual `<script>` tag is a potential render-blocking request — 10+ scripts can add seconds to your page load time as the browser waits for each one. Bundle your JavaScript into one or two files using a build tool like Vite or Webpack, and add `defer` or `async` attributes to non-critical scripts.',
    'warning',
    scriptTagCount <= 10,
  )

  const score = Math.round((passed / total) * 100)
  return {
    name: 'performance',
    label: 'Performance',
    score,
    maxWeight: 25,
    issues,
    passed,
    total,
  }
}
