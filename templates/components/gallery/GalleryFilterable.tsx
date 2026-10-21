'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useMemo } from 'react'
import Lightbox from './_Lightbox'

type GalleryProps = {
 /** home = limited preview on the homepage; full = complete gallery page */
 mode?: 'home' | 'full'
}

/**
 * Gallery
 * - mode="home": honours gallerySettings (folders vs pictures, limits, default filter)
 * - mode="full": every image in every category (portfolio/gallery page)
 * Works for every builder gallery template via siteConfig/imageMap.
 */
export default function GalleryFilterable({ mode = 'full' }: GalleryProps) {
 const { imageMap, config } = useSiteData()
 const pc = config?.pageContent || {}
 const settings = config?.gallerySettings || {}
 const [activeCategory, setActiveCategory] = useState<string | null>(null)
 const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
 const [openFolder, setOpenFolder] = useState<string | null>(null)

 const sectionTitle = pc.galleryTitle || 'Our Work'
 const sectionSubtitle = pc.gallerySubtitle || ''

 const categories = useMemo(() => imageMap?.categories || {}, [imageMap])

 // Explicit folder order from dashboard (falls back to insertion order)
 const categoryNames = useMemo(() => {
 const keys = Object.keys(categories)
 const order: string[] = settings.folderOrder || imageMap?.categoryOrder || []
 const ordered = order.filter(name => keys.includes(name))
 const rest = keys.filter(name => !ordered.includes(name))
 return [...ordered, ...rest]
 }, [categories, settings.folderOrder, imageMap])

 const allImages = useMemo(() => {
 const list: { url: string; category: string }[] = []
 categoryNames.forEach(catName => {
 (categories[catName].images || []).forEach((img: any) => {
 list.push({
 url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
 category: catName,
 })
 })
 })
 return list
 }, [categories, categoryNames])

 if (allImages.length === 0) return null

 // ----- Full gallery page -----
 if (mode === 'full') {
 const active = activeCategory && categoryNames.includes(activeCategory) ? activeCategory : 'All'
 const filtered = active === 'All' ? allImages : allImages.filter(img => img.category === active)

 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
 Gallery
 </span>
 <h2
 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
 >
 {sectionTitle}
 </h2>
 {sectionSubtitle && (
 <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
 {sectionSubtitle}
 </p>
 )}
 </AnimateOnScroll>

 <AnimateOnScroll delay={100} className="flex flex-wrap justify-center gap-2 mb-10">
 {['All', ...categoryNames].map(cat => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
 style={{
 background: active === cat ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 5%, transparent)',
 color: active === cat ? '#fff' : 'var(--color-text)',
 border: `1px solid ${active === cat ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 10%, transparent)'}`,
 }}
 >
 {cat}
 </button>
 ))}
 </AnimateOnScroll>

 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
 {filtered.map((img, i) => (
 <div
 key={`${img.url}-${i}`}
 className="group relative break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
 onClick={() => setLightboxIndex(i)}
 >
 <img
 src={img.url}
 alt={img.category}
 className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-110"
 loading="lazy"
 />
 <div
 className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
 opacity-0 group-hover:opacity-100 transition-all duration-500
 flex flex-col justify-end p-6"
 >
 <div
 className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20
 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
 >
 <span className="text-white font-semibold text-lg">{img.category}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {lightboxIndex !== null && (
 <Lightbox
 images={filtered}
 index={lightboxIndex}
 onClose={() => setLightboxIndex(null)}
 onNavigate={setLightboxIndex}
 />
 )}
 </section>
 )
 }

 // ----- Homepage mode -----
 const homeMode = settings.homeMode === 'folders' ? 'folders' : 'pictures'
 const defaultFilter = settings.homeFilter && (settings.homeFilter === 'All' || categoryNames.includes(settings.homeFilter))
 ? settings.homeFilter
 : 'All'
 const pictureLimit = Math.max(1, Number(settings.homePictureLimit) || 8)
 const folderLimit = Math.max(1, Number(settings.homeFolderLimit) || 6)

 // Opened folder view (folders mode)
 if (homeMode === 'folders' && openFolder && categories[openFolder]) {
 const folderImages = (categories[openFolder].images || []).map((img: any) => ({
 url: typeof img === 'string' ? img : img.src || img.imageUrl || img,
 category: openFolder,
 }))

 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-8">
 <button
 onClick={() => {
 setOpenFolder(null)
 setLightboxIndex(null)
 }}
 className="text-sm font-medium mb-4 px-4 py-2 rounded-full"
 style={{
 color: 'var(--color-primary)',
 border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
 }}
 >
 ← Back to folders
 </button>
 <h2
 className="text-3xl sm:text-4xl font-bold"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
 >
 {openFolder}
 </h2>
 </AnimateOnScroll>

 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
 {folderImages.map((img: { url: string; category: string }, i: number) => (
 <div
 key={`${img.url}-${i}`}
 className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer"
 onClick={() => setLightboxIndex(i)}
 >
 <img src={img.url} alt={img.category} className="w-full h-auto object-cover" loading="lazy" />
 </div>
 ))}
 </div>
 </div>

 {lightboxIndex !== null && (
 <Lightbox
 images={folderImages}
 index={lightboxIndex}
 onClose={() => setLightboxIndex(null)}
 onNavigate={setLightboxIndex}
 />
 )}
 </section>
 )
 }

 // Folders mode: folder tiles
 if (homeMode === 'folders') {
 const visibleFolders = categoryNames.slice(0, folderLimit)

 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
 Gallery
 </span>
 <h2
 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
 >
 {sectionTitle}
 </h2>
 {sectionSubtitle && (
 <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
 {sectionSubtitle}
 </p>
 )}
 </AnimateOnScroll>

 <div
 className="flex flex-wrap justify-center gap-5"
 >
 {visibleFolders.map(catName => {
 const catData = categories[catName] || {}
 const imgs = catData.images || []
 const thumbUrl =
 catData.thumbnail ||
 (imgs[0] ? (typeof imgs[0] === 'string' ? imgs[0] : imgs[0].src || imgs[0].imageUrl) : '')
 return (
 <button
 key={catName}
 onClick={() => setOpenFolder(catName)}
 className="group relative w-[min(100%,340px)] rounded-2xl overflow-hidden text-left"
 style={{ aspectRatio: '4/3' }}
 >
 {thumbUrl ? (
 <img
 src={thumbUrl}
 alt={catName}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 loading="lazy"
 />
 ) : (
 <div
 className="w-full h-full flex items-center justify-center"
 style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))' }}
 >
 <span className="text-4xl" style={{ color: 'var(--color-primary)' }}>📁</span>
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-5">
 <div>
 <div className="text-white font-semibold text-lg">{catName}</div>
 <div className="text-white/80 text-sm">
 {imgs.length} photo{imgs.length !== 1 ? 's' : ''}
 </div>
 </div>
 </div>
 </button>
 )
 })}
 </div>

 {categoryNames.length > folderLimit && (
 <div className="text-center mt-10">
 <a
 href="/portfolio"
 className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
 >
 View full Gallery
 </a>
 </div>
 )}
 </div>
 </section>
 )
 }

 // Pictures mode (default)
 const pool =
 defaultFilter === 'All' ? allImages : allImages.filter(img => img.category === defaultFilter)
 const preview = pool.slice(0, pictureLimit)

 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>
 Gallery
 </span>
 <h2
 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
 >
 {sectionTitle}
 </h2>
 {sectionSubtitle && (
 <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
 {sectionSubtitle}
 </p>
 )}
 </AnimateOnScroll>

 {defaultFilter !== 'All' && categoryNames.length > 1 && (
 <AnimateOnScroll className="flex flex-wrap justify-center gap-2 mb-8">
 <button
 onClick={() => setActiveCategory(null)}
 className="px-4 py-2 rounded-full text-sm"
 style={{
 background: !activeCategory ? 'var(--color-primary)' : 'transparent',
 color: !activeCategory ? '#fff' : 'var(--color-text)',
 border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
 }}
 >
 {defaultFilter}
 </button>
 </AnimateOnScroll>
 )}

 <div
 className="flex flex-wrap justify-center gap-4"
 >
 {preview.map((img, i) => (
 <div
 key={`${img.url}-${i}`}
 className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square"
 onClick={() => setLightboxIndex(i)}
 >
 <img
 src={img.url}
 alt={img.category}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 loading="lazy"
 />
 </div>
 ))}
 </div>

 {pool.length > preview.length && (
 <div className="text-center mt-10">
 <a
 href="/portfolio"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
 >
 View full Gallery
 </a>
 </div>
 )}
 </div>

 {lightboxIndex !== null && (
 <Lightbox
 images={preview}
 index={lightboxIndex}
 onClose={() => setLightboxIndex(null)}
 onNavigate={setLightboxIndex}
 />
 )}
 </section>
 )
}
