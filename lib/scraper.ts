import { promises as fs } from 'fs'
import path from 'path'
import { chromium, Browser, Page } from 'playwright'
import { ScrapedData, ContactInfo, ScrapedImageContext, ScrapedImageMeta } from '@/types/site-config'

const MAX_PAGES = 200
const SCRAPE_DELAY_MS = 800
const BATCH_DELAY_MS = 1500
const CONCURRENCY = 3
const MAX_RETRIES = 2
const REQUEST_TIMEOUT = 20000

const EXCLUDE_PATTERNS = [
  /\.pdf$/i, /\.zip$/i, /\.mp4$/i, /\.mp3$/i,
  /\.doc$/i, /\.docx$/i, /\.xml$/i, /\.css$/i,
  /\.js$/i, /\.json$/i, /\?/, /\/feed$/i,
  /\/xmlrpc\.php/, /\/wp-json\//, /\/page\/\d+/,
  /\/wp-admin/, /\/wp-login/, /\/cart/, /\/checkout/,
  /\/my-account/, /\/tag\//, /\/category\//, /\/author\//,
]

const LOGO_PATTERNS = [
  /logo/i, /brand/i, /header-logo/i, /nav-logo/i,
  /site-logo/i, /emblem/i, /badge/i,
]

// UI/Tracking images to EXCLUDE from gallery
const UI_IMAGE_PATTERNS = [
  /default-skin/i, /pixel/i, /tracking/i, /spacer/i,
  /blank\.gif/i, /1x1\./i, /transparent\.gif/i,
  /spinner/i, /loading/i, /arrow.*\.png$/i,
  /icon.*\.png$/i, /button.*\.png$/i,
  /facebook.*icon/i, /twitter.*icon/i, /instagram.*icon/i,
  /linkedin.*icon/i, /youtube.*icon/i, /pinterest.*icon/i,
  /social.*icon/i, /share.*icon/i,
  /emoji.*svg$/i, /1f642/i, /1f600/i, /1f44d/i,
  /avatar/i, /gravatar/i,
  /woocommerce/i, /wp-content\/plugins/i,
  /google.*analytics/i, /gtm\.js/i, /fbq/i,
  /favicon/i, /apple-touch-icon/i,
]

const COMMON_PATHS = [
  // Standard pages
  '/about', '/about-us', '/services', '/service',
  '/contact', '/contact-us', '/products',
  '/team', '/testimonials', '/faq',
  
  // Pricing pages (all variations)
  '/pricing', '/prices', '/rates', '/packages', '/packages-and-pricing',
  '/pricing-packages', '/photo-packages', '/photography-packages',
  '/session-rates', '/session-pricing', '/investment', '/invest',
  
  // Gallery/Portfolio patterns (industry-agnostic)
  '/portfolio', '/gallery', '/our-work', '/images', '/photos',
  '/work', '/projects', '/showcase', '/collection', '/lookbook',
  '/my-portfolio', '/my-work', '/my-gallery',
  
  // Industry-specific gallery patterns
  '/menu', '/treatments', '/offerings',
  '/case-studies', '/completed-projects',
  
  // Blog/News
  '/blog', '/news', '/stories', '/articles', '/posts', '/updates',
]

const SCRAPE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

const PLAYWRIGHT_BROWSER_CONFIG = {
  headless: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 30000,
  scrollDelay: 500,
  maxScrolls: 10,
}

// ============================================
// Local Playwright Scraper
// ============================================
export interface LocalScrapeResult {
  url: string
  html: string
  markdown: string
  title: string
  metaDescription: string
  jsonLd: any[]
  images: string[]
  imagesWithContext?: ScrapedImageContext[]
  mapEmbedUrl?: string | null
}

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({ headless: PLAYWRIGHT_BROWSER_CONFIG.headless })
  }
  return browserInstance
}

async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close()
    browserInstance = null
  }
}

// ============================================
// Rate Limiter with Exponential Backoff
// ============================================
class RateLimiter {
  private delay: number
  private maxDelay: number

  constructor(initialDelay: number, maxDelay: number) {
    this.delay = initialDelay
    this.maxDelay = maxDelay
  }

  async wait(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay))
  }

  increase(): void {
    this.delay = Math.min(this.delay * 1.5, this.maxDelay)
  }

  reset(): void {
    this.delay = SCRAPE_DELAY_MS
  }
}

// ============================================
// HTML Cleaning & Markdown Conversion
// ============================================
function cleanHtmlForMarkdown(html: string): string {
  const noisePatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    /<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi,
    /<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi,
    /<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi,
    /<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi,
    /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi,
    /<!--[\s\S]*?-->/g,
  ]

  let cleaned = html
  for (const pattern of noisePatterns) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned
}

function htmlToMarkdown(html: string): string {
  let md = html

  // Tables — convert to markdown table syntax BEFORE stripping tags
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_match, tableContent) => {
    const rows: string[][] = []
    const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let rowMatch
    while ((rowMatch = rowPattern.exec(tableContent)) !== null) {
      const cells: string[] = []
      const cellPattern = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
      let cellMatch
      while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim())
      }
      if (cells.length > 0) rows.push(cells)
    }
    if (rows.length === 0) return ''
    const maxCols = Math.max(...rows.map(r => r.length))
    const header = rows[0]
    const separator = header.map(() => '---')
    const body = rows.slice(1)
    let table = '\n| ' + header.join(' | ') + ' |\n'
    table += '| ' + separator.join(' | ') + ' |\n'
    for (const row of body) {
      while (row.length < maxCols) row.push('')
      table += '| ' + row.join(' | ') + ' |\n'
    }
    return '\n' + table + '\n'
  })

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
    const lines = content.replace(/<[^>]+>/g, '').trim().split('\n')
    return '\n' + lines.map(l => `> ${l.trim()}`).join('\n') + '\n'
  })

  // Details/Summary — convert to heading + content
  md = md.replace(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi, (_match, summary, content) => {
    return `\n### ${summary.replace(/<[^>]+>/g, '').trim()}\n\n${content.replace(/<[^>]+>/g, '').trim()}\n`
  })

  // Figure/Figcaption — preserve caption as alt text
  md = md.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (_match, content) => {
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    const captionMatch = content.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
    if (imgMatch) {
      const caption = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      return `\n![${caption}](${imgMatch[1]})\n`
    }
    return content.replace(/<[^>]+>/g, '').trim()
  })

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n')
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n')

  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Links
  md = md.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

  // Bold and italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')

  // Ordered lists — preserve numbering
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, listContent) => {
    const items: string[] = []
    const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let itemMatch
    while ((itemMatch = itemPattern.exec(listContent)) !== null) {
      items.push(itemMatch[1].replace(/<[^>]+>/g, '').trim())
    }
    return '\n' + items.map((item, i) => `${i + 1}. ${item}`).join('\n') + '\n'
  })

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, listContent) => {
    const items: string[] = []
    const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let itemMatch
    while ((itemMatch = itemPattern.exec(listContent)) !== null) {
      items.push(itemMatch[1].replace(/<[^>]+>/g, '').trim())
    }
    return '\n' + items.map(item => `- ${item}`).join('\n') + '\n'
  })

  // Images — preserve alt text
  md = md.replace(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)')
  md = md.replace(/<img[^>]+alt=["']([^"']*)["'][^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi, '![$1]($2)')
  md = md.replace(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi, '![]($1)')

  // Divs and spans
  md = md.replace(/<div[^>]*>/gi, '\n')
  md = md.replace(/<\/div>/gi, '\n')
  md = md.replace(/<span[^>]*>/gi, '')
  md = md.replace(/<\/span>/gi, '')

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '')

  // Entity decoding — comprehensive
  md = md.replace(/&nbsp;/g, ' ')
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#39;/g, "'")
  md = md.replace(/&hellip;/g, '...')
  md = md.replace(/&mdash;/g, '—')
  md = md.replace(/&ndash;/g, '–')
  md = md.replace(/&lsquo;/g, '\u2018')
  md = md.replace(/&rsquo;/g, '\u2019')
  md = md.replace(/&ldquo;/g, '\u201C')
  md = md.replace(/&rdquo;/g, '\u201D')
  md = md.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
  md = md.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n')

  return md.trim()
}

// ============================================
// Image Validation & Filtering
// ============================================
function isUiOrTrackingImage(url: string): boolean {
  return UI_IMAGE_PATTERNS.some(pattern => pattern.test(url))
}

function isValidImageUrl(url: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']
  const lowerUrl = url.toLowerCase()
  return validExtensions.some(ext => lowerUrl.includes(ext))
}

function isPotentialLogo(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return LOGO_PATTERNS.some(pattern => pattern.test(lowerUrl))
}

