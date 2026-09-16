/**
 * Next.js 14 Boilerplate Generator
 * Pre-generates standard files so MiMo doesn't need to create them from scratch
 */

import { MasterSiteConfig, IndustryArchetype } from '@/types/site-config'

export interface BoilerplateFiles {
  'package.json': string
  '.npmrc': string
  'next.config.js': string
  'tsconfig.json': string
  'tailwind.config.ts': string
  'postcss.config.js': string
  'app/globals.css': string
  'app/layout.tsx': string
  'app/page.tsx': string
  'app/dashboard/page.tsx': string
  'app/about/page.tsx': string
  'app/services/page.tsx': string
  'app/contact/page.tsx': string
  'app/portfolio/page.tsx': string
  'app/sitemap.ts': string
  'app/robots.ts': string
  'components/Header.tsx': string
  'components/WhatsAppWidget.tsx': string
  'components/AnimateOnScroll.tsx': string
  'components/ScrollToTop.tsx': string
  'components/VideoEmbed.tsx': string
  'components/AdditionalSections.tsx': string
  'components/_Lightbox.tsx': string
  'components/Toast.tsx': string
  'lib/use-site-data.ts': string
  'app/api/save-config/route.ts': string
  'app/api/upload/route.ts': string
  'site-config-defaults.json': string
}

export function generateBoilerplate(
  siteConfig: MasterSiteConfig,
  archetype: IndustryArchetype,
  designSeed?: { densityProfile?: string; decorativeIntensity?: string; motionIntensity?: string; staggerStrength?: string; artDirection?: string; sectionOrder?: number[] }
): BoilerplateFiles {
  const { businessName, seo, theme, hero, contact } = siteConfig
  const isDarkMode = archetype.themeMode === 'dark'
  const bg = archetype.defaultBg || theme?.palette?.bg || '#FFFFFF'
  const density = designSeed?.densityProfile || 'balanced'
  const intensity = designSeed?.decorativeIntensity || 'subtle'
  const motion = designSeed?.motionIntensity || 'moderate'
  const stagger = designSeed?.staggerStrength || 'light'
  const artDir = designSeed?.artDirection || 'editorial'

  return {
    'package.json': generatePackageJson(businessName),
    '.npmrc': 'install-links=true\nlegacy-peer-deps=true\n',
    'next.config.js': generateNextConfig(),
    'tsconfig.json': generateTsConfig(),
    'tailwind.config.ts': generateTailwindConfig(theme?.palette),
    'postcss.config.js': generatePostCssConfig(),
    'app/globals.css': generateGlobalCss(theme?.palette, isDarkMode, density, intensity, archetype.id, motion, stagger, artDir, archetype.typography.heading, archetype.typography.body),
    'app/layout.tsx': generateLayout(businessName, seo, archetype, theme, hero, siteConfig.city, artDir),
    'app/page.tsx': generateHomePage(designSeed?.sectionOrder),
    'app/dashboard/page.tsx': generateDashboardPage(),
    'app/about/page.tsx': generateSubPage('about', 'About'),
    'app/services/page.tsx': generateSubPage('services', 'Services'),
    'app/contact/page.tsx': generateSubPage('contact', 'Contact'),
    'app/portfolio/page.tsx': generateSubPage('portfolio', 'Portfolio'),
    'app/sitemap.ts': generateSitemap(),
    'app/robots.ts': generateRobots(),
    'components/Header.tsx': generateHeader(businessName, siteConfig),
    'components/WhatsAppWidget.tsx': generateWhatsAppWidget(siteConfig),
    'components/AnimateOnScroll.tsx': generateAnimateOnScroll(),
    'components/ScrollToTop.tsx': generateScrollToTop(),
    'components/VideoEmbed.tsx': generateVideoEmbed(),
    'components/AdditionalSections.tsx': generateAdditionalSections(),
    'components/_Lightbox.tsx': generateLightbox(),
    'components/Toast.tsx': generateToast(),
    'lib/use-site-data.ts': generateUseSiteData(),
    'app/api/save-config/route.ts': generateSaveConfigRoute(),
    'app/api/upload/route.ts': generateUploadRoute(),
    'site-config-defaults.json': generateSiteConfigDefaults(siteConfig, archetype, designSeed),
  }
}

function generatePackageJson(businessName: string): string {
  return JSON.stringify({
    name: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '14.2.3',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'framer-motion': '10.18.0',
      'lucide-react': '^0.378.0',
      'clsx': '^2.1.1',
      'tailwind-merge': '^2.3.0',
    },
    devDependencies: {
      typescript: '^5.4.5',
      '@types/node': '^20.12.12',
      '@types/react': '^18.3.2',
      '@types/react-dom': '^18.3.0',
      tailwindcss: '^3.4.3',
      postcss: '^8.4.38',
      autoprefixer: '^10.4.19',
    },
  }, null, 2)
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Disable font optimization to prevent build failures when Google Fonts are unreachable
  optimizeFonts: false,
}

module.exports = nextConfig
`
}

function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2)
}

function generateTailwindConfig(palette?: { primary: string; secondary: string; accent: string; bg: string }): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${palette?.primary || '#0ea5e9'}',
        secondary: '${palette?.secondary || '#6366f1'}',
        accent: '${palette?.accent || '#f59e0b'}',
        whatsapp: '#25D366',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
export default config
`
}

function generatePostCssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}

