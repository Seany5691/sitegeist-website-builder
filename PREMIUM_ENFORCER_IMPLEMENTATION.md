# SiteSpire Premium Enforcer - Complete Implementation Guide
**Date:** December 2024  
**Status:** EXECUTION IN PROGRESS  
**Objective:** Every website must achieve a 200/100 custom agency feel

---

## 🎯 EXECUTIVE SUMMARY

This document provides the systematic execution plan for upgrading our template engine and selector logic to ensure EVERY generated website achieves premium, custom-agency quality. All enhancements use **dynamic brand color variables** (`var(--color-primary)`, `var(--color-accent)`, `var(--color-secondary)`) rather than hardcoded colors.

**Core Philosophy:**
- ❌ No hardcoded gold/amber colors
- ✅ Dynamic brand-aware styling
- ✅ Premium feel for ALL business archetypes
- ✅ Zero template feel - every site looks custom-built

**Proven Premium Formula:**
1. ✅ Hero background images with parallax & ambient glows
2. ✅ Masonry gallery with glassmorphism hover overlays
3. ✅ Service cards with large shadows, dynamic brand-tinted frames
4. ✅ Featured testimonial hierarchy (hero + supporting grid)
5. ✅ White elevated cards with soft shadows throughout
6. ✅ Floating animations and decorative blobs

**Impact:** Template feel → Custom agency design (200/100 score)

---

## 📋 THE 5 EXECUTION TASKS

### **TASK 1: Hero Fallback & Component Blocking**
### **TASK 2: Build TestimonialsFeatured Component**
### **TASK 3: Service Card Elevation Overhaul**
### **TASK 4: Systematic Template Polish**
### **TASK 5: Verification & Build Check**

---

## 🚀 TASK 1: HERO FALLBACK & COMPONENT BLOCKING

### Objective
- NEVER allow hero sections without background images
- BLOCK all non-premium component variants from selection
- Force masonry gallery layouts for 5+ images

### 1.1 Update Fallback Strategies

**File:** `lib/fallback-strategies.ts`

**Implementation:**

```typescript
// lib/fallback-strategies.ts

const ARCHETYPE_HERO_IMAGES: Record<string, string[]> = {
  'bakery': [
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920&q=80'
  ],
  'photography': [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&q=80',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80'
  ],
  'medical': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80'
  ],
  'legal': [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1920&q=80'
  ],
  'trades': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80'
  ],
  'realestate': [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80'
  ],
  'hospitality': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80'
  ],
  'fitness': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80'
  ],
  'retail': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
  ]
}

export function ensureHeroImage(siteConfig: MasterSiteConfig, archetype: string): void {
  if (!siteConfig.hero.heroImageUrl || siteConfig.hero.heroImageUrl.trim() === '') {
    const images = ARCHETYPE_HERO_IMAGES[archetype] || ARCHETYPE_HERO_IMAGES['default']
    const randomIndex = Math.floor(Math.random() * images.length)
    siteConfig.hero.heroImageUrl = images[randomIndex]
    
    console.log(`[Fallback] Injected hero image for ${archetype}: ${siteConfig.hero.heroImageUrl}`)
  }
}
```

**Where to call:** In `app/api/build-website/route.ts` after config is built:
```typescript
// After config construction, before component selection
import { ensureHeroImage } from '@/lib/fallback-strategies'
ensureHeroImage(siteConfig, archetype.id)
```

---

### 1.2 Hard-Block Non-Premium Components

**File:** `lib/component-selector.ts`

**Implementation:**

Add PREMIUM ENFORCEMENT constants at top of file:

```typescript
// PREMIUM ENFORCEMENT: These components are NEVER allowed
const BLOCKED_COMPONENTS = {
  heroes: ['HeroGradient', 'HeroMinimal'],
  services: ['ServicesMinimal', 'ServicesList', 'ServicesAccordion'],
  testimonials: ['TestimonialsMinimal', 'TestimonialsGrid'],
  gallery: ['GalleryMinimal'],
  contact: ['ContactMinimal', 'ContactCentered'],
  about: ['AboutMinimal']
}

const PREMIUM_TIER_1 = {
  heroes: ['HeroFullscreen', 'HeroSplit', 'HeroOverlapping', 'HeroShowcase', 'HeroFeature'],
  services: ['ServicesCards', 'ServicesGrid', 'ServicesIconGrid', 'ServicesFeature'],
  gallery: ['GalleryMasonry', 'GalleryCategories', 'GalleryCinematic', 'GalleryFullscreen'],
  testimonials: ['TestimonialsFeatured', 'TestimonialsQuote', 'TestimonialsSlider'],
  about: ['AboutVideo', 'AboutLayered', 'AboutSplit', 'AboutStats'],
  contact: ['ContactSplit', 'ContactMap', 'ContactCards']
}
```

