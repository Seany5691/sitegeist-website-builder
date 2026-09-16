import { promises as fs } from 'fs'
import path from 'path'
import { MasterSiteConfig, GalleryItem, ServiceItem, PageMediaGroup, ImageManifestEntry } from '@/types/site-config'

const WEBSITES_FOLDER = 'C:\\Users\\seany\\OneDrive\\Documents\\Coding Projects\\sitegeist_ecosystem\\Websites'

interface DownloadResult {
  success: boolean
  localPath?: string
  error?: string
}

// ============================================
// File System Utilities
// ============================================
function sanitizeFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    let filename = path.basename(urlObj.pathname)
    filename = filename.split('?')[0]
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    if (!filename.includes('.')) filename += '.jpg'
    if (filename.length > 100) {
      const ext = path.extname(filename)
      filename = path.basename(filename, ext).slice(0, 100 - ext.length) + ext
    }
    return filename
  } catch {
    return 'image_' + Date.now() + '.jpg'
  }
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true })
}

function normalizeImageUrl(rawUrl: string, baseUrl: string): string {
  if (rawUrl.startsWith('https://wp-content/')) {
    return rawUrl.replace('https://wp-content/', `${baseUrl.replace(/\/$/, '')}/wp-content/`)
  }
  if (rawUrl.startsWith('http://wp-content/')) {
    return rawUrl.replace('http://wp-content/', `${baseUrl.replace(/\/$/, '')}/wp-content/`)
  }
  if (rawUrl.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${rawUrl}`
  }
  return rawUrl
}

// ============================================
// Image Download with Retries
// ============================================
async function downloadImageAsset(
  imageUrl: string,
  localPath: string,
  baseUrl: string,
  retries = 2
): Promise<DownloadResult> {
  const sanitizedUrl = normalizeImageUrl(imageUrl, baseUrl)

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      if (!sanitizedUrl || !sanitizedUrl.startsWith('http')) {
        return { success: false, error: 'Invalid URL' }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(sanitizedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': baseUrl,
        },
      })
      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const buffer = await response.arrayBuffer()
      await fs.writeFile(localPath, Buffer.from(buffer))

      return { success: true, localPath }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`[Media Downloader] Attempt ${attempt} failed for ${sanitizedUrl}: ${errMsg}`)
      if (attempt > retries) return { success: false, error: errMsg }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return { success: false, error: 'Failed after retries' }
}

// ============================================
// Placeholder SVG
// ============================================
async function ensurePlaceholderExists(): Promise<string> {
  const placeholderDir = path.join(WEBSITES_FOLDER, '_assets')
  await ensureDir(placeholderDir)
  const placeholderPath = path.join(placeholderDir, 'placeholder.svg')
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#18181b"/>
  <circle cx="400" cy="300" r="80" fill="#27272a"/>
  <path d="M370 320 L400 280 L430 320" stroke="#a1a1aa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="390" cy="295" r="4" fill="#a1a1aa"/>
  <text x="50%" y="430" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#71717a" font-weight="500">Image Preview Unavailable</text>
</svg>`
  try {
    await fs.writeFile(placeholderPath, svgContent, 'utf-8')
  } catch {}
  return path.relative(WEBSITES_FOLDER, placeholderPath).replace(/\\/g, '/')
}

// ============================================
// Single Image Download & Localize
// ============================================
async function localizeAndDownloadSingleImage(
  imageUrl: string,
  targetDir: string,
  relativeUrlPath: string,
  downloadCache: Map<string, string>,
  baseUrl: string,
  fallbackImage: string,
  manifest: ImageManifestEntry[],
  pageSource?: string,
  type: ImageManifestEntry['type'] = 'other'
): Promise<string> {
  if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('/'))) {
    return imageUrl
  }

  const normalizedUrl = normalizeImageUrl(imageUrl, baseUrl)

  if (downloadCache.has(normalizedUrl)) {
    return downloadCache.get(normalizedUrl)!
  }

  await ensureDir(targetDir)
  const filename = sanitizeFilename(normalizedUrl)
  const localPath = path.join(targetDir, filename)

  const result = await downloadImageAsset(normalizedUrl, localPath, baseUrl)

  const localPublicUrl = `${relativeUrlPath}/${filename}`

  if (result.success) {
    downloadCache.set(normalizedUrl, localPublicUrl)
    manifest.push({
      remoteUrl: normalizedUrl,
      localPath: localPublicUrl,
      pageSource,
      type,
    })
    return localPublicUrl
  }

  console.warn(`[Media Downloader] Falling back to placeholder for: ${normalizedUrl}`)
  downloadCache.set(normalizedUrl, fallbackImage)
  return fallbackImage
}

