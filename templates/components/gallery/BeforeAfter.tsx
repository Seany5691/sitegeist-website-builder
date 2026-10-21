'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useRef } from 'react'

export default function BeforeAfter() {
 const { config } = useSiteData()
 // Dashboard writes featureData.beforeAfter = { title, pairs: [{before, after, caption}] }
 const pc = config?.featureData?.beforeAfter || config?.beforeAfter || {}
 const pairs =
 (Array.isArray(pc.pairs) && pc.pairs.length ? pc.pairs : null) ||
 (Array.isArray(pc.items) && pc.items.length ? pc.items : null) ||
 (Array.isArray(config?.beforeAfter) ? config.beforeAfter : null) ||
 []

 if (!Array.isArray(pairs) || pairs.length === 0) return null

 const title = pc.title || config?.beforeAfterTitle || 'See the Difference'
 const subtitle = pc.subtitle || config?.beforeAfterSubtitle || 'Before & After'

 return (
 <section id="before-after" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
 {title}
 </h2>
 </AnimateOnScroll>

 <div className="flex flex-wrap justify-center gap-8">
 {pairs.map((pair: any, i: number) => (
 <AnimateOnScroll key={i} delay={i * 100} className="w-full md: max-w-2xl">
 <CompareCard before={pair.before} after={pair.after} caption={pair.caption} />
 </AnimateOnScroll>
 ))}
 </div>
 </div>
 </section>
 )
}

function CompareCard({ before, after, caption }: { before: string; after: string; caption?: string }) {
 const [pos, setPos] = useState(50)
 const containerRef = useRef<HTMLDivElement>(null)

 const updateFromClientX = (clientX: number) => {
 const rect = containerRef.current?.getBoundingClientRect()
 if (!rect || rect.width === 0) return
 setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
 }

 const handleKeyDown = (e: React.KeyboardEvent) => {
 const step = e.shiftKey ? 10 : 2
 if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(p => Math.max(0, p - step)) }
 else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(p => Math.min(100, p + step)) }
 else if (e.key === 'Home') { e.preventDefault(); setPos(0) }
 else if (e.key === 'End') { e.preventDefault(); setPos(100) }
 }

 return (
 <div>
 <div
 ref={containerRef}
 role="slider"
 tabIndex={0}
 aria-label={caption ? `Before and after comparison: ${caption}` : 'Before and after comparison slider'}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-valuenow={Math.round(pos)}
 aria-valuetext={`${Math.round(pos)}% after`}
 onKeyDown={handleKeyDown}
 onPointerDown={(e) => {
 e.currentTarget.setPointerCapture(e.pointerId)
 updateFromClientX(e.clientX)
 }}
 onPointerMove={(e) => {
 if (e.buttons === 1 || e.pointerType === 'touch') updateFromClientX(e.clientX)
 }}
 className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none touch-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
 style={{ outlineColor: 'var(--safe-eyebrow)' }}
 >
 {/* After (full width, base layer) */}
 <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
 {/* Before (clipped) */}
 <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
 <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
 </div>

 {/* Slider handle */}
 <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
 style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center">
 <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
 </svg>
 </div>
 </div>

 {/* Labels */}
 <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-black/55 pointer-events-none">
 Before
 </div>
 <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-black/55 pointer-events-none">
 After
 </div>
 </div>

 {caption && (
 <p className="mt-4 text-sm text-center font-medium" style={{ color: 'var(--color-muted)' }}>{caption}</p>
 )}
 </div>
 )
}
