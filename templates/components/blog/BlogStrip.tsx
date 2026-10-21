'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Desktop column count for a row of n items — wraps without leaving a lonely
 * orphan card on the last row when a good split exists.
 */
function lgColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  const last3 = n % 3
  const last4 = n % 4
  const bad3 = last3 === 1
  const bad4 = last4 === 1
  if (bad3 && !bad4) return 4
  if (bad4 && !bad3) return 3
  return last3 === 0 ? 3 : last4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each row item. The AnimateOnScroll wrapper is the flex
 * item, so the sizing must live on its className. 1-2 items get a larger card,
 * 3-4 sit in a full row, 5+ wrap into centred rows.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-md lg:max-w-lg'
  if (n === 2) return 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]'
}


export default function BlogStrip() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const blogPosts = config?.blogPosts || []

  if (!Array.isArray(blogPosts) || blogPosts.length === 0) return null

  const title = config?.blogTitle || pc.blogTitle || 'From the Blog'
  const subtitle = config?.blogSubtitle || pc.blogSubtitle || 'News & Insights'

  // Show 3 latest — sort by date descending when dates are present
  const latest = [...blogPosts]
    .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3)

  return (
    <section id="blog" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        <div className="flex flex-wrap justify-center gap-8">
          {latest.map((post: any, i: number) => {
            // images may be a single url string or an array of urls
            const image = Array.isArray(post.images) ? post.images[0] : (post.image || post.images || '')
            const formattedDate = post.date
              ? new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : ''
            return (
              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(latest.length)}>
                <article className="card hover-lift rounded-2xl overflow-hidden border h-full flex flex-col transition-all duration-300"
                  style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  {image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={image} alt={post.title || ''} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {formattedDate && (
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3"
                        style={{ color: 'var(--safe-eyebrow)' }}>
                        <i className="far fa-calendar-alt" aria-hidden="true"></i>
                        {formattedDate}
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-muted)' }}>{post.excerpt}</p>
                    )}
                    {post.url && (
                      <a href={post.url} className="inline-flex items-center gap-2 text-sm font-semibold mt-auto transition-colors duration-200"
                        style={{ color: 'var(--color-primary)' }}>
                        Read more
                        <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                      </a>
                    )}
                  </div>
                </article>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