function generateGlobalCss(palette: any, isDarkMode: boolean, density: string = 'balanced', intensity: string = 'subtle', archetype: string = 'general', motion: string = 'moderate', stagger: string = 'light', artDir: string = 'editorial', fontHeading: string = 'Inter', fontBody: string = 'Inter'): string {
  // Signature elements per archetype — subtle visual cues that make each archetype feel unique
  const signatureElements: Record<string, string> = {
    'medical': `
  /* Medical UI Touches — Clean, clinical, trustworthy */
  .signature-accent { border-left: 3px solid var(--color-primary); }
  .signature-card { border-top: 2px solid var(--color-accent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 40%); pointer-events: none; }
  .signature-trust { background: color-mix(in srgb, var(--color-primary) 5%, var(--color-bg)); border-left: 3px solid var(--color-primary); padding: 1rem 1.5rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  .signature-cta { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 30%, transparent); transition: box-shadow 0.3s ease; }
  .signature-cta:hover { box-shadow: 0 0 20px 4px color-mix(in srgb, var(--color-primary) 20%, transparent); }`,
    'legal': `
  /* Legal UI Touches — Authoritative, dignified, premium */
  .signature-accent { border-bottom: 2px solid var(--color-primary); }
  .signature-card { box-shadow: 0 2px 0 var(--color-primary); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 50%); pointer-events: none; }
  .signature-trust { border-left: 4px solid var(--color-accent); padding: 1rem 1.5rem; font-style: italic; }
  .signature-cta { position: relative; overflow: hidden; }
  .signature-cta::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transform: translateX(-100%); transition: transform 0.6s ease; }
  .signature-cta:hover::after { transform: translateX(100%); }`,
    'trades': `
  /* Trades UI Touches — Bold, rugged, action-oriented */
  .signature-accent { border-left: 4px solid var(--color-accent); }
  .signature-card { border: 2px solid var(--color-primary); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, transparent 60%); pointer-events: none; }
  .signature-trust { background: var(--color-primary); color: #fff; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); display: inline-flex; align-items: center; gap: 0.5rem; }
  .signature-cta { font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.875rem; }
  .signature-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px color-mix(in srgb, var(--color-primary) 30%, transparent); }`,
    'hospitality': `
  /* Hospitality UI Touches — Warm, inviting, rounded */
  .signature-accent { border-radius: var(--radius-full); }
  .signature-card { border-radius: var(--radius-xl); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 70%, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 60%); pointer-events: none; }
  .signature-trust { background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)), var(--color-bg)); border-radius: var(--radius-xl); padding: 1.5rem; }
  .signature-cta { border-radius: var(--radius-full); }
  .signature-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--color-accent) 25%, transparent); }`,
    'retail': `
  /* Retail UI Touches — Dynamic, modern, accent highlights */
  .signature-accent { background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .signature-card { border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, transparent 50%); pointer-events: none; }
  .signature-trust { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-full); background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)); }
  .signature-cta { background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); border: none; }
  .signature-cta:hover { filter: brightness(1.1); transform: translateY(-1px); }`,
    'photography': `
  /* Photography UI Touches — Artistic, editorial, image-focused */
  .signature-accent { font-style: italic; letter-spacing: 0.05em; }
  .signature-card { overflow: hidden; }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%); pointer-events: none; }
  .signature-trust { font-style: italic; color: var(--color-muted); }
  .signature-cta { border-radius: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.8125rem; }
  .signature-cta:hover { letter-spacing: 0.15em; }`,
    'security': `
  /* Security UI Touches — Authoritative, vigilant, strong presence */
  .signature-accent { border-left: 4px solid var(--color-accent); text-transform: uppercase; letter-spacing: 0.1em; }
  .signature-card { border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.5) 100%); pointer-events: none; }
  .signature-trust { background: var(--color-primary); color: #fff; padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .signature-cta { font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .signature-cta:hover { box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent); }`,
    'realestate': `
  /* Real Estate UI Touches — Aspirational, premium, elegant spacing */
  .signature-accent { letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.75rem; }
  .signature-card { box-shadow: var(--shadow-lg); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%); pointer-events: none; }
  .signature-trust { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); background: var(--color-primary); color: #fff; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .signature-cta { border-radius: var(--radius-sm); }
  .signature-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 30px color-mix(in srgb, var(--color-primary) 25%, transparent); }`,
    'education': `
  /* Education UI Touches — Inspiring, approachable, friendly */
  .signature-accent { border-bottom: 2px dashed var(--color-accent); }
  .signature-card { border-radius: var(--radius-lg); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 50%); pointer-events: none; }
  .signature-trust { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-full); background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)); font-size: 0.8125rem; }
  .signature-cta { border-radius: var(--radius-full); }
  .signature-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 20%, transparent); }`,
    'fitness': `
  /* Fitness UI Touches — Energetic, bold, strong typography */
  .signature-accent { font-weight: 800; letter-spacing: -0.02em; }
  .signature-card { border-left: 3px solid var(--color-accent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, transparent 60%); pointer-events: none; }
  .signature-trust { background: var(--color-accent); color: var(--color-primary); padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
  .signature-cta { font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
  .signature-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px color-mix(in srgb, var(--color-accent) 30%, transparent); }`,
    'beauty': `
  /* Beauty UI Touches — Elegant, refined, soft curves */
  .signature-accent { font-style: italic; }
  .signature-card { border-radius: var(--radius-xl); box-shadow: var(--shadow-md); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 80%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 60%); pointer-events: none; }
  .signature-trust { font-style: italic; color: var(--color-accent); font-size: 0.875rem; }
  .signature-cta { border-radius: var(--radius-full); }
  .signature-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--color-accent) 25%, transparent); }`,
    'automotive': `
  /* Automotive UI Touches — Technical, precise, industrial feel */
  .signature-accent { font-family: monospace; letter-spacing: 0.05em; }
  .signature-card { border: 1px solid var(--color-muted); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.3) 100%); pointer-events: none; }
  .signature-trust { background: var(--color-primary); color: #fff; padding: 0.5rem 1rem; border-radius: var(--radius-sm); font-family: monospace; font-size: 0.75rem; text-transform: uppercase; }
  .signature-cta { font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .signature-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px color-mix(in srgb, var(--color-primary) 25%, transparent); }`,
    'nonprofit': `
  /* Nonprofit UI Touches — Dignified, warm, trustworthy */
  .signature-accent { border-bottom: 2px solid var(--color-accent); padding-bottom: 0.25rem; }
  .signature-card { border-radius: var(--radius-lg); border: 1px solid color-mix(in srgb, var(--color-accent) 15%, transparent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
  .signature-trust { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-full); background: color-mix(in srgb, var(--color-accent) 12%, var(--color-bg)); font-size: 0.8125rem; font-weight: 500; }
  .signature-cta { border-radius: var(--radius-full); }
  .signature-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 25%, transparent); }
  .signature-donate { background: var(--color-accent); color: var(--color-primary); font-weight: 700; border-radius: var(--radius-full); }
  .signature-donate:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 15px color-mix(in srgb, var(--color-accent) 30%, transparent); }`,
    'general': `
  /* General UI Touches — Clean, professional */
  .signature-accent { border-bottom: 1px solid var(--color-primary); }
  .signature-card { border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent); }
  .signature-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%); pointer-events: none; }
  .signature-trust { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg)); font-size: 0.8125rem; }
  .signature-cta { border-radius: var(--radius-md); }
  .signature-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 15px color-mix(in srgb, var(--color-primary) 20%, transparent); }`,
  }
  const signatureCSS = signatureElements[archetype] || signatureElements['general']

  // Location-aware color temperature — subtle hue shift based on region
  // This is applied as a CSS filter on the body, very subtle
  const locationTemperature = `
  /* Location-aware color temperature — applied via data attribute */
  [data-temperature="warm"] { filter: sepia(0.02) saturate(1.02); }
  [data-temperature="cool"] { filter: hue-rotate(2deg) saturate(0.98); }
  [data-temperature="neutral"] { filter: none; }`
  // Density profiles control spacing
  const densityConfig: Record<string, { sectionSm: string; sectionMd: string; sectionLg: string; gap: string; maxW: string }> = {
    airy: { sectionSm: '5rem', sectionMd: '7.5rem', sectionLg: '10rem', gap: '2rem', maxW: '1200px' },
    balanced: { sectionSm: '4rem', sectionMd: '6rem', sectionLg: '8rem', gap: '1.5rem', maxW: '1280px' },
    dense: { sectionSm: '3rem', sectionMd: '4rem', sectionLg: '6rem', gap: '1rem', maxW: '1400px' },
  }
  const d = densityConfig[density] || densityConfig.balanced

  // Decorative intensity controls overlays, grain, gradients
  const intensityCSS: Record<string, string> = {
    minimal: `
  /* Minimal decorative intensity — no overlays, no grain */`,
    subtle: `
  /* Subtle decorative intensity — light grain texture */
  body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }`,
    expressive: `
  /* Expressive decorative intensity — visible grain + decorative shapes */
  body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.6;
  }`,
  }
  const intensityCSSBlock = intensityCSS[intensity] || intensityCSS.subtle

  // Font imports as browser-side fallback (in case next/font/google fails during build)
  // Normalize font names for Google Fonts URL (Source Sans Pro -> Source Sans 3, etc.)
  const cssFontHeading = fontHeading === 'Source_Sans_Pro' ? 'Source+Sans+3' : fontHeading.replace(/\s+/g, '+')
  const cssFontBody = fontBody === 'Source_Sans_Pro' ? 'Source+Sans+3' : fontBody.replace(/\s+/g, '+')
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${cssFontHeading}:wght@400;500;600;700&family=${cssFontBody}:wght@400;500;600&display=swap');`

  return `${fontImport}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: ${palette?.primary || '#0ea5e9'};
    --color-secondary: ${palette?.secondary || '#6366f1'};
    --color-accent: ${palette?.accent || '#f59e0b'};
    --color-bg: ${isDarkMode ? '#09090b' : '#ffffff'};
    --color-text: ${isDarkMode ? '#f5f5f5' : '#1a1a1a'};
    --color-muted: ${isDarkMode ? '#9ca3af' : '#6b7280'};

    /* Surface elevation scale */
    --surface-0: var(--color-bg);
    --surface-1: color-mix(in srgb, var(--color-text) ${isDarkMode ? '5%' : '3%'}, var(--color-bg));
    --surface-2: color-mix(in srgb, var(--color-text) ${isDarkMode ? '10%' : '6%'}, var(--color-bg));

    /* Design tokens — spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --section-gap: ${d.gap};
    --max-width: ${d.maxW};

    /* Design tokens — stacked shadows (direct + ambient) */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03);
    --shadow-md: 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.06);
    --shadow-lg: 0 4px 8px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.08);
    --shadow-xl: 0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.1);
    --shadow-2xl: 0 12px 24px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.15);

    /* Design tokens — border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Design tokens — motion */
    --motion-fast: 150ms;
    --motion-normal: 300ms;
    --motion-slow: 500ms;
    --motion-easing: cubic-bezier(0.4, 0, 0.2, 1);

    /* Motion intensity tokens */
    --motion-duration: ${motion === 'subtle' ? '0.3s' : motion === 'expressive' ? '0.6s' : '0.4s'};
    --motion-distance: ${motion === 'subtle' ? '8px' : motion === 'expressive' ? '20px' : '12px'};
    --motion-stagger: ${stagger === 'none' ? '0s' : stagger === 'medium' ? '0.08s' : '0.04s'};

    /* Typography scale — fluid with clamp() */
    --type-display-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
    --type-display-weight: 700;
    --type-display-tracking: -0.03em;
    --type-display-line-height: 1.1;
    --type-h1-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
    --type-h1-weight: 700;
    --type-h1-tracking: -0.025em;
    --type-h1-line-height: 1.15;
    --type-h2-size: clamp(1.5rem, 3vw + 0.5rem, 2.5rem);
    --type-h2-weight: 600;
    --type-h2-tracking: -0.02em;
    --type-h2-line-height: 1.2;
    --type-h3-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
    --type-h3-weight: 600;
    --type-h3-tracking: -0.015em;
    --type-h3-line-height: 1.3;
    --type-body-size: clamp(0.9375rem, 1vw + 0.5rem, 1.0625rem);
    --type-body-weight: 400;
    --type-body-tracking: 0;
    --type-body-line-height: 1.65;
    --type-small-size: 0.875rem;
    --type-small-weight: 400;
    --type-small-tracking: 0.01em;
    --type-small-line-height: 1.5;
    --type-caption-size: 0.75rem;
    --type-caption-weight: 500;
    --type-caption-tracking: 0.05em;
    --type-caption-line-height: 1.4;

    /* Image treatment tokens */
    --img-contrast: ${artDir === 'bold' ? '1.1' : artDir === 'cinematic' ? '1.05' : '1.0'};
    --img-saturation: ${artDir === 'warm-organic' ? '1.1' : artDir === 'minimal' ? '0.95' : '1.0'};
    --img-warmth: ${artDir === 'warm-organic' ? '0.08' : artDir === 'cinematic' ? '-0.02' : '0'};
    --img-vignette: ${artDir === 'cinematic' ? '0.2' : artDir === 'warm-organic' ? '0.15' : '0.1'};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body), sans-serif;
    line-height: 1.6;
  }
  ${intensityCSSBlock}

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading), serif;
    font-weight: var(--heading-weight, 700);
    letter-spacing: var(--heading-tracking, -0.025em);
    line-height: var(--heading-leading, 1.15);
  }

  /* Art direction — typography personality */
  [data-art="editorial"] {
    --heading-weight: 700;
    --heading-tracking: -0.03em;
    --heading-leading: 1.05;
    --subtitle-style: normal;
    --subtitle-transform: uppercase;
    --subtitle-tracking: 0.08em;
  }
  [data-art="minimal"] {
    --heading-weight: 300;
    --heading-tracking: -0.02em;
    --heading-leading: 1.15;
    --subtitle-style: normal;
    --subtitle-transform: none;
    --subtitle-tracking: 0.02em;
  }
  [data-art="bold"] {
    --heading-weight: 800;
    --heading-tracking: -0.03em;
    --heading-leading: 1.0;
    --subtitle-style: normal;
    --subtitle-transform: uppercase;
    --subtitle-tracking: 0.1em;
  }
  [data-art="cinematic"] {
    --heading-weight: 700;
    --heading-tracking: -0.025em;
    --heading-leading: 1.1;
    --subtitle-style: normal;
    --subtitle-transform: none;
    --subtitle-tracking: 0.04em;
  }
  [data-art="warm-organic"] {
    --heading-weight: 600;
    --heading-tracking: -0.015em;
    --heading-leading: 1.2;
    --subtitle-style: italic;
    --subtitle-transform: none;
    --subtitle-tracking: 0.02em;
  }

  /* Subtitle treatment driven by art direction */
  .section-subtitle {
    font-style: var(--subtitle-style, normal);
    text-transform: var(--subtitle-transform, uppercase);
    letter-spacing: var(--subtitle-tracking, 0.08em);
  }

  /* Hero entrance choreography — driven by art direction */
  .hero-entrance {
    transition-property: opacity, transform;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-art="editorial"] .hero-entrance {
    transition-duration: 1s;
    transition-property: opacity;
  }
  [data-art="minimal"] .hero-entrance {
    transition-duration: 0.6s;
    transition-property: opacity;
  }
  [data-art="bold"] .hero-entrance {
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  [data-art="cinematic"] .hero-entrance {
    transition-duration: 0.8s;
  }
  [data-art="warm-organic"] .hero-entrance {
    transition-duration: 0.7s;
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar — branded, thin, transparent track */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--color-text) 20%, transparent);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--color-text) 35%, transparent);
  }
  * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--color-text) 20%, transparent) transparent; }

  /* Text selection — branded */
  ::selection {
    background: color-mix(in srgb, var(--color-primary) 25%, transparent);
    color: var(--color-text);
  }
}

@layer components {
  .section-padding {
    padding-top: ${d.sectionSm};
    padding-bottom: ${d.sectionSm};
  }

  @media (min-width: 768px) {
    .section-padding {
      padding-top: ${d.sectionMd};
      padding-bottom: ${d.sectionMd};
    }
  }

  @media (min-width: 1024px) {
    .section-padding {
      padding-top: ${d.sectionLg};
      padding-bottom: ${d.sectionLg};
    }
  }

  /* Button system — variants driven by design tokens */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: var(--font-body), sans-serif;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all var(--motion-normal) var(--motion-easing);
    text-decoration: none;
  }

  .btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; border-radius: var(--radius-md); }
  .btn-md { padding: 0.75rem 1.5rem; font-size: 0.9375rem; border-radius: var(--radius-md); }
  .btn-lg { padding: 1rem 2rem; font-size: 1.0625rem; border-radius: var(--radius-lg); }

  .btn-primary {
    background-color: var(--color-primary);
    color: #fff;
  }
  .btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-secondary {
    background-color: var(--color-secondary);
    color: #fff;
  }
  .btn-secondary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-outline {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  }
  .btn-outline:hover {
    background-color: var(--color-primary);
    color: #fff;
    transform: translateY(-1px);
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-text);
  }
  .btn-ghost:hover {
    background-color: color-mix(in srgb, var(--color-text) 5%, transparent);
  }

  .btn-accent {
    background-color: var(--color-accent);
    color: var(--color-primary);
  }
  .btn-accent:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Button states — active, disabled, focus-visible */
  .btn:active {
    transform: scale(0.98) translateY(0);
    transition-duration: 100ms;
  }
  .btn:disabled, .btn[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  .btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 40%, transparent);
  }
  .btn-primary, .btn-accent {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .btn-primary:hover, .btn-accent:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), var(--shadow-md);
  }
  .btn-outline:active {
    background-color: var(--color-primary);
    color: #fff;
  }
  .btn-ghost:active {
    background-color: color-mix(in srgb, var(--color-text) 8%, transparent);
  }

  /* Form system — consistent input styling */
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-family: var(--font-body), sans-serif;
    font-size: 0.9375rem;
    color: var(--color-text);
    background-color: var(--color-bg);
    border: 1px solid color-mix(in srgb, var(--color-text) 15%, transparent);
    border-radius: var(--radius-md);
    outline: none;
    transition: border-color var(--motion-fast) var(--motion-easing), box-shadow var(--motion-fast) var(--motion-easing);
  }
  .form-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
  }
  .form-input::placeholder {
    color: var(--color-muted);
  }
  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .form-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.375rem;
  }

  .form-help {
    font-size: 0.75rem;
    color: var(--color-muted);
    margin-top: 0.25rem;
  }

  .form-input-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
  }
  .form-input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }
  .form-input-success {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
  }
  .form-input-success:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  }
  .form-error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Skeleton loading states */
  .skeleton {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 25%, color-mix(in srgb, var(--color-text) 10%, transparent) 50%, color-mix(in srgb, var(--color-text) 5%, transparent) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: var(--radius-md);
  }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skeleton-text { height: 1rem; margin-bottom: 0.5rem; }
  .skeleton-heading { height: 2rem; width: 60%; margin-bottom: 1rem; }
  .skeleton-card { height: 200px; }
  .skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }

  /* Image treatment — consistent visual style */
  .img-treated {
    position: relative;
    overflow: hidden;
  }
  .img-treated::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
      transparent 50%,
      color-mix(in srgb, var(--color-accent) 5%, transparent) 100%
    );
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  .img-vignette {
    position: relative;
    overflow: hidden;
  }
  .img-vignette::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 80px rgba(0,0,0,0.3);
    pointer-events: none;
  }

  .img-warm {
    filter: sepia(0.08) saturate(1.1) brightness(1.02);
  }

  .img-cool {
    filter: saturate(0.95) brightness(1.02) hue-rotate(5deg);
  }

  .img-hero-overlay {
    position: relative;
  }
  .img-hero-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.3) 0%,
      rgba(0,0,0,0.1) 40%,
      rgba(0,0,0,0.4) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  /* Micro-copy & empty states */
  .empty-state {
    text-align: center;
    padding: 3rem 1.5rem;
    color: var(--color-muted);
  }
  .empty-state-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    opacity: 0.4;
  }
  .empty-state-text {
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  /* Loading spinner */
  .loading-spinner {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid color-mix(in srgb, var(--color-text) 15%, transparent);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Toast notifications */
  .toast {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    z-index: 100;
    animation: toast-in 0.3s ease-out;
  }
  .toast-success {
    background: #059669;
    color: #fff;
  }
  .toast-error {
    background: #dc2626;
    color: #fff;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(1rem); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Signature elements — archetype-specific visual cues */
${signatureCSS}

  /* Location-aware color temperature */
${locationTemperature}

  /* Micro-interactions — refined hover and focus states */
  .hover-lift {
    transition: transform var(--motion-fast) var(--motion-easing),
                box-shadow var(--motion-fast) var(--motion-easing),
                border-color var(--motion-fast) var(--motion-easing);
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .hover-glow {
    transition: box-shadow var(--motion-fast) var(--motion-easing);
  }
  .hover-glow:hover {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .hover-zoom {
    overflow: hidden;
  }
  .hover-zoom img {
    transition: transform var(--motion-slow) var(--motion-easing);
  }
  .hover-zoom:hover img {
    transform: scale(1.05);
  }

  .focus-ring:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Display heading — expressive typography */
  .display-heading {
    font-size: var(--type-display-size);
    font-weight: var(--type-display-weight);
    letter-spacing: var(--type-display-tracking);
    line-height: var(--type-display-line-height);
  }

  /* Image treatment with art direction variables */
  .img-treated img {
    filter: contrast(var(--img-contrast, 1)) saturate(var(--img-saturation, 1));
  }

  /* Filmstrip scroll animations */
  @keyframes filmstrip-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes filmstrip-scroll-reverse {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .animate-filmstrip { animation: filmstrip-scroll 30s linear infinite; }
  .animate-filmstrip-reverse { animation: filmstrip-scroll-reverse 25s linear infinite; }

  /* Scroll-to-top button */
  .scroll-to-top {
    position: fixed;
    bottom: 5.5rem;
    right: 1.5rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    box-shadow: var(--shadow-lg);
    border: none;
    cursor: pointer;
    opacity: 0;
    transform: translateY(10px);
    transition: all var(--motion-normal) var(--motion-easing);
    z-index: 40;
    pointer-events: none;
  }
  .scroll-to-top.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .scroll-to-top:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }

  /* Frosted glass utility */
  .glass {
    background: color-mix(in srgb, var(--color-bg) 80%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, #fff 10%, transparent);
  }

  /* Ambient glow — large, low-opacity radial for section depth */
  .ambient-glow {
    position: relative;
    overflow: hidden;
  }
  .ambient-glow::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .ambient-glow > * { position: relative; z-index: 1; }

  /* Cursor states */
  a[href], button, [role="button"], .btn, input[type="submit"], input[type="button"] { cursor: pointer; }
  [disabled], .btn:disabled, .btn[aria-disabled="true"] { cursor: not-allowed; }
  .grab-cursor, [data-grab] { cursor: grab; }
  .grab-cursor:active, [data-grab]:active { cursor: grabbing; }

  /* Floating labels */
  .floating-label-group { position: relative; }
  .floating-input { padding-top: 1.25rem; }
  .floating-label {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    font-size: 0.9375rem;
    color: var(--color-muted);
    pointer-events: none;
    transition: all 0.2s ease;
  }
  .floating-input:focus ~ .floating-label,
  .floating-input:not(:placeholder-shown) ~ .floating-label {
    top: 0.5rem;
    transform: translateY(0);
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 600;
  }

  /* Toast progress bar */
  @keyframes toast-progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background: rgba(255,255,255,0.4);
    animation: toast-progress linear forwards;
  }
  .toast { position: relative; overflow: hidden; }
}

@layer utilities {
  .text-gradient {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-balance {
    text-wrap: balance;
  }
}
`
}

