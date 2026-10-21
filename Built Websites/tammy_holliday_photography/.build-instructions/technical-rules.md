# Technical Rules — MANDATORY

These rules prevent build failures. Read this file BEFORE writing any code.

## Rule 1: Framer Motion SSR Safety (CRITICAL)

framer-motion CANNOT run on the server. If ANY component using motion.* is rendered during 
Next.js static generation, the build crashes.

### Rule 1A — Dynamic imports for animated components:

```tsx
'use client'
import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const Faq = dynamic(() => import('@/components/Faq'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
```

### Rule 1B — "use client" on every animated component

### Rule 1C — NEVER use static imports for animated components

### Rule 1D — app/page.tsx MUST use this pattern:

```tsx
'use client'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const Gallery = dynamic(() => import('@/components/Gallery'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const Faq = dynamic(() => import('@/components/Faq'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
const CtaBanner = dynamic(() => import('@/components/CtaBanner'), { ssr: false })
const PricingTable = dynamic(() => import('@/components/PricingTable'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), { ssr: false })

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Arrange sections based on design seed section order */}
        <Hero />
        {/* ... other sections ... */}
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
```

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
- CtaBanner.tsx, PricingTable.tsx

They read from site-config.json via useSiteData() at runtime.
DO NOT modify, recreate, or overwrite these files.