// ============================================
// Download Logo
// ============================================
async function downloadLogo(
  logoUrl: string,
  clientPath: string,
  downloadCache: Map<string, string>,
  baseUrl: string,
  fallbackImage: string,
  manifest: ImageManifestEntry[]
): Promise<string | null> {
  if (!logoUrl || (!logoUrl.startsWith('http') && !logoUrl.startsWith('/'))) return null

  const normalizedUrl = normalizeImageUrl(logoUrl, baseUrl)
  if (downloadCache.has(normalizedUrl)) return downloadCache.get(normalizedUrl)!

  const brandDir = path.join(clientPath, 'public', 'assets', 'brand')
  await ensureDir(brandDir)

  let ext = '.png'
  try {
    ext = path.extname(new URL(normalizedUrl).pathname).slice(0, 5) || '.png'
  } catch {}

  const filename = 'logo' + ext
  const localPath = path.join(brandDir, filename)

  const result = await downloadImageAsset(normalizedUrl, localPath, baseUrl)

  if (result.success) {
    const localPublicUrl = `/assets/brand/${filename}`
    downloadCache.set(normalizedUrl, localPublicUrl)
    manifest.push({
      remoteUrl: normalizedUrl,
      localPath: localPublicUrl,
      type: 'logo',
    })
    return localPublicUrl
  }

  console.warn(`[Media Downloader] Failed to download logo: ${normalizedUrl}`)
  downloadCache.set(normalizedUrl, fallbackImage)
  return fallbackImage
}

// ============================================
// Download Hero Image
// ============================================
async function downloadHeroImage(
  heroImageUrl: string,
  clientPath: string,
  downloadCache: Map<string, string>,
  baseUrl: string,
  fallbackImage: string,
  manifest: ImageManifestEntry[]
): Promise<string | null> {
  const heroDir = path.join(clientPath, 'public', 'assets', 'hero')
  const relativePrefix = '/assets/hero'
  return localizeAndDownloadSingleImage(heroImageUrl, heroDir, relativePrefix, downloadCache, baseUrl, fallbackImage, manifest, '/', 'hero')
}

