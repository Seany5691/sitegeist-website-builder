# Design System — Missions Ablaze

## Design Seed: lbyi3q


DESIGN SEED: lbyi3q (Unique Visual Fingerprint)

LAYOUT STYLE: ELEGANT
Sophisticated design with refined typography, subtle animations, and premium feel.

GRID DENSITY: dense
4-column grid with tight gaps (16px). Great for product catalogs and portfolios.

HEADER STYLE: split
Header split into two sections - logo on left, nav on right with distinct backgrounds.

CARD GEOMETRY: pill
Cards with 9999px border radius. Playful and distinctive.

ANIMATION EASING: snappy
ease-out with 150-200ms duration. Fast and responsive.

SPACING SCALE: compact
Sections: 48-64px padding. Elements: 12-16px gaps. Dense but organized.

IMAGE ASPECT RATIO: mixed
Varied aspect ratios for visual interest. Some square, some portrait, some landscape.

COLOR INTENSITY: vibrant
Full saturation colors. Energetic and attention-grabbing.

DENSITY PROFILE: airy
Generous whitespace, large section padding (100-140px), wide gaps between elements. Luxury editorial feel. Content breathes.

DECORATIVE INTENSITY: subtle
Light decorative touches. Soft gradient overlays on hero, subtle grain texture on backgrounds, gentle border accents. Refined and polished.

TYPOGRAPHY PAIRING: elegant-mix
Heading: Cormorant Garamond (refined serif). Body: Montserrat. Refined yet modern. Great for professional services, medical, legal.

MOTION INTENSITY: subtle
Gentle animations: 0.3s duration, 8px distance, 0.04s stagger. Refined and professional. No bouncy or flashy effects.

STAGGER STRENGTH: light
Light stagger (0.04s between children). Subtle sequential reveal. Professional.

ART DIRECTION: warm-organic
Friendly and approachable: balanced spacing, moderate motion, warm tones, rounded shapes, friendly typography. Inviting and personal.

SECTION ORDER: Hero → Gallery → Testimonials → FAQ → About → Team → Services → Contact → Footer


## Color Palette (Selected)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #5b86f3 | Buttons, CTAs, active states |
| Secondary | #9f2419 | Accents, hover states |
| Accent | #071327 | Highlights, badges |
| Background | #FFFBF5 | Page background |
| Text | #1a1a1a | Body text |
| Muted | #6b7280 | Secondary text |

## CSS Custom Properties

```css
:root {
  --color-primary: #5b86f3;
  --color-secondary: #9f2419;
  --color-accent: #071327;
  --color-bg: #FFFBF5;
  --color-text: #1a1a1a;
  --color-muted: #6b7280;
  --font-heading: Plus Jakarta Sans, serif;
  --font-body: Inter, sans-serif;
}
```

## Typography

- Heading: Plus Jakarta Sans — Modern sans-serif that feels human and approachable
- Body: Inter
- Weight: bold
- Spacing: normal

## Mode: Light

- Page background: #F0F9FF
- Card surfaces: bg-white with subtle shadows
- Text: Dark gray for readability
- Borders: Light gray borders for definition

## Navigation

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

## Header Style: split

- Sticky header with backdrop-blur on scroll
- Logo on left, navigation on right
- Mobile: hamburger menu with slide-down animation
- Include phone number and WhatsApp button

## Hero Section

- Headline: "Hope Served Daily in Tongaat."
- Subheadline: "Since 1995, Missions Ablaze has provided nutritious meals and community support from our kitchen in Tongaat, KwaZulu-Natal. Your partnership fuels this vital work."
- Badge: "Serving Tongaat Since 1995 • Registered NPO & PBO"
- CTA: "Become a Monthly Partner"
- Hero image: https://missionsablaze.org.za/wp-content/uploads/2025/03/IMG-20250312-WA0041.jpg

## Animation & Spacing

- Animation: Gentle fade-ins, smooth transitions, warm animations, trust-building effects. No flashy or playful animations — the tone should be respectful and dignified.
- Spacing: Comfortable sections (80-112px padding), editorial density, easy reading, generous whitespace for storytelling

## Trust Signals

- NPO registration
- PBO status
- Years in operation
- Meals delivered
- Financial transparency
- Section 18A certificate
- Annual reports available
- Community partnerships

## Conversion CTAs

- Become a Monthly Partner
- Volunteer Today
- Donate Now
- See Our Impact
- Partner With Us
- Join the Mission

## Imagery Direction

Real people, community kitchens, food distribution, volunteers in action, warm natural light, authentic moments, no stock photos feel, dignity and respect