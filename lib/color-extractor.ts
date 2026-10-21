import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
// @ts-ignore
const ColorThief = require('colorthief')

export interface ExtractedColors {
  primaryHex: string
  secondaryHex: string
  accentHex: string
  bgHex: string
}

// Photography-specific brand defaults
const PHOTOGRAPHY_DEFAULTS = {
  primary: '#111827',   // Charcoal
  secondary: '#D97706', // Warm Gold
  accent: '#0D9488',   // Teal
  bg: '#09090b',       // Dark background
}

// Business type color mappings
const BUSINESS_TYPE_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  wedding: { primary: '#d4a5a5', secondary: '#9e7b7b', accent: '#c9b037' },
  photography: PHOTOGRAPHY_DEFAULTS,
  automotive: { primary: '#2d3436', secondary: '#636e72', accent: '#e74c3c' },
  restaurant: { primary: '#c0392b', secondary: '#e74c3c', accent: '#f39c12' },
  bakery: { primary: '#8B4513', secondary: '#D2691E', accent: '#F5DEB3' },
  medical: { primary: '#3498db', secondary: '#2980b9', accent: '#1abc9c' },
  dental: { primary: '#0077B6', secondary: '#00B4D8', accent: '#48CAE4' },
  legal: { primary: '#2c3e50', secondary: '#34495e', accent: '#c0392b' },
  construction: { primary: '#e67e22', secondary: '#d35400', accent: '#f1c40f' },
  retail: { primary: '#9b59b6', secondary: '#8e44ad', accent: '#e74c3c' },
  fitness: { primary: '#27ae60', secondary: '#2ecc71', accent: '#f39c12' },
  beauty: { primary: '#e91e63', secondary: '#f06292', accent: '#9c27b0' },
  salon: { primary: '#C97B84', secondary: '#D4A0A7', accent: '#E8C4C8' },
  hotel: { primary: '#1A365D', secondary: '#D69E2E', accent: '#38A169' },
  education: { primary: '#1D4ED8', secondary: '#3B82F6', accent: '#F59E0B' },
  plumbing: { primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA' },
  electrical: { primary: '#F59E0B', secondary: '#D97706', accent: '#EF4444' },
  landscaping: { primary: '#166534', secondary: '#22C55E', accent: '#84CC16' },
  cleaning: { primary: '#0EA5E9', secondary: '#38BDF8', accent: '#14B8A6' },
  hvac: { primary: '#1E40AF', secondary: '#3B82F6', accent: '#F97316' },
  roofing: { primary: '#475569', secondary: '#64748B', accent: '#EF4444' },
  accounting: { primary: '#1E3A5F', secondary: '#1E40AF', accent: '#D97706' },
  realestate: { primary: '#1A365D', secondary: '#2B6CB0', accent: '#D97706' },
  spa: { primary: '#7C3AED', secondary: '#A78BFA', accent: '#C4B5FD' },
  veterinary: { primary: '#059669', secondary: '#34D399', accent: '#6EE7B7' },
  pharmacy: { primary: '#0077B6', secondary: '#00B4D8', accent: '#22C55E' },
  security: { primary: '#1E3A5F', secondary: '#2B6CB0', accent: '#D4AF37' },
  manufacturing: { primary: '#374151', secondary: '#4B5563', accent: '#EF4444' },
  logistics: { primary: '#1F2937', secondary: '#374151', accent: '#F59E0B' },
  farm: { primary: '#556B2F', secondary: '#6B8E23', accent: '#D4AF37' },
  saas: { primary: '#6366F1', secondary: '#4F46E5', accent: '#06B6D4' },
  default: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b' },
}