// Location-aware color temperature — subtle hue shift based on region
function getLocationTemperature(city: string): string {
  if (!city) return 'neutral'
  const c = city.toLowerCase()
  // Warm regions (tropical, desert, Mediterranean)
  if (c.includes('dubai') || c.includes('miami') || c.includes('cape town') || c.includes('sydney') || c.includes('barcelona') || c.includes('rio') || c.includes('mumbai') || c.includes('bangkok') || c.includes('lagos') || c.includes('nairobi')) return 'warm'
  // Cool regions (northern, temperate)
  if (c.includes('london') || c.includes('new york') || c.includes('toronto') || c.includes('stockholm') || c.includes('tokyo') || c.includes('berlin') || c.includes('amsterdam') || c.includes('oslo') || c.includes('helsinki') || c.includes('moscow')) return 'cool'
  return 'neutral'
}

// Normalize font names for next/font/google compatibility
function normalizeFontName(name: string): string {
  const mapping: Record<string, string> = {
    'Source Sans Pro': 'Source_Sans_3',
    'Source Sans 3': 'Source_Sans_3',
  }
  return mapping[name] || name.replace(/\s+/g, '_')
}

// Get required weight array for fonts that need explicit weights
function getFontWeights(name: string): string[] | null {
  const weightMap: Record<string, string[]> = {
    'Merriweather': ['300', '400', '700', '900'],
    'Cormorant_Garamond': ['300', '400', '500', '600', '700'],
    'Playfair_Display': ['400', '500', '600', '700', '800', '900'],
    'DM_Serif_Display': ['400'],
    'Roboto_Slab': ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    'Oswald': ['200', '300', '400', '500', '600', '700'],
  }
  const normalized = normalizeFontName(name)
  return weightMap[normalized] || null
}

