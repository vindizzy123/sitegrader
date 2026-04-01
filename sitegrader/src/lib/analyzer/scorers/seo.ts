import type { CategoryScore, Issue, ParsedPage } from '../types'

export function scoreSeo(page: ParsedPage): CategoryScore {
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
      issues.push({ id, title, description: desc, severity, category: 'seo' })
    }
  }

  // Title checks
  check(
    'seo-missing-title',
    'Missing title tag',
    'Add a <title> tag to your page. It is displayed in search results and browser tabs.',
    'critical',
    page.title !== null,
  )

  check(
    'seo-title-too-long',
    'Title too long',
    'Keep your title under 60 characters to avoid truncation in search results.',
    'warning',
    page.title === null || page.title.length <= 60,
  )

  check(
    'seo-title-too-short',
    'Title too short',
    'Your title should be at least 20 characters for adequate search result display.',
    'warning',
    page.title === null || page.title.length >= 20,
  )

  // Meta description checks
  check(
    'seo-missing-meta-description',
    'Missing meta description',
    'Add a <meta name="description"> tag to improve click-through rates from search results.',
    'warning',
    page.metaDescription !== null,
  )

  check(
    'seo-meta-description-length',
    'Meta description length not optimal',
    'Keep your meta description between 120 and 160 characters for best display in search results.',
    'info',
    page.metaDescription === null ||
      (page.metaDescription.length >= 120 && page.metaDescription.length <= 160),
  )

  // H1 checks
  const h1Count = page.headings.filter((h) => h.level === 1).length
  check(
    'seo-missing-h1',
    'Missing H1 heading',
    'Add an <h1> tag to clearly signal the main topic of the page to search engines.',
    'critical',
    h1Count >= 1,
  )

  check(
    'seo-multiple-h1',
    'Multiple H1 headings',
    'Use only one <h1> per page. Multiple H1s dilute the page topic signal.',
    'warning',
    h1Count <= 1,
  )

  // Heading hierarchy check
  let hierarchyOk = true
  for (let i = 1; i < page.headings.length; i++) {
    if (page.headings[i].level > page.headings[i - 1].level + 1) {
      hierarchyOk = false
      break
    }
  }
  check(
    'seo-heading-hierarchy',
    'Heading hierarchy skips levels',
    'Do not skip heading levels (e.g. h1 → h3). Use a logical nesting order.',
    'warning',
    hierarchyOk,
  )

  // Images alt check (90% threshold)
  const imgCount = page.images.length
  const imgsWithAlt = page.images.filter((img) => img.alt !== null && img.alt !== '').length
  const altRatio = imgCount === 0 ? 1 : imgsWithAlt / imgCount
  check(
    'seo-images-missing-alt',
    'Images missing alt text',
    'Add descriptive alt text to at least 90% of images to improve SEO and accessibility.',
    'warning',
    altRatio >= 0.9,
  )

  // Canonical
  check(
    'seo-missing-canonical',
    'Missing canonical URL',
    'Add a <link rel="canonical"> to prevent duplicate content issues.',
    'info',
    page.canonicalUrl !== null,
  )

  // OG tags
  const hasOgTitle = 'og:title' in page.ogTags
  const hasOgDesc = 'og:description' in page.ogTags
  check(
    'seo-missing-og-tags',
    'Missing Open Graph tags',
    'Add og:title and og:description meta tags to control how your page appears when shared on social media.',
    'info',
    hasOgTitle && hasOgDesc,
  )

  // Twitter tags
  const hasTwitterCard = 'twitter:card' in page.twitterTags
  check(
    'seo-missing-twitter-tags',
    'Missing Twitter Card tags',
    'Add a twitter:card meta tag to control how your page appears when shared on Twitter/X.',
    'info',
    hasTwitterCard,
  )

  // Internal links
  const internalLinks = page.links.filter((l) => !l.isExternal)
  check(
    'seo-no-internal-links',
    'No internal links found',
    'Add internal links to help search engines discover and index more pages on your site.',
    'warning',
    internalLinks.length > 0,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'seo', label: 'SEO', score, maxWeight: 25, issues, passed, total }
}