**Modify `selectBest()` function to enforce blocking:**

```typescript
function selectBest(
  pool: string[],
  styles: Record<string, ComponentStyle>,
  excluded: string[],
  preferred: string[],
  artDirection: string,
  layoutStyle: string,
  hash: number,
  shift: number
): string {
  // NEW: Determine section type and filter out blocked components FIRST
  const sectionType = pool[0]?.includes('Hero') ? 'heroes' : 
                      pool[0]?.includes('Services') ? 'services' :
                      pool[0]?.includes('Gallery') ? 'gallery' :
                      pool[0]?.includes('Testimonials') ? 'testimonials' :
                      pool[0]?.includes('Contact') ? 'contact' :
                      pool[0]?.includes('About') ? 'about' : 'other'
  
  const blocked = BLOCKED_COMPONENTS[sectionType] || []
  pool = pool.filter(c => !blocked.includes(c))
  
  // NEW: If pool is empty after blocking, use Tier 1 premium components
  if (pool.length === 0 && PREMIUM_TIER_1[sectionType]) {
    console.warn(`[Premium Enforcer] All components blocked for ${sectionType}, using Tier 1 defaults`)
    pool = PREMIUM_TIER_1[sectionType]
  }
  
  // Continue with existing scoring logic...
  let candidates = pool.filter(c => !excluded.includes(c))
  if (candidates.length === 0) candidates = pool
  
  // ... rest of function remains unchanged
}
```

---

### 1.3 Lower Gallery Masonry Threshold

**File:** `lib/component-selector.ts`

**In `selectComponents()` function, update gallery selection logic:**

```typescript
// Smart gallery layout selection - PREMIUM ENFORCER UPDATE
let galleryOverride: string | null = null
if (categoryCount > 1) {
  galleryOverride = 'GalleryCategories'
} else if (imageCount >= 5) {  // CHANGED: Was > 50, now >= 5 for premium masonry
  galleryOverride = 'GalleryMasonry'
  console.log(`[Premium Enforcer] Forcing GalleryMasonry (${imageCount} images >= 5 threshold)`)
} else if (imageCount > 0 && imageCount < 5) {
  galleryOverride = 'GalleryLightbox'
}
```

---

### 1.4 Update Archetype Map Exclusions

**File:** `templates/archetype-map.json`

**Add excluded lists to EVERY archetype configuration:**

```json
{
  "professional-corporate": {
    "excludedHeroes": ["HeroGradient", "HeroMinimal"],
    "excludedServices": ["ServicesMinimal", "ServicesList", "ServicesAccordion"],
    "excludedTestimonials": ["TestimonialsMinimal", "TestimonialsGrid"],
    "excludedGallery": ["GalleryMinimal"],
    "excludedContact": ["ContactMinimal", "ContactCentered"],
    "excludedAbout": ["AboutMinimal"],
    // ... rest of archetype config
  },
  "heavy-industrial": {
    "excludedHeroes": ["HeroGradient", "HeroMinimal"],
    "excludedServices": ["ServicesMinimal", "ServicesList", "ServicesAccordion"],
    "excludedTestimonials": ["TestimonialsMinimal", "TestimonialsGrid"],
    "excludedGallery": ["GalleryMinimal"],
    "excludedContact": ["ContactMinimal", "ContactCentered"],
    "excludedAbout": ["AboutMinimal"],
    // ... rest of archetype config
  },
  // REPEAT FOR ALL ARCHETYPES:
  // logistics-freight, trades-field-services, medical-health,
  // legal-professional, retail-ecommerce, hospitality-restaurant,
  // creative-photography, fitness-wellness, beauty-personal,
  // nonprofit-community, education-training, automotive-services, etc.
}
```

**Total archetypes to update:** ~15-20

---

