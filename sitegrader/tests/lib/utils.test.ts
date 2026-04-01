import { describe, it, expect } from 'vitest'
import { isValidUrl, normalizeUrl } from '@/lib/utils'

describe('isValidUrl', () => {
  it('accepts valid HTTP URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://sub.example.com/path?q=1')).toBe(true)
  })

  it('rejects invalid URLs', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('normalizeUrl', () => {
  it('adds https:// if no protocol', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })
  it('preserves existing protocol', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })
  it('trims whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com')
  })
  it('removes trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
  })
})
