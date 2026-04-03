import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Site<span className="text-blue-600">Grader</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  )
}