### TASK 1 Deliverables
- [ ] `lib/fallback-strategies.ts` - `ensureHeroImage()` function implemented
- [ ] `lib/component-selector.ts` - BLOCKED_COMPONENTS + PREMIUM_TIER_1 constants added
- [ ] `lib/component-selector.ts` - `selectBest()` modified to enforce blocking
- [ ] `lib/component-selector.ts` - Gallery masonry threshold lowered to 5
- [ ] `templates/archetype-map.json` - All archetypes have excluded lists
- [ ] `app/api/build-website/route.ts` - Call `ensureHeroImage()` before component selection

---

## 🎨 TASK 2: BUILD TESTIMONIALSFEATURED COMPONENT

### Objective
Create featured testimonial component with automatic best-review selection and visual hierarchy.

### 2.1 Create Component File

**File:** `templates/components/testimonials/TestimonialsFeatured.tsx`

```tsx
'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function TestimonialsFeatured() {
  const { config, isLoading } = useSiteData()
  const pc = config?.pageContent || {}
  const testimonials = config?.testimonials || []

  const sectionTitle = pc.testimonialsTitle || 'What Our Customers Say'
  const sectionSubtitle = pc.testimonialsSubtitle || 'Happy Clients'

  // Skeleton UI while loading
  if (isLoading) {
    return (
      <section id="testimonials" className="section-padding ambient-glow relative" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
        {/* Decorative background blob */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 -z-10"
             style={{ background: 'var(--color-accent)' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="skeleton skeleton-text mx-auto" style={{ width: '120px', height: '20px', marginBottom: '0.75rem' }} />
            <div className="skeleton skeleton-heading mx-auto" style={{ width: '400px', maxWidth: '100%', height: '48px' }} />
          </div>
          
          {/* Featured skeleton */}
          <div className="max-w-4xl mx-auto mb-16 rounded-3xl p-12" style={{ background: 'white' }}>
            <div className="skeleton skeleton-text" style={{ width: '100%', height: '32px', marginBottom: '1rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '32px', marginBottom: '2rem' }} />
            <div className="flex items-center gap-4">
              <div className="skeleton skeleton-avatar" style={{ width: '80px', height: '80px' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text mb-2" style={{ width: '150px', height: '20px' }} />
                <div className="skeleton skeleton-text" style={{ width: '100px', height: '16px' }} />
              </div>
            </div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl p-6" style={{ background: 'white' }}>
                <div className="skeleton skeleton-text mb-4" style={{ height: '80px' }} />
                <div className="flex items-center gap-3">
                  <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text mb-1" style={{ width: '100px', height: '16px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '80px', height: '14px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  // Auto-select BEST testimonial based on scoring
  function scoreTestimonial(t: any): number {
    let score = 0
    if (t.text && t.text.length > 100) score += 3  // Detailed review
    if (t.rating === 5) score += 2                 // Perfect rating
    if (t.photoUrl) score += 2                     // Has photo
    if (t.text && t.text.includes(config?.businessName || '')) score += 1  // Mentions business
    return score
  }

  const scored = testimonials.map(t => ({ testimonial: t, score: scoreTestimonial(t) }))
  scored.sort((a, b) => b.score - a.score)
  
  const featured = scored[0]?.testimonial
  const supporting = testimonials.filter(t => t !== featured).slice(0, 6)

  return (
    <section id="testimonials" className="section-padding ambient-glow relative" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      {/* Decorative background blob */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 -z-10"
           style={{ background: 'var(--color-accent)' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
        </AnimateOnScroll>

        {/* FEATURED TESTIMONIAL - Hero Spotlight */}
        {featured && (
          <AnimateOnScroll className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1">
              {/* Large quote mark */}
              <div className="text-6xl md:text-8xl leading-none mb-4 opacity-20 font-serif" 
                   style={{ color: 'var(--color-accent)' }}>"</div>
              
              {/* Featured quote text - LARGE */}
              <p className="text-2xl md:text-3xl leading-relaxed mb-8 font-light italic"
                 style={{ color: 'var(--color-text)' }}>
                {featured.text}
              </p>

              {/* Rating stars - LARGE */}
              <div className="flex gap-2 mb-6">
                {Array.from({ length: featured.rating || 5 }).map((_, j) => (
                  <svg key={j} className="w-8 h-8" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Author info - LARGE */}
              <div className="flex items-center gap-6 pt-6" style={{ borderTop: '2px solid color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                {featured.photoUrl ? (
                  <div className="relative">
                    <img src={featured.photoUrl} alt={featured.name} 
                         className="w-20 h-20 rounded-full object-cover ring-4"
                         style={{ ringColor: 'var(--color-accent)' }} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ring-4"
                       style={{ background: 'var(--color-primary)', color: 'white', ringColor: 'var(--color-accent)' }}>
                    {featured.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {featured.name}
                  </div>
                  {featured.source && (
                    <div className="text-lg" style={{ color: 'var(--color-muted)' }}>
                      via {featured.source}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        )}

        {/* SUPPORTING TESTIMONIALS - Smaller Grid */}
        {supporting.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supporting.map((t: any, i: number) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Small stars */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <svg key={j} className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Quote text - normal size */}
                  <p className="text-sm leading-relaxed mb-4 flex-grow italic" style={{ color: 'var(--color-text)' }}>
                    &ldquo;{t.text.length > 150 ? t.text.substring(0, 150) + '...' : t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                           style={{ background: 'var(--color-primary)', color: 'white' }}>
                        {t.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{t.name}</div>
                      {t.source && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>via {t.source}</div>}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

---

#### **2.2 Register in Archetype Map**
**File:** `templates/archetype-map.json`

```json
{
  "_componentStyles": {
    "testimonials": {
      "TestimonialsFeatured": { 
        "artDirections": ["editorial", "cinematic", "bold", "warm-organic"], 
        "layouts": ["editorial", "elegant", "modern", "bold"] 
      },
      // ... existing testimonial components
    }
  },
  
  // Update ALL archetypes:
  "professional-corporate": {
    "preferredTestimonials": ["TestimonialsFeatured", "TestimonialsQuote", "TestimonialsSlider"],
    "excludedTestimonials": ["TestimonialsMinimal", "TestimonialsGrid"],
    // ...
  }
}
```

---

### TASK 2 Deliverables
- [ ] `templates/components/testimonials/TestimonialsFeatured.tsx` - New component
- [ ] `templates/archetype-map.json` - Register component + update all archetypes

---

## 💎 TASK 3: UPGRADE SERVICE CARD ELEVATION

### Objective
Remove thin borders, add large soft shadows, gold borders on images, floating price badges.

### Files to Update (11 Total)

**Service Components:**
1. `templates/components/services/ServicesCards.tsx` ✅
2. `templates/components/services/ServicesGrid.tsx` ✅
3. `templates/components/services/ServicesFeature.tsx` ✅
4. `templates/components/services/ServicesIconGrid.tsx` ✅
5. `templates/components/services/ServicesTabs.tsx` ✅
6. `templates/components/services/ServicesTimeline.tsx` ✅
7. `templates/components/services/ServicesAlternating.tsx` ✅
8. `templates/components/services/ServicesAsymmetric.tsx` ✅
9. `templates/components/services/ServicesAccordion.tsx` ❌ (BLOCKED in Task 1)
10. `templates/components/services/ServicesList.tsx` ❌ (BLOCKED in Task 1)
11. `templates/components/services/ServicesMinimal.tsx` ❌ (BLOCKED in Task 1)

---

### Premium Service Card Template

**Apply to ALL 8 active service components:**

```tsx
// BEFORE (OLD - REMOVE):
<div className="card hover-lift rounded-2xl p-6 border"
     style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>

