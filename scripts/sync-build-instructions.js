const fs = require('fs');
const ROOT = 'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem';
const SITES = ['missions_ablaze', 'mamma_mia_cakes_and_catering', 'tammy_s_sticker_shop'];

// ── technical-rules.md — the authoritative current text ──────────────────────
const technicalRules = `# Technical Rules — MANDATORY

These rules prevent build failures. Read this file BEFORE writing any code.

## Rule 1: Framer Motion SSR Safety (CRITICAL)

framer-motion CANNOT run on the server. If ANY component using motion.* is rendered during
Next.js static generation, the build crashes.

### Rule 1A — Dynamic imports for animated components:

\`\`\`tsx
'use client'
import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const Faq = dynamic(() => import('@/components/Faq'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
\`\`\`

### Rule 1B — "use client" on every animated component

### Rule 1C — NEVER use static imports for animated components

### Rule 1D — app/page.tsx MUST use this pattern (Section Registry composition):

The homepage does NOT hardcode sections. \`SectionRenderer\` reads the Section
Registry at runtime and renders whatever the client has switched on in the
dashboard. \`FeatureHost\` mounts the premium feature widgets into placement slots.

\`\`\`tsx
'use client'
import dynamic from 'next/dynamic'
import SectionRenderer from '@/components/SectionRenderer'
import FeatureHost from '@/components/features/FeatureHost'
import WhatsAppGate from '@/components/WhatsAppGate'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export default function Home() {
  return (
    <>
      <FeatureHost placement="top-banner" />
      <Header />
      <FeatureHost placement="header" />
      <main>
        <SectionRenderer />
        <FeatureHost placement="inline" />
      </main>
      <Footer />
      <FeatureHost placement="footer" />
      <FeatureHost placement="floating" />
      <FeatureHost placement="modal" />
      <WhatsAppGate><WhatsAppWidget /></WhatsAppGate>
      <ScrollToTop />
    </>
  )
}
\`\`\`

CRITICAL — every \`FeatureHost\` placement slot must stay mounted. The slots are
\`top-banner\`, \`header\`, \`inline\`, \`footer\`, \`floating\`, \`modal\`. If you drop
one, every feature assigned to that slot silently renders nothing.

NEVER list sections individually in app/page.tsx. NEVER reorder them there —
the client reorders from the dashboard via \`controls.sectionOrder\`.

## Rule 2: NEVER import from next/document

NEVER import Html, Head, Main, NextScript from 'next/document'.
The layout.tsx already handles <html> and <body>.

## Rule 3: NO ERROR PAGES

Do NOT create: app/error.tsx, app/404.tsx, app/500.tsx, app/not-found.tsx

## Rule 4: APP ROUTER ONLY

All pages go in app/ directory (NOT pages/).

## Rule 5: Dashboard page is ALREADY created — DO NOT modify

## Rule 6: Stock Images for Clean Builds

When no scraped images exist, use Unsplash stock images. NEVER use gradient placeholders.

## Rule 8: API Routes are ALREADY created — DO NOT modify

These routes already exist and are managed by the platform:
- app/api/contact/route.ts (Resend lead delivery + Supabase logging)
- app/api/leads/route.ts (dashboard lead list / mark-read)
- app/api/leads/[id]/redeliver/route.ts (redeliver to inbox)
- app/api/leads/test/route.ts (send test lead)
- app/api/geo-audit/route.ts (pre-launch GEO checklist)
- app/api/save-config, app/api/upload, app/api/site-data, app/api/auth/*
DO NOT modify, recreate, or overwrite these files.

## Rule 8B: Platform SEO / GEO files are ALREADY created — DO NOT modify

These files are auto-generated and serve AI/search crawlers:
- app/robots.ts (search + AI crawler allowlist)
- app/sitemap.ts (dynamic XML sitemap)
- app/llms.txt/route.ts and app/llms-full.txt/route.ts (AI-readable business summary)
- app/opengraph-image.tsx (branded social preview)
- app/rss.xml/route.ts (RSS feed)
- app/layout.tsx JSON-LD scripts (LocalBusiness / FAQPage / Service / speakable)
DO NOT modify, recreate, or overwrite these files. To change what they contain,
edit public/site-config.json only.

## Rule 8C: Platform library files are ALREADY created — DO NOT modify

- lib/leads.ts, lib/supabase-server.ts, lib/email-html.ts (lead pipeline)
- lib/schema.ts, lib/schema-types.ts (JSON-LD builders)
- lib/robots-ua-list.ts, lib/geo-audit.ts, lib/page-meta.ts
- lib/site-url.ts, lib/view-tracker.ts, lib/logo-engine.ts
DO NOT modify, recreate, or overwrite these files.

## Rule 8D: Full Control System is ALREADY created — DO NOT modify

The site's section list is driven at RUNTIME by the Section Registry. The client
switches sections on/off from the dashboard. Nothing is hardcoded in page.tsx.

DO NOT modify or recreate:
- lib/section-registry.ts, lib/feature-registry.ts, lib/control-flags.ts
- components/SectionRenderer.tsx, components/PageHero.tsx
- components/WhatsAppGate.tsx, components/VideoEmbed.tsx
- components/features/FeatureHost.tsx and every components/features/*.tsx
- components/TeamSection.tsx, TeamPage.tsx, BlogStrip.tsx, BlogPage.tsx
- components/ReviewsPage.tsx, AreasPage.tsx, PrivacyContent.tsx
- components/StatsBar.tsx, ProcessSteps.tsx, BeforeAfter.tsx, LatestWork.tsx
- components/TrustBadges.tsx, PartnersStrip.tsx, AreasServed.tsx
- components/LocationMap.tsx, BusinessHours.tsx, AwardsPress.tsx
- components/SocialFeed.tsx, NewsletterBlock.tsx
- components/PricingTable.tsx, CtaBanner.tsx, VslPlayer.tsx

CRITICAL RULES:
1. app/page.tsx renders <SectionRenderer /> + <FeatureHost placement="..." /> —
   do NOT hardcode section lists. See Rule 1D for the exact file.
2. app/team, app/blog, app/reviews, app/faq, app/areas, app/privacy already
   exist. Do NOT recreate them.
3. site-config.json "controls" drives what is visible (controls.sections,
   controls.pages, controls.features, controls.sectionOrder). Do NOT edit it to
   force sections on — the client controls that from the dashboard.
4. If a section is switched off, the site re-flows automatically. Never leave
   placeholder markup for a hidden section.
5. You write ONLY the design-variant components: Hero, Services, Gallery,
   Testimonials, Faq, About, Contact, Header, Footer. Pick the variant that
   matches this business's archetype and write it to the canonical flat path
   (e.g. components/Hero.tsx). Everything else in the control system is
   platform-owned and already shipped.

## Rule 9: Components MUST fetch data at runtime

Components use useSiteData() to fetch from site-config.json and image-map.json.
NEVER hardcode services, testimonials, or gallery images in components.

## Rule 10: Zero Hardcoded Copywriting

EVERY piece of text MUST come from site-config.json.
Components read it via: const { config } = useSiteData()

## Pre-Built Components (DO NOT modify)

These are already in the project:
- components/Hero.tsx, Services.tsx, Gallery.tsx, Testimonials.tsx
- Faq.tsx, Contact.tsx, About.tsx, Footer.tsx, Header.tsx
- WhatsAppWidget.tsx, AnimateOnScroll.tsx, ScrollToTop.tsx
- CtaBanner.tsx, PricingTable.tsx, VslPlayer.tsx

They read from site-config.json via useSiteData() at runtime.
DO NOT modify, recreate, or overwrite these files.`;

