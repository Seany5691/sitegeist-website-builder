/**
 * Post-Build Cleanup Script
 * Runs after MiMo finishes to verify and fix any issues.
 * Ensures the build will pass and components are correct.
 * Includes accessibility checks and QA scoring.
 */

import { promises as fs } from 'fs'
import path from 'path'

interface CleanupResult {
  success: boolean
  actions: string[]
  errors: string[]
  qaScore?: QAScore
}

interface QAScore {
  overall: number           // 0-10
  accessibility: number     // 0-10
  contentQuality: number    // 0-10
  imageQuality: number      // 0-10
  structureScore: number    // 0-10
  issues: string[]
  recommendations: string[]
}

// Hash of the correct app/page.tsx content (dynamic imports pattern)
const EXPECTED_PAGE_TSX_PATTERNS = [
  "import dynamic from 'next/dynamic'",
  "dynamic(() => import('@/components/Header')",
  "dynamic(() => import('@/components/Hero')",
  "dynamic(() => import('@/components/Footer')",
]

// Files MiMo should NEVER create
const FORBIDDEN_FILES = [
  'app/error.tsx',
  'app/404.tsx',
  'app/500.tsx',
  'app/not-found.tsx',
  'pages/_error.tsx',
  'pages/404.tsx',
  'pages/500.tsx',
  'pages/_document.tsx',
  'pages/_document.js',
]

// Pre-built component files that MiMo should NOT overwrite
const PREBUILT_COMPONENTS = [
  'components/Hero.tsx',
  'components/Services.tsx',
  'components/Gallery.tsx',
  'components/Testimonials.tsx',
  'components/Contact.tsx',
  'components/About.tsx',
  'components/Faq.tsx',
  'components/Footer.tsx',
  'components/Header.tsx',
  'components/WhatsAppWidget.tsx',
  'components/AnimateOnScroll.tsx',
  'lib/use-site-data.ts',
  'app/api/save-config/route.ts',
  'app/api/upload/route.ts',
  'app/dashboard/page.tsx',
]

