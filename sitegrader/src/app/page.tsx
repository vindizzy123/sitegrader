import UrlInput from '@/components/url-input'

const STEPS = [
  {
    num: 1,
    title: 'Enter a URL',
    description: 'Paste any website address into the input above.',
  },
  {
    num: 2,
    title: 'We analyze it',
    description: 'Our engine checks SEO, performance, security, accessibility, and mobile.',
  },
  {
    num: 3,
    title: 'Get your score',
    description: 'Receive an A–F grade with a full breakdown and actionable recommendations.',
  },
]

const CATEGORIES = [
  {
    icon: '🔍',
    title: 'SEO',
    description:
      'Title tags, meta descriptions, headings, canonical URLs, and Open Graph tags.',
  },
  {
    icon: '⚡',
    title: 'Performance',
    description: 'HTML size, render-blocking hints, image optimization, and caching headers.',
  },
  {
    icon: '🔒',
    title: 'Security',
    description: 'HTTPS enforcement, security headers like CSP and HSTS, and safe redirect chains.',
  },
  {
    icon: '♿',
    title: 'Accessibility',
    description: 'Alt text on images, labelled form inputs, language attributes, and ARIA basics.',
  },
  {
    icon: '📱',
    title: 'Mobile',
    description: 'Viewport configuration, touch-friendly targets, and responsive meta tags.',
  },
]

const FAQS = [
  {
    q: 'Is SiteGrader free?',
    a: 'Yes, completely free — no sign-up, no credit card, no limits.',
  },
  {
    q: 'How accurate are the results?',
    a: 'We run over 30 automated checks based on industry best practices. Results are a solid starting point, though a human audit may catch nuances automated tools cannot.',
  },
  {
    q: 'Do you store my website data?',
    a: 'Reports are stored so you can share them via URL. We do not sell or share your data with third parties.',
  },
  {
    q: 'Can I share my report?',
    a: 'Yes! Every report gets a unique URL you can share with your team or clients.',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Grade your website in{' '}
          <span className="text-blue-600">30 seconds</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Instantly analyze SEO, performance, security, accessibility, and
          mobile-friendliness. Get an A–F score with clear, actionable fixes.
        </p>
        <div className="mt-8 w-full max-w-2xl">
          <UrlInput size="large" />
        </div>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          No sign-up required. Free forever.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            What we check
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-2xl" role="img" aria-label={cat.title}>
                  {cat.icon}
                </span>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 dark:bg-gray-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-gray-900 dark:text-white">{faq.q}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
