/**
 * Image Processor
 * Downloads, cleans, deduplicates, converts to WebP, and resizes scraped images.
 * Replaces the old trial/production split — always downloads images.
 * Uses sharp for real image analysis (dimensions, brightness, sharpness).
 */

import { promises as fs } from 'fs'
import path from 'path'

const WEBSITES_FOLDER = process.env.WEBSITES_FOLDER || process.env.WEBSITES_PATH || 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

// Lazy-load sharp to avoid startup cost
let sharpInstance: any = null
async function getSharp() {
  if (!sharpInstance) {
    try {
      sharpInstance = (await import('sharp')).default
    } catch {
      console.warn('[Image Processor] sharp not available — falling back to URL-based analysis')
    }
  }
  return sharpInstance
}

// ============================================
// Junk Image Filters
// ============================================

const JUNK_PATTERNS = [
  // Emojis and SVG icons
  /emoji/i, /svg\+xml/i, /1f6/i, /1f4/i, /1f9/i,
  // Loaders and spinners
  /loader/i, /spinner/i, /loading/i, /ajax-loader/i,
  // Tracking pixels
  /pixel/i, /tracking/i, /spacer/i, /1x1\./i, /blank\.gif/i,
  // Social media icons
  /facebook.*icon/i, /twitter.*icon/i, /instagram.*icon/i,
  /linkedin.*icon/i, /youtube.*icon/i, /pinterest.*icon/i,
  /social.*icon/i, /share.*icon/i,
  // UI elements
  /arrow.*\.png/i, /button.*\.png/i, /icon.*\.png/i,
  /favicon/i, /apple-touch-icon/i,
  // WooCommerce / WordPress internals
  /woocommerce/i, /wp-content\/plugins/i,
  // Google analytics / tracking
  /google.*analytics/i, /gtm\.js/i, /fbq/i,
  // Avatars and gravatars
  /avatar/i, /gravatar/i,
  // Color swatches and placeholders
  /placeholder/i, /swatch/i, /color-swatch/i,
  /blank-grid/i, /revslider/i,
  // Broken or relative paths
  /^https?:\/\/wp-content\//, // Missing domain
  /192\.168\./, // Internal IPs
  /localhost/i,
]

const JUNK_EXTENSIONS = ['.svg', '.gif', '.ico', '.webmanifest']

// ============================================
// Image Cleaning
// ============================================

export function isJunkImage(url: string): boolean {
  if (!url || typeof url !== 'string') return true

  // Must be a valid HTTP(S) URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) return true

  // Check junk patterns
  if (JUNK_PATTERNS.some(pattern => pattern.test(url))) return true

  // Check junk extensions
  const lowerUrl = url.toLowerCase()
  if (JUNK_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) return true

  // Check for broken URLs (wp-content without domain)
  if (url.startsWith('https://wp-content/') || url.startsWith('http://wp-content/')) return true

  // Check for data URIs
  if (url.startsWith('data:')) return true

  // Check for very small images (likely icons)
  if (lowerUrl.includes('16x16') || lowerUrl.includes('32x32') || lowerUrl.includes('48x48')) return true

  return false
}

export function getImageSizeFromUrl(url: string): number {
  // Extract size from URL patterns like -610x448, _800x534, etc.
  const sizeMatch = url.match(/[-_](\d{2,4})x(\d{2,4})/)
  if (sizeMatch) {
    return parseInt(sizeMatch[1]) * parseInt(sizeMatch[2])
  }
  // No size in URL — assume it's the original (largest)
  return 999999
}

export function deduplicateImages(urls: string[]): string[] {
  // Group by base URL (without size suffix)
  const groups = new Map<string, string[]>()

  for (const url of urls) {
    // Remove size suffix to find base URL
    const baseUrl = url.replace(/[-_]\d{2,4}x\d{2,4}(?=\.\w{3,4}$)/, '')
    if (!groups.has(baseUrl)) groups.set(baseUrl, [])
    groups.get(baseUrl)!.push(url)
  }

  // For each group, pick the largest version
  const deduped: string[] = []
  for (const [, urls] of Array.from(groups)) {
    if (urls.length === 1) {
      deduped.push(urls[0])
    } else {
      // Pick the one with the largest dimensions in the URL
      urls.sort((a, b) => getImageSizeFromUrl(b) - getImageSizeFromUrl(a))
      deduped.push(urls[0])
    }
  }

  return deduped
}

