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

export const metadata: Metadata = {
  title: 'SiteGrader - Free Website Grading Tool',
  description:
    'Grade your website instantly. SiteGrader analyzes SEO, performance, security, accessibility, and mobile-friendliness — giving you an actionable score in seconds.',
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
