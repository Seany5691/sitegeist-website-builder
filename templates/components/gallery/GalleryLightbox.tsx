'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useMemo } from 'react'
import Lightbox from './_Lightbox'

type GalleryProps = {
 /** home = limited preview on the homepage; full = complete gallery page */
 mode?: 'home' | 'full'
}

export default function GalleryLightbox({ mode = 'full' }: GalleryProps) {
 const { imageMap, config } = useSiteData()
 const pc = config?.pageContent || {}
 const settings = config?.gallerySettings || {}
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

 // ----- Homepage mode -----
 if (mode === 'home') {
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
 <h2 className="text-3xl sm:text-4xl font-bold"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
 {openFolder}
 </h2>
 </AnimateOnScroll>

 <div className="flex flex-wrap justify-center gap-4">
 {folderImages.map((img: { url: string; category: string }, i: number) => (
 <div key={`${img.url}-${i}`}
 className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 img-treated"
 onClick={() => setLightboxIndex(i)}>
 <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
 </svg>
 </div>
 </div>
 ))}
 </div>
 </div>

 {lightboxIndex !== null && (
 <Lightbox images={folderImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
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
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>Portfolio</span>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
 {sectionTitle}
 </h2>
 {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
 </AnimateOnScroll>

 <div className="flex flex-wrap justify-center gap-5">
 {visibleFolders.map(catName => {
 const catData = categories[catName] || {}
 const imgs = catData.images || []
 const thumbUrl = catData.thumbnail || (imgs[0] ? (typeof imgs[0] === 'string' ? imgs[0] : imgs[0].src || imgs[0].imageUrl) : '')
 return (
 <button
 key={catName}
 onClick={() => setOpenFolder(catName)}
 className="group relative w-[min(100%,340px)] rounded-2xl overflow-hidden text-left"
 style={{ aspectRatio: '4/3' }}
 >
 {thumbUrl ? (
 <img src={thumbUrl} alt={catName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
 ) : (
 <div className="w-full h-full flex items-center justify-center"
 style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))' }}>
 <span className="text-4xl">📁</span>
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
 <a href="/portfolio"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
 View full Gallery
 </a>
 </div>
 )}
 </div>
 </section>
 )
 }

 // Pictures mode (default)
 const pool = defaultFilter === 'All' ? allImages : allImages.filter(img => img.category === defaultFilter)
 const preview = pool.slice(0, pictureLimit)

 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>Portfolio</span>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
 {sectionTitle}
 </h2>
 {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
 </AnimateOnScroll>

 <div className="flex flex-wrap justify-center gap-4">
 {preview.map((img, i) => (
 <div key={`${img.url}-${i}`}
 className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 img-treated lg:"
 onClick={() => setLightboxIndex(i)}>
 <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
 </svg>
 </div>
 </div>
 ))}
 </div>

 {pool.length > preview.length && (
 <div className="text-center mt-10">
 <a href="/portfolio"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
 style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
 View full Gallery
 </a>
 </div>
 )}
 </div>

 {lightboxIndex !== null && (
 <Lightbox images={preview} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
 )}
 </section>
 )
 }

 // ----- Full mode -----
 return (
 <section id="gallery" className="section-padding" style={{ background: 'var(--color-bg)' }}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <AnimateOnScroll className="text-center mb-12">
 <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>Portfolio</span>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
 {sectionTitle}
 </h2>
 {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
 </AnimateOnScroll>

 <div className="flex flex-wrap justify-center gap-4">
 {allImages.map((img, i) => (
 <AnimateOnScroll key={i} delay={i * 60}>
 <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 img-treated"
 onClick={() => setLightboxIndex(i)}>
 <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
 </svg>
 </div>
 </div>
 </AnimateOnScroll>
 ))}
 </div>
 </div>

 {lightboxIndex !== null && (
 <Lightbox images={allImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
 )}
 </section>
 )
}