// Custom fetch headers to avoid CORS issues
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/png,image/jpeg,image/webp,image/svg+xml,*/*',
}

const GENERIC_COLORS = new Set([
  '#ffffff', '#fff', '#000', '#000000',
  '#fafafa', '#f5f5f5', '#eeeeee', '#dddddd',
  '#1a1a1a', '#333333', '#666666', '#999999',
  'transparent', 'inherit', 'none'
])

function inferBusinessType(url: string): string {
  const lower = url.toLowerCase()
  
  if (lower.includes('wedding') || lower.includes('bride')) return 'wedding'
  if (lower.includes('photo')) return 'photography'
  if (lower.includes('auto') || lower.includes('mechanic') || lower.includes('car')) return 'automotive'
  if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food')) return 'restaurant'
  if (lower.includes('bakery') || lower.includes('bake') || lower.includes('bread') || lower.includes('cake')) return 'bakery'
  if (lower.includes('medical') || lower.includes('clinic') || lower.includes('doctor')) return 'medical'
  if (lower.includes('dental') || lower.includes('dentist')) return 'dental'
  if (lower.includes('legal') || lower.includes('law') || lower.includes('attorney')) return 'legal'
  if (lower.includes('construct') || lower.includes('building') || lower.includes('renovate')) return 'construction'
  if (lower.includes('shop') || lower.includes('store') || lower.includes('retail')) return 'retail'
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('train')) return 'fitness'
  if (lower.includes('beauty') || lower.includes('salon') || lower.includes('spa')) return 'beauty'
  if (lower.includes('hotel') || lower.includes('lodge') || lower.includes('guest')) return 'hotel'
  if (lower.includes('school') || lower.includes('academy') || lower.includes('education')) return 'education'
  if (lower.includes('plumb')) return 'plumbing'
  if (lower.includes('electric')) return 'electrical'
  if (lower.includes('landscap') || lower.includes('garden')) return 'landscaping'
  if (lower.includes('clean')) return 'cleaning'
  if (lower.includes('hvac') || lower.includes('aircon') || lower.includes('heating')) return 'hvac'
  if (lower.includes('roof')) return 'roofing'
  if (lower.includes('account') || lower.includes('tax') || lower.includes('bookkeep')) return 'accounting'
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('realtor')) return 'realestate'
  if (lower.includes('vet') || lower.includes('animal') || lower.includes('pet')) return 'veterinary'
  if (lower.includes('pharm')) return 'pharmacy'
  if (lower.includes('secur') || lower.includes('guard') || lower.includes('alarm')) return 'security'
  if (lower.includes('manufact') || lower.includes('factory')) return 'manufacturing'
  if (lower.includes('logistic') || lower.includes('freight') || lower.includes('transport')) return 'logistics'
  if (lower.includes('farm') || lower.includes('agri')) return 'farm'
  if (lower.includes('software') || lower.includes('saas') || lower.includes('tech')) return 'saas'
  
  return 'default'
}

function isDarkColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  }
  return false
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/**
 * Filter out transparent, white canvas background, pure black, and gray noise pixels
 */
async function getFilteredPixelsImage(buffer: Buffer): Promise<Buffer | null> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    if (!metadata.width || !metadata.height) return null

    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
    const channels = info.channels
    const filteredPixels: number[] = []

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = channels === 4 ? data[i + 3] : 255

      // 1. Skip transparent
      if (a < 50) continue

      // 2. Skip white canvas/off-white background
      if (r > 235 && g > 235 && b > 235) continue

      // 3. Skip pure black
      if (r < 20 && g < 20 && b < 20) continue

      // 4. Skip low-saturation gray noise
      const [h, s, l] = rgbToHsl(r, g, b)
      if (s < 10) continue

      filteredPixels.push(r, g, b)
    }

    if (filteredPixels.length === 0) return null

    // Create a new raw pixel layout and format as PNG buffer for colorthief clustering
    const width = Math.min(Math.floor(filteredPixels.length / 3), 100)
    const height = Math.ceil((filteredPixels.length / 3) / width)
    const pixelCount = width * height
    const finalBuffer = Buffer.alloc(pixelCount * 3, 235)

    for (let i = 0; i < filteredPixels.length && i < finalBuffer.length; i++) {
      finalBuffer[i] = filteredPixels[i]
    }

    return await sharp(finalBuffer, {
      raw: {
        width,
        height,
        channels: 3
      }
    }).png().toBuffer()
  } catch (err) {
    console.log('[Color Extractor] Sharp pixel prefiltering failed:', err)
    return null
  }
}

/**
 * Extract dominant colors using colorthief from the image buffer
 */
