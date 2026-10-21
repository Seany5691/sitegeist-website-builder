const fs = require('fs')
const p = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Website Builder/lib/boilerplate-generator.ts'
let t = fs.readFileSync(p, 'utf8')

const MARK = 'function generateSubPage(slug: string, label: string): string {'
const idx = t.indexOf(MARK)
if (idx < 0) { console.log('generateSubPage not found'); process.exit(1) }

// Build the helper as an array of lines using JSON.stringify for each emitted line,
// so there is no nested-template-literal escaping to get wrong.
const Q = (s) => JSON.stringify(s)

const emittedLines = [
  "import type { Metadata } from 'next'",
  "import dynamic from 'next/dynamic'",
  "import { buildPageMetadata } from '@/lib/page-meta'",
  "import { loadJSON } from '@/lib/blob-storage'",
  "import { isPageEnabled } from '@/lib/control-flags'",
  '',
  "const Header = dynamic(() => import('@/components/Header'), { ssr: false })",
  "const PageHero = dynamic(() => import('@/components/PageHero'), { ssr: false })",
  "const Body = dynamic(() => import('@/components/COMPONENT'), { ssr: false })",
  "const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })",
  "const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })",
  "const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })",
  "const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })",
  '',
  'export async function generateMetadata(): Promise<Metadata> {',
  "  return buildPageMetadata('home' as any, 'LABEL | Website', '/SLUG')",
  '}',
  '',
  'export default function Page() {',
  '  return (',
  '    <>',
  '      <Header />',
  '      <main className="pt-20">',
  '        <PageHero page="SLUG" fallbackTitle="LABEL" fallbackSubtitle="" fallbackImage="" />',
  '        <PageGate pageKey="PAGEKEY">',
  '          <Body />',
  '        </PageGate>',
  '      </main>',
  '      <Contact />',
  '      <Footer />',
  '      <WhatsAppWidget />',
  '      <ScrollToTop />',
  '    </>',
  '  )',
  '}',
  '',
  'function PageGate({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {',
  '  return <PageGateInner pageKey={pageKey}>{children}</PageGateInner>',
  '}',
  '',
  'async function PageGateInner({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {',
  "  const config: any = (await loadJSON('site-config.json')) || {}",
  '  if (!isPageEnabled(config, pageKey)) {',
  '    return (',
  '      <div className="section-padding text-center">',
  '        <p style={{ color: \'var(--color-muted)\' }}>This page is not available.</p>',
  '      </div>',
  '    )',
  '  }',
  '  return <>{children}</>',
  '}',
]

// Emit the helper function that returns a page string with placeholders replaced.
const helperLines = [
  '/**',
  ' * Full Control System page — Team / Blog / Reviews / FAQ / Areas / Privacy.',
  ' * Header + PageHero + page component + Contact + Footer.',
  ' * If the client turns the page off in Settings, PageGate shows a graceful',
  ' * notice (the nav link is already hidden by the section registry).',
  ' */',
  'function generateControlPage(slug: string, label: string, component: string, pageKey: string): string {',
  '  const raw = [',
  ...emittedLines.map((l) => `    ${Q(l)},`),
  '  ].join("\\n")',
  '  return raw',
  "    .split('COMPONENT').join(component)",
  "    .split('LABEL').join(label)",
  "    .split('SLUG').join(slug)",
  "    .split('PAGEKEY').join(pageKey)",
  '}',
  '',
]

const dispatch = [
  MARK,
  '  // Full Control System pages dispatch to the shared generator',
  '  const controlComponents: Record<string, { comp: string; pageKey: string }> = {',
  "    team: { comp: 'TeamPage', pageKey: 'teamPage' },",
  "    blog: { comp: 'BlogPage', pageKey: 'blogPage' },",
  "    reviews: { comp: 'ReviewsPage', pageKey: 'reviewsPage' },",
  "    faq: { comp: 'Faq', pageKey: 'faqPage' },",
  "    areas: { comp: 'AreasPage', pageKey: 'areasPage' },",
  "    privacy: { comp: 'PrivacyContent', pageKey: 'privacy' },",
  '  }',
  '  if (controlComponents[slug]) {',
  '    const c = controlComponents[slug]',
  '    return generateControlPage(slug, label, c.comp, c.pageKey)',
  '  }',
].join('\n')

t = t.slice(0, idx) + helperLines.join('\n') + '\n' + dispatch + t.slice(idx + MARK.length)
fs.writeFileSync(p, t, 'utf8')
console.log('generateControlPage + dispatch written')

const check = fs.readFileSync(p, 'utf8')
console.log('generateControlPage:', check.includes('function generateControlPage('))
console.log('dispatch:', check.includes('controlComponents'))
console.log('TeamPage:', check.includes("team: { comp: 'TeamPage'"))
console.log('generateSubPage:', check.includes('function generateSubPage('))
console.log('portfolio branch still there:', check.includes("slug === 'portfolio'"))