function generateLayout(
  businessName: string,
  seo: any,
  archetype: IndustryArchetype,
  theme: any,
  hero: any,
  city: string = '',
  artDir: string = 'editorial'
): string {
  const fontHeadingRaw = archetype.typography.heading
  const fontBodyRaw = archetype.typography.body
  const fontHeading = normalizeFontName(fontHeadingRaw)
  const fontBody = normalizeFontName(fontBodyRaw)
  const headingWeights = getFontWeights(fontHeadingRaw)
  const bodyWeights = getFontWeights(fontBodyRaw)
  const temperature = getLocationTemperature(city)

  const headingWeightProp = headingWeights ? `\n  weight: ['${headingWeights.join("', '")}'],` : ''
  const bodyWeightProp = bodyWeights ? `\n  weight: ['${bodyWeights.join("', '")}'],` : ''

  return `import type { Metadata } from 'next'
import { ${fontHeading} } from 'next/font/google'
import { ${fontBody} } from 'next/font/google'
import './globals.css'

const headingFont = ${fontHeading}({
  subsets: ['latin'],${headingWeightProp}
  variable: '--font-heading',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'serif'],
  adjustFontFallback: false,
  preload: false,
})

const bodyFont = ${fontBody}({
  subsets: ['latin'],${bodyWeightProp}
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: false,
  preload: false,
})

export const metadata: Metadata = {
  title: '${seo?.title || businessName}',
  description: '${seo?.description || ''}',
  keywords: ${JSON.stringify(seo?.keywords || [])},
  openGraph: {
    title: '${seo?.openGraph?.title || seo?.title || businessName}',
    description: '${seo?.openGraph?.description || seo?.description || ''}',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${seo?.twitter?.title || seo?.title || businessName}',
    description: '${seo?.twitter?.description || seo?.description || ''}',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={\`\${headingFont.variable} \${bodyFont.variable}\`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(${JSON.stringify(seo?.jsonLd || { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: businessName }, null, 6)})
          }}
        />
      </head>
      <body className="antialiased" data-temperature="${temperature}" data-art="${artDir}">
        {children}
      </body>
    </html>
  )
}
`
}

