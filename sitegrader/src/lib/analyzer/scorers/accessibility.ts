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
    'Without a `lang` attribute, screen readers cannot choose the correct language pronunciation engine, making your content unintelligible to blind users who speak that language. Add it to your opening HTML tag: `<html lang="en">`. Use the appropriate BCP-47 language code for your content (e.g. "es" for Spanish, "fr" for French).',
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
    'Images without alt text are completely invisible to screen reader users and people with images disabled — they hear nothing or "image12345.jpg" read aloud. Add a concise description to every content image: `<img src="team.jpg" alt="The SiteGrader team at our 2024 offsite">`. For purely decorative images, use `alt=""` to tell screen readers to skip it.',
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
    'Form fields without labels are impossible to use with a screen reader — the user hears "edit text" with no context about what to type. Associate a label with every input using the `for` attribute matching the input\'s `id`: `<label for="email">Email address</label><input id="email" type="email">`. Never rely on placeholder text alone.',
    'critical',
    labelRatio >= 0.9,
  )

  // Semantic elements
  check(
    'a11y-no-semantic-elements',
    'No semantic HTML elements',
    'Pages built entirely from `<div>` and `<span>` elements have no structure that assistive technologies can navigate — screen reader users cannot jump to the main content, navigation, or footer. Replace layout divs with semantic elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>`.',
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
    'Links that say "click here" or "read more" are useless to screen reader users who navigate by tabbing through links — they hear a list of "click here, click here, click here" with no idea where each goes. Replace vague link text with descriptive phrases: instead of "click here", write "Download the 2024 Annual Report".',
    'warning',
    !hasBadLinkText,
  )

  // Main landmark
  const hasMain = page.semanticElements.includes('main')
  check(
    'a11y-no-main-landmark',
    'Missing <main> landmark',
    'Without a `<main>` landmark, screen reader users must tab through the entire header and navigation on every page to reach the content — there\'s no way to skip to the good part. Wrap your primary page content in a `<main>` element, which gives assistive technologies a "skip to main content" target.',
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
