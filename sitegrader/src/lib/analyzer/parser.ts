import * as cheerio from 'cheerio'
import type { ParsedPage } from './types'

const SEMANTIC_TAGS = [
  'header', 'footer', 'nav', 'main', 'article',
  'section', 'aside', 'figure', 'figcaption', 'details',
  'summary', 'mark', 'time',
]

/**
 * Parses raw HTML into a structured ParsedPage object.
 */
export function parsePage(
  html: string,
  url: string,
  headers: Record<string, string>,
  statusCode: number,
): ParsedPage {
  const $ = cheerio.load(html)

  // Title
  const title = $('title').first().text().trim() || null

  // Meta description
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ?? null

  // All meta tags (name → content)
  const metaTags: Record<string, string> = {}
  $('meta[name]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content !== undefined) {
      metaTags[name] = content
    }
  })

  // Open Graph tags (og:* → content)
  const ogTags: Record<string, string> = {}
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property')
    const content = $(el).attr('content')
    if (property && content !== undefined) {
      ogTags[property] = content
    }
  })

  // Twitter Card tags (twitter:* → content)
  const twitterTags: Record<string, string> = {}
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name')
    const content = $(el).attr('content')
    if (name && content !== undefined) {
      twitterTags[name] = content
    }
  })

  // Headings in document order
  const headings: { level: number; text: string }[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tagName = (el as any).name ?? (el as any).tagName ?? ''
    const level = parseInt(tagName.replace('h', ''), 10)
    if (!isNaN(level)) {
      headings.push({ level, text: $(el).text().trim() })
    }
  })

  // Images
  const images: { src: string; alt: string | null; hasSrcset: boolean }[] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') ?? ''
    const altAttr = $(el).attr('alt')
    const alt = altAttr !== undefined ? altAttr : null
    const hasSrcset = $(el).attr('srcset') !== undefined
    images.push({ src, alt, hasSrcset })
  })

  // Links — determine base origin for isExternal check
  let baseOrigin: string | null = null
  try {
    baseOrigin = new URL(url).origin
  } catch {
    // invalid url, treat all links as internal
  }

  const links: { href: string; text: string; isExternal: boolean }[] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text().trim()
    let isExternal = false
    try {
      const resolved = new URL(href, url)
      isExternal = baseOrigin !== null && resolved.origin !== baseOrigin
    } catch {
      // relative or invalid — treat as internal
    }
    links.push({ href, text, isExternal })
  })

  // <html lang>
  const htmlLang = $('html').attr('lang')?.trim() ?? null

  // Viewport
  const viewportMeta = $('meta[name="viewport"]')
  const hasViewport = viewportMeta.length > 0
  const viewportContent = viewportMeta.attr('content')?.trim() ?? null

  // Canonical URL
  const canonicalUrl =
    $('link[rel="canonical"]').attr('href')?.trim() ?? null

  // HTML size in bytes (UTF-8)
  const htmlSize = Buffer.byteLength(html, 'utf8')

  // Semantic elements present (deduplicated)
  const foundSemanticTags = new Set<string>()
  SEMANTIC_TAGS.forEach((tag) => {
    if ($(tag).length > 0) {
      foundSemanticTags.add(tag)
    }
  })
  const semanticElements = Array.from(foundSemanticTags)

  // Forms: count inputs and labeled inputs per form
  const forms: { inputCount: number; labeledInputCount: number }[] = []
  $('form').each((_, formEl) => {
    const formInputs = $(formEl).find('input')
    const inputCount = formInputs.length
    let labeledInputCount = 0

    formInputs.each((_, inputEl) => {
      const id = $(inputEl).attr('id')
      if (id) {
        // Check for a <label for="id"> inside the form
        const hasLabel = $(formEl).find(`label[for="${id}"]`).length > 0
        if (hasLabel) {
          labeledInputCount++
        }
      }
    })

    forms.push({ inputCount, labeledInputCount })
  })

  return {
    html,
    url,
    headers,
    statusCode,
    title,
    metaDescription,
    metaTags,
    ogTags,
    twitterTags,
    headings,
    images,
    links,
    htmlLang,
    hasViewport,
    viewportContent,
    canonicalUrl,
    htmlSize,
    semanticElements,
    forms,
  }
}