export async function runPostBuildCleanup(projectDir: string): Promise<CleanupResult> {
  const result: CleanupResult = { success: true, actions: [], errors: [] }

  // 1. Delete forbidden files
  for (const file of FORBIDDEN_FILES) {
    const filePath = path.join(projectDir, file)
    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      result.actions.push(`Deleted forbidden file: ${file}`)
    } catch {
      // File doesn't exist — good
    }
  }

  // 1b. Delete entire pages/ directory if it exists (App Router project should not have pages/)
  const pagesDir = path.join(projectDir, 'pages')
  try {
    await fs.access(pagesDir)
    await fs.rm(pagesDir, { recursive: true, force: true })
    result.actions.push('Deleted pages/ directory (App Router project)')
  } catch {
    // Directory doesn't exist — good
  }

  // 2. Verify app/page.tsx has dynamic imports
  const pageTsxPath = path.join(projectDir, 'app', 'page.tsx')
  try {
    const content = await fs.readFile(pageTsxPath, 'utf-8')
    const missingPatterns = EXPECTED_PAGE_TSX_PATTERNS.filter(p => !content.includes(p))
    if (missingPatterns.length > 0) {
      result.errors.push(`app/page.tsx is missing dynamic import patterns: ${missingPatterns.join(', ')}`)
      result.success = false
    } else {
      result.actions.push('app/page.tsx verified — has correct dynamic imports')
    }
  } catch {
    result.errors.push('app/page.tsx not found')
    result.success = false
  }

  // 3. Verify pre-built components have expected patterns (not overwritten by MiMo)
  const COMPONENT_PATTERNS: Record<string, string[]> = {
    'components/Hero.tsx': ["'use client'", 'useSiteData'],
    'components/Services.tsx': ["'use client'", 'useSiteData'],
    'components/Gallery.tsx': ["'use client'", 'useSiteData'],
    'components/Testimonials.tsx': ["'use client'", 'useSiteData'],
    'components/Contact.tsx': ["'use client'", 'useSiteData'],
    'components/About.tsx': ["'use client'", 'useSiteData'],
    'components/Faq.tsx': ["'use client'", 'useSiteData'],
    'components/Footer.tsx': ['useSiteData'],
    'components/Header.tsx': ["'use client'", 'useSiteData'],
    'components/WhatsAppWidget.tsx': ["'use client'"],
    'components/AnimateOnScroll.tsx': ["'use client'", 'IntersectionObserver'],
    'lib/use-site-data.ts': ["'use client'", 'useSiteData', '/site-config.json'],
    'app/api/save-config/route.ts': ['siteConfig', 'imageMap', 'site-config.json'],
    'app/api/upload/route.ts': ['formData', 'uploads'],
    'app/dashboard/page.tsx': ['useRouter', 'dashboard/index.html'],
  }

  for (const [file, patterns] of Object.entries(COMPONENT_PATTERNS)) {
    const filePath = path.join(projectDir, file)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const missing = patterns.filter(p => !content.includes(p))
      if (missing.length > 0) {
        result.errors.push(`${file} is missing patterns: ${missing.join(', ')} — may have been overwritten`)
        result.success = false
      } else {
        result.actions.push(`Verified: ${file} has expected patterns`)
      }
    } catch {
      // File doesn't exist — that's OK for some files
    }
  }

  // 4. Verify sub-pages exist
  const requiredPages = ['app/about/page.tsx', 'app/services/page.tsx', 'app/contact/page.tsx', 'app/portfolio/page.tsx']
  for (const page of requiredPages) {
    const pagePath = path.join(projectDir, page)
    try {
      await fs.access(pagePath)
      result.actions.push(`Verified: ${page} exists`)
    } catch {
      result.errors.push(`Missing required page: ${page}`)
      result.success = false
    }
  }

  // 5. Verify data files exist in public/
  const requiredPublicFiles = ['public/site-config.json', 'public/image-map.json']
  for (const file of requiredPublicFiles) {
    const filePath = path.join(projectDir, file)
    try {
      await fs.access(filePath)
      result.actions.push(`Verified: ${file} exists`)
    } catch {
      result.errors.push(`Missing required file: ${file}`)
      result.success = false
    }
  }

  // 6. Verify site-config.json has required fields
  try {
    const configPath = path.join(projectDir, 'public', 'site-config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    const requiredFields = ['hero', 'about', 'pageContent', 'services', 'testimonials', 'faq', 'businessHours']
    for (const field of requiredFields) {
      if (!config[field]) {
        result.errors.push(`site-config.json missing required field: ${field}`)
        result.success = false
      }
    }

    // Check hero fields
    if (config.hero) {
      const heroFields = ['headline', 'subheadline', 'badge', 'ctaText']
      for (const field of heroFields) {
        if (!config.hero[field]) {
          result.errors.push(`site-config.json hero missing field: ${field}`)
          result.success = false
        }
      }
    }

    // Check pageContent fields
    if (config.pageContent) {
      const pcFields = ['servicesTitle', 'galleryTitle', 'testimonialsTitle', 'faqTitle', 'contactTitle']
      for (const field of pcFields) {
        if (!config.pageContent[field]) {
          result.errors.push(`site-config.json pageContent missing field: ${field}`)
          result.success = false
        }
      }
    }

    if (result.errors.length === 0) {
      result.actions.push('site-config.json verified — all required fields present')
    }
  } catch {
    result.errors.push('Could not read or parse public/site-config.json')
    result.success = false
  }

  // 7. Verify image-map.json has thumbnail fields
  try {
    const mapPath = path.join(projectDir, 'public', 'image-map.json')
    const imageMap = JSON.parse(await fs.readFile(mapPath, 'utf-8'))

    if (imageMap.categories) {
      const categories = Object.keys(imageMap.categories)
      const missingThumbnails = categories.filter(cat => !imageMap.categories[cat].thumbnail)
      if (missingThumbnails.length > 0) {
        result.errors.push(`image-map.json categories missing thumbnail: ${missingThumbnails.join(', ')}`)
        result.success = false
      } else {
        result.actions.push('image-map.json verified — all categories have thumbnails')
      }
    }
  } catch {
    result.errors.push('Could not read or parse public/image-map.json')
    result.success = false
  }

  // 8. Verify and fix font resilience (MiMo may have overwritten boilerplate files)
  await fixFontResilience(projectDir, result)

  // 9. Download stock images from Unsplash URLs in site-config.json
  await downloadStockImages(projectDir, result)

  // 10. Accessibility checks
  const accessibilityResult = await runAccessibilityChecks(projectDir)
  result.actions.push(...accessibilityResult.actions)
  result.errors.push(...accessibilityResult.errors)

  // 11. QA scoring
  const qaScore = await calculateQAScore(projectDir, result)
  result.qaScore = qaScore

  return result
}

// ============================================
// Stock Image Downloader — Downloads Unsplash images locally
// ============================================

