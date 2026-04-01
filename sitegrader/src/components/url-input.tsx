'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface UrlInputProps {
  size?: 'large' | 'small'
}

export default function UrlInput({ size = 'large' }: UrlInputProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push(`/report/${data.id}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const isLarge = size === 'large'

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full gap-2 ${isLarge ? 'flex-col sm:flex-row' : 'flex-row'}`}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          disabled={loading}
          className={`flex-1 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
            isLarge ? 'py-3 text-base sm:text-lg' : 'py-2 text-sm'
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 ${
            isLarge
              ? 'px-6 py-3 text-base sm:text-lg'
              : 'px-4 py-2 text-sm'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            'Grade Website'
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
