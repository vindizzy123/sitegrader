/** Custom error for fetch failures */
export class FetchError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'FetchError'
    this.statusCode = statusCode
  }
}

export interface FetchResult {
  html: string
  headers: Record<string, string>
  statusCode: number
  url: string
}

/**
 * Fetches an HTML page with a 10-second timeout.
 * Throws FetchError on non-OK status, network error, or timeout.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  let response: Response
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'SiteGrader/1.0 (+https://sitegrader.app; bot)',
      },
    })
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FetchError(`Request timed out after 10s: ${url}`)
    }
    const message = err instanceof Error ? err.message : String(err)
    throw new FetchError(`Network error fetching ${url}: ${message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new FetchError(
      `HTTP ${response.status} ${response.statusText} for ${url}`,
      response.status,
    )
  }

  // Lowercase all header keys
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  const html = await response.text()

  return {
    html,
    headers,
    statusCode: response.status,
    url,
  }
}
