/**
 * Responsive & Breakpoint Enhancement Helpers for Prompt Builder
 * Implements GAP 35-42: Mobile layouts, tablet breakpoints, touch targets, scroll prevention, viewport meta, safe areas, image srcset, container queries
 */

export function buildResponsiveSpecifications(): string {
  return `
==================================================
RESPONSIVE DESIGN SPECIFICATIONS (COMPLETE)
==================================================

${buildMobileLayoutInstructions()}

${buildTabletBreakpointInstructions()}

${buildTouchTargetInstructions()}

${buildScrollPreventionInstructions()}

${buildViewportMetaInstructions()}

${buildSafeAreaInstructions()}

${buildImageSrcsetInstructions()}

${buildContainerQueryInstructions()}
`;
}

/**
 * GAP 35: Mobile Layout Instructions
 */
function buildMobileLayoutInstructions(): string {
  return `
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
`;
}

/**
 * GAP 36: Tablet Breakpoint Guidance
 */
function buildTabletBreakpointInstructions(): string {
  return `
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
`;
}

/**
 * GAP 37: Touch Target Size Specifications
 */
function buildTouchTargetInstructions(): string {
  return `
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
`;
}

/**
 * GAP 38: Horizontal Scroll Prevention
 */
function buildScrollPreventionInstructions(): string {
  return `
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
`;
}

/**
 * GAP 39: Viewport Meta Tag
 */
function buildViewportMetaInstructions(): string {
  return `
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
`;
}

/**
 * GAP 40: Safe Area Insets for Notched Devices
 */
function buildSafeAreaInstructions(): string {
  return `
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
`;
}

/**
 * GAP 41: Image srcset/sizes Attributes
 */
function buildImageSrcsetInstructions(): string {
  return `
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
`;
}

/**
 * GAP 42: Container Query Specifications
 */
function buildContainerQueryInstructions(): string {
  return `
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
`;
}
