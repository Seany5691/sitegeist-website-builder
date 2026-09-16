/**
 * Creative Brief Generator
 * 
 * Generates world-class creative briefs that make the AI FEEL what the website
 * should feel like, not just KNOW what components to build.
 * 
 * Works for ANY industry - automatically adapts based on detected archetype.
 */

import { IndustryArchetype, MasterSiteConfig } from '@/types/site-config'

interface CreativeBriefInput {
  businessName: string
  industry: string
  city: string
  ownerName: string
  services: Array<{ title: string; description: string }>
  archetype: IndustryArchetype
  siteConfig: MasterSiteConfig
  designSeed?: {
    artDirection?: string
    layoutStyle?: string
    typographyPairing?: string
    motionIntensity?: string
    colorIntensity?: string
    decorativeIntensity?: string
    spacingScale?: string
  }
}

/**
 * Generate a creative brief that reads like a $50,000 design project brief
 */
export function generateCreativeBrief(input: CreativeBriefInput): string {
  const { businessName, industry, city, ownerName, services, archetype, siteConfig, designSeed } = input
  
  const designDirection = designSeed ? `
==================================================
0. DESIGN DIRECTION (Design Seed: ${businessName})
==================================================

This website has a specific visual identity defined by its design seed.
FOLLOW THESE DIRECTION EXACTLY — they determine the visual personality.

ART DIRECTION: ${(designSeed.artDirection || 'editorial').toUpperCase()}
${getArtDirectionDescription(designSeed.artDirection || 'editorial')}

LAYOUT STYLE: ${(designSeed.layoutStyle || 'modern').toUpperCase()}
${getLayoutStyleDescription(designSeed.layoutStyle || 'modern')}

TYPOGRAPHY PAIRING: ${(designSeed.typographyPairing || 'modern-sans').toUpperCase()}
${getTypographyDescription(designSeed.typographyPairing || 'modern-sans')}

MOTION INTENSITY: ${(designSeed.motionIntensity || 'moderate').toUpperCase()}
${getMotionDescription(designSeed.motionIntensity || 'moderate')}

COLOR INTENSITY: ${(designSeed.colorIntensity || 'vibrant').toUpperCase()}
${getColorIntensityDescription(designSeed.colorIntensity || 'vibrant')}

DECORATIVE INTENSITY: ${(designSeed.decorativeIntensity || 'subtle').toUpperCase()}
${getDecorativeDescription(designSeed.decorativeIntensity || 'subtle')}

SPACING: ${(designSeed.spacingScale || 'comfortable').toUpperCase()}
${getSpacingDescription(designSeed.spacingScale || 'comfortable')}

These parameters MUST influence every design decision: component styling, 
animation choices, spacing, typography weight, and visual treatment.
` : ''

  return `${designDirection}
==================================================
CREATIVE BRIEF: ${businessName}
==================================================
Project: Build a world-class website that makes visitors say "WOW"
Industry: ${archetype.name}
Location: ${city}
Owner: ${ownerName}

==================================================
1. THE EMOTIONAL JOURNEY
==================================================

${getEmotionalJourney(archetype, businessName, city)}

VISUAL MOOD: ${archetype.colorPsychology.mood}
The design must evoke: ${getEmotionalTriggers(archetype)}

==================================================
2. COMPETITIVE POSITIONING
==================================================

${getCompetitivePositioning(archetype, businessName, city)}

DIFFERENTIATORS TO HIGHLIGHT:
${getDifferentiators(archetype, siteConfig)}

==================================================
3. LOCAL CONTEXT & CULTURE
==================================================

${getLocalContext(archetype, city)}

==================================================
4. CONVERSION PSYCHOLOGY
==================================================

${getConversionPsychology(archetype, businessName)}

==================================================
5. VISUAL STORYTELLING
==================================================

${getVisualStorytelling(archetype, siteConfig)}

==================================================
6. ANIMATION & INTERACTION PHILOSOPHY
==================================================

${getAnimationPhilosophy(archetype)}

==================================================
7. GALLERY & IMAGE STRATEGY
==================================================

CRITICAL: PRESERVE ORIGINAL STRUCTURE
${getGalleryStrategy(siteConfig)}

==================================================
8. CONTENT STRATEGY
==================================================

${getContentStrategy(archetype, businessName, city)}

==================================================
9. RESPONSIVE BEHAVIOR
==================================================

${getResponsiveBehavior(archetype)}

==================================================
10. THE PROMISE
==================================================

This website must be so beautiful, so uniquely crafted, that when ${businessName} 
shows it to their clients, they will say: "This is the most beautiful website 
I've ever seen for a ${archetype.name.toLowerCase()} business."

It must feel like it was designed by a world-class agency that spent weeks 
understanding their business, their clients, and their vision.

Every pixel must be intentional. Every animation must serve a purpose. 
Every word must resonate with the target audience.

This is not a template. This is a bespoke digital experience.
`
}

