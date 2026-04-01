import type { CategoryScore, Issue, ParsedPage } from '../types'
import { scoreSeo } from './seo'
import { scorePerformance } from './performance'
import { scoreSecurity } from './security'
import { scoreAccessibility } from './accessibility'
import { scoreMobile } from './mobile'

export { scoreSeo } from './seo'
export { scorePerformance } from './performance'
export { scoreSecurity } from './security'
export { scoreAccessibility } from './accessibility'
export { scoreMobile } from './mobile'

export interface AggregateResult {
  categories: CategoryScore[]
  overallScore: number
  issues: Issue[]
}

const SEVERITY_ORDER: Record<Issue['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function runAllScorers(page: ParsedPage): AggregateResult {
  const categories = [
    scoreSeo(page),
    scorePerformance(page),
    scoreSecurity(page),
    scoreAccessibility(page),
    scoreMobile(page),
  ]

  // Weighted average: weight by maxWeight, score is 0-100
  const totalWeight = categories.reduce((sum, c) => sum + c.maxWeight, 0)
  const weightedSum = categories.reduce((sum, c) => sum + (c.score * c.maxWeight) / 100, 0)
  const overallScore = Math.round((weightedSum / totalWeight) * 100)

  // Collect and sort all issues by severity: critical > warning > info
  const issues = categories
    .flatMap((c) => c.issues)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  return { categories, overallScore, issues }
}
