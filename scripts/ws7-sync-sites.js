const fs = require('fs')
const path = require('path')

const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem'
const WB = path.join(ROOT, 'Website Builder')
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop']

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
}
function copyDir(src, dst, filter) {
  if (!fs.existsSync(src)) return 0
  let n = 0
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) { n += copyDir(s, d, filter); continue }
    if (filter && !filter(e.name, s)) continue
    copyFile(s, d)
    n++
  }
  return n
}

// Build a page file as an array of lines — no template-literal escaping to go wrong.
function buildPage(slug, label, comp) {
  return [
    "import type { Metadata } from 'next'",
    "import dynamic from 'next/dynamic'",
    "import { buildPageMetadata } from '@/lib/page-meta'",
    '',
    "const Header = dynamic(() => import('@/components/Header'), { ssr: false })",
    "const PageHero = dynamic(() => import('@/components/PageHero'), { ssr: false })",
    `const Body = dynamic(() => import('@/components/${comp}'), { ssr: false })`,
    "const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })",
    "const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })",
    "const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })",
    "const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })",
    '',
    'export async function generateMetadata(): Promise<Metadata> {',
    `  return buildPageMetadata('home' as any, '${label} | Website', '/${slug}')`,
    '}',
    '',
    'export default function Page() {',
    '  return (',
    '    <>',
    '      <Header />',
    '      <main className="pt-20">',
    `        <PageHero page="${slug}" fallbackTitle="${label}" fallbackSubtitle="" fallbackImage="" />`,
    '        <Body />',
    '      </main>',
    '      <Contact />',
    '      <Footer />',
    '      <WhatsAppWidget />',
    '      <ScrollToTop />',
    '    </>',
    '  )',
    '}',
    '',
  ].join('\n')
}

function buildHome() {
  return [
    "'use client'",
    '',
    "import dynamic from 'next/dynamic'",
    "import SectionRenderer from '@/components/SectionRenderer'",
    "import { FeatureHost } from '@/components/features/FeatureHost'",
    '',
    "const Header = dynamic(() => import('@/components/Header'), { ssr: false })",
    "const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })",
    "const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })",
    "const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })",
    '',
    'export default function Home() {',
    '  return (',
    '    <>',
    '      <FeatureHost placement="top-banner" />',
    '      <Header />',
    '      <FeatureHost placement="header" />',
    '      <main>',
    '        <SectionRenderer />',
    '      </main>',
    '      <Footer />',
    '      <FeatureHost placement="footer" />',
    '      <FeatureHost placement="floating" />',
    '      <FeatureHost placement="modal" />',
    '      <WhatsAppWidget />',
    '      <ScrollToTop />',
    '    </>',
    '  )',
    '}',
    '',
  ].join('\n')
}

console.log('=== WS7 — push Full Control System to 3 sites ===\n')

const pageMap = [
  ['team', 'Our Team', 'TeamPage', 'teamPage'],
  ['blog', 'Blog', 'BlogPage', 'blogPage'],
  ['reviews', 'Reviews', 'ReviewsPage', 'reviewsPage'],
  ['faq', 'FAQ', 'Faq', 'faqPage'],
  ['areas', 'Areas We Serve', 'AreasPage', 'areasPage'],
  ['privacy', 'Privacy Policy', 'PrivacyContent', 'privacy'],
]

