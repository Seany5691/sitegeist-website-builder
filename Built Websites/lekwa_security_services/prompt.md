
==================================================
CREATIVE BRIEF: Lekwa Security Services
==================================================
Project: Build a world-class website that makes visitors say "WOW"
Industry: Security Services & Protection
Location: Lephalale
Owner: John Mashigo

==================================================
1. THE EMOTIONAL JOURNEY
==================================================

A visitor to this website should feel:
- First 3 seconds: "This company looks professional and trustworthy"
- First 10 seconds: "They can protect my property and family"
- First 30 seconds: "I feel confident contacting them"

The emotional arc: Concern → Confidence → Trust → Security → Action

The design must feel authoritative, reliable, and professional. Like a company 
that takes security seriously and has the expertise to deliver.

VISUAL MOOD: authoritative, trustworthy, vigilant
The design must evoke: Trust, professionalism, quality, reliability

==================================================
2. COMPETITIVE POSITIONING
==================================================

Your website must position Lekwa Security Services as THE choice in Lephalale.

Think about what makes a visitor choose YOU over the competition:
- What unique value do you offer?
- What experience do you provide that others don't?
- What trust signals set you apart?

The design must communicate these differentiators visually, not just in text.

DIFFERENTIATORS TO HIGHLIGHT:
- Social proof: Real testimonials from satisfied clients
- Comprehensive: 4 services offered
- Location: Convenient and accessible
- Experience: Years of proven results
- Trust: Licensed, insured, and certified

==================================================
3. LOCAL CONTEXT & CULTURE
==================================================

Lephalale is your home. Your website should feel like it belongs here.

LOCAL ELEMENTS TO INCLUDE:
- Reference local landmarks and neighborhoods
- Use language that resonates with locals
- Include local testimonials when available
- Mention service areas and coverage
- Use local imagery when possible

The website should feel like it was built BY locals, FOR locals.

==================================================
4. CONVERSION PSYCHOLOGY
==================================================

Every element on this website must guide visitors toward action.

CONVERSION PRINCIPLES:
1. CLARITY: Visitors should know what you do within 3 seconds
2. TRUST: Build credibility through testimonials, credentials, social proof
3. URGENCY: Create gentle urgency without being pushy
4. SIMPLICITY: Make it easy to take the next step
5. CONFIDENCE: Remove all doubt and friction

THE CONVERSION PATH:
Hero (Hook) → Services (Value) → Gallery (Proof) → Testimonials (Trust) → CTA (Action)

Every section should naturally lead to the next, creating a smooth journey 
from "I need this" to "I'm booking now."

==================================================
5. VISUAL STORYTELLING
==================================================

The gallery and images should tell a story, not just display photos.

IMAGE STRATEGY:
- Hero: Set the emotional tone immediately
- Services: Show the experience, not just the service
- Gallery: Tell a story through curated sequences
- Team: Humanize the business with authentic portraits
- Testimonials: Pair quotes with relevant imagery

IMAGE ORDERING:
Images should flow like a visual narrative:
1. Hero image: The "wow" moment
2. Service images: The "how" moments
3. Gallery: The "result" moments
4. Team: The "who" moments
5. Testimonials: The "proof" moments

==================================================
6. ANIMATION & INTERACTION PHILOSOPHY
==================================================

Animations should feel modern and professional.
- Hero: Fade-up entrance, 0.6s ease-out
- Services: Staggered card entrance on scroll
- Gallery: Smooth hover effects
- Philosophy: Enhance, don't distract

==================================================
7. GALLERY & IMAGE STRATEGY
==================================================

CRITICAL: PRESERVE ORIGINAL STRUCTURE
The original website organizes images into categories. 
PRESERVE THIS STRUCTURE in the new website.

GALLERY ORGANIZATION:
- Each category should have its own section or tab
- Images within each category should maintain their original order
- Create visual cards for each category (not just a flat grid)
- Each card should show the category name and a preview image
- Clicking a card should open that category's gallery

CATEGORY STRUCTURE:
- Services: 45 images
- About: 12 images
- Contact: 4 images

CRITICAL: Do NOT mix all images into one flat gallery.
Each category must be visually distinct and separately accessible.
This preserves the client's original organization and makes the gallery 
more navigable for visitors.

==================================================
8. CONTENT STRATEGY
==================================================

Every word on this website must be purposeful and persuasive.

