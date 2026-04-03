export interface BlogPost {
  slug: string
  title: string
  description: string
  content: string // HTML string
  publishedAt: string
  readingTime: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'website-seo-checklist-2026',
    title: 'The Complete Website SEO Checklist for 2026',
    description:
      'A practical, up-to-date SEO checklist covering every on-page and technical factor you need to rank in 2026 — from title tags to Core Web Vitals.',
    publishedAt: '2026-03-15',
    readingTime: '7 min read',
    content: `
<p>Search engine optimization changes every year, but the fundamentals stay the same: make it easy for Google to understand, crawl, and rank your pages. This checklist covers every major on-page and technical factor you should verify before (and after) launching any website in 2026.</p>

<h2>1. Title Tags</h2>
<p>Every page needs a unique, descriptive title tag between 50 and 60 characters. The title is the single most important on-page SEO signal. Include your primary keyword near the beginning, and make it compelling enough that people actually click it in the search results. Duplicate title tags across multiple pages confuse search engines and dilute your ranking potential — use a tool like SiteGrader to catch them quickly.</p>

<h2>2. Meta Descriptions</h2>
<p>Meta descriptions do not directly affect rankings, but they dramatically affect click-through rates. Write a unique meta description for every page, 120–155 characters, summarizing the page content and including a soft call-to-action. Think of it as a short ad copy for your page in the search results.</p>

<h2>3. Heading Structure (H1–H6)</h2>
<p>Each page should have exactly one H1 tag that clearly states the page topic. Use H2s for major sections and H3s for subsections. A logical heading hierarchy helps both users and crawlers understand your content structure. Never skip heading levels (e.g., jumping from H1 to H3) purely for styling purposes.</p>

<h2>4. Image Alt Text</h2>
<p>Every meaningful image on your site should have a descriptive alt attribute. Alt text helps visually impaired users understand images and gives search engines context for indexing image content. Decorative images (spacers, dividers) should have an empty alt attribute (<code>alt=""</code>) so screen readers skip them.</p>

<h2>5. Canonical URLs</h2>
<p>If your content is accessible at multiple URLs (with/without trailing slash, HTTP vs HTTPS, www vs non-www), use the <code>&lt;link rel="canonical"&gt;</code> tag to tell Google which version is authoritative. Without it, duplicate content can split your ranking signals across multiple URLs.</p>

<h2>6. Open Graph Tags</h2>
<p>Open Graph meta tags (<code>og:title</code>, <code>og:description</code>, <code>og:image</code>) control how your pages appear when shared on social media. A compelling OG image dramatically increases engagement when your content is shared on LinkedIn, Twitter/X, and Facebook. Set these on every page, especially blog posts and landing pages.</p>

<h2>7. XML Sitemap</h2>
<p>Your sitemap.xml file lists every important URL on your site and helps search engines discover new content faster. Generate it automatically with your CMS or framework (Next.js generates one natively). Submit it to Google Search Console and Bing Webmaster Tools after launch. Update it whenever you publish or remove pages.</p>

<h2>8. robots.txt</h2>
<p>The robots.txt file tells crawlers which parts of your site they are and are not allowed to index. Make sure you are not accidentally blocking important pages. A common mistake is deploying a staging-environment robots.txt (which blocks all crawlers) to production. Check this immediately after any deployment.</p>

<h2>9. Page Speed and Core Web Vitals</h2>
<p>Google uses Core Web Vitals — Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) — as ranking signals. Your LCP should be under 2.5 seconds, CLS under 0.1, and INP under 200ms. Optimize by compressing images, using a CDN, eliminating render-blocking scripts, and enabling caching headers. Check your scores at PageSpeed Insights or via SiteGrader.</p>

<h2>10. Mobile-Friendliness</h2>
<p>Google uses mobile-first indexing, meaning it primarily uses the mobile version of your content for ranking. Your site must have a proper viewport meta tag, text that is readable without zooming, and tap targets (buttons, links) that are at least 48px in height. Test with Google's Mobile-Friendly Test tool.</p>

<h2>11. HTTPS</h2>
<p>Every website in 2026 must run on HTTPS. Google has used HTTPS as a ranking signal since 2014, and modern browsers actively warn users when visiting HTTP pages. Get a free SSL certificate from Let's Encrypt. Make sure all HTTP requests redirect permanently (301) to HTTPS, and check that your SSL certificate is not expired.</p>

<h2>12. Structured Data (Schema Markup)</h2>
<p>Schema markup (JSON-LD format) helps Google understand your content and qualify your pages for rich results — star ratings, FAQs, how-to steps, breadcrumbs. Even basic Organization and WebSite schema is worth adding to your homepage. Use Google's Rich Results Test to validate your markup.</p>

<h2>Quick Wins Summary</h2>
<ul>
  <li>Unique title tags on every page (50–60 chars)</li>
  <li>Meta descriptions 120–155 chars</li>
  <li>One H1 per page, logical heading hierarchy</li>
  <li>Alt text on all meaningful images</li>
  <li>Canonical tags to prevent duplicate content</li>
  <li>Open Graph tags for social sharing</li>
  <li>XML sitemap submitted to Search Console</li>
  <li>robots.txt verified — not blocking important pages</li>
  <li>LCP under 2.5s, CLS under 0.1</li>
  <li>Mobile-friendly viewport and tap targets</li>
  <li>HTTPS with 301 redirect from HTTP</li>
  <li>Basic JSON-LD schema markup</li>
</ul>

<p>The fastest way to find which of these you are missing is to run a full site audit. <strong><a href="/">SiteGrader</a></strong> checks your URL against all these criteria in seconds and gives you an actionable score — for free.</p>
    `,
  },
  {
    slug: 'how-to-improve-website-score',
    title: 'How to Improve Your Website Score: A Step-by-Step Guide',
    description:
      'Learn what website scores measure, which issues hurt you the most, and exactly how to fix them — with before-and-after examples.',
    publishedAt: '2026-03-22',
    readingTime: '8 min read',
    content: `
<p>You ran a website audit and received a score of 54 out of 100. Now what? This guide explains exactly what that number means, which issues matter most, and how to fix each one step by step.</p>

<h2>What Does a Website Score Actually Measure?</h2>
<p>A good website score is not a single arbitrary number — it is a weighted composite across several dimensions:</p>
<ul>
  <li><strong>SEO (Search Engine Optimization):</strong> Are your pages structured so that Google can understand, index, and rank them?</li>
  <li><strong>Performance:</strong> How fast does your page load, and does it meet Core Web Vitals thresholds?</li>
  <li><strong>Security:</strong> Is your site on HTTPS? Are security headers in place to protect your visitors?</li>
  <li><strong>Accessibility:</strong> Can people with disabilities use your site effectively?</li>
  <li><strong>Mobile-Friendliness:</strong> Does your site work properly on phones and tablets?</li>
</ul>
<p>Each category reveals a different kind of issue. Fixing a performance problem will not help your SEO score — you need to address each category separately.</p>

<h2>Step 1 — Fix the Missing Title Tag</h2>
<p><strong>Before:</strong> Your homepage has no <code>&lt;title&gt;</code> element, or uses a generic default like "Untitled Document".</p>
<p><strong>After:</strong> <code>&lt;title&gt;Buy Handmade Leather Wallets — CraftLeather Co.&lt;/title&gt;</code></p>
<p>A missing or generic title tag is one of the highest-impact SEO issues you can fix. Open your HTML source or CMS settings and add a unique, descriptive title for every page. Include your primary keyword near the front. The fix takes under five minutes and can meaningfully improve your organic click-through rate within weeks.</p>

<h2>Step 2 — Enable HTTPS</h2>
<p><strong>Before:</strong> Your site loads over HTTP. Browsers show a "Not Secure" warning in the address bar.</p>
<p><strong>After:</strong> All pages load over HTTPS with a valid SSL certificate. HTTP requests 301-redirect to HTTPS.</p>
<p>If your hosting provider is Vercel, Netlify, or Cloudflare Pages, HTTPS is enabled automatically. For traditional hosting, install a free Let's Encrypt certificate through your hosting control panel (cPanel, Plesk, etc.). After installing the certificate, add a redirect rule so all <code>http://</code> requests permanently redirect to <code>https://</code>.</p>

<h2>Step 3 — Improve Page Load Speed</h2>
<p><strong>Before:</strong> Your Largest Contentful Paint (LCP) is 5.2 seconds. Images are uncompressed JPEGs served from the same server as your HTML.</p>
<p><strong>After:</strong> LCP is 1.8 seconds. Images are converted to WebP, compressed to under 100KB, and served via a CDN.</p>
<p>The most effective speed improvements, in order of impact:</p>
<ol>
  <li><strong>Compress and convert images to WebP.</strong> A 2MB JPEG hero image can become a 120KB WebP with no visible quality loss. Use tools like Squoosh or ImageOptim.</li>
  <li><strong>Use a CDN.</strong> A Content Delivery Network serves your assets from a server close to your visitor. Cloudflare's free tier is a solid starting point.</li>
  <li><strong>Defer non-critical JavaScript.</strong> Add <code>defer</code> or <code>async</code> to script tags that are not needed for the initial render.</li>
  <li><strong>Enable caching headers.</strong> Set <code>Cache-Control: max-age=31536000, immutable</code> on static assets like CSS, JS, and images.</li>
</ol>

<h2>Step 4 — Add Missing Alt Text</h2>
<p><strong>Before:</strong> Your product images have no alt attributes: <code>&lt;img src="wallet.jpg"&gt;</code></p>
<p><strong>After:</strong> <code>&lt;img src="wallet.jpg" alt="Brown full-grain leather bifold wallet, open view"&gt;</code></p>
<p>Missing alt text hurts both your accessibility score and your image SEO. Open your CMS and add descriptive alt text to every image that communicates meaningful information. Be specific — "brown leather wallet" is better than "wallet," and "wallet" is better than "image1." Decorative images (backgrounds, dividers) should have an empty alt attribute.</p>

<h2>Step 5 — Add Security Headers</h2>
<p><strong>Before:</strong> Your server sends no security headers. Security scanning tools flag your site as vulnerable.</p>
<p><strong>After:</strong> Your server sends <code>X-Frame-Options</code>, <code>X-Content-Type-Options</code>, and <code>Strict-Transport-Security</code> headers on every response.</p>
<p>Security headers are HTTP response headers that instruct browsers to enable specific protections. They are easy to add in your server config, Next.js <code>next.config.js</code>, or via a CDN like Cloudflare. Even adding just <code>X-Content-Type-Options: nosniff</code> and <code>X-Frame-Options: SAMEORIGIN</code> will meaningfully improve your security score.</p>

<h2>Step 6 — Add a Viewport Meta Tag for Mobile</h2>
<p><strong>Before:</strong> Your site renders at desktop width on mobile devices. Users must pinch-to-zoom to read content.</p>
<p><strong>After:</strong> <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> is present in your <code>&lt;head&gt;</code>.</p>
<p>This single line of HTML is the minimum requirement for mobile-friendliness. Without it, your site will fail Google's mobile-first indexing and rank lower than competitors. Most modern CMS platforms and frameworks add this automatically, but older or custom sites often omit it.</p>

<h2>Prioritizing Your Fixes</h2>
<p>If you have a long list of issues, tackle them in this order:</p>
<ol>
  <li>HTTPS (security and trust)</li>
  <li>Viewport meta tag (mobile-first indexing)</li>
  <li>Title tags and meta descriptions (organic traffic)</li>
  <li>Page speed / image compression (Core Web Vitals)</li>
  <li>Alt text (accessibility and image SEO)</li>
  <li>Security headers (security score)</li>
</ol>

<p>Not sure where to start? <strong><a href="/">Run SiteGrader on your URL</a></strong> to get a prioritized list of the exact issues affecting your score right now — it takes about 10 seconds.</p>
    `,
  },
  {
    slug: 'website-security-headers-guide',
    title: 'Website Security Headers Explained: What They Are and Why You Need Them',
    description:
      'A plain-English guide to HTTP security headers — HSTS, Content-Security-Policy, X-Frame-Options, and more — including how to add them to your site.',
    publishedAt: '2026-03-29',
    readingTime: '9 min read',
    content: `
<p>Most website owners focus on SSL certificates and strong passwords. But there is another layer of browser-level security that is almost always overlooked: HTTP security headers. These are response headers your web server sends with every page, instructing the browser to enable specific protections. They cost nothing to implement and can protect your visitors from a range of attacks.</p>

<h2>What Are HTTP Security Headers?</h2>
<p>When your browser requests a webpage, the server sends back the HTML along with a set of response headers — key-value pairs that carry metadata about the response. Security headers are a subset of these that tell the browser things like: "never load this page inside a frame," "refuse to guess the content type," and "only connect to me over HTTPS for the next year."</p>
<p>Browsers enforce these instructions. An attacker cannot override them from the outside — they are your server's instructions to the browser about how to handle your content.</p>

<h2>Strict-Transport-Security (HSTS)</h2>
<p><strong>What it does:</strong> Tells the browser to only ever connect to your domain over HTTPS, for a specified period of time. Even if a user types <code>http://yoursite.com</code>, the browser will automatically upgrade to HTTPS without making the insecure request.</p>
<p><strong>Example:</strong></p>
<pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code></pre>
<p><strong>Why you need it:</strong> Without HSTS, an attacker on the same network (e.g., a coffee shop WiFi) can intercept the initial HTTP request before your server issues a redirect to HTTPS — a "SSL stripping" attack. HSTS closes this window entirely.</p>
<p><strong>How to add it:</strong> Set this header in your web server config, CDN, or framework. In Next.js, add it to the <code>headers()</code> function in <code>next.config.js</code>. Start with a short <code>max-age</code> (e.g., 86400 for one day) while testing, then increase to 31536000 (one year) once confirmed working.</p>

<h2>Content-Security-Policy (CSP)</h2>
<p><strong>What it does:</strong> Defines exactly which sources of content (scripts, styles, images, fonts, iframes) the browser is allowed to load. Any resource not on the approved list is blocked.</p>
<p><strong>Example:</strong></p>
<pre><code>Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; img-src 'self' data: https:;</code></pre>
<p><strong>Why you need it:</strong> CSP is the primary defense against Cross-Site Scripting (XSS) attacks. If an attacker manages to inject malicious JavaScript into your page (via a form field, a compromised third-party library, or a database injection), CSP can prevent that script from executing or exfiltrating data.</p>
<p><strong>How to add it:</strong> CSP is the most complex security header to configure correctly because it requires you to explicitly whitelist every source your site legitimately uses. Start with a report-only mode using <code>Content-Security-Policy-Report-Only</code> to identify what your site loads before enforcing. Use <a href="https://csp-evaluator.withgoogle.com/" rel="noopener noreferrer" target="_blank">Google's CSP Evaluator</a> to test your policy.</p>

<h2>X-Frame-Options</h2>
<p><strong>What it does:</strong> Controls whether your page can be embedded inside an <code>&lt;iframe&gt;</code> on another website.</p>
<p><strong>Example:</strong></p>
<pre><code>X-Frame-Options: SAMEORIGIN</code></pre>
<p><strong>Options:</strong></p>
<ul>
  <li><code>DENY</code> — Never allow framing from any origin</li>
  <li><code>SAMEORIGIN</code> — Allow framing only from your own domain</li>
</ul>
<p><strong>Why you need it:</strong> Without this header, an attacker can load your site invisibly inside a transparent iframe on their malicious page. They then trick users into clicking buttons on your site while thinking they are clicking something on the attacker's page — a "clickjacking" attack. For example, if your site has a "Delete account" button, a clickjacking attack could trick logged-in users into clicking it.</p>
<p><strong>How to add it:</strong> <code>X-Frame-Options: SAMEORIGIN</code> is safe for virtually all sites and takes one line to add. Note: CSP's <code>frame-ancestors</code> directive supersedes X-Frame-Options in modern browsers, but X-Frame-Options provides fallback coverage for older browsers.</p>

<h2>X-Content-Type-Options</h2>
<p><strong>What it does:</strong> Tells the browser not to "sniff" or guess the MIME type of a response — it must use the declared <code>Content-Type</code> header.</p>
<p><strong>Example:</strong></p>
<pre><code>X-Content-Type-Options: nosniff</code></pre>
<p><strong>Why you need it:</strong> Old browsers would try to detect a file's type by examining its content, even if the server declared a different type. An attacker could upload a file disguised as a harmless image that the browser would execute as JavaScript. <code>nosniff</code> tells the browser to trust the declared content type and never execute content as a different type.</p>
<p><strong>How to add it:</strong> This is one of the easiest security headers to add. It has no configuration options — just add the header and you are protected.</p>

<h2>Permissions-Policy (formerly Feature-Policy)</h2>
<p><strong>What it does:</strong> Controls which browser APIs and features your page is allowed to use — camera, microphone, geolocation, payment, fullscreen, etc.</p>
<p><strong>Example:</strong></p>
<pre><code>Permissions-Policy: camera=(), microphone=(), geolocation=()</code></pre>
<p><strong>Why you need it:</strong> If your site embeds third-party scripts or iframes (analytics, ads, widgets), those third parties could potentially access powerful browser APIs unless you explicitly restrict them. A compromised third-party script requesting your users' microphone is an attack you want to prevent at the policy level.</p>

<h2>Referrer-Policy</h2>
<p><strong>What it does:</strong> Controls how much information is included in the <code>Referer</code> header when a user clicks a link from your site to an external site.</p>
<p><strong>Example:</strong></p>
<pre><code>Referrer-Policy: strict-origin-when-cross-origin</code></pre>
<p><strong>Why you need it:</strong> If your URLs contain sensitive information (user IDs, session tokens, search queries), the full URL should not be leaked to external sites via the Referer header. <code>strict-origin-when-cross-origin</code> is the browser default in most modern browsers, but setting it explicitly ensures consistent behavior.</p>

<h2>How to Add Security Headers in Next.js</h2>
<p>In your <code>next.config.js</code> (or <code>next.config.ts</code>):</p>
<pre><code>const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}</code></pre>

<h2>Check Your Headers Now</h2>
<p>Not sure which security headers your site is currently sending (or missing)? <strong><a href="/">Run a free SiteGrader analysis</a></strong> on your URL. The security module checks for all the headers above, shows you exactly which ones are missing, and explains what each one does — with no technical knowledge required.</p>
    `,
  },
]

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
