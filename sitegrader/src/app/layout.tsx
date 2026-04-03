import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Analytics } from '@/components/analytics'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sitegrader-kappa.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: 'e_YAkG0nucdE-WbHAp40_d6TVvwQXWmhRSdZaagY_Ms',
  },
  title: {
    default: 'SiteGrader - Free Website Grading Tool',
    template: '%s | SiteGrader',
  },
  description:
    'Grade your website instantly. SiteGrader analyzes SEO, performance, security, accessibility, and mobile-friendliness — giving you an actionable score in seconds.',
  keywords: [
    'website grader',
    'website score',
    'SEO checker',
    'website analysis',
    'website audit',
    'free website tool',
    'site performance',
    'website report',
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'SiteGrader',
    title: 'SiteGrader - Free Website Grading Tool',
    description:
      'Grade your website instantly. SiteGrader analyzes SEO, performance, security, accessibility, and mobile-friendliness — giving you an actionable score in seconds.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'SiteGrader - Free Website Grading Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteGrader - Free Website Grading Tool',
    description:
      'Grade your website instantly. SiteGrader analyzes SEO, performance, security, accessibility, and mobile-friendliness — giving you an actionable score in seconds.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <Analytics />
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
