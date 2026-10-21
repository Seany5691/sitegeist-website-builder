/**
 * Next.js 14 Boilerplate Generator
 * Pre-generates standard files so MiMo doesn't need to create them from scratch
 */

import { MasterSiteConfig, IndustryArchetype } from '@/types/site-config'
import { generateLogoSet, LogoPalette } from '@/lib/logo-engine'

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
  'app/team/page.tsx': string
  'app/blog/page.tsx': string
  'app/reviews/page.tsx': string
  'app/faq/page.tsx': string
  'app/areas/page.tsx': string
  'app/privacy/page.tsx': string
  'app/sitemap.ts': string
  'app/robots.ts': string
  'app/icon.svg': string
  'components/Header.tsx': string
  'components/WhatsAppWidget.tsx': string
  'components/AnimateOnScroll.tsx': string
  'components/ScrollToTop.tsx': string
  'components/VideoEmbed.tsx': string
  'components/AdditionalSections.tsx': string
  'components/_Lightbox.tsx': string
  'components/Toast.tsx': string
  'lib/use-site-data.ts': string
  'lib/auth.ts': string
  'lib/dashboard-middleware.ts': string
  'lib/rate-limiter.ts': string
  'app/api/auth/[...nextauth]/route.ts': string
  'app/api/save-config/route.ts': string
  'app/api/upload/route.ts': string
  '.env.local.example': string
  '.env.local': string  // â† ADD THIS
  '.dashboard-credentials.txt': string  // â† ADD THIS
  'site-config-defaults.json': string
  'next-auth.d.ts': string  // â† ADD THIS (Fix #7)
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
    'app/team/page.tsx': generateSubPage('team', 'Our Team'),
    'app/blog/page.tsx': generateSubPage('blog', 'Blog'),
    'app/reviews/page.tsx': generateSubPage('reviews', 'Reviews'),
    'app/faq/page.tsx': generateSubPage('faq', 'FAQ'),
    'app/areas/page.tsx': generateSubPage('areas', 'Areas We Serve'),
    'app/privacy/page.tsx': generateSubPage('privacy', 'Privacy Policy'),
    'app/sitemap.ts': generateSitemap(),
    'app/robots.ts': generateRobots(),
    'app/icon.svg': generateIconSvg(siteConfig),
    'components/Header.tsx': generateHeader(businessName, siteConfig),
    'components/WhatsAppWidget.tsx': generateWhatsAppWidget(siteConfig),
    'components/AnimateOnScroll.tsx': generateAnimateOnScroll(),
    'components/ScrollToTop.tsx': generateScrollToTop(),
    'components/VideoEmbed.tsx': generateVideoEmbed(),
    'components/AdditionalSections.tsx': generateAdditionalSections(),
    'components/_Lightbox.tsx': generateLightbox(),
    'components/Toast.tsx': generateToast(),
    'lib/use-site-data.ts': generateUseSiteData(),
    'lib/auth.ts': generateAuthConfig(),
    'lib/dashboard-middleware.ts': generateAuthMiddleware(),
    'lib/rate-limiter.ts': generateRateLimiter(),
    'app/api/auth/[...nextauth]/route.ts': generateNextAuthRoute(),
    'app/api/save-config/route.ts': generateSaveConfigRoute(),
    'app/api/upload/route.ts': generateUploadRoute(),
    '.env.local.example': generateEnvExample(),
    '.env.local': generateEnvLocal(businessName),  // â† FIX #1: Auto-generated .env.local
    '.dashboard-credentials.txt': generateDashboardCredentials(businessName),  // â† FIX #1: Credential file
    'site-config-defaults.json': generateSiteConfigDefaults(siteConfig, archetype, designSeed),
    'next-auth.d.ts': generateNextAuthTypes(),  // â† FIX #7: TypeScript definitions
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
      next: '^14.2.35',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'framer-motion': '10.18.0',
      'next-auth': '^4.24.11',
      'bcryptjs': '^2.4.3',
      '@vercel/blob': '^2.8.0',
      'lucide-react': '^0.378.0',
      'clsx': '^2.1.1',
      'tailwind-merge': '^2.3.0',
      '@supabase/supabase-js': '^2.45.0',
      // Build tooling lives in dependencies (not devDependencies) so
      // NODE_ENV=production installs can never skip Tailwind/TypeScript.
      'typescript': '^5.4.5',
      'tailwindcss': '^3.4.3',
      'postcss': '^8.4.38',
      'autoprefixer': '^10.4.19',
    },
    devDependencies: {
      '@types/node': '^20.12.12',
      '@types/react': '^18.3.2',
      '@types/react-dom': '^18.3.0',
      '@types/bcryptjs': '^2.4.6',
    },
  }, null, 2)
}

