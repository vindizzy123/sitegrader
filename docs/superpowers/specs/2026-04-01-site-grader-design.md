# SiteGrader - AI Website Diagnostic Tool Design Spec

> Date: 2026-04-01
> Status: Draft
> Goal: Build a free website grading tool that generates $700+/month through freemium subscriptions

---

## 1. Product Overview

### What It Does
User enters a URL → the tool crawls the page and generates a comprehensive diagnostic report covering SEO, performance, accessibility, security, and content quality → presented as a visual score card.

### Why It Will Work
- **Viral loop**: People naturally share and compare scores ("My site got 87/100!")
- **High-intent SEO keywords**: "website grader", "SEO checker", "site audit" have 100K+ monthly searches globally
- **Zero marginal cost**: Basic analysis is pure code, no API calls needed
- **Clear upgrade path**: Free basic report → Pro detailed report with AI suggestions

### Target Users
- Small business owners who have a website but don't know if it's good
- Indie developers / solo founders launching new products
- Bloggers and content creators optimizing their sites
- Marketing freelancers auditing client sites

### Competitive Landscape
| Competitor | Weakness We Exploit |
|------------|---------------------|
| HubSpot Website Grader | Outdated UI, pushes HubSpot CRM hard |
| GTmetrix | Too technical, overwhelming for non-devs |
| PageSpeed Insights | Google-only, no SEO/content analysis |
| Ahrefs/SEMrush | Expensive ($99+/month), enterprise-focused |

**Our positioning**: The beautiful, simple, instant website grader for non-technical people. Think "Grammarly for websites."

---

## 2. Architecture

### Tech Stack
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Fast, SEO-friendly, deploys free on Vercel |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid UI development, beautiful by default |
| Database | Supabase (PostgreSQL) | Free tier: 500MB, enough for early stage |
| Auth | Supabase Auth | Free, integrates with DB |
| Payments | Stripe | Global standard, easy integration |
| Analytics | Google Analytics 4 | GA4 for traffic and conversion tracking |
| Deployment | Vercel | Free tier handles significant traffic |
| Email | Resend | Free tier: 3000 emails/month |

### System Architecture
```
User enters URL
    ↓
Next.js API Route (serverless function)
    ↓
┌─────────────────────────────────────────┐
│         Analysis Engine (server-side)    │
│                                         │
│  1. Fetch page HTML + headers           │
│  2. Parse HTML → extract meta, links,   │
│     images, headings, etc.              │
│  3. Run scoring modules:                │
│     - SEO Score (meta tags, headings,   │
│       alt text, canonical, sitemap)     │
│     - Performance Score (page size,     │
│       image optimization, requests)     │
│     - Security Score (HTTPS, headers,   │
│       mixed content)                    │
│     - Accessibility Score (alt text,    │
│       contrast hints, ARIA, semantic)   │
│     - Mobile Score (viewport, tap       │
│       targets, font sizes)             │
│  4. Calculate overall grade (0-100)     │
│  5. Generate actionable recommendations │
│                                         │
│  [PRO ONLY] AI Deep Analysis:           │
│  - DeepSeek API for content quality     │
│  - Competitor comparison                │
│  - Personalized improvement plan        │
└─────────────────────────────────────────┘
    ↓
Results Page (shareable URL with unique ID)
    ↓
Store in Supabase (for history + analytics)
```

### Key Technical Decisions
- **Server-side crawling**: Use `fetch()` on the server to get HTML. No headless browser needed for MVP (keeps it fast and free).
- **No Puppeteer/Playwright for V1**: Avoid heavy dependencies. Parse raw HTML for most checks. Add browser rendering in V2 if needed.
- **Score caching**: Cache results for 24h per URL to avoid abuse and reduce load.
- **Rate limiting**: Free users: 3 scans/day. Pro users: unlimited.

---

## 3. Features

### Free Tier (drives traffic + virality)
- Overall score (0-100) with letter grade (A+, A, B, C, D, F)
- 5 category scores (SEO, Performance, Security, Accessibility, Mobile)
- Top 5 issues with brief explanations
- Shareable results page (unique URL)
- Score badge/image for social sharing
- 3 scans per day