// ── data-schemas.md appendix — the Full Control System config shape ──────────
const controlsAppendix = `

---

# Full Control System — config shape

The website reads these keys at RUNTIME from \`public/site-config.json\`.
The dashboard writes them. They are what make sections/pages/features switchable.

\`\`\`json
{
  "controls": {
    "sections": {
      "hero": true, "statsBar": false, "services": true, "process": false,
      "gallery": true, "beforeAfter": false, "latestWork": false,
      "testimonials": true, "trustBadges": false, "about": true, "team": false,
      "partners": false, "video": false, "serviceAreas": true, "location": true,
      "hours": true, "pricing": false, "faq": true, "blogStrip": false,
      "awards": false, "instagram": false, "newsletter": false, "vsl": false,
      "cta": true
    },
    "sectionOrder": ["hero", "statsBar", "services", "process", "gallery",
      "beforeAfter", "latestWork", "testimonials", "trustBadges", "about",
      "team", "partners", "video", "serviceAreas", "location", "hours",
      "pricing", "faq", "blogStrip", "awards", "instagram", "newsletter",
      "vsl", "cta"],
    "pages": {
      "home": true, "services": true, "portfolio": true, "about": true,
      "contact": true, "teamPage": false, "blogPage": false,
      "reviewsPage": false, "faqPage": false, "areasPage": false,
      "privacy": true, "terms": true
    },
    "features": {
      "announcementBanner": false, "stickyCallBar": true, "whatsappFab": true,
      "newsletterPopup": false, "clickToCallFab": false, "trustBadges": false,
      "areasServedStrip": true, "photoLightbox": true, "beforeAfter": false,
      "stickyHeader": true, "scrollProgress": false, "quoteSlideIn": false,
      "cookieBar": true
    }
  },

  "processLayout": "steps",
  "process": [
    { "step": 1, "title": "First contact", "description": "...", "image": "" }
  ],

  "caseStudies": [
    { "title": "...", "description": "...", "image": "", "url": "", "tags": "" }
  ],

  "partners": { "title": "Who we work with", "items": [{ "name": "Toyota", "logo": "", "url": "" }] },

  "awards": [
    { "title": "...", "organization": "...", "year": "2025", "description": "...", "url": "" }
  ],

  "stats": [{ "value": "30+", "label": "Years in business" }],

  "videos": [{ "url": "https://youtu.be/...", "title": "..." }],

  "businessHours": [{ "day": "monday", "open": "08:00", "close": "17:00", "closed": false }],

  "newsletter": { "headline": "...", "body": "...", "ctaLabel": "Subscribe" },

  "featureData": {
    "vsl": {
      "headline": "...", "subheadline": "...",
      "videoUrl": "", "videoUpload": "", "poster": "",
      "size": "medium",
      "autoplay": true, "delaySeconds": 2, "showControls": true,
      "ctaLabel": "", "ctaUrl": ""
    },
    "trustBadges": {
      "title": "...", "showFrame": true, "size": "medium",
      "badges": [{ "label": "Toyota", "icon": "", "image": "", "url": "" }]
    },
    "announcementBanner": {
      "text": "...", "linkUrl": "", "linkLabel": "",
      "startsAt": "", "endsAt": "", "dismissible": true,
      "bgColor": "", "textColor": "", "size": "comfortable"
    }
  },

  "navigation": {
    "home": "Home", "services": "Services", "portfolio": "Portfolio",
    "about": "About", "contact": "Contact",
    "team": "Team", "blog": "Blog", "reviews": "Reviews",
    "faq": "FAQ", "areas": "Areas",
    "navProcess": "Process", "navLatestWork": "Latest Work",
    "navPartners": "Partners", "navAwards": "Awards",
    "navSocial": "Social", "navNewsletter": "Newsletter",
    "navStats": "Stats", "navVideo": "Video", "navHours": "Hours",
    "showInMenu": {
      "process": false, "latestWork": false, "partners": false,
      "awards": false, "instagram": false, "newsletter": false,
      "statsBar": false, "video": false, "hours": false
    }
  }
}
\`\`\`

## How these keys are used

| Key | Read by | Meaning |
|---|---|---|
| \`controls.sections.*\` | \`SectionRenderer\` via \`renderableSections()\` | ON = that homepage section renders. OFF = it is skipped and the page re-flows. |
| \`controls.sectionOrder\` | \`SectionRenderer\` | Homepage render order. \`hero\` is always first, \`cta\` always last. |
| \`controls.pages.*\` | \`isPageEnabled()\`, \`siteNavLinks()\` | ON = that page route works and its nav link appears. |
| \`controls.features.*\` | \`FeatureHost\` via \`isFeatureEnabled()\` | ON = that premium feature widget mounts in its placement slot. |
| \`processLayout\` | \`ProcessSteps\` | \`steps\` \\| \`timeline\` \\| \`cards\` — how the process section is laid out. |
| \`featureData.*\` | the matching feature/section component | Per-feature edit payload written by the dashboard Features tab. |
| \`navigation.*\` | \`siteNavLinks()\` in \`lib/control-flags.ts\` | Menu Labels. Renames nav text; URLs never change. |
| \`navigation.showInMenu.*\` | \`siteNavLinks()\` | ON = that homepage section also appears in the menu as an in-page anchor link. |

## Rules

- Do NOT hardcode any of these to force something visible. The dashboard is the
  only writer; the site is only a reader.
- A section switched ON but with empty content renders nothing — that is correct.
  The dashboard shows an empty state so the client can add content.
- Missing keys fall back to the registry defaults, so an older config never breaks.
`;

