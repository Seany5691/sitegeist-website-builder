# Visual Standards

## Adaptive Surface Contrast

Do NOT use a single background color across all sections.
Alternate background tones between adjacent sections:
- Main content: Pure backgrounds (#FFFFFF or #FAFAFA)
- Secondary sections: Light tint (#F8FAFC, #F1F5F9, #F0FDF4)
- Use subtle borders or shadow differences between sections

## Card Geometry

- Creative/Youth/Tech: Maximum curvature (rounded-full / pill)
- Medical/Legal/Corporate: Balanced curvature (rounded-xl or rounded-2xl)
- Ensure text wrapping scales with curvature

## Typography Contrast

- Section Headings: letter-spacing -0.025em, font-bold, deep contrast (#111827)
- Body Text: line-height 1.6-1.75, dark-neutral (#374151)
- Consistent vertical rhythm

## Micro-Interactions

- All actionable cards: Subtle hover states
- Hover: translate-y-[-2px] + soft shadow
- Transition: 200-300ms ease-out
- No layout shift

## WCAG Contrast Guards

When header is transparent over hero:
- Dark semi-transparent backdrop: bg-slate-950/40 or bg-black/50
- backdrop-blur-md for depth
- All nav text: minimum 4.5:1 contrast ratio
- On scroll: transition to solid background

## Image Treatment

- Hero images: Dark gradient overlay for text readability
- Gallery images: Subtle hover scale (1.05x) with overlay
- Service images: Consistent aspect ratios
- All images: Descriptive alt text

---


==================================================
TYPOGRAPHY SYSTEM (COMPLETE SPECIFICATIONS)
==================================================


FONT LOADING STRATEGY (app/layout.tsx):

import { Cormorant_Garamond, Montserrat } from 'next/font/google';

const headingFont = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
});

const bodyFont = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className={bodyFont.className}>
        {children}
      </body>
    </html>
  );
}

CSS CUSTOM PROPERTIES (globals.css):
:root {
  --font-heading: Cormorant Garamond, serif;
  --font-body: Montserrat, sans-serif;
}

USAGE IN COMPONENTS:
- Headings (h1-h6): className="font-heading" → applies var(--font-heading)
- Body text (p, span, div): Inherits from <body> → automatically uses Montserrat
- Override when needed: className="font-body" or className="font-heading"

TAILWIND CONFIG (tailwind.config.ts):
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        sans: ['var(--font-body)'],
      },
    },
  },
};

CRITICAL RULES:
1. ALWAYS use display: 'swap' to prevent FOIT
2. Load ALL weights needed (400, 500, 600, 700, 800) upfront
3. Apply fonts via CSS variables, NOT inline className={font.className}
4. Use variable: '--font-heading' pattern for maximum flexibility
5. Test on slow 3G connection to verify no layout shift



==================================================
LINE-HEIGHT SPECIFICATIONS (WCAG READABILITY)
==================================================

Apply these EXACT line-height values for optimal readability:

HEADINGS (tighter for hierarchy):
- h1: line-height: 1.1 (leading-tight in Tailwind)
- h2: line-height: 1.2
- h3: line-height: 1.3
- h4-h6: line-height: 1.4

BODY TEXT (generous for readability):
- Paragraphs (p): line-height: 1.6 (leading-relaxed)
- Lead text (.lead): line-height: 1.5
- Small text: line-height: 1.5

UI ELEMENTS (compact):
- Buttons: line-height: 1 (leading-none)
- Navigation links: line-height: 1.2

CSS IMPLEMENTATION:
:root {
  --line-height-heading: 1.1;
  --line-height-body: 1.6;
  --line-height-tight: 1.2;
}

h1, h2, h3, h4, h5, h6 {
  line-height: var(--line-height-heading);
}

p, li, td {
  line-height: var(--line-height-body);
}

WHY THESE VALUES:
- WCAG recommends 1.5+ for body text (ours: 1.6)
- Tight line-height for headings creates visual hierarchy
- Generous line-height for body text improves scannability
- Line-height in 'em' units scales with font-size

VERIFICATION:
□ All body paragraphs have line-height: 1.6
□ All headings have line-height: 1.1-1.4
□ No text has line-height < 1.0 (except buttons)
□ Long-form content is easy to scan



==================================================
RESPONSIVE TYPOGRAPHY SCALE (FLUID TYPE)
==================================================

Use this EXACT scale for responsive typography. Font sizes scale smoothly from mobile to desktop.

IMPLEMENTATION METHOD: clamp() for fluid typography

TEXT HIERARCHY:

1. DISPLAY (Hero Headlines):
   - Mobile: 32px (2rem)
   - Tablet: 48px (3rem)
   - Desktop: 64px (4rem)
   - CSS: font-size: clamp(2rem, 5vw, 4rem);
   - Tailwind: text-3xl md:text-5xl lg:text-6xl

2. H1 (Page Titles):
   - Mobile: 28px (1.75rem)
   - Tablet: 36px (2.25rem)
   - Desktop: 48px (3rem)
   - CSS: font-size: clamp(1.75rem, 4vw, 3rem);
   - Tailwind: text-3xl md:text-4xl lg:text-5xl

3. H2 (Section Headings):
   - Mobile: 24px (1.5rem)
   - Tablet: 30px (1.875rem)
   - Desktop: 36px (2.25rem)
   - CSS: font-size: clamp(1.5rem, 3vw, 2.25rem);
   - Tailwind: text-2xl md:text-3xl lg:text-4xl

4. H3 (Subsection Headings):
   - Mobile: 20px (1.25rem)
   - Tablet: 24px (1.5rem)
   - Desktop: 28px (1.75rem)
   - CSS: font-size: clamp(1.25rem, 2.5vw, 1.75rem);
   - Tailwind: text-xl md:text-2xl lg:text-3xl

5. H4 (Card Titles):
   - Mobile: 18px (1.125rem)
   - Tablet: 20px (1.25rem)
   - Desktop: 22px (1.375rem)
   - CSS: font-size: clamp(1.125rem, 2vw, 1.375rem);
   - Tailwind: text-lg md:text-xl lg:text-2xl

6. BODY TEXT (Paragraphs):
   - Mobile: 16px (1rem)
   - Tablet: 17px (1.0625rem)
   - Desktop: 18px (1.125rem)
   - CSS: font-size: clamp(1rem, 1.5vw, 1.125rem);
   - Tailwind: text-base md:text-lg

7. SMALL TEXT (Captions, Meta):
   - Mobile: 14px (0.875rem)
   - Tablet: 15px (0.9375rem)
   - Desktop: 16px (1rem)
   - CSS: font-size: clamp(0.875rem, 1.2vw, 1rem);
   - Tailwind: text-sm md:text-base

GLOBAL CSS (globals.css):
html {
  font-size: 16px; /* Base font size */
}

@media (min-width: 768px) {
  html {
    font-size: 17px; /* Slightly larger on tablet */
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 18px; /* Slightly larger on desktop */
  }
}

IMPLEMENTATION RULES:
1. Use Tailwind responsive classes (text-3xl md:text-5xl) for simplicity
2. For custom sizes, use clamp() function
3. NEVER use viewport units (vw, vh) for font-size alone
4. Always provide min and max values in clamp()
5. Test on mobile (375px), tablet (768px), desktop (1280px, 1920px)