function generateHeader(businessName: string, siteConfig: MasterSiteConfig): string {
  const phone = siteConfig.contact?.phone || ''
  const logoUrl = siteConfig.brandAssets?.logoUrl || ''
  
  // Build the header component as a string without template literal interpolation
  const lines = [
    `'use client'`,
    '',
    "import { useState, useEffect } from 'react'",
    "import { usePathname } from 'next/navigation'",
    "import Link from 'next/link'",
    "import Image from 'next/image'",
    "import { Menu, X, Phone } from 'lucide-react'",
    '',
    'export default function Header() {',
    '  const [isScrolled, setIsScrolled] = useState(false)',
    '  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)',
    '  const pathname = usePathname()',
    '',
    '  useEffect(() => {',
    '    const handleScroll = () => {',
    '      setIsScrolled(window.scrollY > 50)',
    '    }',
    '    window.addEventListener(\'scroll\', handleScroll)',
    '    return () => window.removeEventListener(\'scroll\', handleScroll)',
    '  }, [])',
    '',
    '  const headerClass = isScrolled', 
    '    ? \'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm\'',
    '    : \'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent\'',
    '',
    '  const navLinks = [',
    '    { href: \'/\', label: \'Home\' },',
    '    { href: \'/services\', label: \'Services\' },',
    '    { href: \'/portfolio\', label: \'Portfolio\' },',
    '    { href: \'/about\', label: \'About\' },',
    '    { href: \'/contact\', label: \'Contact\' },',
    '  ]',
    '',
    '  return (',
    '    <header className={headerClass}>',
    '      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">',
    '        <div className="flex items-center justify-between h-16 md:h-20">',
    '          {/* Logo */}',
    '          <Link href="/" className="flex items-center">',
    `            <span className="text-xl font-bold text-primary">${businessName}</span>`,
    '          </Link>',
    '',
    '          {/* Desktop Navigation */}',
    '          <nav className="hidden md:flex items-center gap-8">',
    '            {navLinks.map(link => {',
    '              const isActive = pathname === link.href',
    '              return (',
    '                <Link key={link.href} href={link.href}',
    '                  className="relative text-sm font-medium transition-colors hover:text-primary"',
    '                  style={{ color: isActive ? \'var(--color-primary)\' : undefined, fontWeight: isActive ? 600 : undefined }}>',
    '                  {link.label}',
    '                  {isActive && (',
    '                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: \'var(--color-primary)\' }} />',
    '                  )}',
    '                </Link>',
    '              )',
    '            })}',
    '          </nav>',
    '',
    '          {/* Mobile Menu Button */}',
    '          <button',
    '            className="md:hidden p-2"',
    '            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}',
    '          >',
    '            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}',
    '          </button>',
    '        </div>',
    '      </div>',
    '',
    '      {/* Mobile Menu */}',
    '      {isMobileMenuOpen && (',
    '        <div className="md:hidden glass border-t">',
    '          <div className="px-4 py-4 space-y-3">',
    '            {navLinks.map(link => (',
    '              <Link key={link.href} href={link.href}',
    '                className="block py-2 text-sm font-medium transition-colors"',
    '                style={{ color: pathname === link.href ? \'var(--color-primary)\' : \'var(--color-text)\', fontWeight: pathname === link.href ? 600 : undefined }}',
    '                onClick={() => setIsMobileMenuOpen(false)}>',
    '                {link.label}',
    '              </Link>',
    '            ))}',
    '          </div>',
    '        </div>',
    '      )}',
    '    </header>',
    '  )',
    '}',
  ]
  
  return lines.join('\n')
}

