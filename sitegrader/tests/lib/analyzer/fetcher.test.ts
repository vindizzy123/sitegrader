import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPage, FetchError } from '@/lib/analyzer/fetcher'

// Helper to build a mock Response-like object
function mockResponse(
  opts: {
    ok?: boolean
    status?: number
    statusText?: string
    body?: string
    headers?: Record<string, string>
  } = {},
) {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    body = '<html></html>',
    headers: headersInit = {},
  } = opts

  const headersMap = new Map(
    Object.entries({ 'content-type': 'text/html', ...headersInit }),
  )

  return {
    ok,
    status,
    statusText,
    headers: {
      forEach(cb: (value: string, key: string) => void) {
        headersMap.forEach((v, k) => cb(v, k))
      },
    },
    text: async () => body,
  }
}

describe('fetchPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns html, headers, statusCode, and url on success', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        body: '<html><head></head><body>Hello</body></html>',
        headers: { 'X-Custom': 'value' },
      }) as unknown as Response,
    )

    const result = await fetchPage('https://example.com')
    expect(result.html).toBe('<html><head></head><body>Hello</body></html>')
    expect(result.statusCode).toBe(200)
    expect(result.url).toBe('https://example.com')
    expect(result.headers['content-type']).toBe('text/html')
  })

  it('lowercases header keys', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        headers: { 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'self'" },
      }) as unknown as Response,
    )

    const result = await fetchPage('https://example.com')
    expect(result.headers['x-frame-options']).toBe('DENY')
    expect(result.headers['content-security-policy']).toBe("default-src 'self'")
  })

  it('sets User-Agent header on request', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse() as unknown as Response,
    )

    await fetchPage('https://example.com')

    const callArgs = vi.mocked(global.fetch).mock.calls[0]
    const init = callArgs[1] as RequestInit
    const ua = (init.headers as Record<string, string>)['User-Agent']
    expect(ua).toBeTruthy()
    expect(typeof ua).toBe('string')
  })

  it('throws FetchError with statusCode on non-OK response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ ok: false, status: 404, statusText: 'Not Found' }) as unknown as Response,
    )

    await expect(fetchPage('https://example.com/missing')).rejects.toMatchObject({
      name: 'FetchError',
      statusCode: 404,
    })
  })

  it('throws FetchError on network error', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(fetchPage('https://example.com')).rejects.toMatchObject({
      name: 'FetchError',
    })
  })

  it('throws FetchError on timeout (AbortError)', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'
    vi.mocked(global.fetch).mockRejectedValueOnce(abortError)

    const err = await fetchPage('https://example.com').catch((e) => e)
    expect(err).toBeInstanceOf(FetchError)
    expect(err.message).toMatch(/timed out/i)
  })

  it('FetchError extends Error', () => {
    const err = new FetchError('test', 503)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(FetchError)
    expect(err.statusCode).toBe(503)
    expect(err.name).toBe('FetchError')
  })
})