VERIFICATION:
□ Hero headline is 32-64px (mobile to desktop)
□ Body text is 16-18px (mobile to desktop)
□ No text smaller than 14px on mobile
□ No text larger than 72px on any screen
□ Text scales smoothly between breakpoints (no jumps)



==================================================
LETTER-SPACING (TRACKING) SPECIFICATIONS
==================================================

Font Family: Cormorant Garamond (Serif)

Apply these EXACT letter-spacing values:

DISPLAY TEXT (Hero Headlines):
- letter-spacing: -0.02em (tracking-tight)
- Why: Tight tracking for visual impact

HEADINGS:
- h1: letter-spacing: -0.01em
- h2-h3: letter-spacing: 0em
- Why: Serifs need minimal tracking

BODY TEXT:
- Paragraphs: letter-spacing: 0em (tracking-normal)
- Why: Optimal for extended reading

UPPERCASE TEXT (Badges, Labels):
- letter-spacing: 0.05em (tracking-wider)
- Why: Uppercase ALWAYS needs generous spacing

BUTTONS & CTAs:
- letter-spacing: 0.025em (tracking-wide)
- Why: Improves clickability and prominence

CSS IMPLEMENTATION:
.text-display {
  letter-spacing: -0.02em;
}

.uppercase, .badge {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

button, .btn {
  letter-spacing: 0.025em;
}

TAILWIND CLASSES:
- tracking-tighter: -0.05em
- tracking-tight: -0.025em
- tracking-normal: 0em
- tracking-wide: 0.025em
- tracking-wider: 0.05em
- tracking-widest: 0.1em

CRITICAL RULES:
1. ALWAYS add generous tracking to uppercase text
2. Tight tracking on large display text (> 48px)
3. Normal tracking on body text for readability
4. Serif fonts need less tracking overall
5. Never use negative tracking on body text (< 16px)

VERIFICATION:
□ All uppercase text has tracking-wider or tracking-widest
□ Hero headlines have tight tracking
□ Body paragraphs have normal tracking
□ Buttons have slight tracking (0.025-0.05em)
□ No text feels cramped or overly spaced


==================================================
TYPOGRAPHY VERIFICATION CHECKLIST
==================================================

□ Fonts load with display: 'swap' (no FOIT)
□ All weights (400-800) preloaded
□ Line-height: 1.6 on body text
□ Line-height: 1.1-1.4 on headings
□ Responsive type scale applied (clamp or Tailwind classes)
□ Uppercase text has generous letter-spacing
□ Text hierarchy is clear (6 levels minimum)
□ Body text is 16-18px minimum
□ No text smaller than 14px on mobile
□ Fonts applied via CSS variables, not inline classes


---


==================================================
RESPONSIVE DESIGN SPECIFICATIONS (COMPLETE)
==================================================


==================================================
GAP 35: MOBILE-FIRST LAYOUT RULES
==================================================

BREAKPOINT STRATEGY:
- Mobile: 320px - 767px (default styles, no media query)
- Tablet: 768px - 1023px (@media (min-width: 768px) or md: in Tailwind)
- Desktop: 1024px+ (@media (min-width: 1024px) or lg: in Tailwind)

MOBILE-SPECIFIC RULES (< 768px):

1. NAVIGATION:
   - Hamburger menu (3-line icon)
   - Full-screen slide-in drawer (fixed inset-0)
   - Menu items: Stack vertically, py-4, text-lg
   - Close button: Fixed top-right, size-10, z-50

2. HERO SECTION:
   - Full viewport height (min-h-screen)
   - Single column, text centered
   - Headline: 32px (text-3xl), max-width: 90%
   - CTA buttons: Stack vertically (flex-col), gap-3
   - Button width: w-full on mobile

3. SERVICES/FEATURES GRID:
   - Single column (grid-cols-1)
   - Cards: Full width, mb-4
   - No hover effects on mobile (use :hover only with @media (hover: hover))
   - Touch-friendly spacing: py-6 px-4

4. GALLERY:
   - 2-column grid on mobile (grid-cols-2)
   - Gap: gap-2 (8px)
   - Tap to view full image (no hover zoom)
   - Swipe gestures for lightbox navigation

5. TESTIMONIALS:
   - Single card visible (no 3-column grid)
   - Horizontal scroll OR carousel with dots
   - Snap scroll: scroll-snap-type: x mandatory

6. CONTACT FORM:
   - Single column (no split layout)
   - Form stacked above contact info
   - Inputs: w-full, h-12 min (touch-friendly)

7. FOOTER:
   - Single column, centered
   - Links stack vertically
   - Social icons: Larger (size-8), spaced generously

MOBILE-FIRST CSS PATTERN:
/* Mobile (default) */
.container {
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    grid-template-columns: repeat(3, 1fr);
  }
}

TAILWIND PATTERN:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

CRITICAL MOBILE RULES:
1. Stack everything vertically on mobile (< 768px)
2. Full-width buttons and inputs (w-full)
3. Generous spacing (py-6 px-4 minimum)
4. No hover effects (use @media (hover: hover))
5. Touch-friendly sizes (44px minimum for interactive elements)
6. Center-aligned content on mobile
7. Test on iPhone SE (375px) and iPhone 14 Pro Max (430px)



==================================================
GAP 36: TABLET-SPECIFIC BREAKPOINT (768px-1023px)
==================================================

TABLET IS NOT JUST "SCALED MOBILE" — it's a hybrid layout optimized for 768-1023px screens.

TABLET LAYOUT PATTERNS:

1. NAVIGATION:
   - Show full horizontal nav (no hamburger)
   - OR keep hamburger but with tablet-optimized drawer
   - Logo: left, nav: center or right

2. HERO:
   - 2-column layout: Text left, image right
   - OR centered with larger text (48px vs 32px mobile)

3. SERVICES/FEATURES GRID:
   - 2-column grid (grid-cols-2)
   - Cards side-by-side
   - Hover effects enabled (tablet supports mouse)

4. GALLERY:
   - 3-column grid (grid-cols-3)
   - Lightbox opens on tap OR click

5. TESTIMONIALS:
   - 2 cards visible (grid-cols-2)
   - OR single card with larger text

6. CONTACT FORM:
   - Keep single column OR introduce 2-column (form + info)
   - Depends on form complexity

7. FOOTER:
   - 2-column layout (links left, info right)
   - OR 3-column if content-heavy

TABLET CSS PATTERN:
@media (min-width: 768px) and (max-width: 1023px) {
  .hero {
    grid-template-columns: 1fr 1fr; /* 2-column */
  }
  
  .services {
    grid-template-columns: repeat(2, 1fr); /* 2-column */
  }
}

TAILWIND PATTERN:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Tablet: 2 cols, Desktop: 3 cols */}
</div>

CRITICAL TABLET RULES:
1. Tablet uses 2-column layouts (NOT 3-column like desktop)
2. Tablet supports hover effects (unlike mobile)
3. Tablet nav can be full horizontal OR optimized hamburger
4. Test on iPad (768px), iPad Pro (1024px)
5. Padding: 2rem on tablet vs 1rem mobile vs 3rem desktop



==================================================
GAP 37: TOUCH TARGET SIZES (WCAG 2.5.5)
==================================================