// AFTER (NEW - PREMIUM):
<div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
  
  {/* Decorative accent blob */}
  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
       style={{ background: 'var(--color-accent)' }} />
  
  {/* Service image with gold border (if exists) */}
  {service.imageUrl && (
    <div className="relative mb-6 rounded-2xl overflow-hidden border-4 border-amber-400/30 shadow-lg">
      <img src={service.imageUrl} alt={service.title} 
           className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110" />
    </div>
  )}
  
  {/* Numbered badge with gradient */}
  <div className="absolute top-6 left-6 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
       style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
    {i + 1}
  </div>
  
  {/* Content */}
  <h3 className="text-2xl font-bold mb-3"
      style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
    {service.title}
  </h3>
  <p className="leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
    {service.description}
  </p>

  {/* Floating price badge */}
  {service.priceTag && (
    <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
         style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
      {service.priceTag}
    </div>
  )}
  
  {/* Premium CTA button */}
  <a href={service.ctaLink || '#contact'} 
     className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:gap-4"
     style={{ background: 'var(--color-primary)', color: 'white' }}>
    Learn More
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </a>
</div>
```

---

### Changes Summary per Component

**For EACH of the 8 service components:**

1. **Remove:** 
   - `border` and `borderColor` styles
   - Old `card hover-lift` class (keep hover-lift concept but new implementation)

2. **Add:**
   - `bg-white` background
   - `shadow-[0_20px_60px_rgba(0,0,0,0.08)]` base shadow
   - `hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]` hover shadow
   - `hover:-translate-y-2` lift effect
   - `transition-all duration-500` smooth animation
   - Decorative accent blob (absolute positioned, blurred)
   - Gold border on images (`border-4 border-amber-400/30`)
   - Numbered badge with gradient
   - Floating price badge (absolute bottom-right)
   - Premium CTA button with arrow

3. **Ensure:**
   - If component has service images, wrap in gold border frame
   - All hover effects include `group` class for coordinated animations
   - Floating animations class added to parent section

---

### TASK 3 Deliverables
- [ ] `templates/components/services/ServicesCards.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesGrid.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesFeature.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesIconGrid.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesTabs.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesTimeline.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesAlternating.tsx` - Premium elevation
- [ ] `templates/components/services/ServicesAsymmetric.tsx` - Premium elevation

---

## 🎨 TASK 4: APPLY PREMIUM ENHANCEMENTS TO ALL TEMPLATES

### Objective
Systematically apply the proven premium formula to EVERY component that needs it.

---

### 4.1 HERO COMPONENTS (12 Total)

**Premium Hero Formula:**
1. ✅ Background image (mandatory via Task 1)
2. ✅ Parallax effect on background
3. ✅ Floating decorative elements (emojis or shapes)
4. ✅ Trust badge overlay (if ratings exist)
5. ✅ White text with drop shadow
6. ✅ Gradient overlay for readability

**Files to Update:**
- `templates/components/heroes/HeroFullscreen.tsx` ✅ (Already premium)
- `templates/components/heroes/HeroSplit.tsx` ✅ (Already premium)
- `templates/components/heroes/HeroOverlapping.tsx` ✅
- `templates/components/heroes/HeroShowcase.tsx` ✅
- `templates/components/heroes/HeroFeature.tsx` ✅
- `templates/components/heroes/HeroStats.tsx` ✅
- `templates/components/heroes/HeroCentered.tsx` ⚠️ (Conditional - needs image check)
- `templates/components/heroes/HeroCard.tsx` ✅
- `templates/components/heroes/HeroTestimonial.tsx` ✅
- `templates/components/heroes/HeroContact.tsx` ✅
- `templates/components/heroes/HeroGradient.tsx` ❌ (BLOCKED)
- `templates/components/heroes/HeroMinimal.tsx` ❌ (BLOCKED)

**What to Add to Each:**

```tsx
// 1. Parallax background
<div className="absolute inset-0 bg-cover bg-center bg-fixed" 
     style={{ backgroundImage: `url(${heroImage})` }} />