function generateNextConfig(): string {
  // Single source of truth: templates/backend/next.config.js carries the
  // security headers (CSP / X-Frame-Options / HSTS / …). It is emitted here too
  // because the generator writes next.config.js AFTER copyBackendDir(), so a
  // header-less version would otherwise overwrite the shipped one.
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

  // ── Security headers ────────────────────────────────────────────────────
  // Applied to every response including the static dashboard assets in /public.
  //
  // The five "safe" headers (X-Frame-Options, X-Content-Type-Options,
  // Referrer-Policy, HSTS, Permissions-Policy) cannot break rendering.
  //
  // CSP is the one that can, so it is scoped to exactly what the platform
  // loads:
  //   - 'unsafe-inline' for scripts is REQUIRED: the dashboard uses 100+ inline
  //     onclick handlers. It still blocks loading scripts from any other
  //     origin, which is the main XSS delivery route.
  //   - fonts.googleapis.com / fonts.gstatic.com / cdnjs.cloudflare.com are
  //     allowed for the dashboard's Google Fonts + Font Awesome.
  //   - youtube / vimeo / google maps are allowed for embedded media.
  //   - img-src is deliberately wide (any https image) because clients paste
  //     their own image links. Images are a far lower risk than scripts.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://maps.google.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Never allow the site to be framed — kills clickjacking of the login
          { key: 'X-Frame-Options', value: 'DENY' },
          // Never let the browser guess a content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak the referring URL to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS for a year, include subdomains, allow preload
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Deny powerful features nobody uses here
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // Legacy IE MIME sniffing
          { key: 'X-Download-Options', value: 'noopen' },
          // Don't let third-party sites embed us via <base> manipulation
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
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
      downlevelIteration: true,    // FIX #6: Required for Map iterator compatibility
      target: 'es2015',              // FIX #6: Target ES2015 for better compatibility
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
  // Winning formula (DASHBOARD-CHANGES.md §24): section spacing is locked
  // to 3.25 / 4.25 / 5.25 rem — do not leave 8rem desktop padding.
  const densityConfig: Record<string, { sectionSm: string; sectionMd: string; sectionLg: string; gap: string; maxW: string }> = {
    airy: { sectionSm: '3.25rem', sectionMd: '4.25rem', sectionLg: '5.25rem', gap: '2rem', maxW: '1200px' },
    balanced: { sectionSm: '3.25rem', sectionMd: '4.25rem', sectionLg: '5.25rem', gap: '1.5rem', maxW: '1280px' },
    dense: { sectionSm: '3.25rem', sectionMd: '4.25rem', sectionLg: '5.25rem', gap: '1rem', maxW: '1400px' },
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
    --header-h: 7.5rem;
    --color-primary: ${palette?.primary || '#0ea5e9'};
    --color-secondary: ${palette?.secondary || '#6366f1'};
    --color-accent: ${palette?.accent || '#f59e0b'};
    --color-bg: ${isDarkMode ? '#09090b' : '#ffffff'};
    --color-text: ${isDarkMode ? '#f5f5f5' : '#1a1a1a'};
    --color-muted: ${isDarkMode ? '#9ca3af' : '#6b7280'};

    /* Surface elevation scale — 5 levels + semantic variants */
    --surface-0: var(--color-bg);
    --surface-1: color-mix(in srgb, var(--color-text) ${isDarkMode ? '5%' : '3%'}, var(--color-bg));
    --surface-2: color-mix(in srgb, var(--color-text) ${isDarkMode ? '10%' : '6%'}, var(--color-bg));
    --surface-3: color-mix(in srgb, var(--color-text) ${isDarkMode ? '15%' : '9%'}, var(--color-bg));
    --surface-4: color-mix(in srgb, var(--color-text) ${isDarkMode ? '20%' : '12%'}, var(--color-bg));
    --surface-primary: color-mix(in srgb, var(--color-primary) ${isDarkMode ? '15%' : '10%'}, var(--surface-1));
    --surface-accent: color-mix(in srgb, var(--color-accent) ${isDarkMode ? '15%' : '10%'}, var(--surface-1));

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

    /* Composite shadow system — contact shadow + ambient spread */
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.03);
    --shadow-md: 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.06);
    --shadow-lg: 0 4px 8px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.08);
    --shadow-xl: 0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.1);
    --shadow-2xl: 0 12px 24px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.15);

    /* Glow shadows for interactive elements */
    --shadow-glow-primary: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent),
                           0 4px 12px color-mix(in srgb, var(--color-primary) 15%, transparent);
    --shadow-glow-accent: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent),
                          0 4px 12px color-mix(in srgb, var(--color-accent) 15%, transparent);

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

  /* Custom scrollbar — branded, thin */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--color-text) 20%, transparent);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--color-text) 35%, transparent);
    background-clip: padding-box;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--color-text) 20%, transparent) transparent;
  }

  /* Text selection — branded */
  ::selection {
    background: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text);
  }
  ::-moz-selection {
    background: color-mix(in srgb, var(--color-primary) 30%, transparent);
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

  /* Button system — 5-state tactile interactions */
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
    position: relative;
    overflow: hidden;
  }

  .btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; border-radius: var(--radius-md); }
  .btn-md { padding: 0.75rem 1.5rem; font-size: 0.9375rem; border-radius: var(--radius-md); }
  .btn-lg { padding: 1rem 2rem; font-size: 1.0625rem; border-radius: var(--radius-lg); }

  /* Primary Button */
  .btn-primary {
    background-color: var(--color-primary);
    color: #fff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), var(--shadow-sm);
  }
  .btn-primary:hover {
    background-color: color-mix(in srgb, var(--color-primary) 90%, #000);
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), var(--shadow-md);
  }
  .btn-primary:active {
    transform: translateY(0) scale(0.98);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    transition-duration: 100ms;
  }
  .btn-primary:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow-primary);
  }

  /* Secondary Button */
  .btn-secondary {
    background-color: var(--color-secondary);
    color: #fff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), var(--shadow-sm);
  }
  .btn-secondary:hover {
    background-color: color-mix(in srgb, var(--color-secondary) 90%, #000);
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), var(--shadow-md);
  }
  .btn-secondary:active {
    transform: translateY(0) scale(0.98);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    transition-duration: 100ms;
  }
  .btn-secondary:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-secondary) 40%, transparent);
  }

  /* Outline Button */
  .btn-outline {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
    box-shadow: none;
  }
  .btn-outline:hover {
    background-color: var(--color-primary);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  .btn-outline:active {
    transform: translateY(0) scale(0.98);
    background-color: color-mix(in srgb, var(--color-primary) 90%, #000);
    transition-duration: 100ms;
  }
  .btn-outline:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow-primary);
  }

  /* Ghost Button */
  .btn-ghost {
    background: transparent;
    color: var(--color-text);
    box-shadow: none;
  }
  .btn-ghost:hover {
    background-color: color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .btn-ghost:active {
    background-color: color-mix(in srgb, var(--color-text) 12%, transparent);
    transform: scale(0.98);
    transition-duration: 100ms;
  }
  .btn-ghost:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-text) 30%, transparent);
  }

  /* Accent Button */
  .btn-accent {
    background-color: var(--color-accent);
    color: var(--color-primary);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), var(--shadow-sm);
    font-weight: 700;
  }
  .btn-accent:hover {
    background-color: color-mix(in srgb, var(--color-accent) 90%, #000);
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), var(--shadow-md);
  }
  .btn-accent:active {
    transform: translateY(0) scale(0.98);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
    transition-duration: 100ms;
  }
  .btn-accent:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow-accent);
  }

  /* Disabled State — Universal */
  .btn:disabled,
  .btn[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    transform: none !important;
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

  /* Form Input System — Floating Labels + Validation */
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-family: var(--font-body), sans-serif;
    font-size: 0.9375rem;
    color: var(--color-text);
    background-color: var(--surface-1);
    border: 1.5px solid color-mix(in srgb, var(--color-text) 15%, transparent);
    border-radius: var(--radius-md);
    outline: none;
    transition: border-color var(--motion-fast) var(--motion-easing),
                box-shadow var(--motion-fast) var(--motion-easing),
                background-color var(--motion-fast) var(--motion-easing);
  }
  .form-input:hover {
    border-color: color-mix(in srgb, var(--color-text) 25%, transparent);
  }
  .form-input:focus {
    border-color: var(--color-primary);
    background-color: var(--color-bg);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
  .form-input::placeholder {
    color: var(--color-muted);
    opacity: 0.6;
  }
  .form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: color-mix(in srgb, var(--color-text) 5%, transparent);
  }

  /* Floating Label System */
  .floating-label-group {
    position: relative;
  }
  .floating-input {
    padding-top: 1.25rem;
    padding-bottom: 0.5rem;
  }
  .floating-label {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    font-size: 0.9375rem;
    color: var(--color-muted);
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent;
    padding: 0 0.25rem;
  }
  .floating-input:focus ~ .floating-label,
  .floating-input:not(:placeholder-shown) ~ .floating-label {
    top: 0.5rem;
    transform: translateY(0);
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 600;
    background: var(--color-bg);
  }

  /* Validation States */
  .form-input-error {
    border-color: #ef4444;
    background-color: color-mix(in srgb, #ef4444 3%, var(--color-bg));
  }
  .form-input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }
  .form-input-success {
    border-color: #22c55e;
    background-color: color-mix(in srgb, #22c55e 3%, var(--color-bg));
  }
  .form-input-success:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  }
  .form-error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-weight: 500;
  }
  .form-error-message::before {
    content: '⚠';
    font-size: 1rem;
  }
  .form-success-message {
    font-size: 0.75rem;
    color: #22c55e;
    margin-top: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-weight: 500;
  }
  .form-success-message::before {
    content: '✓';
    font-size: 1rem;
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

  /* Typography System — Mandatory utility classes */
  .heading {
    font-family: var(--font-heading), serif;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }

  .heading-display {
    font-family: var(--font-heading), serif;
    font-size: clamp(2.5rem, 5vw + 1rem, 5rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1.1;
    text-wrap: balance;
  }

  .heading-1 {
    font-family: var(--font-heading), serif;
    font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.15;
    text-wrap: balance;
  }

  .heading-2 {
    font-family: var(--font-heading), serif;
    font-size: clamp(1.5rem, 3vw + 0.5rem, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
    text-wrap: balance;
  }

  .heading-3 {
    font-family: var(--font-heading), serif;
    font-size: clamp(1.25rem, 2vw + 0.5rem, 1.875rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.3;
    text-wrap: balance;
  }

  .body-text {
    font-family: var(--font-body), sans-serif;
    font-size: clamp(0.9375rem, 1vw + 0.5rem, 1.0625rem);
    font-weight: 400;
    letter-spacing: 0;
    line-height: 1.65;
  }

  .body-text-large {
    font-family: var(--font-body), sans-serif;
    font-size: clamp(1rem, 1.5vw + 0.5rem, 1.25rem);
    font-weight: 400;
    line-height: 1.7;
  }

  .body-text-small {
    font-family: var(--font-body), sans-serif;
    font-size: clamp(0.8125rem, 0.8vw + 0.4rem, 0.9375rem);
    font-weight: 400;
    line-height: 1.6;
  }

  /* Text wrapping utilities */
  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  /* Premium Card System — Stacked shadows + edge illumination */
  .card {
    background: var(--surface-1);
    border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--motion-normal) var(--motion-easing);
    position: relative;
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, 
      color-mix(in srgb, #fff 10%, transparent), 
      transparent 50%,
      color-mix(in srgb, var(--color-primary) 5%, transparent)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity var(--motion-normal) var(--motion-easing);
    pointer-events: none;
  }

  .card:hover {
    border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .card:hover::before {
    opacity: 1;
  }

  /* Card with top accent */
  .card-accent-top {
    border-top: 2px solid var(--color-primary);
  }

  /* Card with gradient border on hover */
  .card-gradient-border {
    background: var(--surface-1);
    border: none;
    position: relative;
    isolation: isolate;
  }
  .card-gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity var(--motion-normal) var(--motion-easing);
    z-index: -1;
  }
  .card-gradient-border:hover::before {
    opacity: 1;
  }

  /* Skeleton Loading System — Smooth shimmer animation */
  /* 
   * NOTE: Components using skeleton classes should add ARIA attributes:
   * <div className="skeleton" aria-busy="true" aria-label="Loading content">
   * This ensures screen readers announce loading state (WCAG 2.1 Level A)
   */
  .skeleton {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-text) 6%, transparent) 25%,
      color-mix(in srgb, var(--color-text) 12%, transparent) 50%,
      color-mix(in srgb, var(--color-text) 6%, transparent) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
    border-radius: var(--radius-md);
    position: relative;
    overflow: hidden;
  }

  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.08) 50%,
      transparent 100%
    );
    animation: skeleton-shine 1.8s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes skeleton-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .skeleton-text {
    height: 1rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }
  .skeleton-text-short {
    height: 1rem;
    margin-bottom: 0.5rem;
    width: 60%;
  }
  .skeleton-heading {
    height: 2rem;
    width: 70%;
    margin-bottom: 1rem;
  }
  .skeleton-card {
    height: 300px;
    width: 100%;
  }
  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .skeleton-button {
    height: 2.5rem;
    width: 120px;
    border-radius: var(--radius-md);
  }

  /* Toast Notification System — with progress bar */
  .toast {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    min-width: 300px;
    max-width: 400px;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: var(--shadow-xl);
    z-index: 100;
    animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .toast {
      bottom: 5rem; /* Account for mobile keyboard */
      left: 1rem;
      right: 1rem;
      min-width: auto; /* Full width on mobile */
    }
  }

  .toast-success {
    background: #059669;
    color: #fff;
  }
  .toast-error {
    background: #dc2626;
    color: #fff;
  }
  .toast-info {
    background: var(--color-primary);
    color: #fff;
  }
  .toast-warning {
    background: #f59e0b;
    color: #fff;
  }

  /* Toast icon */
  .toast::before {
    content: '';
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background-size: contain;
    background-repeat: no-repeat;
  }
  .toast-success::before {
    content: '✓';
    font-size: 1.25rem;
    font-weight: 700;
  }
  .toast-error::before {
    content: '✕';
    font-size: 1.25rem;
    font-weight: 700;
  }

  /* Toast progress bar */
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255,255,255,0.4);
    animation: toast-progress linear forwards;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(1rem) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toast-progress {
    from { width: 100%; }
    to { width: 0%; }
  }

  /* Toast dismiss button */
  .toast-dismiss {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: rgba(0,0,0,0.2);
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    transition: all var(--motion-fast) var(--motion-easing);
  }
  .toast-dismiss:hover {
    opacity: 1;
    background: rgba(0,0,0,0.3);
  }

  /* Micro-Interaction Utilities */

  /* Hover lift with shadow enhancement */
  .hover-lift {
    transition: transform var(--motion-fast) var(--motion-easing),
                box-shadow var(--motion-fast) var(--motion-easing),
                border-color var(--motion-fast) var(--motion-easing);
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  /* Hover glow effect */
  .hover-glow {
    transition: box-shadow var(--motion-normal) var(--motion-easing);
  }
  .hover-glow:hover {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent),
                var(--shadow-md);
  }

  /* Hover zoom on images */
  .hover-zoom {
    overflow: hidden;
    border-radius: inherit;
  }
  .hover-zoom img {
    transition: transform var(--motion-slow) var(--motion-easing);
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hover-zoom:hover img {
    transform: scale(1.05);
  }

  /* Hover brighten */
  .hover-brighten {
    transition: filter var(--motion-fast) var(--motion-easing);
  }
  .hover-brighten:hover {
    filter: brightness(1.1);
  }

  /* Focus ring for keyboard navigation */
  .focus-ring:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: inherit;
  }

  /* Active press state */
  .press-scale:active {
    transform: scale(0.98);
    transition-duration: 100ms;
  }

  /* Cursor States */
  a[href], button, [role="button"], .btn, input[type="submit"], input[type="button"], select {
    cursor: pointer;
  }
  [disabled], .btn:disabled, .btn[aria-disabled="true"], input:disabled, select:disabled, textarea:disabled {
    cursor: not-allowed;
  }

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

  /* Universal keyboard focus — WCAG 2.1 Level AA compliance */
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  [tabindex]:not([tabindex="-1"]):focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .focus-ring-primary:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .focus-ring-accent:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .focus-within-ring:focus-within {
    outline: 2px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
    outline-offset: 2px;
  }

  /* Image loading states */
  img[data-loading="true"] {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  img[data-loaded="true"] {
    opacity: 1;
  }

  .img-skeleton {
    position: relative;
    overflow: hidden;
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }

  .img-skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.08) 50%,
      transparent 100%
    );
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  /* Respect user motion preferences — WCAG 2.1 Level AA */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .skeleton {
      animation-duration: 3s !important;
    }
  }

  /* Print styles — professional document output */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    
    nav,
    header,
    footer,
    .btn,
    button,
    .scroll-to-top,
    .toast,
    [aria-hidden="true"] {
      display: none !important;
    }
    
    img {
      max-width: 100% !important;
      page-break-inside: avoid;
    }
    
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    
    p, blockquote {
      orphans: 3;
      widows: 3;
    }
    
    section {
      page-break-inside: avoid;
    }
    
    a[href^="http"]::after {
      content: " (" attr(href) ")";
      font-size: 0.8em;
      font-weight: normal;
    }
    
    table, th, td {
      border: 1px solid #ddd !important;
    }
  }
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

  return `import type { Metadata } from 'next'
import './globals.css'
import { loadJSON } from '@/lib/blob-storage'
import { buildJsonLdGraph } from '@/lib/schema'
import { buildRootMetadata } from '@/lib/page-meta'
import { getSiteUrl } from '@/lib/site-url'

// ${businessName}${city ? ` — ${city}` : ''}
// Fonts load via the Google Fonts @import in globals.css (browser-side).
// We intentionally do NOT use next/font/google here — it downloads fonts at
// build time and breaks the build when fonts.gstatic.com is unreachable.
const fontVars = {
  '--font-heading': "${fontHeading.replace(/_/g, ' ')}, Georgia, Cambria, serif",
  '--font-body': "${fontBody.replace(/_/g, ' ')}, system-ui, -apple-system, 'Segoe UI', sans-serif",
} as React.CSSProperties

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata()
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let config: any = {}
  try {
    config = (await loadJSON('site-config.json')) || {}
  } catch {
    config = {}
  }
  const baseUrl = getSiteUrl()
  const jsonLdBlocks = buildJsonLdGraph(config, baseUrl)

  return (
    <html lang="en" style={fontVars}>
      <head>
        {jsonLdBlocks.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
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
  // NOTE: For WCAG Level A compliance, consider adding a skip-link:
  // <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn btn-primary">
  //   Skip to main content
  // </a>
  const lines = [
    `'use client'`,
    '',
    "import { useState, useEffect } from 'react'",
    "import { usePathname } from 'next/navigation'",
    "import Link from 'next/link'",
    "import Image from 'next/image'",
    "import { Menu, X, Phone } from 'lucide-react'",
    '',
    "import { useSiteData } from '@/lib/use-site-data'",
    "import { siteNavLinks } from '@/lib/control-flags'",
    '',
    'export default function Header() {',
    '  const { config } = useSiteData()',
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
    '  // Nav is generated from the Section Registry — only shows what is switched on.',
    '  const navLinks = siteNavLinks(config)',
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

/**
 * Favicon mark — auto-served by the Next.js App Router as /favicon.ico
 * plus /icon.svg. Generated from the deterministic logo engine so every
 * site ships with a real branded icon instead of the Next.js default.
 */
function generateIconSvg(siteConfig: MasterSiteConfig): string {
  const palette: LogoPalette = {
    primary: siteConfig.brandAssets?.brandColors?.primary || siteConfig.theme?.palette?.primary || '#0f172a',
    secondary: siteConfig.brandAssets?.brandColors?.secondary || siteConfig.theme?.palette?.secondary,
    accent: siteConfig.brandAssets?.brandColors?.accent || siteConfig.theme?.palette?.accent || '#f59e0b',
    bg: siteConfig.theme?.palette?.bg,
    text: siteConfig.theme?.palette?.text,
  }
  const set = generateLogoSet({
    businessName: siteConfig.businessName || 'Business',
    industry: siteConfig.industry,
    palette,
  })
  return set.faviconSvg
}

function generateSitemap(): string {
  return `import { MetadataRoute } from 'next'