MINIMUM TOUCH TARGET SIZE: 44x44px (Apple HIG) / 48x48px (Material Design)
We use 44px as the minimum for all interactive elements.

TOUCH TARGET RULES:

1. BUTTONS:
   - Minimum: 44x44px (h-11 w-auto px-6 in Tailwind)
   - Recommended: 48x56px for primary CTAs
   - Mobile: Full-width (w-full h-12)

2. NAVIGATION LINKS:
   - Desktop: Padding py-2 px-4 (natural size OK)
   - Mobile: Padding py-4 px-6 (44px height minimum)

3. ICON BUTTONS (Close, Menu, Social):
   - Minimum: 44x44px (size-11)
   - With visual icon: 24px icon inside 44px touch area
   - Example: <button className="size-11 flex items-center justify-center">

4. FORM INPUTS:
   - Height: h-12 (48px) on mobile
   - Width: w-full on mobile
   - Checkbox/Radio: size-6 (24px) with larger hit area

5. CARD LINKS:
   - Entire card clickable (not just "Read More")
   - Wrap card in <Link> or <a> tag
   - Minimum card height: 200px

6. HAMBURGER MENU ICON:
   - Size: 44x44px (size-11)
   - 3 lines, each 24px wide, 3px tall, 6px apart

7. LIGHTBOX CLOSE BUTTON:
   - Size: 48x48px (size-12)
   - Position: Fixed top-right, m-4
   - Icon: X (24px) inside touch area

CSS IMPLEMENTATION:
/* Minimum touch target utility */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Icon button pattern */
.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

TAILWIND PATTERN:
<button className="size-11 flex items-center justify-center rounded-lg hover:bg-gray-100">
  <X className="size-6" />
</button>

VERIFICATION:
□ All buttons are at least 44x44px
□ All icon buttons have 44x44px hit area (even if icon is 24px)
□ Mobile nav links have py-4 (44px height)
□ Form inputs are h-12 (48px) on mobile
□ Close buttons are size-12 (48x48px)
□ No interactive element smaller than 44px on any dimension



==================================================
GAP 38: HORIZONTAL SCROLL PREVENTION
==================================================

PROBLEM: Images, containers, or text overflowing viewport width cause horizontal scrolling.

