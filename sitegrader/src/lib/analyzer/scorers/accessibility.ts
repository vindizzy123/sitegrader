import type { CategoryScore, Issue, ParsedPage } from '../types'

const BAD_LINK_TEXTS = ['click here', 'here', 'read more', 'link', 'more', 'this']

export function scoreAccessibility(page: ParsedPage): CategoryScore {
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
      issues.push({ id, title, description: desc, severity, category: 'accessibility' })
    }
  }

  // Language attribute
  check(
    'a11y-missing-lang',
    'Missing lang attribute on <html>',
    'Add a lang attribute to the <html> element (e.g. lang="en") to help screen readers.',
    'critical',
    page.htmlLang !== null && page.htmlLang.length > 0,
  )

  // Images alt text (90% threshold)
  const imgCount = page.images.length
  const imgsWithAlt = page.images.filter((img) => img.alt !== null && img.alt !== '').length
  const altRatio = imgCount === 0 ? 1 : imgsWithAlt / imgCount
  check(
    'a11y-images-missing-alt',
    'Images missing alt text',
    'Add descriptive alt text to at least 90% of images so screen readers can describe them.',
    'critical',
    altRatio >= 0.9,
  )

  // Form labels (90% threshold across all forms)
  const totalInputs = page.forms.reduce((sum, f) => sum + f.inputCount, 0)
  const totalLabeled = page.forms.reduce((sum, f) => sum + f.labeledInputCount, 0)
  const labelRatio = totalInputs === 0 ? 1 : totalLabeled / totalInputs
  check(
    'a11y-form-labels',
    'Form inputs missing labels',
    'Associate labels with at least 90% of form inputs using <label for="id"> to aid screen reader users.',
    'critical',
    labelRatio >= 0.9,
  )

  // Semantic elements
  check(
    'a11y-no-semantic-elements',
    'No semantic HTML elements',
    'Use semantic elements like <header>, <main>, <nav>, <footer>, <article>, or <section> to improve navigation for assistive technologies.',
    'warning',
    page.semanticElements.length > 0,
  )

  // Bad link text
  const hasBadLinkText = page.links.some((link) =>
    BAD_LINK_TEXTS.includes(link.text.toLowerCase().trim()),
  )
  check(
    'a11y-bad-link-text',
    'Non-descriptive link text',
    'Avoid vague link text like "click here", "here", "read more", or "link". Use descriptive text that explains the link destination.',
    'warning',
    !hasBadLinkText,
  )

  // Main landmark
  const hasMain = page.semanticElements.includes('main')
  check(
    'a11y-no-main-landmark',
    'Missing <main> landmark',
    'Add a <main> element to define the primary content area, helping screen reader users skip to the main content.',
    'warning',
    hasMain,
  )

  const score = Math.round((passed / total) * 100)
  return {
    name: 'accessibility',
    label: 'Accessibility',
    score,
    maxWeight: 15,
    issues,
    passed,
    total,
  }
}