import { loadJSON } from '@/lib/blob-storage'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  let lastMod = new Date()
  try {
    const config = await loadJSON('site-config.json')
    if (config?.updatedAt) {
      const parsed = new Date(config.updatedAt)
      if (!isNaN(parsed.getTime())) lastMod = parsed
    }
  } catch {
    // fall back to now
  }

  return [
    { url: baseUrl, lastModified: lastMod, changeFrequency: 'weekly', priority: 1 },
    { url: \`\${baseUrl}/services\`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: \`\${baseUrl}/portfolio\`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: \`\${baseUrl}/about\`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: \`\${baseUrl}/contact\`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
`
}

function generateRobots(): string {
  return `import { MetadataRoute } from 'next'
import { ALLOWED_USER_AGENTS } from '@/lib/robots-ua-list'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...ALLOWED_USER_AGENTS.map((userAgent) => ({ userAgent, allow: '/' as const })),
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
      ourWorkTitle: '',
      ourWorkSubtitle: '',
      ourWorkDescription: '',
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/site-config.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/image-map.json').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([cfg, img]) => {
      setConfig(cfg)
      setImageMap(img)
      // Delay to prevent flash of skeleton (min 300ms for smooth transition)
      setTimeout(() => {
        setLoading(false)
        setIsLoading(false)
      }, 300)
    }).catch(err => {
      console.error('Failed to load site data:', err)
      setLoading(false)
      setIsLoading(false)
    })
  }, [])

  return { config, imageMap, loading, isLoading }
}
`
}

function generateSaveConfigRoute(): string {
  return `import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { protectRoute } from '@/lib/dashboard-middleware'

export async function POST(request: NextRequest) {
  // Verify authentication and origin
  const sessionOrError = await protectRoute(request)
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError // Return error response
  }

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
import { protectRoute } from '@/lib/dashboard-middleware'

export async function POST(request: NextRequest) {
  // Verify authentication and origin
  const sessionOrError = await protectRoute(request)
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError // Return error response
  }

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

/**
 * Homepage — composed at runtime by SectionRenderer, which reads the
 * Section Registry and siteConfig.controls. Nothing is hardcoded here, so
 * switching a section on/off in the dashboard re-flows the page cleanly.
 */
function generateHomePage(_sectionOrder?: number[]): string {
  return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ScrollToTop from '@/components/ScrollToTop'
import SectionRenderer from '@/components/SectionRenderer'
import FeatureHost from '@/components/features/FeatureHost'
import WhatsAppGate from '@/components/WhatsAppGate'

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
`
}

/**
 * Full Control System page — Team / Blog / Reviews / FAQ / Areas / Privacy.
 * Header + PageHero + page component + Contact + Footer.
 * If the client turns the page off in Settings, PageGate shows a graceful
 * notice (the nav link is already hidden by the section registry).
 */
function generateControlPage(slug: string, label: string, component: string, pageKey: string): string {
  const raw = [
    "import type { Metadata } from 'next'",
    "import Header from '@/components/Header'",
    "import PageHero from '@/components/PageHero'",
    "import Body from '@/components/COMPONENT'",
    "import Contact from '@/components/Contact'",
    "import Footer from '@/components/Footer'",
    "import WhatsAppWidget from '@/components/WhatsAppWidget'",
    "import ScrollToTop from '@/components/ScrollToTop'",
    "import { buildPageMetadata } from '@/lib/page-meta'",
    "import { loadJSON } from '@/lib/blob-storage'",
    "import { isPageEnabled } from '@/lib/control-flags'",
    "",
    "export async function generateMetadata(): Promise<Metadata> {",
    "  return buildPageMetadata('home' as any, 'LABEL | Website', '/SLUG')",
    "}",
    "",
    "export default function Page() {",
    "  return (",
    "    <>",
    "      <Header />",
    "      <main className=\"pt-20\">",
    "        <PageHero page=\"SLUG\" fallbackTitle=\"LABEL\" fallbackSubtitle=\"\" fallbackImage=\"\" />",
    "        <PageGate pageKey=\"PAGEKEY\">",
    "          <Body />",
    "        </PageGate>",
    "      </main>",
    "      <Contact />",
    "      <Footer />",
    "      <WhatsAppWidget />",
    "      <ScrollToTop />",
    "    </>",
    "  )",
    "}",
    "",
    "function PageGate({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {",
    "  return <PageGateInner pageKey={pageKey}>{children}</PageGateInner>",
    "}",
    "",
    "async function PageGateInner({ pageKey, children }: { pageKey: string; children: React.ReactNode }) {",
    "  const config: any = (await loadJSON('site-config.json')) || {}",
    "  if (!isPageEnabled(config, pageKey)) {",
    "    return (",
    "      <div className=\"section-padding text-center\">",
    "        <p style={{ color: 'var(--color-muted)' }}>This page is not available.</p>",
    "      </div>",
    "    )",
    "  }",
    "  return <>{children}</>",
    "}",
  ].join("\n")
  return raw
    .split('COMPONENT').join(component)
    .split('LABEL').join(label)
    .split('SLUG').join(slug)
    .split('PAGEKEY').join(pageKey)
}

function generateSubPage(slug: string, label: string): string {
  // Full Control System pages dispatch to the shared generator
  const controlComponents: Record<string, { comp: string; pageKey: string }> = {
    team: { comp: 'TeamPage', pageKey: 'teamPage' },
    blog: { comp: 'BlogPage', pageKey: 'blogPage' },
    reviews: { comp: 'ReviewsPage', pageKey: 'reviewsPage' },
    faq: { comp: 'Faq', pageKey: 'faqPage' },
    areas: { comp: 'AreasPage', pageKey: 'areasPage' },
    privacy: { comp: 'PrivacyContent', pageKey: 'privacy' },
  }
  if (controlComponents[slug]) {
    const c = controlComponents[slug]
    return generateControlPage(slug, label, c.comp, c.pageKey)
  }
  // Portfolio is the full gallery page (DASHBOARD-CHANGES.md §16)
  if (slug === 'portfolio') {
    return `import type { Metadata } from 'next'
import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
import Gallery from '@/components/Gallery'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ScrollToTop from '@/components/ScrollToTop'
import { buildPageMetadata } from '@/lib/page-meta'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('portfolio', '${label} | Website')
}

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          page="portfolio"
          fallbackTitle="${label}"
          fallbackSubtitle=""
          fallbackImage=""
        />
        <Gallery mode="full" />
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

  const lines = [
    "import type { Metadata } from 'next'",
    "import Header from '@/components/Header'",
    "import PageHero from '@/components/PageHero'",
    "import Footer from '@/components/Footer'",
    "import WhatsAppWidget from '@/components/WhatsAppWidget'",
    "import { buildPageMetadata } from '@/lib/page-meta'",
    "",
    "export async function generateMetadata(): Promise<Metadata> {",
    `  return buildPageMetadata('${slug}', '${label} | Website')`,
    "}",
    "",
    `export default function ${label}Page() {`,
    "  return (",
    "    <>",
    "      <Header />",
    '      <main className="pt-20">',
    "        <PageHero",
    `          page="${slug}"`,
    `          fallbackTitle="${label}"`,
    '          fallbackSubtitle=""',
    '          fallbackImage=""',
    "        />",
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


// ============================================
// PHASE 10: DASHBOARD SECURITY FUNCTIONS
// ============================================

function generateAuthConfig(): string {
  return `import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { loginRateLimiter } from './rate-limiter'

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.DASHBOARD_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH || ''

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Dashboard Login',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        
        // Get IP address for rate limiting
        const forwarded = req.headers?.['x-forwarded-for']
        const ip = typeof forwarded === 'string' 
          ? forwarded.split(',')[0] 
          : req.headers?.['x-real-ip'] || 'unknown'
        
        // Check rate limit (5 attempts per 15 minutes)
        if (loginRateLimiter.check(ip)) {
          const remaining = loginRateLimiter.remaining(ip)
          throw new Error(\`Too many login attempts. Try again in 15 minutes. (\${remaining} attempts remaining)\`)
        }

        // Verify username
        if (credentials.username !== ADMIN_USERNAME) {
          return null
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH)
        
        if (!isValid) {
          return null
        }
        
        // Success - clear rate limit
        loginRateLimiter.clear(ip)

        return {
          id: '1',
          name: ADMIN_USERNAME,
          email: 'admin@dashboard.local'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/dashboard',
    error: '/dashboard',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
`
}

function generateNextAuthRoute(): string {
  return `import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
`
}

function generateAuthMiddleware(): string {
  return `import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify user is authenticated
 * Returns session if valid, error response if not
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please log in.' },
      { status: 401 }
    )
  }
  
  return session
}

/**
 * Validate request origin to prevent CSRF
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Allow same-origin requests
  if (origin && host) {
    try {
      const originUrl = new URL(origin)
      return originUrl.host === host
    } catch {
      return false
    }
  }
  
  // Allow requests without origin header (same-origin)
  return !origin
}

/**
 * Combined middleware: auth + origin validation
 */
export async function protectRoute(request: NextRequest) {
  // Check origin
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { success: false, message: 'Invalid origin' },
      { status: 403 }
    )
  }
  
  // Check authentication
  const sessionOrError = await requireAuth(request)
  
  // If it's a response (error), return it
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError
  }
  
  // Otherwise it's a valid session
  return sessionOrError
}
`
}

function generateRateLimiter(): string {
  return `// Simple in-memory rate limiter for login attempts
// In production, consider using Redis for distributed systems

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export class RateLimiter {
  private maxAttempts: number
  private windowMs: number
  
  constructor(maxAttempts: number = 5, windowMinutes: number = 15) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMinutes * 60 * 1000
  }
  
  /**
   * Check if request is rate limited
   * @param identifier - IP address or username
   * @returns true if rate limited, false if allowed
   */
  check(identifier: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)
    
    // No entry or window expired - allow
    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      })
      return false
    }
    
    // Increment count
    entry.count++
    
    // Check if exceeded
    if (entry.count > this.maxAttempts) {
      return true // Rate limited
    }
    
    return false // Still allowed
  }
  
  /**
   * Get remaining attempts
   */
  remaining(identifier: string): number {
    const entry = rateLimitStore.get(identifier)
    if (!entry || Date.now() > entry.resetAt) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - entry.count)
  }
  
  /**
   * Clear rate limit for identifier (use after successful login)
   */
  clear(identifier: string): void {
    rateLimitStore.delete(identifier)
  }
  
  /**
   * Cleanup expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Singleton instance
export const loginRateLimiter = new RateLimiter(5, 15) // 5 attempts per 15 minutes

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => loginRateLimiter.cleanup(), 5 * 60 * 1000)
}
`
}

function generateEnvExample(): string {
  return `# Dashboard Authentication
DASHBOARD_USERNAME=your_business_name
# Local dev: raw bcrypt hash is fine
DASHBOARD_PASSWORD_HASH=$2a$10$replace_with_real_hash
# Vercel production: Base64-encoded bcrypt hash (Vercel strips $ from raw bcrypt)
# node -e "console.log(Buffer.from(process.env.HASH).toString('base64'))"
DASHBOARD_PASSWORD_HASH_BASE64=
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Site URL — required for canonical URLs, sitemap, llms.txt, Open Graph
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Shared multi-tenant lead database (Supabase)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
# Tenant id = trial_websites.id in the platform database
TENANT_ID=00000000-0000-0000-0000-000000000000

# Vercel Blob (REQUIRED in production — auto-added when Blob store is linked)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Contact form email delivery (Resend) — required on every generated site
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Website Enquiries <no-reply@yourbuilder.com>"
# Optional fallback recipient if dashboard has no email set:
# CONTACT_FORM_FALLBACK_TO=you@yourbuilder.com

# After first login, change your password in dashboard settings
# Then delete the plain-text password from .dashboard-credentials.txt
`
}

// FIX #1: Auto-generate dashboard credentials with proper password hashing
function generateEnvLocal(businessName: string): string {
  const bcrypt = require('bcryptjs')
  const crypto = require('crypto')
  
  // Extract first word from business name for username
  const firstWord = businessName.split(/[\s&\-,]+/)[0].trim()
  const username = firstWord
  
  // Generate password: FirstWord@CurrentYear!
  const currentYear = new Date().getFullYear()
  const password = `${firstWord}@${currentYear}!`
  
  // Hash password with bcrypt
  const passwordHash = bcrypt.hashSync(password, 10)

  // Base64 form of the hash for Vercel + local (Vercel strips $ from env values)
  const passwordHashBase64 = Buffer.from(passwordHash, 'utf-8').toString('base64')

  // Generate secure NextAuth secret
  const nextAuthSecret = crypto.randomBytes(32).toString('hex')

  // Platform-wide keys — SAME on every generated site (leads, email, tenant).
  // These must never be missing or /api/leads 500s and contact email breaks.
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const resendKey = process.env.RESEND_API_KEY || ''
  const emailFrom = process.env.EMAIL_FROM || 'Website Enquiries <no-reply@sitespire.co.za>'
  const contactFallback = process.env.CONTACT_FORM_FALLBACK_TO || ''

  // NOTE: never escape $ in the bcrypt hash — that produces an invalid hash
  // and can break .env parsing. Use the Base64 form as the source of truth.
  return `# Dashboard Authentication
# Auto-generated credentials for: ${businessName}
DASHBOARD_USERNAME=${username}
DASHBOARD_PASSWORD_HASH=${passwordHash}
# Use this on Vercel (raw bcrypt $ symbols get stripped there)
DASHBOARD_PASSWORD_HASH_BASE64=${passwordHashBase64}
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Vercel Blob (REQUIRED in production — auto-added when Blob store is linked)
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Site URL — required for canonical URLs, sitemap, llms.txt, Open Graph
# NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Shared multi-tenant lead database (Supabase) — platform-wide, same on every site
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnon}
SUPABASE_SERVICE_ROLE_KEY=${supabaseService}
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnon}
# TENANT_ID is written by the build pipeline (= trial_websites.id)
TENANT_ID=

# Contact form email delivery (Resend) — platform-wide, same on every site
RESEND_API_KEY=${resendKey}
EMAIL_FROM="${emailFrom}"
CONTACT_FORM_FALLBACK_TO=${contactFallback}

# Generated Credentials:
# Username: ${username}
# Password: ${password}
#
# IMPORTANT: Change your password after first login in dashboard settings!
# After changing password, you can delete this comment section.
`
}

// FIX #1: Create plain-text credentials file for user reference
function generateDashboardCredentials(businessName: string): string {
  const firstWord = businessName.split(/[\s&\-,]+/)[0].trim()
  const currentYear = new Date().getFullYear()
  const password = `${firstWord}@${currentYear}!`
  
  return `═════════════════════
     DASHBOARD LOGIN CREDENTIALS
═════════════════════

Business: ${businessName}

Dashboard URL: http://localhost:3000/dashboard

Username: ${firstWord}
Password: ${password}

═════════════════════

⚠️ IMPORTANT SECURITY NOTES:

1. Change your password after first login!
   Go to Dashboard → Settings → Change Password

2. DELETE THIS FILE after you've logged in and 
   changed your password.

3. Never commit this file to version control.

═════════════════════
Generated: ${new Date().toISOString()}
`
}

// FIX #7: NextAuth TypeScript definitions
function generateNextAuthTypes(): string {
  return `import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
`
}
