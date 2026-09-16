/**
 * Design Seed System
 * Generates unique visual variations for each business
 * Ensures no two websites look the same
 * Archetype-aware: biases selection toward industry-appropriate values
 */

export interface DesignSeed {
  id: string
  layoutStyle: 'editorial' | 'minimal' | 'bold' | 'elegant' | 'playful' | 'industrial'
  gridDensity: 'sparse' | 'balanced' | 'dense' | 'masonry'
  headerStyle: 'transparent' | 'solid' | 'gradient' | 'split'
  cardGeometry: 'rounded' | 'sharp' | 'pill' | 'organic'
  animationEasing: 'smooth' | 'snappy' | 'bouncy' | 'dramatic'
  sectionOrder: number[]
  spacingScale: 'compact' | 'comfortable' | 'spacious'
  imageAspectRatio: 'mixed' | 'square' | 'portrait' | 'landscape'
  colorIntensity: 'muted' | 'vibrant' | 'neon' | 'pastel'
  densityProfile: 'airy' | 'balanced' | 'dense'
  decorativeIntensity: 'minimal' | 'subtle' | 'expressive'
  typographyPairing: 'editorial-serif' | 'modern-sans' | 'bold-condensed' | 'elegant-mix' | 'friendly-rounded' | 'technical-mono'
  motionIntensity: 'subtle' | 'moderate' | 'expressive'
  staggerStrength: 'none' | 'light' | 'medium'
  artDirection: 'editorial' | 'minimal' | 'bold' | 'cinematic' | 'warm-organic'
}

// Archetype constraints — preferred and excluded values per industry
interface ArchetypeConstraints {
  preferredLayouts: string[]
  excludedLayouts: string[]
  preferredTypography: string[]
  excludedTypography: string[]
  preferredArtDirection: string[]
  excludedArtDirection: string[]
  preferredColorIntensity: string[]
  excludedColorIntensity: string[]
  preferredDecorative: string[]
  excludedDecorative: string[]
  preferredMotion: string[]
  excludedMotion: string[]
}