// 2. Gradient overlay
<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />

// 3. Floating decorative elements (archetype-specific)
<div className="absolute top-20 right-20 text-6xl opacity-10 animate-float hidden lg:block">
  {archetype === 'bakery' ? '🍰' : archetype === 'fitness' ? '💪' : '✨'}
</div>
<div className="absolute bottom-40 left-10 text-5xl opacity-10 animate-float-delayed hidden lg:block">
  {archetype === 'bakery' ? '🥐' : archetype === 'fitness' ? '🏋️' : '🌟'}
</div>

// 4. Trust badge (if ratings exist)
{config?.hero?.rating && (
  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
    <span className="text-2xl">⭐</span>
    <span className="font-bold text-gray-900">{config.hero.rating}</span>
    <span className="text-sm text-gray-600">({config.hero.reviewCount || '100+'} reviews)</span>
  </div>
)}

// 5. Text drop shadow
<h1 className="..." style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
```

**Add to globals.css:**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 7s ease-in-out infinite 1s;
}
```

---

### 4.2 GALLERY COMPONENTS (12 Total)

**Premium Gallery Formula:**
1. ✅ Masonry layout (natural heights)
2. ✅ Glassmorphism hover overlay
3. ✅ Sliding category label on hover
4. ✅ Staggered entrance animations
5. ✅ Hover zoom on images