// Enhanced logo extraction from HTML structure
export function extractLogoFromHtml(html: string, baseUrl: string): string | null {
  const baseUrlObj = new URL(baseUrl)
  
  // Pattern 1: Images in header/navbar that link to homepage
  const headerPattern = /<header[^>]*>([\s\S]*?)<\/header>/gi
  const navPattern = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  
  let headerHtml = ''
  const headerMatch = html.match(headerPattern)
  if (headerMatch) headerHtml = headerMatch[0]
  
  const navMatch = html.match(navPattern)
  if (navMatch) headerHtml += navMatch[0]
  
  // Look for images in header that link to homepage
  const logoLinkPattern = /<a[^>]+href=["'](?:\/|https?:\/\/[^"']*[^"']*\.co\.za\/?|https?:\/\/[^"']*[^"']*\.com\/?)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = logoLinkPattern.exec(headerHtml)) !== null) {
    const imgUrl = match[1]
    if (imgUrl && !imgUrl.includes('favicon') && !imgUrl.includes('icon')) {
      return resolveUrl(imgUrl, baseUrl)
    }
  }
  
  // Pattern 2: Look for small images in first 3000 chars (likely header area)
  const headerArea = html.substring(0, 3000)
  const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let imgMatch
  
  while ((imgMatch = imgPattern.exec(headerArea)) !== null) {
    const imgUrl = imgMatch[1]
    // Skip known non-logo images
    if (imgUrl.includes('favicon') || imgUrl.includes('icon') || 
        imgUrl.includes('banner') || imgUrl.includes('background') ||
        imgUrl.includes('slider') || imgUrl.includes('hero') ||
        imgUrl.includes('gallery_gen/16d2e18bf296ce1b7bfcf7620ee650ab')) {
      continue
    }
    
    // Check if image is likely a logo (small size, in header area)
    const widthMatch = imgMatch[0].match(/width=["'](\d+)["']/i)
    const heightMatch = imgMatch[0].match(/height=["'](\d+)["']/i)
    
    if (widthMatch && heightMatch) {
      const width = parseInt(widthMatch[1])
      const height = parseInt(heightMatch[1])
      
      // Logos are typically small (50-300px)
      if (width <= 300 && height <= 300 && width >= 30 && height >= 30) {
        return resolveUrl(imgUrl, baseUrl)
      }
    }
  }
  
  // Pattern 3: Favicon as last resort (NOT og:image - it's often a hero image)
  const faviconPattern = /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i
  const faviconMatch = html.match(faviconPattern)
  if (faviconMatch) {
    return resolveUrl(faviconMatch[1], baseUrl)
  }
  
  return null
}

// Enhanced logo detection with favicon comparison
export function detectLogoWithFavicon(html: string, allImages: string[], baseUrl: string): string | null {
  // Step 1: Try to find logo from HTML structure
  const htmlLogo = extractLogoFromHtml(html, baseUrl)
  
  // Step 2: Find favicon URL
  const faviconPattern = /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i
  const faviconMatch = html.match(faviconPattern)
  const faviconUrl = faviconMatch ? resolveUrl(faviconMatch[1], baseUrl) : null
  
  // Step 3: If we found a logo from HTML, check if it matches favicon
  if (htmlLogo && faviconUrl) {
    // Extract filenames for comparison
    const logoFilename = htmlLogo.split('/').pop()?.split('?')[0] || ''
    const faviconFilename = faviconUrl.split('/').pop()?.split('?')[0] || ''
    
    // If logo and favicon are the same file, we're confident
    if (logoFilename === faviconFilename) {
      return htmlLogo
    }
  }
  
  // Step 4: If we found a logo from HTML, use it
  if (htmlLogo) {
    return htmlLogo
  }
  
  // Step 5: Use favicon as last resort
  if (faviconUrl) {
    return faviconUrl
  }
  
  return null
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) {
    const base = new URL(baseUrl)
    return base.origin + url
  }
  return baseUrl + '/' + url
}

async function validateImageUrl(url: string, baseUrl: string): Promise<boolean> {
  // Quick validation - check if URL looks valid
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    if (parsed.hostname === 'localhost') return false

    // Skip known problematic domains
    const skipDomains = ['gravatar.com', 'w.org', 's.w.org', 'fonts.googleapis.com']
    if (skipDomains.some(d => parsed.hostname.includes(d))) return false

    return true
  } catch {
    return false
  }
}

// ============================================
// Contact & Analytics Extraction
// ============================================
const PHONE_PATTERNS = [
  /(?:\+27|0)\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{4}/g,
  /(?:\+27|0)[0-9]{9}/g,
  /0[0-9]{9}/g,
  /\+27[0-9]{9}/g,
]

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const GA4_PATTERN = /G-([A-Z0-9]{10,})/gi
const GTM_PATTERN = /GTM-[A-Z0-9]+/gi
const FB_PIXEL_PATTERN = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/gi

function extractPhoneNumbers(text: string): string[] {
  const phones = new Set<string>()
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) {
      for (const phone of matches) {
        let normalized = phone.replace(/\s/g, '')
        if (normalized.startsWith('0')) normalized = '+27' + normalized.slice(1)
        phones.add(normalized)
      }
    }
  }
  // Extract from tel: links
  const telPattern = /href=["']tel:([^"']+)["']/gi
  let telMatch
  while ((telMatch = telPattern.exec(text)) !== null) {
    const phone = telMatch[1].replace(/[^0-9+]/g, '')
    if (phone.length >= 7 && !phones.has(phone)) phones.add(phone)
  }

  return Array.from(phones)
}

function extractEmails(text: string): string[] {
  const emails = new Set<string>()
  
  // Extract from regular text
  const matches = text.match(EMAIL_PATTERN)
  if (matches) {
    matches.forEach(email => emails.add(email))
  }
  
  // Extract from JavaScript code patterns
  // Pattern: var em = 'email@example.com'
  const jsEmailPatterns = [
    /var\s+\w+\s*=\s*['"]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['"]/gi,
    /email\s*[:=]\s*['"]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['"]/gi,
    /mailTo:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ]
  
  for (const pattern of jsEmailPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      emails.add(match[1])
    }
  }
  
  // Extract from mailto: links
  const mailtoPattern = /href=["']mailto:([^"'?]+)["']/gi
  let mailtoMatch
  while ((mailtoMatch = mailtoPattern.exec(text)) !== null) {
    const email = mailtoMatch[1].trim()
    if (email.includes('@') && !emails.has(email)) emails.add(email)
  }

  return Array.from(emails)
}

// Extract ALL links from HTML body (not just navigation)
function extractAllLinksFromHtml(html: string, baseUrl: string): string[] {
  const links = new Set<string>()
  const baseUrlObj = new URL(baseUrl)
  
  // Pattern: <a href="...">
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = linkPattern.exec(html)) !== null) {
    let url = match[1].trim()
    
    // Skip non-http links
    if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      continue
    }
    
    // Resolve relative URLs
    if (url.startsWith('/')) {
      url = `${baseUrlObj.origin}${url}`
    } else if (!url.startsWith('http')) {
      url = `${baseUrlObj.origin}/${url}`
    }
    
    // Only include same-domain links
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname === baseUrlObj.hostname) {
        // Clean URL (remove hash and query params for deduplication)
        const cleanUrl = url.split('#')[0].split('?')[0]
        if (cleanUrl && cleanUrl !== baseUrl) {
          links.add(cleanUrl)
        }
      }
    } catch {}
  }
  
  return Array.from(links)
}

function extractAnalytics(markdown: string) {
  const analytics: Record<string, string> = {}

  const ga4Matches = markdown.match(GA4_PATTERN)
  if (ga4Matches) analytics.ga4MeasurementId = ga4Matches[0]

  const gtmMatches = markdown.match(GTM_PATTERN)
  if (gtmMatches) analytics.googleTagManagerId = gtmMatches[0]

  const fbMatches = markdown.match(FB_PIXEL_PATTERN)
  if (fbMatches) analytics.facebookPixelId = fbMatches[1]

  return analytics
}

// ============================================
// CSS Color Mining
// ============================================
const GENERIC_COLORS = new Set([
  '#ffffff', '#fff', '#000', '#000000',
  '#fafafa', '#f5f5f5', '#eeeeee', '#dddddd',
  '#1a1a1a', '#333333', '#666666', '#999999',
  'transparent', 'inherit', 'none',
])

function extractWebsiteCssColors(markdown: string) {
  const colorCounts = new Map<string, number>()
  const hexPattern = /#([0-9a-fA-F]{3,6})\b/g
  let match

  while ((match = hexPattern.exec(markdown)) !== null) {
    let hex = match[0].toLowerCase()
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    }
    if (GENERIC_COLORS.has(hex) || hex === '#ffffff' || hex === '#000000') continue
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
  }

  const sortedColors = Array.from(colorCounts.entries())
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)

  const dominantCssPrimary = sortedColors[0]?.hex || '#0ea5e9'
  const dominantCssSecondary = sortedColors[1]?.hex || '#6366f1'

  const bgColors = sortedColors.filter(c => {
    const hex = c.hex.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 200
  })
  const dominantCssBg = bgColors[0]?.hex || '#fafafa'

  return {
    dominantCssPrimary,
    dominantCssSecondary,
    dominantCssBg,
    allColors: sortedColors.slice(0, 10),
  }
}