GLOBAL FIX (globals.css):
* {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

img, video, iframe {
  max-width: 100%;
  height: auto;
}

SPECIFIC FIXES:

1. IMAGES:
   - Always use: max-width: 100%, height: auto
   - OR: width: 100%, height: auto, object-fit: cover
   - Tailwind: className="w-full h-auto"

2. CONTAINERS:
   - Use: max-width: 100vw OR max-width: 100%
   - Padding: Use rem, not vw (vw can overflow)
   - Avoid: Fixed widths (width: 1200px without max-width: 100%)

3. GRID/FLEX:
   - Use: min-width: 0 on flex/grid children to allow shrinking
   - Grid: grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
   - Flex: flex-wrap: wrap

4. TEXT:
   - Long URLs/emails: word-break: break-word OR overflow-wrap: break-word
   - Pre-formatted code: overflow-x: auto (allow horizontal scroll within code block)

5. FULL-WIDTH SECTIONS:
   - Use: width: 100vw with negative margin trick:
     .full-width {
       width: 100vw;
       margin-left: calc(-50vw + 50%);
     }

6. MODALS/LIGHTBOXES:
   - Use: max-width: calc(100vw - 2rem) to account for padding
   - Never use: width: 1200px without max-width

CSS UTILITIES:
.no-scrollbar {
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;  /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome/Safari */
}

CRITICAL RULES:
1. ALWAYS set overflow-x: hidden on <html> and <body>
2. ALWAYS use max-width: 100% on images
3. NEVER use fixed widths without max-width: 100%
4. Test on mobile (375px width) to catch overflow
5. Use Chrome DevTools mobile emulator: Toggle device toolbar, select iPhone SE

VERIFICATION:
□ No horizontal scrollbar on mobile (375px, 390px, 430px)
□ All images scale to container width
□ Text wraps properly (no overflow)
□ Containers have max-width: 100% or 100vw
□ Grid/flex items shrink correctly



==================================================
GAP 39: VIEWPORT META TAG SPECIFICATION
==================================================

REQUIRED META TAG (app/layout.tsx):
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

WHAT EACH PROPERTY DOES:

1. width=device-width
   - Sets viewport width to device width (not a fixed 980px)
   - REQUIRED for responsive design

2. initial-scale=1
   - Sets initial zoom level to 100%
   - REQUIRED to prevent iOS Safari zoom bugs

3. maximum-scale=5
   - Allows user to zoom up to 500%
   - WCAG 2.1 requirement (users with low vision need zoom)
   - NEVER use maximum-scale=1 (blocks accessibility)

4. user-scalable=yes
   - Allows pinch-to-zoom
   - WCAG 2.1 requirement
   - NEVER use user-scalable=no (blocks accessibility)

NEXT.JS IMPLEMENTATION (app/layout.tsx):
export const metadata: Metadata = {
  title: 'Site Title',
  description: 'Site description',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

HTML FALLBACK (<head> if metadata doesn't work):
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

CRITICAL RULES:
1. ALWAYS include width=device-width
2. ALWAYS include initial-scale=1
3. NEVER use maximum-scale=1 or user-scalable=no (accessibility violation)
4. Test on iOS Safari (most strict browser)



==================================================
GAP 40: SAFE AREA INSETS (iPhone X+, Notched Devices)
==================================================

PROBLEM: Content hidden behind notch, status bar, or home indicator on modern iPhones.

VIEWPORT META (app/layout.tsx):
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                                                                      ^^^^^^^^^^^^^^^^
                                                                      Extends to safe area

CSS SOLUTION (globals.css):
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

HEADER (fixed to top):
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

FOOTER (fixed to bottom):
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

FULL-SCREEN MODAL:
.modal {
  position: fixed;
  inset: 0;
  padding-top: max(2rem, env(safe-area-inset-top));
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

TAILWIND PLUGIN (tailwind.config.ts):
module.exports = {
  theme: {
    extend: {
      padding: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-left': 'max(1rem, env(safe-area-inset-left))',
        'safe-right': 'max(1rem, env(safe-area-inset-right))',
      },
    },
  },
};

USAGE:
<header className="fixed top-0 inset-x-0 pt-safe-top">

CRITICAL RULES:
1. ALWAYS add viewport-fit=cover to viewport meta
2. ALWAYS use env(safe-area-inset-*) for fixed headers/footers
3. Use max() to ensure minimum padding even when safe-area is 0
4. Test on iPhone 14 Pro (notch) and iPhone 15 Pro (Dynamic Island)



==================================================
GAP 41: IMAGE srcset & sizes ATTRIBUTES
==================================================

PROBLEM: Serving full-resolution images on mobile wastes bandwidth and slows load times.

SOLUTION: Use srcset and sizes to serve appropriate image sizes.

RESPONSIVE IMAGE PATTERN:
<img 
  src="https://example.com/image-800w.jpg" 
  srcset="
    https://example.com/image-400w.jpg 400w,
    https://example.com/image-800w.jpg 800w,
    https://example.com/image-1200w.jpg 1200w,
    https://example.com/image-1600w.jpg 1600w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  alt="Descriptive alt text"
  className="w-full h-auto"
/>

WHAT srcset DOES:
- Provides multiple image sizes
- Browser picks best size based on device pixel ratio and viewport width

WHAT sizes DOES:
- Tells browser how wide the image will be displayed
- (max-width: 640px) 100vw → Full width on mobile
- (max-width: 1024px) 50vw → Half width on tablet
- 800px → Fixed width on desktop

FOR UNSPLASH IMAGES:
Use Unsplash's URL parameters:
- ?w=400 → 400px wide
- ?w=800 → 800px wide
- ?w=1200 → 1200px wide
- ?q=80 → 80% quality (good balance)

EXAMPLE:
<img 
  src="https://images.unsplash.com/photo-XXX?w=800&q=80"
  srcset="
    https://images.unsplash.com/photo-XXX?w=400&q=80 400w,
    https://images.unsplash.com/photo-XXX?w=800&q=80 800w,
    https://images.unsplash.com/photo-XXX?w=1200&q=80 1200w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  alt="Wedding photography"
/>

NEXT.JS IMAGE COMPONENT (Alternative):
<Image 
  src="/uploads/photo.jpg"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  alt="Descriptive alt text"
/>
// Next.js automatically generates srcset

CRITICAL RULES:
1. ALWAYS provide srcset for images > 400px wide
2. ALWAYS provide sizes attribute
3. Include at least 3 sizes: 400w, 800w, 1200w
4. Use ?w= and ?q= parameters for Unsplash/external images
5. Test network throttling: Chrome DevTools → Network → Slow 3G



==================================================
GAP 42: CONTAINER QUERIES (Component-Level Responsiveness)
==================================================

WHAT ARE CONTAINER QUERIES:
- Style components based on CONTAINER width (not viewport width)
- Better for modular components that can appear in sidebars, grids, etc.

BROWSER SUPPORT: Fully supported in all modern browsers (2024+)

TAILWIND CONTAINER QUERIES (Built-in since Tailwind 3.2):

1. ENABLE CONTAINER QUERIES (tailwind.config.ts):
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/container-queries'), // Not needed in Tailwind 3.2+, built-in
  ],
};

2. MARK CONTAINER:
<div className="@container">
  <div className="@md:grid-cols-2 @lg:grid-cols-3">
    {/* Responds to container width, not viewport */}
  </div>
</div>

3. CONTAINER QUERY BREAKPOINTS:
- @sm: 24rem (384px)
- @md: 28rem (448px)
- @lg: 32rem (512px)
- @xl: 36rem (576px)
- @2xl: 42rem (672px)

USE CASES:

1. REUSABLE CARD COMPONENT:
<div className="@container">
  <div className="p-4 @lg:p-6 @2xl:p-8">
    <h3 className="text-lg @lg:text-xl @2xl:text-2xl">Title</h3>
    <p className="text-sm @lg:text-base">Description</p>
  </div>
</div>
// Card adjusts padding and text size based on its container, not viewport

2. SIDEBAR WIDGET:
<aside className="@container w-80">
  <div className="grid grid-cols-1 @md:grid-cols-2">
    {/* 2 columns when sidebar is wide enough */}
  </div>
</aside>

3. DYNAMIC GRID:
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4">
    {/* Grid columns adapt to container size */}
  </div>
</div>

WHEN TO USE:
- Use VIEWPORT media queries (md:, lg:) for page-level layout
- Use CONTAINER queries (@md:, @lg:) for component-level responsiveness

CRITICAL RULES:
1. Always add @container to the parent element
2. Use @md:, @lg: prefixes (not md:, lg:) for container queries
3. Container queries work best for modular components
4. Combine with viewport queries for best results
5. Test by resizing the container, not the viewport

VERIFICATION:
□ @container added to parent elements
□ Components use @md:/@lg: for internal responsiveness
□ Components work in narrow sidebars AND full-width layouts
□ No layout breaks when component placed in different contexts



---


==================================================
ACCESSIBILITY (WCAG 2.1 AA COMPLIANCE)
==================================================


==================================================
GAP 43: ARIA LANDMARK ROLES (Screen Reader Navigation)
==================================================

WHY LANDMARKS MATTER:
- Screen reader users navigate by landmarks (not by scrolling)
- Landmarks allow "Skip to main content" and section jumping
- WCAG 2.1 requires proper page structure

REQUIRED LANDMARKS:

1. <header> OR role="banner":
<header> {/* Implicit role="banner" */}
  <nav aria-label="Main navigation"> {/* Explicit navigation */}
  </nav>
</header>

2. <nav> OR role="navigation":
<nav aria-label="Main navigation">
  {/* Use aria-label to distinguish multiple navs */}
</nav>

<nav aria-label="Footer navigation">
  {/* Second nav needs descriptive label */}
</nav>

3. <main> OR role="main":
<main id="main-content"> {/* Only ONE main per page */}
  {/* All primary content goes here */}
</main>

4. <aside> OR role="complementary":
<aside aria-label="Related articles">
  {/* Sidebar content */}
</aside>

5. <footer> OR role="contentinfo":
<footer> {/* Implicit role="contentinfo" */}
  {/* Footer content */}
</footer>

6. <section> with aria-labelledby:
<section aria-labelledby="services-heading">
  <h2 id="services-heading">Our Services</h2>
  {/* Section content */}
</section>

7. <form> OR role="search":
<form role="search" aria-label="Site search">
  <input type="search" aria-label="Search query" />
  <button type="submit">Search</button>
</form>

COMPLETE PAGE STRUCTURE:
<body>
  <header>
    <nav aria-label="Main navigation"></nav>
  </header>
  
  <main id="main-content">
    <section aria-labelledby="hero-heading">
      <h1 id="hero-heading">Welcome</h1>
    </section>
    
    <section aria-labelledby="services-heading">
      <h2 id="services-heading">Our Services</h2>
    </section>
    
    <section aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading">Testimonials</h2>
    </section>
  </main>
  
  <footer>
    <nav aria-label="Footer navigation"></nav>
  </footer>
</body>

SKIP LINK (first focusable element):
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white">
  Skip to main content
</a>

CRITICAL RULES:
1. Only ONE <header>, <main>, <footer> per page
2. Use aria-label or aria-labelledby on <section> elements
3. Distinguish multiple <nav> elements with aria-label
4. Always include "Skip to main content" link
5. Use semantic HTML (<header>, <nav>, <main>) instead of <div role="">

VERIFICATION:
□ Page has <header>, <main>, <footer>
□ All <section> elements have aria-labelledby
□ Multiple <nav> elements have aria-label
□ "Skip to main content" link is first focusable element
□ Test with screen reader (NVDA on Windows, VoiceOver on Mac)



==================================================
GAP 44: KEYBOARD NAVIGATION (WCAG 2.1.1)
==================================================

ALL interactive elements MUST be keyboard accessible.

KEYBOARD SHORTCUTS:
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons and links
- Escape: Close modals, menus, dropdowns
- Arrow keys: Navigate within menus, carousels, tabs

INTERACTIVE ELEMENTS:

1. BUTTONS:
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click Me
</button>

2. LINKS:
<a href="#section" className="focus-visible:ring-2 focus-visible:ring-primary">
  Link Text
</a>

3. CUSTOM INTERACTIVE ELEMENTS (e.g., card as link):
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="cursor-pointer focus-visible:ring-2"
>
  Card Content
</div>

4. DROPDOWN MENU:
<button
  onClick={() => setMenuOpen(!menuOpen)}
  onKeyDown={(e) => {
    if (e.key === 'Escape') setMenuOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Focus first menu item
    }
  }}
  aria-expanded={menuOpen}
  aria-haspopup="true"