**Files to Update:**
- `templates/components/gallery/GalleryMasonry.tsx` ✅ (Already has masonry)
- `templates/components/gallery/GalleryCategories.tsx` ✅
- `templates/components/gallery/GalleryCinematic.tsx` ✅
- `templates/components/gallery/GalleryFullscreen.tsx` ✅
- `templates/components/gallery/GalleryLightbox.tsx` ⚠️ (For < 5 images only)
- `templates/components/gallery/GalleryFilterable.tsx` ⚠️ (Upgrade to masonry)
- `templates/components/gallery/GalleryCarousel.tsx` ✅
- `templates/components/gallery/GalleryFilmstrip.tsx` ✅
- `templates/components/gallery/GalleryBeforeAfter.tsx` ✅
- `templates/components/gallery/GalleryStack.tsx` ✅
- `templates/components/gallery/GalleryMinimal.tsx` ❌ (BLOCKED)

**What to Add:**

```tsx
// 1. Masonry columns layout
<div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">

// 2. Each image card
<div className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
  
  {/* Image with zoom */}
  <img src={img.url} alt={img.category} 
       className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
  
  {/* Glassmorphism overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4">
    
    {/* Sliding category label */}
    <div className="flex items-center gap-2 text-white font-semibold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <span>{img.category}</span>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </div>
  </div>
</div>

// 3. Staggered animation
<AnimateOnScroll key={i} delay={i * 50}>
```

---

### 4.3 ABOUT COMPONENTS (7 Total)

**Premium About Formula:**
1. ✅ Image with gold border frame
2. ✅ Floating decorative blob
3. ✅ Hover zoom effect
4. ✅ Premium shadow

**Files to Update:**
- `templates/components/about/AboutVideo.tsx` ✅ (Use image, not video)
- `templates/components/about/AboutLayered.tsx` ✅
- `templates/components/about/AboutSplit.tsx` ✅
- `templates/components/about/AboutStats.tsx` ✅
- `templates/components/about/AboutTeam.tsx` ✅
- `templates/components/about/AboutTimeline.tsx` ✅
- `templates/components/about/AboutMinimal.tsx` ❌ (BLOCKED)

**What to Add:**

```tsx
// 1. Decorative blob
<div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-10 -z-10"
     style={{ background: 'var(--color-accent)' }} />

// 2. Image with gold border
<div className="relative rounded-2xl overflow-hidden border-4 border-amber-400/30 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
  <img src={about.imageUrl || DEFAULT_PORTRAIT} alt={about.title} 
       className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105" />
</div>
```

---

### 4.4 CONTACT COMPONENTS (6 Total)

**Premium Contact Formula:**
1. ✅ Split layout (form + map/info)
2. ✅ Floating labels
3. ✅ Premium form inputs with glow focus
4. ✅ Map integration

**Files to Update:**
- `templates/components/contact/ContactSplit.tsx` ✅ (Already premium)
- `templates/components/contact/ContactFull.tsx` ✅
- `templates/components/contact/ContactMap.tsx` ✅
- `templates/components/contact/ContactCards.tsx` ✅
- `templates/components/contact/ContactCentered.tsx` ❌ (BLOCKED)
- `templates/components/contact/ContactMinimal.tsx` ❌ (BLOCKED)

**What to Add:**

```tsx
// Premium form styling already in globals.css
<input className="form-input focus:ring-4 focus:ring-primary/20" />

// Add decorative elements
<div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5 -z-10"
     style={{ background: 'var(--color-primary)' }} />
```

---

### 4.5 FAQ COMPONENTS (4 Total)

**Premium FAQ Formula:**
1. ✅ Accordion with smooth transitions
2. ✅ Icon animations
3. ✅ White card backgrounds
4. ✅ Premium shadows

**Files to Update:**
- `templates/components/faq/FaqAccordion.tsx` ✅ (Already good)
- `templates/components/faq/FaqGrid.tsx` ✅
- `templates/components/faq/FaqCards.tsx` ✅
- `templates/components/faq/FaqMinimal.tsx` ❌ (BLOCKED)