// ============================================
// Playwright Page Scraper
// ============================================
async function scrapeSinglePageLocally(targetUrl: string): Promise<LocalScrapeResult> {
  console.log(`[Local Scraper] Scraping ${targetUrl}...`)

  const browser = await getBrowser()
  const context = await browser.newContext({ userAgent: PLAYWRIGHT_BROWSER_CONFIG.userAgent })

  try {
    const page = await context.newPage()

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PLAYWRIGHT_BROWSER_CONFIG.timeout,
    })

    // Auto-scroll for lazy loading
    for (let i = 0; i < PLAYWRIGHT_BROWSER_CONFIG.maxScrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(PLAYWRIGHT_BROWSER_CONFIG.scrollDelay)
    }
    await page.evaluate(() => window.scrollTo(0, 0))

    // Expand collapsed content before extraction
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach(d => (d as HTMLDetailsElement).open = true)
      document.querySelectorAll('[aria-expanded="false"]').forEach(el => (el as HTMLElement).click())
    })
    await page.waitForTimeout(300)

    const html = await page.content()
    const title = await page.title()

    const metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]') ||
                   document.querySelector('meta[name="twitter:description"]')
      return meta ? meta.getAttribute('content') || '' : ''
    })

    const jsonLd = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      return scripts.map(s => {
        try { return JSON.parse(s.textContent || '') }
        catch { return null }
      }).filter(Boolean)
    })

    // Extract images with header/hero context, alt text, and dimensions
    const imagesWithContext = await page.evaluate(() => {
      const results: Array<{ src: string; isHeaderOrHero: boolean; alt: string; width: number; height: number }> = []
      const seen: string[] = []

      const isHeaderOrHeroElement = (el: Element | null): boolean => {
        if (!el) return false
        const tag = el.tagName.toLowerCase()
        if (tag === 'header' || tag === 'nav') return true
        const id = el.id.toLowerCase()
        const className = (typeof el.className === 'string' ? el.className : '').toLowerCase()
        if (id.includes('header') || id.includes('nav') || id.includes('hero') || id.includes('banner')) return true
        if (className.includes('header') || className.includes('nav') || className.includes('hero') || className.includes('banner')) return true

        let parent = el.parentElement
        for (let i = 0; i < 5 && parent; i++) {
          const pTag = parent.tagName.toLowerCase()
          const pId = parent.id.toLowerCase()
          const pClass = (typeof parent.className === 'string' ? parent.className : '').toLowerCase()
          if (pTag === 'header' || pTag === 'nav' || pId.includes('header') || pId.includes('hero') || pClass.includes('header') || pClass.includes('hero')) {
            return true
          }
          parent = parent.parentElement
        }
        return false
      }

      // Get all img elements
      const imgs = Array.from(document.querySelectorAll('img'))
      for (const img of imgs) {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src')
        if (src && src.startsWith('http') && !seen.includes(src)) {
          seen.push(src)
          results.push({
            src,
            isHeaderOrHero: isHeaderOrHeroElement(img),
            alt: img.alt || '',
            width: img.naturalWidth || parseInt(img.getAttribute('width') || '0') || 0,
            height: img.naturalHeight || parseInt(img.getAttribute('height') || '0') || 0,
          })
        }
      }

      // Get background images
      const allElements = Array.from(document.querySelectorAll('*'))
      for (const el of allElements) {
        const bg = window.getComputedStyle(el).backgroundImage
        if (bg && bg !== 'none') {
          const match = bg.match(/url\((['"]?)(.*?)\1\)/)
          if (match && match[2]) {
            try {
              const absoluteUrl = new URL(match[2], window.location.href).href
              if (absoluteUrl.startsWith('http') && !seen.includes(absoluteUrl)) {
                seen.push(absoluteUrl)
                results.push({
                  src: absoluteUrl,
                  isHeaderOrHero: isHeaderOrHeroElement(el),
                  alt: el.getAttribute('aria-label') || el.getAttribute('title') || '',
                  width: 0,
                  height: 0,
                })
              }
            } catch {}
          }
        }
      }

      return results
    })

    const images = imagesWithContext.map(item => item.src)

    const mapEmbeds = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('iframe'))
        .map(el => (el as HTMLIFrameElement).src)
        .filter(src => src.includes('google.com/maps') || src.includes('maps.google.com'))
    })
    const mapEmbedUrl = mapEmbeds.length > 0 ? mapEmbeds[0] : null

    const cleanedHtml = cleanHtmlForMarkdown(html)
    const markdown = htmlToMarkdown(cleanedHtml)

    console.log(`[Local Scraper] Scraped ${targetUrl} - found ${images.length} images`)

    await page.close()

    return {
      url: targetUrl,
      html,
      markdown,
      title,
      metaDescription,
      jsonLd,
      images,
      imagesWithContext,
      mapEmbedUrl,
    }
  } finally {
    await context.close()
  }
}

// ============================================
// URL Utilities
// ============================================
function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  const parsed = new URL(url)
  if (!parsed.pathname.endsWith('/') && !parsed.pathname.includes('.')) {
    parsed.pathname = parsed.pathname + '/'
  }
  return parsed.href
}

function isHtmlPage(url: string): boolean {
  const lower = url.toLowerCase()
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(url)) return false
  }
  const nonHtmlExtensions = ['.xml', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip', '.mp4', '.webp', '.avif']
  for (const ext of nonHtmlExtensions) {
    if (lower.endsWith(ext)) return false
  }
  return true
}

function filterHtmlUrls(urls: string[], rootUrl: string): string[] {
  const base = new URL(rootUrl).origin
  const filtered: string[] = []
  const seen = new Set<string>()

  for (const url of urls) {
    try {
      const parsed = new URL(url)
      if (parsed.origin !== base) continue
      if (!isHtmlPage(url)) continue
      if (seen.has(url)) continue
      seen.add(url)
      filtered.push(url)
    } catch { continue }
  }

  return filtered
}