function getEmotionalJourney(archetype: IndustryArchetype, businessName: string, city: string): string {
  const journeys: Record<string, string> = {
    'photography': `A visitor to this website should feel:
- First 3 seconds: "This photographer understands beauty"
- First 10 seconds: "I can trust them with my precious moments"
- First 30 seconds: "I want to book them RIGHT NOW"

The emotional arc: Curiosity → Admiration → Trust → Desire → Action

The hero image should make them stop scrolling. The gallery should make them 
imagine their own photos looking this beautiful. The testimonials should make 
them feel confident they're making the right choice.`,

    'security': `A visitor to this website should feel:
- First 3 seconds: "This company looks professional and trustworthy"
- First 10 seconds: "They can protect my property and family"
- First 30 seconds: "I feel confident contacting them"

The emotional arc: Concern → Confidence → Trust → Security → Action

The design must feel authoritative, reliable, and professional. Like a company 
that takes security seriously and has the expertise to deliver.`,

    'medical': `A visitor to this website should feel:
- First 3 seconds: "I can trust this clinic with my health"
- First 10 seconds: "They understand my pain/concern"
- First 30 seconds: "I feel confident booking an appointment"

The emotional arc: Concern → Understanding → Trust → Relief → Action

The design must feel clean, professional, and calming. Not clinical or cold, 
but warm and reassuring. Like walking into a modern, welcoming clinic.`,

    'restaurant': `A visitor to this website should feel:
- First 3 seconds: "This looks delicious"
- First 10 seconds: "I can imagine myself dining there"
- First 30 seconds: "I want to make a reservation"

The emotional arc: Hunger → Curiosity → Desire → Anticipation → Booking

The hero should make their mouth water. The menu should make them hungry. 
The ambiance photos should make them imagine their next date night.`,

    'bakery': `A visitor to this website should feel:
- First 3 seconds: "This looks absolutely delicious"
- First 10 seconds: "I can smell the fresh bread from here"
- First 30 seconds: "I want to order right now"

The emotional arc: Craving → Desire → Trust → Order

The hero should showcase the most beautiful baked goods. The product gallery 
should make visitors want to try everything. Custom cake options should inspire 
their next celebration.`,

    'trades': `A visitor to this website should feel:
- First 3 seconds: "This company looks professional and reliable"
- First 10 seconds: "They can handle my project"
- First 30 seconds: "I trust them enough to call"

The emotional arc: Need → Confidence → Trust → Action

The design must feel solid, reliable, and professional. Like a company 
that shows up on time and does quality work.`,

    'legal': `A visitor to this website should feel:
- First 3 seconds: "These lawyers are serious and trustworthy"
- First 10 seconds: "They have the expertise I need"
- First 30 seconds: "I feel confident reaching out"

The emotional arc: Concern → Confidence → Trust → Security → Action

The design must feel authoritative but approachable. Not intimidating, 
but reassuring. Like a trusted advisor.`,

    'finance': `A visitor to this website should feel:
- First 3 seconds: "This firm looks professional and trustworthy"
- First 10 seconds: "They understand my financial needs"
- First 30 seconds: "I feel confident scheduling a consultation"

The emotional arc: Concern → Understanding → Trust → Confidence → Action

The design must feel precise, trustworthy, and established. Like a firm 
that handles finances with care and expertise.`,

    'education': `A visitor to this website should feel:
- First 3 seconds: "This is a quality institution"
- First 10 seconds: "I can see myself or my child learning here"
- First 30 seconds: "I want to learn more about enrollment"

The emotional arc: Curiosity → Aspiration → Trust → Action

The design must feel inspiring, modern, and welcoming. Like a place 
where knowledge and growth are celebrated.`,

    'fitness': `A visitor to this website should feel:
- First 3 seconds: "This place looks energizing"
- First 10 seconds: "I can see myself getting results here"
- First 30 seconds: "I want to sign up"

The emotional arc: Motivation → Inspiration → Confidence → Action

The design must feel dynamic, energetic, and motivating. Like the 
first step of a fitness journey.`,

    'beauty': `A visitor to this website should feel:
- First 3 seconds: "This looks luxurious and relaxing"
- First 10 seconds: "I deserve this pampering"
- First 30 seconds: "I want to book an appointment"

The emotional arc: Desire → Indulgence → Relaxation → Action

The design must feel elegant, soothing, and luxurious. Like walking 
into a high-end spa.`,

    'hospitality': `A visitor to this website should feel:
- First 3 seconds: "I can imagine myself there"
- First 10 seconds: "This looks like the perfect getaway"
- First 30 seconds: "I want to book my stay"

The emotional arc: Wanderlust → Desire → Anticipation → Booking

The design must feel welcoming, aspirational, and inviting. Like a 
preview of an unforgettable experience.`,

    'retail': `A visitor to this website should feel:
- First 3 seconds: "I want that"
- First 10 seconds: "I can trust this store"
- First 30 seconds: "I'm adding to cart"

The emotional arc: Desire → Curiosity → Trust → Purchase

The design must feel modern, trustworthy, and shoppable. Like a 
well-curated boutique.`,

    'automotive': `A visitor to this website should feel:
- First 3 seconds: "This company is professional and capable"
- First 10 seconds: "They can handle my vehicle"
- First 30 seconds: "I trust them with my car"

The emotional arc: Need → Confidence → Trust → Action

The design must feel powerful, reliable, and expert. Like a garage 
that takes pride in their work.`,

    'saas': `A visitor to this website should feel:
- First 3 seconds: "This product looks innovative"
- First 10 seconds: "I can see how this solves my problem"
- First 30 seconds: "I want to try it"

The emotional arc: Curiosity → Understanding → Desire → Trial

The design must feel modern, clean, and innovative. Like the future 
of software.`,

    'realestate': `A visitor to this website should feel:
- First 3 seconds: "I can see myself living there"
- First 10 seconds: "This agent knows the area"
- First 30 seconds: "I want to schedule a viewing"

The emotional arc: Aspiration → Trust → Desire → Action

The design must feel premium, trustworthy, and aspirational. Like 
the key to your dream home.`,
  }
  
  // If industry is in the list, use it; otherwise use dynamic fallback
  if (journeys[archetype.id]) {
    return journeys[archetype.id]
  }
  
  // Dynamic fallback based on archetype mood and description
  return `A visitor to this website should feel:
- First 3 seconds: "${businessName} looks professional and trustworthy"
- First 10 seconds: "They understand what I need"
- First 30 seconds: "I feel confident reaching out"

The emotional arc: Curiosity → Understanding → Trust → Action

The design must feel ${archetype.colorPsychology.mood}. Like a business 
that takes pride in their work and delivers exceptional results.`
}