const ARCHETYPE_SEED_CONSTRAINTS: Record<string, ArchetypeConstraints> = {
  'hospitality-food': {
    preferredLayouts: ['editorial', 'elegant', 'playful'],
    excludedLayouts: ['industrial'],
    preferredTypography: ['editorial-serif', 'elegant-mix', 'friendly-rounded'],
    excludedTypography: ['bold-condensed', 'technical-mono'],
    preferredArtDirection: ['warm-organic', 'editorial', 'cinematic'],
    excludedArtDirection: ['minimal', 'bold'],
    preferredColorIntensity: ['vibrant', 'pastel'],
    excludedColorIntensity: ['neon', 'muted'],
    preferredDecorative: ['subtle', 'expressive'],
    excludedDecorative: ['minimal'],
    preferredMotion: ['subtle', 'moderate'],
    excludedMotion: ['expressive'],
  },
  'medical-healthcare': {
    preferredLayouts: ['minimal', 'elegant', 'editorial'],
    excludedLayouts: ['playful', 'industrial'],
    preferredTypography: ['modern-sans', 'elegant-mix'],
    excludedTypography: ['bold-condensed', 'friendly-rounded'],
    preferredArtDirection: ['minimal', 'editorial', 'cinematic'],
    excludedArtDirection: ['bold'],
    preferredColorIntensity: ['muted', 'pastel'],
    excludedColorIntensity: ['neon', 'vibrant'],
    preferredDecorative: ['minimal', 'subtle'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle'],
    excludedMotion: ['expressive'],
  },
  'professional-corporate': {
    preferredLayouts: ['editorial', 'minimal', 'elegant'],
    excludedLayouts: ['playful', 'industrial'],
    preferredTypography: ['editorial-serif', 'modern-sans', 'elegant-mix'],
    excludedTypography: ['friendly-rounded', 'technical-mono'],
    preferredArtDirection: ['editorial', 'minimal', 'cinematic'],
    excludedArtDirection: ['bold'],
    preferredColorIntensity: ['muted', 'vibrant'],
    excludedColorIntensity: ['neon', 'pastel'],
    preferredDecorative: ['minimal', 'subtle'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle', 'moderate'],
    excludedMotion: ['expressive'],
  },
  'trades-field-services': {
    preferredLayouts: ['bold', 'industrial', 'minimal'],
    excludedLayouts: ['playful', 'elegant'],
    preferredTypography: ['bold-condensed', 'modern-sans'],
    excludedTypography: ['editorial-serif', 'elegant-mix'],
    preferredArtDirection: ['bold', 'minimal', 'cinematic'],
    excludedArtDirection: ['warm-organic'],
    preferredColorIntensity: ['vibrant', 'muted'],
    excludedColorIntensity: ['pastel', 'neon'],
    preferredDecorative: ['minimal', 'subtle'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['moderate', 'expressive'],
    excludedMotion: ['subtle'],
  },
  'retail-commerce': {
    preferredLayouts: ['editorial', 'bold', 'playful'],
    excludedLayouts: ['industrial'],
    preferredTypography: ['modern-sans', 'friendly-rounded', 'editorial-serif'],
    excludedTypography: ['technical-mono'],
    preferredArtDirection: ['editorial', 'bold', 'warm-organic'],
    excludedArtDirection: ['minimal'],
    preferredColorIntensity: ['vibrant', 'pastel'],
    excludedColorIntensity: ['muted'],
    preferredDecorative: ['subtle', 'expressive'],
    excludedDecorative: ['minimal'],
    preferredMotion: ['moderate', 'expressive'],
    excludedMotion: ['subtle'],
  },
  'architecture-construction': {
    preferredLayouts: ['editorial', 'minimal', 'bold'],
    excludedLayouts: ['playful'],
    preferredTypography: ['editorial-serif', 'modern-sans', 'bold-condensed'],
    excludedTypography: ['friendly-rounded'],
    preferredArtDirection: ['editorial', 'cinematic', 'bold'],
    excludedArtDirection: ['warm-organic'],
    preferredColorIntensity: ['muted', 'vibrant'],
    excludedColorIntensity: ['neon', 'pastel'],
    preferredDecorative: ['subtle', 'minimal'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle', 'moderate'],
    excludedMotion: ['expressive'],
  },
  'logistics-freight': {
    preferredLayouts: ['minimal', 'bold', 'industrial'],
    excludedLayouts: ['playful', 'elegant'],
    preferredTypography: ['modern-sans', 'bold-condensed'],
    excludedTypography: ['editorial-serif', 'friendly-rounded'],
    preferredArtDirection: ['minimal', 'bold', 'cinematic'],
    excludedArtDirection: ['warm-organic'],
    preferredColorIntensity: ['muted', 'vibrant'],
    excludedColorIntensity: ['pastel', 'neon'],
    preferredDecorative: ['minimal'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle'],
    excludedMotion: ['expressive'],
  },
  'heavy-industrial': {
    preferredLayouts: ['industrial', 'bold', 'minimal'],
    excludedLayouts: ['playful', 'elegant'],
    preferredTypography: ['bold-condensed', 'technical-mono'],
    excludedTypography: ['editorial-serif', 'friendly-rounded'],
    preferredArtDirection: ['bold', 'minimal', 'cinematic'],
    excludedArtDirection: ['warm-organic'],
    preferredColorIntensity: ['muted'],
    excludedColorIntensity: ['pastel', 'neon'],
    preferredDecorative: ['minimal'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle'],
    excludedMotion: ['expressive'],
  },
  'agricultural-industrial': {
    preferredLayouts: ['minimal', 'bold', 'editorial'],
    excludedLayouts: ['playful'],
    preferredTypography: ['modern-sans', 'bold-condensed'],
    excludedTypography: ['technical-mono'],
    preferredArtDirection: ['minimal', 'warm-organic', 'editorial'],
    excludedArtDirection: ['cinematic'],
    preferredColorIntensity: ['muted', 'vibrant'],
    excludedColorIntensity: ['neon'],
    preferredDecorative: ['minimal', 'subtle'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle', 'moderate'],
    excludedMotion: ['expressive'],
  },
  'nonprofit-humanitarian': {
    preferredLayouts: ['editorial', 'elegant', 'minimal'],
    excludedLayouts: ['industrial', 'playful'],
    preferredTypography: ['editorial-serif', 'elegant-mix', 'modern-sans'],
    excludedTypography: ['bold-condensed', 'technical-mono'],
    preferredArtDirection: ['warm-organic', 'editorial', 'cinematic'],
    excludedArtDirection: ['bold'],
    preferredColorIntensity: ['muted', 'vibrant'],
    excludedColorIntensity: ['neon'],
    preferredDecorative: ['subtle', 'minimal'],
    excludedDecorative: ['expressive'],
    preferredMotion: ['subtle', 'moderate'],
    excludedMotion: ['expressive'],
  },
}

// Map archetype IDs to constraint keys
// e.g., 'bakery' → 'hospitality-food', 'security' → 'heavy-industrial'
export function getArchetypeConstraintKey(archetypeId: string): string {
  const mapping: Record<string, string> = {
    'bakery': 'hospitality-food', 'restaurant': 'hospitality-food', 'catering': 'hospitality-food',
    'hotel': 'hospitality-food', 'travel': 'hospitality-food', 'food-processing': 'hospitality-food',
    'medical': 'medical-healthcare', 'dental': 'medical-healthcare', 'pharmacy': 'medical-healthcare',
    'veterinary': 'medical-healthcare', 'therapy': 'medical-healthcare', 'optometry': 'medical-healthcare',
    'chiropractic': 'medical-healthcare', 'dermatology': 'medical-healthcare',
    'legal': 'professional-corporate', 'accounting': 'professional-corporate', 'consulting': 'professional-corporate',
    'insurance': 'professional-corporate', 'engineering': 'professional-corporate', 'calibration': 'professional-corporate',
    'funeral': 'professional-corporate', 'property-management': 'professional-corporate',
    'plumbing': 'trades-field-services', 'electrical': 'trades-field-services', 'hvac': 'trades-field-services',
    'landscaping': 'trades-field-services', 'cleaning': 'trades-field-services', 'painting': 'trades-field-services',
    'roofing': 'trades-field-services', 'pest-control': 'trades-field-services', 'locksmith': 'trades-field-services',
    'moving': 'trades-field-services', 'appliance-repair': 'trades-field-services', 'auto-repair': 'trades-field-services',
    'towing': 'trades-field-services', 'pool-service': 'trades-field-services', 'fencing': 'trades-field-services',
    'realestate': 'architecture-construction', 'construction': 'architecture-construction',
    'architecture': 'architecture-construction', 'interior-design': 'architecture-construction',
    'civil-engineering': 'architecture-construction', 'earthmoving': 'architecture-construction',
    'solar': 'architecture-construction', 'concrete': 'architecture-construction',
    'retail': 'retail-commerce', 'salon': 'retail-commerce', 'fashion': 'retail-commerce',
    'electronics': 'retail-commerce', 'car-dealer': 'retail-commerce', 'printing': 'retail-commerce',
    'advertising': 'retail-commerce', 'education': 'retail-commerce', 'wholesale': 'retail-commerce',
    'security': 'heavy-industrial', 'manufacturing': 'heavy-industrial', 'mining': 'heavy-industrial',
    'waste-management': 'heavy-industrial', 'industrial-supply': 'heavy-industrial',
    'transport': 'logistics-freight', 'logistics': 'logistics-freight', 'warehousing': 'logistics-freight',
    'courier': 'logistics-freight', 'freight': 'logistics-freight', 'shipping': 'logistics-freight',
    'farm': 'agricultural-industrial', 'fertilizer': 'agricultural-industrial',
    'agriculture': 'agricultural-industrial', 'forestry': 'agricultural-industrial',
    'photography': 'retail-commerce', 'fitness': 'retail-commerce', 'beauty': 'retail-commerce',
    'automotive': 'trades-field-services', 'pet-grooming': 'retail-commerce',
    'car-wash': 'trades-field-services', 'signage': 'retail-commerce',
    'florist': 'retail-commerce', 'jewelry': 'retail-commerce', 'spa': 'retail-commerce',
    'yoga': 'retail-commerce', 'martial-arts': 'retail-commerce', 'dance': 'retail-commerce',
    'music': 'retail-commerce', 'art': 'retail-commerce', 'tattoo': 'retail-commerce',
    'barbershop': 'retail-commerce', 'nail-salon': 'retail-commerce', 'tanning': 'retail-commerce',
    'dog-grooming': 'retail-commerce', 'pet-sitting': 'retail-commerce', 'dog-walking': 'retail-commerce',
    'personal-training': 'retail-commerce', 'crossfit': 'retail-commerce', 'pilates': 'retail-commerce',
    'saas': 'professional-corporate',
    'nonprofit': 'nonprofit-humanitarian', 'charity': 'nonprofit-humanitarian', 'ngo': 'nonprofit-humanitarian',
    'foundation': 'nonprofit-humanitarian', 'humanitarian': 'nonprofit-humanitarian', 'mission': 'nonprofit-humanitarian',
    'missions': 'nonprofit-humanitarian', 'relief': 'nonprofit-humanitarian', 'food-bank': 'nonprofit-humanitarian',
    'food-rescue': 'nonprofit-humanitarian', 'hunger': 'nonprofit-humanitarian', 'orphanage': 'nonprofit-humanitarian',
    'shelter': 'nonprofit-humanitarian', 'outreach': 'nonprofit-humanitarian', 'ministry': 'nonprofit-humanitarian',
    'church': 'nonprofit-humanitarian', 'faith-based': 'nonprofit-humanitarian', 'aid': 'nonprofit-humanitarian',
    'welfare': 'nonprofit-humanitarian', 'community-service': 'nonprofit-humanitarian',
  }
  return mapping[archetypeId] || archetypeId
}

function selectWithConstraints<T>(hash: number, allValues: T[], preferred: T[], excluded: T[], shift: number): T {
  // Filter out excluded values
  const allowed = allValues.filter(v => !excluded.includes(v))

  if (allowed.length === 0) return allValues[(hash >> shift) % allValues.length]

  // Build weighted pool: preferred items get 3x weight, non-preferred get 1x
  // This means preferred items are ~75% likely, non-preferred ~25% likely
  const weightedPool: T[] = []
  for (const item of allowed) {
    const isPreferred = preferred.includes(item)
    const weight = isPreferred ? 3 : 1
    for (let i = 0; i < weight; i++) {
      weightedPool.push(item)
    }
  }

  return weightedPool[(hash >> shift) % weightedPool.length]
}

export function generateDesignSeed(businessName: string, archetypeId?: string): DesignSeed {
  // Create deterministic hash from business name
  let hash = 0
  for (let i = 0; i < businessName.length; i++) {
    const char = businessName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const absHash = Math.abs(hash)

  // Get archetype constraints
  const constraints = archetypeId ? ARCHETYPE_SEED_CONSTRAINTS[archetypeId] : null
  
  // Use hash to select variations (with archetype biasing)
  const layoutStyles: DesignSeed['layoutStyle'][] = ['editorial', 'minimal', 'bold', 'elegant', 'playful', 'industrial']
  const gridDensities: DesignSeed['gridDensity'][] = ['sparse', 'balanced', 'dense', 'masonry']
  const headerStyles: DesignSeed['headerStyle'][] = ['transparent', 'solid', 'gradient', 'split']
  const cardGeometries: DesignSeed['cardGeometry'][] = ['rounded', 'sharp', 'pill', 'organic']
  const animationEasings: DesignSeed['animationEasing'][] = ['smooth', 'snappy', 'bouncy', 'dramatic']
  const spacingScales: DesignSeed['spacingScale'][] = ['compact', 'comfortable', 'spacious']
  const imageAspectRatios: DesignSeed['imageAspectRatio'][] = ['mixed', 'square', 'portrait', 'landscape']
  const colorIntensities: DesignSeed['colorIntensity'][] = ['muted', 'vibrant', 'neon', 'pastel']
  const densityProfiles: DesignSeed['densityProfile'][] = ['airy', 'balanced', 'dense']
  const decorativeIntensities: DesignSeed['decorativeIntensity'][] = ['minimal', 'subtle', 'expressive']
  const typographyPairings: DesignSeed['typographyPairing'][] = ['editorial-serif', 'modern-sans', 'bold-condensed', 'elegant-mix', 'friendly-rounded', 'technical-mono']
  const motionIntensities: DesignSeed['motionIntensity'][] = ['subtle', 'moderate', 'expressive']
  const staggerStrengths: DesignSeed['staggerStrength'][] = ['none', 'light', 'medium']
  const artDirections: DesignSeed['artDirection'][] = ['editorial', 'minimal', 'bold', 'cinematic', 'warm-organic']

  // Select with archetype constraints
  const layoutStyle = constraints
    ? selectWithConstraints(absHash, layoutStyles, constraints.preferredLayouts as any[], constraints.excludedLayouts as any[], 0)
    : layoutStyles[absHash % layoutStyles.length]

  const typographyPairing = constraints
    ? selectWithConstraints(absHash, typographyPairings, constraints.preferredTypography as any[], constraints.excludedTypography as any[], 14)
    : typographyPairings[(absHash >> 14) % typographyPairings.length]

  const artDirection = constraints
    ? selectWithConstraints(absHash, artDirections, constraints.preferredArtDirection as any[], constraints.excludedArtDirection as any[], 26)
    : artDirections[(absHash >> 26) % artDirections.length]

  const colorIntensity = constraints
    ? selectWithConstraints(absHash, colorIntensities, constraints.preferredColorIntensity as any[], constraints.excludedColorIntensity as any[], 28)
    : colorIntensities[(absHash >> 28) % colorIntensities.length]

  const decorativeIntensity = constraints
    ? selectWithConstraints(absHash, decorativeIntensities, constraints.preferredDecorative as any[], constraints.excludedDecorative as any[], 10)
    : decorativeIntensities[(absHash >> 10) % decorativeIntensities.length]

  const motionIntensity = constraints
    ? selectWithConstraints(absHash, motionIntensities, constraints.preferredMotion as any[], constraints.excludedMotion as any[], 18)
    : motionIntensities[(absHash >> 18) % motionIntensities.length]

  // Generate section order (shuffle non-essential sections)
  const baseOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8] // Hero, Services, Gallery, Testimonials, FAQ, About, Team, Contact, Footer
  const sectionOrder = shuffleWithSeed(baseOrder, absHash)

  return {
    id: absHash.toString(36).slice(0, 8),
    layoutStyle: layoutStyle as any,
    gridDensity: gridDensities[(absHash >> 4) % gridDensities.length],
    headerStyle: headerStyles[(absHash >> 8) % headerStyles.length],
    cardGeometry: cardGeometries[(absHash >> 12) % cardGeometries.length],
    animationEasing: animationEasings[(absHash >> 16) % animationEasings.length],
    sectionOrder,
    spacingScale: spacingScales[(absHash >> 20) % spacingScales.length],
    imageAspectRatio: imageAspectRatios[(absHash >> 24) % imageAspectRatios.length],
    colorIntensity: colorIntensity as any,
    densityProfile: densityProfiles[(absHash >> 6) % densityProfiles.length],
    decorativeIntensity: decorativeIntensity as any,
    typographyPairing: typographyPairing as any,
    motionIntensity: motionIntensity as any,
    staggerStrength: staggerStrengths[(absHash >> 22) % staggerStrengths.length],
    artDirection: artDirection as any,
  }
}

function shuffleWithSeed(array: number[], seed: number): number[] {
  const result = [...array]
  let currentIndex = result.length
  
  // Only shuffle non-essential sections (keep Hero first, Contact near end)
  const shuffleable = result.slice(1, -2) // Skip first (Hero) and last 2 (Contact, Footer)
  
  for (let i = shuffleable.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1)) % (i + 1))
    const temp = shuffleable[i]
    shuffleable[i] = shuffleable[j]
    shuffleable[j] = temp
  }
  
  return [result[0], ...shuffleable, ...result.slice(-2)]
}

export function getDesignSeedInstructions(seed: DesignSeed): string {
  return `
DESIGN SEED: ${seed.id} (Unique Visual Fingerprint)

LAYOUT STYLE: ${seed.layoutStyle.toUpperCase()}
${getLayoutStyleDescription(seed.layoutStyle)}

GRID DENSITY: ${seed.gridDensity}
${getGridDensityDescription(seed.gridDensity)}

HEADER STYLE: ${seed.headerStyle}
${getHeaderStyleDescription(seed.headerStyle)}

CARD GEOMETRY: ${seed.cardGeometry}
${getCardGeometryDescription(seed.cardGeometry)}

ANIMATION EASING: ${seed.animationEasing}
${getAnimationEasingDescription(seed.animationEasing)}

SPACING SCALE: ${seed.spacingScale}
${getSpacingScaleDescription(seed.spacingScale)}

IMAGE ASPECT RATIO: ${seed.imageAspectRatio}
${getImageAspectRatioDescription(seed.imageAspectRatio)}

COLOR INTENSITY: ${seed.colorIntensity}
${getColorIntensityDescription(seed.colorIntensity)}

DENSITY PROFILE: ${seed.densityProfile}
${getDensityProfileDescription(seed.densityProfile)}

DECORATIVE INTENSITY: ${seed.decorativeIntensity}
${getDecorativeIntensityDescription(seed.decorativeIntensity)}

TYPOGRAPHY PAIRING: ${seed.typographyPairing}
${getTypographyPairingDescription(seed.typographyPairing)}

MOTION INTENSITY: ${seed.motionIntensity}
${getMotionIntensityDescription(seed.motionIntensity)}

STAGGER STRENGTH: ${seed.staggerStrength}
${getStaggerStrengthDescription(seed.staggerStrength)}

ART DIRECTION: ${seed.artDirection}
${getArtDirectionDescription(seed.artDirection)}

SECTION ORDER: ${seed.sectionOrder.map(i => getSectionName(i)).join(' → ')}
`
}

function getLayoutStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    editorial: 'Magazine-inspired layout with large typography, asymmetric grids, and generous whitespace. Think Vogue or Kinfolk.',
    minimal: 'Clean, stripped-down design with maximum whitespace. Focus on content with minimal decoration.',
    bold: 'High-impact design with large elements, strong contrasts, and attention-grabbing visuals.',
    elegant: 'Sophisticated design with refined typography, subtle animations, and premium feel.',
    playful: 'Fun, energetic design with rounded shapes, bright colors, and engaging interactions.',
    industrial: 'Raw, technical design with sharp edges, monospace fonts, and utilitarian aesthetic.',
  }
  return descriptions[style] || descriptions.editorial
}

function getGridDensityDescription(density: string): string {
  const descriptions: Record<string, string> = {
    sparse: '2-column grid with generous gaps (32-48px). Let images breathe. Best for high-end photography.',
    balanced: '3-column grid with medium gaps (24px). Standard density for most content.',
    dense: '4-column grid with tight gaps (16px). Great for product catalogs and portfolios.',
    masonry: 'Pinterest-style layout with varying heights. Perfect for diverse image collections.',
  }
  return descriptions[density] || descriptions.balanced
}

function getHeaderStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    transparent: 'Header starts transparent over hero, becomes solid on scroll. Modern and immersive.',
    solid: 'Header has solid background from start. Clean and professional.',
    gradient: 'Header has gradient overlay that fades. Dynamic and eye-catching.',
    split: 'Header split into two sections - logo on left, nav on right with distinct backgrounds.',
  }
  return descriptions[style] || descriptions.transparent
}

