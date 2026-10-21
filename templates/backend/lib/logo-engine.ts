/**
 * Deterministic logo engine.
 *
 * Generates a complete brand lockup set (horizontal, stacked, mark) as SVG
 * from site-config data. Identical inputs always produce byte-identical SVG,
 * so regenerating a site never changes its logo.
 *
 * Colour priority (caller resolves):
 *   uploaded logo colours > scraped logo colours > theme.palette > archetype
 */

export interface LogoPalette {
  primary: string
  secondary?: string
  accent: string
  bg?: string
  text?: string
}

export interface LogoInput {
  businessName: string
  industry?: string
  tagline?: string
  palette: LogoPalette
  /** Serif or sans — matches the site's heading font family */
  fontClass?: 'serif' | 'sans'
}

export interface LogoSet {
  mark: string
  horizontal: string
  stacked: string
  faviconSvg: string
  /** Hex background the mark is designed to sit on */
  markBg: string
  /** Accent/foreground hex used inside the mark */
  markFg: string
}

/* ── Determinism ────────────────────────────────────────────────────────── */

/** Small, stable string hash (FNV-1a). Same input ⇒ same number, always. */
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/* ── Name helpers ───────────────────────────────────────────────────────── */

/** "Mamma & Mia Cakes And Catering" → "Mamma & Mia" (leading name phrase) */
function primaryName(businessName: string): string {
  const parts = businessName.trim().split(/\s+/)
  if (parts.length <= 2) return businessName.trim()
  // Keep up to 3 leading words if one of them is a connector
  const connectors = new Set(['&', 'and', 'And', '+'])
  let out: string[] = []
  for (let i = 0; i < Math.min(parts.length, 4); i++) {
    out.push(parts[i])
    if (out.length >= 2 && !connectors.has(parts[i]) && out.length >= 3) break
  }
  // Prefer "Mamma & Mia" style: first word + connector + second content word
  const first = parts[0]
  if (parts.length >= 3 && connectors.has(parts[1])) {
    return `${first} ${parts[1]} ${parts[2]}`
  }
  return out.join(' ') || businessName.trim()
}

/** "Mamma & Mia Cakes And Catering" → "CAKES & CATERING" */
function secondaryName(businessName: string, primary: string): string {
  const remainder = businessName.trim().replace(primary, '').trim()
  return remainder.replace(/\s+/g, ' ').toUpperCase()
}