function getEmotionalTriggers(archetype: IndustryArchetype): string {
  const triggers: Record<string, string> = {
    'photography': 'Beauty, intimacy, timelessness, natural warmth',
    'security': 'Trust, professionalism, reliability, safety',
    'medical': 'Trust, cleanliness, professionalism, care',
    'restaurant': 'Appetite, warmth, social connection, indulgence',
    'bakery': 'Craving, warmth, freshness, artisan quality',
    'trades': 'Reliability, strength, expertise, trustworthiness',
    'legal': 'Authority, trust, security, competence',
    'education': 'Growth, inspiration, community, achievement',
    'fitness': 'Energy, motivation, transformation, strength',
    'beauty': 'Luxury, relaxation, self-care, elegance',
    'hospitality': 'Welcome, adventure, relaxation, luxury',
    'retail': 'Desire, trust, quality, satisfaction',
    'automotive': 'Power, reliability, expertise, trust',
    'saas': 'Innovation, efficiency, progress, simplicity',
    'realestate': 'Aspiration, security, investment, home',
  }
  
  return triggers[archetype.id] || 'Trust, professionalism, quality, reliability'
}

function getCompetitivePositioning(archetype: IndustryArchetype, businessName: string, city: string): string {
  return `Your website must position ${businessName} as THE choice in ${city}.

Think about what makes a visitor choose YOU over the competition:
- What unique value do you offer?
- What experience do you provide that others don't?
- What trust signals set you apart?

The design must communicate these differentiators visually, not just in text.`
}