function getCardGeometryDescription(geometry: string): string {
  const descriptions: Record<string, string> = {
    rounded: 'Cards with 12-16px border radius. Friendly and modern.',
    sharp: 'Cards with 0-4px border radius. Clean and professional.',
    pill: 'Cards with 9999px border radius. Playful and distinctive.',
    organic: 'Cards with varied border radius (e.g., 30px 4px 30px 4px). Artistic and unique.',
  }
  return descriptions[geometry] || descriptions.rounded
}

function getAnimationEasingDescription(easing: string): string {
  const descriptions: Record<string, string> = {
    smooth: 'ease-in-out with 300-500ms duration. Gentle and professional.',
    snappy: 'ease-out with 150-200ms duration. Fast and responsive.',
    bouncy: 'spring(1, 80, 10) with 500ms duration. Fun and playful.',
    dramatic: 'cubic-bezier(0.16, 1, 0.3, 1) with 600ms duration. Bold and impactful.',
  }
  return descriptions[easing] || descriptions.smooth
}

function getSpacingScaleDescription(scale: string): string {
  const descriptions: Record<string, string> = {
    compact: 'Sections: 48-64px padding. Elements: 12-16px gaps. Dense but organized.',
    comfortable: 'Sections: 64-96px padding. Elements: 16-24px gaps. Standard spacing.',
    spacious: 'Sections: 96-128px padding. Elements: 24-32px gaps. Luxury breathing room.',
  }
  return descriptions[scale] || descriptions.comfortable
}