async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: FETCH_HEADERS,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.log(`[Color Extractor] Failed to fetch image: ${response.status}`)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    let buffer: any = Buffer.from(arrayBuffer)
    
    // SVG extraction is still performed as XML text match
    if (imageUrl.toLowerCase().endsWith('.svg')) {
      const colors = extractColorsFromSVG(buffer.toString('utf-8'))
      if (colors) return colors
    }

    // Pre-filter pixels to ignore white/black canvas and gray noise
    const filteredBuffer = await getFilteredPixelsImage(buffer)
    if (filteredBuffer) {
      buffer = filteredBuffer
    }
    
    // Use Colorthief palette extraction
    const palette = await ColorThief.getPalette(buffer, 10)
    if (palette && palette.length >= 2) {
      const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map(x => {
          const hex = Math.round(x || 0).toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('')
      }

      const getRgb = (color: any): [number, number, number] => {
        if (Array.isArray(color)) {
          return [color[0], color[1], color[2]]
        }
        if (color && typeof color === 'object') {
          const r = color._r !== undefined ? color._r : (color.r !== undefined ? color.r : 0)
          const g = color._g !== undefined ? color._g : (color.g !== undefined ? color.g : 0)
          const b = color._b !== undefined ? color._b : (color.b !== undefined ? color.b : 0)
          return [r, g, b]
        }
        return [0, 0, 0]
      }

      // Convert clusters to HSL and sort by saturation to prioritize colors > 35% saturation
      const mappedPalette = palette.map((color: any) => {
        const rgb = getRgb(color)
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
        return {
          rgb,
          hsl,
          hex: rgbToHex(rgb[0], rgb[1], rgb[2])
        }
      })

      const saturatedColors = mappedPalette.filter((c: any) => c.hsl[1] > 35)
      const mutedColors = mappedPalette.filter((c: any) => c.hsl[1] <= 35)

      // Saturated colors sorted desc by saturation, then muted colors
      const orderedPalette = [
        ...saturatedColors.sort((a: any, b: any) => b.hsl[1] - a.hsl[1]),
        ...mutedColors.sort((a: any, b: any) => b.hsl[1] - a.hsl[1])
      ]

      const primaryHex = orderedPalette[0].hex
      const secondaryHex = orderedPalette[1] ? orderedPalette[1].hex : orderedPalette[0].hex
      const accentHex = orderedPalette[2] ? orderedPalette[2].hex : secondaryHex
        
      return {
        primaryHex,
        secondaryHex,
        accentHex,
        bgHex: '#09090b'
      }
    }
    
    return null
  } catch (error) {
    console.log(`[Color Extractor] Colorthief extraction failed:`, error instanceof Error ? error.message : 'Unknown')
    return null
  }
}