>
  Menu
</button>

<ul role="menu" hidden={!menuOpen}>
  <li role="menuitem">
    <a href="#" onKeyDown={(e) => {
      if (e.key === 'ArrowDown') {/* Focus next */}
      if (e.key === 'ArrowUp') {/* Focus previous */}
      if (e.key === 'Escape') setMenuOpen(false);
    }}>
      Item 1
    </a>
  </li>
</ul>

5. MODAL/DIALOG:
useEffect(() => {
  if (modalOpen) {
    // Trap focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'Tab') {
        // Trap focus within modal
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }
}, [modalOpen]);

6. CAROUSEL/GALLERY:
<button onClick={prevSlide} aria-label="Previous slide">
  <ChevronLeft />
</button>
<button onClick={nextSlide} aria-label="Next slide">
  <ChevronRight />
</button>

<div role="region" aria-label="Gallery carousel" onKeyDown={(e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
}}>
  {/* Carousel content */}
</div>

FOCUS VISIBLE STYLES (globals.css):
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline, use custom ring */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

TAILWIND FOCUS CLASSES:
<button className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">

CRITICAL RULES:
1. All interactive elements must have tabIndex (0 for in flow, -1 for out of flow)
2. All custom interactive elements need onKeyDown handler for Enter/Space
3. Escape key must close modals, menus, dropdowns
4. Arrow keys should navigate within menus, carousels
5. Focus must be visible (outline or ring)
6. Skip links must be first focusable element
7. Tab order must be logical (top to bottom, left to right)

VERIFICATION:
□ Tab through entire page (no keyboard traps)
□ Enter/Space activates all buttons and links
□ Escape closes modals/menus
□ Arrow keys navigate carousels/menus
□ Focus visible on all interactive elements
□ Tab order is logical
□ Test without mouse (keyboard only)



==================================================
GAP 45: FOCUS TRAP (Modals, Lightboxes, Drawers)
==================================================

WHY FOCUS TRAP:
- When modal opens, focus should be trapped inside modal
- User shouldn't be able to Tab to elements behind modal
- Escape key should close modal

IMPLEMENTATION (use react-focus-lock OR custom):

OPTION 1: react-focus-lock (Recommended):
npm install react-focus-lock

import FocusLock from 'react-focus-lock';

<FocusLock autoFocus returnFocus>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Modal Title</h2>
    <p>Modal content</p>
    <button onClick={closeModal}>Close</button>
  </div>
</FocusLock>

OPTION 2: Custom Focus Trap:
useEffect(() => {
  if (!modalOpen) return;

  const modal = document.getElementById('modal');
  const focusableElements = modal?.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  // Focus first element
  firstElement?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: If on first element, jump to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: If on last element, jump to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };

  document.addEventListener('keydown', handleTab);
  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('keydown', handleTab);
    document.removeEventListener('keydown', handleEscape);
  };
}, [modalOpen]);

MODAL STRUCTURE:
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  id="modal"
  className="fixed inset-0 z-50 flex items-center justify-center"
>
  {/* Backdrop */}
  <div 
    className="absolute inset-0 bg-black/50"
    onClick={closeModal}
    aria-hidden="true"
  />
  
  {/* Modal Content */}
  <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
    <h2 id="modal-title" className="text-2xl font-bold mb-4">
      Modal Title
    </h2>
    
    <p>Modal content here</p>
    
    <button 
      onClick={closeModal}
      className="absolute top-4 right-4"
      aria-label="Close modal"
    >
      <X className="size-6" />
    </button>
  </div>
</div>

LIGHTBOX EXAMPLE:
<FocusLock autoFocus returnFocus>
  <div role="dialog" aria-modal="true" aria-label="Image lightbox">
    <img src={currentImage} alt={currentImageAlt} />
    
    <button onClick={prevImage} aria-label="Previous image">
      <ChevronLeft />
    </button>
    
    <button onClick={nextImage} aria-label="Next image">
      <ChevronRight />
    </button>
    
    <button onClick={closeLightbox} aria-label="Close lightbox">
      <X />
    </button>
  </div>
</FocusLock>

CRITICAL RULES:
1. Use role="dialog" and aria-modal="true"
2. Use aria-labelledby or aria-label to describe modal
3. Trap focus inside modal (Tab cycles within modal)
4. Escape key closes modal
5. Return focus to trigger element when modal closes
6. Backdrop should be aria-hidden="true"

VERIFICATION:
□ Tab stays within modal (doesn't escape to background)
□ Shift+Tab cycles backward within modal
□ Escape closes modal
□ Focus returns to trigger element after closing
□ Screen reader announces modal role and label



==================================================
GAP 46: SCREEN READER ONLY TEXT (WCAG 1.3.1)
==================================================

WHY SCREEN READER TEXT:
- Provide context for screen reader users that sighted users don't need
- Example: "Read more" link → "Read more about [service name]"

SR-ONLY UTILITY (globals.css):
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: initial;
  margin: initial;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

TAILWIND BUILT-IN:
<span className="sr-only">Screen reader only text</span>

USE CASES:

1. ICON-ONLY BUTTONS:
<button aria-label="Close modal">
  <X className="size-6" />
  <span className="sr-only">Close modal</span>
</button>

2. GENERIC "READ MORE" LINKS:
<a href="/services/photography">
  Read more
  <span className="sr-only"> about wedding photography</span>
</a>

3. FORM LABELS (when visual label is hidden):
<div>
  <label htmlFor="email" className="sr-only">Email address</label>
  <input 
    id="email" 
    type="email" 
    placeholder="Email address"
    aria-label="Email address"
  />
</div>

4. SKIP LINKS:
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
  Skip to main content
</a>

5. LOADING/STATUS INDICATORS:
<div role="status" aria-live="polite">
  <Spinner className="animate-spin" />
  <span className="sr-only">Loading...</span>
</div>

6. PAGINATION:
<nav aria-label="Pagination">
  <a href="?page=1" aria-label="Go to page 1">
    1
  </a>
  <span aria-current="page" aria-label="Current page, page 2">
    2
  </span>
  <a href="?page=3" aria-label="Go to page 3">
    3
  </a>
</nav>

7. SOCIAL ICONS:
<a href="https://facebook.com/business" aria-label="Visit us on Facebook">
  <Facebook className="size-6" />
  <span className="sr-only">Facebook</span>
</a>

CRITICAL RULES:
1. ALWAYS add sr-only text to icon-only buttons
2. ALWAYS make generic links descriptive ("Read more about X")
3. NEVER hide important content with sr-only (only use for extra context)
4. Use aria-label OR sr-only (not both)
5. Test with screen reader (NVDA, VoiceOver)

VERIFICATION:
□ All icon-only buttons have aria-label or sr-only
□ All "Read more" links are descriptive
□ Skip link works (Tab to focus, Enter to jump)
□ Social icons have descriptive labels
□ Test with NVDA (Windows) or VoiceOver (Mac)



==================================================
GAP 47: COLOR CONTRAST RATIOS (WCAG 1.4.3)
==================================================

WCAG AA REQUIREMENTS:
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px OR ≥ 14px bold): 3:1 contrast ratio
- UI components (buttons, form inputs): 3:1 contrast ratio