let changed = 0;
for (const s of SITES) {
  const dir = ROOT + '/Websites/' + s + '/.build-instructions';
  if (!fs.existsSync(dir)) {
    console.log('  ' + s.padEnd(32) + 'NO .build-instructions — skipped');
    continue;
  }

  // 1. technical-rules.md — full rewrite
  fs.writeFileSync(dir + '/technical-rules.md', technicalRules, 'utf8');
  console.log('  ' + s.padEnd(32) + 'technical-rules.md  rewritten  ' + technicalRules.length + ' bytes');
  changed++;

  // 2. data-schemas.md — strip a previous appendix if present, then append fresh
  const dsPath = dir + '/data-schemas.md';
  let ds = fs.readFileSync(dsPath, 'utf8');
  const marker = '\n\n---\n\n# Full Control System';
  const cut = ds.indexOf(marker);
  if (cut !== -1) ds = ds.slice(0, cut);
  // repair the mojibake em-dash in the title line if present
  ds = ds.replace(/^# Data Schemas .* Exact JSON Structure$/m, '# Data Schemas \u2014 Exact JSON Structure');
  ds = ds.replace(/\u00e2\u20ac\u201d/g, '\u2014'); // legacy â€” residue
  ds = ds.replace(/\uFFFD\u20AC[\u0080-\u00FF]/g, '\u2014');
  fs.writeFileSync(dsPath, ds.trimEnd() + controlsAppendix, 'utf8');
  const after = fs.readFileSync(dsPath, 'utf8');
  const ok = after.includes('Full Control System') && after.includes('sectionOrder') && after.includes('showInMenu');
  console.log('  ' + s.padEnd(32) + 'data-schemas.md     appended   ' + after.length + ' bytes  ' + (ok ? 'OK' : '*** FAIL ***'));
  changed++;
}

console.log('\n' + changed + ' files written. Cross-check Rule 1D vs live app/page.tsx:');
const pg = fs.readFileSync(ROOT + '/Websites/missions_ablaze/app/page.tsx', 'utf8');
for (const k of ['SectionRenderer', 'FeatureHost', 'placement="inline"', 'WhatsAppGate']) {
  console.log('  ' + k.padEnd(24) + (pg.includes(k) ? 'in live page.tsx' : '*** MISSING from live page.tsx ***'));
}
console.log('  Rule 1D has SectionRenderer: ' + technicalRules.includes('SectionRenderer'));
console.log('  Rule 8D present:             ' + technicalRules.includes('Rule 8D'));
console.log('  No hardcoded <Hero /> in 1D: ' + !technicalRules.includes('      <Hero />'));
