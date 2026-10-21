const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/templates/components'

const SHELL = (title, eyebrow, bodyImport, bodyJsx, subtitle) => `'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
${bodyImport}

/**
 * ${title} page — full-page view. Renders nothing when there is no content,
 * so turning the page on with no data never shows a broken block.
 */
export default function ${title.replace(/\s/g, '')}Page() {
  const { config } = useSiteData()
  if (!config) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-accent)' }}
          >
            ${eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
          >
            ${title}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            ${subtitle}
          </p>
        </AnimateOnScroll>
        ${bodyJsx}
      </div>
    </section>
  )
}
`

const files = {
  'team/TeamPage.tsx': SHELL(
    'Our Team',
    'The people behind the business',
    "import TeamSection from '@/components/TeamSection'",
    '<TeamSection />',
    'Meet the people who make it happen.'
  ),
  'blog/BlogPage.tsx': SHELL(
    'Blog',
    'News, tips and updates',
    "import BlogStrip from '@/components/BlogStrip'",
    '<BlogStrip />',
    'Our latest articles and announcements.'
  ),
  'reviews/ReviewsPage.tsx': SHELL(
    'Reviews',
    'What our customers say',
    "import Testimonials from '@/components/Testimonials'",
    '<Testimonials />',
    'Real feedback from real customers, wherever they left it.'
  ),
  'areas/AreasPage.tsx': SHELL(
    'Areas We Serve',
    'Where we work',
    "import AreasServed from '@/components/AreasServed'",
    '<AreasServed />',
    'Towns and suburbs we cover.'
  ),
}

// PrivacyContent is plain server-safe text — no data needed.
files['privacy/PrivacyContent.tsx'] = `'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Privacy Policy page — auto-generated boilerplate the client can hand to
 * their own counsel. Kept plain and readable.
 */
export default function PrivacyContent() {
  const { config } = useSiteData()
  const business = config?.businessName || 'This business'
  const updated = config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString('en-ZA') : 'the date of publication'

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
            Legal
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
          >
            Privacy Policy
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            Last updated {updated}
          </p>
        </AnimateOnScroll>

        <div style={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            Who we are
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            {business} operates this website. This policy explains what information we collect
            and how we use it.
          </p>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            What we collect
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            When you contact us through this website we collect the details you provide —
            typically your name, email address, phone number and the content of your message.
          </p>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            How we use it
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            We use this information only to respond to your enquiry and to provide the
            services you asked about. We do not sell your personal information.
          </p>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            Cookies and analytics
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            This website may use cookies and analytics to understand how visitors use the
            site so we can improve it. You can disable cookies in your browser settings.
          </p>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            Your rights
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            You may ask us to see, correct or delete the personal information we hold about
            you at any time. Contact us using the details on this website.
          </p>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
            Contact
          </h3>
          <p style={{ color: 'var(--color-muted)' }}>
            Questions about this policy? Reach us through the contact page.
          </p>
        </div>
      </div>
    </section>
  )
}
`

let n = 0
for (const [rel, content] of Object.entries(files)) {
  const p = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content, 'utf8')
  console.log('WROTE', rel)
  n++
}
console.log(n, 'page components created')