function getDifferentiators(archetype: IndustryArchetype, siteConfig: MasterSiteConfig): string {
  const differentiators: string[] = []
  
  if (siteConfig.testimonials?.length) {
    differentiators.push('- Social proof: Real testimonials from satisfied clients')
  }
  
  if (siteConfig.team?.length && siteConfig.team.length > 1) {
    differentiators.push(`- Team: ${siteConfig.team.length} qualified professionals`)
  }
  
  if (siteConfig.services?.length) {
    differentiators.push(`- Comprehensive: ${siteConfig.services.length} services offered`)
  }
  
  differentiators.push('- Location: Convenient and accessible')
  differentiators.push('- Experience: Years of proven results')
  differentiators.push('- Trust: Licensed, insured, and certified')
  
  return differentiators.join('\n')
}

function getLocalContext(archetype: IndustryArchetype, city: string): string {
  return `${city} is your home. Your website should feel like it belongs here.

LOCAL ELEMENTS TO INCLUDE:
- Reference local landmarks and neighborhoods
- Use language that resonates with locals
- Include local testimonials when available
- Mention service areas and coverage
- Use local imagery when possible

The website should feel like it was built BY locals, FOR locals.`
}

function getConversionPsychology(archetype: IndustryArchetype, businessName: string): string {
  return `Every element on this website must guide visitors toward action.

CONVERSION PRINCIPLES:
1. CLARITY: Visitors should know what you do within 3 seconds
2. TRUST: Build credibility through testimonials, credentials, social proof
3. URGENCY: Create gentle urgency without being pushy
4. SIMPLICITY: Make it easy to take the next step
5. CONFIDENCE: Remove all doubt and friction

THE CONVERSION PATH:
Hero (Hook) → Services (Value) → Gallery (Proof) → Testimonials (Trust) → CTA (Action)

Every section should naturally lead to the next, creating a smooth journey 
from "I need this" to "I'm booking now."`
}

function getVisualStorytelling(archetype: IndustryArchetype, siteConfig: MasterSiteConfig): string {
  return `The gallery and images should tell a story, not just display photos.

IMAGE STRATEGY:
- Hero: Set the emotional tone immediately
- Services: Show the experience, not just the service
- Gallery: Tell a story through curated sequences
- Team: Humanize the business with authentic portraits
- Testimonials: Pair quotes with relevant imagery

IMAGE ORDERING:
Images should flow like a visual narrative:
1. Hero image: The "wow" moment
2. Service images: The "how" moments
3. Gallery: The "result" moments
4. Team: The "who" moments
5. Testimonials: The "proof" moments`
}