for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  console.log('--- ' + site + ' ---')
  let count = 0

  // 1. Platform libs
  for (const f of ['section-registry.ts', 'feature-registry.ts', 'control-flags.ts', 'leads.ts', 'schema.ts', 'geo-audit.ts', 'view-tracker.ts', 'site-url.ts', 'logo-engine.ts', 'email-html.ts', 'page-meta.ts', 'robots-ua-list.ts', 'supabase-server.ts', 'schema-types.ts']) {
    const s = path.join(WB, 'templates', 'backend', 'lib', f)
    if (fs.existsSync(s)) { copyFile(s, path.join(base, 'lib', f)); count++ }
  }

  // 2. SectionRenderer
  copyFile(path.join(WB, 'templates', 'backend', 'components', 'SectionRenderer.tsx'), path.join(base, 'components', 'SectionRenderer.tsx'))
  count++

  // 3. New section + page components (flat into components/)
  for (const folder of ['team', 'blog', 'reviews', 'areas', 'privacy', 'stats', 'process', 'trust', 'partners', 'location', 'hours', 'awards', 'social', 'newsletter']) {
    count += copyDir(path.join(WB, 'templates', 'components', folder), path.join(base, 'components'), (n) => n.endsWith('.tsx'))
  }
  for (const f of ['BeforeAfter.tsx', 'LatestWork.tsx']) {
    const s = path.join(WB, 'templates', 'components', 'gallery', f)
    if (fs.existsSync(s)) { copyFile(s, path.join(base, 'components', f)); count++ }
  }

  // 4. Feature components (keep features/ subfolder — avoids name clashes)
  count += copyDir(path.join(WB, 'templates', 'components', 'features'), path.join(base, 'components', 'features'), (n) => n.endsWith('.tsx'))

  // 5. New app pages
  for (const [slug, label, comp, _pk] of pageMap) {
    fs.mkdirSync(path.join(base, 'app', slug), { recursive: true })
    fs.writeFileSync(path.join(base, 'app', slug, 'page.tsx'), buildPage(slug, label, comp), 'utf8')
    count++
  }

  // 6. Registry-driven homepage
  fs.writeFileSync(path.join(base, 'app', 'page.tsx'), buildHome(), 'utf8')
  count++

  // 7. Dashboard
  copyFile(path.join(WB, 'templates', 'dashboard', 'index.html'), path.join(base, 'public', 'dashboard', 'index.html'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'app.js'), path.join(base, 'public', 'dashboard', 'assets', 'app.js'))
  copyFile(path.join(WB, 'templates', 'dashboard', 'assets', 'styles.css'), path.join(base, 'public', 'dashboard', 'assets', 'styles.css'))
  count += 3

  console.log('   ' + count + ' files synced')
}

// 8. Add controls defaults to site-config
console.log('\n--- adding controls defaults ---')
for (const site of SITES) {
  for (const rel of ['public/site-config.json', 'site-config.json']) {
    const p = path.join(ROOT, 'Websites', site, rel)
    if (!fs.existsSync(p)) continue
    const cfg = JSON.parse(fs.readFileSync(p, 'utf8'))
    if (cfg.controls) { console.log('   ' + site + '/' + rel + ' already has controls'); continue }
    cfg.controls = {
      sections: {
        hero: true, statsBar: false, services: true, process: false, gallery: true,
        beforeAfter: false, latestWork: false, testimonials: true, trustBadges: false,
        about: true, team: false, partners: false, video: false, serviceAreas: true,
        location: true, hours: true, pricing: false, faq: true, blogStrip: false,
        awards: false, instagram: false, newsletter: false, cta: true,
      },
      pages: {
        home: true, services: true, portfolio: true, about: true, contact: true,
        privacy: true, teamPage: false, blogPage: false, faqPage: false,
        reviewsPage: false, areasPage: false, serviceDetailPages: false,
      },
      features: {
        announcementBanner: false, stickyCallBar: true, whatsappFab: true,
        newsletterPopup: false, clickToCallFab: false, trustBadges: false,
        areasServedStrip: true, photoLightbox: true, beforeAfter: false,
        stickyHeader: true, scrollProgress: false, quoteSlideIn: false, cookieBar: false,
      },
    }
    if (!cfg.featureData) cfg.featureData = {}
    fs.writeFileSync(p, JSON.stringify(cfg, null, 2), 'utf8')
    console.log('   ' + site + '/' + rel + ' controls added')
  }
}

// 9. Strip BOMs
console.log('\n--- stripping BOMs ---')
let stripped = 0
for (const site of SITES) {
  const base = path.join(ROOT, 'Websites', site)
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (['node_modules', '.next', '.vercel'].includes(e.name)) continue
        walk(path.join(d, e.name))
      } else if (/\.(ts|tsx|js|json|html|css)$/.test(e.name)) {
        const f = path.join(d, e.name)
        const b = fs.readFileSync(f)
        if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
          fs.writeFileSync(f, b.slice(3))
          stripped++
        }
      }
    }
  }
  walk(base)
}
console.log('   ' + stripped + ' BOMs stripped')
console.log('\n=== WS7 SYNC COMPLETE ===')