async function downloadStockImages(projectDir: string, result: CleanupResult): Promise<void> {
  try {
    const configPath = path.join(projectDir, 'public', 'site-config.json')
    const configRaw = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configRaw)

    const clientFolder = path.basename(projectDir)
    const uploadsDir = path.join(projectDir, 'public', 'uploads', clientFolder)
    await fs.mkdir(uploadsDir, { recursive: true })

    let downloadCount = 0
    const urlToLocal: Record<string, string> = {}

    // Collect all Unsplash URLs from site-config
    const unsplashUrls: string[] = []

    // Hero image
    if (config.hero?.heroImageUrl?.includes('unsplash.com')) {
      unsplashUrls.push(config.hero.heroImageUrl)
    }

    // About image
    if (config.about?.imageUrl?.includes('unsplash.com')) {
      unsplashUrls.push(config.about.imageUrl)
    }

    // Service images
    if (config.services) {
      for (const service of config.services) {
        if (service.imageUrl?.includes('unsplash.com')) {
          unsplashUrls.push(service.imageUrl)
        }
      }
    }

    // Download each image
    for (let i = 0; i < unsplashUrls.length; i++) {
      const url = unsplashUrls[i]
      const filename = `stock-${String(i + 1).padStart(3, '0')}.webp`
      const savePath = path.join(uploadsDir, 'stock', filename)

      try {
        await fs.mkdir(path.join(uploadsDir, 'stock'), { recursive: true })
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        })

        if (response.ok) {
          const buffer = await response.arrayBuffer()
          await fs.writeFile(savePath, Buffer.from(buffer))
          const localPath = `/uploads/${clientFolder}/stock/${filename}`
          urlToLocal[url] = localPath
          downloadCount++
        }
      } catch {
        // Download failed — keep original URL
      }
    }

    // Replace URLs in site-config.json with local paths
    if (downloadCount > 0) {
      let updatedConfig = configRaw
      for (const [originalUrl, localPath] of Object.entries(urlToLocal)) {
        updatedConfig = updatedConfig.replace(new RegExp(escapeRegex(originalUrl), 'g'), localPath)
      }
      await fs.writeFile(configPath, updatedConfig, 'utf-8')
      result.actions.push(`Downloaded ${downloadCount} stock images locally`)
    }
  } catch {
    result.actions.push('Could not download stock images — site-config.json may not exist')
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================
// Font Resilience — Prevent useContext errors from font loading failures
// ============================================

async function fixFontResilience(projectDir: string, result: CleanupResult): Promise<void> {
  // 1. Verify next.config.js has optimizeFonts: false
  try {
    const configPath = path.join(projectDir, 'next.config.js')
    let configContent = await fs.readFile(configPath, 'utf-8')

    if (!configContent.includes('optimizeFonts')) {
      // Add optimizeFonts: false before the closing brace
      configContent = configContent.replace(
        /(\s*}\s*)$/,
        `,\n  // Prevent font loading failures from corrupting React context during static generation\n  optimizeFonts: false\n$1`
      )
      await fs.writeFile(configPath, configContent, 'utf-8')
      result.actions.push('Fixed next.config.js — added optimizeFonts: false')
    }
  } catch {
    result.actions.push('Could not verify next.config.js font settings')
  }

  // 2. Verify layout.tsx has font fallbacks
  try {
    const layoutPath = path.join(projectDir, 'app', 'layout.tsx')
    let layoutContent = await fs.readFile(layoutPath, 'utf-8')

    // Check if layout uses next/font/google without fallback
    if (layoutContent.includes('next/font/google') && !layoutContent.includes('fallback:')) {
      // Add fallback fonts to all font configurations
      layoutContent = layoutContent.replace(
        /(\w+)\(\{\s*\n\s*subsets:\s*\['latin'\],\s*\n\s*variable:\s*'[^']*',\s*\n\s*display:\s*'swap',\s*\n\s*\}\)/g,
        `$1({\n  subsets: ['latin'],\n  variable: '$1' === 'headingFont' ? '--font-heading' : '--font-body',\n  display: 'swap',\n  fallback: ['$1' === 'headingFont' ? 'Georgia' : 'system-ui', '$1' === 'headingFont' ? 'Cambria' : '-apple-system', '$1' === 'headingFont' ? 'serif' : 'sans-serif'],\n  adjustFontFallback: false,\n  preload: false,\n})`
      )
      // Simpler approach: just add fallback to each font config
      layoutContent = layoutContent.replace(
        /display: 'swap',\n\s*\}\)/g,
        `display: 'swap',\n    fallback: ['Georgia', 'Cambria', 'serif'],\n    adjustFontFallback: false,\n    preload: false,\n  })`
      )
      await fs.writeFile(layoutPath, layoutContent, 'utf-8')
      result.actions.push('Fixed layout.tsx — added font fallbacks')
    }
  } catch {
    result.actions.push('Could not verify layout.tsx font settings')
  }

  // 3. Verify globals.css has @import for Google Fonts
  try {
    const cssPath = path.join(projectDir, 'app', 'globals.css')
    let cssContent = await fs.readFile(cssPath, 'utf-8')

    if (!cssContent.includes('@import url(') && cssContent.includes('@tailwind')) {
      // Extract font names from layout.tsx
      const layoutPath = path.join(projectDir, 'app', 'layout.tsx')
      const layoutContent = await fs.readFile(layoutPath, 'utf-8')
      
      // Find font imports
      const fontImports = layoutContent.match(/import\s*{\s*(\w+)\s*}\s*from\s*'next\/font\/google'/g) || []
      const fontNames = fontImports.map(imp => {
        const match = imp.match(/import\s*{\s*(\w+)\s*}/)
        return match ? match[1].replace(/_/g, ' ') : null
      }).filter(Boolean)

      if (fontNames.length >= 2) {
        const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontNames[0]!.replace(/\s+/g, '+')}:wght@400;500;600;700&family=${fontNames[1]!.replace(/\s+/g, '+')}:wght@400;500;600&display=swap');\n\n`
        cssContent = fontImport + cssContent
        await fs.writeFile(cssPath, cssContent, 'utf-8')
        result.actions.push(`Fixed globals.css — added @import for ${fontNames.join(' + ')}`)
      }
    }
  } catch {
    result.actions.push('Could not verify globals.css font imports')
  }
}