function getImageAspectRatioDescription(ratio: string): string {
  const descriptions: Record<string, string> = {
    mixed: 'Varied aspect ratios for visual interest. Some square, some portrait, some landscape.',
    square: '1:1 aspect ratio for all images. Clean grid alignment.',
    portrait: '3:4 or 4:5 aspect ratio. Great for people and products.',
    landscape: '16:9 or 3:2 aspect ratio. Great for environments and scenes.',
  }
  return descriptions[ratio] || descriptions.mixed
}

function getColorIntensityDescription(intensity: string): string {
  const descriptions: Record<string, string> = {
    muted: 'Desaturated colors with gray undertones. Sophisticated and calming.',
    vibrant: 'Full saturation colors. Energetic and attention-grabbing.',
    neon: 'High brightness colors with glow effects. Modern and tech-forward.',
    pastel: 'Low saturation, high lightness colors. Soft and approachable.',
  }
  return descriptions[intensity] || descriptions.vibrant
}

function getDensityProfileDescription(profile: string): string {
  const descriptions: Record<string, string> = {
    airy: 'Generous whitespace, large section padding (100-140px), wide gaps between elements. Luxury editorial feel. Content breathes.',
    balanced: 'Standard spacing (64-96px padding), comfortable gaps. Professional and readable. Good default for most sites.',
    dense: 'Tight spacing (48-64px padding), compact gaps. Information-rich layout. Great for catalogs, portfolios, and data-heavy sites.',
  }
  return descriptions[profile] || descriptions.balanced
}