**What to Add:**

```tsx
// White card backgrounds
<div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
```

---

### 4.6 HEADER & FOOTER COMPONENTS

**Keep existing** - Already premium with glassmorphism, sticky behavior, etc.

---

## 📊 COMPREHENSIVE FILE CHECKLIST

### Must Update (36 Files):

**Heroes (8):**
- [ ] `HeroFullscreen.tsx` - Add parallax + floating elements
- [ ] `HeroSplit.tsx` - Add parallax + floating elements
- [ ] `HeroOverlapping.tsx` - Add parallax + floating elements
- [ ] `HeroShowcase.tsx` - Add parallax + floating elements
- [ ] `HeroFeature.tsx` - Add parallax + floating elements
- [ ] `HeroStats.tsx` - Add parallax + floating elements
- [ ] `HeroCard.tsx` - Add parallax + floating elements
- [ ] `HeroTestimonial.tsx` - Add parallax + floating elements

**Services (8):**
- [ ] `ServicesCards.tsx` - Premium shadows + gold borders
- [ ] `ServicesGrid.tsx` - Premium shadows + gold borders
- [ ] `ServicesFeature.tsx` - Premium shadows + gold borders
- [ ] `ServicesIconGrid.tsx` - Premium shadows + gold borders
- [ ] `ServicesTabs.tsx` - Premium shadows + gold borders
- [ ] `ServicesTimeline.tsx` - Premium shadows + gold borders
- [ ] `ServicesAlternating.tsx` - Premium shadows + gold borders
- [ ] `ServicesAsymmetric.tsx` - Premium shadows + gold borders

**Gallery (8):**
- [ ] `GalleryMasonry.tsx` - Glassmorphism overlay
- [ ] `GalleryCategories.tsx` - Glassmorphism overlay
- [ ] `GalleryCinematic.tsx` - Glassmorphism overlay
- [ ] `GalleryFullscreen.tsx` - Glassmorphism overlay
- [ ] `GalleryFilterable.tsx` - Convert to masonry + overlay
- [ ] `GalleryCarousel.tsx` - Glassmorphism overlay
- [ ] `GalleryFilmstrip.tsx` - Glassmorphism overlay
- [ ] `GalleryBeforeAfter.tsx` - Premium styling

**About (6):**
- [ ] `AboutVideo.tsx` - Image with gold border
- [ ] `AboutLayered.tsx` - Image with gold border
- [ ] `AboutSplit.tsx` - Image with gold border
- [ ] `AboutStats.tsx` - Image with gold border
- [ ] `AboutTeam.tsx` - Image with gold border
- [ ] `AboutTimeline.tsx` - Image with gold border

**Testimonials (1):**
- [ ] `TestimonialsFeatured.tsx` - NEW COMPONENT

**Contact (3):**
- [ ] `ContactFull.tsx` - Decorative elements
- [ ] `ContactMap.tsx` - Decorative elements
- [ ] `ContactCards.tsx` - Decorative elements

**FAQ (3):**
- [ ] `FaqGrid.tsx` - White backgrounds
- [ ] `FaqCards.tsx` - White backgrounds
- [ ] `FaqAccordion.tsx` - Verify premium styling

**Configuration (3):**
- [ ] `lib/fallback-strategies.ts` - ensureHeroImage()
- [ ] `lib/component-selector.ts` - Premium enforcement
- [ ] `templates/archetype-map.json` - Update all archetypes

**CSS (1):**
- [ ] `templates/styles/globals.css` - Add float animations (if not exists)

**Total Files:** 40

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify EVERY build has:

### Visual Checks:
- [ ] Hero has background image (not gradient)
- [ ] Hero has parallax effect
- [ ] Hero has floating decorative elements
- [ ] Service cards have white backgrounds
- [ ] Service cards have large soft shadows
- [ ] Service cards have no visible borders
- [ ] Service images have gold frames (if images exist)
- [ ] Gallery uses masonry layout (if 5+ images)
- [ ] Gallery has glassmorphism hover overlays
- [ ] Gallery images zoom on hover
- [ ] Testimonials have featured hero card
- [ ] Featured testimonial is 3x larger than supporting
- [ ] About images have gold borders
- [ ] About section has decorative blob
- [ ] All sections have proper breathing room