CONTENT HIERARCHY:
1. HERO: Emotional hook that captures attention
2. SERVICES: Benefit-focused descriptions (not feature lists)
3. GALLERY: Visual proof of quality
4. TESTIMONIALS: Social proof from real clients
5. ABOUT: Trust-building story
6. CONTACT: Frictionless communication

WRITING STYLE:
- Use active voice, not passive
- Focus on benefits, not features
- Include local references when natural
- Use sensory language for experiences
- Keep paragraphs short and scannable
- Use headings to guide the eye

SEO CONTENT:
- Include location-specific keywords naturally
- Use industry-specific terminology
- Create content that answers common questions
- Structure for featured snippets

==================================================
9. RESPONSIVE BEHAVIOR
==================================================

The website must feel native on every device.

MOBILE (Primary - 70% of traffic):
- Sticky "Call Now" button at bottom
- Touch-optimized CTAs (min 44px)
- Swipeable galleries and testimonials
- Collapsible sections for easy scanning
- Fast loading (lazy load below-fold images)

TABLET:
- 2-column layouts for services and features
- Side-by-side content where appropriate
- Touch-friendly interactions

DESKTOP:
- Full-width hero with parallax
- Hover effects on all interactive elements
- Multi-column layouts for efficiency
- Floating widgets (WhatsApp, back-to-top)

PERFORMANCE TARGETS:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

==================================================
10. THE PROMISE
==================================================

This website must be so beautiful, so uniquely crafted, that when Lekwa Security Services 
shows it to their clients, they will say: "This is the most beautiful website 
I've ever seen for a security services & protection business."

It must feel like it was designed by a world-class agency that spent weeks 
understanding their business, their clients, and their vision.

Every pixel must be intentional. Every animation must serve a purpose. 
Every word must resonate with the target audience.

This is not a template. This is a bespoke digital experience.


==================================================
CRITICAL RULES (MUST FOLLOW - BUILD WILL FAIL IF IGNORED)
==================================================

1. "use client" DIRECTIVE (MANDATORY):
   - EVERY component file that uses framer-motion MUST start with "use client"
   - EVERY component file that uses useState, useEffect, useRef, or any React hook MUST start with "use client"
   - app/page.tsx MUST start with "use client" if it uses any interactive components
   - Add "use client" as the FIRST LINE of every .tsx component file