// ============================================
// Tier 1: Sitemap Discovery
// ============================================
async function fetchAndParseSitemap(sitemapUrl: string): Promise<{ urls: string[]; images: string[] }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(sitemapUrl, {
      signal: controller.signal,
      headers: SCRAPE_HEADERS,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return { urls: [], images: [] }

    const xml = await response.text()
    const urls: string[] = []
    const images: string[] = []

    const locMatches = xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || []
    for (const match of locMatches) {
      const url = match.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/i, '$1').trim()
      if (url.toLowerCase().endsWith('.xml')) {
        const childResult = await fetchAndParseSitemap(url)
        urls.push(...childResult.urls)
        images.push(...childResult.images)
      } else {
        urls.push(url)
      }
    }

    // Harvest images from sitemap
    const imagePatterns = [
      /<image:loc>(https?:\/\/[^<]+)<\/image:loc>/gi,
      /<wp:attachment_url>(https?:\/\/[^<]+)<\/wp:attachment_url>/gi,
      /<media:content url="([^"]+)"\/>/gi,
      /<media:thumbnail url="([^"]+)"\/>/gi,
    ]

    for (const pattern of imagePatterns) {
      const matches = xml.match(pattern) || []
      for (const match of matches) {
        const imgUrl = match
          .replace(/<\/?image:loc>/gi, '')
          .replace(/<\/?wp:attachment_url>/gi, '')
          .replace(/<media:content url="/gi, '')
          .replace(/"<\/?media:content>/gi, '')
          .replace(/<media:thumbnail url="/gi, '')
          .replace(/"<\/?media:thumbnail>/gi, '')
          .trim()

        if (imgUrl && isValidImageUrl(imgUrl) && !isUiOrTrackingImage(imgUrl)) {
          images.push(imgUrl)
        }
      }
    }

    return { urls, images }
  } catch {
    return { urls: [], images: [] }
  }
}

async function discoverViaSitemap(rootUrl: string): Promise<{ urls: string[]; images: string[] }> {
  console.log(`[Scraper] Tier 1: Sitemap discovery for ${rootUrl}`)

  const parsedUrl = new URL(rootUrl)
  const baseUrl = parsedUrl.origin

  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap-index.xml`,
  ]

  let allUrls: string[] = []
  let allImages: string[] = []

  for (const sitemapUrl of sitemapUrls) {
    const result = await fetchAndParseSitemap(sitemapUrl)
    if (result.urls.length > 0) {
      allUrls = [...allUrls, ...result.urls]
      allImages = [...allImages, ...result.images]
      break
    }
  }

  // Check robots.txt for sitemap
  if (allUrls.length === 0) {
    try {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
        signal: AbortSignal.timeout(5000),
        headers: SCRAPE_HEADERS,
      })
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text()
        const sitemapMatch = robotsText.match(/^Sitemap:\s*(.+)$/im)
        if (sitemapMatch) {
          const result = await fetchAndParseSitemap(sitemapMatch[1].trim())
          allUrls = result.urls
          allImages = result.images
        }
      }
    } catch {}
  }

  if (allUrls.length > 1) {
    const filtered = filterHtmlUrls(allUrls, rootUrl)
    console.log(`[Scraper] Tier 1: Found ${filtered.length} HTML pages, ${allImages.length} images`)
    return { urls: filtered.slice(0, MAX_PAGES + 1), images: allImages }
  }

  return { urls: [], images: [] }
}

// ============================================
// Tier 2: Common Path Generator
// ============================================
function discoverViaCommonPaths(rootUrl: string): string[] {
  console.log(`[Scraper] Tier 2: Generating common paths`)
  const parsedUrl = new URL(rootUrl)
  const baseUrl = parsedUrl.origin
  return [rootUrl, ...COMMON_PATHS.map(p => `${baseUrl}${p}`)].slice(0, MAX_PAGES + 1)
}

// ============================================
// 3-Tier Discovery
// ============================================
async function discoverAllSubPages(rootUrl: string): Promise<{ urls: string[]; images: string[] }> {
  const normalizedRootUrl = normalizeUrl(rootUrl)

  // Tier 1: Sitemap
  let result = await discoverViaSitemap(normalizedRootUrl)
  let urls = result.urls
  let sitemapImages = result.images

  // Tier 2: Common paths (ALWAYS check, not just as fallback)
  // Common paths are ALWAYS included (they're important pages like /pricing)
  const commonPaths = discoverViaCommonPaths(normalizedRootUrl)
  
  // Deduplicate common paths
  const uniqueCommonPaths = commonPaths.filter(url => !urls.includes(url))
  
  // Combine: common paths first, then sitemap pages
  // The limit only applies to sitemap pages, not common paths
  const limitedSitemapUrls = urls.slice(0, MAX_PAGES + 1)
  urls = [...uniqueCommonPaths, ...limitedSitemapUrls]

  // Ensure root URL is first
  const uniqueUrls = [normalizedRootUrl]
  const seen = new Set([normalizedRootUrl])

  for (const url of urls) {
    if (!seen.has(url) && isHtmlPage(url)) {
      seen.add(url)
      uniqueUrls.push(url)
    }
  }

  const finalUrls = uniqueUrls.slice(0, MAX_PAGES + 1)
  console.log(`[Scraper] Final discovery: ${finalUrls.length} HTML pages, ${sitemapImages.length} sitemap images`)

  return { urls: finalUrls, images: sitemapImages }
}

// ============================================
// Parallel Scraping with Rate Limiting
// ============================================
async function scrapePagesInParallel(urls: string[]): Promise<LocalScrapeResult[]> {
  console.log(`[Scraper] Parallel scraping ${urls.length} pages with Playwright...`)

  const rateLimiter = new RateLimiter(SCRAPE_DELAY_MS, 5000)
  const successfulPages: LocalScrapeResult[] = []

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    console.log(`[Scraper] Batch ${Math.floor(i / CONCURRENCY) + 1}: ${batch.length} pages`)

    const batchPromises = batch.map(async (pageUrl) => {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await scrapeSinglePageLocally(pageUrl)
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            console.log(`[Scraper] Failed to scrape ${pageUrl} after ${MAX_RETRIES + 1} attempts:`, error)
            throw error
          }
          await rateLimiter.wait()
          rateLimiter.increase()
        }
      }
      throw new Error('Unreachable')
    })

    const results = await Promise.allSettled(batchPromises)

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successfulPages.push(result.value)
        rateLimiter.reset()
      } else {
        rateLimiter.increase()
      }
    }

    // Delay between batches
    if (i + CONCURRENCY < urls.length) {
      await rateLimiter.wait()
    }
  }

  console.log(`[Scraper] Successfully scraped ${successfulPages.length}/${urls.length} pages`)
  return successfulPages
}

// ============================================
// Main Export
// ============================================
export async function scrapeLegacySite(rootUrl: string): Promise<ScrapedData> {
  const normalizedRootUrl = normalizeUrl(rootUrl)
  console.log(`[Scraper] Starting 3-tier discovery for: ${normalizedRootUrl}`)

  let discoveredUrls: string[] = [normalizedRootUrl]
  let sitemapHarvestedImages: string[] = []
  let scrapedPages: LocalScrapeResult[]

  try {
    const discoveryResult = await discoverAllSubPages(normalizedRootUrl)
    discoveredUrls = discoveryResult.urls
    sitemapHarvestedImages = discoveryResult.images

    if (discoveredUrls.length === 0) discoveredUrls = [normalizedRootUrl]

    scrapedPages = await scrapePagesInParallel(discoveredUrls)

    if (scrapedPages.length === 0) {
      console.log(`[Scraper] All scrapes failed, using fallback`)
      scrapedPages = [await scrapeSinglePageLocally(normalizedRootUrl)]
    }
  } catch (error) {
    console.error(`[Scraper] Pipeline error:`, error)
    scrapedPages = [await scrapeSinglePageLocally(normalizedRootUrl)]
    discoveredUrls = [normalizedRootUrl]
  } finally {
    await closeBrowser()
  }

  // Aggregate Content
  const pageMarkdowns: string[] = []
  const allImages: string[] = [...sitemapHarvestedImages]
  let combinedContact: ContactInfo | null = null
  const combinedAnalytics: Record<string, string> = {}

  const imageSourceMap = new Map<string, string[]>()
  const isHeaderOrHeroMap = new Map<string, boolean>()
  const imageAltMap = new Map<string, string>()
  const imageDimensionsMap = new Map<string, { width: number; height: number }>()

  for (const page of scrapedPages) {
    if (page.markdown) {
      pageMarkdowns.push(`--- PAGE: ${page.url} ---\n${page.markdown}`)

      // Extract images - use Playwright extracted images (more reliable)
      const pageImages = Array.from(new Set(page.images || []))

      // Filter out UI/tracking images
      const validImages = pageImages.filter(img =>
        !isUiOrTrackingImage(img) &&
        isValidImageUrl(img) &&
        !img.includes('data:')
      )

      allImages.push(...validImages)

      for (const imgUrl of validImages) {
        if (!imageSourceMap.has(imgUrl)) imageSourceMap.set(imgUrl, [])
        const sources = imageSourceMap.get(imgUrl)!
        if (!sources.includes(page.url)) sources.push(page.url)
      }

      if (page.imagesWithContext) {
        for (const imgCtx of page.imagesWithContext) {
          if (imgCtx.isHeaderOrHero) isHeaderOrHeroMap.set(imgCtx.src, true)
          // Preserve alt text (prefer non-empty)
          if (imgCtx.alt && !imageAltMap.has(imgCtx.src)) {
            imageAltMap.set(imgCtx.src, imgCtx.alt)
          }
          // Preserve dimensions (prefer larger)
          if (imgCtx.width && imgCtx.height && imgCtx.width > 0 && imgCtx.height > 0) {
            const existing = imageDimensionsMap.get(imgCtx.src)
            if (!existing || (imgCtx.width * imgCtx.height > existing.width * existing.height)) {
              imageDimensionsMap.set(imgCtx.src, { width: imgCtx.width, height: imgCtx.height })
            }
          }
        }
      }

      // Extract contact info
      const phones = extractPhoneNumbers(page.markdown)
      const emails = extractEmails(page.markdown)
      
      // Also extract emails from HTML (includes JavaScript)
      const htmlEmails = extractEmails(page.html)
      
      // Prioritize real emails over placeholders
      const allEmails = [...emails, ...htmlEmails]
      const realEmail = allEmails.find(e => !e.includes('email@address') && !e.includes('example.com'))

      if (!combinedContact) {
        combinedContact = {
          phone: phones[0]?.replace(/^\+27/, '0').replace(/\s/g, '') || '',
          whatsapp: phones[0]?.replace(/^\+27/, '0').replace(/\s/g, '') || '',
          email: realEmail || emails[0] || '',
          address: '',
        }
      } else {
        if (!combinedContact.phone && phones.length) combinedContact.phone = phones[0].replace(/^\+27/, '0').replace(/\s/g, '')
        if (realEmail && (!combinedContact.email || combinedContact.email.includes('email@address'))) {
          combinedContact.email = realEmail
        }
      }

      // Extract analytics
      const pageAnalytics = extractAnalytics(page.markdown)
      Object.assign(combinedAnalytics, pageAnalytics)
    }
  }

  // Calculate initial aggregated data
  const fullMarkdown = pageMarkdowns.join('\n\n')
  const allImagesUnique = Array.from(new Set(allImages))
  let potentialLogos = allImagesUnique.filter(isPotentialLogo)

  const cssColors = extractWebsiteCssColors(fullMarkdown)

  const pagesDetails = scrapedPages.map(page => ({
    url: page.url,
    title: page.title,
    metaDescription: page.metaDescription,
    jsonLd: page.jsonLd,
    images: page.images || [],
    markdown: page.markdown,
  }))

  // ============================================
  // Extract structural data from first page (homepage)
  // ============================================
  const homePage = scrapedPages[0]
  const navigation = homePage ? extractNavigation(homePage.html, normalizedRootUrl) : []
  const heroContent = homePage ? extractHeroContent(homePage.html, homePage.markdown) : { headline: '', subheadline: '' }
  const imagesWithAlt = homePage ? extractImagesWithAlt(homePage.html) : []
  const testimonials = extractTestimonials(fullMarkdown, fullMarkdown)
  const socialLinks = homePage ? extractSocialLinks(homePage.html) : {}
  const pricing = extractPricing(fullMarkdown)
  const blogPosts = extractBlogPosts(pagesDetails)
  const portfolioCategories = homePage ? extractPortfolioCategories(homePage.html, normalizedRootUrl) : []

  // NEW: Extract FAQs from JSON-LD and HTML patterns
  const allJsonLd = scrapedPages.flatMap(p => p.jsonLd || [])
  const faqs = extractFAQs(homePage?.html || '', allJsonLd)
  console.log(`[Scraper] FAQs: ${faqs.length} found`)

  // NEW: Extract videos from all pages
  const videos: Array<{ url: string; type: string; thumbnail?: string }> = []
  const seenVideoUrls = new Set<string>()
  for (const page of scrapedPages) {
    const pageVideos = extractVideos(page.html)
    for (const v of pageVideos) {
      if (!seenVideoUrls.has(v.url)) {
        seenVideoUrls.add(v.url)
        videos.push(v)
      }
    }
  }
  console.log(`[Scraper] Videos: ${videos.length} found`)

  // NEW: Extract structured data from JSON-LD (business hours, services, reviews, team)
  const structuredData = extractStructuredData(allJsonLd)
  console.log(`[Scraper] Structured data: ${structuredData.businessHours.length} hours, ${structuredData.services.length} services, ${structuredData.reviews.length} reviews`)

  // NEW: Extract business hours from HTML if not in JSON-LD
  const htmlBusinessHours = structuredData.businessHours.length > 0 ? [] : extractBusinessHours(fullMarkdown)
  console.log(`[Scraper] Business hours from HTML: ${htmlBusinessHours.length} entries`)

  // NEW: Extract map embed URL
  const mapEmbedUrl = scrapedPages.reduce((url, page) => url || page.mapEmbedUrl || null, null as string | null)
  if (mapEmbedUrl) console.log(`[Scraper] Map embed found: ${mapEmbedUrl}`)

  // Enhanced logo detection: if no logos found by URL pattern, try HTML structure
  if (potentialLogos.length === 0 && homePage) {
    const htmlLogo = detectLogoWithFavicon(homePage.html, allImagesUnique, normalizedRootUrl)
    if (htmlLogo) {
      potentialLogos = [htmlLogo]
      console.log(`[Scraper] Logo found via enhanced detection: ${htmlLogo}`)
    }
  }

  // ============================================
  // Extract GA4 Measurement ID
  // ============================================
  const ga4MeasurementId = extractGA4MeasurementId(fullMarkdown)
  console.log(`[Scraper] GA4 Measurement ID: ${ga4MeasurementId || 'Not found'}`)

  // ============================================
  // Extract emails from HTML (including JavaScript)
  // ============================================
  if (homePage) {
    const htmlEmails = extractEmails(homePage.html)
    if (htmlEmails.length > 0 && !combinedContact?.email) {
      if (!combinedContact) {
        combinedContact = {
          phone: '',
          whatsapp: '',
          email: htmlEmails[0],
          address: '',
        }
      } else {
        combinedContact.email = htmlEmails[0]
      }
      console.log(`[Scraper] Email from HTML: ${htmlEmails[0]}`)
    }
  }

  // ============================================
  // Extract ALL links from HTML body for page discovery
  // ============================================
  const allBodyLinks = extractAllLinksFromHtml(homePage?.html || '', normalizedRootUrl)
  if (allBodyLinks.length > 0) {
    console.log(`[Scraper] Found ${allBodyLinks.length} links from HTML body`)
    
    // Filter for pricing and important pages
    const importantLinks = allBodyLinks.filter(url => {
      const lower = url.toLowerCase()
      return lower.includes('pricing') || lower.includes('price') || 
             lower.includes('package') || lower.includes('rate') ||
             lower.includes('investment') || lower.includes('invest')
    })
    
    if (importantLinks.length > 0) {
      console.log(`[Scraper] Found ${importantLinks.length} important links (pricing, etc.)`)
      
      // Filter out already scraped URLs
      const newImportantLinks = importantLinks.filter(url => !discoveredUrls.includes(url))
      
      if (newImportantLinks.length > 0) {
        console.log(`[Scraper] Scraping ${newImportantLinks.length} important pages...`)
        
        try {
          const importantPages = await scrapePagesInParallel(newImportantLinks)
          
          // Add to scraped pages
          scrapedPages.push(...importantPages)
          
          // Add important page content to aggregation
          for (const page of importantPages) {
            if (page.markdown) {
              pageMarkdowns.push(`--- PAGE: ${page.url} ---\n${page.markdown}`)
              
              // Extract images from important pages
              const pageImages = Array.from(new Set(page.images || []))
              const validImages = pageImages.filter(img =>
                !isUiOrTrackingImage(img) &&
                isValidImageUrl(img) &&
                !img.includes('data:')
              )
              
              allImages.push(...validImages)
              
              for (const imgUrl of validImages) {
                if (!imageSourceMap.has(imgUrl)) imageSourceMap.set(imgUrl, [])
                const sources = imageSourceMap.get(imgUrl)!
                if (!sources.includes(page.url)) sources.push(page.url)
              }
            }
          }
          
          console.log(`[Scraper] Scraped ${importantPages.length} important pages`)
        } catch (error) {
          console.log(`[Scraper] Failed to scrape important pages:`, error)
        }
      }
    }
  }

  // ============================================
  // Discover category pages from navigation and scrape them
  // ============================================
  const categoryUrls = extractCategoryUrlsFromNavigation(navigation, normalizedRootUrl)
  if (categoryUrls.length > 0) {
    console.log(`[Scraper] Found ${categoryUrls.length} category pages from navigation`)
    
    // Filter out already scraped URLs
    const newCategoryUrls = categoryUrls.filter(url => !discoveredUrls.includes(url))
    
    if (newCategoryUrls.length > 0) {
      console.log(`[Scraper] Scraping ${newCategoryUrls.length} new category pages...`)
      
      try {
        // Scrape category pages
        const categoryPages = await scrapePagesInParallel(newCategoryUrls)
        
        // Add to scraped pages
        scrapedPages.push(...categoryPages)
        
        // Add category page content to aggregation
        for (const page of categoryPages) {
          if (page.markdown) {
            pageMarkdowns.push(`--- PAGE: ${page.url} ---\n${page.markdown}`)
            
            // Extract images from category pages
            const pageImages = Array.from(new Set(page.images || []))
            const validImages = pageImages.filter(img =>
              !isUiOrTrackingImage(img) &&
              isValidImageUrl(img) &&
              !img.includes('data:')
            )
            
            allImages.push(...validImages)
            
            for (const imgUrl of validImages) {
              if (!imageSourceMap.has(imgUrl)) imageSourceMap.set(imgUrl, [])
              const sources = imageSourceMap.get(imgUrl)!
              if (!sources.includes(page.url)) sources.push(page.url)
            }
          }
        }
        
        console.log(`[Scraper] Scraped ${categoryPages.length} category pages`)
      } catch (error) {
        console.log(`[Scraper] Failed to scrape category pages:`, error)
      }
    }
  }

  console.log(`[Scraper] Aggregated: ${scrapedPages.length} pages, ${allImagesUnique.length} images, ${potentialLogos.length} logos`)
  console.log(`[Scraper] Navigation: ${navigation.length} items, Testimonials: ${testimonials.length}, Pricing: ${pricing.length}`)

  return {
    title: extractTitle(fullMarkdown),
    fullMarkdown,
    imageList: allImagesUnique,
    potentialLogos,
    contactInfo: combinedContact || { phone: '', whatsapp: '', email: '', address: '' },
    pagesDiscovered: discoveredUrls,
    pagesScraped: scrapedPages.length,
    analytics: combinedAnalytics as any,
    cssColors: {
      dominantCssPrimary: cssColors.dominantCssPrimary,
      dominantCssSecondary: cssColors.dominantCssSecondary,
      dominantCssBg: cssColors.dominantCssBg,
      allColors: cssColors.allColors,
    },
    allDiscoveredImages: sitemapHarvestedImages,
    pagesDetails,
    scrapedImagesMetadata: allImagesUnique.map(imgUrl => ({
      url: imgUrl,
      sourceUrls: imageSourceMap.get(imgUrl) || [],
      usageCount: (imageSourceMap.get(imgUrl) || []).length,
      isPrimaryBrandAsset: (imageSourceMap.get(imgUrl) || []).length >= 3 || (isHeaderOrHeroMap.get(imgUrl) || false),
      alt: imageAltMap.get(imgUrl) || '',
      width: imageDimensionsMap.get(imgUrl)?.width || 0,
      height: imageDimensionsMap.get(imgUrl)?.height || 0,
    })),
    
    // Structural data
    navigation,
    heroContent,
    imagesWithAlt,
    testimonials,
    socialLinks,
    pricing,
    blogPosts,
    portfolioCategories,
    ga4MeasurementId,
    // NEW: Enhanced extraction
    faqs,
    videos,
    structuredData,
    htmlBusinessHours,
    mapEmbedUrl,
  }
}

function extractTitle(markdown: string): string {
  const headingMatch = markdown.match(/^#\s+(.+)$/m)
  if (headingMatch) return headingMatch[1].trim()
  const htmlTitleMatch = markdown.match(/<title>([^<]+)<\/title>/i)
  if (htmlTitleMatch) return htmlTitleMatch[1].trim()
  return 'Business Website'
}

// ============================================
// GA4 MEASUREMENT ID EXTRACTION
// ============================================
export function extractGA4MeasurementId(html: string): string | null {
  // Pattern 1: gtag config
  const gtagPattern = /gtag\(\s*['"]config['"]\s*,\s*['"]([A-Z]{2}-[A-Z0-9]{10})['"]\s*\)/i
  const gtagMatch = html.match(gtagPattern)
  if (gtagMatch) return gtagMatch[1]
  
  // Pattern 2: GA4 script src
  const scriptPattern = /googletagmanager\.com\/gtag\/js\?id=([A-Z]{2}-[A-Z0-9]{10})/i
  const scriptMatch = html.match(scriptPattern)
  if (scriptMatch) return scriptMatch[1]
  
  // Pattern 3: Direct ID pattern
  const idPattern = /['"]([A-Z]{2}-[A-Z0-9]{10})['"]/g
  let match
  while ((match = idPattern.exec(html)) !== null) {
    const id = match[1]
    // Filter out non-GA4 IDs (UA- is Universal Analytics)
    if (id.startsWith('G-')) return id
  }
  
  // Pattern 4: Universal Analytics (legacy)
  const uaPattern = /['"]([A-Z]{2}-[0-9]+-[0-9]+)['"]/g
  while ((match = uaPattern.exec(html)) !== null) {
    return match[1] // Return UA ID as fallback
  }
  
  return null
}

// ============================================
// CATEGORY URL EXTRACTION FROM NAVIGATION
// ============================================
export function extractCategoryUrlsFromNavigation(navigation: NavigationItem[], baseUrl: string): string[] {
  const categoryUrls: string[] = []
  const seenUrls = new Set<string>()
  
  // Gallery/Portfolio category patterns
  const galleryPatterns = [
    /portfolio/i, /gallery/i, /our-work/i, /images/i, /photos/i,
    /work/i, /projects/i, /showcase/i, /collection/i, /lookbook/i,
    /my-portfolio/i, /my-work/i, /my-gallery/i,
  ]
  
  // Category sub-page patterns
  const categoryPatterns = [
    /wedding/i, /famil/i, /newborn/i, /baby/i, /maternity/i,
    /portrait/i, /couple/i, /engagement/i, /matric/i, /graduation/i,
    /birthday/i, /cake-smash/i, /milk-bath/i, /event/i, /corporate/i,
    /product/i, /commercial/i, /menu/i, /food/i, /team/i, /staff/i,
    /treatment/i, /service/i, /package/i, /rate/i,
  ]
  
  function processNavItem(item: NavigationItem) {
    const url = item.url.toLowerCase()
    const label = item.label.toLowerCase()
    
    // Check if this is a gallery/portfolio category
    const isGallery = galleryPatterns.some(p => p.test(url) || p.test(label))
    const isCategory = categoryPatterns.some(p => p.test(url) || p.test(label))
    
    if ((isGallery || isCategory) && !seenUrls.has(item.url)) {
      seenUrls.add(item.url)
      categoryUrls.push(item.url)
    }
    
    // Process children
    if (item.children) {
      for (const child of item.children) {
        processNavItem(child)
      }
    }
  }
  
  for (const item of navigation) {
    processNavItem(item)
  }
  
  return categoryUrls
}

// ============================================
// NAVIGATION EXTRACTION
// ============================================
export interface NavigationItem {
  label: string
  url: string
  children?: NavigationItem[]
}

export function extractNavigation(html: string, baseUrl: string): NavigationItem[] {
  const nav: NavigationItem[] = []
  const seenUrls = new Set<string>()
  
  // Pattern: <a href="...">Label</a> inside <nav> or header
  const navPattern = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  const headerPattern = /<header[^>]*>([\s\S]*?)<\/header>/gi
  
  let navContent = ''
  
  // Try nav first
  const navMatch = html.match(navPattern)
  if (navMatch) navContent = navMatch[0]
  
  // Fallback to header
  if (!navContent) {
    const headerMatch = html.match(headerPattern)
    if (headerMatch) navContent = headerMatch[0]
  }
  
  if (!navContent) return nav
  
  // Extract links
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match
  
  while ((match = linkPattern.exec(navContent)) !== null) {
    const url = match[1].trim()
    const label = match[2].replace(/<[^>]+>/g, '').trim()
    
    if (label.length > 1 && label.length < 50 && !seenUrls.has(url)) {
      seenUrls.add(url)
      
      // Resolve relative URLs
      let fullUrl = url
      if (url.startsWith('/')) {
        try {
          fullUrl = new URL(url, baseUrl).href
        } catch {}
      }
      
      nav.push({ label, url: fullUrl })
    }
  }
  
  return nav
}

// ============================================
// HERO TEXT EXTRACTION
// ============================================
export interface HeroContent {
  headline: string
  subheadline: string
  ctaText?: string
  ctaUrl?: string
}

export function extractHeroContent(html: string, markdown: string): HeroContent {
  // Look for h1 (main headline)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : ''
  
  // Look for h2/h3 near h1 (subheadline)
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  const h2 = h2Match ? h2Match[1].replace(/<[^>]+>/g, '').trim() : ''
  
  // Look for CTA button near hero
  const ctaMatch = html.match(/<a[^>]+class=["'][^"']*btn[^"']*["'][^>]*>([\s\S]*?)<\/a>/i) ||
    html.match(/<button[^>]*>([\s\S]*?)<\/button>/i)
  const ctaText = ctaMatch ? ctaMatch[1].replace(/<[^>]+>/g, '').trim() : ''
  const ctaUrl = ctaMatch ? (ctaMatch[0].match(/href=["']([^"']+)["']/)?.[1] || '') : ''
  
  return {
    headline: h1 || '',
    subheadline: h2 || '',
    ctaText,
    ctaUrl,
  }
}

// ============================================
// IMAGE ALT TEXT EXTRACTION
// ============================================
export interface ImageWithAlt {
  src: string
  alt: string
}

export function extractImagesWithAlt(html: string): ImageWithAlt[] {
  const images: ImageWithAlt[] = []
  const seenSrc = new Set<string>()
  
  const pattern = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi
  let match
  
  while ((match = pattern.exec(html)) !== null) {
    const src = match[1]
    const alt = match[2] || ''
    
    if (!seenSrc.has(src) && isValidImageUrl(src) && !isUiOrTrackingImage(src)) {
      seenSrc.add(src)
      images.push({ src, alt })
    }
  }
  
  return images
}

// ============================================
// TESTIMONIAL EXTRACTION
// ============================================
export interface Testimonial {
  name: string
  text: string
  rating?: number
  source?: string
}

export function extractTestimonials(html: string, markdown: string): Testimonial[] {
  const testimonials: Testimonial[] = []
  
  // Pattern 1: Blockquote with citation
  const blockquotePattern = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi
  let match
  
  while ((match = blockquotePattern.exec(html)) !== null) {
    const content = match[1].replace(/<[^>]+>/g, '').trim()
    const nameMatch = content.match(/[-–—]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m)
    
    if (content.length > 20 && content.length < 500) {
      testimonials.push({
        name: nameMatch ? nameMatch[1].trim() : 'Client',
        text: content.replace(/[-–—]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*$/, '').trim(),
        rating: extractRating(content),
        source: 'Website',
      })
    }
  }
  
  // Pattern 2: Testimonial cards (look for quote patterns)
  const quotePattern = /[""]([^""]{20,300})[""]\s*[-–—]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?/g
  while ((match = quotePattern.exec(markdown)) !== null) {
    const text = match[1].trim()
    const name = match[2]?.trim() || 'Client'
    
    if (text.length > 20 && !testimonials.some(t => t.text === text)) {
      testimonials.push({
        name,
        text,
        rating: extractRating(text),
        source: 'Website',
      })
    }
  }

  // Pattern 4: Name: "Quote" format
  const nameQuotePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[:-]\s*[""\u201C]([^""\u201D]{20,300})[""\u201D]/g
  while ((match = nameQuotePattern.exec(markdown)) !== null) {
    const name = match[1].trim()
    const text = match[2].trim()
    if (text.length > 20 && !testimonials.some((t: any) => t.text === text)) {
      testimonials.push({ name, text, rating: 5, source: 'Website' })
    }
  }

  // Pattern 5: Extract rating from nearby text (e.g., "5/5", "5 stars")
  function extractRating(text: string): number {
    const ratingMatch = text.match(/(\d)\s*\/\s*5|(\d)\s*stars?/i)
    if (ratingMatch) return parseInt(ratingMatch[1] || ratingMatch[2])
    return 5
  }
  
  return testimonials.slice(0, 10) // Limit to 10
}

// ============================================
// SOCIAL LINKS EXTRACTION
// ============================================
export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  pinterest?: string
  tiktok?: string
}

export function extractSocialLinks(html: string): SocialLinks {
  const links: SocialLinks = {}
  
  // Facebook
  const fbMatch = html.match(/(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)/i)
  if (fbMatch) links.facebook = `https://www.facebook.com/${fbMatch[1]}`
  
  // Instagram
  const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i)
  if (igMatch) links.instagram = `https://www.instagram.com/${igMatch[1]}`
  
  // Twitter
  const twMatch = html.match(/twitter\.com\/([a-zA-Z0-9_]+)/i)
  if (twMatch) links.twitter = `https://www.twitter.com/${twMatch[1]}`
  
  // LinkedIn
  const liMatch = html.match(/linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)/i)
  if (liMatch) links.linkedin = `https://www.linkedin.com/in/${liMatch[1]}`
  
  // YouTube
  const ytMatch = html.match(/youtube\.com\/(?:c\/|channel\/|@)([a-zA-Z0-9_-]+)/i)
  if (ytMatch) links.youtube = `https://www.youtube.com/@${ytMatch[1]}`
  
  // Pinterest
  const pinMatch = html.match(/pinterest\.com\/([a-zA-Z0-9_]+)/i)
  if (pinMatch) links.pinterest = `https://www.pinterest.com/${pinMatch[1]}`

  // TikTok
  const ttMatch = html.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/i)
  if (ttMatch) links.tiktok = `https://www.tiktok.com/@${ttMatch[1]}`

  // X (Twitter rebrand)
  const xMatch = html.match(/x\.com\/([a-zA-Z0-9_]+)/i)
  if (xMatch && !links.twitter) links.twitter = `https://x.com/${xMatch[1]}`
  
  return links
}