function getGalleryStrategy(siteConfig: MasterSiteConfig): string {
  const gallery = siteConfig.gallery || []
  const categories = new Set(gallery.map(g => g.category).filter(Boolean))
  
  let strategy = `The original website organizes images into categories. 
PRESERVE THIS STRUCTURE in the new website.

GALLERY ORGANIZATION:
- Each category should have its own section or tab
- Images within each category should maintain their original order
- Create visual cards for each category (not just a flat grid)
- Each card should show the category name and a preview image
- Clicking a card should open that category's gallery

CATEGORY STRUCTURE:
`
  
  if (categories.size > 0) {
    for (const cat of Array.from(categories)) {
      const count = gallery.filter(g => g.category === cat).length
      strategy += `- ${cat}: ${count} images\n`
    }
  } else {
    strategy += '- Single portfolio gallery with all images\n'
  }
  
  strategy += `
CRITICAL: Do NOT mix all images into one flat gallery.
Each category must be visually distinct and separately accessible.
This preserves the client's original organization and makes the gallery 
more navigable for visitors.`
  
  return strategy
}

function getContentStrategy(archetype: IndustryArchetype, businessName: string, city: string): string {
  return `Every word on this website must be purposeful and persuasive.

CONTENT HIERARCHY:
1. HERO: Emotional hook that captures attention
2. SERVICES: Benefit-focused descriptions (not feature lists)
3. GALLERY: Visual proof of quality
4. TESTIMONIALS: Social proof from real clients
5. ABOUT: Trust-building story
6. CONTACT: Frictionless communication

WRITING STYLE:
- Use active voice, not passive
- Focus on benefits, not features
- Include local references when natural
- Use sensory language for experiences
- Keep paragraphs short and scannable
- Use headings to guide the eye

SEO CONTENT:
- Include location-specific keywords naturally
- Use industry-specific terminology
- Create content that answers common questions
- Structure for featured snippets`
}

function getAnimationPhilosophy(archetype: IndustryArchetype): string {
  const philosophies: Record<string, string> = {
    'photography': `Animations should feel like a gentle reveal, not a flashy entrance.
- Hero: Text fades in from bottom, 0.8s ease-out
- Gallery: Images scale 1.05x on hover, 300ms
- Transitions: Smooth crossfades between sections
- Philosophy: Let the images speak, animations just guide the eye`,
    'medical': `Animations should feel calming and professional.
- Hero: Subtle fade-in, no bounce or spring
- Services: Cards slide up on scroll, staggered 100ms
- Transitions: Gentle fades, no flashy effects
- Philosophy: Reassuring, not exciting`,
    'restaurant': `Animations should feel warm and inviting.
- Hero: Image zoom on scroll (parallax)
- Menu: Items reveal on scroll with subtle slide
- Gallery: Smooth lightbox transitions
- Philosophy: Appetizing, not distracting`,
    'trades': `Animations should feel solid and reliable.
- Hero: Bold text entrance, no fancy effects
- Services: Cards appear with solid transitions
- Before/after: Smooth slider interaction
- Philosophy: Strong, not flashy`,
  }
  
  return philosophies[archetype.id] || `Animations should feel modern and professional.
- Hero: Fade-up entrance, 0.6s ease-out
- Services: Staggered card entrance on scroll
- Gallery: Smooth hover effects
- Philosophy: Enhance, don't distract`
}

function getResponsiveBehavior(archetype: IndustryArchetype): string {
  return `The website must feel native on every device.

MOBILE (Primary - 70% of traffic):
- Sticky "Call Now" button at bottom
- Touch-optimized CTAs (min 44px)
- Swipeable galleries and testimonials
- Collapsible sections for easy scanning
- Fast loading (lazy load below-fold images)

TABLET:
- 2-column layouts for services and features
- Side-by-side content where appropriate
- Touch-friendly interactions

DESKTOP:
- Full-width hero with parallax
- Hover effects on all interactive elements
- Multi-column layouts for efficiency
- Floating widgets (WhatsApp, back-to-top)

PERFORMANCE TARGETS:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms`
}