function generateWhatsAppWidget(siteConfig: MasterSiteConfig): string {
  const phone = siteConfig.contact?.phone || ''
  const businessName = siteConfig.businessName || ''
  const whatsappNumber = phone.replace(/[^0-9]/g, '')
  
  // Build the widget as a string array
  const lines = [
    `'use client'`,
    '',
    "import { useState } from 'react'",
    "import { MessageCircle } from 'lucide-react'",
    '',
    'export default function WhatsAppWidget() {',
    '  const [isOpen, setIsOpen] = useState(false)',
    `  const businessName = '${businessName}'`,
    `  const whatsappNumber = '${whatsappNumber}'`,
    '',
    '  const whatsappUrl = \'https://wa.me/\' + whatsappNumber + \'?text=Hi%20\' + encodeURIComponent(businessName) + \'!%20I%27m%20interested%20in%20your%20services.\'',
    '',
    '  return (',
    '    <div className="fixed bottom-6 right-6 z-50">',
    '      {/* Chat Bubble */}',
    '      {isOpen && (',
    '        <div className="mb-4 bg-white rounded-lg shadow-xl p-4 w-72">',
    '          <div className="flex items-center gap-3 mb-3">',
    '            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">',
    '              <MessageCircle size={20} className="text-white" />',
    '            </div>',
    '            <div>',
    '              <p className="font-semibold text-sm">{businessName}</p>',
    '              <p className="text-xs text-gray-500">Typically replies instantly</p>',
    '            </div>',
    '          </div>',
    '          <p className="text-sm text-gray-600 mb-3">Hi! How can we help you today?</p>',
    '          <a',
    '            href={whatsappUrl}',
    '            target="_blank"',
    '            rel="noopener noreferrer"',
    '            className="block w-full bg-green-500 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"',
    '          >',
    '            Start Chat',
    '          </a>',
    '        </div>',
    '      )}',
    '',
    '      {/* Floating Button */}',
    '      <button',
    '        onClick={() => setIsOpen(!isOpen)}',
    '        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all hover:scale-110"',
    '        aria-label="Chat on WhatsApp"',
    '      >',
    '        <MessageCircle size={24} className="text-white" />',
    '      </button>',
    '    </div>',
    '  )',
    '}',
  ]
  
  return lines.join('\n')
}