WCAG AAA REQUIREMENTS (Aspirational):
- Normal text: 7:1 contrast ratio
- Large text: 4.5:1 contrast ratio

COLOR CONTRAST CHECKER:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect element → Accessibility tab → Contrast ratio

COMMON VIOLATIONS:

1. LIGHT TEXT ON WHITE BACKGROUND:
❌ BAD: #999999 on #FFFFFF (2.8:1 - FAIL)
✅ GOOD: #666666 on #FFFFFF (5.7:1 - PASS)

2. DARK TEXT ON DARK BACKGROUND:
❌ BAD: #333333 on #000000 (5.7:1 - FAIL for UI)
✅ GOOD: #FFFFFF on #000000 (21:1 - PASS)

3. COLORED TEXT ON COLORED BACKGROUND:
❌ BAD: #FF6B6B on #FFF5F5 (1.8:1 - FAIL)
✅ GOOD: #DC2626 on #FFF5F5 (5.2:1 - PASS)

4. PRIMARY BUTTON:
❌ BAD: #FFEB3B (yellow) with white text (1.2:1 - FAIL)
✅ GOOD: #0EA5E9 (blue) with white text (4.5:1 - PASS)

COLOR PALETTE VALIDATION:

PRIMARY (Buttons, Links):
- If background is dark → Use light text (#FFFFFF)
- If background is light → Use dark text (#000000 or #1A1A1A)
- Test: Check contrast ratio with WebAIM

SECONDARY (Muted Text):
- Minimum: #666666 on #FFFFFF (5.7:1)
- Recommended: #4B5563 (gray-600) on #FFFFFF (7.5:1)

ACCENT (Badges, Highlights):
- Must meet 3:1 contrast against background
- Example: #F59E0B (amber-500) on #FFFBF5 (cream) = 4.2:1 ✅

CSS CUSTOM PROPERTIES WITH CONTRAST GUARDS:
:root {
  --color-primary: #0EA5E9;
  --color-on-primary: #FFFFFF; /* Always sufficient contrast */
  --color-secondary: #6366F1;
  --color-on-secondary: #FFFFFF;
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A; /* 16.1:1 on white */
  --color-muted: #6B7280; /* 4.6:1 on white */
}

TAILWIND COLOR RECOMMENDATIONS:
- Text: text-gray-900 (very dark) or text-gray-800
- Muted text: text-gray-600 or text-gray-500 (test first!)
- Links: text-blue-600 (sufficient contrast on white)
- Buttons: bg-blue-600 text-white (sufficient contrast)

VERIFICATION TOOLS:
1. axe DevTools (Chrome extension)
2. WAVE (Web Accessibility Evaluation Tool)
3. WebAIM Contrast Checker
4. Chrome DevTools Accessibility Panel

CRITICAL RULES:
1. ALWAYS check contrast ratios for text
2. Body text must be at least 4.5:1 (WCAG AA)
3. UI components (buttons) must be at least 3:1
4. Don't rely on color alone (use icons, labels, patterns)
5. Test with color blindness simulators

VERIFICATION:
□ All body text meets 4.5:1 contrast
□ All UI components meet 3:1 contrast
□ Run axe DevTools (0 contrast violations)
□ Test with WebAIM Contrast Checker
□ Simulate color blindness (Chrome DevTools → Rendering → Emulate vision deficiencies)



==================================================
GAP 48: ALT TEXT WRITING GUIDELINES (WCAG 1.1.1)
==================================================

WHY ALT TEXT MATTERS:
- Screen readers read alt text aloud
- Alt text displays when image fails to load
- Search engines use alt text for SEO
- Required by WCAG 2.1 Level A

ALT TEXT RULES:

1. BE DESCRIPTIVE, NOT LITERAL:
❌ BAD: alt="IMG_1234.jpg"
❌ BAD: alt="image"
✅ GOOD: alt="Bride and groom walking down the aisle at outdoor wedding ceremony"

2. INCLUDE CONTEXT:
❌ BAD: alt="Wedding"
✅ GOOD: alt="Intimate backyard wedding ceremony in Pretoria, South Africa"

3. DECORATIVE IMAGES → EMPTY ALT:
<div style={{ backgroundImage: 'url(...)' }} role="img" aria-label=""></div>
OR
<img src="decorative-border.svg" alt="" />

4. FUNCTIONAL IMAGES → DESCRIBE FUNCTION:
<button>
  <img src="close-icon.svg" alt="Close modal" />
</button>

5. COMPLEX IMAGES → PROVIDE LONG DESCRIPTION:
<img 
  src="chart.png" 
  alt="Bar chart showing monthly revenue growth from January to December 2024"
  aria-describedby="chart-description"
/>
<p id="chart-description" className="sr-only">
  Detailed description: Revenue started at R50,000 in January...
</p>

ALT TEXT FORMULAS BY IMAGE TYPE:

PORTRAITS/PEOPLE:
"[Person name], [role/title], [context]"
Example: "Sarah Johnson, professional photographer, holding camera at outdoor photo shoot"

PRODUCTS:
"[Product name], [key features], [context]"
Example: "Chocolate wedding cake with three tiers, decorated with fresh roses and gold leaf"

BEFORE/AFTER:
"Before: [description] / After: [description]"
Example: "Before: Overgrown garden with weeds / After: Manicured lawn with flower beds"

EVENTS:
"[Event type] at [location], showing [key elements]"
Example: "Corporate team-building event at Sandton Convention Centre, team members collaborating on strategy exercise"

ARCHITECTURE/INTERIORS:
"[Room/building type], [style], [key features]"
Example: "Modern open-plan kitchen with white marble countertops, stainless steel appliances, and island seating"

FOOD:
"[Dish name], [key ingredients/presentation]"
Example: "Grilled salmon fillet with roasted vegetables and lemon herb butter"

LANDSCAPES:
"[Location/scene], [time of day], [notable features]"
Example: "Table Mountain at sunset, viewed from Camps Bay beach with orange and purple sky"

SERVICES (ABSTRACT):
"[Service action/outcome], [industry context]"
Example: "Security guard monitoring CCTV screens in control room"

ALT TEXT DON'TS:
❌ Don't start with "Image of" or "Picture of" (screen readers already announce "image")
❌ Don't use ALL CAPS (screen readers may spell out letters)
❌ Don't exceed 125 characters (screen readers may cut off)
❌ Don't include file names or technical details
❌ Don't repeat caption text (if caption is visible)

ALT TEXT LENGTH:
- Aim for 125 characters or less
- If longer description needed, use aria-describedby

CRITICAL RULES:
1. EVERY image must have alt attribute (even if alt="")
2. Decorative images: alt=""
3. Functional images: Describe function, not appearance
4. Content images: Describe what's important in context
5. Include location for local businesses
6. Never leave alt text empty for content images

VERIFICATION:
□ All <img> tags have alt attribute
□ No alt text says "image" or "photo"
□ Decorative images have alt=""
□ Content images have descriptive alt text
□ Alt text is < 125 characters
□ Run axe DevTools (0 missing alt text violations)



==================================================
GAP 49: FORM ERROR ANNOUNCEMENT (WCAG 3.3.1, 3.3.3)
==================================================

WHY ERROR ANNOUNCEMENTS MATTER:
- Screen reader users can't see red error messages
- Errors must be announced programmatically
- Errors must be associated with form fields

FORM ERROR PATTERN:

1. FIELD-LEVEL ERRORS (Real-time validation):
<div>
  <label htmlFor="email">Email address</label>
  <input 
    id="email"
    type="email"
    aria-invalid={emailError ? 'true' : 'false'}
    aria-describedby={emailError ? 'email-error' : undefined}
    className={emailError ? 'border-red-500' : 'border-gray-300'}
  />
  {emailError && (
    <p id="email-error" role="alert" className="text-red-600 text-sm mt-1">
      {emailError}
    </p>
  )}
</div>

2. FORM-LEVEL ERRORS (Submit validation):
{formErrors.length > 0 && (
  <div 
    role="alert" 
    aria-live="assertive" 
    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
  >
    <h3 className="font-bold text-red-800 mb-2">
      {formErrors.length} error{formErrors.length > 1 ? 's' : ''} found:
    </h3>
    <ul className="list-disc list-inside text-red-700">
      {formErrors.map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  </div>
)}

3. SUCCESS CONFIRMATION:
{submitted && (
  <div 
    role="status" 
    aria-live="polite" 
    className="bg-green-50 border border-green-200 rounded-lg p-4"
  >
    <p className="text-green-800">
      ✓ Form submitted successfully! We'll get back to you within 24 hours.
    </p>
  </div>
)}

ARIA LIVE REGIONS:

role="alert" (Assertive):
- Announces immediately, interrupts screen reader
- Use for ERRORS

role="status" (Polite):
- Announces after current speech
- Use for SUCCESS, INFO, WARNINGS

aria-live="assertive":
- Same as role="alert"
- Use for critical errors

aria-live="polite":
- Same as role="status"
- Use for non-critical updates

COMPLETE FORM EXAMPLE:
<form onSubmit={handleSubmit}>
  {/* Form-level error summary */}
  {formErrors.length > 0 && (
    <div role="alert" className="bg-red-50 p-4 mb-4 rounded-lg">
      <h3>Please fix the following errors:</h3>
      <ul>
        {formErrors.map(error => <li key={error}>{error}</li>)}
      </ul>
    </div>
  )}

  {/* Name field */}
  <div>
    <label htmlFor="name">
      Name <span aria-label="required">*</span>
    </label>
    <input 
      id="name"
      type="text"
      required
      aria-required="true"
      aria-invalid={nameError ? 'true' : 'false'}
      aria-describedby={nameError ? 'name-error' : 'name-hint'}
    />
    <p id="name-hint" className="text-sm text-gray-600">
      Enter your full name
    </p>
    {nameError && (
      <p id="name-error" role="alert" className="text-red-600 text-sm">
        {nameError}
      </p>
    )}
  </div>

  {/* Email field */}
  <div>
    <label htmlFor="email">
      Email <span aria-label="required">*</span>
    </label>
    <input 
      id="email"
      type="email"
      required
      aria-required="true"
      aria-invalid={emailError ? 'true' : 'false'}
      aria-describedby={emailError ? 'email-error' : 'email-hint'}
    />
    <p id="email-hint" className="text-sm text-gray-600">
      We'll never share your email
    </p>
    {emailError && (
      <p id="email-error" role="alert" className="text-red-600 text-sm">
        {emailError}
      </p>
    )}
  </div>

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>

ERROR MESSAGE WRITING:

❌ BAD: "Invalid"
✅ GOOD: "Please enter a valid email address"

❌ BAD: "Required"
✅ GOOD: "Name is required"

❌ BAD: "Error"
✅ GOOD: "Password must be at least 8 characters"

CRITICAL RULES:
1. Use aria-invalid="true" on fields with errors
2. Use aria-describedby to link error message to field
3. Use role="alert" for errors (announced immediately)
4. Use role="status" for success messages (polite)
5. Error messages must be visible AND announced
6. Required fields must have aria-required="true"
7. Focus first error field after submit

VERIFICATION:
□ All required fields have aria-required="true"
□ Error messages have role="alert"
□ Error messages are linked with aria-describedby
□ Fields with errors have aria-invalid="true"
□ Success messages have role="status"
□ Test with screen reader (NVDA, VoiceOver)
□ Form errors are announced on submit



---


==================================================
MICRO-INTERACTIONS & POLISH
==================================================


==================================================
GAP 50: HOVER STATE TIMING & ANIMATION SPECS
==================================================

WHY HOVER TIMING MATTERS:
- Too fast: Jarring, distracting
- Too slow: Feels sluggish, unresponsive
- Optimal: 150-300ms for most interactions

HOVER TIMING SCALE:

1. INSTANT (0ms) - No transition:
   - Text color changes
   - Cursor changes
   Example: cursor-pointer (no transition needed)

2. SNAPPY (150ms) - Quick feedback:
   - Button background changes
   - Link underlines
   - Icon color changes
   Example: transition-colors duration-150

3. SMOOTH (200-250ms) - Standard interactions:
   - Card hover effects (scale, translate)
   - Shadow elevation
   - Border changes
   Example: transition-all duration-200

4. GENTLE (300ms) - Elegant, subtle:
   - Image zoom/scale
   - Complex transform animations
   - Fade in/out
   Example: transition-transform duration-300

5. SLOW (400-500ms) - Intentional, dramatic:
   - Hero section parallax
   - Page transitions
   - Modal open/close
   Example: transition-all duration-500

EASING FUNCTIONS:

linear: Constant speed (rarely used)
- Example: Progress bars, loading spinners

ease: Default (slow start, fast middle, slow end)
- Example: Most hover effects

ease-in: Slow start, fast end
- Example: Dropdown menus appearing

ease-out: Fast start, slow end (MOST COMMON)
- Example: Buttons, cards, links (feels responsive)

ease-in-out: Slow start and end, fast middle
- Example: Modal animations, page transitions

cubic-bezier(0.16, 1, 0.3, 1): Custom "Bounce-out" (Apple-style)
- Example: Premium feel, hero animations

COMPONENT-SPECIFIC TIMING:

1. BUTTONS:
<button className="
  bg-primary text-white px-6 py-3 rounded-lg
  transition-colors duration-150 ease-out
  hover:bg-primary/90
  active:scale-95 active:duration-100
">
  Click Me
</button>

CSS:
.button {
  transition: background-color 150ms ease-out,
              transform 100ms ease-out;
}
.button:hover {
  background-color: ...;
}
.button:active {
  transform: scale(0.95);
}

2. CARDS:
<div className="
  group p-6 bg-white rounded-xl shadow-md
  transition-all duration-200 ease-out
  hover:-translate-y-1 hover:shadow-xl
">
  <img className="
    transition-transform duration-300 ease-out
    group-hover:scale-105
  " />
</div>

CSS:
.card {
  transition: transform 200ms ease-out,
              box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: ...;
}
.card img {
  transition: transform 300ms ease-out;
}
.card:hover img {
  transform: scale(1.05);
}

3. LINKS:
<a className="
  relative text-primary
  after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
  after:bg-primary after:transition-all after:duration-200 after:ease-out
  hover:after:w-full
">
  Link Text
</a>

CSS:
.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width 200ms ease-out;
}
.link:hover::after {
  width: 100%;
}

4. IMAGES (Gallery):
<div className="overflow-hidden rounded-lg">
  <img className="
    transition-transform duration-300 ease-out
    hover:scale-110
  " />
</div>

5. ICONS (Micro-interactions):
<button>
  <Heart className="
    transition-all duration-200 ease-out
    hover:scale-110 hover:text-red-500
  " />
</button>

6. NAVIGATION LINKS:
<a className="
  relative py-2 px-4
  transition-colors duration-150 ease-out
  hover:text-primary
  after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5
  after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 after:ease-out
  hover:after:scale-x-100
">
  Nav Link
</a>

7. DROPDOWN MENU:
<div className="
  absolute top-full left-0 mt-2
  opacity-0 scale-95 pointer-events-none
  transition-all duration-200 ease-out
  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
">
  Dropdown Content
</div>

MOBILE CONSIDERATIONS:

DISABLE HOVER ON TOUCH DEVICES:
@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px);
  }
}