function getDecorativeIntensityDescription(intensity: string): string {
  const descriptions: Record<string, string> = {
    minimal: 'No decorative elements. Pure content focus. Clean lines, no overlays, no grain, no gradients beyond functional use. Professional and distraction-free.',
    subtle: 'Light decorative touches. Soft gradient overlays on hero, subtle grain texture on backgrounds, gentle border accents. Refined and polished.',
    expressive: 'Bold decorative elements. Strong gradient overlays, visible grain/noise textures, decorative shapes, floating elements, glassmorphism cards. Eye-catching and memorable.',
  }
  return descriptions[intensity] || descriptions.subtle
}

function getTypographyPairingDescription(pairing: string): string {
  const descriptions: Record<string, string> = {
    'editorial-serif': 'Heading: Playfair Display (elegant serif). Body: Inter (clean sans). Sophisticated, magazine-like. Great for hospitality, photography, luxury brands.',
    'modern-sans': 'Heading: Plus Jakarta Sans (geometric). Body: Inter. Clean, contemporary. Universal appeal for most industries.',
    'bold-condensed': 'Heading: Oswald (condensed bold). Body: Roboto. Strong, industrial feel. Great for trades, security, automotive.',
    'elegant-mix': 'Heading: Cormorant Garamond (refined serif). Body: Montserrat. Refined yet modern. Great for professional services, medical, legal.',
    'friendly-rounded': 'Heading: Nunito (rounded sans). Body: Open Sans. Warm, approachable. Great for bakeries, beauty, education, family services.',
    'technical-mono': 'Heading: JetBrains Mono (monospace). Body: Inter. Technical, precise. Great for tech companies, engineering, industrial.',
  }
  return descriptions[pairing] || descriptions['modern-sans']
}