function generateSitemap(): string {
  return `import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: \`\${baseUrl}/services\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: \`\${baseUrl}/portfolio\`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: \`\${baseUrl}/about\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: \`\${baseUrl}/contact\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
`
}

function generateRobots(): string {
  return `import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
      },
    ],
    sitemap: \`\${baseUrl}/sitemap.xml\`,
  }
}
`
}

function generateDashboardPage(): string {
  return `'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/index.html')
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Redirecting to dashboard...</p>
    </div>
  )
}
`
}

function generateSiteConfigDefaults(
  siteConfig: MasterSiteConfig,
  archetype?: IndustryArchetype,
  designSeed?: { densityProfile?: string; decorativeIntensity?: string; motionIntensity?: string; artDirection?: string; id?: string; typographyPairing?: string }
): string {
  const defaults = {
    hero: {
      headline: siteConfig.hero?.headline || '',
      subheadline: siteConfig.hero?.subheadline || '',
      badge: siteConfig.hero?.badge || '',
      ctaText: siteConfig.hero?.ctaText || '',
      ctaLink: siteConfig.hero?.ctaLink || '#contact',
      heroImageUrl: siteConfig.hero?.heroImageUrl || '',
    },
    about: {
      title: '',
      tagline: '',
      paragraph1: '',
      paragraph2: '',
      paragraph3: '',
      imageUrl: '',
    },
    services: (siteConfig.services || []).map(s => ({
      title: s.title,
      description: s.description,
      priceTag: s.priceTag,
      icon: s.icon,
    })),
    pricing: (siteConfig.pricing || []).map(p => ({
      service: p.service,
      price: p.price,
      details: p.details,
    })),
    pageContent: {
      servicesTitle: '',
      servicesDescription: '',
      servicesCtaTitle: '',
      servicesCtaText: '',
      contactTitle: '',
      contactDescription: '',
      portfolioTitle: '',
      portfolioDescription: '',
      testimonialsTitle: '',
      testimonialsSubtitle: '',
      faqTitle: '',
      faqSubtitle: '',
    },
    seo: siteConfig.seo || {},
    designSystem: {
      seedId: designSeed?.id || 'default',
      archetype: archetype?.name || 'General',
      artDirection: designSeed?.artDirection || 'editorial',
      typographyPairing: designSeed?.typographyPairing || 'modern-sans',
      headingFont: archetype?.typography?.heading || 'System Font',
      bodyFont: archetype?.typography?.body || 'System Font',
      densityProfile: designSeed?.densityProfile || 'balanced',
      decorativeIntensity: designSeed?.decorativeIntensity || 'subtle',
      motionIntensity: designSeed?.motionIntensity || 'moderate',
      colorPalette: {
        primary: siteConfig.theme?.palette?.primary || '#0ea5e9',
        secondary: siteConfig.theme?.palette?.secondary || '#6366f1',
        accent: siteConfig.theme?.palette?.accent || '#f59e0b',
        bg: siteConfig.theme?.palette?.bg || '#ffffff',
        text: siteConfig.theme?.palette?.text || '#1a1a1a',
      },
    },
  }
  return JSON.stringify(defaults, null, 2)
}

function generateAnimateOnScroll(): string {
  return `'use client'

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

type AnimationType = 'fade-rise' | 'fade-scale' | 'clip-reveal' | 'stagger-children'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

interface AnimateOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: AnimationType
  style?: CSSProperties
}

export function AnimateOnScroll({ children, delay = 0, className = '', animation = 'fade-rise', style }: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation()

  const getAnimationStyles = (): CSSProperties => {
    const base: CSSProperties = {
      transitionDelay: \`\${delay}ms\`,
      ...style,
    }

    switch (animation) {
      case 'fade-rise':
        return {
          ...base,
          transition: \`all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))\`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : \`translateY(var(--motion-distance, 12px))\`,
        }
      case 'fade-scale':
        return {
          ...base,
          transition: \`all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))\`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }
      case 'clip-reveal':
        return {
          ...base,
          transition: \`all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))\`,
          opacity: isVisible ? 1 : 0,
          clipPath: isVisible ? 'inset(0)' : 'inset(0 0 100% 0)',
        }
      case 'stagger-children':
        return {
          ...base,
          transition: \`all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))\`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : \`translateY(var(--motion-distance, 12px))\`,
        }
      default:
        return base
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  )
}

// Stagger container — wraps children and applies staggered delays
export function StaggerContainer({ children, className = '', staggerDelay = 40 }: { children: ReactNode; className?: string; staggerDelay?: number }) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                transition: \`all var(--motion-duration, 0.4s) var(--motion-easing, cubic-bezier(0.22, 1, 0.36, 1))\`,
                transitionDelay: \`\${i * staggerDelay}ms\`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : \`translateY(var(--motion-distance, 12px))\`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}
`

}

function generateScrollToTop(): string {
  return `'use client'

import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={\`scroll-to-top \${visible ? 'visible' : ''}\`}
      aria-label="Scroll to top"
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
`
}

function generateVideoEmbed(): string {
  return `'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([a-zA-Z0-9_-]{11})/,
    /youtube\\.com\\/shorts\\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return \`https://www.youtube.com/embed/\${match[1]}\`
  }
  return null
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\\.com\\/(\\d+)/)
  if (match) return \`https://player.vimeo.com/video/\${match[1]}\`
  return null
}

export default function VideoEmbed() {
  const { config } = useSiteData()
  const videos = config?.videos || []

  if (videos.length === 0) return null

  return (
    <section id="videos" className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--color-accent)' }}>
            Watch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            Videos
          </h2>
        </AnimateOnScroll>

        <div className="space-y-8">
          {videos.map((video: any, i: number) => {
            const embedUrl = getYouTubeEmbedUrl(video.url) || getVimeoEmbedUrl(video.url)
            if (!embedUrl) return null

            return (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={\`Video \${i + 1}\`}
                  />
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
`
}

