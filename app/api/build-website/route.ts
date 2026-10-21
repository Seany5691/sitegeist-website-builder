import { NextRequest, NextResponse } from 'next/server'
import { execSync, spawn } from 'child_process'
import path from 'path'
import fsSync from 'fs'
import { promises as fs } from 'fs'
import { parseJsonSafe } from '@/lib/utils'
import { generateBoilerplate } from '@/lib/boilerplate-generator'
import { createClient } from '@/lib/supabase'

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

// ── Helper: Update trial_websites build status ─────────────────────────────

async function updateTrialBuildStatus(
  trialWebsiteId: string,
  buildStatus: string,
  extraFields: Record<string, unknown> = {}
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('trial_websites')
    .update({ build_status: buildStatus, ...extraFields })
    .eq('id', trialWebsiteId)

  if (error) {
    console.error(`[Builder] Failed to update trial_websites.build_status to ${buildStatus}:`, error.message)
  }
}

async function writeTrialTimelineEntry(
  contactId: string,
  eventType: string,
  eventTitle: string,
  eventDetail?: string
) {
  const supabase = createClient()
  await supabase.from('timeline_entries').insert({
    contact_id: contactId,
    event_type: eventType,
    event_title: eventTitle,
    event_detail: eventDetail || null,
    source_app: 'Website Builder',
  })
}

/**
 * Phase 2: Generate Boilerplate & Launch MiMo CLI
 * 
 * This endpoint handles the website generation phase:
 * - Reads site-config.json from scraping phase
 * - Generates design seed with archetype constraints
 * - Calls generateBoilerplate() to create package.json, tailwind, globals.css, layout.tsx
 * - Calls selectComponents() to choose Hero/Services/Gallery variants based on archetype + design seed
 * - Calls copySelectedComponents() to copy pre-built templates
 * - Copies dashboard template to /public/dashboard/
 * - Generates MiMo prompt with Phase 9 helper functions
 * - Installs dependencies via npm install --legacy-peer-deps
 * - Launches MiMo CLI via spawn() with stdin prompt
 * - Post-build cleanup and QA scoring
 * 
 * Called by: /api/build-trial (step 3 of pipeline)
 * 
 * @param request - Contains businessFolder path and optional palette selection
 * @returns JSON response with final website URL
 */