### Technical Checks:
- [ ] Zero TypeScript errors
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] All images load properly
- [ ] Animations are smooth (60fps)
- [ ] Mobile responsive (test on 375px width)
- [ ] Lighthouse score > 85

### Component Selection Checks:
- [ ] NO `HeroGradient` or `HeroMinimal` in builds
- [ ] NO `ServicesMinimal` or `ServicesList` in builds
- [ ] NO `TestimonialsMinimal` or `TestimonialsGrid` in builds
- [ ] NO `GalleryMinimal` in builds
- [ ] NO `ContactMinimal` or `AboutMinimal` in builds

---

## 🎯 SUCCESS CRITERIA

**Before Premium Enforcer:**
- Premium feel: 60% of builds
- LLM Judge score: 6.8/10 average
- Client feedback: "Looks like a template"

**After Premium Enforcer:**
- Premium feel: 100% of builds
- LLM Judge score: 8.5/10 minimum
- Client feedback: "Looks custom-made!"

---

## 🚀 EXECUTION ORDER

### Week 1 (Days 1-2): Critical Infrastructure
1. ✅ Task 1.1 - Hero image fallback system
2. ✅ Task 1.2 - Component blocking logic
3. ✅ Task 1.3 - Gallery masonry threshold
4. ✅ Task 1.4 - Archetype map exclusions
5. ✅ Task 2 - TestimonialsFeatured component

### Week 1 (Days 3-5): Service Components
6. ✅ Task 3 - All 8 service components upgraded

### Week 2 (Days 6-10): All Other Components
7. ✅ Task 4.1 - 8 Hero components
8. ✅ Task 4.2 - 8 Gallery components
9. ✅ Task 4.3 - 6 About components
10. ✅ Task 4.4 - 3 Contact components
11. ✅ Task 4.5 - 3 FAQ components

### Week 2 (Days 11-12): Verification
12. ✅ Build 10 test websites (different archetypes)
13. ✅ Visual audit of each section
14. ✅ Fix any regressions
15. ✅ Final QA pass

---

## 📝 IMPLEMENTATION NOTES

### Archetype-Specific Decorative Elements

**Floating Emojis by Industry:**
```typescript
const ARCHETYPE_DECORATIONS: Record<string, string[]> = {
  'bakery': ['🍰', '🥐', '🍞', '🧁'],
  'photography': ['📷', '🎨', '✨'],
  'medical': ['💊', '🏥', '❤️', '🩺'],
  'legal': ['⚖️', '📜', '🏛️'],
  'trades': ['🔨', '🔧', '⚡', '🏗️'],
  'fitness': ['💪', '🏋️', '🏃', '⚡'],
  'realestate': ['🏠', '🔑', '🏡'],
  'hospitality': ['🍽️', '🍷', '👨‍🍳'],
  'retail': ['🛍️', '✨', '💎'],
  'default': ['✨', '🌟', '💫']
}
```

Use in hero components:
```tsx
const decorations = ARCHETYPE_DECORATIONS[archetype.id] || ARCHETYPE_DECORATIONS['default']
<div className="absolute top-20 right-20 text-6xl opacity-10 animate-float hidden lg:block">
  {decorations[0]}
</div>
```

---

### Fallback Images by Archetype

Already documented in Task 1.1 - use high-quality Unsplash images that match industry.

---

### Mobile Considerations

- Float animations: `hidden lg:block` (only on large screens)
- Decorative blobs: Reduce size on mobile
- Masonry: 2 columns on mobile, 3 on tablet, 4 on desktop
- Featured testimonial: Reduce text size on mobile (text-xl → text-2xl)

---

## 🎉 FINAL DELIVERABLE

Once complete, EVERY website built by SiteSpire will have:

✅ **Visual Depth** - Parallax backgrounds, floating elements, layered designs  
✅ **Premium Materials** - White cards, large soft shadows, gold accents  
✅ **Strong Hierarchy** - Featured content stands out, supporting content flows  
✅ **Emotional Appeal** - Real imagery, smooth animations, delightful interactions  
✅ **Industry Appropriate** - Archetype-specific styling while maintaining premium feel  
✅ **Zero Template Feel** - Clients can't tell it wasn't custom-built for $5,000+

**Ready to execute. Begin implementation now.**
