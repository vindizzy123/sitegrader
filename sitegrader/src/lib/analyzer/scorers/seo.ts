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
    'Your page has no <title> tag, so search engines cannot display a proper title in results — this alone can dramatically reduce click-through rates. Add one inside your <head>: `<title>Your Page Title – Brand Name</title>`. Keep it under 60 characters for best results.',
    'critical',
    page.title !== null,
  )

  check(
    'seo-title-too-long',
    'Title too long',
    'Titles over 60 characters get cut off in Google search results with "…", making your listing look incomplete and reducing clicks. Trim your title to 60 characters or fewer, putting the most important keywords first.',
    'warning',
    page.title === null || page.title.length <= 60,
  )

  check(
    'seo-title-too-short',
    'Title too short',
    'A title under 20 characters doesn\'t give search engines enough context to understand your page, which hurts rankings. Expand it to at least 20 characters by including your primary keyword and brand name.',
    'warning',
    page.title === null || page.title.length >= 20,
  )

  // Meta description checks
  check(
    'seo-missing-meta-description',
    'Missing meta description',
    'Without a meta description, Google auto-generates a snippet that may not represent your page well, reducing click-through rates from search results. Add one in your <head>: `<meta name="description" content="Your compelling 150-character summary here.">`. Aim for 120–160 characters.',
    'warning',
    page.metaDescription !== null,
  )

  check(
    'seo-meta-description-length',
    'Meta description length not optimal',
    'Meta descriptions outside the 120–160 character sweet spot are either too short to be informative or get truncated in search results. Edit yours to fall within this range — treat it like ad copy that convinces searchers to click your link.',
    'info',
    page.metaDescription === null ||
      (page.metaDescription.length >= 120 && page.metaDescription.length <= 160),
  )

  // H1 checks
  const h1Count = page.headings.filter((h) => h.level === 1).length
  check(
    'seo-missing-h1',
    'Missing H1 heading',
    'The H1 tag is the single most important on-page SEO signal — it tells search engines what your page is about. Add exactly one `<h1>` containing your primary keyword near the top of your page content.',
    'critical',
    h1Count >= 1,
  )

  check(
    'seo-multiple-h1',
    'Multiple H1 headings',
    'Using more than one H1 dilutes the topic signal you send to search engines, making it harder to rank for any single keyword. Keep exactly one <h1> per page and use <h2>–<h6> for subheadings.',
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
    'Skipping heading levels (e.g. jumping from H1 directly to H3) breaks the document outline, which both search engines and screen readers rely on to understand content structure. Fix your headings so they nest in order: H1 → H2 → H3, never skipping a level.',
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
    'Images without alt text are invisible to search engines and screen readers — you\'re losing valuable keyword opportunities and image search traffic. Add descriptive alt text to every content image: `<img src="photo.jpg" alt="Descriptive phrase about the image">`. Decorative images can use `alt=""`.',
    'warning',
    altRatio >= 0.9,
  )

  // Canonical
  check(
    'seo-missing-canonical',
    'Missing canonical URL',
    'Without a canonical tag, search engines may index multiple versions of your page (e.g. with/without www, http vs https) as separate pages, splitting your ranking power. Add `<link rel="canonical" href="https://yourdomain.com/page/">` in your <head> to consolidate all signals to one URL.',
    'info',
    page.canonicalUrl !== null,
  )

  // OG tags
  const hasOgTitle = 'og:title' in page.ogTags
  const hasOgDesc = 'og:description' in page.ogTags
  check(
    'seo-missing-og-tags',
    'Missing Open Graph tags',
    'Without Open Graph tags, when someone shares your page on Facebook, LinkedIn, or Slack, it will show an ugly blank preview instead of a rich card — significantly reducing click-throughs from social media. Add these to your <head>: `<meta property="og:title" content="Your Title">` and `<meta property="og:description" content="Your description">`.',
    'info',
    hasOgTitle && hasOgDesc,
  )

  // Twitter tags
  const hasTwitterCard = 'twitter:card' in page.twitterTags
  check(
    'seo-missing-twitter-tags',
    'Missing Twitter Card tags',
    'Without a Twitter Card tag, links shared on X (Twitter) show as plain text instead of an eye-catching card with an image and description. Add `<meta name="twitter:card" content="summary_large_image">` to your <head>, then include twitter:title and twitter:description as well.',
    'info',
    hasTwitterCard,
  )

  // Internal links
  const internalLinks = page.links.filter((l) => !l.isExternal)
  check(
    'seo-no-internal-links',
    'No internal links found',
    'Pages with no internal links are dead ends for search engine crawlers — other pages on your site won\'t get discovered or indexed. Add links to related pages or sections within your site so crawlers (and users) can navigate your full content.',
    'warning',
    internalLinks.length > 0,
  )

  const score = Math.round((passed / total) * 100)
  return { name: 'seo', label: 'SEO', score, maxWeight: 25, issues, passed, total }
}