/* OR in Tailwind: */
<div className="md:hover:-translate-y-1">
  {/* Only apply hover on devices with mouse */}
</div>

TAILWIND TRANSITION CLASSES:
- transition-none: No transition
- transition-all: All properties
- transition-colors: Color properties only
- transition-opacity: Opacity only
- transition-transform: Transform only
- transition-shadow: Box-shadow only

- duration-75: 75ms
- duration-100: 100ms
- duration-150: 150ms (buttons, links)
- duration-200: 200ms (cards, most interactions)
- duration-300: 300ms (images, complex animations)
- duration-500: 500ms (modals, page transitions)
- duration-700: 700ms (hero parallax)

- ease-linear: linear
- ease-in: ease-in
- ease-out: ease-out (MOST COMMON)
- ease-in-out: ease-in-out

CRITICAL RULES:
1. Buttons: 150ms ease-out (feels responsive)
2. Cards: 200ms ease-out (smooth elevation)
3. Images: 300ms ease-out (elegant zoom)
4. Use ease-out for 90% of hover effects
5. Disable hover on touch devices (@media (hover: hover))
6. Always include transition property (not just :hover state)
7. Active state should be faster (100ms)

VERIFICATION:
□ All hover effects have transition timing specified
□ Buttons transition in 150ms
□ Cards transition in 200ms
□ Images transition in 300ms
□ Hover disabled on mobile (@media (hover: hover))
□ Active states are faster than hover states
□ No jarring animations (too fast) or sluggish animations (too slow)



