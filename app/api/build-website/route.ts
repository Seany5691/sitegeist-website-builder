import { NextRequest, NextResponse } from 'next/server'
import { execSync, spawn } from 'child_process'
import path from 'path'
import { promises as fs } from 'fs'
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

export async function POST(request: NextRequest) {
  try {
    const { businessFolder, trialWebsiteId, selectedPalette, reroll } = await request.json()

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
    const siteConfig = JSON.parse(siteConfigRaw)

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
    
    // Detect archetype for font selection
    const { detectIndustry } = await import('@/lib/prompt-builder')
    const archetype = detectIndustry(
      siteConfig.businessName,
      siteConfig.seo?.title,
      siteConfig.seo?.description,
      siteConfig.services
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
    const designSeedId = siteConfig.buildSlug || siteConfig.businessName || 'default'

    // Read image-map.json to get image count for smart gallery selection
    let imageCount = 0
    let categoryCount = 0
    let teamSize = 0
    try {
      const imageMapRaw = await fs.readFile(path.join(clientPath, 'image-map.json'), 'utf-8')
      const imageMap = JSON.parse(imageMapRaw)
      imageCount = imageMap.totalImages || 0
      categoryCount = Object.keys(imageMap.categories || {}).length
    } catch {
      // image-map.json may not exist yet
    }
    try {
      const siteConfigRaw = await fs.readFile(path.join(clientPath, 'site-config.json'), 'utf-8')
      const siteConfigData = JSON.parse(siteConfigRaw)
      teamSize = siteConfigData.team?.length || 0
    } catch {
      // site-config.json may not exist yet
    }

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
    const configTemplate = await fs.readFile(path.join(dashboardTemplateDir, 'assets', 'config.js'), 'utf-8')
    const businessName = siteConfig.businessName || businessFolder
    const firstWord = businessName.split(/\s+/)[0]
    const username = firstWord
    const password = firstWord + '@2026!'
    
    // Clean address - escape newlines and quotes
    const cleanAddress = (siteConfig.contact?.address || siteConfig.city || '')
      .replace(/[\r\n]+/g, ', ')
      .replace(/"/g, '\\"')
      .trim()
    
    const configContent = configTemplate
      .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
      .replace(/\{\{INDUSTRY\}\}/g, siteConfig.industry || 'General Business')
      .replace(/\{\{CITY\}\}/g, siteConfig.city || '')
      .replace(/\{\{OWNER_NAME\}\}/g, siteConfig.ownerName || '')
      .replace(/\{\{USERNAME\}\}/g, username)
      .replace(/\{\{PASSWORD\}\}/g, password)
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
      .replace(/\{\{PRIMARY_COLOR\}\}/g, siteConfig.theme?.palette?.primary || '#6366f1')
      .replace(/\{\{SECONDARY_COLOR\}\}/g, siteConfig.theme?.palette?.secondary || '#8b5cf6')
      .replace(/\{\{ACCENT_COLOR\}\}/g, siteConfig.theme?.palette?.accent || '#f59e0b')
    
    await fs.writeFile(path.join(dashboardTargetDir, 'assets', 'config.js'), configContent, 'utf-8')
    console.log(`[Builder] Dashboard configured for: ${businessName}`)
    console.log(`[Builder] Dashboard login: ${username} / ${password}`)
    console.log(`[Builder] GA4 Measurement ID: ${siteConfig.analytics?.ga4MeasurementId || 'Not found'}`)

    // Write the MiMo prompt to a file
    const mimoPromptFile = path.join(clientPath, '.mimo-prompt.txt')
    
    // Build dynamic instructions based on what data exists
    const hasPricing = siteConfig.pricing && siteConfig.pricing.length > 0
    const hasBlog = siteConfig.blogPosts && siteConfig.blogPosts.length > 0
    const hasGallery = siteConfig.gallery && siteConfig.gallery.length > 0
    const hasServices = siteConfig.services && siteConfig.services.length > 0
    
    const mimoPrompt = `WORKING DIRECTORY: ${clientPath}
You are ALREADY in the correct directory. All files are here. Do NOT search elsewhere.

==================================================
WHAT IS ALREADY BUILT (DO NOT MODIFY)
==================================================
Boilerplate: package.json, next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.js, app/globals.css, app/layout.tsx
Components: components/Hero.tsx (${selectedComponents.hero}), components/Services.tsx (${selectedComponents.services}), components/Gallery.tsx (${selectedComponents.gallery}), components/Testimonials.tsx (${selectedComponents.testimonials}), components/Faq.tsx (${selectedComponents.faq}), components/Contact.tsx (${selectedComponents.contact}), components/About.tsx (${selectedComponents.about}), components/Footer.tsx (${selectedComponents.footer}), components/Header.tsx, components/WhatsAppWidget.tsx, components/AnimateOnScroll.tsx, components/ScrollToTop.tsx, components/CtaBanner.tsx, components/PricingTable.tsx
Lib: lib/use-site-data.ts (fetches site-config.json and image-map.json at runtime)
API: app/api/save-config/route.ts, app/api/upload/route.ts
Dashboard: public/dashboard/ (DO NOT modify)
Pages: app/dashboard/page.tsx (already has redirect)

These components read ALL content from site-config.json via useSiteData(). They use CSS variables for colors. DO NOT modify them.

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
    console.log(`[Builder] Installing dependencies...`)
    try {
      execSync('npm install --legacy-peer-deps --include=dev', {
        cwd: clientPath,
        stdio: 'pipe',
        timeout: 120000,
        env: { ...process.env, NODE_ENV: 'production' },
      })
      console.log(`[Builder] Dependencies installed successfully`)
    } catch (installError: any) {
      console.warn(`[Builder] npm install failed, trying bun install: ${installError.message}`)
      try {
        execSync('bun install', {
          cwd: clientPath,
          stdio: 'pipe',
          timeout: 120000,
          env: { ...process.env, NODE_ENV: 'production' },
        })
        console.log(`[Builder] Dependencies installed with bun`)
      } catch (bunError: any) {
        console.warn(`[Builder] bun install also failed: ${bunError.message}. MiMo will handle installation.`)
      }
    }

    // Read the prompt file content to pass as message
    const promptContent = await fs.readFile(mimoPromptFile, 'utf-8')

    // Launch MiMo Code CLI
    console.log(`[Builder] Launching MiMo Code CLI for: ${businessFolder}`)
    console.log(`[Builder] Working directory: ${clientPath}`)

    const mimo = spawn('mimo', [
      'run',
      '--dangerously-skip-permissions',
    ], {
      cwd: clientPath,
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' },
    })

    // Pipe prompt via stdin to avoid Windows command-line length limit
    mimo.stdin.write(promptContent)
    mimo.stdin.end()

    mimo.on('close', async (code) => {
      console.log(`[Builder] MiMo exited with code: ${code}`)

      // Update trial_websites build status based on exit code
      if (trialWebsiteId) {
        if (code === 0) {
          await updateTrialBuildStatus(trialWebsiteId, 'complete')
          if (trialContactId) {
            await writeTrialTimelineEntry(
              trialContactId,
              'build_complete',
              'Website build complete',
              `Website for ${businessFolder} has been built successfully.`
            )
          }
          console.log(`[Builder] Trial ${trialWebsiteId} marked as complete`)
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
          let llmJudgeResult = null
          try {
            const { judgeWebsite } = await import('@/lib/llm-judge')
            llmJudgeResult = await judgeWebsite({
              projectDir: clientPath,
              businessName: businessFolder,
              archetype: archetype?.id || 'general',
              maxAttempts: 1, // Don't re-roll automatically — just score
              hardFloor: 6.5,
              softBandLow: 6.5,
              softBandHigh: 7.5,
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
      } catch (cleanupError) {
        console.warn('[Builder] Post-build cleanup failed:', cleanupError)
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
    })

    return NextResponse.json({
      success: true,
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