function getMotionIntensityDescription(intensity: string): string {
  const descriptions: Record<string, string> = {
    subtle: 'Gentle animations: 0.3s duration, 8px distance, 0.04s stagger. Refined and professional. No bouncy or flashy effects.',
    moderate: 'Balanced animations: 0.4s duration, 12px distance, 0.06s stagger. Noticeable but tasteful. Good default for most sites.',
    expressive: 'Bold animations: 0.6s duration, 20px distance, 0.08s stagger. Attention-grabbing. Best for creative and entertainment sites.',
  }
  return descriptions[intensity] || descriptions.moderate
}

function getStaggerStrengthDescription(strength: string): string {
  const descriptions: Record<string, string> = {
    none: 'No stagger — all elements animate simultaneously. Clean and fast.',
    light: 'Light stagger (0.04s between children). Subtle sequential reveal. Professional.',
    medium: 'Medium stagger (0.08s between children). Clear cascade effect. Engaging.',
  }
  return descriptions[strength] || descriptions.light
}

function getArtDirectionDescription(direction: string): string {
  const descriptions: Record<string, string> = {
    editorial: 'Magazine-inspired: airy spacing, subtle motion, serif display typography, muted colors, editorial grid layouts. Sophisticated and refined.',
    minimal: 'Clean and focused: compact spacing, minimal motion, clean sans-serif, high whitespace ratio, stripped-down layouts. Professional and distraction-free.',
    bold: 'High-impact: dense spacing, expressive motion, strong colors, geometric shapes, attention-grabbing layouts. Energetic and memorable.',
    cinematic: 'Dramatic and immersive: spacious layouts, moderate motion, dark backgrounds, large typography, full-bleed images. Premium and atmospheric.',
    'warm-organic': 'Friendly and approachable: balanced spacing, moderate motion, warm tones, rounded shapes, friendly typography. Inviting and personal.',
  }
  return descriptions[direction] || descriptions.editorial
}

function getSectionName(index: number): string {
  const names = ['Hero', 'Services', 'Gallery', 'Testimonials', 'FAQ', 'About', 'Team', 'Contact', 'Footer']
  return names[index] || 'Section'
}
