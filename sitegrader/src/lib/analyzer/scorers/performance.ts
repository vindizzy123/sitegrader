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
    'Reduce your HTML page size below 3 MB to improve load times for all users.',
    'critical',
    page.htmlSize <= 3 * MB,
  )

  check(
    'perf-page-size-ideal',
    'Page size not ideal',
    'Keep your HTML page size under 500 KB for fast loading, especially on mobile.',
    'warning',
    page.htmlSize < 0.5 * MB,
  )

  // Count <img> tags (from the parsed images array)
  check(
    'perf-too-many-images',
    'Too many images',
    'Having more than 20 images per page can hurt performance. Use lazy loading or pagination.',
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
    'Replace BMP or TIFF images with modern formats like WebP, AVIF, or JPEG/PNG.',
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
    'Enable gzip or Brotli compression on your server to reduce transfer sizes.',
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
    'Add Cache-Control or Expires headers to allow browsers to cache your page.',
    'warning',
    hasCacheHeaders,
  )

  // Count script tags in HTML
  const scriptTagCount = (page.html.match(/<script/gi) ?? []).length
  check(
    'perf-many-scripts',
    'Too many script tags',
    'Reduce the number of <script> tags below 10. Bundle your JavaScript to improve load performance.',
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