// ============================================
// Image Download
// ============================================

async function downloadImage(url: string, savePath: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })
    clearTimeout(timeoutId)

    if (!response.ok) return false

    const buffer = Buffer.from(await response.arrayBuffer())

    // Actually convert to WebP using sharp for consistent format and smaller files
    const sharp = await getSharp()
    if (sharp) {
      try {
        const webpBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer()
        await fs.writeFile(savePath, webpBuffer)
        return true
      } catch {
        // sharp conversion failed (e.g., SVG, corrupt image) — save as-is
      }
    }

    // Fallback: save raw bytes with correct extension
    await fs.writeFile(savePath, buffer)
    return true
  } catch {
    return false
  }
}

// ============================================
// Real Image Analysis (using sharp)
// ============================================

export interface ImageAnalysis {
  width: number
  height: number
  sizeKb: number
  brightness: number    // 0-1, average luminance
  sharpness: number     // 0-10, Laplacian variance estimate
  focalCenter: number   // 0-1, how bright the centre is vs edges
}

export async function analyzeImage(filePath: string): Promise<ImageAnalysis | null> {
  const sharp = await getSharp()
  if (!sharp) return null

  try {
    const metadata = await sharp(filePath).metadata()
    const width = metadata.width || 0
    const height = metadata.height || 0

    // Get file size
    const stat = await fs.stat(filePath)
    const sizeKb = Math.round(stat.size / 1024)

    // Resize to small sample for analysis
    const sample = await sharp(filePath)
      .resize(64, 64, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer()

    // Calculate average brightness (0-1)
    let totalBrightness = 0
    for (let i = 0; i < sample.length; i++) {
      totalBrightness += sample[i] / 255
    }
    const brightness = totalBrightness / sample.length

    // Calculate centre vs edge brightness (focal point heuristic)
    // Centre = middle 32x32, Edge = outer ring
    let centreSum = 0
    let centreCount = 0
    let edgeSum = 0
    let edgeCount = 0
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = y * 64 + x
        const val = sample[idx] / 255
        if (x >= 16 && x < 48 && y >= 16 && y < 48) {
          centreSum += val
          centreCount++
        } else {
          edgeSum += val
          edgeCount++
        }
      }
    }
    const centreBrightness = centreCount > 0 ? centreSum / centreCount : 0.5
    const edgeBrightness = edgeCount > 0 ? edgeSum / edgeCount : 0.5
    const focalCenter = centreBrightness / (centreBrightness + edgeBrightness + 0.001)

    // Estimate sharpness using Laplacian variance on a small sample
    // Higher variance = sharper image
    const sharpnessRaw = await sharp(filePath)
      .resize(32, 32, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer()

    let laplacianVariance = 0
    for (let y = 1; y < 31; y++) {
      for (let x = 1; x < 31; x++) {
        const idx = y * 32 + x
        const laplacian = -4 * sharpnessRaw[idx]
          + sharpnessRaw[idx - 1]
          + sharpnessRaw[idx + 1]
          + sharpnessRaw[idx - 32]
          + sharpnessRaw[idx + 32]
        laplacianVariance += laplacian * laplacian
      }
    }
    laplacianVariance /= (30 * 30)
    // Normalize to 0-10 scale (empirical range)
    const sharpness = Math.min(10, Math.sqrt(laplacianVariance) / 20)

    return { width, height, sizeKb, brightness, sharpness, focalCenter }
  } catch {
    return null
  }
}

// ============================================
// Category Detection
// ============================================

