import type { LetterGrade } from './types'

interface GradeResult {
  letter: LetterGrade
  color: string
}

const GRADE_THRESHOLDS: { min: number; letter: LetterGrade; color: string }[] = [
  { min: 95, letter: 'A+', color: '#22c55e' },
  { min: 85, letter: 'A', color: '#4ade80' },
  { min: 70, letter: 'B', color: '#facc15' },
  { min: 55, letter: 'C', color: '#fb923c' },
  { min: 40, letter: 'D', color: '#f87171' },
  { min: 0, letter: 'F', color: '#ef4444' },
]

export function computeGrade(score: number): GradeResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  for (const threshold of GRADE_THRESHOLDS) {
    if (clamped >= threshold.min) {
      return { letter: threshold.letter, color: threshold.color }
    }
  }
  return { letter: 'F', color: '#ef4444' }
}