### Pro Tier ($9.99/month or $79.99/year)
- Unlimited scans
- Full detailed report (30+ checks per category)
- AI-powered content analysis and copywriting suggestions
- Competitor comparison (scan 2 sites side by side)
- Weekly monitoring (auto-scan and alert on score changes)
- PDF export of reports
- Priority scanning (faster queue)
- No ads

### Scoring Modules Detail

#### SEO Score (25 points)
- Title tag exists and proper length (50-60 chars)
- Meta description exists and proper length (150-160 chars)
- H1 tag exists and is unique
- Heading hierarchy (H1→H2→H3)
- Image alt text coverage
- Internal/external link ratio
- Canonical URL present
- Open Graph / Twitter Card tags
- robots.txt accessible
- Sitemap.xml accessible
- URL structure (clean, no parameters)
- Keyword density hints

#### Performance Score (25 points)
- Total page size (< 3MB good, < 1MB great)
- Number of HTTP requests
- Image optimization (format, compression)
- CSS/JS file count and size
- Gzip/Brotli compression enabled
- Cache headers present
- Render-blocking resources

#### Security Score (20 points)
- HTTPS enabled
- HSTS header present
- Content-Security-Policy header
- X-Frame-Options header
- X-Content-Type-Options header
- Mixed content check
- Server version exposure

#### Accessibility Score (15 points)
- Image alt attributes
- Form labels present
- Language attribute on html tag
- Semantic HTML usage (nav, main, article, etc.)
- Link text descriptiveness (no "click here")
- Color contrast hints (based on CSS analysis)

#### Mobile Score (15 points)
- Viewport meta tag
- Font size >= 16px base
- Tap target sizing hints
- Responsive images (srcset)
- No horizontal scroll indicators

---

## 4. Pages & UI

### Page Structure
```
/                    → Landing page + URL input + marketing
/report/[id]         → Results page (shareable)
/pricing             → Pro plan details
/login               → Auth (email magic link)
/dashboard           → Pro user dashboard (scan history, monitoring)
/blog                → SEO content (programmatic + editorial)
/blog/[slug]         → Individual blog post
/compare             → Pro: side-by-side comparison
```

### Landing Page Design Philosophy
- Hero: giant URL input bar (like Google search, the tool IS the landing page)
- Below: real-time counter "X websites graded today"
- Social proof: example report screenshots
- Comparison section: us vs competitors
- FAQ section (SEO-optimized)
- Footer with blog links

### Results Page Design
- Big circular score gauge (animated, satisfying)
- Letter grade with color (A+ = green, F = red)
- 5 category cards with individual scores
- Expandable issue list with severity indicators
- "Share your score" button (generates social image)
- CTA: "Want the full report? Upgrade to Pro"
- Related: "Check another site" input

### Design Principles
- Clean, modern, fast (< 2s page load)
- Mobile-first responsive design
- Dark mode support
- Micro-animations for engagement (score counting up, gauges filling)
- Professional but approachable (not enterprise-stuffy)

---

## 5. Monetization

### Revenue Model
| Source | Expected Monthly | Timeline |
|--------|-----------------|----------|
| Pro subscriptions ($9.99/mo) | $500-2000 | Month 2-4 |
| Annual plans ($79.99/yr) | $200-500 | Month 3+ |
| Google AdSense (free tier) | $100-500 | Month 2+ |
| Affiliate links (hosting, SEO tools) | $100-300 | Month 2+ |

### Pricing Strategy
- **Free tier is generous enough to be genuinely useful** → drives word-of-mouth
- **Pro tier solves real pain** → detailed reports, monitoring, no ads
- **Annual discount (33% off)** → improves retention and cash flow
- Consider lifetime deal ($149) for early adopters on AppSumo/Product Hunt

### Path to $700/month
Conservative: 40 Pro users × $9.99 + $300 ads = $700
Realistic: 70 Pro users × $9.99 = $700
Optimistic: 100+ Pro users × $9.99 + ads + affiliate = $1500+

---

## 6. Growth Strategy

### Phase 1: Launch (Week 1-2)
1. Build MVP with free tier features
2. Deploy on Vercel with custom domain
3. Submit to Google Search Console
4. Launch on Product Hunt
5. Post on Hacker News "Show HN"
6. Share on Reddit (r/webdev, r/SEO, r/smallbusiness, r/SideProject)
7. Share on Twitter/X with demo

