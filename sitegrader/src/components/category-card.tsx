import type { CategoryScore } from '@/lib/analyzer/types'
import { computeGrade } from '@/lib/analyzer/grade'
import ScoreGauge from './score-gauge'

interface CategoryCardProps {
  category: CategoryScore
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { color } = computeGrade(category.score)
  const criticalCount = category.issues.filter((i) => i.severity === 'critical').length
  const warningCount = category.issues.filter((i) => i.severity === 'warning').length

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <ScoreGauge score={category.score} color={color} size={100} />
      <div className="text-center">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{category.label}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {category.passed} / {category.total} checks passed
        </p>
      </div>
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex flex-wrap justify-center gap-1">
          {criticalCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