function detectCategory(imageUrl: string, sourceUrl: string, archetype?: string): string {
  const url = (imageUrl + ' ' + sourceUrl).toLowerCase()
  const arch = (archetype || '').toLowerCase()

  // Photography-specific categories
  if (arch.includes('photo') || arch.includes('studio') || arch.includes('creative')) {
    if (url.includes('wedding')) return 'Weddings'
    if (url.includes('newborn') || url.includes('baby')) return 'Newborn'
    if (url.includes('maternity') || url.includes('pregnan')) return 'Maternity'
    if (url.includes('matric') || url.includes('prom')) return 'Matric'
    if (url.includes('family') || url.includes('famil')) return 'Families'
    if (url.includes('portrait')) return 'Portraits'
    if (url.includes('couple') || url.includes('engagement')) return 'Couples'
    if (url.includes('cake') && url.includes('smash')) return 'Cake Smash'
    if (url.includes('studio')) return 'Studio'
  }

  // Hospitality/Restaurant categories
  if (arch.includes('restaurant') || arch.includes('bakery') || arch.includes('hospitality') || arch.includes('hotel') || arch.includes('catering')) {
    if (url.includes('menu') || url.includes('food') || url.includes('dish') || url.includes('plate')) return 'Menu'
    if (url.includes('interior') || url.includes('decor') || url.includes('ambiance') || url.includes('dining')) return 'Interior'
    if (url.includes('kitchen') || url.includes('chef') || url.includes('cook')) return 'Kitchen'
    if (url.includes('event') || url.includes('party') || url.includes('wedding')) return 'Events'
    if (url.includes('room') || url.includes('suite') || url.includes('bedroom')) return 'Rooms'
  }

  // Trades/Construction categories
  if (arch.includes('plumb') || arch.includes('electric') || arch.includes('construction') || arch.includes('roof') || arch.includes('hvac') || arch.includes('trade')) {
    if (url.includes('before') || url.includes('after') || url.includes('transform')) return 'Before & After'
    if (url.includes('project') || url.includes('work') || url.includes('job')) return 'Projects'
    if (url.includes('team') || url.includes('crew') || url.includes('staff')) return 'Team'
    if (url.includes('equipment') || url.includes('tool') || url.includes('vehicle') || url.includes('truck')) return 'Equipment'
  }

  // Medical categories
  if (arch.includes('medical') || arch.includes('dental') || arch.includes('health') || arch.includes('clinic')) {
    if (url.includes('facility') || url.includes('clinic') || url.includes('office') || url.includes('reception')) return 'Facility'
    if (url.includes('team') || url.includes('doctor') || url.includes('staff') || url.includes('nurse')) return 'Team'
    if (url.includes('equipment') || url.includes('tech') || url.includes('machine')) return 'Equipment'
    if (url.includes('procedure') || url.includes('treatment') || url.includes('service')) return 'Services'
  }

  // Nonprofit/Charity categories
  if (arch.includes('nonprofit') || arch.includes('charity') || arch.includes('mission') || arch.includes('church') || arch.includes('ngo')) {
    if (url.includes('community') || url.includes('outreach') || url.includes('volunteer')) return 'Community'
    if (url.includes('event') || url.includes('fundrais') || url.includes('gala')) return 'Events'
    if (url.includes('team') || url.includes('staff') || url.includes('missionary') || url.includes('member')) return 'Team'
    if (url.includes('facilit') || url.includes('building') || url.includes('office') || url.includes('kitchen')) return 'Facilities'
    if (url.includes('food') || url.includes('meal') || url.includes('feeding') || url.includes('donation')) return 'Food & Aid'
  }

  // Retail/E-commerce categories
  if (arch.includes('retail') || arch.includes('shop') || arch.includes('store') || arch.includes('boutique')) {
    if (url.includes('product') || url.includes('item') || url.includes('merchandise')) return 'Products'
    if (url.includes('store') || url.includes('shop') || url.includes('interior') || url.includes('display')) return 'Store'
    if (url.includes('team') || url.includes('staff')) return 'Team'
    if (url.includes('event') || url.includes('launch') || url.includes('sale')) return 'Events'
  }

  // Generic fallback — works for any industry
  if (url.includes('event') || url.includes('corporate') || url.includes('conference')) return 'Events'
  if (url.includes('team') || url.includes('staff') || url.includes('people') || url.includes('portrait')) return 'Team'
  if (url.includes('food') || url.includes('menu') || url.includes('dish')) return 'Menu'
  if (url.includes('interior') || url.includes('decor') || url.includes('space')) return 'Interior'

  return 'Portfolio'
}

// ============================================
// Image Quality Scoring
// ============================================

export interface ImageScore {
  url: string
  resolutionScore: number    // 0-10: based on detected dimensions
  aspectRatioScore: number   // 0-10: suitability for slot type
  categoryRelevance: number  // 0-10: how well it fits its category
  sharpnessScore: number     // 0-10: image sharpness (from real analysis)
  brightnessScore: number    // 0-10: brightness suitability
  overallScore: number       // Weighted average
}

