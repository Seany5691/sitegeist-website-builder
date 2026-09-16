'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function BlogContent() {
  const { config } = useSiteData()
  const posts = config?.blogPosts || []

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, black)' }} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 block">Stories & Tips</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>Blog</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Photography tips, behind-the-scenes stories, and advice to help you get the most from your sessions.
            </p>
          </div>
        </section>

        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post: any, i: number) => (
                  <article key={i} className="group p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      {post.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-secondary)' }}>
                          {post.category}
                        </span>
                      )}
                      {post.date && (
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {new Date(post.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:underline"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{post.title}</h2>
                    {post.excerpt && <p className="leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>{post.excerpt}</p>}
                    <span className="text-sm font-medium inline-flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                      Read More
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg" style={{ color: 'var(--color-muted)' }}>Blog posts are coming soon. Check back for photography tips and stories!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