function generateAdditionalSections(): string {
  return `'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AdditionalSections() {
  const { config } = useSiteData()
  const sections = config?.additionalSections || []

  if (sections.length === 0) return null

  return (
    <>
      {sections.map((section: any, i: number) => (
        <section key={section.id || i} id={\`touch-\${section.id || i}\`} className="section-padding" style={{ background: i % 2 === 0 ? 'var(--color-bg)' : 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll className="text-center mb-10">
              <span className="text-sm font-semibold uppercase tracking-wider section-subtitle" style={{ color: 'var(--color-accent)' }}>
                {section.type === 'content' ? 'About' : section.type}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
                  {section.subtitle}
                </p>
              )}
            </AnimateOnScroll>

            {section.content && (
              <AnimateOnScroll>
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {section.content}
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            {section.items && section.items.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {section.items.map((item: any, j: number) => (
                  <AnimateOnScroll key={j} delay={j * 100}>
                    <div className="rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
                      style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)', background: 'var(--color-bg)' }}>
                      {item.image && (
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-4">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {item.description}
                      </p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            )}

            {section.images && section.images.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
                {section.images.map((img: string, j: number) => (
                  <AnimateOnScroll key={j} delay={j * 50}>
                    <div className="w-24 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                      <img src={img} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  )
}
`
}

function generateLightbox(): string {
  return `'use client'

import { useEffect, useCallback, useRef } from 'react'

interface LightboxProps {
  images: { url: string; category: string }[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handlePrev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length)
  }, [index, images.length, onNavigate])

  const handleNext = useCallback(() => {
    onNavigate((index + 1) % images.length)
  }, [index, images.length, onNavigate])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, handlePrev, handleNext])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX }
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) { diff > 0 ? handleNext() : handlePrev() }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button onClick={(e) => { e.stopPropagation(); handlePrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <img src={images[index]?.url} alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()} />
      <button onClick={(e) => { e.stopPropagation(); handleNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {images.length}
        {images[index]?.category && <span className="ml-2">— {images[index].category}</span>}
      </div>
    </div>
  )
}
`
}

function generateToast(): string {
  return `'use client'

import { useState, useEffect, useCallback } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={\`toast toast-\${type}\`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        transition: 'all 0.3s ease',
      }}>
      <span>{message}</span>
      <div className="toast-progress" style={{ animationDuration: \`\${duration}ms\` }} />
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info'; duration?: number }>>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration?: number) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => removeToast(t.id)} />
      ))}
    </>
  ), [toasts, removeToast])

  return { addToast, ToastContainer }
}
`
}

function generateUseSiteData(): string {
  return `'use client'

import { useState, useEffect } from 'react'

export function useSiteData() {
  const [config, setConfig] = useState<any>(null)
  const [imageMap, setImageMap] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/site-config.json').then(r => r.ok ? r.json() : null).then(setConfig).catch(() => {}),
      fetch('/image-map.json').then(r => r.ok ? r.json() : null).then(setImageMap).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  return { config, imageMap, loading }
}
`
}

function generateSaveConfigRoute(): string {
  return `import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const publicDir = join(process.cwd(), 'public')

    if (data.siteConfig) {
      await writeFile(join(publicDir, 'site-config.json'), JSON.stringify(data.siteConfig, null, 2), 'utf-8')
    }
    if (data.imageMap) {
      await writeFile(join(publicDir, 'image-map.json'), JSON.stringify(data.imageMap, null, 2), 'utf-8')
    }

    return NextResponse.json({ success: true, message: 'Configuration updated successfully' })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}
`
}

function generateUploadRoute(): string {
  return `import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = \`\${timestamp}-\${safeName}\`
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: \`/uploads/\${filename}\`,
      filename: filename,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
`
}

function generateHomePage(sectionOrder?: number[]): string {
  // Section index mapping: 0=Hero, 1=Services, 2=Gallery, 3=Testimonials, 4=FAQ, 5=About, 6=Team, 7=Contact
  const sectionNames = ['Hero', 'Services', 'Gallery', 'Testimonials', 'Faq', 'About', 'CtaBanner', 'PricingTable']
  
  // Build section order — Hero always first, Contact always last
  let orderedSections: string[]
  if (sectionOrder && sectionOrder.length > 0) {
    // Map section order indices to component names, filtering out Team (6) since we don't have a standalone Team component
    const mapped = sectionOrder
      .filter(i => i !== 6 && i !== 7) // Skip Team and Contact (Contact is always last)
      .map(i => sectionNames[i])
      .filter(Boolean)
    // Remove duplicates while preserving order
    const seen = new Set<string>()
    orderedSections = mapped.filter(s => {
      if (seen.has(s)) return false
      seen.add(s)
      return true
    })
    // Ensure Hero is first if not already present
    if (!orderedSections.includes('Hero')) orderedSections.unshift('Hero')
  } else {
    orderedSections = ['Hero', 'Services', 'Gallery', 'Testimonials', 'About', 'Faq', 'CtaBanner', 'PricingTable']
  }

  const sectionComponents: Record<string, string> = {
    'Hero': 'Hero',
    'Services': 'Services',
    'Gallery': 'Gallery',
    'Testimonials': 'Testimonials',
    'Faq': 'Faq',
    'About': 'About',
    'CtaBanner': 'CtaBanner',
    'PricingTable': 'PricingTable',
  }

  const sectionJsx = orderedSections
    .map(s => `        <${sectionComponents[s]} />`)
    .join('\n')

  return `'use client'

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
${sectionJsx}
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <ScrollToTop />
    </>
  )
}
`
}

function generateSubPage(slug: string, label: string): string {
  const lines = [
    "import type { Metadata } from 'next'",
    "import dynamic from 'next/dynamic'",
    "",
    "const Header = dynamic(() => import('@/components/Header'), { ssr: false })",
    "const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })",
    "const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })",
    "",
    "export const metadata: Metadata = {",
    `  title: '${label} | Website',`,
    "}",
    "",
    `export default function ${label}Page() {`,
    "  return (",
    "    <>",
    "      <Header />",
    '      <main className="pt-20">',
    `        <p>${label} page content goes here.</p>`,
    "      </main>",
    "      <Footer />",
    "      <WhatsAppWidget />",
    "    </>",
    "  )",
    "}",
  ]
  return lines.join('\n') + '\n'
}
