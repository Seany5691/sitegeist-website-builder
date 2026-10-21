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
             style={{ background: 'var(--color-primary-cta)' }} />
        
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

  const scored = testimonials.map((t: any) => ({ testimonial: t, score: scoreTestimonial(t) }))
  scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
  
  const featured = scored[0]?.testimonial
  const supporting = testimonials.filter((t: any) => t !== featured).slice(0, 6)

  return (
    <section id="testimonials" className="section-padding ambient-glow relative" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      {/* Decorative background blob */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 -z-10"
           style={{ background: 'var(--color-primary-cta)' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{sectionSubtitle}</span>
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
                   style={{ color: 'var(--safe-eyebrow)' }}>"</div>
              
              {/* Featured quote text - LARGE */}
              <p className="text-2xl md:text-3xl leading-relaxed mb-8 font-light italic"
                 style={{ color: 'var(--color-text)' }}>
                {featured.text}
              </p>

              {/* Rating stars - LARGE */}
              <div className="flex gap-2 mb-6">
                {Array.from({ length: featured.rating || 5 }).map((_, j) => (
                  <svg key={j} className="w-8 h-8" style={{ color: 'var(--safe-eyebrow)' }} fill="currentColor" viewBox="0 0 20 20">
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
                         style={{ '--tw-ring-color': 'var(--color-accent)' } as any} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ring-4"
                       style={{ background: 'var(--color-primary-cta)', color: 'white', '--tw-ring-color': 'var(--color-accent)' } as any}>
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
                      <svg key={j} className="w-4 h-4" style={{ color: 'var(--safe-eyebrow)' }} fill="currentColor" viewBox="0 0 20 20">
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
                           style={{ background: 'var(--color-primary-cta)', color: 'white' }}>
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