// ============================================
// PRICING EXTRACTION
// ============================================
export interface PricingItem {
  service: string
  price: string
  details?: string
}

export function extractPricing(markdown: string): PricingItem[] {
  const pricing: PricingItem[] = []
  
  // Multi-currency price patterns
  const patterns = [
    // R1500, R1,500, R 1500, From R500
    /([A-Za-z\s]{3,30}?)\s*[-:]\s*R\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    // $150, $1,500, From $500
    /([A-Za-z\s]{3,30}?)\s*[-:]\s*\$\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    // €150, €1,500
    /([A-Za-z\s]{3,30}?)\s*[-:]\s*€\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    // £150, £1,500
    /([A-Za-z\s]{3,30}?)\s*[-:]\s*£\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    // From R500, Starting at $99
    /(?:from|starting\s+at|only)\s+([A-Za-z\s]{3,30}?)\s*R\s?(\d[\d,]*(?:\.\d{2})?)/gi,
    /(?:from|starting\s+at|only)\s+([A-Za-z\s]{3,30}?)\s*\$\s?(\d[\d,]*(?:\.\d{2})?)/gi,
  ]
  
  const seen = new Set<string>()
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(markdown)) !== null) {
      const service = match[1].trim()
      const price = match[0].match(/[R$€£]/)?.[0] + match[2]
      const key = `${service}-${price}`
      
      if (service.length > 2 && service.length < 50 && !seen.has(key)) {
        seen.add(key)
        pricing.push({ service, price })
      }
    }
  }
  
  return pricing.slice(0, 20)
}