export type SlotType = 'hero' | 'gallery' | 'thumbnail' | 'portrait' | 'wide'

function getResolutionScore(width: number, height: number): number {
  if (width >= 1800) return 10
  if (width >= 1200) return 8
  if (width >= 800) return 6
  if (width >= 600) return 4
  return 2
}

function getResolutionScoreFromUrl(url: string): number {
  const sizeMatch = url.match(/[-_](\d{2,4})x(\d{2,4})/)
  if (sizeMatch) {
    return getResolutionScore(parseInt(sizeMatch[1]), parseInt(sizeMatch[2]))
  }
  return 8 // No size in URL — assume original
}

function getAspectRatioScore(width: number, height: number, slotType: SlotType): number {
  const ratio = width / height

  switch (slotType) {
    case 'hero':
      // Hero wants wide (16:9 to 21:9)
      if (ratio >= 1.7 && ratio <= 2.5) return 10
      if (ratio >= 1.5 && ratio <= 3.0) return 8
      return 4
    case 'gallery':
      // Gallery is flexible, slight preference for landscape
      if (ratio >= 0.8 && ratio <= 1.5) return 10
      if (ratio >= 0.5 && ratio <= 2.0) return 8
      return 5
    case 'thumbnail':
      // Thumbnails want square or slightly landscape
      if (ratio >= 0.9 && ratio <= 1.3) return 10
      if (ratio >= 0.7 && ratio <= 1.5) return 8
      return 5
    case 'portrait':
      // Portrait wants tall (3:4 to 2:3)
      if (ratio >= 0.6 && ratio <= 0.8) return 10
      if (ratio >= 0.5 && ratio <= 1.0) return 8
      return 4
    case 'wide':
      // Wide wants panoramic
      if (ratio >= 1.5 && ratio <= 2.5) return 10
      if (ratio >= 1.2 && ratio <= 3.0) return 8
      return 5
    default:
      return 7
  }
}

function getCategoryRelevance(url: string, category: string): number {
  const lowerUrl = url.toLowerCase()
  const lowerCat = category.toLowerCase()

  // Check if URL contains category-related keywords
  const categoryKeywords: Record<string, string[]> = {
    'weddings': ['wedding', 'bride', 'groom', 'ceremony', 'reception'],
    'newborn': ['newborn', 'baby', 'infant', 'nursery'],
    'maternity': ['maternity', 'pregnan', 'bump'],
    'families': ['family', 'famil', 'parent', 'child'],
    'portraits': ['portrait', 'headshot', 'profile'],
    'couples': ['couple', 'engagement', 'love'],
    'matric': ['matric', 'prom', 'graduation'],
    'cake smash': ['cake', 'smash', 'birthday'],
    'studio': ['studio', 'indoor'],
  }

  const keywords = categoryKeywords[lowerCat] || []
  if (keywords.some(kw => lowerUrl.includes(kw))) return 10

  // Check if it's from a category-specific URL path
  if (lowerUrl.includes(lowerCat.replace(/\s+/g, '-'))) return 8
  if (lowerUrl.includes(lowerCat.replace(/\s+/g, '_'))) return 8

  return 6 // Default — neutral
}

export function scoreImage(url: string, category: string, slotType: SlotType = 'gallery', analysis?: ImageAnalysis | null): ImageScore {
  // Use real analysis if available, otherwise fall back to URL heuristics
  const width = analysis?.width || 0
  const height = analysis?.height || 0

  const resolutionScore = analysis
    ? getResolutionScore(width, height)
    : getResolutionScoreFromUrl(url)

  const aspectRatioScore = analysis && width > 0 && height > 0
    ? getAspectRatioScore(width, height, slotType)
    : getAspectRatioScoreFromUrl(url, slotType)

  const categoryRelevance = getCategoryRelevance(url, category)

  // Sharpness and brightness from real analysis
  const sharpnessScore = analysis ? Math.min(10, analysis.sharpness) : 7 // Default if no analysis
  const brightnessScore = analysis ? getBrightnessScore(analysis.brightness, slotType) : 7

  // Weighted average: resolution 25%, aspect 20%, relevance 20%, sharpness 20%, brightness 15%
  const overallScore = (resolutionScore * 0.25) + (aspectRatioScore * 0.20) + (categoryRelevance * 0.20) + (sharpnessScore * 0.20) + (brightnessScore * 0.15)

  return {
    url,
    resolutionScore,
    aspectRatioScore,
    categoryRelevance,
    sharpnessScore,
    brightnessScore,
    overallScore: Math.round(overallScore * 10) / 10,
  }
}

