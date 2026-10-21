# Design System — Mamma & Mia Cakes And Catering

## Design Seed: ie7aln


DESIGN SEED: ie7aln (Unique Visual Fingerprint)

LAYOUT STYLE: PLAYFUL
Fun, energetic design with rounded shapes, bright colors, and engaging interactions.

GRID DENSITY: dense
4-column grid with tight gaps (16px). Great for product catalogs and portfolios.

HEADER STYLE: split
Header split into two sections - logo on left, nav on right with distinct backgrounds.

CARD GEOMETRY: rounded
Cards with 12-16px border radius. Friendly and modern.

ANIMATION EASING: dramatic
cubic-bezier(0.16, 1, 0.3, 1) with 600ms duration. Bold and impactful.

SPACING SCALE: comfortable
Sections: 64-96px padding. Elements: 16-24px gaps. Standard spacing.

IMAGE ASPECT RATIO: portrait
3:4 or 4:5 aspect ratio. Great for people and products.

COLOR INTENSITY: pastel
Low saturation, high lightness colors. Soft and approachable.

DENSITY PROFILE: balanced
Standard spacing (64-96px padding), comfortable gaps. Professional and readable. Good default for most sites.

DECORATIVE INTENSITY: expressive
Bold decorative elements. Strong gradient overlays, visible grain/noise textures, decorative shapes, floating elements, glassmorphism cards. Eye-catching and memorable.

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
| Primary | #3C1414 | Buttons, CTAs, active states |
| Secondary | #6B3A2E | Accents, hover states |
| Accent | #FFD700 | Highlights, badges |
| Background | #FFF8DC | Page background |
| Text | #2C1810 | Body text |
| Muted | #6b7280 | Secondary text |

## CSS Custom Properties

```css
:root {
  --color-primary: #3C1414;
  --color-secondary: #6B3A2E;
  --color-accent: #FFD700;
  --color-bg: #FFF8DC;
  --color-text: #2C1810;
  --color-muted: #6b7280;
  --font-heading: Playfair Display, serif;
  --font-body: Lato, sans-serif;
}
```

## Typography

- Heading: Playfair Display — Elegant serif for premium bakery
- Body: Lato
- Weight: bold
- Spacing: tight

## Mode: Light

- Page background: #FDF6F0
- Card surfaces: bg-white with subtle shadows
- Text: Dark gray for readability
- Borders: Light gray borders for definition

## Navigation

- / (Home)
- /portfolio (Gallery)
- /services (Services)
- /about (About)
- /contact (Contact)

## Header Style: split

- Sticky header with backdrop-blur on scroll
- Logo on left, navigation on right
- Mobile: hamburger menu with slide-down animation
- Include phone number and WhatsApp button

## Hero Section

- Headline: "Baked With Love in North West"
- Subheadline: "From custom celebration cakes to daily-fresh bread, we craft honest, delicious bakes using family recipes and local ingredients."
- Badge: "Serving North West with Smiles Since 2012"
- CTA: "Order Online"
- Use stock image from Unsplash matching the industry

## Animation & Spacing

- Animation: Warm fade-ins, gentle parallax, hover effects on products, cart animations
- Spacing: Comfortable sections (80-112px padding), product-focused density, easy browsing

## Trust Signals

- Fresh daily
- Custom orders
- Local ingredients
- Years in business
- Award-winning
- Family recipes

## Conversion CTAs

- Order Online
- Custom Cake Request
- See Our Menu
- Visit Us
- Call Now

## Imagery Direction

Freshly baked goods, warm bakery interior, close-up of pastries, happy customers, artisan process