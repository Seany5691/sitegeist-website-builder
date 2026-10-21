import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { scrapeLegacySite, scrapeSocialMedia } from '@/lib/scraper'
import { searchAndScrapeGoogle } from '@/lib/google-scraper'
import { extractHardFacts, buildCopywriterPrompt, assembleSiteConfig } from '@/lib/hybrid-engine'
import { extractLogoColors, getFinalBrandPalette } from '@/lib/color-extractor'
import { parseStructuredMarkdown } from '@/lib/markdown-parser'
import { BuildSiteRequest, BuildSiteResponse, MasterSiteConfig, ScrapedData } from '@/types/site-config'

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

// Primary: MiMo Token Plan
const MIMO_API_URL = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions'
const MIMO_API_KEY = 'tp-s5mjmff9x4qh31pudzb4k45ipyprkgxvmgeyhidxqo28ljg3'
const MIMO_MODEL = 'mimo-v2.5-pro'

// Secondary: MiMo Prepaid
const MIMO_PREPAID_API_URL = process.env.MIMO_PREPAID_URL || 'https://api.xiaomimimo.com/v1/chat/completions'
const MIMO_PREPAID_API_KEY = process.env.MIMO_PREPAID_API_KEY || ''
const MIMO_PREPAID_MODEL = process.env.MIMO_PREPAID_MODEL || 'mimo-v2.5'

// Tertiary: OpenRouter Fallback
const FALLBACK_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

/**
 * Phase 1: Scrape Website & Generate Config
 * 
 * This endpoint handles the scraping phase of the build pipeline:
 * - Scrapes existing website content (if provided)
 * - Scrapes social media (Instagram, Facebook) for additional images/posts
 * - Scrapes Google Maps for reviews and business info
 * - Detects industry archetype and generates design seed
 * - Extracts logo colors with industry fallback
 * - Assembles site-config.json with all scraped data
 * 
 * Called by: /api/build-trial (step 2 of pipeline)
 * Calls next: /api/build-website (for boilerplate generation)
 * 
 * @param request - Contains business metadata and URLs to scrape
 * @returns JSON response with site-config.json path
 */