function extractColorsFromSVG(svgContent: string): ExtractedColors | null {
  try {
    const colors: string[] = []
    
    // Extract fill colors
    const fillMatches = svgContent.match(/fill="([^"]+)"/g) || []
    for (const match of fillMatches) {
      const color = match.match(/fill="([^"]+)"/)?.[1]
      if (color && color !== 'none' && (color.startsWith('#') || color.startsWith('rgb'))) {
        const hex = parseColorToHex(color)
        if (hex) colors.push(hex)
      }
    }
    
    // Extract stroke colors
    const strokeMatches = svgContent.match(/stroke="([^"]+)"/g) || []
    for (const match of strokeMatches) {
      const color = match.match(/stroke="([^"]+)"/)?.[1]
      if (color && color !== 'none' && (color.startsWith('#') || color.startsWith('rgb'))) {
        const hex = parseColorToHex(color)
        if (hex) colors.push(hex)
      }
    }
    
    // Find hex codes directly
    const hexMatches = svgContent.match(/#[0-9a-fA-F]{6}/g) || []
    colors.push(...hexMatches)
    
    // Also check for named colors in style attributes
    const styleColorMatches = svgContent.match(/color:\s*([^;"]+)/g) || []
    for (const match of styleColorMatches) {
      const color = match.match(/color:\s*([^;"]+)/)?.[1]?.trim()
      if (color) {
        const hex = parseColorToHex(color)
        if (hex) colors.push(hex)
      }
    }
    
    if (colors.length >= 2) {
      return {
        primaryHex: colors[0],
        secondaryHex: colors[1] || colors[0],
        accentHex: colors[2] || colors[1] || colors[0],
        bgHex: '#09090b'
      }
    }
    
    return null
  } catch {
    return null
  }
}

function parseColorToHex(color: string): string | null {
  // Already hex
  if (color.startsWith('#')) {
    if (color.length === 4) {
      // Convert #RGB to #RRGGBB
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
    }
    return color.length === 7 ? color : null
  }
  
  // RGB to hex
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  
  // RGBA to hex (ignore alpha)
  const rgbaMatch = color.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  
  return null
}

// Extract colors from URL path/name (fallback)
function extractColorsFromUrl(url: string): ExtractedColors | null {
  const lower = url.toLowerCase()
  
  const colorMap: Record<string, string> = {
    'blue': '#3498db',
    'red': '#e74c3c',
    'green': '#27ae60',
    'yellow': '#f1c40f',
    'orange': '#e67e22',
    'purple': '#9b59b6',
    'pink': '#e91e63',
    'black': '#1a1a1a',
    'white': '#ffffff',
    'gold': '#c9b037',
    'silver': '#bdc3c7',
    'teal': '#0d9488',
    'charcoal': '#111827',
  }
  
  const foundColors: string[] = []
  
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) {
      foundColors.push(hex)
    }
  }
  
  if (foundColors.length >= 2) {
    return {
      primaryHex: foundColors[0],
      secondaryHex: foundColors[1],
      accentHex: foundColors[2] || foundColors[1],
      bgHex: '#09090b'
    }
  }
  
  return null
}

export async function extractLogoColors(logoUrl: string, businessUrl?: string): Promise<ExtractedColors> {
  console.log(`[Color Extractor] Extracting colors from: ${logoUrl}`)
  
  // Try to extract from image
  if (logoUrl) {
    try {
      const imageColors = await extractColorsFromImage(logoUrl)
      if (imageColors) {
        console.log(`[Color Extractor] Extracted from image:`, imageColors)
        return imageColors
      }
    } catch (error) {
      console.log(`[Color Extractor] Image extraction failed:`, error instanceof Error ? error.message : 'Unknown')
    }
    
    // Try URL-based extraction
    try {
      const urlColors = extractColorsFromUrl(logoUrl)
      if (urlColors) {
        console.log(`[Color Extractor] Extracted from URL:`, urlColors)
        return urlColors
      }
    } catch {
      // Ignore
    }
  }
  
  // Fallback: Use business type detection
  const businessType = businessUrl ? inferBusinessType(businessUrl) : 'photography'
  const typeColors = BUSINESS_TYPE_COLORS[businessType] || BUSINESS_TYPE_COLORS.default
  
  console.log(`[Color Extractor] Using ${businessType} defaults:`, typeColors)
  
  return {
    primaryHex: typeColors.primary,
    secondaryHex: typeColors.secondary,
    accentHex: typeColors.accent,
    bgHex: 'transparent' // Don't assume dark - let industry archetype decide
  }
}

// ============================================
// Merged Brand Palette Synthesizer
// ============================================
export interface CssColorsInput {
  dominantCssPrimary?: string
  dominantCssSecondary?: string
  dominantCssBg?: string
}

export interface FinalBrandPalette {
  primary: string
  secondary: string
  accent: string
  bg: string
}

/**
 * Generate a cohesive HSL-based palette from the hash of a string
 */
function generateColorsFromHash(str: string): FinalBrandPalette {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const h1 = Math.abs(hash % 360)
  const h2 = (h1 + 40) % 360 // Complementary / Analogous color
  
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = (s * Math.min(l, 1 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }
  
  return {
    primary: hslToHex(h1, 75, 50),
    secondary: hslToHex(h2, 70, 45),
    accent: hslToHex((h1 + 180) % 360, 80, 55),
    bg: '#09090b'
  }
}

export function getFinalBrandPalette(
  logoColors: ExtractedColors | null,
  cssColors: CssColorsInput | null,
  businessName?: string,
  industryPalette?: { primary: string; secondary: string; accent: string; bg?: string }
): FinalBrandPalette {
  console.log(`[Color Extractor] Merging logo and CSS colors...`)
  
  // Generate base dynamic palette from hash of businessName to ensure every company is unique
  const nameToHash = businessName || 'Sitegeist'
  const result = generateColorsFromHash(nameToHash)
  
  // Priority 0: If industry palette exists and no logo colors, use industry palette as base
  // This ensures industry-appropriate colors instead of random hash-derived colors
  if (industryPalette && !logoColors && !cssColors?.dominantCssPrimary) {
    result.primary = industryPalette.primary
    result.secondary = industryPalette.secondary
    result.accent = industryPalette.accent
    if (industryPalette.bg) result.bg = industryPalette.bg
    console.log(`[Color Extractor] Using industry palette: ${result.primary}`)
  }
  
  // Priority 1: If CSS colors exist, use them
  if (cssColors?.dominantCssPrimary) {
    result.primary = cssColors.dominantCssPrimary
    if (cssColors.dominantCssSecondary) {
      result.secondary = cssColors.dominantCssSecondary
    }
    if (cssColors.dominantCssBg) {
      result.bg = cssColors.dominantCssBg
    }
  }

  // Priority 2: If logo colors exist, use them (logo has the highest branding priority)
  if (logoColors) {
    result.primary = logoColors.primaryHex
    result.secondary = logoColors.secondaryHex
    result.accent = logoColors.accentHex
    // Only use logo bg if it's a REAL color, not transparent or default dark
    if (logoColors.bgHex && logoColors.bgHex !== '#09090b' && logoColors.bgHex !== 'transparent') {
      result.bg = logoColors.bgHex
    }
  }

  // Priority 3: Use CSS background if available
  if (cssColors?.dominantCssBg) {
    const existingBg = result.bg.toLowerCase()
    const cssBg = cssColors.dominantCssBg.toLowerCase()
    
    if (cssBg !== existingBg && !GENERIC_COLORS.has(cssBg)) {
      result.bg = cssColors.dominantCssBg
      console.log(`[Color Extractor] CSS Background override: ${result.bg}`)
    }
  }
  
  // If bg is still the hash-generated default, mark it as 'needs industry decision'
  // The prompt builder will use the industry archetype to set the final bg
  if (result.bg === '#09090b') {
    console.log(`[Color Extractor] Background is default dark - industry archetype will decide theme mode`)
  }
  
  console.log(`[Color Extractor] Final palette:`, result)
  
  return result
}