2. NEVER import from next/document:
   - NEVER import Html, Head, Main, NextScript from 'next/document'
   - These are ONLY for pages/_document (which we don't use in App Router)
   - The layout.tsx already handles the HTML structure

3. FRAMER MOTION IMPORTS:
   - Always import: import { motion, AnimatePresence } from 'framer-motion'
   - Always add "use client" at top of file
   - Use motion.div, motion.section, etc.

4. NO ERROR PAGES:
   - Do NOT create app/error.tsx, app/404.tsx, app/500.tsx
   - Do NOT create pages/_error.tsx, pages/404.tsx, pages/500.tsx
   - Next.js handles error pages automatically

5. APP ROUTER ONLY:
   - All pages go in app/ directory (NOT pages/)
   - Use app/page.tsx, app/about/page.tsx, etc.
   - Use layout.tsx for shared layout (already created)

==================================================
TECHNICAL IMPLEMENTATION GUIDE
==================================================

You are a Principal Frontend Engineer and Lead UI/UX Architect with 15 years of experience 
building award-winning websites. Build a CUSTOM, PRODUCTION-READY Next.js 14 (App Router) 
web application for "Lekwa Security Services" that is indistinguishable from a $10,000 custom design.

OUTPUT DIRECTORY: C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Websites\lekwa_security_services
Create the complete project structure in this directory.

==================================================
1. DESIGN SYSTEM & BRAND IDENTITY
==================================================

ARCHETYPE: Security Services & Protection
DESIGN STYLE: Dark & Authoritative
DESIGN MOOD: authoritative, trustworthy, premium

TYPOGRAPHY SYSTEM:
- Heading Font: Roboto Slab - Strong slab serif for authority
- Body Font: Roboto
- Font Weight: bold
- Letter Spacing: tight
- Apply via next/font/google in app/layout.tsx
- Type Scale: 12px, 14px, 16px, 20px, 24px, 32px, 48px, 64px, 96px

COLOR PALETTE (Navy & Gold):
- Primary: #1E3A5F (buttons, CTAs, active states)
- Secondary: #2B6CB0 (accents, hover states)
- Accent: #D4AF37 (highlights, badges)
- Background: #0F172A (page background)
- Text: #F8FAFC (body text)
- Muted: #9ca3af (secondary text)

CSS CUSTOM PROPERTIES:
:root {
  --color-primary: #1E3A5F;
  --color-secondary: #2B6CB0;
  --color-accent: #D4AF37;
  --color-bg: #0F172A;
  --color-text: #F8FAFC;
  --color-muted: #9ca3af;
  --font-heading: Roboto Slab, serif;
  --font-body: Roboto, sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
}

DARK MODE DESIGN:
- Page background: #0F172A
- Card surfaces: bg-white/5 with border-white/10 and backdrop-blur
- Text: White/light gray for contrast
- Shadows: Subtle ambient glow instead of drop shadows
- Images: May need subtle dark overlay for text readability

==================================================
2. DESIGN SEED - UNIQUE VISUAL FINGERPRINT
==================================================

DESIGN SEED: c32206 (Unique Visual Fingerprint)

LAYOUT STYLE: EDITORIAL
Magazine-inspired layout with large typography, asymmetric grids, and generous whitespace. Think Vogue or Kinfolk.

GRID DENSITY: dense
4-column grid with tight gaps (16px). Great for product catalogs and portfolios.

HEADER STYLE: solid
Header has solid background from start. Clean and professional.

CARD GEOMETRY: rounded
Cards with 12-16px border radius. Friendly and modern.

ANIMATION EASING: bouncy
spring(1, 80, 10) with 500ms duration. Fun and playful.

SPACING SCALE: compact
Sections: 48-64px padding. Elements: 12-16px gaps. Dense but organized.

IMAGE ASPECT RATIO: landscape
16:9 or 3:2 aspect ratio. Great for environments and scenes.

COLOR INTENSITY: neon
High brightness colors with glow effects. Modern and tech-forward.

SECTION ORDER: Hero → Gallery → Testimonials → FAQ → About → Team → Services → Contact → Footer


CRITICAL: This design seed ensures "Lekwa Security Services" has a UNIQUE layout different from any other website. Follow the seed specifications exactly.

==================================================
3. MEDIA & DEPLOYMENT
==================================================

BUILD MODE: TRIAL / PREVIEW
- Output directory: C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Websites\lekwa_security_services
- All image paths reference REMOTE URLs from the scraped data
- Create a complete, functional Next.js project that renders immediately
- Use Next.js Image component with unoptimized={true} for remote URLs

==================================================
4. NAVIGATION & HEADER
==================================================
Site Structure:
- / (Home)
- /portfolio (Gallery)
- /services (Services)
- /about (About)
- /contact (Contact)
- Custom routes:
  * /prices
  * /rates
  * /packages
  * /packages-and-pricing
  * /pricing-packages
  * /photo-packages
  * /photography-packages
  * /session-rates
  * /session-pricing
  * /investment
  * /invest
  * /our-work
  * /images
  * /photos
  * /work
  * /projects
  * /showcase
  * /collection
  * /lookbook
  * /my-portfolio
  * /my-work
  * /my-gallery
  * /menu
  * /treatments
  * /offerings
  * /case-studies
  * /completed-projects
  * /news
  * /stories
  * /articles
  * /posts
  * /updates
  * /Contacts
  * /Study-Courses

HEADER DESIGN (solid style):
- Sticky header with backdrop-blur on scroll
- Logo (from brandAssets.logoUrl) on left, navigation on right
- Desktop: full navigation links with hover underline animation
- Mobile: hamburger menu with slide-in drawer
- Include phone number and WhatsApp button

WCAG CONTRAST GUARD (MANDATORY):
When header is transparent over hero image:
- MUST include dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- MUST include backdrop-blur-md for depth
- OR use top gradient overlay: bg-gradient-to-b from-black/70 to-transparent
- All navigation text must have minimum 4.5:1 contrast ratio
- Logo must be clearly visible against any hero image
- On scroll, header transitions to solid background

==================================================
5. HERO SECTION (ACTUAL CONTENT FROM WEBSITE)
==================================================
- Full viewport height (100vh) with hero image as background
- Headline: "Trusted Security Solutions for Lephalale & Beyond"
- Subheadline: "Providing reliable armed response, advanced drone surveillance, and professional guarding services to protect what matters most to you, 24/7."
- Badge: "Locally Operated | Fully Compliant | Rapid Response"
- Primary CTA: "Need Immediate Security Assistance?
**Call Us Now:** 014 004 0336"
- Secondary CTA: WhatsApp button
- Dark gradient overlay for text readability
- Parallax scroll effect
- Animate headline with Framer Motion
- Text must be white with sufficient contrast

WCAG CONTRAST GUARD (MANDATORY):
When header is transparent over hero image:
- MUST include dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- MUST include backdrop-blur-md for depth
- All navigation text must have minimum 4.5:1 contrast ratio
- On scroll, header transitions to solid background

==================================================
6. CONTENT SECTIONS (REAL DATA FROM WEBSITE)
==================================================

SERVICES:
1. Armed Response: Our rapid armed response units are available 24 hours a day, 7 days a week. We provide a decisive and immediate reaction to any alarm activation or security breach, ensuring your safety and the security of your property.
2. Drone Security & Aerial Surveillance: Utilize cutting-edge technology for superior oversight. Our drone services offer large-area perimeter monitoring, after-hours site patrols, and detailed aerial assessments to identify vulnerabilities and enhance situational awareness.
3. Static Security & Guarding: Provide a constant, visible deterrent with our professional static guarding services. Our trained officers are skilled in access control, patrol procedures, and incident reporting for commercial, industrial, and residential sites.
4. Business Security Solutions: We design and implement integrated security strategies for businesses. From risk assessments to the deployment of response teams and surveillance, we create secure environments that allow your business to thrive.

GALLERY SECTION (CRITICAL - PRESERVE CATEGORY ORGANIZATION):
- Images MUST be organized by their original categories
- Create separate sections or filter tabs for EACH category
- DO NOT mix all images into one flat portfolio

Gallery categories:
  - Services: 45 images
  - About: 12 images
  - Contact: 4 images

- Responsive masonry grid layout
- Hover effect: scale + overlay with caption
- Click to open lightbox with keyboard navigation
- Category filter tabs at the top

WHATSAPP WIDGET:
- Fixed-position floating button (bottom-right, z-50)
- Green (#25D366) circular button with WhatsApp icon
- Pulse animation on hover
- Opens https://wa.me/[number] in new tab
- Tooltip "Chat with us" on hover

CLICK-TO-CALL:
- All phone numbers wrapped in <a href="tel:...">
- Phone icon beside numbers
- Sticky mobile call bar at bottom

CONTACT FORM:
- Fields: Name, Email, Phone, Service Interest, Message
- Client-side validation
- Success state: "Thank you! We'll respond within 24 hours"
- Honeypot field for spam prevention
- Glass morphism card styling

BUSINESS HOURS:
- Display operating hours in contact section
- Show current status: "Open Now" (green) or "Closed" (red)
- Responsive layout

TESTIMONIALS:
- Carousel/slider with client testimonials
- Show: name, quote, rating (stars), source badge
- Auto-play with pause on hover
- "Read more reviews on Google" CTA

FAQ SECTION:
- Accordion with smooth expand/collapse
- One item open at a time
- FAQPage schema in JSON-LD
- Plus/minus toggle icons

ANIMATED SCROLL:
- Framer Motion for section entrance animations
- Fade-up on scroll for content blocks
- Staggered animation for grid items
- Respect prefers-reduced-motion

IMAGE LIGHTBOX:
- Click-to-expand gallery images
- Keyboard navigation (arrow keys, escape)
- Swipe support on mobile
- Image caption and counter



TESTIMONIALS:
1. "Lekwa Security's response time is impeccable. They are professional, courteous, and give us great confidence in the safety of our business premises. Highly recommended." - S. Botha, Commercial Client (5/5)

FAQ:
1. Q: What areas do you service?
   A: We are based in Lephalale and primarily provide security services throughout the Lephalale region and surrounding areas in Limpopo.
2. Q: Are your security officers trained and registered?
   A: Yes. All our security personnel undergo rigorous training and are registered with the Private Security Industry Regulatory Authority (PSiRA) as required by law.
3. Q: How can I get a quote for security services?
   A: You can contact our office directly at 014 004 0336 or email contact@lekwasecurityservices.co.za for a free, no-obligation consultation and quote tailored to your needs.


TEAM / DOCTORS:
- John Mashigo (Owner & Director)


MOTTO / TAGLINE: "Your Vigilant Partner in Security."
Use this as a prominent tagline on the website.


HISTORY / ABOUT:
Established to fill a critical need for professional, responsive security services in Lephalale, Lekwa Security Services has grown under John Mashigo's leadership by focusing on reliability, advanced technology, and building strong community trust.


SPECIALIZATIONS:
- Rapid Armed Response
- Commercial & Industrial Site Security
- Drone-Based Surveillance & Patrols
- 24/7 Security Monitoring and Response


SOCIAL MEDIA LINKS (from original website):





Include these in the footer and optionally in the header.


PRICING TABLE (from website):
- 580: RR
- 1770: RR
- ECTIVE SERVICES

Study Courses: R580
- Special Courses: R1770
Create a dedicated pricing section with these prices displayed prominently.
ALSO create a separate pricing page at app/pricing/page.tsx with full pricing details and packages.


BLOG POSTS (from website):
- 404 Not Found (https://www.lekwasecurityservices.co.za/blog)
- 404 Not Found (https://www.lekwasecurityservices.co.za/news)
- 404 Not Found (https://www.lekwasecurityservices.co.za/stories)
- 404 Not Found (https://www.lekwasecurityservices.co.za/articles)
- 404 Not Found (https://www.lekwasecurityservices.co.za/posts)
Create a blog section with these posts. Each should link to the original or a new page.
ALSO create a separate blog page at app/blog/page.tsx listing all blog posts.



==================================================
7. CONTACT SECTION
==================================================
- Split layout: Contact form on left, info on right
- Phone: 27140040336 (click-to-call)
- WhatsApp: 27140040336 (click-to-chat)
- Email: contact@lekwasecurityservices.co.za
- Address: Lephalale
- Business hours display
- Embedded Google Maps

==================================================
8. SEO & STRUCTURED DATA
==================================================
META TAGS:
- title: "Lekwa Security Services | Lephalale Armed Response & Guarding"
- description: "Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today."
- keywords: "Lephalale security services, armed response Lephalale, security company Limpopo, drone surveillance, static guarding Lephalale, business security Lephalale, John Mashigo security, 24/7 security Lephalale."

OPENGRAPH:
- og:title, og:description, og:type, og:image

JSON-LD (embed in layout.tsx):
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Lekwa Security Services",
  "description": "Lekwa Security Services in Lephalale offers 24/7 armed response, drone surveillance, static guarding, and business security solutions. Contact John Mashigo today.",
  "telephone": "27140040336",
  "email": "contact@lekwasecurityservices.co.za",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Lephalale",
    "addressLocality": "Lephalale",
    "addressCountry": "ZA"
  }
}

FAQPAGE SCHEMA (MANDATORY):
- Add FAQPage schema markup to the FAQ section
- This allows search engines and AI agents to digest questions and answers programmatically
- Example:
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text here."
      }
    }
  ]
}

LLMS.TXT FILE (MANDATORY):
- Create a file at /llms.txt with a clean summary of the business
- This file helps AI models understand the site content, offerings, and location
- Format:
  # Lekwa Security Services
  
  ## About
  [Brief description of the business]
  
  ## Services
  [List of services offered]
  
  ## Location
  [City, suburbs served, service area]
  
  ## Contact
  [Phone, email, website]

EXPLICIT SERVICE BOUNDARIES (MANDATORY):
- Specify specific suburbs or travel policies
- Example: "Serving Sandton, Centurion, Midrand, Pretoria, and surrounding areas"
- Example: "Available for travel nationwide with travel fee"
- This helps AI assistants confidently recommend the business
- Include service radius descriptions for local businesses

==================================================
9. TECHNICAL REQUIREMENTS
==================================================
- Next.js 14 with App Router
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- TypeScript
- next/font for fonts
- Responsive: mobile-first
- Accessible: ARIA labels, semantic HTML
- Performance: lazy loading, image optimization
- Target: Lighthouse 90+

==================================================
10. GLOBAL VISUAL STANDARDS & ARCHITECTURAL RULES
==================================================

ADAPTIVE SURFACE CONTRAST & SECTION ELEVATION:
- Do NOT apply a single monochromatic background color across all page sections
- Alternate background tones dynamically between adjacent sections:
  * Main content blocks: Pure light backgrounds (#FFFFFF or #FAFAFA)
  * Secondary/transitional sections: Very light tint backgrounds (#F8FAFC, #F1F5F9, #F0FDF4)
- Maintain strong visual separation and section depth throughout the page flow
- Use subtle borders (border-gray-100) or shadow differences between sections

DYNAMIC CARD GEOMETRY & ARCHETYPE MAPPING:
- Creative, Youth, Entertainment, Tech: Maximum curvature (rounded-full / pill-style)
- Medical, Legal, Corporate, Professional, Trades: Balanced curvature (rounded-xl or rounded-2xl)
- Ensure text wrapping and inner padding scale with curvature so content never clips

TYPOGRAPHY & CONTRAST POLISH:
- Section Headings: Tight letter-spacing (-0.025em), font-bold, deep dark contrast (#111827)
- Body Text: Relaxed line-height (1.6-1.75), dark-neutral contrast (#374151)
- Maintain consistent vertical rhythm across heading-to-body transitions

INTERACTIVE MICRO-INTERACTIONS & ELEVATION:
- All actionable cards: Subtle hover states
- Hover effect: Gentle upward translation (translate-y-[-2px]) + soft diffuse shadow
- Provide immediate visual feedback without layout shift
- Transition: 200-300ms ease-out

==================================================
11. COMPONENT STRUCTURE
==================================================
app/
  layout.tsx (root layout with fonts, metadata, JSON-LD)
  page.tsx (homepage with all sections)
  globals.css (CSS variables, Tailwind)
  services/page.tsx
  contact/page.tsx
  about/page.tsx
components/
  Header.tsx (solid style)
  Hero.tsx (parallax, animated text)
  Services.tsx (sharp cards)
  Testimonials.tsx
  Faq.tsx
  Contact.tsx
  Footer.tsx
  WhatsAppWidget.tsx

INDUSTRY-SPECIFIC COMPONENTS:
- Hero (REQUIRED)
- Services (REQUIRED)
- Contact (REQUIRED)
- Footer (REQUIRED)
- TrustSignals (REQUIRED)

OPTIONAL COMPONENTS:
- Testimonials (if data available)
- Pricing (if data available)
- About (if data available)
- FAQ (if data available)
- CoverageArea (if data available)

EXCLUDED COMPONENTS (DO NOT CREATE):
- Gallery (not appropriate for Security Services & Protection)
- Blog (not appropriate for Security Services & Protection)
- Booking (not appropriate for Security Services & Protection)

ANIMATION GUIDANCE:
Subtle fade-ins, minimal animations, professional feel, trust-building transitions

SPACING GUIDANCE:
Compact sections (64-96px padding), efficient use of space, professional density

TRUST SIGNALS:
- PSiRA registered
- Armed response time
- Years of experience
- Client count
- 24/7 monitoring
- Licensed & insured

CONVERSION CTAs:
- Get a Quote
- Call Now
- Request Assessment
- View Services
- Emergency Contact

==================================================
11. EXECUTION
==================================================
Build the COMPLETE website now. Every component must be fully implemented with real content. No stubs. No placeholders. No "TODO" comments.

The website must be:
- Beautiful and unique (use the design seed)
- Industry-appropriate (use the archetype)
- Conversion-optimized (clear CTAs)
- Mobile-first responsive
- Accessible (WCAG 2.1 AA)
- Fast (optimized images, lazy loading)
- SEO-optimized (meta tags, JSON-LD)

==================================================
12. DASHBOARD INTEGRATION (MANDATORY)
==================================================

After building all components, you MUST:

1. Create app/dashboard/page.tsx that redirects to /dashboard/index.html
   - This is a HIDDEN route - do NOT add to navigation
   - Only accessible by typing /dashboard in the URL

2. Create public/site-config.json with ALL website data:
   - businessName, city, ownerName, phone, email, address
   - services (with titles, descriptions, prices)
   - blog posts (with titles, excerpts, dates)
   - testimonials (with names, text, ratings)
   - pricing (with packages, prices, descriptions)
   - social links (facebook, instagram, twitter)
   - business hours
   - logo URL

3. Create public/image-map.json with ALL gallery data:
   - Categories with their images
   - Each category has: name, url, images array
   - Images in EXACT order from original website

4. Create public/seo.json with SEO data:
   - title, description, keywords
   - openGraph, twitter cards
   - jsonLd structured data

5. Copy these files to public/ folder so the dashboard can access them.

6. Create public/llms.txt with a clean summary of the business:
   - Business name, description, services, location, contact
   - This file helps AI models understand the site content
   - Format as plain text with clear sections

7. Add FAQPage schema markup to the FAQ section:
   - This allows search engines and AI agents to digest Q&A programmatically
   - Include all FAQ questions and answers in the schema

8. Add explicit service boundaries:
   - Specify suburbs or areas served
   - Include travel policies if applicable
   - Help AI assistants recommend the business

The dashboard template is already in public/dashboard/ - do NOT modify it.

This must be indistinguishable from a $10,000 custom design. Execute now.