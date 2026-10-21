/**
 * Typography Enhancement Helpers for Prompt Builder
 * Implements GAP 31-34: Font Loading, Line Heights, Responsive Scale, Letter Spacing
 */

export interface TypographySpecs {
  headingFont: string;
  bodyFont: string;
  fontLoadingStrategy: string;
  lineHeights: Record<string, string>;
  responsiveTypeScale: string;
  letterSpacing: Record<string, string>;
}

/**
 * Generate complete typography specifications for prompt
 * Covers: Font loading strategy, line heights, responsive scale, letter spacing
 */
export function generateTypographySpecs(
  headingFont: string,
  bodyFont: string
): TypographySpecs {
  return {
    headingFont,
    bodyFont,
    fontLoadingStrategy: generateFontLoadingStrategy(headingFont, bodyFont),
    lineHeights: getLineHeightSpecs(),
    responsiveTypeScale: getResponsiveTypeScale(),
    letterSpacing: getLetterSpacingSpecs(headingFont),
  };
}

/**
 * GAP 31: Font Loading Strategy
 * Provide explicit Next.js font loading instructions to prevent FOIT/FOUT
 */
function generateFontLoadingStrategy(headingFont: string, bodyFont: string): string {
  const cleanHeading = headingFont.replace(/\s+/g, '_');
  const cleanBody = bodyFont.replace(/\s+/g, '_');

  return `
FONT LOADING STRATEGY (app/layout.tsx):

import { ${cleanHeading}, ${cleanBody} } from 'next/font/google';

const headingFont = ${cleanHeading}({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
});

const bodyFont = ${cleanBody}({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${headingFont.variable} \${bodyFont.variable}\`}>
      <body className={bodyFont.className}>
        {children}
      </body>
    </html>
  );
}

CSS CUSTOM PROPERTIES (globals.css):
:root {
  --font-heading: ${headingFont}, serif;
  --font-body: ${bodyFont}, sans-serif;
}

USAGE IN COMPONENTS:
- Headings (h1-h6): className="font-heading" → applies var(--font-heading)
- Body text (p, span, div): Inherits from <body> → automatically uses ${bodyFont}
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
`;
}

/**
 * GAP 32: Line Height Specifications
 * Provide explicit line-height values for optimal readability
 */
function getLineHeightSpecs(): Record<string, string> {
  return {
    'h1': '1.1', // Tight for large display text
    'h2': '1.2',
    'h3': '1.3',
    'h4': '1.4',
    'h5': '1.4',
    'h6': '1.4',
    'body': '1.6', // Optimal for body text readability
    'lead': '1.5', // Slightly tighter for lead paragraphs
    'small': '1.5',
    'button': '1', // Tight for button text
    'nav': '1.2', // Tight for navigation
  };
}

/**
 * Generate line height instructions for prompt
 */
export function buildLineHeightInstructions(): string {
  const specs = getLineHeightSpecs();

  return `
==================================================
LINE-HEIGHT SPECIFICATIONS (WCAG READABILITY)
==================================================

Apply these EXACT line-height values for optimal readability:

HEADINGS (tighter for hierarchy):
- h1: line-height: ${specs['h1']} (leading-tight in Tailwind)
- h2: line-height: ${specs['h2']}
- h3: line-height: ${specs['h3']}
- h4-h6: line-height: ${specs['h4']}

BODY TEXT (generous for readability):
- Paragraphs (p): line-height: ${specs['body']} (leading-relaxed)
- Lead text (.lead): line-height: ${specs['lead']}
- Small text: line-height: ${specs['small']}

UI ELEMENTS (compact):
- Buttons: line-height: ${specs['button']} (leading-none)
- Navigation links: line-height: ${specs['nav']}

CSS IMPLEMENTATION:
:root {
  --line-height-heading: ${specs['h1']};
  --line-height-body: ${specs['body']};
  --line-height-tight: ${specs['nav']};
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
`;
}

/**
 * GAP 33: Responsive Typography Scale
 * Provide explicit fluid typography rules
 */
function getResponsiveTypeScale(): string {
  return `
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
`;
}

/**
 * GAP 34: Letter-Spacing Guidelines
 * Provide explicit letter-spacing values for polish
 */
function getLetterSpacingSpecs(headingFont: string): Record<string, string> {
  // Serif fonts need less tracking, sans-serif need more
  const isSerif = /serif|garamond|playfair|merriweather|lora|crimson/i.test(headingFont);

  if (isSerif) {
    return {
      'display': '-0.02em', // Tight for large serif
      'h1': '-0.01em',
      'h2': '0em',
      'h3': '0em',
      'body': '0em',
      'uppercase': '0.05em', // Wide for uppercase
      'button': '0.025em',
    };
  } else {
    return {
      'display': '-0.015em', // Slightly tight for large sans
      'h1': '0em',
      'h2': '0em',
      'h3': '0em',
      'body': '0.01em', // Slight breathing room
      'uppercase': '0.1em', // Wide for uppercase sans
      'button': '0.05em',
    };
  }
}

/**
 * Build letter-spacing instructions for prompt
 */
export function buildLetterSpacingInstructions(headingFont: string): string {
  const specs = getLetterSpacingSpecs(headingFont);
  const isSerif = /serif|garamond|playfair|merriweather|lora|crimson/i.test(headingFont);

  return `
==================================================
LETTER-SPACING (TRACKING) SPECIFICATIONS
==================================================

Font Family: ${headingFont} ${isSerif ? '(Serif)' : '(Sans-serif)'}

Apply these EXACT letter-spacing values:

DISPLAY TEXT (Hero Headlines):
- letter-spacing: ${specs['display']} (tracking-tight)
- Why: Tight tracking for visual impact

HEADINGS:
- h1: letter-spacing: ${specs['h1']}
- h2-h3: letter-spacing: ${specs['h2']}
- Why: ${isSerif ? 'Serifs need minimal tracking' : 'Sans-serif needs slight breathing room'}

BODY TEXT:
- Paragraphs: letter-spacing: ${specs['body']} (tracking-normal)
- Why: Optimal for extended reading

UPPERCASE TEXT (Badges, Labels):
- letter-spacing: ${specs['uppercase']} (tracking-wider)
- Why: Uppercase ALWAYS needs generous spacing

BUTTONS & CTAs:
- letter-spacing: ${specs['button']} (tracking-wide)
- Why: Improves clickability and prominence

CSS IMPLEMENTATION:
.text-display {
  letter-spacing: ${specs['display']};
}

.uppercase, .badge {
  letter-spacing: ${specs['uppercase']};
  text-transform: uppercase;
}

button, .btn {
  letter-spacing: ${specs['button']};
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
4. ${isSerif ? 'Serif fonts need less tracking overall' : 'Sans-serif fonts benefit from slight tracking'}
5. Never use negative tracking on body text (< 16px)

VERIFICATION:
□ All uppercase text has tracking-wider or tracking-widest
□ Hero headlines have tight tracking
□ Body paragraphs have normal tracking
□ Buttons have slight tracking (0.025-0.05em)
□ No text feels cramped or overly spaced
`;
}

/**
 * Build complete typography section for prompt
 */
export function buildTypographySection(headingFont: string, bodyFont: string): string {
  const specs = generateTypographySpecs(headingFont, bodyFont);

  return `
==================================================
TYPOGRAPHY SYSTEM (COMPLETE SPECIFICATIONS)
==================================================

${specs.fontLoadingStrategy}

${buildLineHeightInstructions()}

${specs.responsiveTypeScale}

${buildLetterSpacingInstructions(headingFont)}

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
`;
}