export async function POST(request: NextRequest) {
  try {
    const { businessFolder, trialWebsiteId, selectedPalette, reroll, waitForCompletion } = await request.json()
    const pipelineStartMs = Date.now()

    if (!businessFolder) {
      return NextResponse.json(
        { success: false, error: 'Missing businessFolder parameter' },
        { status: 400 }
      )
    }

    // Fetch contact_id from trial_websites if trialWebsiteId provided
    let trialContactId: string | null = null
    if (trialWebsiteId) {
      const supabase = createClient()
      const { data: trialRow } = await supabase
        .from('trial_websites')
        .select('contact_id')
        .eq('id', trialWebsiteId)
        .single()
      trialContactId = trialRow?.contact_id || null
    }

    const clientPath = path.join(WEBSITES_FOLDER, businessFolder)

    // Verify folder exists
    try {
      await fs.access(clientPath)
    } catch {
      return NextResponse.json(
        { success: false, error: `Business folder not found: ${businessFolder}` },
        { status: 404 }
      )
    }

    // Verify required files exist
    const requiredFiles = ['prompt.md', 'site-config.json', 'seo.json']
    for (const file of requiredFiles) {
      const filePath = path.join(clientPath, file)
      try {
        await fs.access(filePath)
      } catch {
        return NextResponse.json(
          { success: false, error: `Required file not found: ${file}` },
          { status: 404 }
        )
      }
    }

    // ============================================
    // GENERATE BOILERPLATE FILES
    // ============================================
    
    // Read site-config to get theme/archetype info
    const siteConfigRaw = await fs.readFile(path.join(clientPath, 'site-config.json'), 'utf-8')
    const siteConfig = parseJsonSafe(siteConfigRaw)

    // Apply selected color palette if provided
    if (selectedPalette && selectedPalette.primary) {
      siteConfig.theme = siteConfig.theme || {}
      siteConfig.theme.palette = {
        primary: selectedPalette.primary,
        secondary: selectedPalette.secondary,
        accent: selectedPalette.accent,
        bg: selectedPalette.bg || siteConfig.theme?.palette?.bg || '#ffffff',
        text: selectedPalette.text || siteConfig.theme?.palette?.text || '#1a1a1a',
        muted: siteConfig.theme?.palette?.muted || '#6b7280',
      }
      siteConfig.brandAssets = siteConfig.brandAssets || {}
      siteConfig.brandAssets.brandColors = {
        primary: selectedPalette.primary,
        secondary: selectedPalette.secondary,
        accent: selectedPalette.accent,
        bg: selectedPalette.bg || '#ffffff',
      }
      // Update site-config.json with the new colors
      await fs.writeFile(path.join(clientPath, 'site-config.json'), JSON.stringify(siteConfig, null, 2), 'utf-8')
      console.log(`[Builder] Applied color palette: ${selectedPalette.name || 'Custom'} (${selectedPalette.primary})`)

      // Regenerate design-system.md and prompt.md with the correct colors
      const { generateBuildInstructions: regenInstructions } = await import('@/lib/prompt-builder')
      const updatedInstructions = regenInstructions({
        buildMode: siteConfig.buildMode || 'TRIAL',
        siteConfig,
        websitesFolder: path.dirname(clientPath),
      })
      await fs.writeFile(path.join(clientPath, '.build-instructions', 'design-system.md'), updatedInstructions.designSystem, 'utf-8')
      await fs.writeFile(path.join(clientPath, 'prompt.md'), updatedInstructions.shortPrompt, 'utf-8')
      console.log('[Builder] Regenerated design-system.md and prompt.md with selected colors')
    }
    
    // Detect archetype for font selection — industry is truth when present
    const { detectIndustry } = await import('@/lib/prompt-builder')
    const archetype = detectIndustry(
      siteConfig.businessName,
      siteConfig.seo?.title,
      siteConfig.seo?.description,
      siteConfig.services,
      siteConfig.legacyUrls?.discovered?.[0] || siteConfig.existingWebsiteUrl,
      siteConfig.industry
    )

    // Generate design seed for density/intensity (archetype-aware)
    const { generateDesignSeed, getArchetypeConstraintKey } = await import('@/lib/design-seed')
    const constraintKey = getArchetypeConstraintKey(archetype.id)
    // When rerolling, append timestamp to get a different design seed
    const seedInput = reroll ? `${siteConfig.businessName || businessFolder}-${Date.now()}` : (siteConfig.businessName || businessFolder)
    const designSeed = generateDesignSeed(seedInput, constraintKey)
    if (reroll) {
      console.log(`[Builder] Reroll mode: generating fresh design seed for ${siteConfig.businessName}`)
    }

    // Generate boilerplate files
    console.log(`[Builder] Generating Next.js boilerplate files...`)
    console.log(`[Builder] Design seed: ${designSeed.id} (density: ${designSeed.densityProfile}, intensity: ${designSeed.decorativeIntensity}, motion: ${designSeed.motionIntensity}, art: ${designSeed.artDirection})`)
    const boilerplate = generateBoilerplate(siteConfig, archetype, {
      densityProfile: designSeed.densityProfile,
      decorativeIntensity: designSeed.decorativeIntensity,
      motionIntensity: designSeed.motionIntensity,
      staggerStrength: designSeed.staggerStrength,
      artDirection: designSeed.artDirection,
      sectionOrder: designSeed.sectionOrder,
    })
    
    // Write all boilerplate files
    for (const [filename, content] of Object.entries(boilerplate)) {
      const filePath = path.join(clientPath, filename)
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filePath, content, 'utf-8')
      console.log(`[Builder] Created: ${filename}`)
    }

    // Write TENANT_ID into .env.local (leads / form_submissions scoping)
    if (trialWebsiteId) {
      try {
        const envPath = path.join(clientPath, '.env.local')
        let envText = await fs.readFile(envPath, 'utf-8')
        if (/^TENANT_ID=/m.test(envText)) {
          envText = envText.replace(/^TENANT_ID=.*$/m, `TENANT_ID=${trialWebsiteId}`)
        } else {
          envText += `\nTENANT_ID=${trialWebsiteId}\n`
        }
        await fs.writeFile(envPath, envText, 'utf-8')
        console.log(`[Builder] TENANT_ID=${trialWebsiteId} written to .env.local`)
      } catch (e) {
        console.warn('[Builder] Could not write TENANT_ID to .env.local:', e)
      }
    }

    // ── Render the PNG favicon set from app/icon.svg ──────────────────────
    // Next.js auto-serves app/icon.svg, but apple-icon + PWA sizes need PNG.
    try {
      const sharp = (await import('sharp')).default
      const iconSvgPath = path.join(clientPath, 'app', 'icon.svg')
      const iconSvg = await fs.readFile(iconSvgPath)
      const sizes: Array<[string, number]> = [
        ['app/apple-icon.png', 180],
        ['app/icon-192.png', 192],
        ['app/icon-512.png', 512],
        // Also in public/ so arbitrary icon URLs resolve (Next only auto-serves
        // app/icon.svg and app/apple-icon.png by name).
        ['public/icon-192.png', 192],
        ['public/icon-512.png', 512],
        ['public/icon.png', 192],
        // Legacy /favicon.ico — PNG bytes are accepted by all modern browsers.
        ['public/favicon.ico', 48],
      ]
      for (const [rel, px] of sizes) {
        const out = path.join(clientPath, rel)
        await fs.mkdir(path.dirname(out), { recursive: true })
        await sharp(iconSvg, { density: 300 }).resize(px, px).png().toFile(out)
        console.log(`[Builder] Created: ${rel}`)
      }

      // Static opengraph-image.png — replaces @vercel/og ImageResponse which
      // crashes on Windows paths containing spaces (fileURLToPath).
      const brand = siteConfig.theme?.palette || {}
      const ogBg = (brand.primary || '#0f172a').replace('#', '')
      const ogSvg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
          <rect width="1200" height="630" fill="#${ogBg}"/>
          <rect x="0" y="480" width="1200" height="150" fill="#00000033"/>
          <text x="80" y="300" font-family="Georgia, serif" font-size="72" fill="#ffffff" font-weight="700">${String(siteConfig.businessName || businessFolder).replace(/[<>&]/g, '')}</text>
          <text x="80" y="380" font-family="system-ui, sans-serif" font-size="36" fill="#ffffffcc">${String(siteConfig.city || '').replace(/[<>&]/g, '')}</text>
        </svg>`
      )
      await sharp(ogSvg).png().toFile(path.join(clientPath, 'app', 'opengraph-image.png'))
      console.log('[Builder] Created: app/opengraph-image.png')
      // Remove the dynamic @vercel/og route — static PNG takes over
      try {
        await fs.rm(path.join(clientPath, 'app', 'opengraph-image.tsx'))
        console.log('[Builder] Removed app/opengraph-image.tsx (static PNG now serves OG)')
      } catch {}
    } catch (e) {
      console.warn('[Builder] Could not render PNG favicon set (SVG icon still works):', e)
    }

    // ============================================
    // COPY SHARED BACKEND TEMPLATES (golden-tested)
    // ============================================
    // These override the boilerplate-generated lib/api with the tested
    // Vercel Blob + auth + site-data + contact implementations (DASHBOARD-CHANGES.md).
    const backendTemplateDir = path.join(process.cwd(), 'templates', 'backend')
    async function copyBackendDir(rel: string = '') {
      const srcDir = path.join(backendTemplateDir, rel)
      const entries = await fs.readdir(srcDir, { withFileTypes: true })
      for (const entry of entries) {
        const relPath = rel ? path.join(rel, entry.name) : entry.name
        if (entry.isDirectory()) {
          await copyBackendDir(relPath)
        } else {
          const src = path.join(backendTemplateDir, relPath)
          const dest = path.join(clientPath, relPath)
          await fs.mkdir(path.dirname(dest), { recursive: true })
          const content = await fs.readFile(src, 'utf-8')
          await fs.writeFile(dest, content, 'utf-8')
          console.log(`[Builder] Backend template: ${relPath}`)
        }
      }
    }
    try {
      await copyBackendDir()
    } catch (err) {
      console.warn('[Builder] Could not copy backend templates:', err)
    }

    // ── Full Control System: ship the structural components deterministically ──
    // These are not design variants for MiMo to pick — they are part of the
    // platform (Team, Blog, Features, new sections) and MUST exist in every site.
    //
    // NOTE on naming: `BeforeAfter`, `TrustBadges`, `AreasServed` exist both as
    // SECTIONS (gallery/ trust/ areas/) and as FEATURES (features/). Feature
    // components keep their `features/` subfolder so imports never collide:
    //   section  -> @/components/BeforeAfter
    //   feature  -> @/components/features/BeforeAfter
    const controlSystemFolders = [
      'team', 'blog', 'stats', 'process', 'trust', 'partners',
      'areas', 'location', 'awards', 'social', 'newsletter', 'reviews',
      'vsl', 'privacy', 'pricing', 'cta',
      // gallery must be listed so BeforeAfter.tsx / LatestWork.tsx actually ship
      'gallery',
    ]
    // gallery: only the two new section components (the rest are design variants)
    const controlSystemFiles: Record<string, string[]> = {
      gallery: ['BeforeAfter.tsx', 'LatestWork.tsx'],
    }
    const componentsSrcRoot = path.join(process.cwd(), 'templates', 'components')
    async function shipComponent(srcRel: string, destRel: string) {
      const src = path.join(componentsSrcRoot, srcRel)
      const dest = path.join(clientPath, 'components', destRel)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      const content = await fs.readFile(src, 'utf-8')
      await fs.writeFile(dest, content, 'utf-8')
      console.log(`[Builder] Control system component: ${srcRel}`)
    }
    for (const folder of controlSystemFolders) {
      const srcFolder = path.join(componentsSrcRoot, folder)
      if (!fsSync.existsSync(srcFolder)) continue
      const only = controlSystemFiles[folder]
      const entries = await fs.readdir(srcFolder, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue
        if (only && !only.includes(entry.name)) continue
        await shipComponent(path.join(folder, entry.name), entry.name)
      }
    }
    // Feature components keep their subfolder (avoids the section/feature name clash)
    const featuresSrc = path.join(componentsSrcRoot, 'features')
    if (fsSync.existsSync(featuresSrc)) {
      for (const entry of await fs.readdir(featuresSrc, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue
        await shipComponent(path.join('features', entry.name), path.join('features', entry.name))
      }
    }

    // Copy site-config-defaults.json to public/ so the dashboard can fetch it
    const defaultsSrc = path.join(clientPath, 'site-config-defaults.json')
    const defaultsDest = path.join(clientPath, 'public', 'site-config-defaults.json')
    await fs.mkdir(path.join(clientPath, 'public'), { recursive: true })
    try {
      const defaultsContent = await fs.readFile(defaultsSrc, 'utf-8')
      await fs.writeFile(defaultsDest, defaultsContent, 'utf-8')
      console.log(`[Builder] Copied to public: site-config-defaults.json`)
    } catch {}

    // Create components directory
    await fs.mkdir(path.join(clientPath, 'components'), { recursive: true })

    // ============================================
    // SELECT & COPY PRE-BUILT COMPONENTS
    // ============================================
    const { selectComponents, copySelectedComponents } = await import('@/lib/component-selector')
    const { ensureHeroImage } = await import('@/lib/fallback-strategies')
    const designSeedId = siteConfig.buildSlug || siteConfig.businessName || 'default'

    // Read image-map.json to get image count for smart gallery selection
    let imageCount = 0
    let categoryCount = 0
    let teamSize = 0
    try {
      const imageMapRaw = await fs.readFile(path.join(clientPath, 'image-map.json'), 'utf-8')
      const imageMap = parseJsonSafe(imageMapRaw)
      imageCount = imageMap.totalImages || 0
      categoryCount = Object.keys(imageMap.categories || {}).length
    } catch {
      // image-map.json may not exist yet
    }
    try {
      const siteConfigRaw = await fs.readFile(path.join(clientPath, 'site-config.json'), 'utf-8')
      const siteConfigData = parseJsonSafe(siteConfigRaw)
      teamSize = siteConfigData.team?.length || 0
    } catch {
      // site-config.json may not exist yet
    }

    // PREMIUM ENFORCER: Ensure hero has background image before component selection
    ensureHeroImage(siteConfig, archetype.id)

    const selectedComponents = await selectComponents(archetype, designSeedId, imageCount, categoryCount, {
      artDirection: designSeed.artDirection,
      layoutStyle: designSeed.layoutStyle,
    }, teamSize)
    const copiedFiles = await copySelectedComponents(selectedComponents, clientPath)
    console.log(`[Builder] Pre-built components: ${copiedFiles.join(', ')}`)
    console.log(`[Builder] Selected: Hero=${selectedComponents.hero}, Services=${selectedComponents.services}, Gallery=${selectedComponents.gallery}`)
    console.log(`[Builder] Image-aware gallery: ${imageCount} images, ${categoryCount} categories → ${selectedComponents.gallery}`)

    // Save selected components to site-config.json for dashboard awareness
    siteConfig.selectedComponents = {
      hero: selectedComponents.hero,
      services: selectedComponents.services,
      gallery: selectedComponents.gallery,
      testimonials: selectedComponents.testimonials,
      contact: selectedComponents.contact,
      about: selectedComponents.about,
      faq: selectedComponents.faq,
    }
    await fs.writeFile(path.join(clientPath, 'site-config.json'), JSON.stringify(siteConfig, null, 2), 'utf-8')

    // ============================================
    // COPY DASHBOARD TEMPLATE
    // ============================================
    console.log(`[Builder] Copying dashboard template...`)
    
    const dashboardTemplateDir = path.join(process.cwd(), 'templates', 'dashboard')
    const dashboardTargetDir = path.join(clientPath, 'public', 'dashboard')
    
    // Create dashboard directory in public folder
    await fs.mkdir(dashboardTargetDir, { recursive: true })
    await fs.mkdir(path.join(dashboardTargetDir, 'assets'), { recursive: true })
    
    // Copy dashboard files
    const dashboardFiles = ['index.html', 'assets/styles.css', 'assets/app.js']
    for (const file of dashboardFiles) {
      const src = path.join(dashboardTemplateDir, file)
      const dest = path.join(dashboardTargetDir, file)
      const content = await fs.readFile(src, 'utf-8')
      await fs.writeFile(dest, content, 'utf-8')
      console.log(`[Builder] Dashboard: ${file}`)
    }
    
    // Generate config.js with business-specific values
    // SECURITY: never write username/password into config.js — auth is env-only
    const configTemplate = await fs.readFile(path.join(dashboardTemplateDir, 'assets', 'config.js'), 'utf-8')
    const businessName = siteConfig.businessName || businessFolder
    const firstWord = businessName.split(/\s+/)[0]
    const username = firstWord
    const password = `${firstWord}@${new Date().getFullYear()}!`

    // Clean address - escape newlines and quotes
    const cleanAddress = (siteConfig.contact?.address || siteConfig.city || '')
      .replace(/[\r\n]+/g, ', ')
      .replace(/"/g, '\\"')
      .trim()

    // Theme must match app/globals.css so the Design System panel shows the live palette
    const palette = siteConfig.theme?.palette || {}
    const primaryColor = palette.primary || '#6366f1'
    const secondaryColor = palette.secondary || '#8b5cf6'
    const accentColor = palette.accent || '#f59e0b'
    const bgColor = palette.bg || '#ffffff'
    const textColor = palette.text || '#1a1a1a'
    const headingFont = archetype.typography?.heading || 'Playfair Display'
    const bodyFont = archetype.typography?.body || 'Lato'

    // Feature flags: hide dashboard sections the public site does not render
    const hasPricing = Array.isArray(siteConfig.pricing) && siteConfig.pricing.length > 0
    const hasBlog = Array.isArray(siteConfig.blogPosts) && siteConfig.blogPosts.length > 0
    const hasTeam = Array.isArray(siteConfig.team) && siteConfig.team.length > 0

    const imageTreatment = [
      'Brand-color tint overlay on gallery images',
      'Hero overlay for text readability',
    ]
    const guardrails = [
      'Color palette locked to brand guidelines',
      'Typography pairing enforced',
      'Section structure preserved',
      'Image treatment consistency',
      'Button & form styling unified',
    ]

    const configContent = configTemplate
      .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
      .replace(/\{\{INDUSTRY\}\}/g, siteConfig.industry || archetype.name || 'General Business')
      .replace(/\{\{CITY\}\}/g, siteConfig.city || '')
      .replace(/\{\{OWNER_NAME\}\}/g, siteConfig.ownerName || '')
      .replace(/\{\{PHONE\}\}/g, siteConfig.contact?.phone || '')
      .replace(/\{\{EMAIL\}\}/g, siteConfig.contact?.email || '')
      .replace(/\{\{ADDRESS\}\}/g, cleanAddress)
      .replace(/\{\{FACEBOOK\}\}/g, siteConfig.socialLinks?.facebook || '')
      .replace(/\{\{INSTAGRAM\}\}/g, siteConfig.socialLinks?.instagram || '')
      .replace(/\{\{TWITTER\}\}/g, siteConfig.socialLinks?.twitter || '')
      .replace(/\{\{SEO_TITLE\}\}/g, siteConfig.seo?.title || '')
      .replace(/\{\{SEO_DESCRIPTION\}\}/g, siteConfig.seo?.description || '')
      .replace(/\{\{SEO_KEYWORDS\}\}/g, (siteConfig.seo?.keywords || []).join(', '))
      .replace(/\{\{GA4_MEASUREMENT_ID\}\}/g, siteConfig.analytics?.ga4MeasurementId || '')
      .replace(/\{\{PRIMARY_COLOR\}\}/g, primaryColor)
      .replace(/\{\{SECONDARY_COLOR\}\}/g, secondaryColor)
      .replace(/\{\{ACCENT_COLOR\}\}/g, accentColor)
      .replace(/\{\{BG_COLOR\}\}/g, bgColor)
      .replace(/\{\{TEXT_COLOR\}\}/g, textColor)
      .replace(/\{\{HEADING_FONT\}\}/g, headingFont)
      .replace(/\{\{BODY_FONT\}\}/g, bodyFont)
      .replace(/\{\{SEED_ID\}\}/g, designSeed.id || businessName.toLowerCase().replace(/\s+/g, '-'))
      .replace(/\{\{ARCHETYPE\}\}/g, archetype.name || siteConfig.industry || 'General Business')
      .replace(/\{\{ART_DIRECTION\}\}/g, designSeed.artDirection || 'editorial')
      .replace(/\{\{DENSITY_PROFILE\}\}/g, designSeed.densityProfile || 'balanced')
      .replace(/\{\{DECORATIVE_INTENSITY\}\}/g, designSeed.decorativeIntensity || 'subtle')
      .replace(/\{\{MOTION_INTENSITY\}\}/g, designSeed.motionIntensity || 'moderate')
      .replace(/\{\{IMAGE_TREATMENT\}\}/g, JSON.stringify(imageTreatment, null, 6).replace(/\n/g, '\n    '))
      .replace(/\{\{GUARDRAILS\}\}/g, JSON.stringify(guardrails, null, 6).replace(/\n/g, '\n    '))
      .replace(/\{\{FEATURE_PRICING\}\}/g, String(hasPricing))
      .replace(/\{\{FEATURE_BLOG\}\}/g, String(hasBlog))
      .replace(/\{\{FEATURE_TEAM\}\}/g, String(hasTeam))

    await fs.writeFile(path.join(dashboardTargetDir, 'assets', 'config.js'), configContent, 'utf-8')
    console.log(`[Builder] Dashboard configured for: ${businessName}`)
    console.log(`[Builder] Dashboard login (env-only, not in config.js): ${username} / ${password}`)
    console.log(`[Builder] GA4 Measurement ID: ${siteConfig.analytics?.ga4MeasurementId || 'Not found'}`)

    // Write the MiMo prompt to a file
    const mimoPromptFile = path.join(clientPath, '.mimo-prompt.txt')
    
    const mimoPrompt = `WORKING DIRECTORY: ${clientPath}
You are ALREADY in the correct directory. All files are here. Do NOT search elsewhere.

==================================================
WHAT IS ALREADY BUILT (DO NOT MODIFY)
==================================================
Boilerplate: package.json, next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.js, app/globals.css, app/layout.tsx
Components: components/Hero.tsx (${selectedComponents.hero}), components/Services.tsx (${selectedComponents.services}), components/Gallery.tsx (${selectedComponents.gallery}), components/Testimonials.tsx (${selectedComponents.testimonials}), components/Faq.tsx (${selectedComponents.faq}), components/Contact.tsx (${selectedComponents.contact}), components/About.tsx (${selectedComponents.about}), components/Footer.tsx (${selectedComponents.footer}), components/Header.tsx, components/WhatsAppWidget.tsx, components/AnimateOnScroll.tsx, components/ScrollToTop.tsx, components/CtaBanner.tsx, components/PricingTable.tsx
Lib: lib/use-site-data.ts (shared /api/site-data fetch), lib/blob-storage.ts (Vercel Blob + filesystem fallback), lib/auth.ts, lib/dashboard-middleware.ts, lib/rate-limiter.ts, lib/page-meta.ts
API: app/api/site-data/route.ts (single source of truth, force-dynamic), app/api/blob-urls/route.ts, app/api/save-config/route.ts, app/api/upload/route.ts, app/api/contact/route.ts (Resend email), app/api/auth/[...nextauth]/route.ts
Scripts: scripts/seed-blob.js (run once after first deploy)
Dashboard: public/dashboard/ (DO NOT modify)
Pages: app/dashboard/page.tsx (already has redirect)

These components read ALL content from site-config.json via useSiteData(). They use CSS variables for colors. DO NOT modify them.
NEVER create app/api/debug/** — it leaks secrets.

==================================================
WHAT YOU NEED TO CREATE
==================================================
1. app/page.tsx — Homepage with dynamic imports (MUST follow Rule 1 below)
2. app/about/page.tsx, app/services/page.tsx, app/contact/page.tsx, app/portfolio/page.tsx — Sub-pages
3. public/site-config.json — ALL website data (copywriting, services, testimonials, FAQ, hours, contact)
4. public/image-map.json — Gallery data with categories and images
5. public/seo.json — SEO metadata
6. public/llms.txt — Business summary for AI models

==================================================
CRITICAL RULES (3 RULES — VIOLATION = BUILD FAILURE)
==================================================

RULE 1: DYNAMIC IMPORTS (NON-NEGOTIABLE)
app/page.tsx MUST use this pattern:
  'use client'
  import dynamic from 'next/dynamic'
  const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
  const Services = dynamic(() => import('@/components/Services'), { ssr: false })
  // ... all components with { ssr: false }
Static imports will crash the build with "Cannot read properties of null (reading 'useContext')".

RULE 2: ZERO HARDCODED TEXT
EVERY piece of text MUST come from site-config.json. Components read it via useSiteData().
  BAD:  <h2>Our Work</h2>
  GOOD: <h2>{config?.pageContent?.galleryTitle || 'Our Work'}</h2>

RULE 3: NO ERROR PAGES
Do NOT create app/error.tsx, app/404.tsx, app/500.tsx, app/not-found.tsx. Next.js handles these.

==================================================
READ THESE FILES FOR DETAILED GUIDANCE
==================================================
- prompt.md — Design seed, creative brief, business data, section order
- .build-instructions/technical-rules.md — All technical rules with code examples
- .build-instructions/design-system.md — Colors, typography, spacing for this business
- .build-instructions/content-guide.md — Writing style, banned words, SEO rules
- .build-instructions/data-schemas.md — Exact JSON structure for site-config.json, image-map.json
- .build-instructions/visual-standards.md — Card geometry, contrast, micro-interactions

START by reading prompt.md, then .build-instructions/technical-rules.md, then create app/page.tsx.`

    await fs.writeFile(mimoPromptFile, mimoPrompt, 'utf-8')
    console.log(`[Builder] MiMo prompt written to: ${mimoPromptFile}`)

    // Install dependencies before launching MiMo Code CLI
    // NEVER set NODE_ENV=production here — npm would skip Tailwind/TypeScript.
    console.log(`[Builder] Installing dependencies...`)
    // Strip NODE_ENV so npm installs dev/build deps (Tailwind, TypeScript)
    const installEnv = { ...process.env } as Record<string, string | undefined>
    delete installEnv.NODE_ENV
    try {
      execSync('npm install --legacy-peer-deps --include=dev', {
        cwd: clientPath,
        stdio: 'pipe',
        timeout: 300000,
        env: installEnv as NodeJS.ProcessEnv,
      })
      console.log(`[Builder] Dependencies installed successfully`)
    } catch (installError: any) {
      console.warn(`[Builder] npm install failed, trying bun install: ${installError.message}`)
      try {
        execSync('bun install', {
          cwd: clientPath,
          stdio: 'pipe',
          timeout: 300000,
          env: installEnv as NodeJS.ProcessEnv,
        })
        console.log(`[Builder] Dependencies installed with bun`)
      } catch (bunError: any) {
        console.warn(`[Builder] bun install also failed: ${bunError.message}. MiMo will handle installation.`)
      }
    }

    // Verify critical packages exist BEFORE MiMo starts — never hand it a
    // half-installed node_modules (that caused the Tailwind/reinstall loop).
    const criticalDeps = ['next', 'react', 'tailwindcss', 'typescript', '@supabase/supabase-js']
    const missingDeps: string[] = []
    for (const dep of criticalDeps) {
      try {
        await fs.access(path.join(clientPath, 'node_modules', ...dep.split('/')))
      } catch {
        missingDeps.push(dep)
      }
    }
    if (missingDeps.length > 0) {
      console.warn(`[Builder] Missing after install: ${missingDeps.join(', ')} — forcing reinstall`)
      try {
        execSync('npm install --legacy-peer-deps --include=dev --force', {
          cwd: clientPath,
          stdio: 'pipe',
          timeout: 300000,
          env: installEnv as NodeJS.ProcessEnv,
        })
      } catch {}
      // Re-check
      const stillMissing: string[] = []
      for (const dep of criticalDeps) {
        try {
          await fs.access(path.join(clientPath, 'node_modules', ...dep.split('/')))
        } catch {
          stillMissing.push(dep)
        }
      }
      if (stillMissing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Dependencies missing after install: ${stillMissing.join(', ')}. Cannot start MiMo.`,
          },
          { status: 500 }
        )
      }
      console.log(`[Builder] All critical dependencies present`)
    }

    // Read the prompt file content to pass as message
    const promptContent = await fs.readFile(mimoPromptFile, 'utf-8')

    // Launch MiMo Code CLI
    console.log(`[Builder] Launching MiMo Code CLI for: ${businessFolder}`)
    console.log(`[Builder] Working directory: ${clientPath}`)

    // Auth env injected into the build process — .env.local alone is not
    // always picked up by `next build`, which caused false "secret not set".
    const bcrypt2 = await import('bcryptjs')
    const crypto2 = await import('crypto')
    const bizFirst = (siteConfig.businessName || businessFolder).split(/[\s&\-,]+/)[0].trim() || 'admin'
    const bizPass = `${bizFirst}@${new Date().getFullYear()}!`
    const bizHash = bcrypt2.hashSync(bizPass, 10)
    const bizHashB64 = Buffer.from(bizHash, 'utf-8').toString('base64')
    const bizSecret = crypto2.randomBytes(32).toString('hex')

    const mimo = spawn('mimo', [
      'run',
      '--dangerously-skip-permissions',
    ], {
      cwd: clientPath,
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
      // NODE_ENV=production is required for `next build` — otherwise React
      // mixes dev/prod runtimes and every page throws useContext errors.
      // Build tooling (tailwind/typescript) lives in dependencies, so npm
      // install is not affected by production mode.
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DASHBOARD_USERNAME: bizFirst,
        DASHBOARD_PASSWORD_HASH: bizHash,
        DASHBOARD_PASSWORD_HASH_BASE64: bizHashB64,
        NEXTAUTH_SECRET: bizSecret,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
    })

    // Pipe prompt via stdin to avoid Windows command-line length limit
    mimo.stdin.write(promptContent)
    mimo.stdin.end()

    // When waitForCompletion is set (used by the sequential build queue),
    // this promise resolves only after MiMo exits AND post-build/deploy finished.
    let mimoSettled: () => void = () => {}
    const mimoDone = new Promise<void>(resolve => {
      mimoSettled = resolve
    })

    mimo.on('close', async (code) => {
      try {
        console.log(`[Builder] MiMo exited with code: ${code}`)

      // Update trial_websites build status based on exit code
      if (trialWebsiteId) {
        if (code === 0) {
          // 'built' = site generated; becomes 'complete' after Vercel deploy
          await updateTrialBuildStatus(trialWebsiteId, 'built')
          if (trialContactId) {
            await writeTrialTimelineEntry(
              trialContactId,
              'build_complete',
              'Website build complete',
              `Website for ${businessFolder} has been built successfully. Starting Vercel deploy.`
            )
          }
          console.log(`[Builder] Trial ${trialWebsiteId} marked as built`)
        } else {
          const errorMsg = `MiMo Code CLI exited with code ${code}`
          await updateTrialBuildStatus(trialWebsiteId, 'failed', { error_message: errorMsg })
          if (trialContactId) {
            await writeTrialTimelineEntry(
              trialContactId,
              'build_failed',
              'Website build failed',
              errorMsg
            )
          }
          console.error(`[Builder] Trial ${trialWebsiteId} marked as failed: ${errorMsg}`)
        }
      }

      // Run post-build cleanup and QA scoring
      try {
        const { runPostBuildCleanup } = await import('@/lib/post-build-cleanup')
        const cleanup = await runPostBuildCleanup(clientPath)
        if (cleanup.actions.length > 0) {
          console.log(`[Builder] Cleanup actions: ${cleanup.actions.join(', ')}`)
        }
        if (cleanup.errors.length > 0) {
          console.warn(`[Builder] Cleanup warnings: ${cleanup.errors.join(', ')}`)
        }
        if (!cleanup.success) {
          console.warn('[Builder] Post-build cleanup detected issues — see warnings above')
        }

        let llmJudgeResult: any = null

        // Log QA score
        if (cleanup.qaScore) {
          const qa = cleanup.qaScore
          console.log(`[Builder] QA Score: ${qa.overall}/10 (accessibility: ${qa.accessibility}, content: ${qa.contentQuality}, images: ${qa.imageQuality}, structure: ${qa.structureScore})`)
          if (qa.issues.length > 0) {
            console.log(`[Builder] QA Issues: ${qa.issues.join(', ')}`)
          }
          if (qa.recommendations.length > 0) {
            console.log(`[Builder] QA Recommendations: ${qa.recommendations.join(', ')}`)
          }

          // Run LLM-as-judge scoring (visual quality)
          try {
            const { judgeWebsite } = await import('@/lib/llm-judge')
            llmJudgeResult = await judgeWebsite({
              projectDir: clientPath,
              businessName: businessFolder,
              archetype: archetype?.id || 'general',
              maxAttempts: 1,
            })
            console.log(`[Builder] LLM Judge Score: ${llmJudgeResult.score}/10 — ${llmJudgeResult.recommendation}`)
            console.log(`[Builder] LLM Judge Feedback: ${llmJudgeResult.feedback}`)
          } catch (judgeError) {
            console.warn('[Builder] LLM Judge failed (non-blocking):', judgeError)
          }

          // Save QA report (includes both rule-based and LLM scores)
          const qaReport = {
            ruleBased: qa,
            llmJudge: llmJudgeResult ? {
              score: llmJudgeResult.score,
              breakdown: llmJudgeResult.breakdown,
              feedback: llmJudgeResult.feedback,
              recommendation: llmJudgeResult.recommendation,
            } : null,
            timestamp: new Date().toISOString(),
            buildFolder: clientPath,
          }
          const { promises: fsPromises } = await import('fs')
          await fsPromises.writeFile(
            path.join(clientPath, 'qa-report.json'),
            JSON.stringify(qaReport, null, 2),
            'utf-8'
          )
        }

        // ── AUTO-DEPLOY TO VERCEL ──────────────────────────────────────────
        // After QA + LLM Judge, push the site live and write the URL back to
        // GeistCRM so the trial link is ready for email / WhatsApp outreach.
        try {
          const { deployToVercel } = await import('@/lib/vercel-deploy')

          if (trialWebsiteId) {
            await updateTrialBuildStatus(trialWebsiteId, 'deploying')
          }

          // Credentials: same scheme the dashboard .env.local uses
          const bcrypt = await import('bcryptjs')
          const crypto = await import('crypto')
          const firstWord = businessName.split(/[\s&\-,]+/)[0].trim() || 'admin'
          const username = firstWord
          const password = `${firstWord}@${new Date().getFullYear()}!`
          const passwordHash = bcrypt.hashSync(password, 10)
          const passwordHashBase64 = Buffer.from(passwordHash, 'utf-8').toString('base64')
          const nextAuthSecret = crypto.randomBytes(32).toString('hex')

          // Vercel project name → https://<name>.vercel.app
          const projectName = (siteConfig?.buildSlug || businessFolder || 'site')
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60)

          const deployResult = await deployToVercel({
            projectDir: clientPath,
            projectName,
            // Clean public subdomain: mamma-mia.sitespire.co.za
            domainLabel: businessName,
            envVars: {
              DASHBOARD_USERNAME: username,
              DASHBOARD_PASSWORD_HASH_BASE64: passwordHashBase64,
              NEXTAUTH_SECRET: nextAuthSecret,
              // Overridden by deployToVercel to the custom domain when attached
              NEXTAUTH_URL: `https://${projectName}.vercel.app`,
              // Platform-wide Resend keys (same sender on every generated site)
              RESEND_API_KEY: process.env.RESEND_API_KEY || '',
              EMAIL_FROM:
                process.env.EMAIL_FROM ||
                `Website Enquiries <no-reply@sitespire.co.za>`,
              CONTACT_FORM_FALLBACK_TO: process.env.CONTACT_FORM_FALLBACK_TO || '',
              // Shared multi-tenant lead DB — SAME on every site
              SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
              SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
              TENANT_ID: trialWebsiteId || '',
            },
          })

          if (deployResult.success && deployResult.url) {
            console.log(`[Builder] Deployed live: ${deployResult.url}`)

            let ownerName = ''
            if (trialWebsiteId) {
              const supabase = createClient()
              await supabase
                .from('trial_websites')
                .update({
                  build_status: 'complete',
                  trial_url: deployResult.url,
                  // Do NOT start the 14-day trial yet — that happens when
                  // the CRM "Send Trial" button emails the client.
                  client_status: 'ready',
                  error_message: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', trialWebsiteId)

              // Park the contact in "ready_to_send" (dashboard queue)
              if (trialContactId) {
                await supabase
                  .from('contacts')
                  .update({
                    contact_status: 'ready_to_send',
                    has_trial_website: true,
                  })
                  .eq('id', trialContactId)
              }

              try {
                const { data: row } = await supabase
                  .from('trial_websites')
                  .select('owner_name, business_name')
                  .eq('id', trialWebsiteId)
                  .maybeSingle()
                ownerName = row?.owner_name || ''
              } catch {}

              if (trialContactId) {
                await writeTrialTimelineEntry(
                  trialContactId,
                  'trial_live',
                  'Trial website is live',
                  `Live URL: ${deployResult.url}\nDashboard: ${deployResult.url}/dashboard\nLogin: ${username} / ${password}\nLLM Judge: ${llmJudgeResult?.score ?? 'n/a'}/10`
                )
              }
            }

            // Internal notification to Sean (never sent to the client)
            try {
              const { sendBuildReadyEmail } = await import('@/lib/build-notify-email')
              const { formatDuration } = await import('@/lib/build-queue')
              const notify = await sendBuildReadyEmail({
                businessName,
                ownerName,
                websiteUrl: deployResult.url,
                vercelUrl: deployResult.vercelUrl,
                dashboardUrl: `${deployResult.url}/dashboard`,
                username,
                password,
                contactId: trialContactId || undefined,
                trialWebsiteId: trialWebsiteId || undefined,
                llmJudgeScore: llmJudgeResult?.score ?? null,
                llmJudgeRecommendation: llmJudgeResult?.recommendation,
                buildDuration: formatDuration(Date.now() - pipelineStartMs),
              })
              if (notify.success) {
                console.log('[Builder] Build-ready email sent to Sean')
              } else {
                console.warn('[Builder] Build-ready email failed:', notify.error)
              }
            } catch (mailErr) {
              console.warn('[Builder] Build-ready email error:', mailErr)
            }

            // Persist deploy info next to the project for debugging
            try {
              const { promises: fsp } = await import('fs')
              await fsp.writeFile(
                path.join(clientPath, 'deploy-report.json'),
                JSON.stringify(
                  {
                    url: deployResult.url,
                    projectId: deployResult.projectId,
                    projectName: deployResult.projectName,
                    blobStoreId: deployResult.blobStoreId,
                    dashboardLogin: { username, password },
                    llmJudgeScore: llmJudgeResult?.score ?? null,
                    deployedAt: new Date().toISOString(),
                    logs: deployResult.logs.slice(-30),
                  },
                  null,
                  2
                ),
                'utf-8'
              )
            } catch {}
          } else {
            console.warn(`[Builder] Deploy failed: ${deployResult.error}`)
            if (trialWebsiteId) {
              await updateTrialBuildStatus(trialWebsiteId, 'failed', {
                error_message: `Deploy failed: ${deployResult.error}`,
              })
              if (trialContactId) {
                // LEAD MUST STAY VISIBLE — park in PreTrial (ready_to_send)
                await createClient()
                  .from('contacts')
                  .update({ contact_status: 'ready_to_send', has_trial_website: true })
                  .eq('id', trialContactId)
                await writeTrialTimelineEntry(
                  trialContactId,
                  'deploy_failed',
                  'Vercel deploy failed — site still in PreTrial',
                  `${deployResult.error || 'Unknown deploy error'}\nLead is on the PreTrial tab so you can fix / rebuild / send manually.`
                )
              }
            }
          }
        } catch (deployError) {
          console.warn('[Builder] Auto-deploy failed (non-blocking):', deployError)
          if (trialWebsiteId) {
            await updateTrialBuildStatus(trialWebsiteId, 'built', {
              error_message: `Deploy error: ${deployError instanceof Error ? deployError.message : String(deployError)}`,
            })
            if (trialContactId) {
              await createClient()
                .from('contacts')
                .update({ contact_status: 'ready_to_send', has_trial_website: true })
                .eq('id', trialContactId)
            }
          }
        }
      } catch (cleanupError) {
        console.warn('[Builder] Post-build cleanup failed:', cleanupError)
      }
      } finally {
        mimoSettled()
      }
    })

    mimo.on('error', async (err) => {
      console.error(`[Builder] Error launching MiMo: ${err.message}`)
      if (trialWebsiteId) {
        await updateTrialBuildStatus(trialWebsiteId, 'failed', { error_message: err.message })
        if (trialContactId) {
          await writeTrialTimelineEntry(
            trialContactId,
            'build_failed',
            'Website build failed',
            `Failed to launch MiMo: ${err.message}`
          )
        }
      }
      mimoSettled()
    })

    // Sequential build queue needs the full pipeline to finish before the next site starts
    if (waitForCompletion) {
      await mimoDone
      return NextResponse.json({
        success: true,
        completed: true,
        message: `Build pipeline finished for ${businessFolder}`,
        buildFolder: clientPath,
      })
    }

    return NextResponse.json({
      success: true,
      launched: true,
      message: `MiMo Code CLI launched for ${businessFolder}`,
      buildFolder: clientPath,
    })

  } catch (error) {
    console.error('[Builder] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