export async function POST(request: NextRequest) {
  try {
    const body: BuildSiteRequest = await request.json()
    const { businessName, ownerName, city, whatsappNumber, existingWebsiteUrl, facebookUrl, instagramUrl, googleMapsUrl, industry, buildMode, serviceAreas, features, businessBackground, email, phoneNumber, specificServices, tagline, specificTestimonials, specificImageUrls } = body

    // Validate required fields
    if (!businessName || !whatsappNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: businessName, whatsappNumber' },
        { status: 400 }
      )
    }

    console.log(`[Builder] Starting build for: ${businessName} in ${city}`)

    // ============================================
    // PHASE 1: Gather all data sources
    // ============================================
    
    let scrapedData: ScrapedData | null = null
    let googleData: any = null

    // 1. Scrape website if provided
    if (existingWebsiteUrl) {
      try {
        console.log('[Scraper] Scraping website with Playwright...')
        scrapedData = await scrapeLegacySite(existingWebsiteUrl)
        console.log(`[Scraper] Website: ${scrapedData.pagesScraped} pages, ${scrapedData.imageList.length} images`)
      } catch (error) {
        console.error('[Scraper] Website scraping failed:', error)
        return NextResponse.json(
          { success: false, error: `Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    // 2. Scrape social media if provided
    if (facebookUrl || instagramUrl) {
      try {
        console.log('[Social Scraper] Scraping social media...')
        const socialLinks: { facebook?: string; instagram?: string } = {}
        if (facebookUrl) socialLinks.facebook = facebookUrl
        if (instagramUrl) socialLinks.instagram = instagramUrl

        const socialData = await scrapeSocialMedia(socialLinks)
        
        if (socialData.images.length > 0) {
          // Merge with existing data
          if (scrapedData) {
            scrapedData = {
              ...scrapedData,
              imageList: [...scrapedData.imageList, ...socialData.images],
              fullMarkdown: scrapedData.fullMarkdown + '\n\nSocial Media:\n' + socialData.content,
            }
          } else {
            // Create minimal scraped data from social media
            scrapedData = {
              title: businessName,
              fullMarkdown: socialData.content,
              imageList: socialData.images,
              potentialLogos: [],
              contactInfo: { phone: whatsappNumber, whatsapp: whatsappNumber, email: '', address: city },
              pagesDiscovered: [],
              pagesScraped: 0,
              analytics: {},
            }
          }
          console.log(`[Social Scraper] Added ${socialData.images.length} social media images`)
        }
      } catch (error) {
        console.error('[Social Scraper] Failed:', error)
      }
    }

    // 3. Scrape Google Maps if provided
    if (googleMapsUrl) {
      try {
        console.log('[Google Scraper] Scraping Google Maps...')
        googleData = await searchAndScrapeGoogle(businessName, city)
        if (googleData) {
          console.log(`[Google Scraper] Found: ${googleData.rating}★, ${googleData.reviews.length} reviews`)
        }
      } catch (error) {
        console.error('[Google Scraper] Failed:', error)
      }
    }

    // ============================================
    // PHASE 2: Detect archetype & design seed (before color extraction)
    // ============================================
    
    const { detectIndustry } = await import('@/lib/prompt-builder')
    const { generateDesignSeed, getArchetypeConstraintKey } = await import('@/lib/design-seed')
    const { getIndustryTemplate, getIndustryStyle, getIndustryColorPalette, getIndustryTypography, getIndustryTrustSignals, getIndustryConversionCTAs, getIndustryImageryDirection } = await import('@/lib/industry-templates')
    
    // Early archetype detection from scraped data (before hard facts extraction)
    const earlyArchetype = detectIndustry(
      businessName,
      scrapedData?.pagesDetails?.[0]?.title || '',
      scrapedData?.fullMarkdown?.substring(0, 500) || industry || '',
      [],
      existingWebsiteUrl,
      industry
    )
    
    const constraintKey = getArchetypeConstraintKey(earlyArchetype.id)
    const designSeed = generateDesignSeed(businessName || 'business', constraintKey)
    const industryTemplate = getIndustryTemplate(earlyArchetype.id)
    const industryColorPalette = industryTemplate ? getIndustryColorPalette(industryTemplate, designSeed.id.charCodeAt(1), (designSeed.id.charCodeAt(3) % 30) - 15) : null
    
    console.log(`[Design] Early archetype: ${earlyArchetype.name} (${earlyArchetype.id})`)
    console.log(`[Design] Industry palette: ${industryColorPalette?.name || 'Default'}`)

    // ============================================
    // PHASE 3: Extract colors (with industry palette fallback)
    // ============================================
    
    let extractedColors = { 
      primary: industryColorPalette?.primary || '#0ea5e9', 
      secondary: industryColorPalette?.secondary || '#6366f1', 
      accent: industryColorPalette?.accent || '#f59e0b', 
      bg: industryColorPalette?.bg || '#09090b' 
    }
    
    if (scrapedData?.potentialLogos?.[0]) {
      try {
        const logoColors = await extractLogoColors(scrapedData.potentialLogos[0], existingWebsiteUrl)
        const finalPalette = getFinalBrandPalette(logoColors, scrapedData?.cssColors || null, businessName, industryColorPalette ? { primary: industryColorPalette.primary, secondary: industryColorPalette.secondary, accent: industryColorPalette.accent, bg: industryColorPalette.bg } : undefined)
        extractedColors = {
          primary: finalPalette.primary,
          secondary: finalPalette.secondary,
          accent: finalPalette.accent,
          bg: finalPalette.bg,
        }
        console.log('[Color Extractor] Extracted colors:', extractedColors)
      } catch (error) {
        console.warn('[Color Extractor] Failed, using industry palette:', error)
      }
    }

    // ============================================
    // PHASE 3: Extract hard facts (deterministic)
    // ============================================
    
    console.log('[Hybrid Engine] Extracting hard facts...')
    const hardFacts = extractHardFacts(
      {
        businessName,
        ownerName: ownerName || '',
        city,
        whatsappNumber,
        existingWebsiteUrl,
        facebookUrl,
        instagramUrl,
        googleMapsUrl,
        industry,
        serviceAreas,
        features,
        businessBackground,
        email,
        phoneNumber,
        specificServices,
        tagline,
        specificTestimonials,
        specificImageUrls,
      },
      scrapedData,
      extractedColors,
      googleData
    )
    
    console.log(`[Hybrid Engine] Industry: ${hardFacts.industry}`)
    console.log(`[Hybrid Engine] Images: ${hardFacts.allImages.length} total, ${hardFacts.imagesByCategory.size} categories`)

    // ============================================
    // PHASE 3.5: Refine archetype & generate design seed (after hard facts)
    // ============================================
    
    // Re-detect archetype with full hard facts for better accuracy
    const archetype = detectIndustry(
      businessName,
      hardFacts.services.length > 0 ? hardFacts.services[0].title : '',
      hardFacts.industry,
      hardFacts.services,
      existingWebsiteUrl,
      industry || hardFacts.industry
    )
    
    // Regenerate design seed with refined archetype
    const refinedConstraintKey = getArchetypeConstraintKey(archetype.id)
    const refinedDesignSeed = generateDesignSeed(businessName || 'business', refinedConstraintKey)
    
    // Get industry template details for copywriter context
    const industryStyle = industryTemplate ? getIndustryStyle(industryTemplate, refinedDesignSeed.id.charCodeAt(0)) : null
    const refinedIndustryColorPalette = industryTemplate ? getIndustryColorPalette(industryTemplate, refinedDesignSeed.id.charCodeAt(1), (refinedDesignSeed.id.charCodeAt(3) % 30) - 15) : null
    const industryTrustSignals = industryTemplate ? getIndustryTrustSignals(industryTemplate) : []
    const industryConversionCTAs = industryTemplate ? getIndustryConversionCTAs(industryTemplate) : []
    const industryImageryDirection = industryTemplate ? getIndustryImageryDirection(industryTemplate) : ''
    
    console.log(`[Design] Refined archetype: ${archetype.name} (${archetype.id})`)
    console.log(`[Design] Seed: ${refinedDesignSeed.id} | Art: ${refinedDesignSeed.artDirection} | Layout: ${refinedDesignSeed.layoutStyle}`)

    const isDarkMode = archetype.themeMode === 'dark'
    const finalBg = archetype.defaultBg || '#FFFFFF'

    // ============================================
    // PHASE 4: Generate creative copy with design context
    // ============================================
    
    console.log('[Copywriter] Generating creative copy with design context...')
    
    const copywriterPrompt = buildCopywriterPrompt(hardFacts, {
      archetypeName: archetype.name,
      archetypeMood: archetype.colorPsychology.mood,
      artDirection: refinedDesignSeed.artDirection,
      layoutStyle: refinedDesignSeed.layoutStyle,
      typographyPairing: refinedDesignSeed.typographyPairing,
      colorPaletteName: refinedIndustryColorPalette?.name || 'Default',
      colorMood: refinedIndustryColorPalette?.mood || archetype.colorPsychology.mood,
      sectionOrder: refinedDesignSeed.sectionOrder.map(i => ['Hero', 'Services', 'Gallery', 'Testimonials', 'FAQ', 'About', 'Team', 'Contact', 'Footer'][i] || '').filter(Boolean).join(' → '),
      imageryDirection: industryImageryDirection,
      trustSignals: industryTrustSignals,
      conversionCTAs: industryConversionCTAs,
    })
    let creativeCopy: any = null
    let copywriterSuccess = false
    
    try {
      // Primary: MiMo Token Plan
      console.log('[Copywriter] [PRIMARY] Calling MiMo Token Plan...')
      let response = await fetch(MIMO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MIMO_API_KEY}`,
        },
        body: JSON.stringify({
          model: MIMO_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert website copywriter who writes copy that matches specific visual design directions. You NEVER use generic corporate language. You write specific, concrete, human copy that references real facts — locations, numbers, names, processes. You match your tone to the visual mood: bold and authoritative for industrial sites, warm and inviting for hospitality, clean and professional for medical. Return structured markdown with ## section headings. No JSON. No code blocks. Just markdown.' },
            { role: 'user', content: copywriterPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || ''
        
        console.log(`[Copywriter] ✓ MiMo Token Plan succeeded - ${content.length} chars`)
        
        // Parse structured markdown instead of JSON
        creativeCopy = parseStructuredMarkdown(content)
        copywriterSuccess = true
      } else {
        console.warn('[Copywriter] MiMo Token Plan returned error:', response.status)
        throw new Error(`Token Plan failed: ${response.status}`)
      }
    } catch (error) {
      console.warn('[Copywriter] MiMo Token Plan failed:', error)
      
      // Secondary: MiMo Prepaid
      if (!copywriterSuccess && MIMO_PREPAID_API_KEY) {
        try {
          console.log('[Copywriter] [SECONDARY] Calling MiMo Prepaid...')
          const response = await fetch(MIMO_PREPAID_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MIMO_PREPAID_API_KEY}`,
            },
            body: JSON.stringify({
              model: MIMO_PREPAID_MODEL,
              messages: [
                { role: 'system', content: 'You are an expert website copywriter who writes copy that matches specific visual design directions. You NEVER use generic corporate language. You write specific, concrete, human copy that references real facts — locations, numbers, names, processes. You match your tone to the visual mood: bold and authoritative for industrial sites, warm and inviting for hospitality, clean and professional for medical. Return structured markdown with ## section headings. No JSON. No code blocks. Just markdown.' },
                { role: 'user', content: copywriterPrompt },
              ],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const content = data.choices?.[0]?.message?.content || ''
            
            console.log(`[Copywriter] ✓ MiMo Prepaid succeeded - ${content.length} chars`)
            
            creativeCopy = parseStructuredMarkdown(content)
            copywriterSuccess = true
          } else {
            console.warn('[Copywriter] MiMo Prepaid returned error:', response.status)
          }
        } catch (prepaidError) {
          console.warn('[Copywriter] MiMo Prepaid failed:', prepaidError)
        }
      }
      
      // Tertiary: OpenRouter
      if (!copywriterSuccess && process.env.OPENROUTER_API_KEY) {
        try {
          console.log('[Copywriter] [TERTIARY] Calling OpenRouter...')
          const response = await fetch(FALLBACK_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://sitegeist.com',
              'X-Title': 'SiteSpire Website Builder',
            },
            body: JSON.stringify({
              model: FALLBACK_MODEL,
              messages: [
                { role: 'system', content: 'You are an expert website copywriter who writes copy that matches specific visual design directions. You NEVER use generic corporate language. You write specific, concrete, human copy that references real facts — locations, numbers, names, processes. You match your tone to the visual mood: bold and authoritative for industrial sites, warm and inviting for hospitality, clean and professional for medical. Return structured markdown with ## section headings. No JSON. No code blocks. Just markdown.' },
                { role: 'user', content: copywriterPrompt },
              ],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const content = data.choices?.[0]?.message?.content || ''
            
            console.log(`[Copywriter] ✓ OpenRouter succeeded - ${content.length} chars`)
            
            creativeCopy = parseStructuredMarkdown(content)
            copywriterSuccess = true
          }
        } catch (openrouterError) {
          console.warn('[Copywriter] OpenRouter failed:', openrouterError)
        }
      }
    }

    // Fallback if AI fails
    if (!creativeCopy || !creativeCopy.heroHeadline) {
      creativeCopy = generateFallbackCopy(hardFacts)
      console.log('[Copywriter] Using fallback copy')
    }

    // ============================================
    // PHASE 5: Assemble site config (deterministic)
    // ============================================
    
    console.log('[Hybrid Engine] Assembling site config...')
    
    // Reuse archetype from Phase 3.5 (already detected)
    const siteConfig = assembleSiteConfig(hardFacts, creativeCopy, archetype)
    
    // Override theme colors with industry palette when logo colors aren't dominant
    // This ensures site-config.json matches the design system colors
    if (refinedIndustryColorPalette) {
      const logoExtracted = scrapedData?.potentialLogos?.[0] && extractedColors.primary !== refinedIndustryColorPalette.primary
      if (!logoExtracted) {
        // No logo colors extracted — use industry palette
        siteConfig.theme = siteConfig.theme || {}
        siteConfig.theme.palette = {
          primary: refinedIndustryColorPalette.primary,
          secondary: refinedIndustryColorPalette.secondary,
          accent: refinedIndustryColorPalette.accent,
          bg: refinedIndustryColorPalette.bg || siteConfig.theme?.palette?.bg || '#ffffff',
          text: siteConfig.theme?.palette?.text || '#1a1a1a',
          muted: siteConfig.theme?.palette?.muted || '#6b7280',
        }
        siteConfig.brandAssets = siteConfig.brandAssets || {}
        siteConfig.brandAssets.brandColors = {
          primary: refinedIndustryColorPalette.primary,
          secondary: refinedIndustryColorPalette.secondary,
          accent: refinedIndustryColorPalette.accent,
          bg: refinedIndustryColorPalette.bg || '#ffffff',
        }
        console.log(`[Builder] Applied industry palette to site-config: ${refinedIndustryColorPalette.name}`)
      }
    }
    
    // ============================================
    // PHASE 6: Generate prompt (file-based)
    // ============================================
    
    console.log('[Prompt Builder] Generating build instructions...')
    const { generateBuildInstructions } = await import('@/lib/prompt-builder')
    const instructions = generateBuildInstructions({
      buildMode: buildMode || 'TRIAL',
      siteConfig,
      websitesFolder: WEBSITES_FOLDER,
    })

    // ============================================
    // PHASE 7: Save outputs
    // ============================================
    
    const clientFolder = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const clientPath = path.join(WEBSITES_FOLDER, clientFolder)
    await fs.mkdir(clientPath, { recursive: true })
    await fs.mkdir(path.join(clientPath, 'data'), { recursive: true })

    // ── Client-uploaded logo takes absolute precedence ─────────────────────
    // uploaded > scraped > generated. Once set, downstream scrape/image steps
    // must not overwrite brandAssets.logoUrl (guards in media-downloader + ai-engine).
    const uploadedLogo = (body as any)?.uploadedLogo
    if (uploadedLogo?.storedName) {
      const stagedPath = path.join(process.cwd(), 'temp', 'uploaded-logos', path.basename(uploadedLogo.storedName))
      try {
        await fs.access(stagedPath)
        siteConfig.brandAssets = siteConfig.brandAssets || {
          brandColors: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b', bg: '#ffffff' },
        }
        const ext = path.extname(uploadedLogo.storedName).toLowerCase()
        const siteLogoRel = `/uploads/logo${ext}`
        const siteLogoAbs = path.join(clientPath, 'public', siteLogoRel.replace(/^\//, ''))
        await fs.mkdir(path.dirname(siteLogoAbs), { recursive: true })
        await fs.copyFile(stagedPath, siteLogoAbs)
        siteConfig.brandAssets.logoUrl = siteLogoRel
        siteConfig.brandAssets.logoSource = 'uploaded'
        siteConfig.brandAssets.logoName = uploadedLogo.name || uploadedLogo.storedName
        if (siteConfig.hero) siteConfig.hero.logoUrl = siteLogoRel
        console.log(`[Builder] Using CLIENT-UPLOADED logo: ${siteConfig.brandAssets.logoName}`)
      } catch (e) {
        console.warn('[Builder] Uploaded logo not in staging — falling back to scrape/generate.', e)
      }
    }

    // Write all output files
    await fs.writeFile(path.join(clientPath, 'site-config.json'), JSON.stringify(siteConfig, null, 2), 'utf-8')
    await fs.writeFile(path.join(clientPath, 'seo.json'), JSON.stringify(siteConfig.seo, null, 2), 'utf-8')
    
    // Generate enhanced image-map.json with category pages
    const imageMap = generateImageMap(scrapedData, siteConfig)
    await fs.writeFile(path.join(clientPath, 'image-map.json'), JSON.stringify(imageMap, null, 2), 'utf-8')
    
    // Generate gallery-data.json from image-map.json categories
    const galleryData = generateGalleryDataFromImageMap(imageMap)
    await fs.writeFile(path.join(clientPath, 'gallery-data.json'), JSON.stringify(galleryData, null, 2), 'utf-8')
    
    // Write file-based build instructions
    const instructionsDir = path.join(clientPath, '.build-instructions')
    await fs.mkdir(instructionsDir, { recursive: true })
    await fs.writeFile(path.join(instructionsDir, 'technical-rules.md'), instructions.technicalRules, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'design-system.md'), instructions.designSystem, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'content-guide.md'), instructions.contentGuide, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'data-schemas.md'), instructions.dataSchemas, 'utf-8')
    await fs.writeFile(path.join(instructionsDir, 'visual-standards.md'), instructions.visualStandards, 'utf-8')
    
    // Write short prompt to prompt.md
    await fs.writeFile(path.join(clientPath, 'prompt.md'), instructions.shortPrompt, 'utf-8')

    // Always download and process images (no more trial/production split)
    const { processAndDownloadImages } = await import('@/lib/image-processor')
    const allImageUrls = [
      ...(hardFacts.allImages || []),
      ...(scrapedData?.imageList || []),
      ...(scrapedData?.allDiscoveredImages || []),
    ]

    // Build source URLs and metadata from scraped data
    const sourceUrls: Record<string, string[]> = {}
    const imageAltMap: Record<string, string> = {}
    const imageDimensionsMap: Record<string, { width: number; height: number }> = {}

    for (const url of allImageUrls) {
      sourceUrls[url] = [existingWebsiteUrl || '']
    }

    // Extract alt text and dimensions from scraped metadata
    if (scrapedData?.scrapedImagesMetadata) {
      for (const meta of scrapedData.scrapedImagesMetadata) {
        if (meta.alt) imageAltMap[meta.url] = meta.alt
        if (meta.width && meta.height) {
          imageDimensionsMap[meta.url] = { width: meta.width, height: meta.height }
        }
        if (meta.sourceUrls?.length) {
          sourceUrls[meta.url] = meta.sourceUrls
        }
      }
    }

    const processedImages = await processAndDownloadImages(
      siteConfig.businessName,
      allImageUrls,
      sourceUrls,
      siteConfig.brandAssets?.logoUrl,
      siteConfig.hero?.heroImageUrl,
      imageAltMap,
      imageDimensionsMap,
      archetype.id
    )
    // Overwrite image-map.json with processed version
    await fs.writeFile(path.join(clientPath, 'image-map.json'), JSON.stringify(processedImages, null, 2), 'utf-8')

    // Update site-config.json with local image paths from processed images
    if (processedImages.totalImages > 0) {
      // Update hero image to local path
      if (processedImages.hero?.[0]?.url) {
        siteConfig.hero = siteConfig.hero || {}
        siteConfig.hero.heroImageUrl = processedImages.hero[0].url
      }
      // Update logo to local path
      if (processedImages.logo) {
        siteConfig.brandAssets = siteConfig.brandAssets || {}
        siteConfig.brandAssets.logoUrl = processedImages.logo
      }
      // Update service images from first available category images
      const firstCategory = Object.values(processedImages.categories)[0] as any
      if (firstCategory?.images) {
        const serviceImages = firstCategory.images.filter((img: any) => img.src)
        if (siteConfig.services) {
          for (let i = 0; i < siteConfig.services.length && i < serviceImages.length; i++) {
            if (!siteConfig.services[i].realImageUrl || siteConfig.services[i].realImageUrl?.includes('logo')) {
              siteConfig.services[i].realImageUrl = serviceImages[i].src
            }
          }
        }
      }
      // Update gallery in site-config with local paths
      siteConfig.gallery = []
      for (const [catName, catData] of Object.entries(processedImages.categories)) {
        const cat = catData as any
        for (const img of (cat.images || [])) {
          siteConfig.gallery.push({
            imageUrl: img.src,
            caption: `${catName} - ${siteConfig.gallery.length + 1}`,
            category: catName,
          })
        }
      }
      // Update categorized galleries
      siteConfig.categorizedGalleries = {}
      for (const [catName, catData] of Object.entries(processedImages.categories)) {
        const cat = catData as any
        siteConfig.categorizedGalleries[catName] = (cat.images || []).map((img: any) => ({
          imageUrl: img.src,
          caption: `${catName} - 1`,
          category: catName,
        }))
      }
      // Re-write site-config.json with updated image paths
      await fs.writeFile(path.join(clientPath, 'site-config.json'), JSON.stringify(siteConfig, null, 2), 'utf-8')
      console.log(`[Builder] Updated site-config.json with ${processedImages.totalImages} local image paths`)

      // Regenerate prompt.md now that images are processed and site-config has local paths
      const { generateBuildInstructions: regenInstructions } = await import('@/lib/prompt-builder')
      const updatedInstructions = regenInstructions({
        buildMode: buildMode || 'TRIAL',
        siteConfig,
        websitesFolder: WEBSITES_FOLDER,
      })
      await fs.writeFile(path.join(clientPath, 'prompt.md'), updatedInstructions.shortPrompt, 'utf-8')
      console.log('[Builder] Regenerated prompt.md with updated image paths')
    }

    // Delete stale gallery-data.json (it has external URLs, image-map.json has local paths)
    try {
      await fs.unlink(path.join(clientPath, 'gallery-data.json'))
      console.log('[Builder] Removed stale gallery-data.json')
    } catch {}

    // Build response
    const response: BuildSiteResponse = {
      success: true,
      buildSlug: siteConfig.buildSlug,
      buildFolder: clientPath,
      config: siteConfig,
      imagesExtracted: hardFacts.allImages.length,
      logosExtracted: scrapedData?.potentialLogos?.length || 0,
      pagesScraped: scrapedData?.pagesScraped || 0,
      prompt: instructions.shortPrompt,
      promptPath: path.join(clientPath, 'prompt.md'),
      configPath: path.join(clientPath, 'site-config.json'),
      colorPalette: refinedIndustryColorPalette ? {
        id: refinedIndustryColorPalette.id,
        name: refinedIndustryColorPalette.name,
        primary: refinedIndustryColorPalette.primary,
        secondary: refinedIndustryColorPalette.secondary,
        accent: refinedIndustryColorPalette.accent,
        bg: refinedIndustryColorPalette.bg || finalBg,
        text: refinedIndustryColorPalette.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a'),
        mood: refinedIndustryColorPalette.mood,
      } : undefined,
      availablePalettes: industryTemplate ? industryTemplate.colorPalettes.map(p => ({
        id: p.id,
        name: p.name,
        primary: p.primary,
        secondary: p.secondary,
        accent: p.accent,
        bg: p.bg || finalBg,
        text: p.text || (isDarkMode ? '#f5f5f5' : '#1a1a1a'),
        mood: p.mood,
      })) : [],
      buildInstructions: {
        designSystem: instructions.designSystem,
        technicalRules: instructions.technicalRules,
        contentGuide: instructions.contentGuide,
        dataSchemas: instructions.dataSchemas,
        visualStandards: instructions.visualStandards,
      },
    }

    console.log(`[Builder] Build complete: ${clientPath}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('[Builder] Fatal error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Generate enhanced image-map.json with category pages
function generateImageMap(scrapedData: any, siteConfig: any): any {
  const categories: Record<string, any> = {}
  const pages: Record<string, any> = {}
  
  // Extract categories from portfolio categories
  if (scrapedData?.portfolioCategories) {
    for (const cat of scrapedData.portfolioCategories) {
      categories[cat.name] = {
        url: cat.url,
        imageUrl: cat.imageUrl,
        description: cat.description,
        images: [],
      }
    }
  }
  
  // Extract images from pages and categorize them
  if (scrapedData?.pagesDetails) {
    for (const page of scrapedData.pagesDetails) {
      const url = page.url.toLowerCase()
      const pageName = extractPageName(url)
      
      // Store page info
      pages[pageName] = {
        url: page.url,
        title: page.title,
        images: page.images || [],
      }
      
      // Try to match page to category
      const category = matchPageToCategory(url, page.title)
      if (category && categories[category]) {
        // Add images to category
        categories[category].images.push(...(page.images || []))
      }
    }
  }
  
  // Also use categorizedGalleries from siteConfig if available
  if (siteConfig?.categorizedGalleries) {
    for (const [catName, catImages] of Object.entries(siteConfig.categorizedGalleries)) {
      if (!categories[catName]) {
        categories[catName] = {
          url: '',
          images: [],
        }
      }
      // Merge images
      const existingImages = new Set(categories[catName].images)
      for (const img of catImages as any[]) {
        if (!existingImages.has(img.imageUrl)) {
          categories[catName].images.push(img.imageUrl)
        }
      }
    }
  }
  
  // Filter out categories that are clearly irrelevant to the business industry
  const industry = siteConfig?.industry?.toLowerCase() || ''
  const photographyCategories = ['Weddings', 'Families', 'Newborn', 'Maternity', 'Portraits', 'Couples', 'Matric', 'Cake Smash', 'Birthday']
  const isPhotography = industry.includes('photo') || industry.includes('studio')
  
  for (const catName of Object.keys(categories)) {
    // Remove photography-specific categories for non-photography businesses
    if (!isPhotography && photographyCategories.includes(catName)) {
      // Move images to a generic "Portfolio" category instead of deleting
      if (!categories['Portfolio']) {
        categories['Portfolio'] = { url: '', images: [] }
      }
      categories['Portfolio'].images.push(...(categories[catName].images || []))
      delete categories[catName]
    }
  }
  
  return {
    businessName: siteConfig?.businessName || '',
    scrapedAt: new Date().toISOString(),
    totalImages: Object.values(categories).reduce((sum: number, cat: any) => sum + cat.images.length, 0),
    categories,
    pages,
    ga4MeasurementId: scrapedData?.ga4MeasurementId || null,
  }
}

function extractPageName(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname
    if (path === '/' || path === '') return 'home'
    return path.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-') || 'home'
  } catch {
    return 'unknown'
  }
}

function matchPageToCategory(url: string, title: string): string | null {
  const lower = url.toLowerCase()
  const titleLower = title.toLowerCase()
  
  // Photography categories
  if (lower.includes('wedding') || titleLower.includes('wedding')) return 'Weddings'
  if (lower.includes('famil') || titleLower.includes('famil')) return 'Families'
  if (lower.includes('newborn') || lower.includes('baby') || titleLower.includes('newborn')) return 'Newborn'
  if (lower.includes('maternity') || lower.includes('pregnancy') || titleLower.includes('maternity')) return 'Maternity'
  if (lower.includes('portrait') || titleLower.includes('portrait')) return 'Portraits'
  if (lower.includes('couple') || lower.includes('engagement') || titleLower.includes('couple')) return 'Couples'
  if (lower.includes('matric') || lower.includes('graduation') || titleLower.includes('matric')) return 'Matric'
  if (lower.includes('cake-smash') || lower.includes('cakesmash') || titleLower.includes('cake smash')) return 'Cake Smash'
  if (lower.includes('birthday') || titleLower.includes('birthday')) return 'Birthday'
  
  // Business categories
  if (lower.includes('event') || titleLower.includes('event')) return 'Events'
  if (lower.includes('product') || titleLower.includes('product')) return 'Products'
  if (lower.includes('menu') || titleLower.includes('menu')) return 'Menu'
  if (lower.includes('team') || titleLower.includes('team')) return 'Team'
  if (lower.includes('blog') || titleLower.includes('blog')) return 'Blog'
  if (lower.includes('service') || titleLower.includes('service')) return 'Services'
  if (lower.includes('pricing') || titleLower.includes('pricing')) return 'Pricing'
  
  return null
}

// Generate gallery-data.json from image-map.json categories
function generateGalleryDataFromImageMap(imageMap: any): any[] {
  const galleryData: any[] = []
  
  if (imageMap?.categories) {
    for (const [categoryName, categoryData] of Object.entries(imageMap.categories)) {
      const catData = categoryData as any
      
      // Skip empty categories or non-gallery categories
      if (!catData.images || catData.images.length === 0) continue
      if (categoryName === 'General' || categoryName.includes('Call me')) continue
      
      // Add each image with category info
      catData.images.forEach((imageUrl: string, index: number) => {
        galleryData.push({
          imageUrl,
          caption: `${categoryName} - ${index + 1}`,
          category: categoryName,
        })
      })
    }
  }
  
  // If no categories found, fall back to General
  if (galleryData.length === 0 && imageMap?.categories?.General?.images) {
    imageMap.categories.General.images.forEach((imageUrl: string, index: number) => {
      galleryData.push({
        imageUrl,
        caption: `General - ${index + 1}`,
        category: 'General',
      })
    })
  }
  
  return galleryData
}

// Fallback copy generator when AI fails - uses scraped data as source of truth
function generateFallbackCopy(facts: any): any {
  const industry = facts.industry || 'Business'
  const city = facts.city || 'your area'
  
  // Use actual services from scraped data
  const services = facts.services?.length > 0 
    ? facts.services.map((s: any) => ({
        title: s.title,
        description: s.description,
        priceTag: (s.price && s.price !== 'R0' && s.price !== 'R') ? s.price : undefined,
      }))
    : [{ title: 'Our Services', description: `Professional ${industry.toLowerCase()} services in ${city}.`, priceTag: undefined }]
  
  // Use actual testimonials from scraped data
  const testimonials = facts.googleReviews?.length > 0
    ? facts.googleReviews.slice(0, 3).map((r: any) => ({
        name: r.author,
        text: r.text,
        rating: r.rating,
        source: 'Google',
      }))
    : [{ name: 'Satisfied Client', text: 'Excellent service and professional team!', rating: 5, source: 'Google' }]
  
  // Extract locations from address
  const locations = []
  if (facts.address) {
    locations.push({ name: city, address: facts.address, phone: facts.whatsappNumber })
  }
  
  return {
    heroHeadline: `Welcome to ${facts.businessName}`,
    heroSubheadline: `Quality ${industry.toLowerCase()} services in ${city}`,
    heroBadge: 'Trusted Local Business',
    heroCta: 'Contact Us',
    
    aboutTitle: `About ${facts.businessName}`,
    aboutDescription: facts.ownerName
      ? `${facts.businessName} is a ${industry.toLowerCase()} business in ${city}, led by ${facts.ownerName}. We serve ${city} and surrounding areas with reliable, professional service.`
      : `${facts.businessName} is a ${industry.toLowerCase()} business in ${city}. We serve ${city} and surrounding areas with reliable, professional service.`,
    
    servicesTitle: 'Our Services',
    serviceDescriptions: services,
    
    teamTitle: 'Our Team',
    teamMembers: facts.ownerName ? [{ name: facts.ownerName, role: 'Owner', bio: '' }] : [],
    
    testimonialsTitle: 'What Our Clients Say',
    testimonials,
    
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { question: `What services does ${facts.businessName} offer?`, answer: `We offer a range of ${industry.toLowerCase()} services tailored to your needs.` },
      { question: 'How can I get a quote?', answer: 'Contact us via phone or email for a free, no-obligation quote.' },
      { question: 'What areas do you serve?', answer: `We serve ${city} and surrounding areas.` },
    ],
    
    contactTitle: 'Get In Touch',
    contactDescription: `Ready to experience the ${facts.businessName} difference? Contact us today to discuss your needs.`,
    locations,
    
    seoTitle: `${facts.businessName} | ${industry} in ${city}`,
    seoDescription: `Professional ${industry.toLowerCase()} services in ${city}. Contact ${facts.businessName} for quality service and exceptional results.`,
    seoKeywords: [facts.businessName, industry, city, `${industry} ${city}`, 'services'],
    
    galleryTitle: 'Our Work',
    galleryCategories: Array.from(facts.imagesByCategory?.keys() || ['Portfolio']).map((cat: any) => ({
      name: String(cat),
      description: `Browse our ${String(cat).toLowerCase()} collection`,
    })),
    
    trustBadges: [
      'Licensed & Insured',
      'Years of Experience',
      'Customer Satisfaction Guaranteed',
      'Professional Service',
      'Competitive Pricing',
    ],
    
    whyChooseUs: [
      { title: 'Experience', description: `With years of experience in ${industry.toLowerCase()}, we deliver exceptional results every time.` },
      { title: 'Quality', description: 'We use only the best materials and techniques to ensure lasting quality.' },
      { title: 'Service', description: 'Our dedicated team is committed to your complete satisfaction.' },
    ],
    
    motto: '',
    history: '',
    specializations: [],
    hasWhatsApp: true,
  }
}