/** Monogram letters: "Mamma & Mia" → "M&M", "Tammy's Sticker Shop" → "TS" */
function monogram(name: string): string {
  const cleaned = name.replace(/['’]/g, '')
  const words = cleaned
    .split(/\s+/)
    .filter((w) => w && w !== '&' && w.toLowerCase() !== 'and')
  if (words.length === 0) return name.slice(0, 2).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  // Two or more words: take first letter of first two content words
  const letters = words.slice(0, 2).map((w) => w[0].toUpperCase())
  // If the original had an explicit ampersand between them, keep it
  if (/\s&\s/.test(name)) return `${letters[0]}&${letters[1]}`
  return letters.join('')
}

/* ── Mark shapes (selected by seed) ─────────────────────────────────────── */

type ShapeFn = (fg: string, bg: string, mono: string, accent: string) => string

const SHAPES: ShapeFn[] = [
  // 0 — Double-ring badge with cardinal dots
  (fg, bg, mono, accent) => `
    <circle cx="128" cy="128" r="122" fill="${bg}" stroke="${accent}" stroke-width="7"/>
    <circle cx="128" cy="128" r="107" fill="none" stroke="${fg}" stroke-width="2.5"/>
    <circle cx="128" cy="26" r="5" fill="${accent}"/>
    <circle cx="128" cy="230" r="5" fill="${accent}"/>
    <circle cx="26" cy="128" r="5" fill="${accent}"/>
    <circle cx="230" cy="128" r="5" fill="${accent}"/>
    <text x="128" y="152" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,

  // 1 — Soft rounded square with inner hairline
  (fg, bg, mono, accent) => `
    <rect x="6" y="6" width="244" height="244" rx="54" fill="${bg}" stroke="${accent}" stroke-width="7"/>
    <rect x="24" y="24" width="208" height="208" rx="40" fill="none" stroke="${fg}" stroke-width="2.5"/>
    <text x="128" y="152" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,

  // 2 — Shield / crest
  (fg, bg, mono, accent) => `
    <path d="M128 10 L232 48 V150 C232 205 182 238 128 248 C74 238 24 205 24 150 V48 Z" fill="${bg}" stroke="${accent}" stroke-width="7"/>
    <path d="M128 28 L216 60 V148 C216 194 174 222 128 232 C82 222 40 194 40 148 V60 Z" fill="none" stroke="${fg}" stroke-width="2.5"/>
    <text x="128" y="150" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,

  // 3 — Hexagon
  (fg, bg, mono, accent) => `
    <path d="M128 8 L236 70 V186 L128 248 L20 186 V70 Z" fill="${bg}" stroke="${accent}" stroke-width="7"/>
    <path d="M128 28 L218 80 V176 L128 228 L38 176 V80 Z" fill="none" stroke="${fg}" stroke-width="2.5"/>
    <text x="128" y="152" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,

  // 4 — Arch / doorway (works well for hospitality)
  (fg, bg, mono, accent) => `
    <path d="M20 240 V110 A108 108 0 0 1 236 110 V240 Z" fill="${bg}" stroke="${accent}" stroke-width="7"/>
    <path d="M42 240 V112 A86 86 0 0 1 214 112 V240" fill="none" stroke="${fg}" stroke-width="2.5"/>
    <text x="128" y="176" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,

  // 5 — Ring with wheat/leaf flourishes at top and bottom
  (fg, bg, mono, accent) => `
    <circle cx="128" cy="128" r="112" fill="${bg}" stroke="${accent}" stroke-width="6"/>
    <circle cx="128" cy="128" r="98" fill="none" stroke="${fg}" stroke-width="2"/>
    <g fill="${accent}">
      <path d="M128 14 C122 26 122 36 128 46 C134 36 134 26 128 14 Z"/>
      <path d="M128 242 C122 230 122 220 128 210 C134 220 134 230 128 242 Z"/>
      <path d="M14 128 C26 122 36 122 46 128 C36 134 26 134 14 128 Z"/>
      <path d="M242 128 C230 122 220 122 210 128 C220 134 230 134 242 128 Z"/>
    </g>
    <text x="128" y="150" text-anchor="middle" font-family="Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif" font-size="${monoFontSize(mono)}" font-weight="600" letter-spacing="1" fill="${fg}">${mono}</text>`,
]

/* ── Assembly ───────────────────────────────────────────────────────────── */

function buildMark(palette: LogoPalette, mono: string, shapeIndex: number): { svg: string; bg: string; fg: string } {
  const bg = palette.primary
  const fg = palette.accent
  const accent = palette.secondary || palette.accent
  const shape = SHAPES[shapeIndex % SHAPES.length]
  // Monogram goes inside SVG text — must be XML-escaped ("M&M" has a bare &)
  const inner = shape(fg, bg, escapeXml(mono), accent)
  return {
    bg,
    fg,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="Brand mark">${inner}</svg>`,
  }
}

function serifStack(): string {
  return "Georgia,'Palatino Linotype','Book Antiqua',Palatino,serif"
}

/**
 * Monogram font-size chosen so the glyphs sit inside the shape frame
 * without textLength distortion (spacingAndGlyphs squishes serifs).
 */
function monoFontSize(mono: string): number {
  const n = mono.length
  if (n <= 1) return 96
  if (n === 2) return 78
  if (n === 3) return 60
  return 48
}

/**
 * Generate the full logo set. Deterministic for identical input.
 */
export function generateLogoSet(input: LogoInput): LogoSet {
  const { businessName, palette } = input
  const primary = primaryName(businessName)
  const secondary = secondaryName(businessName, primary) || (input.tagline || '').toUpperCase()
  const mono = monogram(primary)

  const seed = hash(
    `${businessName}|${input.industry || ''}|${palette.primary}|${palette.accent}`
  )
  const shapeIndex = seed % SHAPES.length

  const mark = buildMark(palette, mono, shapeIndex)
  const serif = serifStack()
  const bgLight = palette.bg || '#ffffff'
  const ink = palette.text || palette.primary

  /* ── Horizontal lockup: mark + wordmark side by side ── */
  const horizontal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 256" width="920" height="256" role="img" aria-label="${escapeXml(businessName)}">
  <rect width="920" height="256" fill="${bgLight}"/>
  <g transform="translate(0,0)">${mark.svg.replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>')}</g>
  <text x="286" y="118" font-family="${serif}" font-size="74" font-weight="600" letter-spacing="1.5" fill="${palette.primary}">${escapeXml(primary)}</text>
  ${secondary ? `<text x="290" y="172" font-family="${serif}" font-size="27" font-weight="500" letter-spacing="7.5" fill="${ink}" opacity="0.78">${escapeXml(secondary)}</text>` : ''}
  <rect x="288" y="134" width="120" height="2.5" fill="${palette.accent}"/>
</svg>`

  /* ── Stacked lockup: mark above wordmark ── */
  const stacked = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 460" width="620" height="460" role="img" aria-label="${escapeXml(businessName)}">
  <rect width="620" height="460" fill="${bgLight}"/>
  <g transform="translate(182,10)">${mark.svg.replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>')}</g>
  <text x="310" y="332" text-anchor="middle" font-family="${serif}" font-size="62" font-weight="600" letter-spacing="1.5" fill="${palette.primary}">${escapeXml(primary)}</text>
  <rect x="250" y="350" width="120" height="2.5" fill="${palette.accent}"/>
  ${secondary ? `<text x="310" y="396" text-anchor="middle" font-family="${serif}" font-size="23" font-weight="500" letter-spacing="7" fill="${ink}" opacity="0.78">${escapeXml(secondary)}</text>` : ''}
</svg>`

  /* ── Favicon: simplified mark — no inner hairline, bolder monogram ── */
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="${escapeXml(mono)}">
  <rect x="4" y="4" width="248" height="248" rx="56" fill="${palette.primary}"/>
  <rect x="18" y="18" width="220" height="220" rx="44" fill="none" stroke="${palette.accent}" stroke-width="9"/>
  <text x="128" y="158" text-anchor="middle" font-family="${serif}" font-size="${monoFontSize(mono) + 20}" font-weight="700" letter-spacing="1" fill="${palette.accent}">${escapeXml(mono)}</text>
</svg>`

  return {
    mark: mark.svg,
    horizontal,
    stacked,
    faviconSvg,
    markBg: mark.bg,
    markFg: mark.fg,
  }
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export { primaryName, secondaryName, monogram }