### Phase 2: SEO (Week 3-8)
1. Programmatic SEO: generate pages like "/grade/example.com" for popular sites
2. Blog content targeting long-tail keywords:
   - "How to improve your website SEO score"
   - "Website audit checklist 2026"
   - "Is my website mobile friendly"
   - "[competitor] alternative" pages
3. Submit to web tool directories (AlternativeTo, Product Hunt, etc.)

### Phase 3: Conversion (Month 2-3)
1. Analyze free-to-pro conversion data
2. A/B test pricing and feature gates
3. Add email capture (weekly SEO tips newsletter)
4. Implement referral program ("Give Pro, Get Pro")

### Phase 4: Scale (Month 3+)
1. Add more analysis modules based on user requests
2. Launch Product 2 (AI Email Writer) if Product 1 validates
3. Consider API access for developers
4. Explore white-label for agencies

---

## 7. User Operations Guide (For the Non-Technical Partner)

### What You Need To Do (Daily, ~30 min)
- Check Stripe dashboard for new subscriptions
- Check Google Analytics for traffic trends
- Reply to any support emails (rare for self-serve tool)

### What You Need To Do (Weekly, ~1 hour)
- Review which pages/features get most traffic
- Report findings to Claude for optimization
- Post 1-2 updates on social media (I'll write the content)

### What You Need To Do (Monthly, ~2 hours)
- Transfer Stripe balance to Wise → Chinese bank
- Review monthly revenue and growth metrics
- Plan next month's priorities with Claude

### What You Will NEVER Need To Do
- Write code
- Design anything
- Handle technical issues
- Write English content (Claude does all of this)

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| No traffic after launch | Medium | High | Multiple launch channels + SEO investment |
| Low free-to-pro conversion | Medium | Medium | A/B test pricing, adjust feature gates |
| Vercel free tier limits hit | Low | Low | Upgrade to $20/month when revenue supports it |
| Competitor copies us | Low | Low | Move fast, build brand, add AI features |
| Stripe account issues (China) | Medium | High | Apply early, consider Lemon Squeezy or Paddle as alternatives; Wise business account as backup payment processor |
| DeepSeek API becomes expensive | Very Low | Low | AI features are Pro-only, revenue covers cost |

---

## 9. Success Metrics

### Month 1
- Product live and functional
- 1,000+ free scans completed
- 10+ Pro subscribers
- Product Hunt launch done

### Month 3
- 10,000+ free scans/month
- 50+ Pro subscribers ($500/month)
- Top 20 Google ranking for "website grader" long-tail keywords

### Month 6
- 50,000+ free scans/month
- 100+ Pro subscribers ($1000/month)
- Product 2 launched
- Combined revenue: $1500+/month

---

## 10. Development Phases

### V1 - MVP (Week 1, ~5 days of Claude coding)
- Landing page with URL input
- Basic analysis engine (HTML parsing, all 5 categories)
- Results page with scores and top issues
- Shareable results URL
- Mobile responsive
- Google Analytics integration

### V1.1 - Monetization (Week 2)
- Stripe integration
- Pro tier with detailed reports
- User auth (Supabase magic link)
- Rate limiting (3 free scans/day)
- Google AdSense integration

### V1.2 - Growth (Week 3-4)
- Blog system for SEO content
- Social sharing images (auto-generated OG images)
- Email capture + welcome sequence
- Programmatic SEO pages

### V2 - AI Features (Month 2)
- DeepSeek AI content analysis
- AI-powered improvement suggestions
- Competitor comparison
- Weekly monitoring alerts

---

## 11. Cost Structure

### Monthly Costs (First 3 months)
| Item | Cost |
|------|------|
| Domain (.app or .io) | ~$1/month (paid annually $10-15) |
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| Resend (email) | $0 (free tier) |
| DeepSeek API (Pro AI features) | ~$5-10/month |
| Stripe fees | 2.9% + $0.30 per transaction |
| **Total** | **~$10-15/month** |

### Break-even: 2 Pro subscribers covers all costs.

---

## 12. Naming & Domain

### Name Candidates
1. **SiteGrader** - sitegrader.app / sitegrader.io
2. **GradeMySite** - grademysite.com
3. **PageScore** - pagescore.app
4. **WebGrader** - webgrader.app
5. **SiteCheck** - sitecheck.pro

Final name to be determined after domain availability check in first implementation step.

---

*Spec authored by Claude Opus 4.6 | 2026-04-01*