function getArtDirectionDescription(art: string): string {
  const descriptions: Record<string, string> = {
    'editorial': 'Magazine-inspired: airy spacing, subtle motion, serif display typography, muted colors, editorial grid layouts. Sophisticated and refined.',
    'minimal': 'Clean and focused: compact spacing, minimal motion, clean sans-serif, high whitespace ratio, stripped-down layouts. Professional and distraction-free.',
    'bold': 'High-impact: dense spacing, expressive motion, strong colors, geometric shapes, attention-grabbing layouts. Energetic and memorable.',
    'cinematic': 'Dramatic and immersive: spacious layouts, moderate motion, dark backgrounds, large typography, full-bleed images. Premium and atmospheric.',
    'warm-organic': 'Friendly and approachable: balanced spacing, moderate motion, warm tones, rounded shapes, friendly typography. Inviting and personal.',
  }
  return descriptions[art] || descriptions['editorial']
}

function getLayoutStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'editorial': 'Magazine-inspired layout with large typography, asymmetric grids, and generous whitespace.',
    'minimal': 'Clean, stripped-down design with maximum whitespace. Focus on content with minimal decoration.',
    'bold': 'High-impact design with large elements, strong contrasts, and attention-grabbing visuals.',
    'elegant': 'Sophisticated design with refined typography, subtle animations, and premium feel.',
    'playful': 'Fun, energetic design with rounded shapes, bright colors, and engaging interactions.',
    'industrial': 'Raw, technical design with sharp edges, monospace fonts, and utilitarian aesthetic.',
  }
  return descriptions[style] || descriptions['editorial']
}

function getTypographyDescription(pairing: string): string {
  const descriptions: Record<string, string> = {
    'editorial-serif': 'Heading: Playfair Display (elegant serif). Body: Inter (clean sans). Sophisticated, magazine-like.',
    'modern-sans': 'Heading: Plus Jakarta Sans (geometric). Body: Inter. Clean, contemporary. Universal appeal.',
    'bold-condensed': 'Heading: Oswald (condensed bold). Body: Roboto. Strong, industrial feel.',
    'elegant-mix': 'Heading: Cormorant Garamond (refined serif). Body: Montserrat. Refined yet modern.',
    'friendly-rounded': 'Heading: Nunito (rounded sans). Body: Open Sans. Warm, approachable.',
    'technical-mono': 'Heading: JetBrains Mono (monospace). Body: Inter. Technical, precise.',
  }
  return descriptions[pairing] || descriptions['modern-sans']
}

function getMotionDescription(motion: string): string {
  const descriptions: Record<string, string> = {
    'subtle': 'Gentle animations: 0.3s duration, 8px distance. Refined and professional.',
    'moderate': 'Balanced animations: 0.4s duration, 12px distance. Noticeable but tasteful.',
    'expressive': 'Bold animations: 0.6s duration, 20px distance. Attention-grabbing and memorable.',
  }
  return descriptions[motion] || descriptions['moderate']
}

function getColorIntensityDescription(intensity: string): string {
  const descriptions: Record<string, string> = {
    'muted': 'Desaturated colors with gray undertones. Sophisticated and calming.',
    'vibrant': 'Full saturation colors. Energetic and attention-grabbing.',
    'neon': 'High brightness colors with glow effects. Modern and tech-forward.',
    'pastel': 'Low saturation, high lightness colors. Soft and approachable.',
  }
  return descriptions[intensity] || descriptions['vibrant']
}

function getDecorativeDescription(intensity: string): string {
  const descriptions: Record<string, string> = {
    'minimal': 'No decorative elements. Pure content focus. Clean lines, no overlays.',
    'subtle': 'Light decorative touches. Soft gradient overlays, subtle grain texture, gentle accents.',
    'expressive': 'Bold decorative elements. Strong gradients, visible textures, decorative shapes, glassmorphism.',
  }
  return descriptions[intensity] || descriptions['subtle']
}

function getSpacingDescription(scale: string): string {
  const descriptions: Record<string, string> = {
    'compact': 'Dense but organized. Sections: 48-64px padding. Elements: 12-16px gaps.',
    'comfortable': 'Standard spacing. Sections: 64-96px padding. Elements: 16-24px gaps.',
    'spacious': 'Luxury breathing room. Sections: 96-128px padding. Elements: 24-32px gaps.',
  }
  return descriptions[scale] || descriptions['comfortable']
}
