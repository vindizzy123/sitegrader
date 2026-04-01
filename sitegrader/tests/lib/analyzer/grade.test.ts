import { describe, it, expect } from 'vitest'
import { computeGrade } from '@/lib/analyzer/grade'

describe('computeGrade', () => {
  it('returns A+ for 95-100', () => {
    expect(computeGrade(100)).toEqual({ letter: 'A+', color: '#22c55e' })
    expect(computeGrade(95)).toEqual({ letter: 'A+', color: '#22c55e' })
  })
  it('returns A for 85-94', () => {
    expect(computeGrade(90)).toEqual({ letter: 'A', color: '#4ade80' })
    expect(computeGrade(85)).toEqual({ letter: 'A', color: '#4ade80' })
  })
  it('returns B for 70-84', () => {
    expect(computeGrade(75)).toEqual({ letter: 'B', color: '#facc15' })
  })
  it('returns C for 55-69', () => {
    expect(computeGrade(60)).toEqual({ letter: 'C', color: '#fb923c' })
  })
  it('returns D for 40-54', () => {
    expect(computeGrade(45)).toEqual({ letter: 'D', color: '#f87171' })
  })
  it('returns F for 0-39', () => {
    expect(computeGrade(20)).toEqual({ letter: 'F', color: '#ef4444' })
    expect(computeGrade(0)).toEqual({ letter: 'F', color: '#ef4444' })
  })
})
