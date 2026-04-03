import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sitegrader-kappa.vercel.app'

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to blog
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{post.description}</p>
      </header>

      {/* Article content */}
      <article
        className="prose prose-gray max-w-none dark:prose-invert
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-h2:text-gray-900 dark:prose-h2:text-white
          prose-p:text-gray-700 prose-p:leading-relaxed dark:prose-p:text-gray-300
          prose-li:text-gray-700 dark:prose-li:text-gray-300
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-blue-400
          prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-200
          prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:p-4 dark:prose-pre:bg-gray-950
          prose-ul:my-4 prose-ol:my-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* CTA banner */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center shadow-lg">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Ready to grade your website?
        </h2>
        <p className="mt-2 text-blue-100">
          Run a free SiteGrader analysis in seconds — no account required.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
        >
          Check my website free
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
        </Link>
      </div>
    </div>
  )
}