function getAspectRatioScoreFromUrl(url: string, slotType: SlotType): number {
  const sizeMatch = url.match(/[-_](\d{2,4})x(\d{2,4})/)
  if (!sizeMatch) return 7
  return getAspectRatioScore(parseInt(sizeMatch[1]), parseInt(sizeMatch[2]), slotType)
}

function getBrightnessScore(brightness: number, slotType: SlotType): number {
  // Hero images need to be bright enough for text overlay
  if (slotType === 'hero') {
    if (brightness >= 0.3 && brightness <= 0.7) return 10
    if (brightness >= 0.2 && brightness <= 0.8) return 8
    return 5
  }
  // Gallery is flexible
  if (brightness >= 0.2 && brightness <= 0.8) return 10
  return 7
}

export function rankImages(urls: string[], category: string, slotType: SlotType = 'gallery', analyses?: Map<string, ImageAnalysis>): ImageScore[] {
  return urls
    .map(url => scoreImage(url, category, slotType, analyses?.get(url)))
    .sort((a, b) => b.overallScore - a.overallScore)
}

// ============================================
// Smart Gallery Layout Selection
// ============================================

export type GalleryLayout = 'category-cards' | 'masonry' | 'filterable' | 'cinematic' | 'carousel'

export function selectGalleryLayout(
  totalImages: number,
  categoryCount: number,
  archetype: string
): GalleryLayout {
  // Photography and architecture always use category-first
  if (archetype === 'retail-commerce' && totalImages > 50) {
    return 'category-cards'
  }

  // Few images — cinematic or carousel
  if (totalImages < 10) {
    return 'cinematic'
  }

  // Medium count with categories — filterable
  if (totalImages >= 10 && totalImages <= 50 && categoryCount > 1) {
    return 'filterable'
  }

  // Medium count without categories — masonry
  if (totalImages >= 10 && totalImages <= 50) {
    return 'masonry'
  }

  // Large count — always category-first
  if (totalImages > 50) {
    return 'category-cards'
  }

  return 'masonry'
}

// ============================================
// Intelligent Image Assignment
// ============================================

export interface ImageAssignments {
  hero: string | null       // Best landscape image for hero
  about: string | null      // Best portrait/square for about section
  thumbnails: Record<string, string>  // Best image per category
}

export function assignImages(
  categories: Record<string, { thumbnail: string; images: Array<{ src: string; alt: string; originalUrl: string }> }>,
  scores: Map<string, ImageScore>
): ImageAssignments {
  let bestHero: string | null = null
  let bestHeroScore = -1
  let bestAbout: string | null = null
  let bestAboutScore = -1
  const thumbnails: Record<string, string> = {}

  for (const [catName, catData] of Object.entries(categories)) {
    let bestThumb: string | null = null
    let bestThumbScore = -1

    for (const img of catData.images) {
      const imgUrl = img.src
      const score = scores.get(imgUrl)
      if (!score) continue

      // Hero: prefer landscape images with high overall score
      if (score.aspectRatioScore >= 8 && score.overallScore > bestHeroScore) {
        bestHero = imgUrl
        bestHeroScore = score.overallScore
      }

      // About: prefer portrait or square images
      if (score.aspectRatioScore >= 7 && score.overallScore > bestAboutScore) {
        bestAbout = imgUrl
        bestAboutScore = score.overallScore
      }

      // Thumbnail: best image in this category
      if (score.overallScore > bestThumbScore) {
        bestThumb = imgUrl
        bestThumbScore = score.overallScore
      }
    }

    if (bestThumb) {
      thumbnails[catName] = bestThumb
    }
  }

  return { hero: bestHero, about: bestAbout, thumbnails }
}

// ============================================
// Presentation Style Selection
// ============================================

export type PresentationStyle = 'cinematic' | 'editorial' | 'portfolio' | 'storytelling'