// ============================================
// Accessibility Checks
// ============================================

async function runAccessibilityChecks(projectDir: string): Promise<{ actions: string[]; errors: string[] }> {
  const actions: string[] = []
  const errors: string[] = []

  // Check all component files for accessibility patterns
  const componentDir = path.join(projectDir, 'components')
  try {
    const files = await fs.readdir(componentDir)
    const tsxFiles = files.filter(f => f.endsWith('.tsx'))

    for (const file of tsxFiles) {
      const content = await fs.readFile(path.join(componentDir, file), 'utf-8')

      // Check for images without alt text
      const imgTags = content.match(/<img[^>]*>/g) || []
      for (const img of imgTags) {
        if (!img.includes('alt=')) {
          errors.push(`${file}: <img> tag missing alt attribute`)
        } else if (img.includes('alt=""')) {
          // Empty alt is OK for decorative images, but warn
          actions.push(`${file}: has <img alt=""> — verify this is decorative`)
        }
      }

      // Check for buttons without accessible labels
      const buttonTags = content.match(/<button[^>]*>/g) || []
      for (const button of buttonTags) {
        if (!button.includes('aria-label') && !button.includes('title')) {
          // Check if button has text content (simplified check)
          if (button.includes('className') && !button.includes('>')) {
            actions.push(`${file}: <button> may need aria-label for screen readers`)
          }
        }
      }

      // Check for links without accessible text
      const linkTags = content.match(/<a[^>]*>/g) || []
      for (const link of linkTags) {
        if (link.includes('href') && !link.includes('aria-label') && !link.includes('title')) {
          // Links with icons only need aria-label
          if (link.includes('svg') || link.includes('icon')) {
            actions.push(`${file}: link with icon may need aria-label`)
          }
        }
      }

      // Check for form inputs without labels
      const inputTags = content.match(/<input[^>]*>/g) || []
      for (const input of inputTags) {
        if (!input.includes('aria-label') && !input.includes('id=')) {
          errors.push(`${file}: <input> missing aria-label or id for label association`)
        }
      }

      // Check for proper heading hierarchy (simplified)
      const headings = content.match(/<h[1-6][^>]*>/g) || []
      if (headings.length > 0) {
        actions.push(`${file}: has ${headings.length} heading(s) — verify hierarchy`)
      }
    }
  } catch {
    // Component directory may not exist
  }

  // Check site-config.json for alt text in images
  try {
    const configPath = path.join(projectDir, 'public', 'site-config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    // Check hero image has alt text
    if (config.hero?.heroImageUrl && !config.hero?.heroImageAlt) {
      actions.push('site-config.json: hero image missing heroImageAlt field')
    }

    // Check about image has alt text
    if (config.about?.imageUrl && !config.about?.imageAlt) {
      actions.push('site-config.json: about image missing imageAlt field')
    }
  } catch {
    // Config may not exist yet
  }

  return { actions, errors }
}

// ============================================
// QA Scoring
// ============================================

async function calculateQAScore(projectDir: string, cleanupResult: CleanupResult): Promise<QAScore> {
  const issues: string[] = []
  const recommendations: string[] = []

  // Accessibility score (0-10)
  let accessibilityScore = 10
  const accessibilityErrors = cleanupResult.errors.filter(e =>
    e.includes('alt') || e.includes('aria') || e.includes('label') || e.includes('input')
  )
  accessibilityScore -= accessibilityErrors.length * 2
  accessibilityScore = Math.max(0, accessibilityScore)

  // Content quality score (0-10)
  let contentScore = 10
  try {
    const configPath = path.join(projectDir, 'public', 'site-config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    // Check for empty required fields
    const requiredFields = ['hero', 'about', 'pageContent', 'services', 'testimonials', 'faq']
    for (const field of requiredFields) {
      if (!config[field]) {
        contentScore -= 1
        issues.push(`Missing ${field} in site-config.json`)
      }
    }

    // Check for placeholder text
    const configStr = JSON.stringify(config)
    const placeholders = ['Lorem ipsum', 'TODO', 'PLACEHOLDER', 'TBD', 'Coming soon']
    for (const placeholder of placeholders) {
      if (configStr.includes(placeholder)) {
        contentScore -= 2
        issues.push(`Found placeholder text: "${placeholder}"`)
      }
    }

    // Check services have descriptions
    if (config.services) {
      const emptyServices = config.services.filter((s: any) => !s.description || s.description.length < 10)
      if (emptyServices.length > 0) {
        contentScore -= 1
        issues.push(`${emptyServices.length} service(s) have empty or short descriptions`)
      }
    }

    // Check testimonials have content
    if (config.testimonials) {
      const emptyTestimonials = config.testimonials.filter((t: any) => !t.text || t.text.length < 10)
      if (emptyTestimonials.length > 0) {
        contentScore -= 1
        issues.push(`${emptyTestimonials.length} testimonial(s) have empty or short text`)
      }
    }
  } catch {
    contentScore = 0
    issues.push('Could not read site-config.json for content scoring')
  }
  contentScore = Math.max(0, contentScore)

  // Image quality score (0-10)
  let imageScore = 10
  try {
    const mapPath = path.join(projectDir, 'public', 'image-map.json')
    const imageMap = JSON.parse(await fs.readFile(mapPath, 'utf-8'))

    if (!imageMap.categories || Object.keys(imageMap.categories).length === 0) {
      imageScore -= 5
      issues.push('No image categories found')
      recommendations.push('Add images to improve visual appeal')
    }

    // Check for missing thumbnails
    if (imageMap.categories) {
      const missingThumbs = Object.keys(imageMap.categories).filter(
        cat => !imageMap.categories[cat].thumbnail
      )
      if (missingThumbs.length > 0) {
        imageScore -= 2
        issues.push(`${missingThumbs.length} category(ies) missing thumbnails`)
      }
    }

    // Check total image count
    const totalImages = imageMap.totalImages || 0
    if (totalImages < 5) {
      imageScore -= 3
      issues.push('Very few images — site may look empty')
      recommendations.push('Add more images to galleries and sections')
    } else if (totalImages < 15) {
      imageScore -= 1
      recommendations.push('Consider adding more images for visual richness')
    }
  } catch {
    imageScore = 5
    issues.push('Could not read image-map.json for image scoring')
  }
  imageScore = Math.max(0, imageScore)

  // Structure score (0-10)
  let structureScore = 10
  const structureErrors = cleanupResult.errors.filter(e =>
    e.includes('missing') || e.includes('not found') || e.includes('Missing')
  )
  structureScore -= structureErrors.length * 2
  structureScore = Math.max(0, structureScore)

  // Calculate overall score (weighted average)
  const overall = Math.round(
    (accessibilityScore * 0.25) +
    (contentScore * 0.30) +
    (imageScore * 0.25) +
    (structureScore * 0.20)
  )

  // Add recommendations based on scores
  if (accessibilityScore < 7) {
    recommendations.push('Fix accessibility issues: add alt text, ARIA labels, and proper form labels')
  }
  if (contentScore < 7) {
    recommendations.push('Improve content quality: fill in all required fields, remove placeholders')
  }
  if (imageScore < 7) {
    recommendations.push('Add more images and ensure all categories have thumbnails')
  }
  if (structureScore < 7) {
    recommendations.push('Fix structural issues: ensure all required files and pages exist')
  }

  return {
    overall,
    accessibility: accessibilityScore,
    contentQuality: contentScore,
    imageQuality: imageScore,
    structureScore,
    issues,
    recommendations,
  }
}