// ============================================
// BLOG POST EXTRACTION
// ============================================
export interface BlogPost {
  title: string
  excerpt: string
  date?: string
  url: string
  images: string[]
}

export function extractBlogPosts(pagesDetails: Array<{ url: string; title: string; markdown: string; images: string[] }>): BlogPost[] {
  const posts: BlogPost[] = []
  
  const blogPatterns = /blog|news|stories|articles|posts|updates/i
  
  for (const page of pagesDetails) {
    if (blogPatterns.test(page.url) || blogPatterns.test(page.title)) {
      const dateMatch = page.url.match(/(\d{4})[/-](\d{2})[/-](\d{2})/)
      const date = dateMatch ? dateMatch[0] : undefined
      
      const excerptMatch = page.markdown?.match(/(?:^|\n)\s*([^\n]{50,200})/)
      const excerpt = excerptMatch ? excerptMatch[1].trim() : page.title
      
      const contentImages = (page.images || []).filter(img =>
        !/logo|icon|favicon|banner|background|bg/i.test(img)
      )
      
      posts.push({
        title: page.title,
        excerpt,
        date,
        url: page.url,
        images: contentImages.slice(0, 5),
      })
    }
  }
  
  return posts
}

// ============================================
// PORTFOLIO CATEGORIES EXTRACTION
// ============================================
export interface PortfolioCategory {
  name: string
  url: string
  imageUrl?: string
  description?: string
}