export function selectPresentationStyle(
  totalImages: number,
  averageScore: number,
  categoryCount: number
): PresentationStyle {
  // Few stunning images — cinematic
  if (totalImages <= 15 && averageScore >= 7) return 'cinematic'

  // Many images across categories — portfolio
  if (totalImages > 50 && categoryCount > 1) return 'portfolio'

  // Medium count, good quality — editorial
  if (totalImages >= 15 && totalImages <= 50 && averageScore >= 6) return 'editorial'

  // Sequential/story-based — storytelling
  if (totalImages >= 10 && totalImages <= 20) return 'storytelling'

  // Default
  return 'editorial'
}

// ============================================
// Main Processing Function
// ============================================

export interface ProcessedImage {
  url: string // Local path like /uploads/tammy-holliday/weddings/img-001.webp
  originalUrl: string
  category: string
  alt: string
  score?: number
  analysis?: ImageAnalysis
}

export interface ImageMapResult {
  businessName: string
  scrapedAt: string
  totalImages: number
  logo: string | null
  hero: ProcessedImage[]
  categories: Record<string, { thumbnail: string; images: Array<{ src: string; alt: string; originalUrl: string }> }>
  recommendedLayout: GalleryLayout
  presentationStyle: PresentationStyle
  assignments: ImageAssignments
  qualitySummary: {
    averageScore: number
    highQualityCount: number
    lowQualityCount: number
  }
}

