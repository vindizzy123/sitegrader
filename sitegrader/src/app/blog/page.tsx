import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — Website SEO & Performance Tips',
  description:
    'Practical guides on website SEO, performance, security, and accessibility — from the team behind SiteGrader.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog — Website SEO & Performance Tips | SiteGrader',
    description:
      'Practical guides on website SEO, performance, security, and accessibility — from the team behind SiteGrader.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Blog
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Practical guides on SEO, performance, security, and website best practices.
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="mb-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{post.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                Read article
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