export function extractPortfolioCategories(html: string, baseUrl: string): PortfolioCategory[] {
  const categories: PortfolioCategory[] = []
  const seenNames = new Set<string>()
  
  // Look for portfolio/category links with images
  const categoryPattern = /<a[^>]+href=["']([^"']*(?:portfolio|gallery|project)[^"']*)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?(?:<h[23][^>]*>([\s\S]*?)<\/h[23]>|<[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<)/gi
  let match
  
  while ((match = categoryPattern.exec(html)) !== null) {
    const url = match[1]
    const imageUrl = match[2]
    const name = (match[3] || match[4] || '').replace(/<[^>]+>/g, '').trim()
    
    if (name && !seenNames.has(name)) {
      seenNames.add(name)
      categories.push({
        name,
        url: url.startsWith('/') ? new URL(url, baseUrl).href : url,
        imageUrl,
      })
    }
  }
  
  return categories
}

// ============================================
// FAQ EXTRACTION
// ============================================
export function extractFAQs(html: string, jsonLd: any[]): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []
  const seenQuestions = new Set<string>()

  // Source 1: JSON-LD FAQPage schema (most reliable)
  for (const ld of jsonLd) {
    if (ld['@type'] === 'FAQPage' || ld['@type']?.includes?.('FAQPage')) {
      const entities = ld.mainEntity || ld.mainEntityOfPage || []
      for (const entity of entities) {
        const question = (entity.name || '').trim()
        const answer = (entity.acceptedAnswer?.text || entity.acceptedAnswer || '').trim()
        if (question && answer && !seenQuestions.has(question)) {
          seenQuestions.add(question)
          faqs.push({ question, answer: answer.replace(/<[^>]+>/g, '') })
        }
      }
    }
  }

  // Source 2: <details>/<summary> elements
  const detailsPattern = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi
  let match
  while ((match = detailsPattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim()
    const answer = match[2].replace(/<[^>]+>/g, '').trim()
    if (question.length > 5 && answer.length > 10 && !seenQuestions.has(question)) {
      seenQuestions.add(question)
      faqs.push({ question, answer })
    }
  }

  // Source 3: Definition lists (dt/dd)
  const dtPattern = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi
  while ((match = dtPattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim()
    const answer = match[2].replace(/<[^>]+>/g, '').trim()
    if (question.length > 5 && answer.length > 10 && !seenQuestions.has(question)) {
      seenQuestions.add(question)
      faqs.push({ question, answer })
    }
  }

  // Source 4: Common FAQ HTML patterns
  const faqItemPattern = /<(?:div|section)[^>]*class=["'][^"']*(?:faq|accordion|qa)[^"']*["'][^>]*>[\s\S]*?<(?:h[23456]|button|div)[^>]*>([\s\S]*?)<\/(?:h[23456]|button|div)>[\s\S]*?<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>[\s\S]*?<\/(?:div|section)>/gi
  while ((match = faqItemPattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim()
    const answer = match[2].replace(/<[^>]+>/g, '').trim()
    if (question.length > 5 && answer.length > 10 && !seenQuestions.has(question)) {
      seenQuestions.add(question)
      faqs.push({ question, answer })
    }
  }

  return faqs.slice(0, 20)
}

// ============================================
// VIDEO EXTRACTION
// ============================================
export interface VideoInfo {
  url: string
  type: 'youtube' | 'vimeo' | 'self-hosted'
  thumbnail?: string
}

export function extractVideos(html: string): VideoInfo[] {
  const videos: VideoInfo[] = []
  const seenUrls = new Set<string>()

  function addVideo(url: string, type: VideoInfo['type']) {
    if (seenUrls.has(url)) return
    seenUrls.add(url)
    const video: VideoInfo = { url, type }
    // Auto-generate YouTube thumbnail
    if (type === 'youtube') {
      const ytMatch = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (ytMatch) video.thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`
    }
    videos.push(video)
  }

  // YouTube/Vimeo iframes
  const iframePattern = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  while ((match = iframePattern.exec(html)) !== null) {
    const src = match[1]
    if (src.includes('youtube.com') || src.includes('youtu.be')) addVideo(src, 'youtube')
    else if (src.includes('vimeo.com')) addVideo(src, 'vimeo')
  }

  // <video> tags
  const videoPattern = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi
  while ((match = videoPattern.exec(html)) !== null) {
    addVideo(match[1], 'self-hosted')
  }
  const sourcePattern = /<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["'][^>]*>/gi
  while ((match = sourcePattern.exec(html)) !== null) {
    addVideo(match[1], 'self-hosted')
  }

  // YouTube/Vimeo links in <a> tags
  const linkPattern = /<a[^>]+href=["']([^"']*(?:youtube\.com|youtu\.be|vimeo\.com)[^"']+)["'][^>]*>/gi
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1]
    if (href.includes('youtube.com') || href.includes('youtu.be')) addVideo(href, 'youtube')
    else if (href.includes('vimeo.com')) addVideo(href, 'vimeo')
  }

  return videos
}

// ============================================
// STRUCTURED DATA EXTRACTION (JSON-LD)
// ============================================
export interface StructuredData {
  businessHours: Array<{ dayOfWeek: string; opens: string; closes: string }>
  services: Array<{ name: string; description: string; price?: string }>
  reviews: Array<{ author: string; text: string; rating: number }>
  team: Array<{ name: string; role: string }>
  mapEmbedUrl: string | null
}

export function extractStructuredData(jsonLd: any[]): StructuredData {
  const result: StructuredData = {
    businessHours: [],
    services: [],
    reviews: [],
    team: [],
    mapEmbedUrl: null,
  }

  for (const ld of jsonLd) {
    const type = ld['@type'] || ''

    // Business hours from LocalBusiness
    if (type === 'LocalBusiness' || type === 'Organization' || type?.includes?.('LocalBusiness')) {
      const hours = ld.openingHoursSpecification || ld.openingHours || []
      if (Array.isArray(hours)) {
        for (const h of hours) {
          if (h.dayOfWeek && (h.opens || h.opens === '00:00')) {
            result.businessHours.push({
              dayOfWeek: Array.isArray(h.dayOfWeek) ? h.dayOfWeek[0] : h.dayOfWeek,
              opens: h.opens || 'Closed',
              closes: h.closes || 'Closed',
            })
          }
        }
      }
    }

    // Services from Service schema
    if (type === 'Service' || type?.includes?.('Service')) {
      result.services.push({
        name: ld.name || '',
        description: ld.description || '',
        price: ld.offers?.price || ld.offers?.priceRange || undefined,
      })
    }

    // Reviews from Review schema
    if (type === 'Review' || type?.includes?.('Review')) {
      result.reviews.push({
        author: ld.author?.name || ld.author || 'Client',
        text: ld.reviewBody || ld.reviewBody?.text || ld.description || '',
        rating: ld.reviewRating?.ratingValue || ld.reviewRating?.bestRating || 5,
      })
    }

    // Aggregate rating
    if (ld.aggregateRating) {
      const rating = ld.aggregateRating
      // Store as metadata, not individual review
    }

    // Team from Organization/Person
    if (type === 'Person' || type?.includes?.('Person')) {
      result.team.push({
        name: ld.name || '',
        role: ld.jobTitle || ld.role || '',
      })
    }
    if (type === 'Organization' || type?.includes?.('Organization')) {
      const employees = ld.employee || ld.member || []
      if (Array.isArray(employees)) {
        for (const emp of employees) {
          if (emp.name) {
            result.team.push({ name: emp.name, role: emp.jobTitle || emp.role || '' })
          }
        }
      }
    }
  }

  return result
}

// ============================================
// BUSINESS HOURS EXTRACTION FROM HTML
// ============================================
export function extractBusinessHours(markdown: string): Array<{ dayOfWeek: string; opens: string; closes: string }> {
  const hours: Array<{ dayOfWeek: string; opens: string; closes: string }> = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Pattern: Monday: 8:00 AM - 5:00 PM
  const timePattern = new RegExp(
    `(?:${days.join('|')})[^:]*:\s*(\\d{1,2}:?\\d{0,2})\\s*(?:AM|PM)?\\s*[-\\u2013]\\s*(\\d{1,2}:?\\d{0,2})\\s*(?:AM|PM)?`,
    'gi'
  )
  let match
  while ((match = timePattern.exec(markdown)) !== null) {
    const dayMatch = match[0].match(new RegExp(days.join('|'), 'i'))
    if (dayMatch) {
      hours.push({
        dayOfWeek: dayMatch[0],
        opens: match[1],
        closes: match[2],
      })
    }
  }

  // Pattern: Monday - Friday: 8am - 5pm
  const rangePattern = /(\w+day)\s*-\s*(\w+day)\s*:\s*(\d{1,2}(?::\d{2})?)\s*(?:am|pm)?\s*-\s*(\d{1,2}(?::\d{2})?)\s*(?:am|pm)?/gi
  while ((match = rangePattern.exec(markdown)) !== null) {
    const startDay = match[1]
    const endDay = match[2]
    const startIndex = days.findIndex(d => d.toLowerCase() === startDay.toLowerCase())
    const endIndex = days.findIndex(d => d.toLowerCase() === endDay.toLowerCase())
    if (startIndex >= 0 && endIndex >= 0) {
      for (let i = startIndex; i <= endIndex; i++) {
        hours.push({ dayOfWeek: days[i], opens: match[3], closes: match[4] })
      }
    }
  }

  // Pattern: Closed on Sunday
  const closedPattern = /(?:closed|not open)[^\n]*(?:on\s+)?(\w+day)/gi
  while ((match = closedPattern.exec(markdown)) !== null) {
    const day = days.find(d => d.toLowerCase() === match[1].toLowerCase())
    if (day && !hours.find(h => h.dayOfWeek === day)) {
      hours.push({ dayOfWeek: day, opens: 'Closed', closes: 'Closed' })
    }
  }

  return hours
}

export async function loadImagesFromLocalFirecrawlFiles(rootDir: string): Promise<{
  images: string[]
  pages: string[]
  logos: string[]
  pageDetails: Array<{ filename: string; images: string[]; title: string }>
}> {
  const images = new Set<string>()
  const logos = new Set<string>()
  const pages: string[] = []
  const pageDetails: Array<{ filename: string; images: string[]; title: string }> = []

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(rootDir, entry.name)
        const content = await fs.readFile(filePath, 'utf-8')

        // Extract ALL image URLs from this page
        const imagePattern = /https?:\/\/[^\s<>"')]+\.(?:png|jpg|jpeg|webp|gif|svg|avif)(?:\?[^\s<>"')]*)?/gi
        const matches = content.match(imagePattern) || []

        const pageImages: string[] = []

        for (const img of matches) {
          if (isUiOrTrackingImage(img)) continue
          if (isPotentialLogo(img)) {
            logos.add(img)
          } else {
            images.add(img)
            pageImages.push(img)
          }
        }

        // Extract title from first heading or filename
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch
          ? titleMatch[1].trim()
          : entry.name.replace(/\.md$/, '').replace(/[-_]/g, ' ')

        pages.push(entry.name)
        pageDetails.push({
          filename: entry.name,
          images: Array.from(new Set(pageImages)), // Deduplicate per page
          title,
        })
      }
    }

    console.log(`[Scraper] Local files: ${pages.length} pages, ${images.size} images, ${logos.size} logos`)
    console.log(`[Scraper] Images per page: ${pageDetails.map(p => `${p.filename}: ${p.images.length}`).join(', ')}`)
  } catch {
    console.log(`[Scraper] No local Firecrawl files found at ${rootDir}`)
  }

  return {
    images: Array.from(images),
    pages,
    logos: Array.from(logos),
    pageDetails,
  }
}

// ============================================
// Social Media Scraper
// ============================================
export interface SocialMediaData {
  images: string[]
  content: string
  businessInfo: {
    description?: string
    hours?: string
    address?: string
    phone?: string
    rating?: string
  }
}

export async function scrapeSocialMedia(links: {
  facebook?: string
  instagram?: string
  twitter?: string
}): Promise<SocialMediaData> {
  const result: SocialMediaData = {
    images: [],
    content: '',
    businessInfo: {},
  }

  const browser = await getBrowser()

  try {
    // Scrape Facebook if available
    if (links.facebook) {
      try {
        console.log(`[Social Scraper] Scraping Facebook: ${links.facebook}`)
        const fbData = await scrapeFacebookPage(browser, links.facebook)
        result.images.push(...fbData.images)
        result.content += '\n\nFacebook Content:\n' + fbData.content
        if (fbData.description) result.businessInfo.description = fbData.description
        if (fbData.hours) result.businessInfo.hours = fbData.hours
        console.log(`[Social Scraper] Facebook: ${fbData.images.length} images, ${fbData.content.length} chars`)
      } catch (err) {
        console.log(`[Social Scraper] Facebook scraping failed: ${err}`)
      }
    }

    // Scrape Instagram if available
    if (links.instagram) {
      try {
        console.log(`[Social Scraper] Scraping Instagram: ${links.instagram}`)
        const igData = await scrapeInstagramProfile(browser, links.instagram)
        result.images.push(...igData.images)
        result.content += '\n\nInstagram Content:\n' + igData.content
        console.log(`[Social Scraper] Instagram: ${igData.images.length} images, ${igData.content.length} chars`)
      } catch (err) {
        console.log(`[Social Scraper] Instagram scraping failed: ${err}`)
      }
    }

    // Deduplicate images
    result.images = Array.from(new Set(result.images))

  } finally {
    await closeBrowser()
  }

  return result
}

async function scrapeFacebookPage(browser: Browser, url: string): Promise<{
  images: string[]
  content: string
  description?: string
  hours?: string
}> {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })

    // Scroll to load more content
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(1000)
    }

    // Extract images
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs
        .map(img => img.src)
        .filter(src => src && src.startsWith('http') && !src.includes('static') && !src.includes('icon'))
    })

    // Extract text content
    const content = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, span, div'))
      return textElements
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 10)
        .slice(0, 50)
        .join('\n')
    })

    // Extract business description
    const description = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]')
      return meta?.getAttribute('content') || ''
    })

    await page.close()

    return { images, content, description }
  } finally {
    await context.close()
  }
}

async function scrapeInstagramProfile(browser: Browser, url: string): Promise<{
  images: string[]
  content: string
}> {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })

    // Scroll to load more posts
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(1000)
    }

    // Extract images from posts
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs
        .map(img => img.src)
        .filter(src => src && src.startsWith('http') && !src.includes('static') && !src.includes('profile'))
    })

    // Extract bio and captions
    const content = await page.evaluate(() => {
      const bio = document.querySelector('header section')?.textContent || ''
      const captions = Array.from(document.querySelectorAll('article span'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 5)
        .slice(0, 30)
        .join('\n')
      return bio + '\n\nPost Captions:\n' + captions
    })

    await page.close()

    return { images, content }
  } finally {
    await context.close()
  }
}