export async function processAndDownloadImages(
  businessName: string,
  imageUrls: string[],
  sourceUrls: Record<string, string[]> = {},
  logoUrl?: string,
  heroImageUrl?: string,
  imageAltMap: Record<string, string> = {},
  imageDimensionsMap: Record<string, { width: number; height: number }> = {},
  archetype?: string
): Promise<ImageMapResult> {
  const clientFolder = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const uploadsDir = path.join(WEBSITES_FOLDER, clientFolder, 'public', 'uploads', clientFolder)

  console.log(`[Image Processor] Processing ${imageUrls.length} raw images for ${businessName}`)

  // Step 1: Filter junk
  const cleanUrls = imageUrls.filter(url => !isJunkImage(url))
  console.log(`[Image Processor] After filtering: ${cleanUrls.length} valid images`)

  // Step 2: Deduplicate
  const dedupedUrls = deduplicateImages(cleanUrls)
  console.log(`[Image Processor] After dedup: ${dedupedUrls.length} unique images`)

  // Step 3: Categorize
  const categorized = new Map<string, string[]>()
  for (const url of dedupedUrls) {
    const sources = sourceUrls[url] || []
    const category = detectCategory(url, sources.join(' '), archetype)
    if (!categorized.has(category)) categorized.set(category, [])
    categorized.get(category)!.push(url)
  }

  // Step 4: Download and convert
  const categories: Record<string, { thumbnail: string; images: Array<{ src: string; alt: string; originalUrl: string }> }> = {}
  let totalDownloaded = 0
  let totalFailed = 0

  for (const [category, urls] of Array.from(categorized)) {
    const categoryDir = path.join(uploadsDir, category.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    await fs.mkdir(categoryDir, { recursive: true })

    const downloadedImages: Array<{ src: string; alt: string; originalUrl: string }> = []
    let thumbnailPath = ''

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const filename = `img-${String(i + 1).padStart(3, '0')}.webp`
      const savePath = path.join(categoryDir, filename)

      const success = await downloadImage(url, savePath)
      if (success) {
        const localPath = `/uploads/${clientFolder}/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${filename}`
        const alt = imageAltMap[url] || `${category} photo ${i + 1}`
        downloadedImages.push({ src: localPath, alt, originalUrl: url })
        if (!thumbnailPath) thumbnailPath = localPath
        totalDownloaded++
      } else {
        totalFailed++
      }
    }

    if (downloadedImages.length > 0) {
      categories[category] = {
        thumbnail: thumbnailPath,
        images: downloadedImages,
      }
    }
  }

  // Step 5: Download logo
  let logoPath: string | null = null
  if (logoUrl && !isJunkImage(logoUrl)) {
    const logoDir = path.join(uploadsDir, 'logo')
    await fs.mkdir(logoDir, { recursive: true })
    const logoSavePath = path.join(logoDir, 'logo.webp')
    const success = await downloadImage(logoUrl, logoSavePath)
    if (success) {
      logoPath = `/uploads/${clientFolder}/logo/logo.webp`
    }
  }

  // Step 6: Download hero image
  const heroImages: ProcessedImage[] = []
  if (heroImageUrl && !isJunkImage(heroImageUrl)) {
    const heroDir = path.join(uploadsDir, 'hero')
    await fs.mkdir(heroDir, { recursive: true })
    const heroSavePath = path.join(heroDir, 'hero.webp')
    const success = await downloadImage(heroImageUrl, heroSavePath)
    if (success) {
      heroImages.push({
        url: `/uploads/${clientFolder}/hero/hero.webp`,
        originalUrl: heroImageUrl,
        category: 'hero',
        alt: `${businessName} hero image`,
      })
    }
  }

  // Step 7: Analyze downloaded images with sharp
  const analyses = new Map<string, ImageAnalysis>()
  const scoresMap = new Map<string, ImageScore>()

  for (const [category, catData] of Object.entries(categories)) {
    for (const img of catData.images) {
      const imgUrl = img.src
      // Convert local path to filesystem path
      const fsPath = path.join(WEBSITES_FOLDER, clientFolder, 'public', imgUrl)
      const analysis = await analyzeImage(fsPath)

      // If sharp analysis failed, use scraped dimensions as fallback
      if (!analysis && imageDimensionsMap[img.originalUrl]) {
        const dims = imageDimensionsMap[img.originalUrl]
        const fallbackAnalysis: ImageAnalysis = {
          width: dims.width,
          height: dims.height,
          sizeKb: 0,
          brightness: 0.5, // Unknown
          sharpness: 7,    // Assume decent
          focalCenter: 0.5,
        }
        analyses.set(imgUrl, fallbackAnalysis)
      } else if (analysis) {
        analyses.set(imgUrl, analysis)
      }

      // Score with or without analysis
      const score = scoreImage(imgUrl, category, 'gallery', analysis || analyses.get(imgUrl))
      scoresMap.set(imgUrl, score)
    }
  }

  console.log(`[Image Processor] Analyzed ${analyses.size}/${totalDownloaded} images (sharp: ${analyses.size - Object.keys(imageDimensionsMap).length}, scraped dims: ${Object.keys(imageDimensionsMap).length})`)

  // Step 8: Rank images and select gallery layout
  const allScores = Array.from(scoresMap.values())

  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum, s) => sum + s.overallScore, 0) / allScores.length * 10) / 10
    : 0
  const highQualityCount = allScores.filter(s => s.overallScore >= 7).length
  const lowQualityCount = allScores.filter(s => s.overallScore < 5).length

  const recommendedLayout = selectGalleryLayout(
    totalDownloaded,
    Object.keys(categories).length,
    'retail-commerce' // Default archetype — will be overridden by caller
  )

  // Step 9: Intelligent image assignment
  const assignments = assignImages(categories, scoresMap)

  // Step 10: Select presentation style
  const presentationStyle = selectPresentationStyle(totalDownloaded, averageScore, Object.keys(categories).length)

  // Step 11: Update thumbnails to use best images per category
  for (const [catName, bestThumb] of Object.entries(assignments.thumbnails)) {
    if (categories[catName]) {
      categories[catName].thumbnail = bestThumb
    }
  }

  // Sort images within each category by score (best first)
  for (const [catName, catData] of Object.entries(categories)) {
    catData.images.sort((a, b) => {
      const scoreA = scoresMap.get(a.src)?.overallScore || 0
      const scoreB = scoresMap.get(b.src)?.overallScore || 0
      return scoreB - scoreA
    })
  }

  console.log(`[Image Processor] Complete: ${totalDownloaded} downloaded, ${totalFailed} failed, ${Object.keys(categories).length} categories`)
  console.log(`[Image Processor] Quality: avg=${averageScore}, high=${highQualityCount}, low=${lowQualityCount}, layout=${recommendedLayout}, presentation=${presentationStyle}`)
  console.log(`[Image Processor] Assignments: hero=${assignments.hero ? 'yes' : 'no'}, about=${assignments.about ? 'yes' : 'no'}, thumbnails=${Object.keys(assignments.thumbnails).length}`)

  return {
    businessName,
    scrapedAt: new Date().toISOString(),
    totalImages: totalDownloaded,
    logo: logoPath,
    hero: heroImages,
    categories,
    recommendedLayout,
    presentationStyle,
    assignments,
    qualitySummary: {
      averageScore,
      highQualityCount,
      lowQualityCount,
    },
  }
}
