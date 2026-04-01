export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {year} SiteGrader. Free website grading tool.
      </div>
    </footer>
  )
}