// ============================================
// Download Gallery Images
// ============================================
async function downloadGalleryImages(
  gallery: GalleryItem[],
  clientPath: string,
  downloadCache: Map<string, string>,
  baseUrl: string,
  fallbackImage: string,
  manifest: ImageManifestEntry[]
): Promise<GalleryItem[]> {
  if (!gallery || gallery.length === 0) return gallery

  const updatedGallery: GalleryItem[] = []

  for (const item of gallery) {
    if (!item.imageUrl || (!item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('/'))) {
      updatedGallery.push(item)
      continue
    }

    const category = (item.category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const categoryDir = path.join(clientPath, 'public', 'assets', 'portfolio', category)
    const relativePrefix = `/assets/portfolio/${category}`

    const localUrl = await localizeAndDownloadSingleImage(
      item.imageUrl, categoryDir, relativePrefix, downloadCache, baseUrl, fallbackImage, manifest, `/portfolio/${category}`, 'gallery'
    )

    updatedGallery.push({ ...item, imageUrl: localUrl })
  }

  return updatedGallery
}

// ============================================
// Download Service Images
// ============================================
async function downloadServiceImages(
  services: ServiceItem[],
  clientPath: string,
  downloadCache: Map<string, string>,
  baseUrl: string,
  fallbackImage: string,
  manifest: ImageManifestEntry[]
): Promise<ServiceItem[]> {
  if (!services || services.length === 0) return services

  const servicesDir = path.join(clientPath, 'public', 'assets', 'services')
  const relativePrefix = '/assets/services'

  const updatedServices = await Promise.all(services.map(async (service) => {
    if (!service.realImageUrl || (!service.realImageUrl.startsWith('http') && !service.realImageUrl.startsWith('/'))) {
      return service
    }

    const localUrl = await localizeAndDownloadSingleImage(
      service.realImageUrl, servicesDir, relativePrefix, downloadCache, baseUrl, fallbackImage, manifest, '/services', 'service'
    )

    return { ...service, realImageUrl: localUrl }
  }))

  return updatedServices
}

// ============================================
// Main: Download All Media Assets
// ============================================
export async function downloadAndLocalizeMedia(config: MasterSiteConfig): Promise<MasterSiteConfig> {
  const clientFolder = config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const clientPath = path.join(WEBSITES_FOLDER, clientFolder)

  console.log(`[Media Downloader] Starting PRODUCTION media localization for: ${clientFolder}`)

  // Create client folder structure
  await ensureDir(path.join(clientPath, 'public', 'assets', 'brand'))
  await ensureDir(path.join(clientPath, 'public', 'assets', 'hero'))
  await ensureDir(path.join(clientPath, 'public', 'assets', 'portfolio'))
  await ensureDir(path.join(clientPath, 'public', 'assets', 'services'))

  const updatedConfig = { ...config }
  const downloadCache = new Map<string, string>()
  const manifest: ImageManifestEntry[] = []

  // Resolve base URL
  let baseUrl = 'https://example.com'
  if (config.legacyUrls?.discovered?.[0]) {
    try {
      baseUrl = new URL(config.legacyUrls.discovered[0]).origin
    } catch {}
  }

  const fallbackImage = await ensurePlaceholderExists()

  // 1. Download logo
  if (config.brandAssets?.logoUrl) {
    const localLogoPath = await downloadLogo(config.brandAssets.logoUrl, clientPath, downloadCache, baseUrl, fallbackImage, manifest)
    if (localLogoPath) {
      updatedConfig.brandAssets = { ...updatedConfig.brandAssets, logoUrl: localLogoPath }
      updatedConfig.hero = updatedConfig.hero || {}
      updatedConfig.hero.logoUrl = localLogoPath
      console.log(`[Media Downloader] Logo: ${localLogoPath}`)
    }
  }

  // 2. Download hero image
  if (updatedConfig.hero?.heroImageUrl) {
    const localHeroPath = await downloadHeroImage(updatedConfig.hero.heroImageUrl, clientPath, downloadCache, baseUrl, fallbackImage, manifest)
    if (localHeroPath && localHeroPath !== updatedConfig.hero.heroImageUrl) {
      updatedConfig.hero.heroImageUrl = localHeroPath
      console.log(`[Media Downloader] Hero: ${localHeroPath}`)
    }
  }

  // 3. Download gallery images
  if (updatedConfig.gallery && updatedConfig.gallery.length > 0) {
    updatedConfig.gallery = await downloadGalleryImages(updatedConfig.gallery, clientPath, downloadCache, baseUrl, fallbackImage, manifest)
    console.log(`[Media Downloader] Gallery: ${updatedConfig.gallery.length} images`)
  }

  // 4. Download service images
  if (updatedConfig.services && updatedConfig.services.length > 0) {
    updatedConfig.services = await downloadServiceImages(updatedConfig.services, clientPath, downloadCache, baseUrl, fallbackImage, manifest)
    console.log(`[Media Downloader] Services: ${updatedConfig.services.length} images`)
  }

  // 5. Download page media map images
  if (updatedConfig.pageMediaMap && updatedConfig.pageMediaMap.length > 0) {
    const uncategorizedDir = path.join(clientPath, 'public', 'assets', 'portfolio', 'uncategorized')
    const relativePrefix = '/assets/portfolio/uncategorized'

    for (const group of updatedConfig.pageMediaMap) {
      const updatedImages = await Promise.all(group.images.map(async (imageUrl) => {
        return localizeAndDownloadSingleImage(
          imageUrl, uncategorizedDir, relativePrefix, downloadCache, baseUrl, fallbackImage, manifest, group.pageUrl, 'other'
        )
      }))
      group.images = updatedImages
    }
  }

  // 6. Write image-manifest.json
  const manifestPath = path.join(clientPath, 'public', 'image-manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify({ mappings: manifest }, null, 2), 'utf-8')
  console.log(`[Media Downloader] Manifest: ${manifest.length} entries`)

  // 7. Update config with build mode and manifest
  updatedConfig.buildMode = 'PRODUCTION'
  updatedConfig.imageManifest = manifest

  console.log(`[Media Downloader] PRODUCTION complete for: ${clientFolder}`)

  return updatedConfig
}