==================================================
GAP 55: TOAST NOTIFICATION SPECIFICATIONS
==================================================

TOAST POSITIONING:

Desktop (≥ 768px):
- Position: Fixed top-right
- Offset: top: 1rem, right: 1rem
- Stack: Vertically downward
- Max visible: 5 toasts

Mobile (< 768px):
- Position: Fixed bottom-center
- Offset: bottom: 1rem, left: 1rem, right: 1rem
- Stack: Vertically upward
- Max visible: 3 toasts

TOAST TIMING:

Auto-dismiss Duration:
- Success: 3000ms (3 seconds)
- Info: 4000ms (4 seconds)
- Warning: 5000ms (5 seconds)
- Error: 7000ms (7 seconds)
- Critical error: No auto-dismiss (manual close only)

Animation Duration:
- Enter: 300ms ease-out
- Exit: 300ms ease-in
- Progress bar: Matches auto-dismiss duration (linear)

TOAST STRUCTURE:

<div className="fixed z-50 md:top-4 md:right-4 md:bottom-auto md:left-auto bottom-4 left-4 right-4 top-auto">
  {toasts.map(toast => (
    <div 
      key={toast.id}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="
        mb-3 p-4 rounded-lg shadow-lg
        flex items-start gap-3
        animate-slide-in
        bg-white dark:bg-gray-800
      "
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {toast.type === 'success' && <CheckCircle className="size-5 text-green-500" />}
        {toast.type === 'error' && <XCircle className="size-5 text-red-500" />}
        {toast.type === 'warning' && <AlertTriangle className="size-5 text-amber-500" />}
        {toast.type === 'info' && <Info className="size-5 text-blue-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
        
        {/* Progress bar (if auto-dismiss) */}
        {toast.duration && (
          <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary animate-progress"
              style={{'{{'}} animationDuration: BACKTICK dollar-brace toast.duration BACKTICK ms BACKTICK {'}}'}
            />
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="
          flex-shrink-0 size-8 flex items-center justify-center
          rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150
        "
      >
        <X className="size-4" />
      </button>
    </div>
  ))}
</div>

ANIMATIONS (globals.css):

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slide-in {
  animation: slide-in 300ms ease-out;
}

.animate-slide-out {
  animation: slide-out 300ms ease-in;
}

.animate-progress {
  animation: progress linear;
}

/* Mobile: Slide from bottom */
@media (max-width: 767px) {
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100%);
    }
  }
}

ZUSTAND TOAST STORE (lib/use-toast.ts):

import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const AUTO_DISMISS_DURATIONS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 7000,
};

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = toast.duration ?? AUTO_DISMISS_DURATIONS[toast.type];
    
    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id, duration }];
      // Limit to 5 toasts (desktop) or 3 (mobile)
      const maxToasts = window.innerWidth >= 768 ? 5 : 3;
      return {
        toasts: newToasts.slice(-maxToasts),
      };
    });
    
    // Auto-dismiss
    if (duration) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => set({ toasts: [] }),
}));

// Convenience functions
export const toast = {
  success: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'success', title, message });
  },
  
  error: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'error', title, message });
  },
  
  warning: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'warning', title, message });
  },
  
  info: (title: string, message?: string) => {
    useToast.getState().addToast({ type: 'info', title, message });
  },
};

USAGE IN COMPONENTS:

import { toast } from '@/lib/use-toast';

function ContactForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitForm(formData);
      toast.success(
        'Message sent!',
        "We'll get back to you within 24 hours."
      );
    } catch (error) {
      toast.error(
        'Submission failed',
        'Please try again or call us directly.'
      );
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

ACCESSIBILITY:

role="alert" (Errors):
- Announced immediately
- Interrupts screen reader

role="status" (Success, Info, Warning):
- Announced politely
- Doesn't interrupt

aria-live="assertive" (Errors):
- Same as role="alert"

aria-live="polite" (Others):
- Same as role="status"

CRITICAL RULES:
1. Desktop: top-right, mobile: bottom-center
2. Auto-dismiss: 3s (success), 4s (info), 5s (warning), 7s (error)
3. Max visible: 5 (desktop), 3 (mobile)
4. Animation: 300ms slide-in/out
5. Progress bar: Linear animation matching duration
6. Close button: 44x44px touch target
7. Use role="alert" for errors, role="status" for others
8. Include icon for visual identification

VERIFICATION:
□ Toasts appear in correct position (top-right/bottom-center)
□ Auto-dismiss after correct duration
□ Progress bar animates correctly
□ Close button works (44x44px touch target)
□ Maximum toast limit enforced
□ Smooth enter/exit animations
□ Screen reader announces toasts
□ Color contrast meets WCAG AA


